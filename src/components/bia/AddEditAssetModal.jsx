import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useBIAAssets } from "../../context/BIAAssetContext";
import { X, Save } from "lucide-react";

const TYPES = [
  { value: "IT_SYSTEM",   en: "IT System",   ar: "نظام تقني" },
  { value: "APPLICATION", en: "Application",  ar: "تطبيق" },
  { value: "FACILITY",    en: "Facility",     ar: "مرفق" },
  { value: "EQUIPMENT",   en: "Equipment",    ar: "معدات" },
  { value: "PERSONNEL",   en: "Personnel",    ar: "أفراد" },
  { value: "VENDOR",      en: "Vendor",       ar: "مورد" },
  { value: "DATA",        en: "Data",         ar: "بيانات" },
  { value: "DOCUMENT",    en: "Document",     ar: "مستند" },
];

const CRITICALITY = [
  { value: "LOW",      en: "Low",      ar: "منخفض" },
  { value: "MEDIUM",   en: "Medium",   ar: "متوسط" },
  { value: "HIGH",     en: "High",     ar: "مرتفع" },
  { value: "CRITICAL", en: "Critical", ar: "حرج" },
];

const STATUS = [
  { value: "ACTIVE",         en: "Active",         ar: "نشط" },
  { value: "INACTIVE",       en: "Inactive",       ar: "غير نشط" },
  { value: "DECOMMISSIONED", en: "Decommissioned", ar: "ملغى" },
  { value: "PLANNED",        en: "Planned",        ar: "مخطط" },
];

const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="block text-[10px] text-slate-500 font-mono tracking-wider mb-1">{label}</label>
    {children}
  </div>
);

const inputClass = "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-600 transition-all";

