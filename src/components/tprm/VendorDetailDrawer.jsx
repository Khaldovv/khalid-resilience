import { X, Building2, Shield, Link2, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const TIER_COLORS = { CRITICAL: "#ef4444", HIGH: "#f97316", MEDIUM: "#f59e0b", LOW: "#10b981" };

export default function VendorDetailDrawer({ vendor, onClose, onAssess }) {
  if (!vendor) return null;

  const assessments = vendor.assessments || [];
  const chartData = assessments.slice().reverse().map(a => ({
    date: new Date(a.created_at).toLocaleDateString(),
    score: Number(a.overall_score),
  }));

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 480, background: "#0f172a", borderLeft: "1px solid #334155", zIndex: 1000, overflowY: "auto", boxShadow: "-4px 0 24px rgba(0,0,0,0.4)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Building2 size={18} style={{ color: "#f59e0b" }} />
          <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{vendor.vendor_name}</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={18} /></button>
      </div>

      <div style={{ padding: 20 }}>
        {/* Contact Info */}
        <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155", padding: 16, marginBottom: 16 }}>
          <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>Contact Information</div>
          {[
            { label: "Contact", value: vendor.contact_name },
            { label: "Email", value: vendor.contact_email },
            { label: "Phone", value: vendor.contact_phone },
            { label: "Website", value: vendor.website },
            { label: "Country", value: vendor.country },
            { label: "Category", value: vendor.category },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < 5 ? "1px solid #0f172a" : "none" }}>
              <span style={{ color: "#64748b", fontSize: 12 }}>{item.label}</span>
              <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{item.value || "—"}</span>
            </div>
          ))}
        </div>

        {/* Contract Details */}
        <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155", padding: 16, marginBottom: 16 }}>
          <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>Contract</div>
          {[
            { label: "Value (SAR)", value: vendor.contract_value_sar ? Number(vendor.contract_value_sar).toLocaleString() : "—" },
            { label: "Start", value: vendor.contract_start ? new Date(vendor.contract_start).toLocaleDateString() : "—" },
            { label: "End", value: vendor.contract_end ? new Date(vendor.contract_end).toLocaleDateString() : "—" },
            { label: "Data Access", value: vendor.data_access_level },
            { label: "Offshore Data", value: vendor.hosts_data_offshore ? "Yes" : "No" },
            { label: "Critical", value: vendor.is_critical ? "Yes" : "No" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span style={{ color: "#64748b", fontSize: 12 }}>{item.label}</span>
              <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Assessment History Chart */}
        {chartData.length > 0 && (
          <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155", padding: 16, marginBottom: 16 }}>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>Assessment History</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }} />
                <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Linked Items */}
        {(vendor.bia_links?.length > 0 || vendor.risk_links?.length > 0) && (
          <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155", padding: 16, marginBottom: 16 }}>
            {vendor.bia_links?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                  <Link2 size={12} style={{ display: "inline", marginRight: 4 }} /> BIA Dependencies ({vendor.bia_links.length})
                </div>
                {vendor.bia_links.map((l, i) => (
                  <div key={i} style={{ color: "#94a3b8", fontSize: 12, padding: "2px 0" }}>• {l.dependency_id}</div>
                ))}
              </div>
            )}
            {vendor.risk_links?.length > 0 && (
              <div>
                <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                  <Shield size={12} style={{ display: "inline", marginRight: 4 }} /> Linked Risks ({vendor.risk_links.length})
                </div>
                {vendor.risk_links.map((l, i) => (
                  <div key={i} style={{ color: "#94a3b8", fontSize: 12, padding: "2px 0" }}>• {l.risk_id} ({l.link_type})</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onAssess} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "white", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>New Assessment</button>
        </div>
      </div>
    </div>
  );
}
