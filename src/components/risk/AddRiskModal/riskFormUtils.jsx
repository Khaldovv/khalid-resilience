// ─── Shared UI components, styles, and utility functions for risk forms ──────
import { AlertTriangle, Shield, ClipboardList, Plus, Info } from "lucide-react";

// ─── Risk Level Calculation & Color Logic ─────────────────────────────────────
export function getRiskLevel(likelihood, impact) {
  const score = likelihood * impact;
  if (score >= 20) return { score, label: { en: "Catastrophic", ar: "كارثي" }, color: "#7f1d1d", bg: "rgba(127,29,29,0.25)", border: "#991b1b" };
  if (score >= 15) return { score, label: { en: "High", ar: "عالي" }, color: "#ef4444", bg: "rgba(239,68,68,0.15)", border: "#dc2626" };
  if (score >= 10) return { score, label: { en: "Medium", ar: "متوسط" }, color: "#f97316", bg: "rgba(249,115,22,0.15)", border: "#ea580c" };
  if (score >= 5)  return { score, label: { en: "Low", ar: "منخفض" }, color: "#eab308", bg: "rgba(234,179,8,0.15)", border: "#ca8a04" };
  return { score, label: { en: "Very Low", ar: "منخفض جداً" }, color: "#22c55e", bg: "rgba(34,197,94,0.15)", border: "#16a34a" };
}

// ─── Counter for auto-generating Risk IDs ─────────────────────────────────────
let riskCounter = 3000;
export function getNextRiskId() { riskCounter++; return `RSK-${riskCounter}`; }

// ─── Dropdown options (EN/AR) ─────────────────────────────────────────────────
export const departments = {
  en: ["IT", "Finance", "Operations", "HR", "Legal", "Compliance", "Marketing", "Strategy", "Procurement"],
  ar: ["تقنية المعلومات", "المالية", "العمليات", "الموارد البشرية", "القانونية", "الإمتثال", "التسويق", "الاستراتيجية", "المشتريات"],
};
export const riskTypes = {
  en: ["Cybersecurity", "Operational", "Compliance", "Financial", "Geopolitical", "Reputational", "Strategic", "Legal"],
  ar: ["الأمن السيبراني", "تشغيلي", "امتثال", "مالي", "جيوسياسي", "سمعي", "استراتيجي", "قانوني"],
};
export const controlEffectivenessOpts = {
  en: ["Very Effective", "Effective", "Moderate", "Ineffective"],
  ar: ["فعال جداً", "فعال", "معتدل", "غير فعال"],
};
export const responseTypes = {
  en: ["Accept", "Transfer", "Mitigate", "Avoid"],
  ar: ["قبول", "نقل", "تخفيف", "تجنب"],
};
export const lifecycleStatuses = {
  en: ["Identified", "Under Analysis", "Planned / Approved", "In Progress", "Monitored", "Closed"],
  ar: ["مُحدَّد", "قيد التحليل", "مُخطَّط / مُعتمَد", "قيد التنفيذ", "مُراقَب", "مُغلَق"],
};
export const quarterOpts = ["Q1", "Q2", "Q3", "Q4"];
export const confidenceLevels = {
  en: ["1 — Very Low", "2 — Low", "3 — Moderate", "4 — High", "5 — Very High"],
  ar: ["1 — منخفض جداً", "2 — منخفض", "3 — متوسط", "4 — عالي", "5 — عالي جداً"],
};

// ─── Initial form state ────────────────────────────────────────────────────────
export const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  department: "", riskName: "", description: "", riskType: "",
  inherentLikelihood: "", inherentImpact: "",
  preventiveMeasures: "", controlEffectiveness: "",
  residualLikelihood: "", residualImpact: "", confidenceLevel: "",
  riskOwner: "", responseType: "", mitigationPlan: "",
  planOwner: "", implementationTime: "", responsibleDept: "",
  notes: "", lifecycleStatus: "",
};

export const DRAFT_KEY = "autoresilience_risk_draft";

// ─── Shared Styles ────────────────────────────────────────────────────────────
export const makeInputStyle = (isAr) => ({
  width: "100%", padding: "9px 12px", borderRadius: 10,
  background: "#0f172a", border: "1px solid #334155",
  color: "#e2e8f0", fontSize: 12, fontFamily: "inherit",
  outline: "none", direction: isAr ? "rtl" : "ltr",
  transition: "border-color 0.2s, box-shadow 0.2s",
});

