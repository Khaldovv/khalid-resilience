import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { aiAPI } from "../../services/api";

export default function AIInsightsBanner({ moduleFilter }) {
  const [count, setCount] = useState({ critical: 0, high: 0 });

  useEffect(() => {
    aiAPI.listInsights({ status: "NEW" }).then(res => {
      const insights = res.data || [];
      const filtered = moduleFilter
        ? insights.filter(i => {
            try {
              const entities = JSON.parse(i.affected_entities || "[]");
              return entities.some(e => e.entity_type === moduleFilter);
            } catch { return true; }
          })
        : insights;
      setCount({
        critical: filtered.filter(i => i.severity === "CRITICAL").length,
        high: filtered.filter(i => i.severity === "HIGH").length,
      });
    }).catch(() => {});
  }, [moduleFilter]);

  const total = count.critical + count.high;
  if (total === 0) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
      borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
      marginBottom: 12,
    }}>
      <AlertTriangle size={14} style={{ color: "#ef4444", flexShrink: 0 }} />
      <span style={{ color: "#fca5a5", fontSize: 12, fontWeight: 600 }}>
        AI Agent found {count.critical > 0 ? `${count.critical} critical` : ""}
        {count.critical > 0 && count.high > 0 ? " and " : ""}
        {count.high > 0 ? `${count.high} high-severity` : ""} anomalies
      </span>
      <a href="/ai-agent" style={{
        marginLeft: "auto", fontSize: 11, color: "#06b6d4", textDecoration: "none",
        fontWeight: 600,
      }}>
        View Details →
      </a>
    </div>
  );
}
