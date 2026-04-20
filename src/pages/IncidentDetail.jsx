import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Plus, Shield, AlertTriangle, FileText, Bell } from "lucide-react";
import { useIncidents } from "../context/IncidentContext";
import { incidentsAPI } from "../services/api";
import PostIncidentReview from "../components/incidents/PostIncidentReview";

const SEV_COLORS = { P1_CRITICAL: "#ef4444", P2_HIGH: "#f97316", P3_MEDIUM: "#f59e0b", P4_LOW: "#10b981" };
const STATUS_COLORS = { OPEN: "#ef4444", INVESTIGATING: "#f59e0b", CONTAINED: "#8b5cf6", RESOLVED: "#10b981", CLOSED: "#64748b", POST_REVIEW: "#06b6d4" };
const STATUS_FLOW = ["OPEN", "INVESTIGATING", "CONTAINED", "RESOLVED", "CLOSED"];
const EVENT_ICONS = { DETECTION: "🔍", ESCALATION: "⬆️", ACTION_TAKEN: "⚡", STATUS_CHANGE: "🔄", COMMUNICATION: "📢", RESOLUTION: "✅", NOTE: "📝" };

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedIncident, loadIncident, changeStatus } = useIncidents();
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [eventForm, setEventForm] = useState({ event_type: "ACTION_TAKEN", description: "" });

  useEffect(() => { if (id) loadIncident(id); }, [id]);

  if (!selectedIncident) return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading...</div>;

  const inc = selectedIncident;
  const timeline = inc.timeline || [];
  const currentIdx = STATUS_FLOW.indexOf(inc.status);

  const handleAddEvent = async () => {
    if (!eventForm.description) return;
    await incidentsAPI.addTimeline(id, eventForm);
    setEventForm({ event_type: "ACTION_TAKEN", description: "" });
    setShowAddEvent(false);
    loadIncident(id);
  };

  const handleStatusChange = async (status) => {
    await changeStatus(id, status);
    loadIncident(id);
  };

  const elapsed = () => {
    const hrs = Math.floor((Date.now() - new Date(inc.detected_at).getTime()) / 3600000);
    if (hrs < 24) return `${hrs} hours`;
    return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <button onClick={() => navigate("/incidents")} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", gap: 4, marginBottom: 12, fontSize: 13 }}>
        <ArrowLeft size={14} /> Back to Incidents
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontFamily: "monospace", color: "#64748b" }}>{inc.id}</span>
        <h1 style={{ color: "white", fontSize: 20, fontWeight: 800, margin: 0, flex: 1 }}>{inc.title}</h1>
        <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: `${SEV_COLORS[inc.severity]}20`, color: SEV_COLORS[inc.severity], fontWeight: 700 }}>{inc.severity}</span>
        <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 6, background: `${STATUS_COLORS[inc.status]}20`, color: STATUS_COLORS[inc.status], fontWeight: 700 }}>{inc.status}</span>
        <span style={{ fontSize: 12, color: "#f59e0b", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> {elapsed()}</span>
      </div>

      {/* Status Flow */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {STATUS_FLOW.map((s, i) => {
          const isActive = i <= currentIdx;
          const isCurrent = s === inc.status;
          const next = i === currentIdx + 1;
          return (
            <button key={s} onClick={() => next ? handleStatusChange(s) : null} disabled={!next} style={{
              flex: 1, padding: "8px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700,
              background: isActive ? `${STATUS_COLORS[s]}20` : "#1e293b",
              color: isActive ? STATUS_COLORS[s] : "#475569",
              border: isCurrent ? `2px solid ${STATUS_COLORS[s]}` : next ? `1px dashed ${STATUS_COLORS[s]}50` : "1px solid #334155",
              cursor: next ? "pointer" : "default",
              textTransform: "uppercase",
            }}>{s}</button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "60% 40%", gap: 20 }}>
        {/* LEFT — Timeline */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ color: "white", fontSize: 15, fontWeight: 700, margin: 0 }}>Timeline</h3>
            <button onClick={() => setShowAddEvent(true)} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "#06b6d415", color: "#06b6d4", border: "1px solid #06b6d430", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <Plus size={12} /> Add Event
            </button>
          </div>
          <div style={{ position: "relative", paddingLeft: 24 }}>
            <div style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 2, background: "#334155" }} />
            {timeline.map((evt, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 16, paddingLeft: 20 }}>
                <div style={{ position: "absolute", left: -20, top: 4, width: 18, height: 18, borderRadius: "50%", background: "#1e293b", border: "2px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                  {EVENT_ICONS[evt.event_type] || "📌"}
                </div>
                <div style={{ background: "#1e293b", borderRadius: 8, border: "1px solid #334155", padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", textTransform: "uppercase" }}>{evt.event_type.replace(/_/g, " ")}</span>
                    <span style={{ fontSize: 10, color: "#475569" }}>{new Date(evt.event_time).toLocaleString()}</span>
                  </div>
                  <p style={{ color: "#cbd5e1", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{evt.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Event Inline Form */}
          {showAddEvent && (
            <div style={{ background: "#1e293b", borderRadius: 8, border: "1px solid #334155", padding: 14, marginTop: 8 }}>
              <select value={eventForm.event_type} onChange={e => setEventForm({ ...eventForm, event_type: e.target.value })} style={{ width: "100%", padding: "6px 8px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 12, marginBottom: 8 }}>
                {["ACTION_TAKEN", "ESCALATION", "COMMUNICATION", "NOTE", "RESOLUTION"].map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
              <textarea value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Describe what happened..." rows={2} style={{ width: "100%", padding: "6px 8px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", fontSize: 12, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={handleAddEvent} style={{ padding: "6px 14px", borderRadius: 6, background: "#06b6d4", color: "white", fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer" }}>Add</button>
                <button onClick={() => setShowAddEvent(false)} style={{ padding: "6px 14px", borderRadius: 6, background: "#334155", color: "#94a3b8", fontWeight: 600, fontSize: 12, border: "none", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Cards */}
        <div>
          {/* Impact Assessment */}
          <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155", padding: 16, marginBottom: 16 }}>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase" }}>Impact Assessment</div>
            {[
              { label: "Financial Impact (SAR)", value: inc.estimated_financial_impact_sar ? Number(inc.estimated_financial_impact_sar).toLocaleString() : "—" },
              { label: "Data Records Affected", value: inc.data_records_affected || 0 },
              { label: "Service Downtime", value: inc.service_downtime_hours ? `${inc.service_downtime_hours}h` : "—" },
              { label: "Affected Systems", value: (() => { try { return JSON.parse(inc.affected_systems || "[]").length; } catch { return 0; } })() },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 3 ? "1px solid #0f172a" : "none" }}>
                <span style={{ color: "#64748b", fontSize: 12 }}>{item.label}</span>
                <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Linked Risks */}
          <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #334155", padding: 16, marginBottom: 16 }}>
            <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
              <Shield size={12} /> LINKED RISKS
            </div>
            {(inc.risk_links || []).length === 0 && <div style={{ color: "#475569", fontSize: 12 }}>No linked risks</div>}
            {(inc.risk_links || []).map((l, i) => (
              <div key={i} style={{ color: "#94a3b8", fontSize: 12, padding: "4px 0" }}>• {l.risk_id} ({l.link_type})</div>
            ))}
          </div>

          {/* Regulatory */}
          {inc.requires_regulatory_notification && (
            <div style={{ background: "#1e293b", borderRadius: 10, border: "1px solid #f59e0b30", padding: 16, marginBottom: 16 }}>
              <div style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 4 }}>
                <Bell size={12} /> REGULATORY NOTIFICATION
              </div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>Body: {inc.regulatory_body || "—"}</div>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>Deadline: {inc.notification_deadline ? new Date(inc.notification_deadline).toLocaleDateString() : "—"}</div>
              <div style={{ color: inc.notification_sent_at ? "#10b981" : "#ef4444", fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                {inc.notification_sent_at ? `Sent ${new Date(inc.notification_sent_at).toLocaleDateString()}` : "NOT YET SENT"}
              </div>
            </div>
          )}

          {/* Post-Incident Review */}
          {(inc.status === "CLOSED" || inc.status === "POST_REVIEW" || inc.review) && (
            <button onClick={() => setShowReview(true)} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "#06b6d415", color: "#06b6d4", fontWeight: 700, fontSize: 13, border: "1px solid #06b6d430", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <FileText size={14} /> {inc.review ? "View Review" : "Create Post-Incident Review"}
            </button>
          )}
        </div>
      </div>

      {showReview && <PostIncidentReview incidentId={id} existingReview={inc.review} onClose={() => { setShowReview(false); loadIncident(id); }} />}
    </div>
  );
}