export const makeLabelStyle = (isAr) => ({
  display: "flex", alignItems: "center", gap: 6,
  fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 6,
  direction: isAr ? "rtl" : "ltr",
});

export const focusHandler = (e) => (e.target.style.borderColor = "#06b6d4");
export const blurHandler = (e) => (e.target.style.borderColor = "#334155");

// ─── Reusable Form Components ─────────────────────────────────────────────────
export function RequiredMark({ text }) {
  return <span style={{ color: "#ef4444", fontSize: 9 }}>● {text}</span>;
}

export function SectionHeader({ icon: Icon, title, isAr }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 0 6px", borderBottom: "1px solid #1e293b",
      marginBottom: 12, direction: isAr ? "rtl" : "ltr",
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 8,
        background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={13} style={{ color: "#06b6d4" }} />
      </div>
      <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700 }}>{title}</span>
    </div>
  );
}

export function SelectField({ label, value, onChange, options, required, half, isAr, requiredText, selectText }) {
  return (
    <div style={half ? { flex: "1 1 0" } : {}}>
      <label style={makeLabelStyle(isAr)}>
        {label}
        {required && <RequiredMark text={requiredText} />}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ ...makeInputStyle(isAr), cursor: "pointer", color: value ? "#e2e8f0" : "#475569" }}
        onFocus={focusHandler} onBlur={blurHandler}
      >
        <option value="">{selectText}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, required, half, isAr, requiredText }) {
  return (
    <div style={half ? { flex: "1 1 0" } : {}}>
      <label style={makeLabelStyle(isAr)}>
        {label}
        {required && <RequiredMark text={requiredText} />}
      </label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} style={makeInputStyle(isAr)}
        onFocus={focusHandler} onBlur={blurHandler}
      />
    </div>
  );
}

export function TextareaField({ label, value, onChange, placeholder, required, rows = 2, isAr, requiredText }) {
  return (
    <div>
      <label style={makeLabelStyle(isAr)}>
        {label}
        {required && <RequiredMark text={requiredText} />}
      </label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{ ...makeInputStyle(isAr), resize: "vertical", lineHeight: 1.6 }}
        onFocus={focusHandler} onBlur={blurHandler}
      />
    </div>
  );
}

export function NumberSelect({ label, value, onChange, required, isAr, requiredText, disabledFn, disabledTitle }) {
  return (
    <div style={{ flex: "1 1 0" }}>
      <label style={makeLabelStyle(isAr)}>
        {label}
        {required && <RequiredMark text={requiredText} />}
      </label>
      <div style={{ display: "flex", gap: 6 }}>
        {[1,2,3,4,5].map((n) => {
          const isDisabled = disabledFn ? disabledFn(n) : false;
          return (
            <button key={n} type="button" onClick={() => !isDisabled && onChange(String(n))}
              disabled={isDisabled} title={isDisabled ? (disabledTitle || '') : ''}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 700,
                transition: "all 0.15s",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.3 : 1,
                textDecoration: isDisabled ? "line-through" : "none",
                background: String(n) === String(value) ? "rgba(6,182,212,0.2)" : "#0f172a",
                border: `1.5px solid ${String(n) === String(value) ? "#06b6d4" : "#334155"}`,
                color: String(n) === String(value) ? "#22d3ee" : "#64748b",
                boxShadow: String(n) === String(value) ? "0 0 12px rgba(6,182,212,0.15)" : "none",
              }}>{n}</button>
          );
        })}
      </div>
    </div>
  );
}

export function RiskLevelBadge({ level, label, isAr, lang }) {
  if (!level) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 14px", borderRadius: 10, marginTop: 4,
      background: level.bg, border: `1px solid ${level.border}`,
      direction: isAr ? "rtl" : "ltr",
    }}>
      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: level.color, fontSize: 14, fontWeight: 800, fontFamily: "monospace" }}>
          {level.score}
        </span>
        <span style={{
          color: level.color, fontSize: 12, fontWeight: 700,
          padding: "2px 10px", borderRadius: 6, background: level.bg,
        }}>
          {level.label[lang]}
        </span>
      </div>
    </div>
  );
}

