import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRisks } from "../context/RiskContext";
import { useIncidents } from "../context/IncidentContext";
import { useVendors } from "../context/VendorContext";
import { useApp } from "../context/AppContext";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import {
  Shield, TrendingDown, TrendingUp, AlertTriangle, Building2,
  BarChart3, Target, Clock, CheckCircle2, XCircle, ArrowUpRight,
  ChevronRight, Download, Calendar, Activity, ArrowLeft
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

const RISK_COLORS = { Catastrophic: "#ef4444", High: "#f97316", Medium: "#f59e0b", Low: "#10b981" };

/* ═══ Inject responsive CSS once ═══ */
const STYLE_ID = "exec-briefing-responsive";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .exec-kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .exec-charts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .exec-bottom-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .exec-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .exec-action-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .exec-action-buttons {
      display: flex;
      gap: 8px;
    }
    @media (max-width: 900px) {
      .exec-kpi-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
      }
      .exec-charts-grid,
      .exec-bottom-grid {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }
      .exec-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .exec-action-banner {
        flex-direction: column;
        align-items: stretch !important;
      }
      .exec-action-buttons {
        width: 100%;
      }
      .exec-action-buttons button {
        flex: 1;
        justify-content: center;
      }
    }
    @media (max-width: 500px) {
      .exec-kpi-grid {
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default function ExecutiveBriefing() {
  const { language } = useApp();
  const navigate = useNavigate();
  const isAr = language === "ar";
  const { risks } = useRisks();
  const { incidents, loadIncidents } = useIncidents();
  const { vendors, loadVendors } = useVendors();
  const [period] = useState("monthly");

  // Auto-load incident and vendor data when entering this page
  useEffect(() => {
    loadIncidents();
    loadVendors();
  }, []);

  // ── Computed KPIs ───────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalRisks = risks.length;
    const catastrophic = risks.filter(r => (r.inherentScore || r.score || 0) >= 20).length;
    const high = risks.filter(r => { const s = r.inherentScore || r.score || 0; return s >= 15 && s < 20; }).length;
    const medium = risks.filter(r => { const s = r.inherentScore || r.score || 0; return s >= 8 && s < 15; }).length;
    const low = totalRisks - catastrophic - high - medium;
    const avgInherent = totalRisks > 0 ? Math.round(risks.reduce((a, r) => a + (r.inherentScore || r.score || 0), 0) / totalRisks * 10) / 10 : 0;
    const avgResidual = totalRisks > 0 ? Math.round(risks.reduce((a, r) => a + (r.residualScore || 0), 0) / totalRisks * 10) / 10 : 0;
    const mitigationRate = avgInherent > 0 ? Math.round((1 - avgResidual / avgInherent) * 100) : 0;

    const openIncidents = incidents.filter(i => !["CLOSED", "RESOLVED"].includes(i.status)).length;
    const criticalIncidents = incidents.filter(i => i.severity === "P1_CRITICAL" && !["CLOSED", "RESOLVED"].includes(i.status)).length;
    const totalVendors = vendors.length;
    const criticalVendors = vendors.filter(v => v.latest_risk_tier === "CRITICAL" || v.latest_risk_tier === "HIGH").length;

    return {
      totalRisks, catastrophic, high, medium, low,
      avgInherent, avgResidual, mitigationRate,
      openIncidents, criticalIncidents,
      totalVendors, criticalVendors,
      riskBySeverity: [
        { name: isAr ? "كارثية" : "Catastrophic", value: catastrophic, color: RISK_COLORS.Catastrophic },
        { name: isAr ? "عالية" : "High", value: high, color: RISK_COLORS.High },
        { name: isAr ? "متوسطة" : "Medium", value: medium, color: RISK_COLORS.Medium },
        { name: isAr ? "منخفضة" : "Low", value: low, color: RISK_COLORS.Low },
      ]
    };
  }, [risks, incidents, vendors, isAr]);

  // Compliance radar data
  const complianceData = [
    { subject: "ISO 31000", score: 87, fullMark: 100 },
    { subject: "ISO 22301", score: 82, fullMark: 100 },
    { subject: "NCA ECC", score: 91, fullMark: 100 },
    { subject: "SAMA BCM", score: 78, fullMark: 100 },
    { subject: isAr ? "صمود" : "Sumood", score: 80, fullMark: 100 },
    { subject: "PDPL", score: 75, fullMark: 100 },
  ];

  // Risk department breakdown
  const deptRisks = useMemo(() => {
    const deptMap = {};
    risks.forEach(r => {
      const dept = r.department || r.category || "Other";
      if (!deptMap[dept]) deptMap[dept] = { name: dept, total: 0, critical: 0 };
      deptMap[dept].total++;
      if ((r.inherentScore || r.score || 0) >= 20) deptMap[dept].critical++;
    });
    return Object.values(deptMap).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [risks]);

  const t = (en, ar) => isAr ? ar : en;

  // ── StatCard ────────────────────────────────────────────────────────────
  const StatCard = ({ label, value, subValue, icon: Icon, color, trend }) => (
    <div style={{
      background: "rgba(15,23,42,0.8)", border: "1px solid rgba(100,116,139,0.2)",
      borderRadius: 16, padding: "16px", position: "relative", overflow: "hidden", minWidth: 0,
    }}>
      <div style={{ position: "absolute", top: -10, [isAr ? "left" : "right"]: -10, opacity: 0.06 }}>
        <Icon size={60} />
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
        flexDirection: isAr ? "row-reverse" : "row",
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span style={{
          fontSize: 10, color: "#94a3b8", fontWeight: 600,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{label}</span>
      </div>
      <div style={{
        fontSize: 28, fontWeight: 900, color: "#f1f5f9",
        fontFamily: "monospace", direction: "ltr", textAlign: isAr ? "right" : "left",
      }}>{value}</div>
      {subValue && (
        <div style={{
          fontSize: 10, color: "#64748b", marginTop: 4,
          display: "flex", alignItems: "center", gap: 4,
          flexDirection: isAr ? "row-reverse" : "row",
          flexWrap: "wrap",
        }}>
          {trend === "up" && <TrendingUp size={12} style={{ color: "#ef4444", flexShrink: 0 }} />}
          {trend === "down" && <TrendingDown size={12} style={{ color: "#10b981", flexShrink: 0 }} />}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subValue}</span>
        </div>
      )}
    </div>
  );

  // ── ChartCard ───────────────────────────────────────────────────────────
  const ChartCard = ({ title, children }) => (
    <div style={{
      background: "rgba(15,23,42,0.8)", border: "1px solid rgba(100,116,139,0.2)",
      borderRadius: 16, padding: 20, minWidth: 0, overflow: "hidden",
    }}>
      <h3 style={{
        color: "#e2e8f0", fontSize: 14, fontWeight: 700,
        margin: "0 0 12px 0", textAlign: isAr ? "right" : "left",
      }}>{title}</h3>
      {children}
    </div>
  );

  // ── Custom Pie Label ────────────────────────────────────────────────────
  const renderPieLabel = ({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 18;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#94a3b8" textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central" fontSize={10} fontWeight={600}>
        {value}
      </text>
    );
  };

  return (
    <div style={{
      padding: "20px 24px", maxWidth: 1500, margin: "0 auto",
      direction: isAr ? "rtl" : "ltr",
    }}>

      {/* ═══ Header ═══ */}
      <div className="exec-header" style={{
        marginBottom: 24,
        flexDirection: isAr ? "row-reverse" : "row",
      }}>
        <div style={{ textAlign: isAr ? "right" : "left" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 4,
            flexDirection: isAr ? "row-reverse" : "row",
          }}>
            <Shield size={20} style={{ color: "#06b6d4" }} />
            <span style={{
              fontSize: 10, color: "#64748b", fontFamily: "monospace",
              letterSpacing: "1.5px", textTransform: "uppercase",
            }}>
              {t("EXECUTIVE RISK BRIEFING", "الإحاطة التنفيذية للمخاطر")}
            </span>
          </div>
          <h1 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 900, margin: 0 }}>
            {t("CEO View — Enterprise Risk Posture", "عرض الرئيس التنفيذي — الوضع المؤسسي للمخاطر")}
          </h1>
          <p style={{ color: "#64748b", fontSize: 11, marginTop: 4, fontFamily: "monospace" }}>
            {t("Generated:", "تاريخ الإنشاء:")} {new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US")} · {t("Period: Monthly", "الفترة: شهري")}
          </p>
        </div>
        <button onClick={async () => {
          const reportData = risks.map(r => ({
            id: r.id, name: r.riskName || r.risk_name || r.name,
            type: r.riskType || r.risk_type || r.category || '',
            dept: r.department || '', owner: r.owner || '',
            inherent: r.inherentScore || r.inherent_score || r.score || 0,
            residual: r.residualScore || r.residual_score || 0,
            status: r.lifecycleStatus || r.lifecycle_status || '',
          }));
          const cols = [
            { label: isAr ? 'رقم' : 'ID', accessor: 'id' },
            { label: isAr ? 'الخطر' : 'Risk', accessor: 'name' },
            { label: isAr ? 'النوع' : 'Type', accessor: 'type' },
            { label: isAr ? 'الإدارة' : 'Dept', accessor: 'dept' },
            { label: isAr ? 'الكامن' : 'Inherent', accessor: 'inherent' },
            { label: isAr ? 'المتبقي' : 'Residual', accessor: 'residual' },
            { label: isAr ? 'الحالة' : 'Status', accessor: 'status' },
          ];
          await exportToPDF(reportData, cols, 'executive-risk-briefing', {
            title: isAr ? 'الإحاطة التنفيذية للمخاطر' : 'Executive Risk Briefing',
            orientation: 'landscape',
          });
        }} style={{
          padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: "rgba(6,182,212,0.1)", color: "#06b6d4",
          border: "1px solid rgba(6,182,212,0.3)",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          <Download size={14} /> {t("Export PDF", "تصدير PDF")}
        </button>
      </div>

      {/* ═══ KPI Cards — CSS grid auto-adapts ═══ */}
      <div className="exec-kpi-grid" style={{ marginBottom: 20 }}>
        <StatCard label={t("Total Risks", "إجمالي المخاطر")} value={kpis.totalRisks}
          subValue={t(`${kpis.catastrophic} catastrophic`, `${kpis.catastrophic} كارثية`)}
          icon={BarChart3} color="#06b6d4" trend="up" />
        <StatCard label={t("Open Incidents", "حوادث مفتوحة")} value={kpis.openIncidents}
          subValue={t(`${kpis.criticalIncidents} critical`, `${kpis.criticalIncidents} حرجة`)}
          icon={AlertTriangle} color="#ef4444" trend={kpis.criticalIncidents > 0 ? "up" : "down"} />
        <StatCard label={t("Mitigation Rate", "معدل التخفيف")} value={`${kpis.mitigationRate}%`}
          subValue={t(`Inh: ${kpis.avgInherent} → Res: ${kpis.avgResidual}`, `كامن ${kpis.avgInherent} ← متبقي ${kpis.avgResidual}`)}
          icon={Target} color="#10b981" trend="down" />
        <StatCard label={t("Vendor Risk", "مخاطر الموردين")} value={`${kpis.criticalVendors}/${kpis.totalVendors}`}
          subValue={t("Critical/High vendors", "حرج/عالي")}
          icon={Building2} color="#f59e0b" trend={kpis.criticalVendors > 2 ? "up" : "down"} />
      </div>

      {/* ═══ Charts Row — CSS grid auto-adapts ═══ */}
      <div className="exec-charts-grid" style={{ marginBottom: 20 }}>

        {/* Risk Distribution Pie — use legend instead of labels */}
        <ChartCard title={t("Risk Distribution", "توزيع المخاطر")}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={kpis.riskBySeverity} cx="50%" cy="45%"
                outerRadius={65} innerRadius={35}
                dataKey="value" label={renderPieLabel} labelLine={false}>
                {kpis.riskBySeverity.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8, direction: isAr ? "rtl" : "ltr" }}
                formatter={(val) => <span style={{ color: "#94a3b8", marginInlineStart: 4 }}>{val}</span>}
              />
              <Tooltip contentStyle={{
                background: "#0f172a", border: "1px solid #334155",
                borderRadius: 8, color: "#e2e8f0", fontSize: 12,
              }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Compliance Radar */}
        <ChartCard title={t("Compliance Posture", "الوضع التنظيمي")}>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={complianceData} cx="50%" cy="50%">
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: "#475569" }} />
              <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Department Risk Bar */}
        <ChartCard title={t("Risks by Department", "المخاطر حسب الإدارة")}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptRisks} layout="vertical"
              margin={isAr ? { top: 0, right: 130, left: 16, bottom: 0 } : { top: 0, right: 16, left: 10, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} reversed={isAr} />
              <YAxis type="category" dataKey="name"
                orientation={isAr ? "right" : "left"}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                width={120}
                mirror={false}
                tickFormatter={(v) => v.length > 15 ? v.substring(0, 15) + '..' : v} />
              <Tooltip contentStyle={{
                background: "#0f172a", border: "1px solid #334155",
                borderRadius: 8, color: "#e2e8f0", fontSize: 12,
              }} />
              <Bar dataKey="total" fill="#06b6d4" radius={isAr ? [4, 0, 0, 4] : [0, 4, 4, 0]} name={t("Total", "إجمالي")} />
              <Bar dataKey="critical" fill="#ef4444" radius={isAr ? [4, 0, 0, 4] : [0, 4, 4, 0]} name={t("Critical", "حرجة")} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ═══ Bottom Row — CSS grid auto-adapts ═══ */}
      <div className="exec-bottom-grid">

        {/* Active Incidents */}
        <div style={{
          background: "rgba(15,23,42,0.8)", border: "1px solid rgba(100,116,139,0.2)",
          borderRadius: 16, padding: 20, minWidth: 0,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 12, flexDirection: isAr ? "row-reverse" : "row",
          }}>
            <h3 style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 6, flexDirection: isAr ? "row-reverse" : "row" }}>
              <AlertTriangle size={14} style={{ color: "#ef4444" }} />
              {t("Active Incidents", "الحوادث النشطة")}
            </h3>
            <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>
              {kpis.openIncidents} {t("open", "مفتوحة")}
            </span>
          </div>
          {incidents.filter(i => !["CLOSED", "RESOLVED"].includes(i.status)).slice(0, 5).map(inc => (
            <div key={inc.id} style={{
              padding: "10px 12px", borderRadius: 10, marginBottom: 8,
              background: "rgba(30,41,59,0.6)",
              border: `1px solid ${inc.severity === "P1_CRITICAL" ? "rgba(239,68,68,0.3)" : "rgba(100,116,139,0.15)"}`,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                flexDirection: isAr ? "row-reverse" : "row", gap: 8,
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: "#e2e8f0",
                  flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{inc.title}</span>
                <span style={{
                  fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                  background: inc.severity === "P1_CRITICAL" ? "rgba(239,68,68,0.15)" : "rgba(249,115,22,0.15)",
                  color: inc.severity === "P1_CRITICAL" ? "#ef4444" : "#f97316",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}>{inc.severity?.replace("_", " ")}</span>
              </div>
              <div style={{
                display: "flex", justifyContent: "space-between", marginTop: 6,
                flexDirection: isAr ? "row-reverse" : "row",
              }}>
                <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{inc.id}</span>
                <span style={{
                  fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 600,
                  background: "rgba(245,158,11,0.15)", color: "#f59e0b",
                }}>{inc.status}</span>
              </div>
            </div>
          ))}
          {incidents.filter(i => !["CLOSED", "RESOLVED"].includes(i.status)).length === 0 && (
            <div style={{ textAlign: "center", padding: 20, color: "#10b981", fontSize: 12 }}>
              <CheckCircle2 size={20} style={{ marginBottom: 4 }} /> {t("No active incidents", "لا توجد حوادث نشطة")}
            </div>
          )}
        </div>

        {/* Top Risks */}
        <div style={{
          background: "rgba(15,23,42,0.8)", border: "1px solid rgba(100,116,139,0.2)",
          borderRadius: 16, padding: 20, minWidth: 0,
        }}>
          <h3 style={{
            color: "#e2e8f0", fontSize: 14, fontWeight: 700,
            margin: "0 0 12px 0", textAlign: isAr ? "right" : "left",
          }}>
            {t("Top Risks — Executive Attention", "أعلى المخاطر — اهتمام تنفيذي")}
          </h3>
          {risks
            .filter(r => (r.inherentScore || r.score || 0) >= 20)
            .sort((a, b) => (b.inherentScore || b.score || 0) - (a.inherentScore || a.score || 0))
            .slice(0, 5)
            .map((r, i) => (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 0", borderBottom: "1px solid rgba(100,116,139,0.1)",
                flexDirection: isAr ? "row-reverse" : "row",
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6, display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                  background: "rgba(239,68,68,0.15)", color: "#ef4444",
                  fontSize: 11, fontWeight: 900, fontFamily: "monospace",
                }}>{i + 1}</span>
                <div style={{ flex: 1, textAlign: isAr ? "right" : "left", minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, color: "#e2e8f0",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{r.riskName || r.description}</div>
                  <div style={{
                    fontSize: 10, color: "#64748b",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{r.department || r.category} · {r.owner}</div>
                </div>
                <span style={{
                  fontSize: 16, fontWeight: 900, fontFamily: "monospace", flexShrink: 0,
                  color: (r.inherentScore || r.score || 0) >= 20 ? "#ef4444" : "#f59e0b",
                }}>{r.inherentScore || r.score}</span>
              </div>
            ))}
        </div>

        {/* Vendor Watchlist */}
        <div style={{
          background: "rgba(15,23,42,0.8)", border: "1px solid rgba(100,116,139,0.2)",
          borderRadius: 16, padding: 20, minWidth: 0,
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 12, flexDirection: isAr ? "row-reverse" : "row",
          }}>
            <h3 style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 6, flexDirection: isAr ? "row-reverse" : "row" }}>
              <Building2 size={14} style={{ color: "#f59e0b" }} />
              {t("Vendor Watch List", "قائمة مراقبة الموردين")}
            </h3>
          </div>
          {vendors
            .filter(v => v.latest_risk_tier === "CRITICAL" || v.latest_risk_tier === "HIGH")
            .slice(0, 5)
            .map(v => (
              <div key={v.id} style={{
                padding: "10px 12px", borderRadius: 10, marginBottom: 8,
                background: "rgba(30,41,59,0.6)",
                border: `1px solid ${v.latest_risk_tier === "CRITICAL" ? "rgba(239,68,68,0.3)" : "rgba(249,115,22,0.2)"}`,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  flexDirection: isAr ? "row-reverse" : "row", gap: 8,
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: "#e2e8f0",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    flex: 1, minWidth: 0,
                  }}>{v.vendor_name}</span>
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                    background: v.latest_risk_tier === "CRITICAL" ? "rgba(239,68,68,0.15)" : "rgba(249,115,22,0.15)",
                    color: v.latest_risk_tier === "CRITICAL" ? "#ef4444" : "#f97316",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}>{v.latest_risk_tier}</span>
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between", marginTop: 6,
                  fontSize: 10, color: "#64748b", flexDirection: isAr ? "row-reverse" : "row",
                }}>
                  <span>{v.category}</span>
                  <span style={{ fontFamily: "monospace" }}>{t("Score:", "الدرجة:")} {v.latest_overall_score}/5.0</span>
                </div>
              </div>
            ))}
          {vendors.filter(v => v.latest_risk_tier === "CRITICAL" || v.latest_risk_tier === "HIGH").length === 0 && (
            <div style={{ textAlign: "center", padding: 20, color: "#10b981", fontSize: 12 }}>
              <CheckCircle2 size={20} style={{ marginBottom: 4 }} /> {t("No critical vendors", "لا يوجد موردون حرجون")}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Executive Actions Banner ═══ */}
      <div className="exec-action-banner" style={{
        marginTop: 20, padding: "16px 20px", borderRadius: 16,
        background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1))",
        border: "1px solid rgba(6,182,212,0.2)",
        flexDirection: isAr ? "row-reverse" : "row",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          flexDirection: isAr ? "row-reverse" : "row",
        }}>
          <Activity size={18} style={{ color: "#06b6d4", flexShrink: 0 }} />
          <div style={{ textAlign: isAr ? "right" : "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
              {t("Executive Action Required", "إجراء تنفيذي مطلوب")}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
              {t(
                `${kpis.catastrophic} catastrophic risks • ${kpis.criticalIncidents} critical incidents • ${kpis.criticalVendors} high-risk vendors`,
                `${kpis.catastrophic} مخاطر كارثية • ${kpis.criticalIncidents} حوادث حرجة • ${kpis.criticalVendors} موردين عالي الخطورة`
              )}
            </div>
          </div>
        </div>
        <div className="exec-action-buttons">
          <button onClick={() => navigate('/erm?filter=critical')} style={{
            padding: "8px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)",
            display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
          }}>
            {t("Review Risks", "مراجعة المخاطر")} <ChevronRight size={12} />
          </button>
          <button onClick={async () => {
            const reportData = [
              ...risks.filter(r => (r.inherentScore || r.score || 0) >= 15).map(r => ({
                section: isAr ? 'أعلى المخاطر' : 'Top Risks',
                title: r.riskName || r.risk_name || r.name,
                score: `${r.inherentScore || r.score}/25`,
                status: r.lifecycleStatus || r.lifecycle_status || '',
              })),
              ...incidents.filter(i => !['CLOSED', 'RESOLVED'].includes(i.status)).map(i => ({
                section: isAr ? 'الحوادث النشطة' : 'Active Incidents',
                title: i.title,
                score: i.severity,
                status: i.status,
              })),
            ];
            await exportToPDF(reportData, [
              { label: isAr ? 'القسم' : 'Section', accessor: 'section' },
              { label: isAr ? 'العنصر' : 'Item', accessor: 'title' },
              { label: isAr ? 'الدرجة' : 'Score', accessor: 'score' },
              { label: isAr ? 'الحالة' : 'Status', accessor: 'status' },
            ], 'executive-full-report', {
              title: isAr ? 'التقرير التنفيذي الكامل' : 'Full Executive Report',
              orientation: 'portrait',
            });
          }} style={{
            padding: "8px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)",
            display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
          }}>
            {t("Full Report", "التقرير الكامل")} <Download size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
