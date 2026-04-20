import { FileText } from "lucide-react";
import { SectionHeader, SelectField, TextField, TextareaField, makeLabelStyle, makeInputStyle, focusHandler, blurHandler, departments, riskTypes } from "./riskFormUtils";

export default function BasicInfoStep({ form, set, lang, t, sp }) {
  const isAr = lang === "ar";
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <SectionHeader icon={FileText} title={t.sec1} isAr={isAr} />
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: "1 1 0" }}>
          <label style={makeLabelStyle(isAr)}>{t.date}</label>
          <input type="date" value={form.date}
            onChange={(e) => set("date", e.target.value)}
            style={{ ...makeInputStyle(isAr), cursor: "pointer", colorScheme: "dark" }}
            onFocus={focusHandler} onBlur={blurHandler}
          />
        </div>
        <SelectField label={t.department} value={form.department}
          onChange={(v) => set("department", v)} options={departments[lang]} required half {...sp} />
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
        <TextField label={t.riskName} value={form.riskName}
          onChange={(v) => set("riskName", v)} placeholder={t.namePh} required half {...sp} />
        <SelectField label={t.riskType} value={form.riskType}
          onChange={(v) => set("riskType", v)} options={riskTypes[lang]} required half {...sp} />
      </div>
      <div style={{ marginTop: 10 }}>
        <TextareaField label={t.description} value={form.description}
          onChange={(v) => set("description", v)} placeholder={t.descPh} required rows={3} {...sp} />
      </div>
    </div>
  );
}
