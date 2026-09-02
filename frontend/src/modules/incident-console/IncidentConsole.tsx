/**
 * DamSafe Twin — Incident Console
 *
 * Auto-detects GeoLibre:
 *   - If GeoLibre is running → embed it with all 138 dams loaded via ?data= GeoJSON
 *   - If GeoLibre is NOT running → render inline MapLibre GL JS with:
 *     • Esri World Imagery satellite basemap + labels
 *     • 3D terrain DEM (hillshade)
 *     • Flood extent overlay with time slider
 *     • Before/After layer swipe
 *
 * Both modes show the dam sidebar with search + data panel overlay.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Users, Droplets, AlertTriangle, PanelLeftClose, PanelLeft, Globe, Search, Layers, Play, Pause, RotateCcw } from 'lucide-react';
import { INDIA_DAMS, DamPoint } from '../../data/india-dams';

const GEOLIBRE_BASE = 'http://localhost:5175';
const DAMS_GEOJSON_URL = 'http://localhost:3000/india-dams.geojson';

function classifyHazard(dam: DamPoint) {
  const heightScore = Math.min(dam.height_m / 300, 1);
  const capacityScore = Math.min(dam.capacity_mcm / 15000, 1);
  const composite = heightScore * 0.6 + capacityScore * 0.4;

  if (composite > 0.7) return {
    level: 'EXTREME' as const, color: '#dc2626', bgColor: '#fef2f2',
    description: 'Catastrophic breach potential — massive downstream inundation',
    downstreamPopEstimate: Math.round(dam.capacity_mcm * 85),
  };
  if (composite > 0.45) return {
    level: 'HIGH' as const, color: '#ea580c', bgColor: '#fff7ed',
    description: 'Significant breach risk — major downstream impact',
    downstreamPopEstimate: Math.round(dam.capacity_mcm * 55),
  };
  if (composite > 0.2) return {
    level: 'MODERATE' as const, color: '#ca8a04', bgColor: '#fefce8',
    description: 'Moderate risk — localized flooding expected',
    downstreamPopEstimate: Math.round(dam.capacity_mcm * 30),
  };
  return {
    level: 'LOW' as const, color: '#16a34a', bgColor: '#f0fdf4',
    description: 'Lower risk — limited downstream consequences',
    downstreamPopEstimate: Math.round(dam.capacity_mcm * 15),
  };
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatType(type: string) {
  const map: Record<string, string> = {
    concrete_gravity: 'Concrete Gravity', concrete_arch: 'Concrete Arch',
    earthfill: 'Earthfill', rockfill: 'Rockfill', earthen: 'Earthen',
    masonry: 'Masonry', barrage: 'Barrage',
  };
  return map[type] || type;
}

// ── Generate simulated flood polygon around a dam ──────────────────
function generateFloodPolygon(dam: DamPoint, progress: number): GeoJSON.Feature {
  // Flood expands downstream and laterally over time
  const kmPerDeg = 111;
  const downstreamKm = (dam.capacity_mcm / 500) * progress * 2;
  const lateralKm = downstreamKm * 0.35;
  const segments = 24;
  const coords: [number, number][] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const rx = (lateralKm / kmPerDeg) * Math.cos(angle) * (1 + 0.5 * Math.sin(angle * 2));
    const ry = (downstreamKm / kmPerDeg) * Math.sin(angle) * (1 + 0.3 * Math.cos(angle * 3));
    coords.push([dam.lon + rx, dam.lat + ry * 0.7]);
  }
  coords.push(coords[0]);

  return {
    type: 'Feature',
    properties: { dam_id: dam.id, progress },
    geometry: { type: 'Polygon', coordinates: [coords] },
  };
}

// ── Inline MapLibre: Satellite + 3D Terrain + Flood Simulation ────
function InlineMapLibre({ onDamClick, selectedDam }: { onDamClick: (d: DamPoint) => void; selectedDam: DamPoint | null }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [floodProgress, setFloodProgress] = useState(0);
  const [floodPlaying, setFloodPlaying] = useState(false);
  const [showFlood, setShowFlood] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);
  const floodIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    import('maplibre-gl').then(({ default: maplibregl }) => {
      // @ts-ignore — CSS side-effect import not typed
      import('maplibre-gl/dist/maplibre-gl.css').catch(() => {});

      // ── Map style: satellite + terrain DEM (must be in style!) ──
      const style: any = {
        version: 8,
        name: 'DamSafe Satellite 3D',
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          // Esri World Imagery — high-res satellite basemap
          satellite: {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution: '© Esri, Maxar, Earthstar Geographics',
            maxzoom: 18,
          },
          // Terrain DEM — Terrarium encoding from AWS elevation-tiles
          'terrain-dem': {
            type: 'raster-dem',
            tiles: [
              'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            maxzoom: 12,
            encoding: 'terrarium',
          },
        },
        layers: [
          { id: 'satellite', type: 'raster', source: 'satellite' },
        ],
        fog: {
          range: [0.5, 10],
          color: 'rgba(186, 210, 235, 0.6)',
          'high-color': 'rgba(36, 92, 223, 0.3)',
          'horizon-blend': 0.1,
          'space-color': 'rgb(11, 11, 25)',
          'star-intensity': 0.6,
        },
      };

      const map = new maplibregl.Map({
        container: mapContainer.current!,
        style,
        center: [78.9, 20.6],
        zoom: 4.5,
        pitch: 60,
        bearing: -17,
        maxPitch: 70,
        antialias: true,

      });

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.addControl(new maplibregl.ScaleControl(), 'bottom-left');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      map.on('load', () => {
        // ── 3D Terrain (source already in style, just enable it) ───
        const terrainSource = map.getSource('terrain-dem');
        console.log('[DamSafe] Terrain source exists:', !!terrainSource);
        map.setTerrain({ source: 'terrain-dem', exaggeration: 2.5 });
        const terrainState = map.getTerrain();
        console.log('[DamSafe] Terrain state:', JSON.stringify(terrainState));

        // ── Hillshade layer using the same DEM source ──────────────
        map.addLayer({
          id: 'hillshade-layer',
          type: 'hillshade',
          source: 'terrain-dem',
          paint: {
            'hillshade-exaggeration': 0.8,
            'hillshade-shadow-color': '#1a1040',
            'hillshade-highlight-color': '#ffe8c8',
            'hillshade-accent-color': '#2a6fa7',
          },
        }, 'satellite');

        // ── Labels layer on top (togglable) ────────────────────────
        map.addSource('labels', {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          maxzoom: 18,
        });
        map.addLayer({
          id: 'labels-layer',
          type: 'raster',
          source: 'labels',
          paint: { 'raster-opacity': 0.85 },
        });



        // ── Dam markers ────────────────────────────────────────────
        const features = INDIA_DAMS.map((dam) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [dam.lon, dam.lat] },
          properties: {
            id: dam.id, name: dam.name, state: dam.state, river: dam.river,
            height_m: dam.height_m, capacity_mcm: dam.capacity_mcm,
            type: dam.type, year_built: dam.year_built,
            hazard_color: classifyHazard(dam).color,
          },
        }));

        map.addSource('dams', { type: 'geojson', data: { type: 'FeatureCollection', features } });

        // Glow halo
        map.addLayer({
          id: 'dams-glow', type: 'circle', source: 'dams',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['get', 'height_m'], 30, 8, 300, 22],
            'circle-color': ['get', 'hazard_color'],
            'circle-opacity': 0.25,
            'circle-blur': 2,
          },
        });

        // Solid dot
        map.addLayer({
          id: 'dams-dots', type: 'circle', source: 'dams',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['get', 'height_m'], 30, 4, 300, 12],
            'circle-color': ['get', 'hazard_color'],
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 2,
            'circle-opacity': 0.95,
          },
        });

        // Labels (use symbol layer with a simple text approach)
        map.addLayer({
          id: 'dams-labels', type: 'symbol', source: 'dams',
          layout: {
            'text-field': ['to-string', ['get', 'name']],
            'text-size': 11,
            'text-offset': [0, 1.8],
            'text-anchor': 'top',
            'text-allow-overlap': false,
          },
          paint: {
            'text-color': '#fff',
            'text-halo-color': 'rgba(0,0,0,0.7)',
            'text-halo-width': 2,
          },
        });

        // ── Flood extent overlay (initially empty) ─────────────────
        map.addSource('flood-extent', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        map.addLayer({
          id: 'flood-fill', type: 'fill', source: 'flood-extent',
          paint: {
            'fill-color': [
              'interpolate', ['linear'], ['get', 'progress'],
              0, 'rgba(59,130,246,0.1)',
              0.3, 'rgba(59,130,246,0.25)',
              0.6, 'rgba(37,99,235,0.4)',
              1, 'rgba(30,64,175,0.55)',
            ],
            'fill-opacity': 0.7,
          },
        });
        map.addLayer({
          id: 'flood-outline', type: 'line', source: 'flood-extent',
          paint: {
            'line-color': '#3b82f6',
            'line-width': 2,
            'line-opacity': 0.8,
          },
        });

        // ── 3D Buildings (OpenFreeMap vector tiles) ─────────────────
        map.addSource('openmaptiles', {
          type: 'vector',
          tiles: ['https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf'],
          maxzoom: 14,
          attribution: '© OpenFreeMap contributors',
        });

        // 3D building extrusions — visible at zoom 13+
        map.addLayer({
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 13,
          paint: {
            'fill-extrusion-color': [
              'case',
              ['has', 'render_height'],
              [
                'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 10],
                5, '#c8d6e5',
                20, '#a4b0be',
                50, '#8395a7',
                100, '#576574',
              ],
              '#d1d8e0',
            ],
            'fill-extrusion-height': [
              'coalesce',
              ['get', 'render_height'],
              ['get', 'height'],
              10,
            ],
            'fill-extrusion-base': [
              'coalesce',
              ['get', 'render_min_height'],
              ['get', 'min_height'],
              0,
            ],
            'fill-extrusion-opacity': 0.7,
          },
        });

        // ── River / waterway lines ─────────────────────────────────
        map.addLayer({
          id: 'waterways',
          source: 'openmaptiles',
          'source-layer': 'waterway',
          type: 'line',
          minzoom: 8,
          paint: {
            'line-color': '#4fc3f7',
            'line-width': [
              'interpolate', ['linear'], ['coalesce', ['get', 'width'], 1],
              1, 0.5,
              5, 2,
              10, 4,
            ],
            'line-opacity': 0.6,
          },
        });

        // ── Water bodies (lakes, reservoirs) ────────────────────────
        map.addLayer({
          id: 'water-bodies',
          source: 'openmaptiles',
          'source-layer': 'water',
          type: 'fill',
          paint: {
            'fill-color': '#29b6f6',
            'fill-opacity': 0.4,
          },
        });

        // ── Road network ───────────────────────────────────────────
        map.addLayer({
          id: 'roads-major',
          source: 'openmaptiles',
          'source-layer': 'transportation',
          type: 'line',
          minzoom: 6,
          filter: ['all', ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary']],
          paint: {
            'line-color': '#e17055',
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              6, 0.5,
              10, 1.5,
              14, 3,
            ],
            'line-opacity': 0.5,
          },
        });

        // ── Forest / landcover ──────────────────────────────────────
        map.addLayer({
          id: 'landcover-forest',
          source: 'openmaptiles',
          'source-layer': 'landcover',
          type: 'fill',
          filter: ['==', 'class', 'forest'],
          paint: {
            'fill-color': '#27ae60',
            'fill-opacity': 0.15,
          },
        }, 'satellite');

        // ── Click handler ──────────────────────────────────────────
        map.on('click', 'dams-dots', (e: any) => {
          if (!e.features?.length) return;
          const dam = INDIA_DAMS.find(d => d.id === e.features[0].properties.id);
          if (dam) { onDamClick(dam); e.preventDefault(); }
        });

        map.on('mouseenter', 'dams-dots', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'dams-dots', () => { map.getCanvas().style.cursor = ''; });
      });

      mapRef.current = map;
    });

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // ── Fly to selected dam ───────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selectedDam) return;
    mapRef.current.flyTo({
      center: [selectedDam.lon, selectedDam.lat],
      zoom: 13,
      pitch: 60,
      bearing: Math.random() * 40 - 20,
      duration: 2500,
      essential: true,
    });
  }, [selectedDam]);

  // ── Toggle labels ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current?.isStyleLoaded()) return;
    try {
      mapRef.current.setLayoutProperty('labels-layer', 'visibility', showLabels ? 'visible' : 'none');
    } catch {}
  }, [showLabels]);

  // ── Toggle 3D buildings ───────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current?.isStyleLoaded()) return;
    try {
      mapRef.current.setLayoutProperty('3d-buildings', 'visibility', showBuildings ? 'visible' : 'none');
    } catch {}
  }, [showBuildings]);

  // ── Update flood overlay ──────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current?.isStyleLoaded() || !showFlood) return;
    const dam = selectedDam || INDIA_DAMS[0]; // default to first dam for demo
    if (floodProgress === 0) {
      mapRef.current.getSource('flood-extent')?.setData({
        type: 'FeatureCollection', features: [],
      });
    } else {
      const flood = generateFloodPolygon(dam, floodProgress);
      mapRef.current.getSource('flood-extent')?.setData({
        type: 'FeatureCollection', features: [flood],
      });
    }
  }, [floodProgress, showFlood, selectedDam]);

  // ── Flood animation playback ──────────────────────────────────────
  useEffect(() => {
    if (floodPlaying) {
      floodIntervalRef.current = setInterval(() => {
        setFloodProgress(prev => {
          if (prev >= 1) { setFloodPlaying(false); return 1; }
          return Math.min(prev + 0.02, 1);
        });
      }, 80);
    } else if (floodIntervalRef.current) {
      clearInterval(floodIntervalRef.current);
    }
    return () => { if (floodIntervalRef.current) clearInterval(floodIntervalRef.current); };
  }, [floodPlaying]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* ── Map controls overlay ───────────────────────────────────── */}
      <div className="absolute top-3 right-14 z-20 flex flex-col gap-2">
        {/* Labels toggle */}
        <button onClick={() => setShowLabels(!showLabels)}
          className={`p-2 rounded-lg shadow-md transition-colors ${showLabels ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          title="Toggle place labels">
          <Layers className="w-4 h-4" />
        </button>
        {/* 3D Buildings toggle */}
        <button onClick={() => setShowBuildings(!showBuildings)}
          className={`p-2 rounded-lg shadow-md transition-colors ${showBuildings ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          title="Toggle 3D buildings">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 4v14"/><path d="M9 9h1M9 13h1M15 9h1M15 13h1"/></svg>
        </button>
        {/* Flood toggle */}
        <button onClick={() => { setShowFlood(!showFlood); if (!showFlood) setFloodProgress(0.5); }}
          className={`p-2 rounded-lg shadow-md transition-colors ${showFlood ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          title="Toggle flood extent overlay">
          <Droplets className="w-4 h-4" />
        </button>
      </div>

      {/* ── Flood time slider ──────────────────────────────────────── */}
      {showFlood && (
        <div className="absolute bottom-6 left-4 right-4 z-20 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => { setFloodPlaying(!floodPlaying); }}
              className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              {floodPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => { setFloodPlaying(false); setFloodProgress(0); }}
              className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1">
              <input
                type="range" min="0" max="100" value={Math.round(floodProgress * 100)}
                onChange={(e) => { setFloodProgress(Number(e.target.value) / 100); setFloodPlaying(false); }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 w-16 text-right">
              T+{Math.round(floodProgress * 120)} min
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-400">
            <span>Progress: {Math.round(floodProgress * 100)}%</span>
            <span>Flood extent radius: ~{((selectedDam || INDIA_DAMS[0]).capacity_mcm / 500 * floodProgress * 2).toFixed(1)} km</span>
            <span className="ml-auto text-blue-600 font-semibold">
              {selectedDam ? selectedDam.name : 'Demo: Machhu Dam'} flood simulation
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────
export default function IncidentConsole() {
  const [selectedDam, setSelectedDam] = useState<DamPoint | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [geolibreOnline, setGeolibreOnline] = useState<boolean | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [geolibreReady, setGeolibreReady] = useState(false);

  // Check if GeoLibre is running
  useEffect(() => {
    const check = () => {
      fetch(GEOLIBRE_BASE, { mode: 'no-cors' })
        .then(() => setGeolibreOnline(true))
        .catch(() => setGeolibreOnline(false));
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen for GeoLibre 'ready' event
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'ready' && event.data?.source === 'geolibre-embed') {
        setGeolibreReady(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Robust fly-to with retries
  const flyToDam = useCallback((dam: DamPoint) => {
    if (!iframeRef.current?.contentWindow) return;

    const msg = {
      v: 1,
      type: 'setView',
      payload: { center: [dam.lon, dam.lat], zoom: 12, duration: 2000 },
      requestId: `dam-${dam.id}-${Date.now()}`,
    };
    const target = GEOLIBRE_BASE;

    const send = () => {
      try {
        iframeRef.current?.contentWindow?.postMessage(msg, target);
        console.log('[DamSafe] Sent setView to GeoLibre:', msg);
      } catch (err) {
        console.warn('[DamSafe] postMessage failed:', err);
      }
    };

    send();
    const timers = [setTimeout(send, 1000), setTimeout(send, 2000), setTimeout(send, 4000)];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleDamClick = useCallback((dam: DamPoint) => {
    setSelectedDam(dam);
    flyToDam(dam);
  }, [flyToDam]);

  const hazard = selectedDam ? classifyHazard(selectedDam) : null;

  const filteredDams = searchQuery
    ? INDIA_DAMS.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.river.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : INDIA_DAMS.sort((a, b) => b.height_m - a.height_m);

  const geolibreSrc = `${GEOLIBRE_BASE}/?embed=1&maponly&data=${encodeURIComponent(DAMS_GEOJSON_URL)}`;

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      {/* Dam sidebar */}
      {sidebarOpen && (
        <div className="w-72 bg-white/95 backdrop-blur-sm border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-lg"
          onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">India Dam Index</h3>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              {INDIA_DAMS.length} dams • Satellite + 3D Terrain
            </p>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text" placeholder="Search dams..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-slate-50"
              />
            </div>
          </div>

          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Height Distribution</p>
            {[
              { label: 'Mega (>200m)', color: '#dc2626', count: INDIA_DAMS.filter(d => d.height_m > 200).length },
              { label: 'Large (150-200m)', color: '#ea580c', count: INDIA_DAMS.filter(d => d.height_m >= 150 && d.height_m <= 200).length },
              { label: 'Medium (100-150m)', color: '#ca8a04', count: INDIA_DAMS.filter(d => d.height_m >= 100 && d.height_m < 150).length },
              { label: 'Standard (50-100m)', color: '#2563eb', count: INDIA_DAMS.filter(d => d.height_m >= 50 && d.height_m < 100).length },
              { label: 'Small (<50m)', color: '#6b7280', count: INDIA_DAMS.filter(d => d.height_m < 50).length },
            ].map(({ label, color, count }) => (
              <div key={label} className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-600 flex-1">{label}</span>
                <span className="text-xs font-bold text-slate-800">{count}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredDams.map((dam) => (
              <button key={dam.id} onClick={() => handleDamClick(dam)}
                className={`w-full flex items-center gap-2 text-left p-2 rounded-lg transition-colors group mb-0.5 ${
                  selectedDam?.id === dam.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                }`}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: classifyHazard(dam).color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-blue-600">{dam.name}</p>
                  <p className="text-[10px] text-slate-400">{dam.state} • {dam.river}</p>
                </div>
                <span className="text-xs font-bold text-slate-500 shrink-0">{dam.height_m}m</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map area */}
      <div className="flex-1 relative">
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-20 p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors" title="Show dam list">
            <PanelLeft className="w-4 h-4 text-slate-600" />
          </button>
        )}

        <div className="absolute top-3 right-14 z-20">
          {geolibreOnline === null ? (
            <div className="px-3 py-1.5 bg-yellow-500 text-white text-[10px] font-bold rounded-full animate-pulse">Checking GeoLibre...</div>
          ) : geolibreOnline ? (
            <div className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
              ● GeoLibre 3D Earth {geolibreReady ? '(Ready)' : '(Loading...)'}
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">● Satellite + 3D Terrain</div>
          )}
        </div>

        {geolibreOnline ? (
          <iframe
            ref={iframeRef}
            src={geolibreSrc}
            className="w-full h-full border-0"
            style={{ minHeight: 'calc(100vh - 3.5rem)' }}
            allow="accelerometer; camera; geolocation; clipboard-write"
            title="GeoLibre 3D Earth"
          />
        ) : geolibreOnline === false ? (
          <InlineMapLibre onDamClick={handleDamClick} selectedDam={selectedDam} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dam data panel */}
      {selectedDam && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-sm border-l border-slate-200 shadow-xl z-20 flex flex-col"
          onClick={(e) => e.stopPropagation()}>
          <div className="p-4 overflow-y-auto flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedDam.name}</h3>
                <p className="text-sm text-slate-500">{selectedDam.state} • {selectedDam.river} River</p>
              </div>
              <button onClick={() => setSelectedDam(null)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {hazard && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3"
                style={{ backgroundColor: hazard.bgColor, color: hazard.color }}>
                <AlertTriangle className="w-3 h-3" /> {hazard.level} RISK
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { label: 'Height', value: `${selectedDam.height_m} m` },
                { label: 'Capacity', value: `${selectedDam.capacity_mcm.toLocaleString()} MCM` },
                { label: 'Type', value: formatType(selectedDam.type) },
                { label: 'Year Built', value: selectedDam.year_built > 0 ? String(selectedDam.year_built) : `${Math.abs(selectedDam.year_built)} BC` },
                { label: 'Latitude', value: selectedDam.lat.toFixed(4) },
                { label: 'Longitude', value: selectedDam.lon.toFixed(4) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
                  <p className="text-sm font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>

            {hazard && (
              <div className="border-t border-slate-100 pt-3 mt-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Downstream Impact Estimate</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{formatNumber(hazard.downstreamPopEstimate)}</p>
                      <p className="text-[10px] text-slate-400">Est. population at risk</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{(selectedDam.capacity_mcm * 0.001).toFixed(1)} km³</p>
                      <p className="text-[10px] text-slate-400">Flood volume potential</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{hazard.description}</p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 mt-3">
              <button onClick={() => flyToDam(selectedDam)}
                className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Fly to Dam on Satellite Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
