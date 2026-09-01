/**
 * DamSafe Twin — Incident Console
 *
 * Renders a full GeoLibre-style 3D globe with all 138 Indian dams using MapLibre GL JS.
 * No iframe needed — the map renders directly in the React app.
 */

import { useState, useRef, useEffect } from 'react';
import { X, Users, Droplets, AlertTriangle, PanelLeftClose, PanelLeft, Globe, Search } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { INDIA_DAMS, DamPoint } from '../../data/india-dams';

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

export default function IncidentConsole() {
  const [selectedDam, setSelectedDam] = useState<DamPoint | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Initialize the 3D globe map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        name: 'GeoLibre Globe',
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          { id: 'osm-tiles', type: 'raster', source: 'osm' },
        ],
      },
      center: [78.9, 20.6], // Center on India
      zoom: 4.5,
      pitch: 45,
      bearing: 0,
      maxPitch: 60,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.on('load', () => {
      // Add dam source as GeoJSON
      const damFeatures = INDIA_DAMS.map((dam) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [dam.lon, dam.lat] },
        properties: {
          id: dam.id,
          name: dam.name,
          state: dam.state,
          river: dam.river,
          height_m: dam.height_m,
          capacity_mcm: dam.capacity_mcm,
          type: dam.type,
          year_built: dam.year_built,
          hazard_color: classifyHazard(dam).color,
        },
      }));

      map.addSource('dams', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: damFeatures },
      });

      // Dam glow (outer ring)
      map.addLayer({
        id: 'dams-glow',
        type: 'circle',
        source: 'dams',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'height_m'], 30, 6, 300, 18],
          'circle-color': ['get', 'hazard_color'],
          'circle-opacity': 0.25,
          'circle-blur': 1,
        },
      });

      // Dam dots (inner)
      map.addLayer({
        id: 'dams-dots',
        type: 'circle',
        source: 'dams',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'height_m'], 30, 3, 300, 9],
          'circle-color': ['get', 'hazard_color'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.5,
          'circle-opacity': 0.9,
        },
      });

      // Dam labels
      map.addLayer({
        id: 'dams-labels',
        type: 'symbol',
        source: 'dams',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 10,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#1e293b',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      });

      // Click handler for dams
      map.on('click', 'dams-dots', (e) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties!;
        const dam = INDIA_DAMS.find(d => d.id === props.id);
        if (dam) {
          setSelectedDam(dam);
          e.preventDefault();
        }
      });

      // Cursor change on hover
      map.on('mouseenter', 'dams-dots', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'dams-dots', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fly to dam when selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedDam) return;

    map.flyTo({
      center: [selectedDam.lon, selectedDam.lat],
      zoom: 11,
      pitch: 50,
      bearing: Math.random() * 30 - 15,
      duration: 2000,
      essential: true,
    });
  }, [selectedDam]);

  const hazard = selectedDam ? classifyHazard(selectedDam) : null;

  const filteredDams = searchQuery
    ? INDIA_DAMS.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.river.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : INDIA_DAMS.sort((a, b) => b.height_m - a.height_m);

  return (
    <div className="flex h-full w-full relative overflow-hidden">
      {/* Dam sidebar */}
      {sidebarOpen && (
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
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
              {INDIA_DAMS.length} dams on the 3D globe
            </p>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-slate-50"
              />
            </div>
          </div>

          {/* Height distribution */}
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

          {/* Dam list */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredDams.map((dam) => (
              <button
                key={dam.id}
                onClick={() => setSelectedDam(dam)}
                className={`w-full flex items-center gap-2 text-left p-2 rounded-lg transition-colors group mb-0.5 ${
                  selectedDam?.id === dam.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                }`}
              >
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
        {/* Sidebar toggle when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-20 p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors"
            title="Show dam list"
          >
            <PanelLeft className="w-4 h-4 text-slate-600" />
          </button>
        )}

        {/* The actual 3D globe map */}
        <div ref={mapContainer} className="w-full h-full" />

        {/* Map legend */}
        <div className="absolute bottom-4 left-3 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-3 text-xs">
          <p className="font-semibold text-slate-700 mb-2">Dam Hazard Level</p>
          {[
            { label: 'EXTREME', color: '#dc2626' },
            { label: 'HIGH', color: '#ea580c' },
            { label: 'MODERATE', color: '#ca8a04' },
            { label: 'LOW', color: '#16a34a' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-slate-600">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600">Selected Dam</span>
          </div>
        </div>
      </div>

      {/* Dam data panel (slides in when dam is selected) */}
      {selectedDam && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col">
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
          </div>
        </div>
      )}
    </div>
  );
}
