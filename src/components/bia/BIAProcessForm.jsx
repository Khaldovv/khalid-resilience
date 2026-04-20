import { useState } from "react";
import { useBIA } from "../../context/BIAContext";
import { useToast } from "../ToastProvider";
import { Save, AlertTriangle, Clock, Target, Database, ChevronDown } from "lucide-react";

export default function BIAProcessForm({ assessmentId, process = null, lang = "en", onSave, onCancel }) {
  const { addProcess, updateProcess, suggestRTO, CRITICALITY_LEVELS } = useBIA();
  const toast = useToast();
  const isAr = lang === "ar";
  const isEdit = !!process;

  const [form, setForm] = useState({
    process_name: process?.process_name || "",
    process_name_en: process?.process_name_en || "",
    description: process?.description || "",
    process_owner: process?.process_owner || "",
    process_owner_en: process?.process_owner_en || "",
    criticality_level: process?.criticality_level || "HIGH",
    mtpd_hours: process?.mtpd_hours || 24,
    rto_hours: process?.rto_hours || 16.8,
    rpo_hours: process?.rpo_hours || 8,
    mbco_percent: process?.mbco_percent || 50,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.process_name.trim()) e.process_name = isAr ? "اسم العملية مطلوب" : "Process name is required";
    if (form.mtpd_hours <= 0) e.mtpd_hours = isAr ? "MTPD يجب أن يكون أكبر من صفر" : "MTPD must be > 0";
    if (form.rto_hours >= form.mtpd_hours) e.rto_hours = isAr ? "RTO يجب أن يكون أقل من MTPD" : "RTO must be < MTPD";
    if (form.rpo_hours > form.rto_hours) e.rpo_hours = isAr ? "RPO يجب أن يكون ≤ RTO" : "RPO must be ≤ RTO";
    if (form.mbco_percent < 0 || form.mbco_percent > 100) e.mbco_percent = isAr ? "MBCO بين 0-100%" : "MBCO must be 0-100%";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    try {
      if (isEdit) {
        updateProcess(process.id, form);
        toast.success(isAr ? "تم تحديث العملية الحيوية" : "Process updated successfully");
      } else {
        addProcess({ ...form, assessment_id: assessmentId });
        toast.success(isAr ? "تمت إضافة العملية الحيوية" : "Process added successfully");
      }
      onSave && onSave();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMTPDChange = (val) => {
    const mtpd = parseFloat(val) || 0;
    const rto = suggestRTO(mtpd);
    setForm((f) => ({ ...f, mtpd_hours: mtpd, rto_hours: rto, rpo_hours: Math.min(f.rpo_hours, rto) }));
  };

  const critLabel = (level) => {
    const c = CRITICALITY_LEVELS.find((l) => l.value === level);
    return c ? (isAr ? c.ar : c.en) : level;
  };

  const InputField = ({ label, field, type = "text", suffix, error, min, max, step }) => (
    <div>
      <label className={`block text-[11px] text-slate-400 mb-1.5 font-medium ${isAr ? "text-right" : ""}`}>{label}</label>
      <div className="relative">
        <input
          type={type}
          value={form[field]}
          onChange={(e) => setForm((f) => ({ ...f, [field]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
          min={min} max={max} step={step}
          className={`w-full px-3 py-2.5 rounded-lg text-xs text-slate-200 bg-slate-800 border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors ${isAr ? "text-right" : ""}
            ${error ? "border-red-700 bg-red-950/20" : "border-slate-700"}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">{suffix}</span>}
      </div>
      {error && <p className={`text-[10px] text-red-400 mt-1 ${isAr ? "text-right" : ""}`}>{error}</p>}
    </div>
  );

  return (
    <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
        <p className="text-sm font-bold text-white">
          {isEdit ? (isAr ? "تعديل العملية الحيوية" : "Edit Critical Process") : (isAr ? "إضافة عملية حيوية" : "Add Critical Process")}
        </p>
        <span className="text-[9px] font-mono text-slate-600">ISO 22301 · Cl. 8.2.2</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField label={isAr ? "اسم العملية (عربي)" : "Process Name (Arabic)"} field="process_name" error={errors.process_name} />
        <InputField label={isAr ? "اسم العملية (إنجليزي)" : "Process Name (English)"} field="process_name_en" />
        <div className="md:col-span-2">
          <label className={`block text-[11px] text-slate-400 mb-1.5 font-medium ${isAr ? "text-right" : ""}`}>
            {isAr ? "الوصف التفصيلي" : "Description"}
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className={`w-full px-3 py-2.5 rounded-lg text-xs text-slate-200 bg-slate-800 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none ${isAr ? "text-right" : ""}`}
          />
        </div>
        <InputField label={isAr ? "مالك العملية (عربي)" : "Process Owner (Arabic)"} field="process_owner" />
        <InputField label={isAr ? "مالك العملية (إنجليزي)" : "Process Owner (English)"} field="process_owner_en" />

        {/* Criticality Level */}
        <div>
          <label className={`block text-[11px] text-slate-400 mb-1.5 font-medium ${isAr ? "text-right" : ""}`}>
            {isAr ? "مستوى الأهمية" : "Criticality Level"}
          </label>
          <select
            value={form.criticality_level}
            onChange={(e) => setForm((f) => ({ ...f, criticality_level: e.target.value }))}
            className={`w-full px-3 py-2.5 rounded-lg text-xs text-slate-200 bg-slate-800 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer ${isAr ? "text-right" : ""}`}
          >
            {CRITICALITY_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{isAr ? l.ar : l.en}</option>
            ))}
          </select>
        </div>

        <InputField label="MBCO (%)" field="mbco_percent" type="number" min={0} max={100} suffix="%" error={errors.mbco_percent} />
      </div>

      {/* Time Recovery Metrics */}
      <div className="border border-slate-800 rounded-lg p-4" style={{ background: "rgba(15,23,42,0.6)" }}>
        <p className={`text-[10px] font-mono text-slate-500 tracking-widest mb-3 ${isAr ? "text-right" : ""}`}>
          {isAr ? "مقاييس التعافي الزمنية" : "TIME RECOVERY METRICS"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className={`flex items-center gap-1.5 mb-1.5 ${isAr ? "flex-row-reverse" : ""}`}>
              <Clock size={11} className="text-red-400" />
              <span className="text-[11px] text-slate-400 font-medium">MTPD</span>
              <span className="text-[9px] text-slate-600">({isAr ? "الحد الأقصى للانقطاع" : "Max Tolerable Downtime"})</span>
            </div>
            <input
              type="number" step="0.5" min="0.5"
              value={form.mtpd_hours}
              onChange={(e) => handleMTPDChange(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-lg text-xs text-white bg-red-950/30 border font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-red-500 ${errors.mtpd_hours ? "border-red-700" : "border-red-800/50"}`}
            />
            <p className="text-[9px] text-slate-600 mt-1 text-center">{isAr ? "بالساعات" : "in hours"}</p>
          </div>
          <div>
            <div className={`flex items-center gap-1.5 mb-1.5 ${isAr ? "flex-row-reverse" : ""}`}>
              <Target size={11} className="text-amber-400" />
              <span className="text-[11px] text-slate-400 font-medium">RTO</span>
              <span className="text-[9px] text-slate-600">({isAr ? "هدف وقت التعافي" : "Recovery Time Objective"})</span>
            </div>
            <input
              type="number" step="0.1" min="0.1"
              value={form.rto_hours}
              onChange={(e) => setForm((f) => ({ ...f, rto_hours: parseFloat(e.target.value) || 0 }))}
              className={`w-full px-3 py-2.5 rounded-lg text-xs text-white bg-amber-950/30 border font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-amber-500 ${errors.rto_hours ? "border-red-700" : "border-amber-800/50"}`}
            />
            {errors.rto_hours ? (
              <p className="text-[9px] text-red-400 mt-1 text-center flex items-center justify-center gap-1">
                <AlertTriangle size={9} />{errors.rto_hours}
              </p>
            ) : (
              <p className="text-[9px] text-emerald-500 mt-1 text-center">
                RTO {"<"} MTPD ✓ ({isAr ? "هامش أمان" : "Safety margin"}: {((1 - form.rto_hours / form.mtpd_hours) * 100).toFixed(0)}%)
              </p>
            )}
          </div>
          <div>
            <div className={`flex items-center gap-1.5 mb-1.5 ${isAr ? "flex-row-reverse" : ""}`}>
              <Database size={11} className="text-cyan-400" />
              <span className="text-[11px] text-slate-400 font-medium">RPO</span>
              <span className="text-[9px] text-slate-600">({isAr ? "هدف نقطة التعافي" : "Recovery Point Objective"})</span>
            </div>
            <input
              type="number" step="0.25" min="0"
              value={form.rpo_hours}
              onChange={(e) => setForm((f) => ({ ...f, rpo_hours: parseFloat(e.target.value) || 0 }))}
              className={`w-full px-3 py-2.5 rounded-lg text-xs text-white bg-cyan-950/30 border font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 ${errors.rpo_hours ? "border-red-700" : "border-cyan-800/50"}`}
            />
            {errors.rpo_hours && <p className="text-[9px] text-red-400 mt-1 text-center">{errors.rpo_hours}</p>}
          </div>
        </div>

        {/* Visual timeline */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="relative h-6">
            <div className="absolute inset-x-0 top-1/2 h-1 bg-slate-800 rounded-full -translate-y-1/2" />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-500 border-2 border-cyan-300" style={{ left: `${Math.min((form.rpo_hours / form.mtpd_hours) * 100, 100)}%` }} title={`RPO: ${form.rpo_hours}h`} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500 border-2 border-amber-300" style={{ left: `${Math.min((form.rto_hours / form.mtpd_hours) * 100, 100)}%` }} title={`RTO: ${form.rto_hours}h`} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-red-300" style={{ left: "100%" }} title={`MTPD: ${form.mtpd_hours}h`} />
          </div>
          <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-slate-600">
            <span>0h</span>
            <span className="text-cyan-400">RPO {form.rpo_hours}h</span>
            <span className="text-amber-400">RTO {form.rto_hours}h</span>
            <span className="text-red-400">MTPD {form.mtpd_hours}h</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
        <button onClick={handleSubmit} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors">
          <Save size={12} />
          {isEdit ? (isAr ? "تحديث" : "Update") : (isAr ? "حفظ العملية" : "Save Process")}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors">
            {isAr ? "إلغاء" : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}
