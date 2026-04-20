// ─── React Query hooks for API calls ────────────────────────────────────────
// Use these hooks instead of manual fetch + useState/useEffect patterns.
// They provide automatic caching, deduplication, background refresh, and error handling.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '/api/v1';

// ─── Generic fetcher ────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API Error: ${res.status}`);
  }
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// RISKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useRisks(filters = {}) {
  return useQuery({
    queryKey: ['risks', filters],
    queryFn: () => apiFetch('/risks?' + new URLSearchParams(filters)),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRisk(id) {
  return useQuery({
    queryKey: ['risk', id],
    queryFn: () => apiFetch(`/risks/${id}`),
    enabled: !!id,
  });
}

export function useCreateRisk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiFetch('/risks', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['risks'] }),
  });
}

export function useUpdateRisk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiFetch(`/risks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['risk', vars.id] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIA ASSESSMENTS
// ═══════════════════════════════════════════════════════════════════════════════

export function useBIAAssessments() {
  return useQuery({
    queryKey: ['bia-assessments'],
    queryFn: () => apiFetch('/bia/assessments'),
  });
}

export function useBIAAssessment(id) {
  return useQuery({
    queryKey: ['bia-assessment', id],
    queryFn: () => apiFetch(`/bia/assessments/${id}`),
    enabled: !!id,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// BCP PLANS
// ═══════════════════════════════════════════════════════════════════════════════

export function useBCPPlans() {
  return useQuery({
    queryKey: ['bcp-plans'],
    queryFn: () => apiFetch('/bcp'),
  });
}

export function useCreateBCPPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiFetch('/bcp', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bcp-plans'] }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function useNotifications({ limit = 20, unreadOnly = false } = {}) {
  return useQuery({
    queryKey: ['notifications', { limit, unreadOnly }],
    queryFn: () => apiFetch(`/notifications?limit=${limit}&unreadOnly=${unreadOnly}`),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => apiFetch('/notifications/unread-count'),
    refetchInterval: 15000, // Poll every 15 seconds
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch('/notifications/read-all', { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// VENDORS
// ═══════════════════════════════════════════════════════════════════════════════

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: () => apiFetch('/tprm'),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// INCIDENTS
// ═══════════════════════════════════════════════════════════════════════════════

export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: () => apiFetch('/incidents'),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => fetch('/api/health').then(r => r.json()),
    refetchInterval: 60000,
    retry: 0,
  });
}
