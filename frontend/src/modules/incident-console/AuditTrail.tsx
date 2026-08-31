/**
 * DamSafe Twin — Audit Trail
 * Read-only view of the immutable audit log.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { auditApi } from '../../api/client';
import type { AuditEntry } from '../../types';

export default function AuditTrail() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [entityFilter, setEntityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 25;

  useEffect(() => {
    loadEntries();
  }, [page, entityFilter]);

  async function loadEntries() {
    setLoading(true);
    try {
      const data = await auditApi.list({
        entity: entityFilter || undefined,
        limit,
        offset: page * limit,
      });
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load audit log:', err);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('audit.title')}</h1>
        <p className="text-slate-500 mt-1">Immutable log of all system actions</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="">All Entities</option>
            <option value="scenario">Scenario</option>
            <option value="sim-run">Simulation Run</option>
            <option value="alert">Alert</option>
            <option value="dam">Dam</option>
          </select>
          <span className="text-sm text-slate-500">{total} total entries</span>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-slate-500">{t('common.loading')}</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-slate-500">{t('common.noData')}</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Entity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Entity ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actor</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                    {new Date(entry.at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{entry.entity}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 font-mono text-xs">
                    {entry.entity_id ? entry.entity_id.slice(0, 8) + '...' : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {entry.actor_id ? entry.actor_id.slice(0, 8) + '...' : 'System'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {page + 1} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * limit >= total}
              className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
