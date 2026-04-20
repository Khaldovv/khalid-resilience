import { useState } from "react";
import { X } from "lucide-react";
import { vendorsAPI } from "../../services/api";

const DIMS = [
  { key: "financial_stability_score", label: "Financial Stability" },
  { key: "cybersecurity_score", label: "Cybersecurity" },
  { key: "compliance_score", label: "Compliance" },
  { key: "operational_reliability_score", label: "Operational Reliability" },
  { key: "data_privacy_score", label: "Data Privacy" },
  { key: "business_continuity_score", label: "Business Continuity" },
];

function calcTier(avg) {
  if (avg <= 2) return { tier: "CRITICAL", color: "#ef4444" };
  if (avg <= 3) return { tier: "HIGH", color: "#f97316" };
  if (avg <= 4) return { tier: "MEDIUM", color: "#f59e0b" };
  return { tier: "LOW", color: "#10b981" };
}

export default function VendorAssessmentForm({ vendorId, onClose }) {
  const [scores, setScores] = useState({
    financial_stability_score: 3, cybersecurity_score: 3, compliance_score: 3,
    operational_reliability_score: 3, data_privacy_score: 3, business_continuity_score: 3,
  });
  const [notes, setNotes] = useState("");
  const [nextReview, setNextReview] = useState("");
  const [saving, setSaving] = useState(false);

  const values = Object.values(scores).filter(v => v != null);
  const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  const { tier, color } = calcTier(avg);

  const handleSave = async () => {
    setSaving(true);
    try {
      await vendorsAPI.addAssessment(vendorId, { ...scores, notes, next_review_date: nextReview || undefined });
      onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", padding: 24, width: 520, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: 0 }}>Risk Assessment</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={18} /></button>
        </div>

        {/* Overall Score */}
        <div style={{ textAlign: "center", padding: 16, background: "#0f172a", borderRadius: 10, marginBottom: 20 }}>
          <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Overall Risk Score</div>
          <div style={{ fontSize: 36, fontWeight: 800, color }}>{avg.toFixed(1)}</div>
          <span style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, background: `${color}20`, color, fontWeight: 700 }}>{tier}</span>
        </div>

        {/* Scoring Sliders */}
        {DIMS.map(dim => (
          <div key={dim.key} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{dim.label}</label>
              <span style={{ color: "#06b6d4", fontSize: 13, fontWeight: 700 }}>{scores[dim.key]}</span>
            </div>
            <input
              type="range" min={1} max={5} step={1}
              value={scores[dim.key]}
              onChange={e => setScores({ ...scores, [dim.key]: parseInt(e.target.value) })}
              style={{ width: "100%", accentColor: "#06b6d4" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#475569" }}>
              <span>Poor</span><span>Fair</span><span>Good</span><span>Very Good</span><span>Excellent</span>
            </div>
          </div>
        ))}

        {/* Notes */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>

        {/* Next Review */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>Next Review Date</label>
          <input type="date" value={nextReview} onChange={e => setNextReview(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13, boxSizing: "border-box" }} />
        </div>

        <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: saving ? "wait" : "pointer" }}>
          {saving ? "Saving..." : "Submit Assessment"}
        </button>
      </div>
    </div>
  );
}
