/**
 * DamSafe Twin — Incident Console
 *
 * Embeds the actual GeoLibre GIS platform as the main map.
 * Click any dam in the sidebar → fly the GeoLibre map to it + show data panel.
 */

import { useState, useRef, useCallback } from 'react';
import { X, Users, Droplets, AlertTriangle } from 'lucide-react';
import { INDIA_DAMS, DamPoint } from '../../data/india-dams';

const GEOLIBRE_URL = 'http://localhost:5175';

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
  const [mapLoading, setMapLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeKeyRef = useRef(0);

  // Fly to dam via GeoLibre embed API postMessage
  const flyToDam = useCallback((dam: DamPoint) => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        {
          v: 1,
          type: 'setView',
          payload: { center: [dam.lon, dam.lat], zoom: 12 },
          requestId: `dam-${dam.id}-${Date.now()}`,
        },
        GEOLIBRE_URL,
      );
    } catch (err) {
      console.warn('flyTo postMessage failed:', err);
    }
  }, []);

  const handleDamClick = useCallback((dam: DamPoint) => {
    setSelectedDam(dam);
    flyToDam(dam);
  }, [flyToDam]);

  const hazard = selectedDam ? classifyHazard(selectedDam) : null;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
      {/* Main content: sidebar + GeoLibre iframe + data panel */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Dam sidebar */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 overflow-y-auto" style={{ flex: '0 0 300px' }}>
          <h3 className="text-sm font-bold text-slate-800 mb-2">India Dam Index</h3>
          <p className="text-xs text-slate-500 mb-3">
            {INDIA_DAMS.length} major dams. Click to fly to it in GeoLibre.
          </p>

          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search dams..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                const results = INDIA_DAMS.filter(d =>
                  d.name.toLowerCase().includes(q) ||
                  d.state.toLowerCase().includes(q) ||
                  d.river.toLowerCase().includes(q)
                );
                if (results.length === 1) handleDamClick(results[0]);
              }}
            />
          </div>

          {/* Height distribution */}
          <div className="space-y-1.5 mb-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Height Distribution</p>
            {[
              { label: 'Mega (>200m)', color: '#dc2626', count: INDIA_DAMS.filter(d => d.height_m > 200).length },
              { label: 'Large (150-200m)', color: '#ea580c', count: INDIA_DAMS.filter(d => d.height_m >= 150 && d.height_m <= 200).length },
              { label: 'Medium (100-150m)', color: '#ca8a04', count: INDIA_DAMS.filter(d => d.height_m >= 100 && d.height_m < 150).length },
              { label: 'Standard (50-100m)', color: '#2563eb', count: INDIA_DAMS.filter(d => d.height_m >= 50 && d.height_m < 100).length },
              { label: 'Small (<50m)', color: '#6b7280', count: INDIA_DAMS.filter(d => d.height_m < 50).length },
            ].map(({ label, color, count }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-600 flex-1">{label}</span>
                <span className="text-xs font-bold text-slate-800">{count}</span>
              </div>
            ))}
          </div>

          {/* All dams list */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">All Dams</p>
            <div className="space-y-1 max-h-[50vh] overflow-y-auto">
              {INDIA_DAMS.sort((a, b) => b.height_m - a.height_m).map((dam) => (
                <button key={dam.id} onClick={() => handleDamClick(dam)}
                  className={`w-full flex items-center gap-2 text-left p-2 rounded-lg transition-colors group ${
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
        </div>

        {/* GeoLibre iframe — the actual GIS platform */}
        <div className="relative flex-1 rounded-lg overflow-hidden border border-slate-200">
          {mapLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">Loading GeoLibre...</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={GEOLIBRE_URL}
            className="w-full h-full border-0"
            style={{ minHeight: 'calc(100vh - 10rem)' }}
            onLoad={() => setMapLoading(false)}
            allow="accelerometer; camera; geolocation; clipboard-write"
            title="GeoLibre GIS Map"
          />
        </div>

        {/* Dam data panel when selected */}
        {selectedDam && (
          <div className="flex flex-col" style={{ flex: '0 0 360px' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg border border-slate-200 p-4 overflow-y-auto flex-1">
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
                    <p className="text-base font-bold text-slate-800">{value}</p>
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
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">GeoLibre Actions</p>
                <button onClick={() => flyToDam(selectedDam)}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Fly to Dam in GeoLibre
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
