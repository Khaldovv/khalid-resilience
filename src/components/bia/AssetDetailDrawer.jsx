import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useBIAAssets } from "../../context/BIAAssetContext";
import {
  X, Server, Monitor, Building2, HardDrive, Users, Truck, Database as DbIcon,
  FileText, GitBranch, Clock, Shield, Activity, AlertTriangle, Link as LinkIcon,
  Calendar, MapPin, User
} from "lucide-react";

const TYPE_META = {
  IT_SYSTEM:   { icon: Server,    color: "#06b6d4", label: "IT System",   labelAr: "نظام تقني" },
  APPLICATION: { icon: Monitor,   color: "#8b5cf6", label: "Application", labelAr: "تطبيق" },
  FACILITY:    { icon: Building2, color: "#f59e0b", label: "Facility",    labelAr: "مرفق" },
  EQUIPMENT:   { icon: HardDrive, color: "#64748b", label: "Equipment",   labelAr: "معدات" },
  PERSONNEL:   { icon: Users,     color: "#ec4899", label: "Personnel",   labelAr: "أفراد" },
  VENDOR:      { icon: Truck,     color: "#f97316", label: "Vendor",      labelAr: "مورد" },
  DATA:        { icon: DbIcon,    color: "#10b981", label: "Data",        labelAr: "بيانات" },
  DOCUMENT:    { icon: FileText,  color: "#3b82f6", label: "Document",    labelAr: "مستند" },
};

const CRIT_META = {
  LOW:      { color: "#22c55e", label: "Low",      labelAr: "منخفض" },
  MEDIUM:   { color: "#f59e0b", label: "Medium",   labelAr: "متوسط" },
  HIGH:     { color: "#ef4444", label: "High",     labelAr: "مرتفع" },
  CRITICAL: { color: "#dc2626", label: "Critical", labelAr: "حرج" },
};

const STATUS_META = {
  ACTIVE:         { color: "#10b981", label: "Active",         labelAr: "نشط" },
  INACTIVE:       { color: "#64748b", label: "Inactive",       labelAr: "غير نشط" },
  DECOMMISSIONED: { color: "#ef4444", label: "Decommissioned", labelAr: "ملغى" },
  PLANNED:        { color: "#3b82f6", label: "Planned",        labelAr: "مخطط" },
};

const InfoRow = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 py-2 border-b border-slate-800/50">
    <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-800/50">
      <Icon size={12} style={{ color: color || "#94a3b8" }} />
    </div>
    <span className="text-[10px] text-slate-500 w-28 shrink-0">{label}</span>
    <span className="text-xs text-slate-300 flex-1">{value || "—"}</span>
  </div>
);

