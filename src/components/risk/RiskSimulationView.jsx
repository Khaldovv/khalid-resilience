import { useState, useEffect } from "react";
import { Sparkles, TrendingDown, Clock, Monitor, ChevronDown, ChevronUp, ArrowRight, RefreshCw, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useApp } from "../../context/AppContext";

// ─── Severity colors ─────────────────────────────────────────────────────────
const severityConfig = {
  LOW:      { bg: "rgba(16,185,129,0.12)", border: "#10b981", text: "#34d399", label: { ar: "منخفض", en: "Low" } },
  MEDIUM:   { bg: "rgba(245,158,11,0.12)", border: "#f59e0b", text: "#fbbf24", label: { ar: "متوسط", en: "Medium" } },
  HIGH:     { bg: "rgba(239,68,68,0.12)",  border: "#ef4444", text: "#f87171", label: { ar: "عالي", en: "High" } },
  CRITICAL: { bg: "rgba(127,29,29,0.25)",  border: "#991b1b", text: "#f87171", label: { ar: "حرج", en: "Critical" } },
};

const priorityConfig = {
  IMMEDIATE:  { bg: "rgba(239,68,68,0.15)", border: "#ef4444", text: "#f87171", label: { ar: "فوري", en: "Immediate" } },
  SHORT_TERM: { bg: "rgba(245,158,11,0.15)", border: "#f59e0b", text: "#fbbf24", label: { ar: "قصير المدى", en: "Short Term" } },
  LONG_TERM:  { bg: "rgba(59,130,246,0.15)", border: "#3b82f6", text: "#60a5fa", label: { ar: "طويل المدى", en: "Long Term" } },
};

const roleLabels = {
  CISO: { ar: "مسؤول أمن المعلومات", en: "CISO" },
  IT_SECURITY: { ar: "أمن تقنية المعلومات", en: "IT Security" },
  DEPT_HEAD: { ar: "رئيس الإدارة", en: "Dept Head" },
  BC_COORDINATOR: { ar: "منسق استمرارية الأعمال", en: "BC Coordinator" },
  CRO: { ar: "كبير مسؤولي المخاطر", en: "CRO" },
};

// ─── Format SAR currency ─────────────────────────────────────────────────────
function formatSAR(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return String(val);
}

// ─── Loading Steps Component ─────────────────────────────────────────────────
function LoadingView({ isAr }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const steps = [
    { ar: "جمع بيانات الخطر", en: "Gathering risk data" },
    { ar: "تحليل السيناريوهات المحتملة", en: "Analyzing possible scenarios" },
    { ar: "إعداد استراتيجيات التخفيف", en: "Preparing mitigation strategies" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 24 }}>
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          border: "3px solid rgba(147,51,234,0.2)",
          borderTopColor: "#9333ea",
          animation: "spin 1s linear infinite",
        }} />
        <Sparkles size={24} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#9333ea" }} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#c084fc" }}>
        {isAr ? "جاري تحليل الخطر..." : "Analyzing risk..."}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: i <= step ? 1 : 0.3, transition: "opacity 0.4s" }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
              background: i < step ? "rgba(16,185,129,0.2)" : i === step ? "rgba(147,51,234,0.2)" : "rgba(100,116,139,0.1)",
              border: `1.5px solid ${i < step ? "#10b981" : i === step ? "#9333ea" : "#475569"}`,
              color: i < step ? "#10b981" : i === step ? "#c084fc" : "#64748b",
            }}>
              {i < step ? "✓" : i === step ? "◐" : "○"}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: i <= step ? "#e2e8f0" : "#64748b" }}>
              {isAr ? s.ar : s.en}
            </span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Confidence Badge ────────────────────────────────────────────────────────
