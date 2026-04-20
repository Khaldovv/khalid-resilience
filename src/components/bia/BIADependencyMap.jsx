import { useState } from "react";
import { useBIA } from "../../context/BIAContext";
import { useToast } from "../ToastProvider";
import { Plus, Trash2, Server, Cpu, Users, Globe, MapPin, Database, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

const typeIcons = { IT_SYSTEM: Server, APPLICATION: Cpu, HUMAN_RESOURCE: Users, SUPPLIER: Globe, FACILITY: MapPin, DATA: Database };

export default function BIADependencyMap({ processId, lang = "en", readOnly = false }) {
  const { getDependenciesForProcess, addDependency, removeDependency, DEPENDENCY_TYPES } = useBIA();
  const toast = useToast();
  const isAr = lang === "ar";
  const deps = getDependenciesForProcess(processId);
  const [showAdd, setShowAdd] = useState(false);
  const [newDep, setNewDep] = useState({ dependency_type: "IT_SYSTEM", resource_name: "", resource_name_en: "", criticality: "IMPORTANT", has_alternative: false, alternative_description: "", min_staff_required: 0, vendor_contract_ref: "" });

  const critColors = { CRITICAL: "text-red-400 bg-red-950 border-red-800", IMPORTANT: "text-amber-400 bg-amber-950 border-amber-800", SUPPORTIVE: "text-emerald-400 bg-emerald-950 border-emerald-800" };
  const critLabels = { CRITICAL: { ar: "حرج", en: "Critical" }, IMPORTANT: { ar: "مهم", en: "Important" }, SUPPORTIVE: { ar: "داعم", en: "Supportive" } };

  const handleAdd = () => {
    if (!newDep.resource_name.trim()) { toast.error(isAr ? "اسم المورد مطلوب" : "Resource name is required"); return; }
    addDependency({ ...newDep, process_id: processId });
    toast.success(isAr ? "تمت إضافة الاعتمادية" : "Dependency added");
    setNewDep({ dependency_type: "IT_SYSTEM", resource_name: "", resource_name_en: "", criticality: "IMPORTANT", has_alternative: false, alternative_description: "", min_staff_required: 0, vendor_contract_ref: "" });
    setShowAdd(false);
  };

  const spof = deps.filter((d) => d.criticality === "CRITICAL" && !d.has_alternative);

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
        <div className={isAr ? "text-right" : ""}>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest">{isAr ? "خريطة الاعتماديات" : "DEPENDENCY MAP"}</p>
          <p className="text-sm font-bold text-white mt-0.5">{isAr ? "الموارد المطلوبة للعملية" : "Required Resources"}</p>
        </div>
        <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
          {spof.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-950 border border-red-800 px-2 py-1 rounded animate-pulse">
              <AlertTriangle size={10} />
              {spof.length} SPOF
            </span>
          )}
          {!readOnly && (
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors">
              <Plus size={12} />{isAr ? "إضافة" : "Add"}
            </button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="rounded-lg border border-cyan-800/30 bg-cyan-950/10 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">{isAr ? "النوع" : "Type"}</label>
              <select value={newDep.dependency_type} onChange={(e) => setNewDep((d) => ({ ...d, dependency_type: e.target.value }))}
                className="w-full px-2 py-2 rounded-lg text-xs text-slate-200 bg-slate-800 border border-slate-700 focus:outline-none">
                {DEPENDENCY_TYPES.map((t) => <option key={t.value} value={t.value}>{isAr ? t.ar : t.en}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">{isAr ? "اسم المورد" : "Resource Name"}</label>
              <input value={newDep.resource_name} onChange={(e) => setNewDep((d) => ({ ...d, resource_name: e.target.value }))}
                className="w-full px-2 py-2 rounded-lg text-xs text-slate-200 bg-slate-800 border border-slate-700 focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">{isAr ? "الأهمية" : "Criticality"}</label>
              <select value={newDep.criticality} onChange={(e) => setNewDep((d) => ({ ...d, criticality: e.target.value }))}
                className="w-full px-2 py-2 rounded-lg text-xs text-slate-200 bg-slate-800 border border-slate-700 focus:outline-none">
                <option value="CRITICAL">{isAr ? "حرج" : "Critical"}</option>
                <option value="IMPORTANT">{isAr ? "مهم" : "Important"}</option>
                <option value="SUPPORTIVE">{isAr ? "داعم" : "Supportive"}</option>
              </select>
            </div>
          </div>
          <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked={newDep.has_alternative} onChange={(e) => setNewDep((d) => ({ ...d, has_alternative: e.target.checked }))}
                className="rounded border-slate-600 bg-slate-800" />
              {isAr ? "يوجد بديل" : "Has Alternative"}
            </label>
            <button onClick={handleAdd} className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors">{isAr ? "حفظ" : "Save"}</button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors">{isAr ? "إلغاء" : "Cancel"}</button>
          </div>
        </div>
      )}

      {/* Dependencies Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-xs" style={{ direction: isAr ? "rtl" : "ltr" }}>
          <thead>
            <tr className="border-b border-slate-800" style={{ background: "rgba(15,23,42,0.9)" }}>
              {[isAr ? "النوع" : "Type", isAr ? "المورد" : "Resource", isAr ? "الأهمية" : "Criticality", isAr ? "بديل؟" : "Alt?", isAr ? "العدد" : "Staff", !readOnly ? "" : null].filter(Boolean).map((h) => (
                <th key={h} className={`px-3 py-2.5 ${isAr ? "text-right" : "text-left"} text-[10px] text-slate-500 font-semibold tracking-wider`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deps.map((d, i) => {
              const Icon = typeIcons[d.dependency_type] || Database;
              const typeLabel = DEPENDENCY_TYPES.find((t) => t.value === d.dependency_type);
              const isSpof = d.criticality === "CRITICAL" && !d.has_alternative;
              return (
                <tr key={d.id} className={`border-b border-slate-800/60 ${isSpof ? "bg-red-950/10" : i % 2 === 0 ? "" : "bg-slate-900/20"}`}>
                  <td className="px-3 py-3">
                    <div className={`flex items-center gap-1.5 ${isAr ? "flex-row-reverse" : ""}`}>
                      <Icon size={12} className="text-slate-500" />
                      <span className="text-slate-400">{typeLabel ? (isAr ? typeLabel.ar : typeLabel.en) : d.dependency_type}</span>
                    </div>
                  </td>
                  <td className={`px-3 py-3 text-slate-300 ${isAr ? "text-right" : ""}`}>
                    <span className="font-medium">{isAr ? d.resource_name : (d.resource_name_en || d.resource_name)}</span>
                    {isSpof && <span className="ml-2 text-[9px] text-red-400 font-mono">⚠ SPOF</span>}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${critColors[d.criticality]}`}>
                      {isAr ? critLabels[d.criticality].ar : critLabels[d.criticality].en}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {d.has_alternative ? <CheckCircle2 size={14} className="text-emerald-400 mx-auto" /> : <XCircle size={14} className="text-red-400 mx-auto" />}
                  </td>
                  <td className="px-3 py-3 text-center text-slate-400 font-mono">{d.min_staff_required || "—"}</td>
                  {!readOnly && (
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => { removeDependency(d.id); toast.success(isAr ? "تم الحذف" : "Removed"); }}
                        className="p-1 rounded hover:bg-red-950 text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {deps.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">{isAr ? "لا توجد اعتماديات" : "No dependencies added"}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
