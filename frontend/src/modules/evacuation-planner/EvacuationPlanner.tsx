/**
 * DamSafe Twin — Evacuation Planner
 * Village-wise evacuation priority list, road passability, and shelter allocation.
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, MapPin, AlertTriangle, Car, Home, Clock, TrendingUp } from 'lucide-react';

const MOCK_PRIORITIES = [
  { village_name: 'Bhalbhal', population: 5000, arrival_time_min: 20, hazard_class: 'red', priority_score: 285.7, depth_m: 3.2, velocity_ms: 4.1 },
  { village_name: 'Jhinjhuwa', population: 3500, arrival_time_min: 25, hazard_class: 'red', priority_score: 168.0, depth_m: 2.8, velocity_ms: 3.5 },
  { village_name: 'Makkerha', population: 4200, arrival_time_min: 30, hazard_class: 'orange', priority_score: 152.4, depth_m: 2.1, velocity_ms: 2.8 },
  { village_name: 'Tankara', population: 15000, arrival_time_min: 35, hazard_class: 'orange', priority_score: 491.4, depth_m: 1.8, velocity_ms: 2.2 },
  { village_name: 'Muli', population: 12000, arrival_time_min: 40, hazard_class: 'yellow', priority_score: 320.0, depth_m: 1.2, velocity_ms: 1.5 },
  { village_name: 'Morbi City', population: 210000, arrival_time_min: 45, hazard_class: 'yellow', priority_score: 5250.0, depth_m: 0.8, velocity_ms: 1.0 },
  { village_name: 'Wankaner', population: 30000, arrival_time_min: 60, hazard_class: 'green', priority_score: 450.0, depth_m: 0.3, velocity_ms: 0.5 },
  { village_name: 'Halvad', population: 25000, arrival_time_min: 90, hazard_class: 'green', priority_score: 222.2, depth_m: 0.1, velocity_ms: 0.2 },
];

const MOCK_ROADS = [
  { name: 'NH-27 (Morbi-Rajkot)', status: 'safe', depth_m: 0.0, t: 0 },
  { name: 'SH-6 (Morbi-Tankara)', status: 'restricted', depth_m: 0.4, t: 0 },
  { name: 'Morbi-Wankaner Road', status: 'safe', depth_m: 0.1, t: 0 },
];

const SHELTERS = [
  { name: 'Morbi Stadium', capacity: 5000, distance_km: 2.5 },
  { name: 'Government School Complex', capacity: 2000, distance_km: 3.1 },
  { name: 'Community Hall Tankara', capacity: 1500, distance_km: 8.2 },
];

export default function EvacuationPlanner() {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<'priority' | 'arrival' | 'population'>('priority');

  const sorted = useMemo(() => {
    const list = [...MOCK_PRIORITIES];
    switch (sortBy) {
      case 'arrival': return list.sort((a, b) => a.arrival_time_min - b.arrival_time_min);
      case 'population': return list.sort((a, b) => b.population - a.population);
      default: return list.sort((a, b) => b.priority_score - a.priority_score);
    }
  }, [sortBy]);

  const totalPopulation = MOCK_PRIORITIES.reduce((sum, v) => sum + v.population, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('nav.evacuationPlanner')}</h1>
        <p className="text-slate-500 mt-1">
          Ranked evacuation priorities, road status, and shelter capacity
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-slate-500">Total Population at Risk</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{totalPopulation.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-500">Earliest Arrival</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">T+{MOCK_PRIORITIES[0].arrival_time_min} min</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-500">Shelter Capacity</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {SHELTERS.reduce((sum, s) => sum + s.capacity, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Priority List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            <Users className="w-5 h-5 inline mr-2" />
            Evacuation Priority Ranking
          </h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
          >
            <option value="priority">Sort by Priority Score</option>
            <option value="arrival">Sort by Arrival Time</option>
            <option value="population">Sort by Population</option>
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">#</th>
              <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Village</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Population</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Arrival (min)</th>
              <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Hazard</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Depth (m)</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Velocity (m/s)</th>
              <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Priority Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v, i) => (
              <tr key={v.village_name} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-3 text-sm font-bold text-slate-600">{i + 1}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-slate-800">{v.village_name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-sm text-right text-slate-700">{v.population.toLocaleString()}</td>
                <td className="px-3 py-3 text-sm text-right font-mono">
                  <span className={v.arrival_time_min <= 30 ? 'text-red-600 font-bold' : v.arrival_time_min <= 60 ? 'text-orange-600' : 'text-slate-600'}>
                    T+{v.arrival_time_min}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`hazard-${v.hazard_class} px-2 py-1 rounded text-xs font-bold uppercase border`}>
                    {v.hazard_class}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-right text-slate-700">{v.depth_m}</td>
                <td className="px-3 py-3 text-sm text-right text-slate-700">{v.velocity_ms}</td>
                <td className="px-3 py-3 text-sm text-right font-bold">
                  <span className={
                    v.priority_score > 1000 ? 'priority-critical' :
                    v.priority_score > 300 ? 'priority-high' :
                    v.priority_score > 100 ? 'priority-medium' : 'priority-low'
                  }>
                    {v.priority_score.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Road Status + Shelters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            <Car className="w-5 h-5 inline mr-2" />
            Road Passability
          </h3>
          <div className="space-y-3">
            {MOCK_ROADS.map((r) => (
              <div key={r.name} className={`flex items-center justify-between p-3 rounded-lg road-${r.status}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    r.status === 'safe' ? 'bg-green-500' :
                    r.status === 'restricted' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium">{r.name}</span>
                </div>
                <span className="text-xs font-semibold uppercase">{r.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            <Home className="w-5 h-5 inline mr-2" />
            Shelter Capacity
          </h3>
          <div className="space-y-3">
            {SHELTERS.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-800">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.distance_km} km away</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-700">{s.capacity.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">capacity</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