export default function AddEditAssetModal({ asset = null, onClose }) {
  const { isRTL } = useApp();
  const { addAsset, updateAsset } = useBIAAssets();
  const isEdit = !!asset;

  const [form, setForm] = useState({
    name: asset?.name || "",
    name_ar: asset?.name_ar || "",
    asset_type: asset?.asset_type || "IT_SYSTEM",
    description: asset?.description || "",
    description_ar: asset?.description_ar || "",
    owner: asset?.owner || "",
    department: asset?.department || "",
    location: asset?.location || "",
    criticality: asset?.criticality || "MEDIUM",
    status: asset?.status || "ACTIVE",
    rto_hours: asset?.rto_hours ?? "",
    rpo_hours: asset?.rpo_hours ?? "",
    mtpd_hours: asset?.mtpd_hours ?? "",
    recovery_procedure: asset?.recovery_procedure || "",
    vendor_name: asset?.vendor_name || "",
    vendor_contact: asset?.vendor_contact || "",
    contract_expiry: asset?.contract_expiry || "",
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      rto_hours: form.rto_hours !== "" ? Number(form.rto_hours) : null,
      rpo_hours: form.rpo_hours !== "" ? Number(form.rpo_hours) : null,
      mtpd_hours: form.mtpd_hours !== "" ? Number(form.mtpd_hours) : null,
    };
    if (isEdit) {
      updateAsset(asset.id, data);
    } else {
      addAsset(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0f172a, #020817)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 z-10" style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)" }}>
          <div>
            <h2 className="text-lg font-bold text-white">{isEdit ? (isRTL ? "تعديل الأصل" : "Edit Asset") : (isRTL ? "إضافة أصل جديد" : "Add New Asset")}</h2>
            <p className="text-[10px] text-slate-500 font-mono">{isEdit ? asset.asset_code : (isRTL ? "سيتم إنشاء الكود تلقائياً" : "Code auto-generated")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={isRTL ? "الاسم (إنجليزي)" : "NAME (English)"}>
              <input value={form.name} onChange={e => set("name", e.target.value)} required className={inputClass} placeholder="Core Banking System" />
            </Field>
            <Field label={isRTL ? "الاسم (عربي)" : "NAME (Arabic)"}>
              <input value={form.name_ar} onChange={e => set("name_ar", e.target.value)} className={inputClass} placeholder="نظام الخدمات المصرفية" dir="rtl" />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label={isRTL ? "النوع" : "ASSET TYPE"}>
              <select value={form.asset_type} onChange={e => set("asset_type", e.target.value)} className={inputClass}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{isRTL ? t.ar : t.en}</option>)}
              </select>
            </Field>
            <Field label={isRTL ? "مستوى الأهمية" : "CRITICALITY"}>
              <select value={form.criticality} onChange={e => set("criticality", e.target.value)} className={inputClass}>
                {CRITICALITY.map(c => <option key={c.value} value={c.value}>{isRTL ? c.ar : c.en}</option>)}
              </select>
            </Field>
            <Field label={isRTL ? "الحالة" : "STATUS"}>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={inputClass}>
                {STATUS.map(s => <option key={s.value} value={s.value}>{isRTL ? s.ar : s.en}</option>)}
              </select>
            </Field>
          </div>

          {/* Description */}
          <Field label={isRTL ? "الوصف" : "DESCRIPTION"}>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} className={inputClass} placeholder={isRTL ? "وصف الأصل..." : "Asset description..."} />
          </Field>

          {/* Owner / Dept / Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label={isRTL ? "المالك" : "OWNER"}>
              <input value={form.owner} onChange={e => set("owner", e.target.value)} className={inputClass} />
            </Field>
            <Field label={isRTL ? "القسم" : "DEPARTMENT"}>
              <input value={form.department} onChange={e => set("department", e.target.value)} className={inputClass} />
            </Field>
            <Field label={isRTL ? "الموقع" : "LOCATION"}>
              <input value={form.location} onChange={e => set("location", e.target.value)} className={inputClass} />
            </Field>
          </div>

          {/* Recovery Objectives */}
          <div className="p-4 rounded-xl border border-slate-800" style={{ background: "rgba(6,182,212,0.03)" }}>
            <p className="text-[10px] text-cyan-400 font-mono tracking-wider mb-3">{isRTL ? "أهداف الاسترداد" : "RECOVERY OBJECTIVES"}</p>
            <div className="grid grid-cols-3 gap-4">
              <Field label="RTO (hours)">
                <input type="number" min="0" step="0.5" value={form.rto_hours} onChange={e => set("rto_hours", e.target.value)} className={inputClass} placeholder="4" />
              </Field>
              <Field label="RPO (hours)">
                <input type="number" min="0" step="0.5" value={form.rpo_hours} onChange={e => set("rpo_hours", e.target.value)} className={inputClass} placeholder="1" />
              </Field>
              <Field label="MTPD (hours)">
                <input type="number" min="0" step="0.5" value={form.mtpd_hours} onChange={e => set("mtpd_hours", e.target.value)} className={inputClass} placeholder="8" />
              </Field>
            </div>
            <Field label={isRTL ? "إجراء الاسترداد" : "RECOVERY PROCEDURE"} className="mt-3">
              <textarea value={form.recovery_procedure} onChange={e => set("recovery_procedure", e.target.value)} rows={2} className={inputClass} />
            </Field>
          </div>

          {/* Vendor Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label={isRTL ? "اسم المورد" : "VENDOR NAME"}>
              <input value={form.vendor_name} onChange={e => set("vendor_name", e.target.value)} className={inputClass} />
            </Field>
            <Field label={isRTL ? "جهة اتصال المورد" : "VENDOR CONTACT"}>
              <input value={form.vendor_contact} onChange={e => set("vendor_contact", e.target.value)} className={inputClass} />
            </Field>
            <Field label={isRTL ? "انتهاء العقد" : "CONTRACT EXPIRY"}>
              <input type="date" value={form.contract_expiry} onChange={e => set("contract_expiry", e.target.value)} className={inputClass} />
            </Field>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 rounded-lg border border-slate-700 hover:bg-slate-800 transition-all">
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-all active:scale-95">
              <Save size={12} />
              {isEdit ? (isRTL ? "حفظ التغييرات" : "Save Changes") : (isRTL ? "إضافة الأصل" : "Add Asset")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
