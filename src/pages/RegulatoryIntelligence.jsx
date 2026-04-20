import { useState, useEffect } from "react";
import { ScrollText, Plus, X, Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useRegulatory } from "../context/RegulatoryContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SEV_COLORS = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#10b981", INFO: "#64748b" };
const STATUS_COLORS = { NEW: "#06b6d4", UNDER_REVIEW: "#f59e0b", ACTION_REQUIRED: "#ef4444", COMPLIANT: "#10b981", NON_COMPLIANT: "#ef4444", ARCHIVED: "#64748b" };
const TYPE_LABELS = { NEW_REGULATION: "New Regulation", AMENDMENT: "Amendment", CIRCULAR: "Circular", GUIDELINE: "Guideline", ENFORCEMENT: "Enforcement" };

export default function RegulatoryIntelligence() {
  const { updates, dashboard, bodies, calendar, loading, loadUpdates, loadUpdate, createUpdate, loadBodies, loadDashboard, loadCalendar, selectedUpdate, setSelectedUpdate } = useRegulatory();
  const [tab, setTab] = useState("updates");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", update_type: "NEW_REGULATION", severity: "MEDIUM", description: "", regulatory_body_id: "" });

  useEffect(() => { loadUpdates(); loadBodies(); loadDashboard(); loadCalendar(90); }, []);

  const handleCreate = async () => {
    if (!form.title) return;
    await createUpdate(form);
    setShowCreate(false);
    setForm({ title: "", update_type: "NEW_REGULATION", severity: "MEDIUM", description: "", regulatory_body_id: "" });
  };

  const tabs = [
    { id: "updates", label: "Regulatory Updates" },
    { id: "dashboard", label: "Compliance Dashboard" },
    { id: "calendar", label: "Compliance Calendar" },
    { id: "bodies", label: "Regulatory Bodies" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ScrollText size={22} style={{ color: "#10b981" }} />
          <h1 style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 800, margin: 0 }}>Regulatory Intelligence</h1>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding: "10px 18px", borderRadius: 8, background: "linear-gradient(135deg, #10b981, #059669)", color: "white", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Add Update
        </button>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg-card)", borderRadius: 10, padding: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: tab === t.id ? "rgba(16,185,129,0.15)" : "transparent",
            color: tab === t.id ? "#10b981" : "var(--text-tertiary)", border: "none", cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Updates Tab */}
      {tab === "updates" && (
        <div>
          {updates.map(u => (
            <div key={u.id} onClick={() => loadUpdate(u.id)} className="glass-card" style={{
              padding: 16, marginBottom: 10, cursor: "pointer", transition: "all 0.15s",
            }} onMouseEnter={e => e.currentTarget.style.borderColor = "#10b981"} onMouseLeave={e => e.currentTarget.style.borderColor = "var(--glass-border)"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${SEV_COLORS[u.severity]}20`, color: SEV_COLORS[u.severity], fontWeight: 700 }}>{u.severity}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#334155", color: "#94a3b8" }}>{TYPE_LABELS[u.update_type] || u.update_type}</span>
                    {u.body_name_en && <span style={{ fontSize: 11, color: "#06b6d4" }}>{u.body_name_en}</span>}
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${STATUS_COLORS[u.status]}20`, color: STATUS_COLORS[u.status], fontWeight: 600 }}>{u.status}</span>
                  </div>
                  <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{u.title}</div>
                  {u.description && <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>{u.description?.slice(0, 200)}{u.description?.length > 200 ? "…" : ""}</div>}
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 100 }}>
                  <div style={{ color: "#475569", fontSize: 11 }}>{new Date(u.created_at).toLocaleDateString()}</div>
                  {u.compliance_deadline && (
                    <div style={{ color: new Date(u.compliance_deadline) < new Date() ? "#ef4444" : "#f59e0b", fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                      <Calendar size={10} style={{ display: "inline", marginRight: 3 }} />
                      {new Date(u.compliance_deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {updates.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 13 }}>No regulatory updates yet.</div>
          )}
        </div>
      )}

      {/* Dashboard */}
      {tab === "dashboard" && dashboard && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Updates This Year", value: dashboard.total_updates_this_year, color: "#06b6d4" },
              { label: "Compliance Rate", value: `${dashboard.compliance_rate_pct}%`, color: "#10b981" },
              { label: "Pending Review", value: dashboard.pending_review, color: "#f59e0b" },
              { label: "Overdue Actions", value: dashboard.overdue_action_items, color: "#ef4444" },
            ].map((c, i) => (
              <div key={i} className="stat-card">
                <div style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{c.label}</div>
                <div style={{ color: c.color, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{c.value}</div>
              </div>
            ))}
          </div>
          {/* Compliance Rate Gauge */}
          <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ width: 140, height: 140, borderRadius: "50%", margin: "0 auto 16px", background: `conic-gradient(#10b981 ${dashboard.compliance_rate_pct * 3.6}deg, #1e293b ${dashboard.compliance_rate_pct * 3.6}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 110, height: 110, borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#10b981", fontSize: 28, fontWeight: 800 }}>{dashboard.compliance_rate_pct}%</span>
              </div>
            </div>
            <div style={{ color: "#64748b", fontSize: 12 }}>Overall Compliance Rate</div>
          </div>
        </div>
      )}

      {/* Calendar */}
      {tab === "calendar" && calendar && (
        <div>
          <h3 style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Upcoming 90 Days</h3>
          {/* Compliance Deadlines */}
          <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 10 }}>COMPLIANCE DEADLINES</div>
            {(calendar.compliance_deadlines || []).map((d, i) => {
              const daysLeft = Math.ceil((new Date(d.compliance_deadline) - new Date()) / 86400000);
              const urgent = daysLeft <= 14;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #0f172a" }}>
                  <div style={{ width: 40, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: urgent ? "#ef4444" : "#06b6d4" }}>{new Date(d.compliance_deadline).getDate()}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{new Date(d.compliance_deadline).toLocaleString("default", { month: "short" })}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{d.title}</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>{d.body_name_en || "—"}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: urgent ? "#ef4444" : "#10b981" }}>{daysLeft > 0 ? `${daysLeft} days` : "Overdue"}</span>
                </div>
              );
            })}
            {(calendar.compliance_deadlines || []).length === 0 && <div style={{ color: "#475569", fontSize: 12 }}>No upcoming compliance deadlines</div>}
          </div>
          {/* Action Deadlines */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 10 }}>ACTION ITEM DEADLINES</div>
            {(calendar.action_deadlines || []).map((a, i) => {
              const daysLeft = Math.ceil((new Date(a.deadline) - new Date()) / 86400000);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #0f172a" }}>
                  <Clock size={14} style={{ color: daysLeft <= 7 ? "#ef4444" : "#f59e0b", flexShrink: 0 }} />
                  <div style={{ flex: 1, color: "#e2e8f0", fontSize: 12 }}>{a.description}</div>
                  <span style={{ fontSize: 11, color: daysLeft <= 7 ? "#ef4444" : "#f59e0b", fontWeight: 600 }}>{daysLeft}d left</span>
                </div>
              );
            })}
            {(calendar.action_deadlines || []).length === 0 && <div style={{ color: "#475569", fontSize: 12 }}>No pending action deadlines</div>}
          </div>
        </div>
      )}

      {/* Bodies */}
      {tab === "bodies" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300, 1fr))", gap: 16 }}>
          {bodies.map(b => (
            <div key={b.id} className="glass-card" style={{ padding: 16 }}>
              <div style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{b.name_en}</div>
              {b.name_ar && <div style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>{b.name_ar}</div>}
              <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>{b.jurisdiction}</div>
              {b.website_url && <a href={b.website_url} target="_blank" rel="noopener noreferrer" style={{ color: "#06b6d4", fontSize: 12 }}>{b.website_url}</a>}
            </div>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selectedUpdate && (
          <div className="modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 520, background: "var(--bg-base)", borderInlineStart: "1px solid var(--border-secondary)", overflowY: "auto" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 15 }}>{selectedUpdate.title}</span>
              <button onClick={() => setSelectedUpdate(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}><X size={18} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${SEV_COLORS[selectedUpdate.severity]}20`, color: SEV_COLORS[selectedUpdate.severity], fontWeight: 700 }}>{selectedUpdate.severity}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#334155", color: "#94a3b8" }}>{TYPE_LABELS[selectedUpdate.update_type] || selectedUpdate.update_type}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: `${STATUS_COLORS[selectedUpdate.status]}20`, color: STATUS_COLORS[selectedUpdate.status], fontWeight: 600 }}>{selectedUpdate.status}</span>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6, margin: "12px 0" }}>{selectedUpdate.description || "No description."}</p>
              {selectedUpdate.compliance_deadline && (
                <div style={{ background: "#1e293b", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>COMPLIANCE DEADLINE</div>
                  <div style={{ color: "#e2e8f0", fontSize: 14 }}>{new Date(selectedUpdate.compliance_deadline).toLocaleDateString()}</div>
                </div>
              )}
              {selectedUpdate.impact_summary && (
                <div style={{ background: "#1e293b", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ color: "#06b6d4", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>IMPACT SUMMARY</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>{selectedUpdate.impact_summary}</div>
                </div>
              )}
              {/* Action Items */}
              {selectedUpdate.action_items?.length > 0 && (
                <div style={{ background: "#1e293b", borderRadius: 8, padding: 12 }}>
                  <div style={{ color: "#8b5cf6", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>ACTION ITEMS ({selectedUpdate.action_items.length})</div>
                  {selectedUpdate.action_items.map((a, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #0f172a" }}>
                      <span style={{ color: "#cbd5e1", fontSize: 12, flex: 1 }}>{a.description}</span>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: a.status === "COMPLETED" ? "#10b98120" : "#f59e0b20", color: a.status === "COMPLETED" ? "#10b981" : "#f59e0b", fontWeight: 600 }}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-card" style={{ padding: 24, width: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 700, margin: 0 }}>Add Regulatory Update</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Type</label>
                <select value={form.update_type} onChange={e => setForm({ ...form, update_type: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 12 }}>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Severity</label>
                <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 12 }}>
                  {Object.keys(SEV_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Body</label>
                <select value={form.regulatory_body_id} onChange={e => setForm({ ...form, regulatory_body_id: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 12 }}>
                  <option value="">None</option>
                  {bodies.map(b => <option key={b.id} value={b.id}>{b.name_en}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <button onClick={handleCreate} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "linear-gradient(135deg, #10b981, #059669)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Create Update</button>
          </div>
        </div>
      )}
    </div>
  );
}
