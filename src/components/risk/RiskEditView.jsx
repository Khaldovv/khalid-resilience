import { useState, useMemo } from "react";
import { Lock, Edit3, Save, XCircle, ChevronDown } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useToast } from "../ToastProvider";

// ─── Score → Level Helper ────────────────────────────────────────────────────
function scoreToLevel(score) {
  if (score >= 20) return { label: { ar: "كارثي", en: "Catastrophic" }, color: "#7f1d1d" };
  if (score >= 15) return { label: { ar: "عالي", en: "High" }, color: "#ef4444" };
  if (score >= 10) return { label: { ar: "متوسط", en: "Medium" }, color: "#f97316" };
  if (score >= 5)  return { label: { ar: "منخفض", en: "Low" }, color: "#eab308" };
  return { label: { ar: "منخفض جداً", en: "Very Low" }, color: "#22c55e" };
}

// ─── Slider Stops (1–5) ──────────────────────────────────────────────────────
const sliderStops = {
  1: { ar: "نادر", en: "Rare" },
  2: { ar: "غير مرجح", en: "Unlikely" },
  3: { ar: "ممكن", en: "Possible" },
  4: { ar: "مرجح", en: "Likely" },
  5: { ar: "شبه مؤكد", en: "Almost Certain" },
};

// ─── ReadOnly Field ──────────────────────────────────────────────────────────
function ReadOnlyField({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
      <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
        <Lock size={9} color="#475569" /> {label}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", maxWidth: "60%", textAlign: "end", wordBreak: "break-word" }}>
        {value || "—"}
      </span>
    </div>
  );
}

// ─── Edit Section Wrapper ────────────────────────────────────────────────────
function EditSection({ title, changed, children }) {
  return (
    <div style={{
      borderRadius: 10, padding: "12px 14px",
      background: "var(--bg-card, rgba(15,23,42,0.5))",
      border: `1px solid ${changed ? "rgba(245,158,11,0.4)" : "var(--border-primary, #1e293b)"}`,
      borderInlineStart: changed ? "4px solid #f59e0b" : "4px solid transparent",
      transition: "all 0.2s",
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: changed ? "#fbbf24" : "#64748b", marginBottom: 10, fontFamily: "monospace", letterSpacing: "0.05em" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Slider Field (1–5) ─────────────────────────────────────────────────────
function SliderField({ label, value, onChange, isAr, min = 1, max = 5 }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#06b6d4", fontFamily: "monospace" }}>
          {value} {min === 1 && max === 5 ? `— ${isAr ? sliderStops[value].ar : sliderStops[value].en}` : ""}
        </span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ width: "100%", accentColor: "#06b6d4", cursor: "pointer" }}
      />
      {min === 1 && max === 5 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <span key={n} style={{ fontSize: 9, color: n === value ? "#06b6d4" : "#475569", fontFamily: "monospace" }}>{n}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Select Field ────────────────────────────────────────────────────────────
function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</p>
      <div style={{ position: "relative" }}>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", padding: "8px 30px 8px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: "rgba(15,23,42,0.8)", border: "1px solid #334155", color: "#e2e8f0",
            appearance: "none", cursor: "pointer", outline: "none",
          }}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

// ─── TextArea Field ──────────────────────────────────────────────────────────
function TextAreaField({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontSize: 11, color: "#94a3b8" }}>{label}</p>
        <span style={{ fontSize: 9, color: "#475569" }}>{(value || "").length}</span>
      </div>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "8px 10px", borderRadius: 8, fontSize: 12,
          background: "rgba(15,23,42,0.8)", border: "1px solid #334155", color: "#e2e8f0",
          resize: "vertical", outline: "none", lineHeight: 1.6, fontFamily: "inherit",
        }}
      />
    </div>
  );
}

