import { useState, useMemo } from "react";
import { useRisks } from "../context/RiskContext";
import { Filter, Eye, X, AlertTriangle, Shield } from "lucide-react";

// ─── Risk Matrix Colors ────────────────────────────────────────────────────────
const CELL_COLORS = {
  1:  { bg: "#064e3b", border: "#059669", label: "Very Low" },
  2:  { bg: "#064e3b", border: "#059669", label: "Very Low" },
  3:  { bg: "#365314", border: "#65a30d", label: "Low" },
  4:  { bg: "#365314", border: "#65a30d", label: "Low" },
  5:  { bg: "#854d0e", border: "#ca8a04", label: "Low" },
  6:  { bg: "#854d0e", border: "#ca8a04", label: "Medium" },
  8:  { bg: "#854d0e", border: "#ca8a04", label: "Medium" },
  9:  { bg: "#9a3412", border: "#ea580c", label: "Medium" },
  10: { bg: "#9a3412", border: "#ea580c", label: "Medium" },
  12: { bg: "#9a3412", border: "#ea580c", label: "High" },
  15: { bg: "#7f1d1d", border: "#dc2626", label: "High" },
  16: { bg: "#7f1d1d", border: "#dc2626", label: "High" },
  20: { bg: "#450a0a", border: "#ef4444", label: "Catastrophic" },
  25: { bg: "#450a0a", border: "#ef4444", label: "Catastrophic" },
};

function getCellColor(score) {
  if (score >= 20) return CELL_COLORS[25];
  if (score >= 15) return CELL_COLORS[15];
  if (score >= 10) return CELL_COLORS[10];
  if (score >= 5)  return CELL_COLORS[5];
  return CELL_COLORS[1];
}

const LABELS_EN = {
  title: "Interactive Risk Heat Map",
  subtitle: "5×5 Risk Assessment Matrix — ISO 31000 Compliant",
  likelihood: "Likelihood",
  impact: "Impact",
  levels: ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"],
  impactLevels: ["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"],
  allDepts: "All Departments",
  allTypes: "All Types",
  allStatuses: "All Statuses",
  noRisks: "No risks in this cell",
  risks: "risks",
  close: "Close",
  details: "Risk Details",
  confidence: "Confidence",
};

const LABELS_AR = {
  title: "خريطة المخاطر التفاعلية",
  subtitle: "مصفوفة تقييم المخاطر 5×5 — متوافقة مع ISO 31000",
  likelihood: "الاحتمالية",
  impact: "التأثير",
  levels: ["نادر", "غير محتمل", "ممكن", "محتمل", "شبه مؤكد"],
  impactLevels: ["ضئيل", "طفيف", "متوسط", "كبير", "كارثي"],
  allDepts: "جميع الإدارات",
  allTypes: "جميع الأنواع",
  allStatuses: "جميع الحالات",
  noRisks: "لا توجد مخاطر في هذه الخلية",
  risks: "مخاطر",
  close: "إغلاق",
  details: "تفاصيل المخاطر",
  confidence: "الثقة",
};

