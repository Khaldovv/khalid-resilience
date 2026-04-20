import { AlertTriangle, Shield, Info } from "lucide-react";
import {
  SectionHeader, NumberSelect, RiskLevelBadge, TextareaField, SelectField,
  controlEffectivenessOpts, confidenceLevels, getRiskLevel,
} from "./riskFormUtils";

export default function AssessmentStep({ form, set, lang, t, sp }) {
  const isAr = lang === "ar";

  const inherentLevel = (form.inherentLikelihood && form.inherentImpact)
    ? getRiskLevel(Number(form.inherentLikelihood), Number(form.inherentImpact))
    : null;

  const residualLevel = (form.residualLikelihood && form.residualImpact)
    ? getRiskLevel(Number(form.residualLikelihood), Number(form.residualImpact))
    : null;

  const inherentScore = inherentLevel?.score || 0;
  const residualScore = residualLevel?.score || 0;
  const isResidualInvalid = inherentScore > 0 && residualScore > 0 && residualScore > inherentScore;

  const isResidualLikelihoodDisabled = (n) => {
    if (!form.residualImpact || !inherentScore) return false;
    return (n * Number(form.residualImpact)) > inherentScore;
  };
  const isResidualImpactDisabled = (n) => {
    if (!form.residualLikelihood || !inherentScore) return false;
    return (Number(form.residualLikelihood) * n) > inherentScore;
  };
  const residualDisabledTitle = isAr
    ? `لا يمكن أن تتجاوز الدرجة المتبقية الدرجة الكامنة (${inherentScore}/25)`
    : `Residual score cannot exceed inherent score (${inherentScore}/25)`;

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <SectionHeader icon={AlertTriangle} title={isAr ? "تقييم المخاطر الكامنة" : "Inherent Risk Assessment"} isAr={isAr} />
      <div style={{ display: "flex", gap: 14 }}>
        <NumberSelect label={t.likelihood} value={form.inherentLikelihood}
          onChange={(v) => set("inherentLikelihood", v)} required {...sp} />
        <NumberSelect label={t.impact} value={form.inherentImpact}
          onChange={(v) => set("inherentImpact", v)} required {...sp} />
      </div>
      <RiskLevelBadge level={inherentLevel} label={t.riskLevel} isAr={isAr} lang={lang} />

      <div style={{ marginTop: 16 }} />
      <SectionHeader icon={Shield} title={isAr ? "التدابير والمخاطر المتبقية" : "Controls & Residual Risk"} isAr={isAr} />
      <TextareaField label={t.preventive} value={form.preventiveMeasures}
        onChange={(v) => set("preventiveMeasures", v)} placeholder={t.preventivePh} rows={2} {...sp} />
      <div style={{ marginTop: 8 }}>
        <SelectField label={t.controlEff} value={form.controlEffectiveness}
          onChange={(v) => set("controlEffectiveness", v)} options={controlEffectivenessOpts[lang]} {...sp} />
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
        <NumberSelect label={t.resLikelihood} value={form.residualLikelihood}
          onChange={(v) => set("residualLikelihood", v)}
          disabledFn={isResidualLikelihoodDisabled} disabledTitle={residualDisabledTitle} {...sp} />
        <NumberSelect label={t.resImpact} value={form.residualImpact}
          onChange={(v) => set("residualImpact", v)}
          disabledFn={isResidualImpactDisabled} disabledTitle={residualDisabledTitle} {...sp} />
      </div>
      <RiskLevelBadge level={residualLevel} label={t.resLevel} isAr={isAr} lang={lang} />

      {/* ISO 31000 guidance */}
      {inherentScore > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px", borderRadius: 8, marginTop: 6,
          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
          fontSize: 11, color: "#f59e0b", direction: isAr ? "rtl" : "ltr",
        }}>
          <Info size={12} style={{ flexShrink: 0 }} />
          {isAr
            ? `الحد الأقصى للدرجة المتبقية: ${inherentScore}/25 — وفق ISO 31000، الضوابط تُقلل الخطر ولا تزيده`
            : `Max residual score: ${inherentScore}/25 — per ISO 31000, controls only reduce risk`}
        </div>
      )}

      {/* ISO 31000 violation error */}
      {isResidualInvalid && (
        <div style={{
          padding: 12, borderRadius: 10, marginTop: 8,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#ef4444", fontWeight: 700, fontSize: 13 }}>
            <AlertTriangle size={16} />
            {isAr ? "مخالفة منهجية وفق ISO 31000" : "ISO 31000 Methodological Violation"}
          </div>
          <p style={{ color: "#94a3b8", fontSize: 11, marginTop: 6, lineHeight: 1.6 }}>
            {isAr
              ? `الخطر المتبقي (${residualScore}) لا يمكن أن يكون أعلى من الخطر الكامن (${inherentScore}). الضوابط تُخفّض المخاطر — لا تزيدها.`
              : `Residual risk (${residualScore}) cannot exceed inherent risk (${inherentScore}). Controls reduce risk — they don't increase it.`}
          </p>
        </div>
      )}

      {/* Confidence Level */}
      <div style={{ marginTop: 14 }}>
        <SelectField label={t.confidenceLevel} value={form.confidenceLevel}
          onChange={(v) => set("confidenceLevel", v)} options={confidenceLevels[lang]} required {...sp} />
        {form.confidenceLevel && (
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {[1,2,3,4,5].map(n => (
              <div key={n} style={{
                flex: 1, height: 6, borderRadius: 3,
                background: n <= Number(form.confidenceLevel.charAt(0))
                  ? ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4"][n-1]
                  : "#1e293b",
                transition: "background 0.2s",
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