// ─── Main Edit View ──────────────────────────────────────────────────────────
export default function RiskEditView({ risk, onCancel, onSave }) {
  const { language } = useApp();
  const toast = useToast();
  const isAr = language === "ar";

  const [formData, setFormData] = useState({
    residual_likelihood: risk.residualLikelihood || risk.residual_likelihood || 3,
    residual_impact: risk.residualImpact || risk.residual_impact || 3,
    response_type: risk.responseType || risk.response_type || "MITIGATE",
    lifecycle_status: risk.lifecycleStatus || risk.lifecycle_status || "IDENTIFIED",
    mitigation_plan: risk.mitigation_plan || risk.mitigationPlan || "",
    implementation_timeframe: risk.implementation_timeframe || risk.implementationTimeframe || "90_DAYS",
    confidence_level: risk.confidenceLevel || risk.confidence_level || 3,
    notes: risk.notes || "",
    current_action: risk.current_action || risk.aiStatus || "",
  });

  const original = useMemo(() => ({ ...formData }), []);

  const changedFields = useMemo(() => {
    const changed = new Set();
    for (const key of Object.keys(formData)) {
      if (String(formData[key]) !== String(original[key])) changed.add(key);
    }
    return changed;
  }, [formData, original]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const residualScore = formData.residual_likelihood * formData.residual_impact;
  const residualLevel = scoreToLevel(residualScore);

  const handleSave = () => {
    const changes = {};
    for (const key of changedFields) {
      changes[key] = formData[key];
    }
    // Auto-compute residual score
    if (changedFields.has("residual_likelihood") || changedFields.has("residual_impact")) {
      changes.residual_score = residualScore;
      changes.residual_level = residualLevel.label.en;
    }
    onSave(changes);
    toast.success(isAr ? "تم حفظ التعديلات بنجاح" : "Changes saved successfully");
  };

  const handleCancel = () => {
    if (changedFields.size > 0) {
      const msg = isAr ? "لديك تعديلات غير محفوظة. هل تريد المتابعة؟" : "You have unsaved changes. Continue?";
      if (!window.confirm(msg)) return;
    }
    onCancel();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px", borderRadius: 10,
        background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#06b6d4" }}>
          <Edit3 size={14} />
          {isAr ? "تعديل الخطر" : "Edit Risk"}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={handleCancel} style={{
            padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: "#1e293b", border: "1px solid #334155", color: "#94a3b8",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          }}>
            <XCircle size={12} />
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button onClick={handleSave} disabled={changedFields.size === 0} style={{
            padding: "5px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: changedFields.size > 0 ? "linear-gradient(135deg, #06b6d4, #0891b2)" : "#334155",
            border: "none", color: changedFields.size > 0 ? "#020817" : "#64748b",
            cursor: changedFields.size > 0 ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", gap: 4,
            boxShadow: changedFields.size > 0 ? "0 2px 10px rgba(6,182,212,0.3)" : "none",
          }}>
            <Save size={12} />
            {isAr ? `حفظ التعديلات (${changedFields.size})` : `Save Changes (${changedFields.size})`}
          </button>
        </div>
      </div>

      {/* Read-only Section */}
      <div style={{
        borderRadius: 10, padding: "12px 14px", opacity: 0.6,
        background: "var(--bg-card, rgba(15,23,42,0.5))",
        border: "1px solid var(--border-primary, #1e293b)",
      }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: "#64748b", marginBottom: 8, display: "flex", alignItems: "center", gap: 4, fontFamily: "monospace", letterSpacing: "0.1em" }}>
          <Lock size={10} /> {isAr ? "معلومات ثابتة (غير قابلة للتعديل)" : "READ-ONLY FIELDS"}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
          <ReadOnlyField label={isAr ? "رقم الخطر" : "Risk ID"} value={risk.id} />
          <ReadOnlyField label={isAr ? "اسم الخطر" : "Risk Name"} value={risk.riskName || risk.risk_name} />
          <ReadOnlyField label={isAr ? "الإدارة" : "Department"} value={risk.department || risk.department_name} />
          <ReadOnlyField label={isAr ? "مالك الخطر" : "Risk Owner"} value={risk.owner || risk.risk_owner_name} />
          <ReadOnlyField label={isAr ? "نوع الخطر" : "Risk Type"} value={risk.riskType || risk.risk_type} />
          <ReadOnlyField
            label={isAr ? "الدرجة الكامنة" : "Inherent Score"}
            value={`${risk.inherentScore || risk.inherent_score}/25 (${risk.inherentLabel || risk.inherent_level || ""})`}
          />
          <ReadOnlyField label={isAr ? "تاريخ الإنشاء" : "Created"} value={risk.date || risk.created_at || "—"} />
        </div>
      </div>

      {/* Editable Section Header */}
      <p style={{ fontSize: 9, fontWeight: 700, color: "#06b6d4", fontFamily: "monospace", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 4 }}>
        <Edit3 size={10} /> {isAr ? "الحقول القابلة للتعديل" : "EDITABLE FIELDS"}
      </p>

      {/* Residual Risk Assessment */}
      <EditSection
        title={isAr ? "تقييم الخطر المتبقي" : "Residual Risk Assessment"}
        changed={changedFields.has("residual_likelihood") || changedFields.has("residual_impact")}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SliderField
            label={isAr ? "احتمالية الخطر المتبقي" : "Residual Likelihood"}
            value={formData.residual_likelihood}
            onChange={v => handleChange("residual_likelihood", v)}
            isAr={isAr}
          />
          <SliderField
            label={isAr ? "أثر الخطر المتبقي" : "Residual Impact"}
            value={formData.residual_impact}
            onChange={v => handleChange("residual_impact", v)}
            isAr={isAr}
          />
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(15,23,42,0.8)", border: "1px solid #1e293b",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>
              {isAr ? "الدرجة المتبقية (محسوبة تلقائياً):" : "Residual Score (auto-computed):"}
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: residualLevel.color, fontFamily: "monospace" }}>
              {residualScore}/25 — {isAr ? residualLevel.label.ar : residualLevel.label.en}
            </span>
          </div>
        </div>
      </EditSection>

      {/* Response Strategy */}
      <EditSection
        title={isAr ? "استراتيجية الاستجابة" : "Response Strategy"}
        changed={changedFields.has("response_type")}
      >
        <SelectField
          label={isAr ? "نوع الاستجابة" : "Response Type"}
          value={formData.response_type}
          onChange={v => handleChange("response_type", v)}
          options={[
            { value: "AVOID", label: isAr ? "تجنب" : "Avoid" },
            { value: "TRANSFER", label: isAr ? "تحويل" : "Transfer" },
            { value: "MITIGATE", label: isAr ? "تخفيف" : "Mitigate" },
            { value: "ACCEPT", label: isAr ? "قبول" : "Accept" },
          ]}
        />
      </EditSection>

      {/* Lifecycle Status */}
      <EditSection
        title={isAr ? "حالة دورة الحياة" : "Lifecycle Status"}
        changed={changedFields.has("lifecycle_status")}
      >
        <SelectField
          label={isAr ? "الحالة الحالية" : "Current Status"}
          value={formData.lifecycle_status}
          onChange={v => handleChange("lifecycle_status", v)}
          options={[
            { value: "IDENTIFIED", label: isAr ? "تم التحديد" : "Identified" },
            { value: "In Progress", label: isAr ? "قيد المعالجة" : "In Progress" },
            { value: "Monitored", label: isAr ? "تحت المراقبة" : "Monitored" },
            { value: "Closed", label: isAr ? "مغلق" : "Closed" },
            { value: "ESCALATED", label: isAr ? "تم التصعيد" : "Escalated" },
          ]}
        />
      </EditSection>

      {/* Mitigation Plan */}
      <EditSection
        title={isAr ? "خطة التخفيف" : "Mitigation Plan"}
        changed={changedFields.has("mitigation_plan")}
      >
        <TextAreaField
          label={isAr ? "وصف خطة التخفيف" : "Mitigation Plan Description"}
          value={formData.mitigation_plan}
          onChange={v => handleChange("mitigation_plan", v)}
          rows={4}
          placeholder={isAr ? "اكتب تفاصيل الإجراءات المتخذة أو المخطط لها..." : "Describe planned or taken mitigation actions..."}
        />
      </EditSection>

      {/* Implementation Timeframe */}
      <EditSection
        title={isAr ? "الإطار الزمني للتنفيذ" : "Implementation Timeframe"}
        changed={changedFields.has("implementation_timeframe")}
      >
        <SelectField
          label={isAr ? "الإطار الزمني" : "Timeframe"}
          value={formData.implementation_timeframe}
          onChange={v => handleChange("implementation_timeframe", v)}
          options={[
            { value: "IMMEDIATE", label: isAr ? "فوري" : "Immediate" },
            { value: "30_DAYS", label: isAr ? "30 يوم" : "30 Days" },
            { value: "90_DAYS", label: isAr ? "90 يوم" : "90 Days" },
            { value: "180_DAYS", label: isAr ? "180 يوم" : "180 Days" },
            { value: "ANNUAL", label: isAr ? "سنوي" : "Annual" },
          ]}
        />
      </EditSection>

      {/* Confidence Level */}
      <EditSection
        title={isAr ? "مستوى الثقة في التقييم" : "Assessment Confidence"}
        changed={changedFields.has("confidence_level")}
      >
        <SliderField
          label={isAr ? "مستوى الثقة" : "Confidence Level"}
          value={formData.confidence_level}
          onChange={v => handleChange("confidence_level", v)}
          isAr={isAr}
        />
      </EditSection>

      {/* Current Action */}
      <EditSection
        title={isAr ? "الإجراء الحالي" : "Current Action"}
        changed={changedFields.has("current_action")}
      >
        <TextAreaField
          label={isAr ? "ما الذي يتم العمل عليه حالياً؟" : "What is currently being worked on?"}
          value={formData.current_action}
          onChange={v => handleChange("current_action", v)}
          rows={3}
        />
      </EditSection>

      {/* Notes */}
      <EditSection
        title={isAr ? "ملاحظات إضافية" : "Additional Notes"}
        changed={changedFields.has("notes")}
      >
        <TextAreaField
          label={isAr ? "ملاحظات" : "Notes"}
          value={formData.notes}
          onChange={v => handleChange("notes", v)}
          rows={3}
        />
      </EditSection>
    </div>
  );
}
