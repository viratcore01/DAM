/**
 * DamSafe Twin — Layout Component
 * App shell: sidebar navigation + top bar + content area.
 */

import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield, AlertTriangle, Map, Users, FileText, ClipboardList,
  LayoutDashboard, Settings, Globe, ChevronRight, Activity,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { path: '/incident', labelKey: 'nav.incidentConsole', icon: Activity },
  { path: '/eap', labelKey: 'nav.eapDashboard', icon: Shield },
  { path: '/scenarios', labelKey: 'nav.scenarioManager', icon: Map },
  { path: '/alerts', labelKey: 'nav.alertConsole', icon: AlertTriangle },
  { path: '/evacuation', labelKey: 'nav.evacuationPlanner', icon: Users },
  { path: '/reports', labelKey: 'nav.reportGenerator', icon: FileText },
  { path: '/audit', labelKey: 'nav.audit', icon: ClipboardList },
];

export default function Layout() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">DamSafe Twin</h1>
              <p className="text-xs text-slate-400">EAP Platform v1.0</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ path, labelKey, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{t(labelKey)}</span>
              {location.pathname === path && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Language Toggle */}
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Globe className="w-5 h-5" />
            <span>{i18n.language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">
              {t('nav.dashboard')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>System Online</span>
            </div>
            {/* User */}
            <div className="text-sm text-slate-600">
              <span className="font-medium">Dev Operator</span>
              <span className="ml-1 text-slate-400">| Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden p-0">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