function ConfidenceBadge({ score, isAr }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 32;
  const dashOffset = circumference * (1 - score);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 12, background: "var(--bg-card, rgba(15,23,42,0.5))", border: "1px solid var(--border-primary, #1e293b)" }}>
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
        <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(100,116,139,0.15)" strokeWidth="5" />
        <circle cx="36" cy="36" r="32" fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="36" y="36" textAnchor="middle" dominantBaseline="central" fill={color} fontSize="18" fontWeight="800" fontFamily="monospace">
          {pct}%
        </text>
      </svg>
      <div>
        <p style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em" }}>
          {isAr ? "مستوى ثقة التحليل" : "ANALYSIS CONFIDENCE"}
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: color, marginTop: 2 }}>
          {pct >= 80 ? (isAr ? "عالي" : "High") : pct >= 50 ? (isAr ? "متوسط" : "Moderate") : (isAr ? "منخفض" : "Low")}
        </p>
      </div>
    </div>
  );
}

// ─── Scenario Card ───────────────────────────────────────────────────────────
function ScenarioCard({ scenario, label, borderColor, isAr, isHighlighted }) {
  const sev = severityConfig[scenario.severity] || severityConfig.MEDIUM;
  const [expanded, setExpanded] = useState(false);

  // Multi-dimensional impacts
  const impacts = [
    { key: 'operational', icon: '⚙️', color: '#f59e0b', label: { ar: 'التأثير التشغيلي', en: 'Operational Impact' }, textAr: scenario.operational_impact_ar, textEn: scenario.operational_impact_en },
    { key: 'reputational', icon: '📢', color: '#8b5cf6', label: { ar: 'التأثير على السمعة', en: 'Reputational Impact' }, textAr: scenario.reputational_impact_ar, textEn: scenario.reputational_impact_en },
    { key: 'regulatory', icon: '⚖️', color: '#ef4444', label: { ar: 'التأثير التنظيمي', en: 'Regulatory Impact' }, textAr: scenario.regulatory_impact_ar, textEn: scenario.regulatory_impact_en },
    { key: 'human', icon: '👥', color: '#06b6d4', label: { ar: 'التأثير البشري', en: 'Human Impact' }, textAr: scenario.human_impact_ar, textEn: scenario.human_impact_en },
  ].filter(imp => imp.textAr || imp.textEn);

  return (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      background: isHighlighted ? "rgba(15,23,42,0.8)" : "var(--bg-card, rgba(15,23,42,0.5))",
      border: `1px solid var(--border-primary, #1e293b)`,
      borderInlineStart: `4px solid ${borderColor}`,
      transform: isHighlighted ? "scale(1.01)" : "none",
      transition: "transform 0.2s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(30,41,59,0.5)" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: borderColor }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: `${borderColor}15`, border: `2px solid ${borderColor}`,
            fontSize: 12, fontWeight: 800, fontFamily: "monospace", color: borderColor,
          }}>
            {scenario.probability_pct}%
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
            background: sev.bg, border: `1px solid ${sev.border}`, color: sev.text,
            position: "relative",
          }}>
            {isAr ? sev.label.ar : sev.label.en}
            {scenario.severity === "CRITICAL" && (
              <span style={{
                position: "absolute", top: -2, right: -2, width: 6, height: 6, borderRadius: "50%",
                background: "#ef4444", animation: "pulse-dot 1.5s infinite",
              }} />
            )}
          </span>
        </div>
      </div>

      {/* Narrative */}
      <div style={{ padding: "12px 16px" }}>
        <p style={{ fontSize: 12, lineHeight: 1.7, color: "var(--text-secondary, #94a3b8)" }}>
          {isAr ? scenario.narrative_ar : scenario.narrative_en}
        </p>
      </div>

      {/* Stats Row — Financial + Timeline + Systems + Recovery */}
      <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(30,41,59,0.5)" }}>
        {[
          { icon: "💰", label: isAr ? "الأثر المالي" : "Financial", value: `${formatSAR(scenario.financial_impact_sar)} ${isAr ? "ريال" : "SAR"}` },
          { icon: "⏱", label: isAr ? "المدة" : "Timeline", value: `${scenario.timeline_days} ${isAr ? "يوم" : "days"}` },
          { icon: "🖥", label: isAr ? "الأنظمة" : "Systems", value: `${(scenario.affected_systems || []).length} ${isAr ? "متأثرة" : "affected"}` },
          ...(scenario.recovery_time_hours ? [{ icon: "🔄", label: isAr ? "وقت التعافي" : "Recovery", value: `${scenario.recovery_time_hours}${isAr ? " ساعة" : "h"}` }] : []),
        ].map((stat, i, arr) => (
          <div key={i} style={{
            flex: 1, padding: "10px 12px", textAlign: "center",
            borderInlineEnd: i < arr.length - 1 ? "1px solid rgba(30,41,59,0.5)" : "none",
          }}>
            <p style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>{stat.icon} {stat.label}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", fontFamily: "monospace" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Multi-Dimensional Impact Section */}
      {impacts.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(30,41,59,0.5)" }}>
          <button onClick={() => setExpanded(!expanded)} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 16px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.05em" }}>
              {isAr ? `📊 أنواع التأثير (${impacts.length})` : `📊 IMPACT TYPES (${impacts.length})`}
            </span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {expanded && (
            <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {impacts.map((imp) => (
                <div key={imp.key} style={{
                  padding: "8px 12px", borderRadius: 8,
                  background: `${imp.color}08`, border: `1px solid ${imp.color}20`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span>{imp.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: imp.color }}>
                      {isAr ? imp.label.ar : imp.label.en}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, lineHeight: 1.6, color: "#94a3b8", margin: 0 }}>
                    {isAr ? imp.textAr : imp.textEn}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Affected Systems Tags */}
      {(scenario.affected_systems || []).length > 0 && (
        <div style={{ padding: "8px 16px 12px", display: "flex", flexWrap: "wrap", gap: 6, borderTop: impacts.length > 0 ? "none" : "1px solid rgba(30,41,59,0.5)" }}>
          {scenario.affected_systems.map((sys, i) => (
            <span key={i} style={{
              fontSize: 10, padding: "3px 8px", borderRadius: 6,
              background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4",
            }}>{sys}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Probability Bar ─────────────────────────────────────────────────────────
function ProbabilityBar({ best, likely, worst, isAr }) {
  return (
    <div style={{ borderRadius: 10, padding: "12px 16px", background: "var(--bg-card, rgba(15,23,42,0.5))", border: "1px solid var(--border-primary, #1e293b)" }}>
      <p style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 10 }}>
        {isAr ? "توزيع الاحتمالات" : "PROBABILITY DISTRIBUTION"}
      </p>
      <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", gap: 2 }}>
        <div style={{ flex: best, background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px 0 0 8px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{best}% {isAr ? "أفضل" : "Best"}</span>
        </div>
        <div style={{ flex: likely, background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{likely}% {isAr ? "أرجح" : "Likely"}</span>
        </div>
        <div style={{ flex: worst, background: "linear-gradient(135deg, #ef4444, #b91c1c)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0 8px 8px 0" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{worst}% {isAr ? "أسوأ" : "Worst"}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Strategy Accordion ──────────────────────────────────────────────────────
function StrategyCard({ strategy, index, isAr }) {
  const [open, setOpen] = useState(false);
  const pri = priorityConfig[strategy.priority] || priorityConfig.SHORT_TERM;
  const role = roleLabels[strategy.responsible_role] || { ar: strategy.responsible_role, en: strategy.responsible_role };
  const reductionColor = strategy.risk_reduction_pct >= 30 ? "#10b981" : strategy.risk_reduction_pct >= 15 ? "#f59e0b" : "#64748b";

  return (
    <div style={{
      borderRadius: 10, overflow: "hidden",
      background: "var(--bg-card, rgba(15,23,42,0.5))",
      border: `1px solid var(--border-primary, #1e293b)`,
    }}>
      {/* Collapsed Header */}
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
        background: "none", border: "none", cursor: "pointer", color: "#e2e8f0", textAlign: isAr ? "right" : "left",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>
          {index + 1}. {isAr ? strategy.title_ar : strategy.title_en}
        </span>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
          background: pri.bg, border: `1px solid ${pri.border}`, color: pri.text, flexShrink: 0,
        }}>
          {isAr ? pri.label.ar : pri.label.en}
        </span>
        <span style={{
          fontSize: 9, padding: "2px 6px", borderRadius: 4,
          background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)", color: "#06b6d4", flexShrink: 0,
        }}>
          {isAr ? role.ar : role.en}
        </span>
        {open ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
      </button>

      {/* Expanded Content */}
      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(30,41,59,0.5)" }}>
          <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, marginTop: 10, marginBottom: 12 }}>
            {isAr ? strategy.description_ar : strategy.description_en}
          </p>

          {/* Stats Row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b" }}>
              <p style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>
                {isAr ? "التكلفة التقديرية" : "Est. Cost"}
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", fontFamily: "monospace" }}>
                {formatSAR(strategy.estimated_cost_sar)} {isAr ? "ريال" : "SAR"}
              </p>
            </div>
            <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b" }}>
              <p style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>
                {isAr ? "تخفيض الخطر المتوقع" : "Risk Reduction"}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(100,116,139,0.15)" }}>
                  <div style={{ width: `${strategy.risk_reduction_pct}%`, height: "100%", borderRadius: 3, background: reductionColor, transition: "width 0.5s" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: reductionColor, fontFamily: "monospace" }}>
                  {strategy.risk_reduction_pct}%
                </span>
              </div>
            </div>
          </div>

          {/* Implementation Steps */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
              {isAr ? "خطوات التنفيذ:" : "Implementation Steps:"}
            </p>
            <ol style={{ margin: 0, paddingInlineStart: 18, display: "flex", flexDirection: "column", gap: 4 }}>
              {strategy.implementation_steps.map((step, i) => (
                <li key={i} style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Simulation View ────────────────────────────────────────────────────
export default function RiskSimulationView({ risk, onBack }) {
  const { language } = useApp();
  const isAr = language === "ar";
  const [state, setState] = useState("loading"); // loading | results | error
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const runSimulation = async () => {
    setState("loading");
    setData(null);
    setErrorMsg("");

    try {
      const token = localStorage.getItem('grc_token');
      const riskId = risk.id || risk.riskId;
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/v1/risks/${riskId}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          risk_name: risk.riskName || risk.risk_name || '',
          description: risk.description || '',
          risk_type: risk.riskType || risk.risk_type || risk.category || 'Operational',
          department: risk.department || '',
          inherent_score: risk.inherentScore || risk.inherent_score || risk.score || 0,
          residual_score: risk.residualScore || risk.residual_score || 0,
          inherent_likelihood: risk.inherentLikelihood || risk.inherent_likelihood || 3,
          inherent_impact: risk.inherentImpact || risk.inherent_impact || 3,
        }),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Simulation failed (${response.status})`);
      }
      const saved = await response.json();
      // Parse the saved simulation result (DB stores JSON as strings)
      const result = {
        confidence_score: saved.confidence_score || saved.data?.confidence_score || 0.75,
        scenario_best: typeof saved.scenario_best === 'string' ? JSON.parse(saved.scenario_best) : (saved.scenario_best || saved.data?.scenario_best),
        scenario_likely: typeof saved.scenario_likely === 'string' ? JSON.parse(saved.scenario_likely) : (saved.scenario_likely || saved.data?.scenario_likely),
        scenario_worst: typeof saved.scenario_worst === 'string' ? JSON.parse(saved.scenario_worst) : (saved.scenario_worst || saved.data?.scenario_worst),
        mitigation_strategies: typeof saved.mitigation_strategies === 'string' ? JSON.parse(saved.mitigation_strategies) : (saved.mitigation_strategies || saved.data?.mitigation_strategies || []),
      };
      setData(result);
      setState("results");
    } catch (err) {
      console.error('[SIMULATION ERROR]', err);
      setErrorMsg(err.message);
      setState("error");
    }
  };

  useEffect(() => { runSimulation(); }, []);

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (state === "loading") return <LoadingView isAr={isAr} />;

  // ─── Error ───────────────────────────────────────────────────────────────────
  if (state === "error") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,0.12)", border: "1px solid #ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AlertTriangle size={24} color="#f87171" />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#f87171" }}>
        {isAr ? "حدث خطأ أثناء التحليل" : "Analysis error occurred"}
      </p>
      <p style={{ fontSize: 12, color: "#64748b", textAlign: "center", maxWidth: 300 }}>{errorMsg}</p>
      <button onClick={runSimulation} style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
        background: "rgba(147,51,234,0.15)", border: "1px solid rgba(147,51,234,0.3)", color: "#c084fc",
        cursor: "pointer", fontSize: 12, fontWeight: 600,
      }}>
        <RefreshCw size={14} />
        {isAr ? "إعادة المحاولة" : "Retry"}
      </button>
    </div>
  );

  // ─── Results ─────────────────────────────────────────────────────────────────
  if (!data) return null;

  const chartData = [
    { name: isAr ? "أفضل" : "Best", value: data.scenario_best.financial_impact_sar, fill: "#10b981" },
    { name: isAr ? "أرجح" : "Likely", value: data.scenario_likely.financial_impact_sar, fill: "#f59e0b" },
    { name: isAr ? "أسوأ" : "Worst", value: data.scenario_worst.financial_impact_sar, fill: "#ef4444" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Back Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6,
          background: "rgba(100,116,139,0.1)", border: "1px solid #334155", color: "#94a3b8",
          cursor: "pointer", fontSize: 11, fontWeight: 600,
        }}>
          {isAr ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}
          {isAr ? "رجوع" : "Back"}
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#9333ea" }}>
          <Sparkles size={12} />
          <span style={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.05em" }}>
            {isAr ? "تحليل بالذكاء الاصطناعي" : "AI ANALYSIS"}
          </span>
        </div>
      </div>

      {/* Confidence Badge */}
      <ConfidenceBadge score={data.confidence_score} isAr={isAr} />

      {/* 3 Scenario Cards */}
      <ScenarioCard
        scenario={data.scenario_best}
        label={isAr ? "أفضل سيناريو" : "Best Case Scenario"}
        borderColor="#10b981"
        isAr={isAr}
      />
      <ScenarioCard
        scenario={data.scenario_likely}
        label={isAr ? "السيناريو الأرجح" : "Most Likely Scenario"}
        borderColor="#f59e0b"
        isAr={isAr}
        isHighlighted
      />
      <ScenarioCard
        scenario={data.scenario_worst}
        label={isAr ? "أسوأ سيناريو" : "Worst Case Scenario"}
        borderColor="#ef4444"
        isAr={isAr}
      />

      {/* Probability Distribution Bar */}
      <ProbabilityBar
        best={data.scenario_best.probability_pct}
        likely={data.scenario_likely.probability_pct}
        worst={data.scenario_worst.probability_pct}
        isAr={isAr}
      />

      {/* Financial Impact Chart — forced LTR for chart rendering */}
      <div style={{ borderRadius: 12, padding: "14px 16px", background: "var(--bg-card, rgba(15,23,42,0.5))", border: "1px solid var(--border-primary, #1e293b)" }}>
        <p style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 12, textAlign: isAr ? "right" : "left" }}>
          {isAr ? "مقارنة الأثر المالي (ريال سعودي)" : "FINANCIAL IMPACT COMPARISON (SAR)"}
        </p>
        <div style={{ direction: "ltr" }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 5, right: 35, top: 5, bottom: 5 }}>
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => formatSAR(v)} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                formatter={(v) => [`${(v / 1000000).toFixed(2)}M ${isAr ? "ريال" : "SAR"}`, isAr ? "الأثر المالي" : "Financial Impact"]}
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mitigation Strategies */}
      <div>
        <p style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: "0.1em", marginBottom: 10 }}>
          {isAr ? "استراتيجيات التخفيف المقترحة" : "PROPOSED MITIGATION STRATEGIES"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.mitigation_strategies.map((s, i) => (
            <StrategyCard key={i} strategy={s} index={i} isAr={isAr} />
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
        <button onClick={runSimulation} style={{
          flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: "linear-gradient(135deg, rgba(147,51,234,0.2), rgba(147,51,234,0.1))",
          border: "1px solid rgba(147,51,234,0.3)", color: "#c084fc", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <RefreshCw size={13} />
          {isAr ? "محاكاة جديدة" : "New Simulation"}
        </button>
        <button onClick={onBack} style={{
          flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 12, fontWeight: 600,
          background: "rgba(100,116,139,0.08)", border: "1px solid #334155", color: "#94a3b8",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {isAr ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
          {isAr ? "رجوع" : "Back"}
        </button>
      </div>

      {/* Pulse animation for CRITICAL severity */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.8); }
        }
      `}</style>
    </div>
  );
}
