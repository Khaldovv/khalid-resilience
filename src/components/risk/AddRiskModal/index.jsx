import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { useToast } from "../../ToastProvider";
import { useCrisis } from "../../../context/CrisisContext";
import BasicInfoStep from "./BasicInfoStep";
import AssessmentStep from "./AssessmentStep";
import ResponseStep from "./ResponseStep";
import { initialForm, DRAFT_KEY, getLabels, getRiskLevel, getNextRiskId, StepIndicator } from "./riskFormUtils";

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — 3-Step Risk Wizard with Auto-Save
// ═══════════════════════════════════════════════════════════════════════════════
export default function AddRiskModal({ isOpen, onClose, onSave, lang = "en" }) {
  const toast = useToast();
  const { activateCrisis } = useCrisis();
  const isAr = lang === "ar";
  const [step, setStep] = useState(0);

  // ─── Draft restore ───────────────────────────────────────────────────────
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) return { ...initialForm, ...JSON.parse(saved) };
    } catch {}
    return { ...initialForm };
  });

  // ─── Auto-save ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (form.riskName || form.description || form.department) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }
  }, [form, isOpen]);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.riskName || parsed.description) {
            toast.info(isAr ? "♻️ تم استعادة المسودة المحفوظة تلقائياً" : "♻️ Draft restored — your unsaved work is back");
          }
        }
      } catch {}
    }
  }, [isOpen]);

  // ─── Escape ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const t = getLabels(isAr);
  const sp = { isAr, requiredText: t.required, selectText: t.select };
  const stepLabels = [t.sec1, t.sec2, t.sec3];

  // ─── Computed ───────────────────────────────────────────────────────────
  const inherentLevel = (form.inherentLikelihood && form.inherentImpact)
    ? getRiskLevel(Number(form.inherentLikelihood), Number(form.inherentImpact)) : null;
  const residualLevel = (form.residualLikelihood && form.residualImpact)
    ? getRiskLevel(Number(form.residualLikelihood), Number(form.residualImpact)) : null;
  const isResidualInvalid = (inherentLevel?.score || 0) > 0 && (residualLevel?.score || 0) > 0
    && (residualLevel?.score || 0) > (inherentLevel?.score || 0);
  const isMitigate = form.responseType === (isAr ? "تخفيف" : "Mitigate");

  // ─── Step validation ────────────────────────────────────────────────────
  const validateStep = (s) => {
    if (s === 0 && (!form.riskName || !form.department || !form.riskType || !form.description)) {
      toast.error(isAr ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return false;
    }
    if (s === 1 && (!form.inherentLikelihood || !form.inherentImpact)) {
      toast.error(isAr ? "يرجى إكمال تقييم المخاطر الكامنة" : "Please complete inherent risk assessment");
      return false;
    }
    return true;
  };

  const nextStep = () => { if (validateStep(step)) setStep(Math.min(step + 1, 2)); };
  const prevStep = () => setStep(Math.max(step - 1, 0));

  // ─── Save ───────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.confidenceLevel) {
      toast.error(isAr ? "يرجى تحديد مستوى الثقة في التقييم" : "Please select a confidence level");
      return;
    }
    if (isResidualInvalid) {
      toast.error(isAr ? "مخالفة ISO 31000: الخطر المتبقي لا يمكن أن يتجاوز الخطر الكامن" : "ISO 31000 violation: Residual risk cannot exceed inherent risk");
      return;
    }

    const riskId = getNextRiskId();
    const newRisk = {
      id: riskId, date: form.date, department: form.department,
      riskName: form.riskName, description: form.description,
      riskType: form.riskType, category: form.riskType,
      inherentLikelihood: Number(form.inherentLikelihood),
      inherentImpact: Number(form.inherentImpact),
      inherentScore: inherentLevel?.score || 0,
      inherentLabel: inherentLevel?.label[lang] || "",
      inherentColor: inherentLevel?.color || "#94a3b8",
      inherent: inherentLevel?.label[lang] || "",
      residualLikelihood: Number(form.residualLikelihood) || 0,
      residualImpact: Number(form.residualImpact) || 0,
      residualScore: residualLevel?.score || 0,
      residualLabel: residualLevel?.label[lang] || "",
      residualColor: residualLevel?.color || "#94a3b8",
      residual: residualLevel?.label[lang] || "",
      preventiveMeasures: form.preventiveMeasures,
      controlEffectiveness: form.controlEffectiveness,
      owner: form.riskOwner, responseType: form.responseType,
      mitigationPlan: isMitigate ? form.mitigationPlan : "",
      planOwner: isMitigate ? form.planOwner : "",
      implementationTime: isMitigate ? form.implementationTime : "",
      responsibleDept: isMitigate ? form.responsibleDept : "",
      notes: form.notes,
      status: isAr ? "مسودة" : "Draft",
      lifecycleStatus: form.lifecycleStatus || (isAr ? "مُحدَّد" : "Identified"),
      aiStatus: isAr ? "في الانتظار" : "Pending Review", aiColor: "blue",
      score: inherentLevel?.score || 0, riskScore: inherentLevel?.score || 0, delta: 0,
      confidenceLevel: Number(form.confidenceLevel) || 3,
    };

    onSave(newRisk);
    toast.success(isAr ? `تمت إضافة الخطر ${riskId} بنجاح` : `Risk ${riskId} added successfully`);

    if (inherentLevel && inherentLevel.score >= 20) {
      activateCrisis({ riskName: form.riskName, riskId, score: inherentLevel.score });
      toast.error(isAr
        ? `⚠️ وضع الأزمة مفعّل! خطر كارثي (${inherentLevel.score})`
        : `⚠️ CRISIS MODE ACTIVATED! Catastrophic Risk (Score ${inherentLevel.score})`
      );
    }

    localStorage.removeItem(DRAFT_KEY);
    setForm({ ...initialForm });
    setStep(0);
    onClose();
  };

  const handleClose = () => {
    localStorage.removeItem(DRAFT_KEY);
    setForm({ ...initialForm });
    setStep(0);
    onClose();
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────
  const modalContent = (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(5,10,24,0.8)", backdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease",
      }} />

      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999, width: "min(740px, 95vw)",
        background: "linear-gradient(180deg, #0f172a, #020817)",
        border: "1px solid #1e293b", borderRadius: 20, overflow: "hidden",
        boxShadow: "0 25px 80px rgba(0,0,0,0.8), 0 0 40px rgba(6,182,212,0.08)",
        animation: "slideUp 0.3s ease",
        direction: isAr ? "rtl" : "ltr",
        display: "flex", flexDirection: "column", maxHeight: "92vh",
      }}>

        {/* Header */}
        <div style={{
          padding: "16px 24px", borderBottom: "1px solid #1e293b",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(6,182,212,0.04)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><Plus size={17} style={{ color: "#06b6d4" }} /></div>
            <div>
              <p style={{ color: "white", fontSize: 16, fontWeight: 700, margin: 0 }}>{t.title}</p>
              <p style={{ color: "#64748b", fontSize: 10, margin: 0, marginTop: 2 }}>
                {isAr ? "رمز الخطر يُولَّد تلقائياً" : "Risk ID is auto-generated"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6,
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
            }}>
              <Save size={10} style={{ color: "#10b981" }} />
              <span style={{ fontSize: 9, color: "#10b981", fontWeight: 600 }}>
                {isAr ? "حفظ تلقائي" : "Auto-saved"}
              </span>
            </div>
            <button onClick={handleClose} style={{
              width: 30, height: 30, borderRadius: 8, border: "1px solid #334155",
              background: "rgba(15,23,42,0.8)", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: "#64748b", transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; }}
            ><X size={14} /></button>
          </div>
        </div>

        <StepIndicator step={step} totalSteps={3} steps={stepLabels} isAr={isAr} />

        {/* Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {step === 0 && <BasicInfoStep form={form} set={set} lang={lang} t={t} sp={sp} />}
          {step === 1 && <AssessmentStep form={form} set={set} lang={lang} t={t} sp={sp} />}
          {step === 2 && <ResponseStep form={form} set={set} lang={lang} t={t} sp={sp} />}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 24px", borderTop: "1px solid #1e293b",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(15,23,42,0.5)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && (
              <button onClick={prevStep} style={{
                padding: "9px 18px", borderRadius: 10, background: "#1e293b",
                border: "1px solid #334155", color: "#94a3b8", fontSize: 13,
                fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 6,
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#334155"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#1e293b"; }}
              >
                {isAr ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                {t.prev}
              </button>
            )}
            <button onClick={handleClose} style={{
              padding: "9px 18px", borderRadius: 10, background: "transparent",
              border: "1px solid #334155", color: "#64748b", fontSize: 12,
              fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            }}>{t.cancel}</button>
          </div>

          {step < 2 ? (
            <button onClick={nextStep} style={{
              padding: "9px 24px", borderRadius: 10,
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              border: "1px solid rgba(6,182,212,0.5)", color: "#020817",
              fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 4px 16px rgba(6,182,212,0.25)",
              display: "flex", alignItems: "center", gap: 6,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(6,182,212,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(6,182,212,0.25)"; }}
            >
              {t.next}
              {isAr ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <button onClick={handleSave} style={{
              padding: "9px 24px", borderRadius: 10,
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              border: "1px solid rgba(6,182,212,0.5)", color: "#020817",
              fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
              boxShadow: "0 4px 16px rgba(6,182,212,0.25)",
              display: "flex", alignItems: "center", gap: 6,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(6,182,212,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(6,182,212,0.25)"; }}
            ><Plus size={14} />{t.save}</button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -46%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      `}</style>
    </>
  );

  return createPortal(modalContent, document.body);
}
