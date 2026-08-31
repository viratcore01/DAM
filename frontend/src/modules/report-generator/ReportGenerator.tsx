/**
 * DamSafe Twin — Report Generator
 * One-click PDF EAP / incident summary generation.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Eye, Printer, Globe, Clock } from 'lucide-react';
import { reportsApi } from '../../api/client';

export default function ReportGenerator() {
  const { t } = useTranslation();
  const [selectedRun, setSelectedRun] = useState('demo-run-001');
  const [format, setFormat] = useState<'pdf' | 'html'>('pdf');
  const [generating, setGenerating] = useState(false);

  const sampleReports = [
    {
      id: 'demo-run-001',
      scenario: 'Overtopping — Expected',
      generatedAt: '2026-08-31T14:30:00Z',
      pages: 12,
      size: '2.4 MB',
    },
    {
      id: 'demo-run-002',
      scenario: 'Piping — Conservative',
      generatedAt: '2026-08-31T14:35:00Z',
      pages: 14,
      size: '2.8 MB',
    },
  ];

  async function handleGenerate() {
    setGenerating(true);
    // Simulate generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGenerating(false);
    alert(`Report generated! In production, this would download a PDF.`);
  }

  function handleDownload() {
    const url = reportsApi.getPdfUrl(selectedRun);
    window.open(url, '_blank');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('nav.reportGenerator')}</h1>
        <p className="text-slate-500 mt-1">
          One-click EAP and incident summary report generation
        </p>
      </div>

      {/* Report Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          <FileText className="w-5 h-5 inline mr-2" />
          Generate Report
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Simulation Run</label>
            <select
              value={selectedRun}
              onChange={(e) => setSelectedRun(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              {sampleReports.map((r) => (
                <option key={r.id} value={r.id}>{r.scenario}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Output Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'pdf' | 'html')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="pdf">PDF Document</option>
              <option value="html">HTML (Interactive)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Language</label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="bilingual">Bilingual (EN + HI)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                {t('report.generatePdf')}
              </>
            )}
          </button>
          <button onClick={handleDownload} className="btn-success flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('report.downloadPdf')}
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {t('report.viewHtml')}
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Report Preview</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 min-h-[400px]">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">DamSafe Twin — Emergency Action Plan</h2>
              <p className="text-sm text-slate-500 mt-1">Machhu Dam (Demo — Morbi, Gujarat)</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-xs text-red-800">
                <strong>CLASSIFICATION:</strong> FOR OFFICIAL USE ONLY — EXERCISE DOCUMENT
              </p>
              <p className="text-xs text-red-700 mt-1">
                <strong>Prepared:</strong> 31 August 2026 | <strong>Prepared by:</strong> DamSafe Twin Automated System
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-slate-700">1. Dam Overview</h4>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div><span className="text-slate-500">Type:</span> Earthen Embankment</div>
                  <div><span className="text-slate-500">Height:</span> 35.0 m</div>
                  <div><span className="text-slate-500">Crest Length:</span> 1,600 m</div>
                  <div><span className="text-slate-500">Capacity:</span> 120 MCM</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700">2. Evacuation Priority (Top 3)</h4>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between"><span>1. Bhalbhal (5,000)</span><span className="text-red-600 font-bold">T+20 min | Score: 285.7</span></div>
                  <div className="flex justify-between"><span>2. Tankara (15,000)</span><span className="text-orange-600 font-bold">T+35 min | Score: 491.4</span></div>
                  <div className="flex justify-between"><span>3. Morbi City (210,000)</span><span className="text-yellow-600 font-bold">T+45 min | Score: 5250.0</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700">3. Response Actions</h4>
                <div className="mt-2 text-xs space-y-1">
                  <div>• Level 2: Activate EAP communication chain</div>
                  <div>• Level 2: Pre-position SDRF/NDRF teams</div>
                  <div>• Level 3: Execute full evacuation</div>
                  <div>• Level 3: Close all downstream roads</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 italic">
              This demonstration provides a planning and screening prototype. Operational use requires
              agency-authorized input data, calibrated model parameters, surveyed terrain/bathymetry,
              independent engineering review, and formal EAP approval.
            </div>
          </div>
        </div>
      </div>

      {/* Previous Reports */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Generated Reports</h3>
        <div className="space-y-3">
          {sampleReports.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-slate-800">{r.scenario}</div>
                  <div className="text-xs text-slate-500">
                    {r.pages} pages · {r.size} · {new Date(r.generatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs py-1">
                  <Download className="w-3 h-3 inline mr-1" /> Download
                </button>
                <button className="btn-secondary text-xs py-1">
                  <Printer className="w-3 h-3 inline mr-1" /> Print
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
