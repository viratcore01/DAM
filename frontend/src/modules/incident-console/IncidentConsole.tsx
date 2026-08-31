/**
 * DamSafe Twin — Incident Console
 *
 * Single unified GeoLibre-powered map.
 * Click any dam dot → fly to it + show 3D CesiumJS view + data panel.
 * Time slider for flood simulation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock, Play, Pause, RotateCcw, X, ChevronRight,
  Droplets, Mountain, Users, AlertTriangle, MapPin, Zap,
} from 'lucide-react';
import EnhancedMap from '../../viewers/maplibre-2d-map/EnhancedMap';
import TerrainView from '../../viewers/terrain-3d/TerrainView';
import ErrorBoundary from '../../components/ErrorBoundary';
import {
  IncidentConsoleState,
  useImpactData,
} from './hooks';
import { INDIA_DAMS, DamPoint } from '../../data/india-dams';

// ── Hazard classification from docs ──────────────────────────────────────
function classifyHazard(dam: DamPoint): {
  level: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
  color: string;
  bgColor: string;
  description: string;
  downstreamPopEstimate: number;
} {
  const heightScore = Math.min(dam.height_m / 300, 1);
  const capacityScore = Math.min(dam.capacity_mcm / 15000, 1);
  const composite = heightScore * 0.6 + capacityScore * 0.4;

  if (composite > 0.7) return {
    level: 'EXTREME',
    color: '#dc2626',
    bgColor: '#fef2f2',
    description: 'Catastrophic breach potential — massive downstream inundation',
    downstreamPopEstimate: Math.round(dam.capacity_mcm * 85),
  };
  if (composite > 0.45) return {
    level: 'HIGH',
    color: '#ea580c',
    bgColor: '#fff7ed',
    description: 'Significant breach risk — major downstream impact',
    downstreamPopEstimate: Math.round(dam.capacity_mcm * 55),
  };
  if (composite > 0.2) return {
    level: 'MODERATE',
    color: '#ca8a04',
    bgColor: '#fefce8',
    description: 'Moderate risk — localized flooding expected',
    downstreamPopEstimate: Math.round(dam.capacity_mcm * 30),
  };
  return {
    level: 'LOW',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    description: 'Lower risk — limited downstream consequences',
    downstreamPopEstimate: Math.round(dam.capacity_mcm * 15),
  };
}

// ── Format helpers ───────────────────────────────────────────────────────
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatType(type: string): string {
  const map: Record<string, string> = {
    concrete_gravity: 'Concrete Gravity',
    concrete_arch: 'Concrete Arch',
    earthfill: 'Earthfill',
    rockfill: 'Rockfill',
    earthen: 'Earthen',
    masonry: 'Masonry',
    barrage: 'Barrage',
  };
  return map[type] || type;
}

export default function IncidentConsole() {
  const { t } = useTranslation();

  // ── Lifted state ────────────────────────────────────────────────────────
  const [state, setState] = useState<IncidentConsoleState>({
    viewMode: 'enhanced',
    simRunId: 'demo-run-001',
    currentTimeMinutes: 0,
    cameraTarget: null,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDam, setSelectedDam] = useState<DamPoint | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const cesiumInitRef = useRef(false);

  // ── Shared data hook ────────────────────────────────────────────────────
  const { data: impactData, loading } = useImpactData(state.simRunId, state.currentTimeMinutes);

  // ── Time slider auto-advance ─────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.currentTimeMinutes >= 120) {
          setIsPlaying(false);
          return { ...prev, currentTimeMinutes: 120 };
        }
        return { ...prev, currentTimeMinutes: prev.currentTimeMinutes + 1 };
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // ── Dam click handler → fly + show panel ────────────────────────────────
  const handleDamClick = useCallback((dam: DamPoint) => {
    setSelectedDam(dam);
    setShowDataPanel(true);
    // Fly to dam with enough altitude for 3D view (at least 5km)
    const flyHeight = Math.max(dam.height_m * 12, 5000);
    setState((prev) => ({
      ...prev,
      cameraTarget: { lon: dam.lon, lat: dam.lat, heightM: flyHeight },
    }));
  }, []);

  // ── Camera target sync ───────────────────────────────────────────────────
  const updateCameraTarget = useCallback((target: { lon: number; lat: number; heightM: number }) => {
    setState((prev) => ({ ...prev, cameraTarget: target }));
  }, []);

  // ── Hazard info for selected dam ─────────────────────────────────────────
  const hazard = selectedDam ? classifyHazard(selectedDam) : null;

  // ── Scenario selection ───────────────────────────────────────────────────
  const scenarios = [
    { id: '40000000-0000-0000-0000-000000000001', name: 'Overtopping — Expected' },
    { id: '40000000-0000-0000-0000-000000000002', name: 'Piping — Conservative' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 space-y-3 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Incident Console</h1>
            <p className="text-slate-500 mt-1">
              Click any dam to view its 3D terrain and safety data
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Dam count badge */}
            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />
              {INDIA_DAMS.length} Dams Indexed
            </div>
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-600">Scenario:</span>
          <div className="flex gap-2">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setState((p) => ({ ...p, simRunId: s.id }))}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  state.simRunId === s.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content: Map + optional 3D panel ───────────────────────── */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Map (full width unless 3D panel is open) */}
        <div
          className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 transition-all duration-300"
          style={{ flex: selectedDam ? '1 1 50%' : '1 1 100%' }}
        >
          <ErrorBoundary fallbackLabel="Map Error">
            <EnhancedMap
              center={[70.85, 22.83]}
              zoom={11}
              layer="depth"
              timeMinutes={state.currentTimeMinutes}
              impactData={impactData}
              cameraTarget={state.cameraTarget}
              onCameraChange={updateCameraTarget}
              onDamClick={handleDamClick}
            />
          </ErrorBoundary>

          {/* Data status indicator */}
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
        </div>        {/* ── 3D + Data Panel (right side) ──────────────────────────────── */}
        {selectedDam && (
          <div
            className="flex flex-col gap-3 transition-all duration-300"
            style={{ flex: '0 0 420px' }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 3D CesiumJS View (only when toggled on) */}
            {show3D && (
              <div className="flex-1 relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 min-h-[250px]">
              <ErrorBoundary fallbackLabel="3D View Error">
                <TerrainView
                  center={[selectedDam.lon, selectedDam.lat]}
                  zoom={15}
                  pitch={60}
                  bearing={10}
                  timeMinutes={state.currentTimeMinutes}
                  impactData={impactData}
                  cameraTarget={state.cameraTarget}
                  onCameraChange={updateCameraTarget}
                  damLon={selectedDam.lon}
                  damLat={selectedDam.lat}
                />
              </ErrorBoundary>
              </div>
            )}

            {/* Dam Data Panel */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 overflow-y-auto" style={{ maxHeight: '320px' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{selectedDam.name}</h3>
                  <p className="text-sm text-slate-500">{selectedDam.state} • {selectedDam.river} River</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setShow3D(false); setShowDataPanel(false); setSelectedDam(null); }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hazard badge */}
              {hazard && (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3"
                  style={{ backgroundColor: hazard.bgColor, color: hazard.color }}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {hazard.level} RISK
                </div>
              )}

              {/* Dam specs grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Height</p>
                  <p className="text-base font-bold text-slate-800">{selectedDam.height_m} m</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Capacity</p>
                  <p className="text-base font-bold text-slate-800">{selectedDam.capacity_mcm.toLocaleString()} MCM</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Type</p>
                  <p className="text-base font-bold text-slate-800">{formatType(selectedDam.type)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Year Built</p>
                  <p className="text-base font-bold text-slate-800">{selectedDam.year_built > 0 ? selectedDam.year_built : `${Math.abs(selectedDam.year_built)} BC`}</p>
                </div>
              </div>

              {/* Downstream estimates */}
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

              {/* Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!show3D && selectedDam) {
                      cesiumInitRef.current = true;
                      const h = Math.max(selectedDam.height_m * 12, 5000);
                      setState((p) => ({
                        ...p,
                        cameraTarget: { lon: selectedDam.lon, lat: selectedDam.lat, heightM: h },
                      }));
                    }
                    setShow3D(!show3D);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    show3D
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Mountain className="w-3.5 h-3.5" />
                  {show3D ? '3D Active' : 'View 3D Terrain'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setState((p) => ({
                      ...p,
                      cameraTarget: { lon: selectedDam.lon, lat: selectedDam.lat, heightM: 5000 },
                    }));
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Fly To
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Quick info panel (when no dam selected) ──────────────────── */}
        {!selectedDam && (
          <div className="bg-white rounded-lg border border-slate-200 p-4" style={{ flex: '0 0 320px' }}>
            <h3 className="text-sm font-bold text-slate-800 mb-3">India Dam Index</h3>
            <p className="text-xs text-slate-500 mb-3">
              {INDIA_DAMS.length} major dams across India from GRanD (Global Reservoir and Dam Database).
              Click any dam dot on the map to view its details and 3D terrain.
            </p>

            {/* Height distribution */}
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

            {/* Top 5 tallest */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Top 5 Tallest Dams</p>
              <div className="space-y-1.5">
                {INDIA_DAMS
                  .sort((a, b) => b.height_m - a.height_m)
                  .slice(0, 5)
                  .map((dam) => (
                    <button
                      key={dam.id}
                      onClick={() => handleDamClick(dam)}
                      className="w-full flex items-center gap-2 text-left p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: classifyHazard(dam).color }}
                      />
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

      {/* ── Bottom bar: Time Slider ────────────────────────────────────── */}
      <div className="shrink-0 bg-white rounded-lg border border-slate-200 px-4 py-3 mt-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setState((p) => ({ ...p, currentTimeMinutes: 0 })); setIsPlaying(false); }}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={120}
              value={state.currentTimeMinutes}
              onChange={(e) => setState((p) => ({ ...p, currentTimeMinutes: Number(e.target.value) }))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
              <span>0</span>
              <span>30</span>
              <span>60</span>
              <span>90</span>
              <span>120 min</span>
            </div>
          </div>

          <div className="text-lg font-mono font-bold text-slate-800 min-w-[110px] text-right">
            <Clock className="w-4 h-4 inline mr-1 text-slate-400" />
            T+{state.currentTimeMinutes} min
          </div>
        </div>
      </div>
    </div>
  );
}
