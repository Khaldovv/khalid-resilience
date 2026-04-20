import { Activity, ClipboardList, Users, Shield, Plus } from "lucide-react";
import {
  SectionHeader, TextField, TextareaField, SelectField,
  makeLabelStyle, responseTypes, lifecycleStatuses, quarterOpts,
} from "./riskFormUtils";

export default function ResponseStep({ form, set, lang, t, sp }) {
  const isAr = lang === "ar";
  const isMitigate = form.responseType === (isAr ? "تخفيف" : "Mitigate");

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <SectionHeader icon={Activity} title={isAr ? "الاستجابة للخطر" : "Risk Response & Mitigation"} isAr={isAr} />
      <div style={{ display: "flex", gap: 14 }}>
        <TextField label={t.owner} value={form.riskOwner}
          onChange={(v) => set("riskOwner", v)} placeholder={t.ownerPh} half {...sp} />
        <SelectField label={t.responseType} value={form.responseType}
          onChange={(v) => set("responseType", v)} options={responseTypes[lang]} half {...sp} />
      </div>

      {isMitigate && (
        <div style={{
          padding: 14, borderRadius: 12, marginTop: 10,
          background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)",
          display: "flex", flexDirection: "column", gap: 12,
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 600, color: "#22d3ee",
            direction: isAr ? "rtl" : "ltr",
          }}>
            <ClipboardList size={12} />
            {isAr ? "تفاصيل خطة التخفيف" : "Mitigation Plan Details"}
          </div>
          {/* Multiple controls */}
          <div>
            <label style={makeLabelStyle(isAr)}>
              {isAr ? "الضوابط/الإجراءات الوقائية" : "Controls / Preventive Measures"}
            </label>
            {(form.mitigationPlan ? form.mitigationPlan.split('\n').filter(Boolean) : ['']).map((ctrl, idx, arr) => (
              <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", minWidth: 18 }}>{idx + 1}.</span>
                <input value={ctrl}
                  onChange={(e) => {
                    const lines = form.mitigationPlan ? form.mitigationPlan.split('\n') : [''];
                    lines[idx] = e.target.value;
                    set("mitigationPlan", lines.join('\n'));
                  }}
                  placeholder={isAr ? `الإجراء الوقائي ${idx + 1}...` : `Preventive measure ${idx + 1}...`}
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 8,
                    background: "#0f172a", border: "1px solid #334155",
                    color: "#e2e8f0", fontSize: 12, outline: "none",
                    direction: isAr ? "rtl" : "ltr",
                  }}
                />
                {arr.length > 1 && (
                  <button type="button" onClick={() => {
                    const lines = form.mitigationPlan.split('\n').filter(Boolean);
                    lines.splice(idx, 1);
                    set("mitigationPlan", lines.join('\n'));
                  }} style={{
                    width: 24, height: 24, borderRadius: 6, border: "1px solid #334155",
                    background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => set("mitigationPlan", (form.mitigationPlan || '') + '\n')}
              style={{
                display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                borderRadius: 6, border: "1px dashed #334155", background: "transparent",
                color: "#06b6d4", cursor: "pointer", fontSize: 11, fontWeight: 600, marginTop: 2,
              }}>
              <Plus size={12} />
              {isAr ? "إضافة إجراء وقائي" : "Add preventive measure"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <TextField label={t.planOwner} value={form.planOwner}
              onChange={(v) => set("planOwner", v)} placeholder={t.planOwnerPh} half {...sp} />
            <SelectField label={t.implTime} value={form.implementationTime}
              onChange={(v) => set("implementationTime", v)} options={quarterOpts} half {...sp} />
          </div>
          <TextField label={t.respDept} value={form.responsibleDept}
            onChange={(v) => set("responsibleDept", v)} placeholder={t.respDeptPh} {...sp} />
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <TextareaField label={t.notes} value={form.notes}
          onChange={(v) => set("notes", v)} placeholder={t.notesPh} rows={2} {...sp} />
      </div>

      <div style={{ marginTop: 10 }}>
        <SectionHeader icon={Users} title={isAr ? "دورة حياة الخطر" : "Risk Lifecycle"} isAr={isAr} />
        <SelectField label={t.lifecycle} value={form.lifecycleStatus}
          onChange={(v) => set("lifecycleStatus", v)} options={lifecycleStatuses[lang]} {...sp} />
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 12px", borderRadius: 8, marginTop: 8,
          background: "rgba(6,182,212,0.06)", border: "1px solid #1e293b",
          fontSize: 11, color: "#64748b", direction: isAr ? "rtl" : "ltr",
        }}>
          <Shield size={12} style={{ color: "#06b6d4" }} />
          {isAr ? "الحالة الافتراضية للخطر الجديد: مسودة (Draft)" : "Default status for new risks: Draft"}
        </div>
      </div>
    </div>
  );
}
