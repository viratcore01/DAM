/**
 * DamSafe Twin — EAP Dashboard
 * Planning/EAP mode: overview of all approved scenarios, EAP packages, and preparedness.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, CheckCircle, Clock, Lock, Map, AlertTriangle, FileText } from 'lucide-react';

export default function EapDashboard() {
  const { t } = useTranslation();

  const scenarios = [
    {
      id: '40000000-0000-0000-0000-000000000001',
      failureMode: 'overtopping',
      variant: 'expected',
      solver: 'educational_swe',
      status: 'approved',
      approvedBy: 'Demo Operator',
      approvedAt: '2026-08-31T12:00:00Z',
    },
    {
      id: '40000000-0000-0000-0000-000000000002',
      failureMode: 'piping',
      variant: 'conservative',
      solver: 'educational_swe',
      status: 'approved',
      approvedBy: 'Demo Operator',
      approvedAt: '2026-08-31T12:00:00Z',
    },
  ];

  const preparednessItems = [
    { label: 'Dam inventory loaded', status: true },
    { label: 'DEM preprocessing complete', status: true },
    { label: '≥2 breach scenarios precomputed', status: true },
    { label: 'Exposure data loaded (villages, roads, facilities)', status: true },
    { label: 'Evacuation priority lists generated', status: true },
    { label: 'PDF report template ready', status: true },
    { label: '3D digital twin configured', status: true },
    { label: 'Alert templates (EN + HI) ready', status: true },
  ];

  const statusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="w-4 h-4 text-slate-400" />;
      case 'submitted': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'locked': return <Lock className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('nav.eapDashboard')}</h1>
        <p className="text-slate-500 mt-1">
          Emergency Action Plan — Planning and preparedness overview
        </p>
      </div>

      {/* Scenario Ensemble */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          <Map className="w-5 h-5 inline mr-2" />
          Scenario Ensemble
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Failure Mode</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Variant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Solver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Approved By</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      s.failureMode === 'overtopping'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {s.failureMode === 'overtopping' ? '🌊' : '🕳️'}
                      {t(`scenario.${s.failureMode}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{s.variant}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.solver}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                      {statusIcon(s.status)}
                      <span className="capitalize">{s.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.approvedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preparedness Checklist */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          <Shield className="w-5 h-5 inline mr-2" />
          Preparedness Checklist
        </h3>
        <div className="space-y-3">
          {preparednessItems.map(({ label, status }) => (
            <div key={label} className="flex items-center gap-3">
              {status ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-slate-300 shrink-0" />
              )}
              <span className={`text-sm ${status ? 'text-slate-700' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Response Workflow Levels */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          <FileText className="w-5 h-5 inline mr-2" />
          Response Workflow Levels
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { level: 'Level 0', title: 'Preparedness', desc: 'Scenario creation → review → approval → EAP export', color: 'bg-green-50 border-green-200' },
            { level: 'Level 1', title: 'Abnormal', desc: 'Watch status, preload scenarios, verify contacts', color: 'bg-yellow-50 border-yellow-200' },
            { level: 'Level 2', title: 'Potential Breach', desc: 'Select conservative scenario, rank settlements', color: 'bg-orange-50 border-orange-200' },
            { level: 'Level 3', title: 'Confirmed Breach', desc: 'Lock parameters, minute-by-minute dashboard', color: 'bg-red-50 border-red-200' },
          ].map(({ level, title, desc, color }) => (
            <div key={level} className={`p-4 rounded-lg border ${color}`}>
              <div className="text-xs font-bold text-slate-500 uppercase">{level}</div>
              <div className="text-sm font-semibold text-slate-800 mt-1">{title}</div>
              <div className="text-xs text-slate-600 mt-2">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