export function StepIndicator({ step, totalSteps, steps, isAr }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      padding: "12px 24px", borderBottom: "1px solid #1e293b",
      background: "rgba(6,182,212,0.02)", direction: isAr ? "rtl" : "ltr",
    }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800,
            background: i < step ? "#06b6d4" : i === step ? "rgba(6,182,212,0.2)" : "#1e293b",
            border: `2px solid ${i <= step ? "#06b6d4" : "#334155"}`,
            color: i < step ? "#020817" : i === step ? "#22d3ee" : "#475569",
            transition: "all 0.3s",
          }}>
            {i < step ? "✓" : i + 1}
          </div>
          <span style={{
            fontSize: 10, fontWeight: 600,
            color: i <= step ? "#e2e8f0" : "#475569",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            flex: 1, transition: "color 0.3s",
          }}>{s}</span>
          {i < totalSteps - 1 && (
            <div style={{
              width: 20, height: 2, borderRadius: 1,
              background: i < step ? "#06b6d4" : "#334155",
              transition: "background 0.3s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Translation labels factory ────────────────────────────────────────────────
export function getLabels(isAr) {
  return {
    title: isAr ? "إضافة خطر جديد" : "Add New Risk",
    save: isAr ? "حفظ الخطر" : "Save Risk",
    cancel: isAr ? "إلغاء" : "Cancel",
    select: isAr ? "اختر..." : "Select...",
    required: isAr ? "مطلوب" : "Required",
    next: isAr ? "التالي" : "Next",
    prev: isAr ? "السابق" : "Back",
    sec1: isAr ? "البيانات الأساسية" : "Basic Information",
    sec2: isAr ? "تقييم المخاطر" : "Risk Assessment",
    sec3: isAr ? "الاستجابة والدورة" : "Response & Lifecycle",
    date: isAr ? "تاريخ الخطر" : "Risk Date",
    department: isAr ? "الإدارة" : "Department",
    riskName: isAr ? "اسم الخطر" : "Risk Name",
    description: isAr ? "وصف الخطر" : "Risk Description",
    riskType: isAr ? "نوع الخطر" : "Risk Type",
    likelihood: isAr ? "الاحتمالية" : "Likelihood",
    impact: isAr ? "الأثر" : "Impact",
    riskLevel: isAr ? "مستوى الخطر" : "Risk Level",
    preventive: isAr ? "التدابير الوقائية" : "Preventive Measures",
    controlEff: isAr ? "فاعلية التدابير" : "Control Effectiveness",
    resLikelihood: isAr ? "الاحتمالية المتبقية" : "Residual Likelihood",
    resImpact: isAr ? "الأثر المتبقي" : "Residual Impact",
    resLevel: isAr ? "مستوى الخطر المتبقي" : "Residual Risk Level",
    owner: isAr ? "مالك الخطر" : "Risk Owner",
    responseType: isAr ? "نوع الاستجابة" : "Response Type",
    mitigationPlan: isAr ? "خطة المعالجة" : "Mitigation Plan",
    planOwner: isAr ? "مالك الخطة" : "Plan Owner",
    implTime: isAr ? "وقت التنفيذ" : "Implementation Time",
    respDept: isAr ? "الإدارة المسؤولة" : "Responsible Department",
    notes: isAr ? "ملاحظات" : "Notes",
    confidenceLevel: isAr ? "مستوى الثقة في التقييم" : "Confidence Level",
    lifecycle: isAr ? "حالة الخطر" : "Risk Status",
    descPh: isAr ? "اكتب وصفاً مختصراً للخطر..." : "Describe the risk briefly...",
    namePh: isAr ? "أدخل اسم الخطر..." : "Enter risk name...",
    preventivePh: isAr ? "اكتب التدابير الوقائية..." : "Describe preventive measures...",
    mitigationPh: isAr ? "اكتب خطة المعالجة..." : "Describe mitigation plan...",
    notesPh: isAr ? "ملاحظات إضافية..." : "Additional notes...",
    ownerPh: isAr ? "أدخل اسم مالك الخطر..." : "Enter risk owner name...",
    planOwnerPh: isAr ? "أدخل اسم مالك الخطة..." : "Enter plan owner name...",
    respDeptPh: isAr ? "أدخل اسم الإدارة المسؤولة..." : "Enter responsible department...",
  };
}
