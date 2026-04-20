import { useState } from "react";
import { X } from "lucide-react";
import { incidentsAPI } from "../../services/api";

export default function PostIncidentReview({ incidentId, existingReview, onClose }) {
  const r = existingReview || {};
  const [form, setForm] = useState({
    what_happened: r.what_happened || "",
    what_went_well: r.what_went_well || "",
    what_went_wrong: r.what_went_wrong || "",
    prevention_measures: r.prevention_measures || "",
    bcp_update_required: r.bcp_update_required || false,
    risk_register_update_required: r.risk_register_update_required || false,
    action_items: (() => { try { return JSON.parse(r.action_items || "[]"); } catch { return []; } })(),
  });
  const [saving, setSaving] = useState(false);

  const addActionItem = () => {
    setForm({ ...form, action_items: [...form.action_items, { description: "", deadline: "", status: "OPEN" }] });
  };

  const updateItem = (i, field, value) => {
    const items = [...form.action_items];
    items[i] = { ...items[i], [field]: value };
    setForm({ ...form, action_items: items });
  };

  const handleSave = async (status = "DRAFT") => {
    setSaving(true);
    try {
      await incidentsAPI.createReview(incidentId, { ...form, status });
      onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", padding: 24, width: 600, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ color: "white", fontSize: 16, fontWeight: 700, margin: 0 }}>Post-Incident Review</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={18} /></button>
        </div>

        {[
          { key: "what_happened", label: "What Happened" },
          { key: "what_went_well", label: "What Went Well" },
          { key: "what_went_wrong", label: "What Went Wrong" },
          { key: "prevention_measures", label: "Prevention Measures" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>{f.label}</label>
            <textarea value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} rows={3} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
        ))}

        {/* Action Items */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>Action Items</label>
            <button onClick={addActionItem} style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, background: "#06b6d415", color: "#06b6d4", border: "1px solid #06b6d430", cursor: "pointer" }}>+ Add</button>
          </div>
          {form.action_items.map((item, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 120px 90px", gap: 6, marginBottom: 6 }}>
              <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="Description" style={{ padding: "6px 8px", borderRadius: 4, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 12 }} />
              <input type="date" value={item.deadline} onChange={e => updateItem(i, "deadline", e.target.value)} style={{ padding: "6px 8px", borderRadius: 4, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 12 }} />
              <select value={item.status} onChange={e => updateItem(i, "status", e.target.value)} style={{ padding: "6px 4px", borderRadius: 4, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 11 }}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Done</option>
              </select>
            </div>
          ))}
        </div>

        {/* Checkboxes */}
        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <label style={{ color: "#94a3b8", fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={form.bcp_update_required} onChange={e => setForm({ ...form, bcp_update_required: e.target.checked })} style={{ accentColor: "#06b6d4" }} /> BCP Update Required
          </label>
          <label style={{ color: "#94a3b8", fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={form.risk_register_update_required} onChange={e => setForm({ ...form, risk_register_update_required: e.target.checked })} style={{ accentColor: "#06b6d4" }} /> Risk Register Update Required
          </label>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => handleSave("DRAFT")} disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#334155", color: "#e2e8f0", fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer" }}>Save as Draft</button>
          <button onClick={() => handleSave("FINAL")} disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "white", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>Finalize</button>
        </div>
      </div>
    </div>
  );
}
