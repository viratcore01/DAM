/**
 * DamSafe Twin — Scenario Manager
 * Create, configure, submit, and approve dam-break scenarios.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Send, CheckCircle, Lock, Play, Clock, ChevronDown, Info,
} from 'lucide-react';
import { scenariosApi, simRunsApi } from '../../api/client';

export default function ScenarioManager() {
  const { t } = useTranslation();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [form, setForm] = useState({
    failure_mode: 'overtopping',
    variant: 'expected',
    solver: 'educational_swe',
    breach_width_m: 150,
    breach_depth_m: 25,
    formation_time_hr: 0.5,
    description: '',
  });

  const scenarios = [
    {
      id: '40000000-0000-0000-0000-000000000001',
      failure_mode: 'overtopping',
      variant: 'expected',
      solver: 'educational_swe',
      solver_version: '1.0.0-mvp',
      status: 'approved',
      breach_params: { breach_width_m: 150, breach_depth_m: 25, formation_time_hr: 0.5 },
      approved_by: 'Demo Operator',
      approved_at: '2026-08-31T12:00:00Z',
    },
    {
      id: '40000000-0000-0000-0000-000000000002',
      failure_mode: 'piping',
      variant: 'conservative',
      solver: 'educational_swe',
      solver_version: '1.0.0-mvp',
      status: 'approved',
      breach_params: { breach_width_m: 80, breach_depth_m: 30, formation_time_hr: 1.0 },
      approved_by: 'Demo Operator',
      approved_at: '2026-08-31T12:00:00Z',
    },
  ];

  async function handleEnqueue(scenarioId: string) {
    try {
      const result = await simRunsApi.enqueue(scenarioId);
      alert(`Simulation enqueued! Run ID: ${result.sim_run_id}`);
    } catch (err) {
      alert('Failed to enqueue simulation');
    }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-600',
      submitted: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      locked: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || ''}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('nav.scenarioManager')}</h1>
          <p className="text-slate-500 mt-1">Create, configure, and manage dam-break scenarios</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Scenario
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="card border-blue-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">New Scenario</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Failure Mode</label>
              <select
                value={form.failure_mode}
                onChange={(e) => setForm({ ...form, failure_mode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="overtopping">Overtopping</option>
                <option value="piping">Piping</option>
                <option value="controlled_release">Controlled Release</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Variant</label>
              <select
                value={form.variant}
                onChange={(e) => setForm({ ...form, variant: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="lower">Lower</option>
                <option value="expected">Expected</option>
                <option value="conservative">Conservative</option>
                <option value="fast">Fast</option>
                <option value="worst_credible">Worst Credible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Breach Width (m)</label>
              <input
                type="number"
                value={form.breach_width_m}
                onChange={(e) => setForm({ ...form, breach_width_m: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Breach Depth (m)</label>
              <input
                type="number"
                value={form.breach_depth_m}
                onChange={(e) => setForm({ ...form, breach_depth_m: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Formation Time (hr)</label>
              <input
                type="number"
                step="0.1"
                value={form.formation_time_hr}
                onChange={(e) => setForm({ ...form, formation_time_hr: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Solver</label>
              <select
                value={form.solver}
                onChange={(e) => setForm({ ...form, solver: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="educational_swe">Educational SWE (Research)</option>
                <option value="hecras">HEC-RAS</option>
                <option value="anuga">ANUGA</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              placeholder="Optional description for this scenario..."
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button className="btn-primary" onClick={() => setShowCreate(false)}>
              Create Draft
            </button>
            <button className="btn-secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
          </div>
          <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Breach parameters are Froehlich-derived generators, not deterministic truth. They are treated as uncertain scenario parameters.</span>
          </div>
        </div>
      )}

      {/* Scenario List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Scenario Ensemble</h3>
        <div className="space-y-4">
          {scenarios.map((s) => (
            <div key={s.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-200 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-slate-800">
                      {t(`scenario.${s.failure_mode}`)} — {s.variant}
                    </span>
                    {statusBadge(s.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-slate-500">Breach Width:</span>
                      <span className="ml-1 font-medium">{s.breach_params.breach_width_m} m</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Breach Depth:</span>
                      <span className="ml-1 font-medium">{s.breach_params.breach_depth_m} m</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Formation Time:</span>
                      <span className="ml-1 font-medium">{s.breach_params.formation_time_hr} hr</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Solver:</span>
                      <span className="ml-1 font-medium">{s.solver} v{s.solver_version}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEnqueue(s.id)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                    title="Run simulation"
                  >
                    <Play className="w-3 h-3" /> Run
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