export default function RiskMatrix({ lang = "en" }) {
  const { risks } = useRisks();
  const isAr = lang === "ar";
  const t = isAr ? LABELS_AR : LABELS_EN;

  const [filterDept, setFilterDept] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedCell, setSelectedCell] = useState(null);

  // Unique values for filters
  const departments = useMemo(() => [...new Set(risks.map(r => r.department).filter(Boolean))], [risks]);
  const riskTypes = useMemo(() => [...new Set(risks.map(r => r.riskType || r.category).filter(Boolean))], [risks]);
  const statuses = useMemo(() => [...new Set(risks.map(r => r.lifecycleStatus || r.status).filter(Boolean))], [risks]);

  // Filtered risks
  const filtered = useMemo(() => {
    return risks.filter(r => {
      if (filterDept && r.department !== filterDept) return false;
      if (filterType && (r.riskType || r.category) !== filterType) return false;
      if (filterStatus && (r.lifecycleStatus || r.status) !== filterStatus) return false;
      return true;
    });
  }, [risks, filterDept, filterType, filterStatus]);

  // Build 5×5 matrix
  const matrix = useMemo(() => {
    const cells = {};
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        cells[`${l}-${i}`] = [];
      }
    }
    filtered.forEach(r => {
      const l = r.inherentLikelihood || Math.ceil((r.inherentScore || 1) / 5);
      const i = r.inherentImpact || Math.min(5, Math.ceil((r.inherentScore || 1) / l));
      const key = `${Math.min(5, Math.max(1, l))}-${Math.min(5, Math.max(1, i))}`;
      if (cells[key]) cells[key].push(r);
    });
    return cells;
  }, [filtered]);

  const selectStyle = {
    padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500,
    background: "rgba(15,23,42,0.9)", border: "1px solid #334155",
    color: "#e2e8f0", outline: "none", cursor: "pointer", minWidth: 130,
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={22} style={{ color: "#06b6d4" }} />
          {t.title}
        </h2>
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>{t.subtitle}</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <Filter size={14} style={{ color: "#64748b" }} />
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={selectStyle}>
          <option value="">{t.allDepts}</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}>
          <option value="">{t.allTypes}</option>
          {riskTypes.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="">{t.allStatuses}</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 11, color: "#64748b", marginInlineStart: "auto" }}>
          {filtered.length} {t.risks}
        </span>
      </div>

      {/* Matrix Grid */}
      <div style={{ display: "flex", gap: 0 }}>
        {/* Y Axis Label */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: 32, marginBottom: 44 }}>
          <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 2 }}>
            {t.likelihood}
          </span>
        </div>

        <div style={{ flex: 1 }}>
          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "40px repeat(5, 1fr)", gridTemplateRows: "repeat(5, 80px) 40px", gap: 3 }}>
            {/* Rows (likelihood 5 down to 1) */}
            {[5, 4, 3, 2, 1].map(likelihood => (
              <>
                {/* Y axis tick */}
                <div key={`y-${likelihood}`} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>{likelihood}</div>
                    <div style={{ fontSize: 7, color: "#64748b", lineHeight: 1.1 }}>{t.levels[likelihood - 1]}</div>
                  </div>
                </div>
                {/* Cells */}
                {[1, 2, 3, 4, 5].map(impact => {
                  const key = `${likelihood}-${impact}`;
                  const cellRisks = matrix[key] || [];
                  const score = likelihood * impact;
                  const color = getCellColor(score);
                  return (
                    <div
                      key={key}
                      onClick={() => cellRisks.length > 0 && setSelectedCell({ likelihood, impact, risks: cellRisks })}
                      style={{
                        background: color.bg,
                        border: `1px solid ${cellRisks.length > 0 ? color.border : '#1e293b'}`,
                        borderRadius: 8,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        cursor: cellRisks.length > 0 ? "pointer" : "default",
                        transition: "all 0.2s",
                        position: "relative",
                        ...(cellRisks.length > 0 && { boxShadow: `0 0 12px ${color.border}33` }),
                      }}
                      onMouseEnter={e => { if (cellRisks.length > 0) e.currentTarget.style.transform = "scale(1.05)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      {cellRisks.length > 0 ? (
                        <>
                          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{cellRisks.length}</div>
                          <div style={{ fontSize: 8, color: "#e2e8f0", opacity: 0.7 }}>{score}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: 10, color: "#475569", opacity: 0.5 }}>{score}</div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}

            {/* X axis spacer */}
            <div />
            {/* X axis ticks */}
            {[1, 2, 3, 4, 5].map(impact => (
              <div key={`x-${impact}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>{impact}</div>
                <div style={{ fontSize: 7, color: "#64748b" }}>{t.impactLevels[impact - 1]}</div>
              </div>
            ))}
          </div>

          {/* X Axis Label */}
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 2 }}>{t.impact}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
        {[
          { label: isAr ? "منخفض جداً" : "Very Low", color: "#064e3b" },
          { label: isAr ? "منخفض" : "Low", color: "#365314" },
          { label: isAr ? "متوسط" : "Medium", color: "#854d0e" },
          { label: isAr ? "عالي" : "High", color: "#9a3412" },
          { label: isAr ? "كارثي" : "Catastrophic", color: "#450a0a" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: item.color }} />
            <span style={{ fontSize: 10, color: "#94a3b8" }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Popup: Cell drilldown */}
      {selectedCell && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setSelectedCell(null)}>
          <div style={{
            background: "#0f172a", border: "1px solid #334155", borderRadius: 16,
            padding: 24, maxWidth: 500, width: "90%", maxHeight: "70vh", overflowY: "auto",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Eye size={16} style={{ color: "#06b6d4" }} />
                {t.details} ({t.likelihood}: {selectedCell.likelihood}, {t.impact}: {selectedCell.impact})
              </h3>
              <button onClick={() => setSelectedCell(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={18} />
              </button>
            </div>

            {selectedCell.risks.map((r, i) => (
              <div key={r.id || i} style={{
                background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b",
                borderRadius: 10, padding: 14, marginBottom: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "#06b6d4" }}>{r.id}</span>
                  <span style={{
                    fontSize: 9, padding: "2px 8px", borderRadius: 6,
                    background: r.inherentColor ? `${r.inherentColor}22` : "rgba(239,68,68,0.1)",
                    color: r.inherentColor || "#ef4444", fontWeight: 700,
                  }}>{r.inherentLabel || r.inherent || `Score: ${r.inherentScore}`}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{r.riskName}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 6 }}>{r.description?.slice(0, 120)}</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, color: "#64748b" }}>📂 {r.department || "—"}</span>
                  <span style={{ fontSize: 9, color: "#64748b" }}>🏷️ {r.riskType || r.category || "—"}</span>
                  <span style={{ fontSize: 9, color: "#64748b" }}>📊 {r.lifecycleStatus || r.status || "—"}</span>
                  {r.confidenceLevel && (
                    <span style={{ fontSize: 9, color: "#06b6d4" }}>🎯 {t.confidence}: {r.confidenceLevel}/5</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
