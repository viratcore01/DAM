/**
 * DamSafe Twin — Dashboard
 * Main landing page with system overview, key metrics, and quick links.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Shield, AlertTriangle, Map, Users, Activity, TrendingUp,
  Clock, Database, FileText, ChevronRight,
} from 'lucide-react';

interface DashboardStats {
  damCount: number;
  scenarioCount: number;
  activeSims: number;
  villageCount: number;
  facilityCount: number;
  recentAlerts: number;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    damCount: 1,
    scenarioCount: 2,
    activeSims: 0,
    villageCount: 8,
    facilityCount: 5,
    recentAlerts: 0,
  });

  const quickActions = [
    { label: 'Scenario Manager', path: '/scenarios', icon: Map, color: 'bg-blue-500' },
    { label: 'Alert Console', path: '/alerts', icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Evacuation Planner', path: '/evacuation', icon: Users, color: 'bg-green-500' },
    { label: 'Report Generator', path: '/reports', icon: FileText, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Command Centre</h1>
        <p className="text-slate-500 mt-1">
          DamSafe Twin — Dam Break Emergency Action Plan Platform
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Dams', value: stats.damCount, icon: Shield, color: 'text-blue-600' },
          { label: 'Scenarios', value: stats.scenarioCount, icon: Map, color: 'text-indigo-600' },
          { label: 'Active Simulations', value: stats.activeSims, icon: Activity, color: 'text-orange-500' },
          { label: 'Villages at Risk', value: stats.villageCount, icon: Users, color: 'text-red-600' },
          { label: 'Facilities', value: stats.facilityCount, icon: Database, color: 'text-teal-600' },
          { label: 'Recent Alerts', value: stats.recentAlerts, icon: AlertTriangle, color: 'text-yellow-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ label, path, icon: Icon, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <div className={`p-2 rounded-lg text-white ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-slate-700 group-hover:text-blue-600">
                  {label}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Study Dam */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Case Study Dam</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Name</span>
              <span className="text-sm font-medium">Machhu Dam (Demo — Morbi, Gujarat)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Type</span>
              <span className="text-sm font-medium">Earthen Embankment</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Height</span>
              <span className="text-sm font-medium">35.0 m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Crest Length</span>
              <span className="text-sm font-medium">1,600 m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Reservoir Capacity</span>
              <span className="text-sm font-medium">120 MCM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Available Scenarios</span>
              <span className="text-sm font-medium text-green-600">2 (Approved)</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">System Health</h3>
          <div className="space-y-3">
            {[
              { name: 'PostgreSQL + PostGIS', status: 'healthy', uptime: '99.9%' },
              { name: 'Redis (Celery Broker)', status: 'healthy', uptime: '99.9%' },
              { name: 'MinIO (Object Storage)', status: 'healthy', uptime: '99.8%' },
              { name: 'Celery Worker', status: 'idle', uptime: '99.7%' },
              { name: 'TiTiler (Tile Server)', status: 'healthy', uptime: '99.9%' },
              { name: 'FastAPI Backend', status: 'healthy', uptime: '100%' },
            ].map(({ name, status, uptime }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm text-slate-700">{name}</span>
                </div>
                <span className="text-xs text-slate-500">{uptime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800">{t('disclaimer.title')}</h4>
            <p className="text-xs text-amber-700 mt-1">{t('disclaimer.text')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
