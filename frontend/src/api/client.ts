/**
 * DamSafe Twin — API Client
 * Centralized HTTP client for all backend API calls.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}/api/v1${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // In dev mode, send a dev bypass token
  if (import.meta.env.DEV) {
    headers['Authorization'] = 'Bearer dev-token';
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'No response body');
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ── Dams ──────────────────────────────────────────────────────────────────────

export const damsApi = {
  list: () => apiFetch<{ total: number; dams: any[] }>('/dams'),
  get: (id: string) => apiFetch<any>(`/dams/${id}`),
  create: (data: any) => apiFetch<any>('/dams', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Scenarios ─────────────────────────────────────────────────────────────────

export const scenariosApi = {
  list: (params?: { dam_id?: string; status?: string; failure_mode?: string }) => {
    const query = new URLSearchParams();
    if (params?.dam_id) query.set('dam_id', params.dam_id);
    if (params?.status) query.set('status', params.status);
    if (params?.failure_mode) query.set('failure_mode', params.failure_mode);
    const qs = query.toString();
    return apiFetch<any>(`/scenarios${qs ? '?' + qs : ''}`);
  },
  get: (id: string) => apiFetch<any>(`/scenarios/${id}`),
  create: (data: any) => apiFetch<any>('/scenarios', { method: 'POST', body: JSON.stringify(data) }),
  submit: (id: string) => apiFetch<any>(`/scenarios/${id}/submit`, { method: 'POST' }),
  approve: (id: string) => apiFetch<any>(`/scenarios/${id}/approve`, { method: 'POST' }),
  lock: (id: string) => apiFetch<any>(`/scenarios/${id}/lock`, { method: 'POST' }),
  getResults: (id: string) => apiFetch<any>(`/scenarios/${id}/results`),
};

// ── Simulation Runs ───────────────────────────────────────────────────────────

export const simRunsApi = {
  list: (params?: { scenario_id?: string; job_status?: string }) => {
    const query = new URLSearchParams();
    if (params?.scenario_id) query.set('scenario_id', params.scenario_id);
    if (params?.job_status) query.set('job_status', params.job_status);
    const qs = query.toString();
    return apiFetch<any>(`/sim-runs${qs ? '?' + qs : ''}`);
  },
  getStatus: (id: string) => apiFetch<any>(`/sim-runs/${id}/status`),
  enqueue: (scenarioId: string) =>
    apiFetch<any>(`/sim-runs/${scenarioId}/enqueue`, { method: 'POST' }),
};

// ── Impact Analysis ───────────────────────────────────────────────────────────

export const impactApi = {
  getPriorities: (simRunId: string) => apiFetch<any>(`/impact/${simRunId}/priority`),
  getRoadStatus: (simRunId: string, t: number = 0) =>
    apiFetch<any>(`/impact/${simRunId}/roads?t=${t}`),
  getHazard: (simRunId: string) => apiFetch<any>(`/impact/${simRunId}/hazard`),
  getFacilities: (simRunId: string) => apiFetch<any>(`/impact/${simRunId}/facilities`),
};

// ── Alerts ────────────────────────────────────────────────────────────────────

export const alertsApi = {
  draft: (simRunId: string, data: any) =>
    apiFetch<any>(`/alerts/${simRunId}/draft`, { method: 'POST', body: JSON.stringify(data) }),
  approve: (alertId: string) => apiFetch<any>(`/alerts/${alertId}/approve`, { method: 'POST' }),
  dispatch: (alertId: string) => apiFetch<any>(`/alerts/${alertId}/dispatch`, { method: 'POST' }),
  list: (params?: { sim_run_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.sim_run_id) query.set('sim_run_id', params.sim_run_id);
    const qs = query.toString();
    return apiFetch<any>(`/alerts/list${qs ? '?' + qs : ''}`);
  },
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const reportsApi = {
  getPdfUrl: (simRunId: string) => `${BASE_URL}/api/v1/reports/${simRunId}/pdf`,
  getHtml: (simRunId: string) => apiFetch<any>(`/reports/${simRunId}/html`),
};

// ── Audit ─────────────────────────────────────────────────────────────────────

export const auditApi = {
  list: (params?: { entity?: string; entity_id?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.entity) query.set('entity', params.entity);
    if (params?.entity_id) query.set('entity_id', params.entity_id);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const qs = query.toString();
    return apiFetch<any>(`/audit${qs ? '?' + qs : ''}`);
  },
};

// ── GIS ───────────────────────────────────────────────────────────────────────

export const gisApi = {
  getDemVersions: (damId: string) => apiFetch<any>(`/gis/dem/${damId}`),
  getManningsN: () => apiFetch<any>('/gis/mannings-n'),
};
