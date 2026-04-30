// ── API Client ────────────────────────────────────────────────────────────────
// Centralized HTTP client for all backend API calls.
// All Context providers should use these functions instead of holding seed data.

const BASE_URL = `${import.meta.env.VITE_API_URL || '/api'}/v1`;

/**
 * Get the stored JWT token
 */
function getToken() {
  return localStorage.getItem('grc_token');
}

/**
 * Store JWT token after login
 */
export function setToken(token) {
  localStorage.setItem('grc_token', token);
}

/**
 * Remove JWT token (logout)
 */
export function clearToken() {
  localStorage.removeItem('grc_token');
}

/**
 * Core fetch wrapper with auth headers and error handling
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle token expiry — skip for demo users to avoid cascading failures
  if (res.status === 401) {
    const isDemo = localStorage.getItem('isDemo') === 'true';
    if (!isDemo) {
      clearToken();
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  // Handle binary responses (PDF, Excel)
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('pdf') || contentType.includes('spreadsheet') || contentType.includes('octet-stream')) {
    return res.blob();
  }

  // Safely parse JSON (handle empty responses)
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

// ── Convenience methods ────────────────────────────────────────────────────────

export const api = {
  get:    (endpoint)       => request(endpoint, { method: 'GET' }),
  post:   (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch:  (endpoint, data) => request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  put:    (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint)       => request(endpoint, { method: 'DELETE' }),

  // Binary download helper
  download: async (endpoint, filename) => {
    const blob = await request(endpoint);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

// ── Auth API ───────────────────────────────────────────────────────────────────
export const authAPI = {
  login:   (email, password) => api.post('/auth/login', { email, password }),
  refresh: ()                => api.post('/auth/refresh', {}),
  me:      ()                => api.get('/auth/me'),
};

// ── Risks API ──────────────────────────────────────────────────────────────────
export const risksAPI = {
  list:       (params)      => api.get(`/risks?${new URLSearchParams(params).toString()}`),
  get:        (id)          => api.get(`/risks/${id}`),
  create:     (data)        => api.post('/risks', data),
  update:     (id, data)    => api.patch(`/risks/${id}`, data),
  archive:    (id)          => api.delete(`/risks/${id}`),
  getMatrix:  ()            => api.get('/risks/matrix'),
  addTreatment: (id, data)  => api.post(`/risks/${id}/treatments`, data),
  getAuditTrail: (id)       => api.get(`/risks/${id}/audit-trail`),
};

// ── BIA API ────────────────────────────────────────────────────────────────────
export const biaAPI = {
  listAssessments:    (params) => api.get(`/bia/assessments?${new URLSearchParams(params || {}).toString()}`),
  getAssessment:      (id)     => api.get(`/bia/assessments/${id}`),
  createAssessment:   (data)   => api.post('/bia/assessments', data),
  updateAssessment:   (id, d)  => api.patch(`/bia/assessments/${id}`, d),
  listProcesses:      (asmId)  => api.get(`/bia/processes?assessment_id=${asmId}`),
  createProcess:      (data)   => api.post('/bia/processes', data),
  updateProcess:      (id, d)  => api.patch(`/bia/processes/${id}`, d),
  deleteProcess:      (id)     => api.delete(`/bia/processes/${id}`),
  getImpactRatings:   (pId)    => api.get(`/bia/impact-ratings/${pId}`),
  upsertImpactRatings:(pId, r) => api.put(`/bia/impact-ratings/${pId}`, { ratings: r }),
  listDependencies:   (pId)    => api.get(`/bia/dependencies?process_id=${pId}`),
  createDependency:   (data)   => api.post('/bia/dependencies', data),
  deleteDependency:   (id)     => api.delete(`/bia/dependencies/${id}`),
  listStrategies:     (pId)    => api.get(`/bia/recovery-strategies?process_id=${pId}`),
  createStrategy:     (data)   => api.post('/bia/recovery-strategies', data),
  deleteStrategy:     (id)     => api.delete(`/bia/recovery-strategies/${id}`),
  listRiskLinks:      (pId)    => api.get(`/bia/risk-links?process_id=${pId}`),
  createRiskLink:     (data)   => api.post('/bia/risk-links', data),
  deleteRiskLink:     (id)     => api.delete(`/bia/risk-links/${id}`),
  consolidate:        (year)   => api.post(`/bia/consolidate/${year}`, {}),
};

// ── Workflow API ───────────────────────────────────────────────────────────────
export const workflowAPI = {
  submit:    (asmId)        => api.post(`/workflow/submit/${asmId}`, {}),
  approve:   (stepId, c)    => api.post(`/workflow/approve/${stepId}`, { comments: c }),
  reject:    (stepId, c)    => api.post(`/workflow/reject/${stepId}`, { comments: c }),
  getSteps:  (asmId)        => api.get(`/workflow/${asmId}`),
  escalate:  ()             => api.post('/workflow/escalate', {}),
};

// ── Sumood API ─────────────────────────────────────────────────────────────────
export const sumoodAPI = {
  getPillars:     ()              => api.get('/sumood/pillars'),
  getKPIs:        (compId)        => api.get(`/sumood/kpis/${compId}`),
  assess:         (data)          => api.post('/sumood/assess', data),
  assessBatch:    (entries)       => api.post('/sumood/assess/batch', { entries }),
  getScores:      (dept, year)    => api.get(`/sumood/scores/${dept}/${year}`),
  getGapAnalysis: (dept, year, t) => api.get(`/sumood/gap-analysis/${dept}/${year}?target=${t || 5}`),
};

// ── Reports API ────────────────────────────────────────────────────────────────
export const reportsAPI = {
  downloadRiskPDF:       () => api.download('/reports/risk-register/pdf', 'risk_register.pdf'),
  downloadRiskExcel:     () => api.download('/reports/risk-register/excel', 'risk_register.xlsx'),
  downloadBIAReport:     (y) => api.download(`/reports/bia-consolidated/pdf?year=${y}`, `bia_report_${y}.pdf`),
  downloadSumoodReport:  (d, y) => api.download(`/reports/sumood-dashboard/pdf?dept=${d}&year=${y}`, `sumood_${d}_${y}.pdf`),
};

// ── Audit API ──────────────────────────────────────────────────────────────────
export const auditAPI = {
  list: (params) => api.get(`/audit?${new URLSearchParams(params || {}).toString()}`),
};

// ── AI Agent API ───────────────────────────────────────────────────────────────
export const aiAPI = {
  createConversation:  (data)       => api.post('/ai/conversations', data),
  listConversations:   ()           => api.get('/ai/conversations'),
  getConversation:     (id)         => api.get(`/ai/conversations/${id}`),
  sendMessage:         (id, msg)    => api.post(`/ai/conversations/${id}/message`, { message: msg }),
  archiveConversation: (id)         => api.delete(`/ai/conversations/${id}`),
  listInsights:        (params)     => api.get(`/ai/insights?${new URLSearchParams(params || {}).toString()}`),
  updateInsight:       (id, data)   => api.patch(`/ai/insights/${id}`, data),
  analyzeRisks:        ()           => api.post('/ai/analyze/risks', {}),
  analyzeBIA:          ()           => api.post('/ai/analyze/bia', {}),
  analyzeSumood:       ()           => api.post('/ai/analyze/sumood', {}),
  analyzeCompliance:   ()           => api.post('/ai/analyze/compliance', {}),
  listScheduled:       ()           => api.get('/ai/scheduled'),
  createScheduled:     (data)       => api.post('/ai/scheduled', data),
  toggleScheduled:     (id, data)   => api.patch(`/ai/scheduled/${id}`, data),
  generateRisks:       (data)       => api.post('/ai/generate-risks', data),
};

// ── Vendors API ────────────────────────────────────────────────────────────────
export const vendorsAPI = {
  list:              (params)       => api.get(`/vendors?${new URLSearchParams(params || {}).toString()}`),
  get:               (id)           => api.get(`/vendors/${id}`),
  create:            (data)         => api.post('/vendors', data),
  update:            (id, data)     => api.patch(`/vendors/${id}`, data),
  remove:            (id)           => api.delete(`/vendors/${id}`),
  addAssessment:     (id, data)     => api.post(`/vendors/${id}/assessments`, data),
  getAssessments:    (id)           => api.get(`/vendors/${id}/assessments`),
  linkBIA:           (id, data)     => api.post(`/vendors/${id}/link-bia`, data),
  linkRisk:          (id, data)     => api.post(`/vendors/${id}/link-risk`, data),
  dashboard:         ()             => api.get('/vendors/dashboard'),
  expiring:          (days)         => api.get(`/vendors/expiring?days=${days || 30}`),
};

// ── Incidents API ──────────────────────────────────────────────────────────────
export const incidentsAPI = {
  list:              (params)       => api.get(`/incidents?${new URLSearchParams(params || {}).toString()}`),
  get:               (id)           => api.get(`/incidents/${id}`),
  create:            (data)         => api.post('/incidents', data),
  update:            (id, data)     => api.patch(`/incidents/${id}`, data),
  addTimeline:       (id, data)     => api.post(`/incidents/${id}/timeline`, data),
  getTimeline:       (id)           => api.get(`/incidents/${id}/timeline`),
  linkRisk:          (id, data)     => api.post(`/incidents/${id}/link-risk`, data),
  changeStatus:      (id, status)   => api.patch(`/incidents/${id}/status`, { status }),
  getReview:         (id)           => api.get(`/incidents/${id}/review`),
  createReview:      (id, data)     => api.post(`/incidents/${id}/review`, data),
  dashboard:         ()             => api.get('/incidents/dashboard'),
};

// ── Quantification API ─────────────────────────────────────────────────────────
export const quantificationAPI = {
  simulate:          (riskId, data) => api.post(`/quantification/simulate/${riskId}`, data),
  get:               (riskId)       => api.get(`/quantification/${riskId}`),
  list:              ()             => api.get('/quantification/'),
  runPortfolio:      (year)         => api.post(`/quantification/portfolio/${year}`, {}),
  getPortfolio:      (year)         => api.get(`/quantification/portfolio/${year}`),
};

// ── Regulatory API ─────────────────────────────────────────────────────────────
export const regulatoryAPI = {
  listUpdates:       (params)       => api.get(`/regulatory/updates?${new URLSearchParams(params || {}).toString()}`),
  createUpdate:      (data)         => api.post('/regulatory/updates', data),
  getUpdate:         (id)           => api.get(`/regulatory/updates/${id}`),
  updateUpdate:      (id, data)     => api.patch(`/regulatory/updates/${id}`, data),
  addAction:         (id, data)     => api.post(`/regulatory/updates/${id}/actions`, data),
  updateAction:      (id, data)     => api.patch(`/regulatory/actions/${id}`, data),
  dashboard:         ()             => api.get('/regulatory/dashboard'),
  bodies:            ()             => api.get('/regulatory/bodies'),
  calendar:          (days)         => api.get(`/regulatory/calendar?days=${days || 90}`),
};
