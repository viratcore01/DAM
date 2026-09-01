/**
 * DamSafe Twin — Incident Console
 *
 * Auto-detects GeoLibre:
 *   - If GeoLibre is running → embed it with all 138 dams loaded via ?data= GeoJSON
 *   - If GeoLibre is NOT running → render inline MapLibre GL JS map with dam dots
 *
 * Both modes show the dam sidebar with search + data panel overlay.
 * Clicking a dam flies the GeoLibre map to it via postMessage with retry.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Users, Droplets, AlertTriangle, PanelLeftClose, PanelLeft, Globe, Search } from 'lucide-react';
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

// ── Inline MapLibre fallback ────────────────────────────────────────
function InlineMapLibre({ onDamClick, selectedDam }: { onDamClick: (d: DamPoint) => void; selectedDam: DamPoint | null }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    import('maplibre-gl').then(({ default: maplibregl }) => {
      import('maplibre-gl/dist/maplibre-gl.css');

      const map = new maplibregl.Map({
        container: mapContainer.current!,
        style: {
          version: 8, name: 'DamSafe Globe',
          sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap' } },
          layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm' }],
        },
        center: [78.9, 20.6], zoom: 4.5, pitch: 45, maxPitch: 60,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

      map.on('load', () => {
        const features = INDIA_DAMS.map((dam) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [dam.lon, dam.lat] },
          properties: { id: dam.id, name: dam.name, state: dam.state, river: dam.river, height_m: dam.height_m, capacity_mcm: dam.capacity_mcm, type: dam.type, year_built: dam.year_built, hazard_color: classifyHazard(dam).color },
        }));

        map.addSource('dams', { type: 'geojson', data: { type: 'FeatureCollection', features } });
        map.addLayer({ id: 'dams-glow', type: 'circle', source: 'dams', paint: { 'circle-radius': ['interpolate', ['linear'], ['get', 'height_m'], 30, 6, 300, 18], 'circle-color': ['get', 'hazard_color'], 'circle-opacity': 0.25, 'circle-blur': 1 } });
        map.addLayer({ id: 'dams-dots', type: 'circle', source: 'dams', paint: { 'circle-radius': ['interpolate', ['linear'], ['get', 'height_m'], 30, 3, 300, 9], 'circle-color': ['get', 'hazard_color'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 1.5, 'circle-opacity': 0.9 } });
        map.addLayer({ id: 'dams-labels', type: 'symbol', source: 'dams', layout: { 'text-field': ['get', 'name'], 'text-size': 10, 'text-offset': [0, 1.5], 'text-anchor': 'top', 'text-allow-overlap': false }, paint: { 'text-color': '#1e293b', 'text-halo-color': '#fff', 'text-halo-width': 1.5 } });

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

  useEffect(() => {
    if (!mapRef.current || !selectedDam) return;
    mapRef.current.flyTo({ center: [selectedDam.lon, selectedDam.lat], zoom: 11, pitch: 50, bearing: Math.random() * 30 - 15, duration: 2000 });
  }, [selectedDam]);

  return <div ref={mapContainer} className="w-full h-full" />;
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

  // Also listen for ack events
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'ack' && event.data?.source === 'geolibre-embed') {
        console.log('[DamSafe] GeoLibre ack:', event.data.payload);
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

    // Send immediately + retries
    const send = () => {
      try {
        iframeRef.current?.contentWindow?.postMessage(msg, target);
        console.log('[DamSafe] Sent setView to GeoLibre:', msg);
      } catch (err) {
        console.warn('[DamSafe] postMessage failed:', err);
      }
    };

    send();
    // Retry at 1s, 2s, 4s in case GeoLibre wasn't ready
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

  // Build GeoLibre iframe URL with dams data
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
              {INDIA_DAMS.length} dams loaded into GeoLibre.
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
            <div className="px-3 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">● MapLibre Map</div>
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
                Fly to Dam in GeoLibre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
