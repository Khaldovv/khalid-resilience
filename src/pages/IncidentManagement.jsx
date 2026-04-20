import { useState, useEffect } from "react";
import { AlertTriangle, Plus, Search, X, Clock, FileText, BarChart3 } from "lucide-react";
import { useIncidents } from "../context/IncidentContext";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import PostIncidentReview from "../components/incidents/PostIncidentReview";

const SEV_COLORS = { P1_CRITICAL: "#ef4444", P2_HIGH: "#f97316", P3_MEDIUM: "#f59e0b", P4_LOW: "#10b981" };
const SEV_LABELS = { P1_CRITICAL: "P1 Critical", P2_HIGH: "P2 High", P3_MEDIUM: "P3 Medium", P4_LOW: "P4 Low" };
const STATUS_COLORS = { OPEN: "#ef4444", INVESTIGATING: "#f59e0b", CONTAINED: "#8b5cf6", RESOLVED: "#10b981", CLOSED: "#64748b", POST_REVIEW: "#06b6d4" };
const TYPE_LABELS = { CYBER_ATTACK: "Cyber Attack", SYSTEM_OUTAGE: "System Outage", DATA_BREACH: "Data Breach", NATURAL_DISASTER: "Natural Disaster", SUPPLY_CHAIN: "Supply Chain", OPERATIONAL_FAILURE: "Operational Failure", COMPLIANCE_VIOLATION: "Compliance Violation", OTHER: "Other" };

export default function IncidentManagement() {
  const { incidents, dashboard, loading, loadIncidents, loadDashboard, createIncident } = useIncidents();
  const navigate = useNavigate();
  const [tab, setTab] = useState("active");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", incident_type: "SYSTEM_OUTAGE", severity: "P3_MEDIUM", description: "" });

  useEffect(() => { loadIncidents(); loadDashboard(); }, []);

  const activeIncidents = incidents.filter(i => !["CLOSED", "RESOLVED"].includes(i.status));
  const tabs = [
    { id: "active", label: `Active (${activeIncidents.length})` },
    { id: "all", label: "All Incidents" },
    { id: "dashboard", label: "Dashboard" },
    { id: "reviews", label: "Post-Incident Reviews" },
  ];

  const handleCreate = async () => {
    if (!form.title) return;
    const res = await createIncident(form);
    if (res) { setShowCreate(false); setForm({ title: "", incident_type: "SYSTEM_OUTAGE", severity: "P3_MEDIUM", description: "" }); }
  };

  const elapsedTime = (detected) => {
    const hrs = Math.floor((Date.now() - new Date(detected).getTime()) / 3600000);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={22} style={{ color: "#ef4444" }} />
          <h1 style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 800, margin: 0 }}>Incident Management</h1>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding: "10px 18px", borderRadius: 8, background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Report Incident
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg-card)", borderRadius: 10, padding: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: tab === t.id ? "rgba(239,68,68,0.15)" : "transparent",
            color: tab === t.id ? "#ef4444" : "var(--text-tertiary)", border: "none", cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Active Incidents — Card Layout */}
      {tab === "active" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340, 1fr))", gap: 16 }}>
          {activeIncidents.map(inc => (
            <div key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)} className="glass-card" style={{
              borderColor: `${SEV_COLORS[inc.severity]}30`,
              padding: 16, cursor: "pointer", transition: "all 0.15s",
            }} onMouseEnter={e => e.currentTarget.style.borderColor = SEV_COLORS[inc.severity]} onMouseLeave={e => e.currentTarget.style.borderColor = `${SEV_COLORS[inc.severity]}30`}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{inc.id}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${SEV_COLORS[inc.severity]}20`, color: SEV_COLORS[inc.severity], fontWeight: 700 }}>{SEV_LABELS[inc.severity]}</span>
              </div>
              <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{inc.title}</div>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#64748b" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {elapsedTime(inc.detected_at)}</span>
                <span style={{ padding: "2px 6px", borderRadius: 4, background: `${STATUS_COLORS[inc.status]}20`, color: STATUS_COLORS[inc.status], fontWeight: 600 }}>{inc.status}</span>
              </div>
            </div>
          ))}
          {activeIncidents.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#10b981", fontSize: 14 }}>
              ✓ No active incidents
            </div>
          )}
        </div>
      )}

      {/* All Incidents — Table */}
      {tab === "all" && (
        <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                {["ID", "Title", "Type", "Severity", "Status", "Detected", "Elapsed"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => (
                <tr key={inc.id} onClick={() => navigate(`/incidents/${inc.id}`)} style={{ borderBottom: "1px solid var(--border-primary)", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--accent-primary)", fontFamily: "monospace" }}>{inc.id}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{inc.title}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{TYPE_LABELS[inc.incident_type] || inc.incident_type}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: `${SEV_COLORS[inc.severity]}20`, color: SEV_COLORS[inc.severity], fontWeight: 600 }}>{SEV_LABELS[inc.severity]}</span></td>
                  <td style={{ padding: "10px 14px" }}><span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: `${STATUS_COLORS[inc.status]}20`, color: STATUS_COLORS[inc.status], fontWeight: 600 }}>{inc.status}</span></td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8" }}>{new Date(inc.detected_at).toLocaleDateString()}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#f59e0b" }}>{elapsedTime(inc.detected_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dashboard */}
      {tab === "dashboard" && dashboard && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Open Incidents", value: dashboard.open_incidents, color: "#ef4444" },
              { label: "Avg Resolution (hrs)", value: dashboard.avg_resolution_hours || "—", color: "#f59e0b" },
              { label: "This Month", value: dashboard.incidents_this_month, color: "#06b6d4" },
              { label: "Pending Notifications", value: dashboard.pending_regulatory_notifications, color: "#8b5cf6" },
            ].map((c, i) => (
              <div key={i} className="stat-card">
                <div style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{c.label}</div>
                <div style={{ color: c.color, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{c.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>By Severity</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={(dashboard.by_severity || []).map(s => ({ name: SEV_LABELS[s.severity] || s.severity, value: parseInt(s.count) }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {(dashboard.by_severity || []).map((s, i) => <Cell key={i} fill={SEV_COLORS[s.severity] || "#64748b"} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Incidents by Type</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(incidents.reduce((acc, inc) => { acc[inc.incident_type] = (acc[inc.incident_type] || 0) + 1; return acc; }, {})).map(([k, v]) => ({ name: TYPE_LABELS[k] || k, count: v }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} angle={-20} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }} />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      {tab === "reviews" && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ color: "var(--text-tertiary)", fontSize: 13, textAlign: "center", padding: 20 }}>
            Post-incident reviews are available on individual incident detail pages.
          </div>
        </div>
      )}

      {/* Create Incident Modal */}
      {showCreate && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-card" style={{ padding: 24, width: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 700, margin: 0 }}>Report New Incident</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}><X size={18} /></button>
            </div>
            {[{ key: "title", label: "Title", type: "text" }].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>{f.label}<span style={{ color: "#ef4444", marginLeft: 2 }}>*</span></label>
                <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Type</label>
                <select value={form.incident_type} onChange={e => setForm({ ...form, incident_type: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13 }}>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Severity</label>
                <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13 }}>
                  {Object.entries(SEV_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <button onClick={handleCreate} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Report Incident</button>
          </div>
        </div>
      )}
    </div>
  );
}
