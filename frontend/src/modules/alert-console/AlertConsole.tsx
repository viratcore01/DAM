/**
 * DamSafe Twin — Alert Console
 * Draft → Approve → Dispatch workflow with human authorization gate.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle, Send, CheckCircle, Clock, Shield, FileText, Globe,
} from 'lucide-react';
import { alertsApi } from '../../api/client';

export default function AlertConsole() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [severity, setSeverity] = useState<'watch' | 'warning' | 'emergency'>('warning');
  const [drafting, setDrafting] = useState(false);

  const sampleAlerts = [
    {
      id: 'alert-001',
      content: '⚠️ DAM BREAK WARNING — IMMEDIATE ACTION REQUIRED\n\nAffected villages (8 total):\n  • Morbi City (Pop: 210000) — Arrival: 45 min\n  • Tankara (Pop: 15000) — Arrival: 30 min\n  • Bhalbhal (Pop: 5000) — Arrival: 20 min\n\nEvacuate immediately. Move to designated safe zones.',
      language: 'en',
      severity: 'emergency',
      status: 'draft',
    },
    {
      id: 'alert-002',
      content: '⚠️ बांध टूटने की चेतावनी — तत्काल कार्रवाई आवश्यक\n\nप्रभावित गाँव (8 कुल):\n  • मोरबी शहर (जनसंख्या: 210000) — आगमन: 45 मिनट\n  • टंकारा (जनसंख्या: 15000) — आगमन: 30 मिनट\n\nतत्काल निकासी की व्यवस्था करें।',
      language: 'hi',
      severity: 'warning',
      status: 'approved',
    },
  ];

  const severityStyles: Record<string, string> = {
    watch: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    emergency: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('nav.alertConsole')}</h1>
          <p className="text-slate-500 mt-1">Alert lifecycle: Draft → Approve → Dispatch</p>
        </div>
        <button
          onClick={() => setDrafting(!drafting)}
          className="btn-danger flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" /> Draft Alert
        </button>
      </div>

      {/* Authorization Gate Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-pulse-danger">
        <Shield className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-red-800">{t('alert.approvalRequired')}</h4>
          <p className="text-xs text-red-600 mt-1">
            Alert dispatch requires human authorization. approved_by IS NOT NULL is enforced at the database level.
          </p>
        </div>
      </div>

      {/* Draft Form */}
      {drafting && (
        <div className="card border-red-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Draft New Alert</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="watch">Watch</option>
                <option value="warning">Warning</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Scenario</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                <option>Overtopping — Expected</option>
                <option>Piping — Conservative</option>
              </select>
            </div>
          </div>
          <button className="btn-danger" onClick={() => setDrafting(false)}>
            <FileText className="w-4 h-4 inline mr-2" />
            Auto-Generate Alert Content
          </button>
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-4">
        {sampleAlerts.map((alert) => (
          <div key={alert.id} className={`border rounded-lg p-4 ${severityStyles[alert.severity]}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  alert.severity === 'emergency' ? 'bg-red-200 text-red-900' :
                  alert.severity === 'warning' ? 'bg-orange-200 text-orange-900' :
                  'bg-yellow-200 text-yellow-900'
                }`}>
                  {alert.severity}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <Globe className="w-3 h-3" />
                  {alert.language === 'en' ? 'English' : 'हिन्दी'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  alert.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {alert.status === 'approved' ? '✓ Approved' : '⏳ Draft'}
                </span>
              </div>
              {alert.status === 'draft' && (
                <div className="flex gap-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-3 rounded-lg">
                    <CheckCircle className="w-3 h-3 inline mr-1" /> Approve
                  </button>
                </div>
              )}
              {alert.status === 'approved' && (
                <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-3 rounded-lg">
                  <Send className="w-3 h-3 inline mr-1" /> Dispatch
                </button>
              )}
            </div>
            <pre className="text-sm whitespace-pre-wrap font-sans">{alert.content}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
