import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, Eye, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { aiAPI } from "../../services/api";

const SEVERITY_CONFIG = {
  CRITICAL: { color: "#ef4444", bg: "#ef444415", label: "Critical" },
  HIGH:     { color: "#f97316", bg: "#f9731615", label: "High" },
  MEDIUM:   { color: "#f59e0b", bg: "#f59e0b15", label: "Medium" },
  LOW:      { color: "#06b6d4", bg: "#06b6d415", label: "Low" },
  INFO:     { color: "#64748b", bg: "#64748b15", label: "Info" },
};

const STATUS_CONFIG = {
  NEW:          { color: "#06b6d4", icon: Eye, label: "New" },
  ACKNOWLEDGED: { color: "#f59e0b", icon: Clock, label: "Acknowledged" },
  IN_PROGRESS:  { color: "#8b5cf6", icon: Clock, label: "In Progress" },
  RESOLVED:     { color: "#10b981", icon: CheckCircle, label: "Resolved" },
  DISMISSED:    { color: "#64748b", icon: XCircle, label: "Dismissed" },
};

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    aiAPI.listInsights({}).then(res => setInsights(res.data || [])).catch(() => {});
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await aiAPI.updateInsight(id, { status });
      setInsights(prev => prev.map(i => i.id === id ? res : i));
    } catch (e) { console.error(e); }
  };

  const filtered = filter === "all" ? insights : insights.filter(i => i.severity === filter);
  const grouped = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [], INFO: [] };
  filtered.forEach(i => { if (grouped[i.severity]) grouped[i.severity].push(i); });

  return (
    <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
      <div style={{
        padding: "14px 16px", borderBottom: "1px solid #334155",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} style={{ color: "#f59e0b" }} />
          <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>AI Insights</span>
          <span style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 10,
            background: "#ef444420", color: "#ef4444", fontWeight: 600,
          }}>
            {insights.filter(i => i.status === "NEW" && (i.severity === "CRITICAL" || i.severity === "HIGH")).length}
          </span>
        </div>
        <select
          value={filter} onChange={e => setFilter(e.target.value)}
          style={{
            padding: "4px 8px", borderRadius: 6, background: "#0f172a",
            border: "1px solid #334155", color: "#e2e8f0", fontSize: 11,
          }}
        >
          <option value="all">All</option>
          {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>
      <div style={{ maxHeight: 500, overflowY: "auto", padding: "8px" }}>
        {Object.entries(grouped).map(([sev, items]) => {
          if (items.length === 0) return null;
          const cfg = SEVERITY_CONFIG[sev];
          return (
            <div key={sev} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px" }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%", background: cfg.color,
                  boxShadow: `0 0 6px ${cfg.color}`,
                }} />
                <span style={{ color: cfg.color, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                  {cfg.label} ({items.length})
                </span>
              </div>
              {items.map(insight => {
                const isExpanded = expandedId === insight.id;
                const stCfg = STATUS_CONFIG[insight.status] || STATUS_CONFIG.NEW;
                const StIcon = stCfg.icon;
                const affected = (() => { try { return JSON.parse(insight.affected_entities || "[]"); } catch { return []; } })();
                const actions = (() => { try { return JSON.parse(insight.recommended_actions || "[]"); } catch { return []; } })();
                return (
                  <div key={insight.id} style={{
                    margin: "4px 0", borderRadius: 8, background: cfg.bg,
                    border: `1px solid ${cfg.color}20`, overflow: "hidden",
                  }}>
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                      style={{
                        padding: "10px 12px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      {isExpanded ? <ChevronDown size={14} style={{ color: "#64748b" }} /> : <ChevronRight size={14} style={{ color: "#64748b" }} />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{insight.title}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 10, color: "#64748b" }}>
                          <span>{affected.length} entities</span>
                          <span>•</span>
                          <span>{actions.length} actions</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, padding: "2px 6px", borderRadius: 4,
                        background: `${stCfg.color}20`, color: stCfg.color, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 3,
                      }}>
                        <StIcon size={10} /> {stCfg.label}
                      </span>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${cfg.color}20` }}>
                        <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, margin: "8px 0" }}>{insight.description}</p>
                        {actions.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ color: "#64748b", fontSize: 10, fontWeight: 700, marginBottom: 4 }}>RECOMMENDED ACTIONS</div>
                            {actions.map((a, i) => (
                              <div key={i} style={{ color: "#cbd5e1", fontSize: 12, padding: "2px 0", paddingLeft: 12, position: "relative" }}>
                                <span style={{ position: "absolute", left: 0, color: "#06b6d4" }}>→</span>
                                {a.action || a}
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                          {["ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "DISMISSED"].map(s => (
                            <button key={s} onClick={() => handleStatusUpdate(insight.id, s)} style={{
                              padding: "4px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                              background: `${STATUS_CONFIG[s].color}15`, color: STATUS_CONFIG[s].color,
                              border: `1px solid ${STATUS_CONFIG[s].color}30`, cursor: "pointer",
                            }}>{STATUS_CONFIG[s].label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: "#475569", fontSize: 13 }}>
            No insights available. Run an analysis to generate insights.
          </div>
        )}
      </div>
    </div>
  );
}
