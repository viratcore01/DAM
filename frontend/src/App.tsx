/**
 * DamSafe Twin — App Root
 * Routes for all 6 frontend modules + 3D/2D viewers.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './modules/incident-console/Dashboard';
import IncidentConsole from './modules/incident-console/IncidentConsole';
import EapDashboard from './modules/eap-dashboard/EapDashboard';
import ScenarioManager from './modules/scenario-manager/ScenarioManager';
import AlertConsole from './modules/alert-console/AlertConsole';
import EvacuationPlanner from './modules/evacuation-planner/EvacuationPlanner';
import ReportGenerator from './modules/report-generator/ReportGenerator';
import AuditTrail from './modules/incident-console/AuditTrail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ErrorBoundary fallbackLabel="Dashboard Error"><Dashboard /></ErrorBoundary>} />
        <Route path="incident" element={<ErrorBoundary fallbackLabel="Incident Console Error"><IncidentConsole /></ErrorBoundary>} />
        <Route path="eap" element={<ErrorBoundary fallbackLabel="EAP Dashboard Error"><EapDashboard /></ErrorBoundary>} />
        <Route path="scenarios" element={<ErrorBoundary fallbackLabel="Scenario Manager Error"><ScenarioManager /></ErrorBoundary>} />
        <Route path="alerts" element={<ErrorBoundary fallbackLabel="Alert Console Error"><AlertConsole /></ErrorBoundary>} />
        <Route path="evacuation" element={<ErrorBoundary fallbackLabel="Evacuation Planner Error"><EvacuationPlanner /></ErrorBoundary>} />
        <Route path="reports" element={<ErrorBoundary fallbackLabel="Report Generator Error"><ReportGenerator /></ErrorBoundary>} />
        <Route path="audit" element={<ErrorBoundary fallbackLabel="Audit Trail Error"><AuditTrail /></ErrorBoundary>} />
      </Route>
    </Routes>
  );
}
