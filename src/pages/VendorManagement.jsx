import { useState, useEffect } from "react";
import { Building2, Plus, Search, Filter, BarChart3, Clock, X } from "lucide-react";
import { useVendors } from "../context/VendorContext";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import VendorDetailDrawer from "../components/tprm/VendorDetailDrawer";
import VendorAssessmentForm from "../components/tprm/VendorAssessmentForm";

const TIER_COLORS = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#10b981" };
const CATEGORY_LABELS = { IT_SERVICES: "IT Services", CLOUD_PROVIDER: "Cloud", CONSULTING: "Consulting", HARDWARE: "Hardware", TELECOM: "Telecom", FACILITIES: "Facilities", FINANCIAL: "Financial", OTHER: "Other" };
const STATUS_COLORS = { ACTIVE: "#10b981", UNDER_REVIEW: "#f59e0b", SUSPENDED: "#ef4444", TERMINATED: "#64748b" };

export default function VendorManagement() {
  const { vendors, dashboard, loading, loadVendors, loadDashboard, createVendor, loadVendor, selectedVendor, setSelectedVendor } = useVendors();
  const [tab, setTab] = useState("vendors");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssessment, setShowAssessment] = useState(null);
  const [filters, setFilters] = useState({});
  const [form, setForm] = useState({ vendor_name: "", category: "IT_SERVICES", contact_name: "", contact_email: "", contract_value_sar: "" });

  useEffect(() => { loadVendors(filters); loadDashboard(); }, []);

  const handleCreate = async () => {
    if (!form.vendor_name) return;
    await createVendor(form);
    setShowAddModal(false);
    setForm({ vendor_name: "", category: "IT_SERVICES", contact_name: "", contact_email: "", contract_value_sar: "" });
  };

  const tabs = [
    { id: "vendors", label: "All Vendors" },
    { id: "dashboard", label: "Risk Dashboard" },
    { id: "expiring", label: "Expiring Contracts" },
  ];

  const tierPieData = dashboard?.by_tier?.map(t => ({ name: t.risk_tier || "Unassessed", value: parseInt(t.count) })) || [];

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Building2 size={22} style={{ color: "#f59e0b" }} />
          <h1 style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 800, margin: 0 }}>Vendor Risk Management</h1>
          <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "#f59e0b20", color: "#f59e0b", fontWeight: 600, fontFamily: "monospace" }}>TPRM</span>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: "10px 18px", borderRadius: 8, background: "linear-gradient(135deg, #06b6d4, #0891b2)",
          color: "white", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}><Plus size={14} /> Add Vendor</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg-card)", borderRadius: 10, padding: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: tab === t.id ? "rgba(6,182,212,0.15)" : "transparent",
            color: tab === t.id ? "#06b6d4" : "var(--text-tertiary)", border: "none", cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {/* All Vendors Tab */}
      {tab === "vendors" && (
        <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                  {["Vendor Name", "Category", "Risk Tier", "Contract End", "Data Access", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} onClick={() => loadVendor(v.id)} style={{ borderBottom: "1px solid var(--border-primary)", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{v.vendor_name}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{CATEGORY_LABELS[v.category] || v.category}</td>
                    <td style={{ padding: "12px 14px" }}>
                      {v.latest_risk_tier ? (
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: `${TIER_COLORS[v.latest_risk_tier]}20`, color: TIER_COLORS[v.latest_risk_tier], fontWeight: 600 }}>{v.latest_risk_tier}</span>
                      ) : <span style={{ fontSize: 11, color: "#475569" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#94a3b8" }}>{v.contract_end ? new Date(v.contract_end).toLocaleDateString() : "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#94a3b8" }}>{v.data_access_level}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: `${STATUS_COLORS[v.status] || "#64748b"}20`, color: STATUS_COLORS[v.status] || "#64748b", fontWeight: 600 }}>{v.status}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <button onClick={e => { e.stopPropagation(); setShowAssessment(v.id); }} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, background: "#06b6d415", color: "#06b6d4", border: "1px solid #06b6d430", cursor: "pointer", fontWeight: 600 }}>Assess</button>
                    </td>
                  </tr>
                ))}
                {vendors.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--text-tertiary)", fontSize: 13 }}>No vendors found. Add your first vendor.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dashboard Tab */}
      {tab === "dashboard" && dashboard && (
        <div>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Total Vendors", value: dashboard.total_vendors, color: "#06b6d4" },
              { label: "Critical Tier", value: dashboard.by_tier?.find(t => t.risk_tier === "CRITICAL")?.count || 0, color: "#ef4444" },
              { label: "Expiring Contracts (30d)", value: dashboard.expiring_contracts_30d, color: "#f59e0b" },
              { label: "Avg Risk Score", value: dashboard.average_risk_score || "—", color: "#10b981" },
            ].map((card, i) => (
              <div key={i} className="stat-card">
                <div style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{card.label}</div>
                <div style={{ color: card.color, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{card.value}</div>
              </div>
            ))}
          </div>
          {/* Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Vendors by Risk Tier</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={tierPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {tierPieData.map((entry, i) => <Cell key={i} fill={TIER_COLORS[entry.name] || "#64748b"} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Top Risk Vendors</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={vendors.filter(v => v.latest_overall_score).sort((a, b) => (a.latest_overall_score || 0) - (b.latest_overall_score || 0)).slice(0, 8)}>
                  <XAxis dataKey="vendor_name" tick={{ fontSize: 10, fill: "#64748b" }} angle={-15} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }} />
                  <Bar dataKey="latest_overall_score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Expiring Tab */}
      {tab === "expiring" && (
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Clock size={16} style={{ color: "#f59e0b" }} />
            <span style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 14 }}>Contracts Expiring Soon</span>
          </div>
          {vendors.filter(v => v.contract_end).sort((a, b) => new Date(a.contract_end) - new Date(b.contract_end)).map(v => {
            const daysLeft = Math.ceil((new Date(v.contract_end) - new Date()) / 86400000);
            const urgent = daysLeft <= 30;
            return (
              <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderBottom: "1px solid var(--border-primary)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: urgent ? "#ef4444" : "#f59e0b", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}>{v.vendor_name}</div>
                  <div style={{ color: "var(--text-tertiary)", fontSize: 11 }}>Expires {new Date(v.contract_end).toLocaleDateString()}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: urgent ? "#ef4444" : "#f59e0b" }}>{daysLeft > 0 ? `${daysLeft} days` : "Expired"}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="modal-backdrop" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-card" style={{ padding: 24, width: 480, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ color: "var(--text-primary)", fontSize: 16, fontWeight: 700, margin: 0 }}>Add New Vendor</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={18} /></button>
            </div>
            {[
              { key: "vendor_name", label: "Vendor Name", type: "text", required: true },
              { key: "category", label: "Category", type: "select", options: Object.entries(CATEGORY_LABELS) },
              { key: "contact_name", label: "Contact Name", type: "text" },
              { key: "contact_email", label: "Contact Email", type: "email" },
              { key: "contact_phone", label: "Phone", type: "text" },
              { key: "website", label: "Website", type: "text" },
              { key: "contract_value_sar", label: "Contract Value (SAR)", type: "number" },
              { key: "contract_start", label: "Contract Start", type: "date" },
              { key: "contract_end", label: "Contract End", type: "date" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>{f.label}{f.required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}</label>
                {f.type === "select" ? (
                  <select value={form[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13 }}>
                    {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={form[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
                )}
              </div>
            ))}
            <button onClick={handleCreate} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", marginTop: 8 }}>Create Vendor</button>
          </div>
        </div>
      )}

      {/* Assessment Modal */}
      {showAssessment && (
        <VendorAssessmentForm vendorId={showAssessment} onClose={() => { setShowAssessment(null); loadVendors(filters); }} />
      )}

      {/* Detail Drawer */}
      {selectedVendor && (
        <VendorDetailDrawer vendor={selectedVendor} onClose={() => setSelectedVendor(null)} onAssess={() => setShowAssessment(selectedVendor.id)} />
      )}
    </div>
  );
}
