/**
 * DamSafe Twin — Incident Console
 *
 * Single unified GeoLibre-powered map.
 * Click any dam dot → fly to it + show data panel with dam details.
 * Time slider for flood simulation.
 */

import { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Pause, RotateCcw, X, Users, Droplets, AlertTriangle, MapPin } from 'lucide-react';
import EnhancedMap from '../../viewers/maplibre-2d-map/EnhancedMap';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useImpactData } from './hooks';
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
  const [simRunId, setSimRunId] = useState('demo-run-001');
  const [timeMinutes, setTimeMinutes] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDam, setSelectedDam] = useState<DamPoint | null>(null);
  const [cameraTarget, setCameraTarget] = useState<{ lon: number; lat: number; heightM: number } | null>(null);

  const { data: impactData, loading } = useImpactData(simRunId, timeMinutes);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeMinutes((t) => {
        if (t >= 120) { setIsPlaying(false); return 120; }
        return t + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleDamClick = useCallback((dam: DamPoint) => {
    setSelectedDam(dam);
    setCameraTarget({ lon: dam.lon, lat: dam.lat, heightM: Math.max(dam.height_m * 12, 5000) });
  }, []);

  const hazard = selectedDam ? classifyHazard(selectedDam) : null;

  const scenarios = [
    { id: '40000000-0000-0000-0000-000000000001', name: 'Overtopping — Expected' },
    { id: '40000000-0000-0000-0000-000000000002', name: 'Piping — Conservative' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
      {/* Header */}
      <div className="shrink-0 space-y-3 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Incident Console</h1>
            <p className="text-slate-500 mt-1">Click any dam to view its safety data</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 inline mr-1" />
            {INDIA_DAMS.length} Dams Indexed
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-600">Scenario:</span>
          <div className="flex gap-2">
            {scenarios.map((s) => (
              <button key={s.id} onClick={() => setSimRunId(s.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  simRunId === s.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}>{s.name}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Map */}
        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
          style={{ flex: selectedDam ? '1 1 50%' : '1 1 100%' }}>
          <ErrorBoundary fallbackLabel="Map Error">
            <EnhancedMap center={[70.85, 22.83]} zoom={11} layer="depth"
              timeMinutes={timeMinutes} impactData={impactData}
              cameraTarget={cameraTarget} onCameraChange={setCameraTarget}
              onDamClick={handleDamClick} />
          </ErrorBoundary>
          {impactData && (
            <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                <span>{impactData.villages.filter((v) => v.flooded).length}/{impactData.villages.length} flooded</span>
                <span className="text-slate-400">|</span>
                <span>{impactData.villages.reduce((s, v) => s + v.population, 0).toLocaleString()} at risk</span>
              </div>
            </div>
          )}
        </div>

        {/* Data panel when dam selected */}
        {selectedDam && (
          <div className="flex flex-col gap-3" style={{ flex: '0 0 380px' }}
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
            </div>
          </div>
        )}

        {/* Quick info panel when no dam selected */}
        {!selectedDam && (
          <div className="bg-white rounded-lg border border-slate-200 p-4" style={{ flex: '0 0 320px' }}>
            <h3 className="text-sm font-bold text-slate-800 mb-3">India Dam Index</h3>
            <p className="text-xs text-slate-500 mb-3">
              {INDIA_DAMS.length} major dams across India from GRanD. Click any dam dot to view details.
            </p>
            <div className="space-y-2 mb-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Height Distribution</p>
              {[
                { label: 'Mega (>200m)', color: '#dc2626', count: INDIA_DAMS.filter(d => d.height_m > 200).length },
                { label: 'Large (150-200m)', color: '#ea580c', count: INDIA_DAMS.filter(d => d.height_m >= 150 && d.height_m <= 200).length },
                { label: 'Medium (100-150m)', color: '#ca8a04', count: INDIA_DAMS.filter(d => d.height_m >= 100 && d.height_m < 150).length },
                { label: 'Standard (50-100m)', color: '#2563eb', count: INDIA_DAMS.filter(d => d.height_m >= 50 && d.height_m < 100).length },
                { label: 'Small (<50m)', color: '#6b7280', count: INDIA_DAMS.filter(d => d.height_m < 50).length },
              ].map(({ label, color, count }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-600 flex-1">{label}</span>
                  <span className="text-xs font-bold text-slate-800">{count}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Top 5 Tallest Dams</p>
              <div className="space-y-1.5">
                {INDIA_DAMS.sort((a, b) => b.height_m - a.height_m).slice(0, 5).map((dam) => (
                  <button key={dam.id} onClick={() => handleDamClick(dam)}
                    className="w-full flex items-center gap-2 text-left p-2 rounded-lg hover:bg-slate-50 transition-colors group">
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
        )}
      </div>

      {/* Time slider */}
      <div className="shrink-0 bg-white rounded-lg border border-slate-200 px-4 py-3 mt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={() => { setTimeMinutes(0); setIsPlaying(false); }}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <input type="range" min={0} max={120} value={timeMinutes}
              onChange={(e) => setTimeMinutes(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
              <span>0</span><span>30</span><span>60</span><span>90</span><span>120 min</span>
            </div>
          </div>
          <div className="text-lg font-mono font-bold text-slate-800 min-w-[110px] text-right">
            <Clock className="w-4 h-4 inline mr-1 text-slate-400" />
            T+{timeMinutes} min
          </div>
        </div>
      </div>
    </div>
  );
}
