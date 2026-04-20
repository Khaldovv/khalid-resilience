import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api/v1/admin/ai';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  AI System Dashboard — Admin monitoring & configuration                   */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function AISystemDashboard() {
  const [config, setConfig] = useState(null);
  const [usage, setUsage] = useState(null);
  const [models, setModels] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState({ config: true, usage: true, models: true, test: false, clear: false });
  const [period, setPeriod] = useState('30days');

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(l => ({ ...l, config: true }));
      const res = await fetch(`${API_BASE}/config`, { headers: getAuthHeaders() });
      if (res.ok) setConfig(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(l => ({ ...l, config: false }));
    }
  }, []);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(l => ({ ...l, usage: true }));
      const res = await fetch(`${API_BASE}/usage?period=${period}`, { headers: getAuthHeaders() });
      if (res.ok) setUsage(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(l => ({ ...l, usage: false }));
    }
  }, [period]);

  const fetchModels = useCallback(async () => {
    try {
      setLoading(l => ({ ...l, models: true }));
      const res = await fetch(`${API_BASE}/models`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
      }
    } catch { /* ignore */ } finally {
      setLoading(l => ({ ...l, models: false }));
    }
  }, []);

  useEffect(() => { fetchConfig(); fetchModels(); }, [fetchConfig, fetchModels]);
  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  async function runTest() {
    setTestResult(null);
    setLoading(l => ({ ...l, test: true }));
    try {
      const res = await fetch(`${API_BASE}/test`, { method: 'POST', headers: getAuthHeaders() });
      setTestResult(await res.json());
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setLoading(l => ({ ...l, test: false }));
    }
  }

  async function clearCache() {
    setLoading(l => ({ ...l, clear: true }));
    try {
      await fetch(`${API_BASE}/cache/clear`, { method: 'POST', headers: getAuthHeaders() });
    } catch { /* ignore */ } finally {
      setLoading(l => ({ ...l, clear: false }));
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>⚡ AI System Dashboard</h1>
      <p style={styles.subtitle}>OpenRouter — Unified AI Service Monitor</p>

      {/* ── System Health ────────────────────────────────────────────── */}
      <div style={styles.grid}>
        <Card title="🟢 System Health" loading={loading.config}>
          {config && (
            <div>
              <Stat label="Provider" value={config.provider} />
              <Stat label="API Key" value={config.apiKeyConfigured ? '✅ Configured' : '❌ Missing'} />
              <Stat label="Primary Model" value={config.models?.primary} />
              <Stat label="Fast Model" value={config.models?.fast} />
              <Stat label="Fallback" value={config.models?.fallback} />
              <Stat label="Cache" value={config.cache?.enabled ? 'Enabled' : 'Disabled'} />
            </div>
          )}
        </Card>

        <Card title="🧪 Connection Test" loading={loading.test}>
          <button style={styles.btn} onClick={runTest} disabled={loading.test}>
            {loading.test ? 'Testing…' : 'Test AI Connection'}
          </button>
          {testResult && (
            <div style={{ marginTop: 12 }}>
              <Stat label="Status" value={testResult.success ? '✅ Connected' : '❌ Failed'} />
              {testResult.response && <Stat label="Response" value={testResult.response} />}
              {testResult.model && <Stat label="Model" value={testResult.model} />}
              {testResult.latencyMs && <Stat label="Latency" value={`${testResult.latencyMs}ms`} />}
              {testResult.error && <Stat label="Error" value={testResult.error} />}
            </div>
          )}
        </Card>
      </div>

      {/* ── Cost & Usage ─────────────────────────────────────────────── */}
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>💰 Cost & Usage</h2>
        <select style={styles.select} value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="24hours">Last 24 Hours</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>
      </div>

      <div style={styles.grid}>
        <Card title="Total Spend" loading={loading.usage}>
          {usage && (
            <div style={styles.bigNumbers}>
              <div>
                <span style={styles.bigNum}>${usage.totalCostUSD.toFixed(4)}</span>
                <span style={styles.label}>USD</span>
              </div>
              <div>
                <span style={styles.bigNum}>{usage.totalCostSAR.toFixed(2)}</span>
                <span style={styles.label}>SAR</span>
              </div>
              <div>
                <span style={styles.bigNum}>{usage.cacheHitRate.toFixed(1)}%</span>
                <span style={styles.label}>Cache Hit Rate</span>
              </div>
            </div>
          )}
        </Card>

        <Card title="Usage by Feature" loading={loading.usage}>
          {usage?.byFeature?.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Feature</th>
                  <th style={styles.th}>Calls</th>
                  <th style={styles.th}>Tokens</th>
                  <th style={styles.th}>Cost (USD)</th>
                  <th style={styles.th}>Avg Latency</th>
                </tr>
              </thead>
              <tbody>
                {usage.byFeature.map(f => (
                  <tr key={f.feature}>
                    <td style={styles.td}>{f.feature}</td>
                    <td style={styles.td}>{f.calls}</td>
                    <td style={styles.td}>{Number(f.tokens || 0).toLocaleString()}</td>
                    <td style={styles.td}>${Number(f.cost_usd || 0).toFixed(4)}</td>
                    <td style={styles.td}>{Number(f.avg_latency || 0).toFixed(0)}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={styles.emptyText}>No usage data for this period</p>
          )}
        </Card>
      </div>

      <div style={styles.grid}>
        <Card title="Usage by Model" loading={loading.usage}>
          {usage?.byModel?.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Model</th>
                  <th style={styles.th}>Calls</th>
                  <th style={styles.th}>Tokens</th>
                  <th style={styles.th}>Cost (USD)</th>
                </tr>
              </thead>
              <tbody>
                {usage.byModel.map(m => (
                  <tr key={m.model}>
                    <td style={styles.td}>{m.model}</td>
                    <td style={styles.td}>{m.calls}</td>
                    <td style={styles.td}>{Number(m.tokens || 0).toLocaleString()}</td>
                    <td style={styles.td}>${Number(m.cost_usd || 0).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={styles.emptyText}>No model usage data</p>
          )}
        </Card>

        <Card title="⚙️ Actions" loading={false}>
          <button style={styles.btn} onClick={clearCache} disabled={loading.clear}>
            {loading.clear ? 'Clearing…' : '🗑️ Clear AI Cache'}
          </button>
          <button style={{ ...styles.btn, marginTop: 8 }} onClick={() => { fetchUsage(); fetchConfig(); }}>
            🔄 Refresh Data
          </button>
        </Card>
      </div>

      {/* ── Available Models ─────────────────────────────────────────── */}
      <Card title={`🤖 Available Models (${models.length})`} loading={loading.models}>
        {models.length > 0 ? (
          <div style={styles.modelGrid}>
            {models.slice(0, 20).map(m => (
              <div key={m.id} style={styles.modelCard}>
                <div style={styles.modelName}>{m.id}</div>
                <div style={styles.modelMeta}>
                  Context: {m.context_length?.toLocaleString() || '?'} tokens
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.emptyText}>No models loaded — check API key</p>
        )}
      </Card>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function Card({ title, loading, children }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      {loading ? <p style={styles.loadingText}>Loading…</p> : children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.statRow}>
      <span style={styles.statLabel}>{label}</span>
      <span style={styles.statValue}>{value}</span>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const styles = {
  page: { padding: '24px 32px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#e2e8f0' },
  title: { fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4, marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16, marginBottom: 16 },
  card: { background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: 12, padding: '20px 24px', backdropFilter: 'blur(12px)' },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#cbd5e1', marginTop: 0, marginBottom: 16 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 600, color: '#f1f5f9', margin: 0 },
  select: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '6px 12px', fontSize: 13 },
  btn: { background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' },
  statRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' },
  statLabel: { fontSize: 13, color: '#94a3b8' },
  statValue: { fontSize: 13, fontWeight: 600, color: '#e2e8f0', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' },
  bigNumbers: { display: 'flex', gap: 24, flexWrap: 'wrap' },
  bigNum: { fontSize: 32, fontWeight: 700, color: '#22d3ee', display: 'block' },
  label: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #334155', color: '#94a3b8', fontWeight: 500, fontSize: 12 },
  td: { padding: '8px 12px', borderBottom: '1px solid rgba(148, 163, 184, 0.06)', color: '#cbd5e1' },
  emptyText: { fontSize: 13, color: '#64748b', fontStyle: 'italic' },
  loadingText: { fontSize: 13, color: '#64748b' },
  modelGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 },
  modelCard: { background: 'rgba(15, 23, 42, 0.5)', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(148, 163, 184, 0.06)' },
  modelName: { fontSize: 12, fontWeight: 600, color: '#a5b4fc', wordBreak: 'break-all' },
  modelMeta: { fontSize: 11, color: '#64748b', marginTop: 4 },
};