export default function AssetDetailDrawer({ asset, onClose }) {
  const { isRTL } = useApp();
  const { getAssetLinks, getAssetDeps, getInheritedRTO, getEffectiveCriticality } = useBIAAssets();
  const [tab, setTab] = useState("details");

  if (!asset) return null;

  const tmeta = TYPE_META[asset.asset_type];
  const cmeta = CRIT_META[asset.criticality];
  const smeta = STATUS_META[asset.status];
  const links = getAssetLinks(asset.id);
  const deps = getAssetDeps(asset.id);
  const iRTO = getInheritedRTO(asset.id);
  const effCrit = getEffectiveCriticality(asset);
  const effCmeta = CRIT_META[effCrit];
  const TIcon = tmeta?.icon || Server;

  const tabs = [
    { id: "details",  label: isRTL ? "التفاصيل" : "Details" },
    { id: "links",    label: isRTL ? "العمليات" : "Processes" },
    { id: "deps",     label: isRTL ? "الاعتماديات" : "Dependencies" },
    { id: "audit",    label: isRTL ? "سجل التدقيق" : "Audit Trail" },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl h-full overflow-y-auto border-l border-slate-700 shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0f172a, #020817)" }}>

        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-slate-800" style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${tmeta?.color}15`, border: `1px solid ${tmeta?.color}30` }}>
                <TIcon size={18} style={{ color: tmeta?.color }} />
              </div>
              <div>
                <p className="text-xs font-mono text-cyan-400 font-semibold">{asset.asset_code}</p>
                <h2 className="text-lg font-bold text-white leading-tight">{isRTL ? asset.name_ar || asset.name : asset.name}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Quick badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold" style={{ color: tmeta?.color, background: `${tmeta?.color}15`, border: `1px solid ${tmeta?.color}30` }}>
              {isRTL ? tmeta?.labelAr : tmeta?.label}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold" style={{ color: cmeta?.color, background: `${cmeta?.color}15`, border: `1px solid ${cmeta?.color}30` }}>
              {isRTL ? cmeta?.labelAr : cmeta?.label}
            </span>
            <span className="flex items-center gap-1 text-[10px]" style={{ color: smeta?.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: smeta?.color }} />
              {isRTL ? smeta?.labelAr : smeta?.label}
            </span>
            {effCrit !== asset.criticality && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold" style={{ color: effCmeta?.color, background: `${effCmeta?.color}10`, border: `1px solid ${effCmeta?.color}30` }}>
                ↑ {isRTL ? "فعلي" : "Effective"}: {isRTL ? effCmeta?.labelAr : effCmeta?.label}
              </span>
            )}
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-1 mt-3">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${tab === t.id ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}>
                {t.label}
                {t.id === "links" && links.length > 0 && <span className="ml-1 text-[9px] text-cyan-400">({links.length})</span>}
                {t.id === "deps" && deps.length > 0 && <span className="ml-1 text-[9px] text-cyan-400">({deps.length})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {tab === "details" && (
            <>
              <div className="text-xs text-slate-400 leading-relaxed mb-4">{isRTL ? asset.description_ar || asset.description : asset.description}</div>
              <InfoRow icon={User}     label={isRTL ? "المالك" : "Owner"}       value={asset.owner} />
              <InfoRow icon={Building2} label={isRTL ? "القسم" : "Department"}  value={asset.department} />
              <InfoRow icon={MapPin}   label={isRTL ? "الموقع" : "Location"}    value={asset.location} />

              {/* Recovery Objectives */}
              <div className="mt-4 p-3 rounded-lg border border-slate-800" style={{ background: "rgba(6,182,212,0.03)" }}>
                <p className="text-[10px] text-cyan-400 font-mono tracking-wider mb-2">{isRTL ? "أهداف الاسترداد" : "RECOVERY OBJECTIVES"}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-white">{asset.rto_hours ?? "—"}<span className="text-[10px] text-slate-500">h</span></p>
                    <p className="text-[9px] text-slate-500 font-mono">RTO</p>
                    {iRTO != null && iRTO !== asset.rto_hours && (
                      <p className="text-[9px] text-amber-400 font-mono mt-0.5">{isRTL ? "موروث" : "Inherited"}: {iRTO}h</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-white">{asset.rpo_hours ?? "—"}<span className="text-[10px] text-slate-500">h</span></p>
                    <p className="text-[9px] text-slate-500 font-mono">RPO</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-white">{asset.mtpd_hours ?? "—"}<span className="text-[10px] text-slate-500">h</span></p>
                    <p className="text-[9px] text-slate-500 font-mono">MTPD</p>
                  </div>
                </div>
                {asset.recovery_procedure && (
                  <p className="text-[10px] text-slate-400 mt-3 border-t border-slate-800 pt-2">{asset.recovery_procedure}</p>
                )}
              </div>

              {/* Vendor */}
              {asset.vendor_name && (
                <div className="mt-3">
                  <InfoRow icon={Truck}    label={isRTL ? "المورد" : "Vendor"}   value={asset.vendor_name} color="#f97316" />
                  <InfoRow icon={LinkIcon} label={isRTL ? "جهة الاتصال" : "Contact"} value={asset.vendor_contact} />
                  <InfoRow icon={Calendar} label={isRTL ? "انتهاء العقد" : "Contract Expiry"} value={asset.contract_expiry} />
                </div>
              )}
            </>
          )}

          {tab === "links" && (
            <div className="space-y-2">
              {links.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">{isRTL ? "لا توجد عمليات مرتبطة" : "No linked processes"}</p>
              ) : links.map(link => (
                <div key={link.id} className="p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-all" style={{ background: "rgba(15,23,42,0.6)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{isRTL ? link.process_name_ar || link.process_name : link.process_name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      link.dependency_type === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800" :
                      link.dependency_type === "IMPORTANT" ? "bg-amber-950 text-amber-400 border border-amber-800" :
                      "bg-blue-950 text-blue-400 border border-blue-800"
                    }`}>{link.dependency_type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    {link.rto_hours != null && <span className="flex items-center gap-1"><Clock size={10} />RTO: {link.rto_hours}h</span>}
                    <span className="flex items-center gap-1">
                      {link.is_alternative_available
                        ? <><Shield size={10} className="text-emerald-400" />{isRTL ? "بديل متاح" : "Alternative available"}</>
                        : <><AlertTriangle size={10} className="text-red-400" />{isRTL ? "لا بديل" : "No alternative"}</>
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "deps" && (
            <div className="space-y-2">
              {deps.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">{isRTL ? "لا توجد اعتماديات" : "No dependencies"}</p>
              ) : deps.map(dep => {
                const isSource = dep.source_asset_id === asset.id;
                return (
                  <div key={dep.id} className="p-3 rounded-lg border border-slate-800" style={{ background: "rgba(15,23,42,0.6)" }}>
                    <div className="flex items-center gap-2">
                      <GitBranch size={12} className="text-cyan-400" />
                      <span className="text-[10px] text-slate-500">{isSource ? (isRTL ? "يعتمد على" : "Depends on") : (isRTL ? "مطلوب بواسطة" : "Required by")}</span>
                      <span className="text-xs text-slate-300 font-semibold">{isSource ? dep.target_asset_id : dep.source_asset_id}</span>
                    </div>
                    <span className="text-[9px] text-slate-600 font-mono mt-1 inline-block">{dep.relationship_type}</span>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "audit" && (
            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-slate-800" style={{ background: "rgba(15,23,42,0.6)" }}>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Activity size={10} className="text-emerald-400" />
                  <span>{isRTL ? "تم الإنشاء" : "Created"}</span>
                  <span className="font-mono text-slate-500">{new Date(asset.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-800" style={{ background: "rgba(15,23,42,0.6)" }}>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Activity size={10} className="text-cyan-400" />
                  <span>{isRTL ? "آخر تحديث" : "Last updated"}</span>
                  <span className="font-mono text-slate-500">{new Date(asset.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
