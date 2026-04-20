import { useState } from "react";
import { useBIA } from "../../context/BIAContext";
import { useToast } from "../ToastProvider";
import {
  Plus, FileText, CheckCircle2, Clock, AlertTriangle, Archive, Shield,
  ChevronRight, Download, Search, Zap, Send, Trash2, Eye, FilePlus2
} from "lucide-react";

// ─── Status Config ────────────────────────────────────────────────────────────
const statusConfig = {
  DRAFT:        { ar: "مسودة",      en: "Draft",        color: "text-slate-400",     bg: "bg-slate-800",     border: "border-slate-700",   icon: FileText },
  UNDER_REVIEW: { ar: "قيد المراجعة", en: "Under Review",  color: "text-amber-400",     bg: "bg-amber-950",     border: "border-amber-800",   icon: Clock },
  APPROVED:     { ar: "معتمدة",     en: "Approved",     color: "text-emerald-400",   bg: "bg-emerald-950",   border: "border-emerald-800", icon: CheckCircle2 },
  ACTIVE:       { ar: "مُفعَّلة",    en: "Active",       color: "text-red-400",       bg: "bg-red-950",       border: "border-red-800",     icon: Zap },
  EXPIRED:      { ar: "منتهية",     en: "Expired",      color: "text-slate-500",     bg: "bg-slate-800",     border: "border-slate-700",   icon: Archive },
  ARCHIVED:     { ar: "مؤرشفة",    en: "Archived",     color: "text-slate-500",     bg: "bg-slate-800",     border: "border-slate-700",   icon: Archive },
};

// ─── Disruption Scenario Presets ──────────────────────────────────────────────
const SCENARIO_PRESETS = [
  { ar: "هجوم سيبراني — برامج فدية", en: "Cyber Attack — Ransomware" },
  { ar: "تعطل مركز البيانات الرئيسي", en: "Primary Data Center Outage" },
  { ar: "كارثة طبيعية — زلزال/فيضان", en: "Natural Disaster — Earthquake/Flood" },
  { ar: "جائحة أو أزمة صحية", en: "Pandemic / Health Crisis" },
  { ar: "فقدان موردين حرجين", en: "Critical Vendor Loss" },
  { ar: "تعطل الاتصالات والشبكات", en: "Telecommunications Failure" },
  { ar: "فقدان كوادر رئيسية", en: "Key Personnel Loss" },
  { ar: "انقطاع خدمات سحابية", en: "Cloud Service Disruption" },
];

// ─── Demo Data ────────────────────────────────────────────────────────────────
const demoBCPPlans = [
  {
    id: "BCP-2026-001",
    title_ar: "خطة استمرارية — هجوم سيبراني على البنية التحتية المصرفية",
    title_en: "BCP — Cyber Attack on Core Banking Infrastructure",
    disruption_scenario: "هجوم سيبراني — برامج فدية",
    status: "APPROVED",
    version: "2.1",
    scope_type: "ORGANIZATION",
    department_name_ar: "تقنية المعلومات",
    department_name_en: "Information Technology",
    classification: "CONFIDENTIAL",
    critical_processes: JSON.stringify([
      { id: "BIA-PRC-001", process_name: "إدارة البريد الإلكتروني المؤسسي", rto_hours: 0.7, rpo_hours: 0.5, mtpd_hours: 1, priority: "حرج" },
      { id: "BIA-PRC-002", process_name: "إدارة الهويات والصلاحيات (IAM)", rto_hours: 2.8, rpo_hours: 1, mtpd_hours: 4, priority: "حرج" },
      { id: "BIA-PRC-004", process_name: "تسوية المعاملات المالية", rto_hours: 5.6, rpo_hours: 2, mtpd_hours: 8, priority: "عالي" },
    ]),
    critical_assets: JSON.stringify([
      { asset_name: "Microsoft Exchange Server 2019", asset_type: "IT_SYSTEM", rto_hours: 0.5, alternative: "Microsoft 365 Cloud Failover" },
      { asset_name: "Active Directory Domain Controller", asset_type: "IT_SYSTEM", rto_hours: 0.5, alternative: "Secondary DC in DR Site" },
      { asset_name: "SAP S/4HANA Finance Module", asset_type: "APPLICATION", rto_hours: 4, alternative: "—" },
    ]),
    crisis_management_team: JSON.stringify([
      { role: "قائد فريق الأزمات", name: "م. خالد الغفيلي", phone: "+966 5XX XXX XXX", responsibilities: "القيادة العامة واتخاذ القرارات" },
      { role: "منسق استمرارية الأعمال", name: "أ. فاطمة الشهراني", phone: "+966 5XX XXX XXX", responsibilities: "تنسيق تفعيل الخطة" },
    ]),
    approved_at: "2026-03-15T10:00:00Z",
    created_at: "2026-02-01T08:00:00Z",
    next_review_date: "2026-09-01",
    last_generated_at: "2026-03-20T14:00:00Z",
  },
  {
    id: "BCP-2026-002",
    title_ar: "خطة استمرارية — تعطل مركز البيانات الرئيسي",
    title_en: "BCP — Primary Data Center Outage",
    disruption_scenario: "تعطل مركز البيانات الرئيسي",
    status: "DRAFT",
    version: "1.0",
    scope_type: "DEPARTMENT",
    department_name_ar: "تقنية المعلومات",
    department_name_en: "Information Technology",
    classification: "CONFIDENTIAL",
    critical_processes: JSON.stringify([]),
    critical_assets: JSON.stringify([]),
    crisis_management_team: JSON.stringify([]),
    approved_at: null,
    created_at: "2026-04-10T09:00:00Z",
    next_review_date: null,
    last_generated_at: null,
  },
  {
    id: "BCP-2026-003",
    title_ar: "خطة استمرارية — جائحة أو أزمة صحية",
    title_en: "BCP — Pandemic / Health Crisis",
    disruption_scenario: "جائحة أو أزمة صحية",
    status: "UNDER_REVIEW",
    version: "1.0",
    scope_type: "ORGANIZATION",
    department_name_ar: "الموارد البشرية",
    department_name_en: "Human Resources",
    classification: "INTERNAL",
    critical_processes: JSON.stringify([
      { id: "BIA-PRC-003", process_name: "إدارة سلسلة الإمداد الإقليمية", rto_hours: 16.8, rpo_hours: 8, mtpd_hours: 24, priority: "متوسط" },
    ]),
    critical_assets: JSON.stringify([]),
    crisis_management_team: JSON.stringify([]),
    approved_at: null,
    created_at: "2026-04-05T11:00:00Z",
    next_review_date: null,
    last_generated_at: null,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BCPListTab({ lang = "en" }) {
  const { assessments, processes, dependencies } = useBIA();
  const toast = useToast();
  const isAr = lang === "ar";
  
  const [plans, setPlans] = useState(demoBCPPlans);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // ─── Create BCP Modal State ─────────────────────────────────────────────────
  const [newPlan, setNewPlan] = useState({
    title_ar: "",
    title_en: "",
    disruption_scenario: "",
    scope_type: "DEPARTMENT",
    classification: "CONFIDENTIAL",
    bia_assessment_id: "",
    auto_import: true,
  });
  
  // Filter
  const filtered = plans.filter((p) => {
    if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = isAr ? p.title_ar : (p.title_en || p.title_ar);
      return (title || "").toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.disruption_scenario || "").toLowerCase().includes(q);
    }
    return true;
  });
  
  // Get processes count from JSON
  const getProcCount = (plan) => {
    try { return JSON.parse(plan.critical_processes || "[]").length; } catch { return 0; }
  };
  const getAssetCount = (plan) => {
    try { return JSON.parse(plan.critical_assets || "[]").length; } catch { return 0; }
  };
  
  // ─── Handle Create ──────────────────────────────────────────────────────────
  const handleCreate = () => {
    if (!newPlan.title_ar || !newPlan.disruption_scenario) {
      toast.error(isAr ? "يرجى تعبئة الحقول المطلوبة" : "Please fill required fields");
      return;
    }
    
    // Auto-import from BIA if selected
    let importedProcesses = [];
    let importedAssets = [];
    
    if (newPlan.auto_import && newPlan.bia_assessment_id) {
      const asmProcesses = processes.filter(p => p.assessment_id === newPlan.bia_assessment_id);
      importedProcesses = asmProcesses.map(p => ({
        id: p.id,
        process_name: p.process_name,
        rto_hours: p.rto_hours,
        rpo_hours: p.rpo_hours,
        mtpd_hours: p.mtpd_hours,
        priority: p.criticality_level === "CRITICAL" ? (isAr ? "حرج" : "Critical") :
                  p.criticality_level === "HIGH" ? (isAr ? "عالي" : "High") :
                  (isAr ? "متوسط" : "Medium"),
      }));
      
      // Import dependencies as assets
      const procIds = asmProcesses.map(p => p.id);
      const relDeps = dependencies.filter(d => procIds.includes(d.process_id));
      importedAssets = relDeps.map(d => ({
        asset_name: d.resource_name,
        asset_type: d.dependency_type,
        rto_hours: null,
        alternative: d.has_alternative ? (d.alternative_description || "—") : "—",
      }));
    }
    
    const newId = `BCP-2026-${String(plans.length + 1).padStart(3, "0")}`;
    const created = {
      id: newId,
      title_ar: newPlan.title_ar,
      title_en: newPlan.title_en,
      disruption_scenario: newPlan.disruption_scenario,
      status: "DRAFT",
      version: "1.0",
      scope_type: newPlan.scope_type,
      department_name_ar: "تقنية المعلومات",
      department_name_en: "Information Technology",
      classification: newPlan.classification,
      critical_processes: JSON.stringify(importedProcesses),
      critical_assets: JSON.stringify(importedAssets),
      crisis_management_team: JSON.stringify([]),
      approved_at: null,
      created_at: new Date().toISOString(),
      next_review_date: null,
      last_generated_at: null,
    };
    
    setPlans(prev => [created, ...prev]);
    setShowCreateModal(false);
    setNewPlan({ title_ar: "", title_en: "", disruption_scenario: "", scope_type: "DEPARTMENT", classification: "CONFIDENTIAL", bia_assessment_id: "", auto_import: true });
    
    toast.success(
      isAr 
        ? `تم إنشاء خطة BCP: ${newId}${importedProcesses.length > 0 ? ` — تم استيراد ${importedProcesses.length} عملية و ${importedAssets.length} أصل من BIA` : ""}`
        : `BCP plan created: ${newId}${importedProcesses.length > 0 ? ` — Imported ${importedProcesses.length} processes and ${importedAssets.length} assets from BIA` : ""}`
    );
  };
  
  // ─── Generate DOCX ─────────────────────────────────────────────────────────
  const handleGenerateDocx = async (plan) => {
    toast.success(isAr ? `جارٍ إنشاء وثيقة Word لخطة ${plan.id}...` : `Generating Word document for ${plan.id}...`);
    
    try {
      const resp = await fetch(`/api/v1/bcp/${plan.id}/generate`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || 'demo'}` }
      });
      
      if (resp.ok) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BCP-${plan.id}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(isAr ? "تم تنزيل الوثيقة بنجاح ✅" : "Document downloaded successfully ✅");
      } else {
        // Fallback: show toast that backend is needed
        toast.warning(isAr ? "يرجى تشغيل الخادم لتوليد الوثيقة — الخادم غير متصل حالياً" : "Backend server required for document generation — server not connected");
      }
    } catch {
      toast.warning(isAr ? "الخادم غير متصل — يرجى تشغيل السيرفر لتوليد وثيقة Word" : "Server not connected — start backend to generate Word document");
    }
  };
  
  // ─── Submit for Review ─────────────────────────────────────────────────────
  const handleSubmit = (planId) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: "UNDER_REVIEW" } : p));
    toast.success(isAr ? "تم إرسال الخطة للمراجعة" : "Plan submitted for review");
  };
  
  // ─── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = (planId) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: "APPROVED", approved_at: new Date().toISOString() } : p));
    toast.success(isAr ? "تم اعتماد الخطة ✅" : "Plan approved ✅");
  };
  
  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (planId) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    toast.success(isAr ? "تم حذف الخطة" : "Plan deleted");
    if (selectedPlan?.id === planId) { setSelectedPlan(null); setShowDetail(false); }
  };
  
  // Stats
  const stats = {
    total: plans.length,
    approved: plans.filter(p => p.status === "APPROVED").length,
    active: plans.filter(p => p.status === "ACTIVE").length,
    draft: plans.filter(p => p.status === "DRAFT").length,
  };
  
  return (
    <div className="space-y-4">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${isAr ? "flex-row-reverse" : ""}`}>
        <div className={isAr ? "text-right" : ""}>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest">
            {isAr ? "استمرارية الأعمال — ISO 22301" : "BUSINESS CONTINUITY — ISO 22301"}
          </p>
          <p className="text-lg font-bold text-white mt-0.5">
            {isAr ? "خطط استمرارية الأعمال (BCP)" : "Business Continuity Plans (BCP)"}
          </p>
        </div>
        <div className={`flex flex-wrap items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
          <div className={`flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 ${isAr ? "flex-row-reverse" : ""}`}>
            <Search size={12} className="text-slate-500" />
            <input
              className={`bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none w-48 ${isAr ? "text-right" : ""}`}
              placeholder={isAr ? "بحث بالرقم أو السيناريو..." : "Search by ID or scenario..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all"
            style={{
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              color: "#0f172a",
              boxShadow: "0 4px 16px rgba(6,182,212,0.3)",
            }}
          >
            <FilePlus2 size={14} />
            {isAr ? "خطة استمرارية جديدة" : "New BCP Plan"}
          </button>
        </div>
      </div>
      
      {/* ─── Status Filter Tabs ─────────────────────────────────────────────── */}
      <div className={`flex items-center gap-2 ${isAr ? "justify-end" : ""}`}>
        {[
          { id: "ALL", label: isAr ? "الكل" : "All", count: stats.total },
          { id: "DRAFT", label: isAr ? "مسودات" : "Drafts", count: stats.draft },
          { id: "UNDER_REVIEW", label: isAr ? "قيد المراجعة" : "Under Review", count: plans.filter(p => p.status === "UNDER_REVIEW").length },
          { id: "APPROVED", label: isAr ? "معتمدة" : "Approved", count: stats.approved },
          { id: "ACTIVE", label: isAr ? "مُفعَّلة" : "Active", count: stats.active },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border
              ${statusFilter === tab.id
                ? "bg-cyan-950 text-cyan-400 border-cyan-800"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"}`}>
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${statusFilter === tab.id ? "bg-cyan-900 text-cyan-300" : "bg-slate-800 text-slate-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
      
      {/* ─── Stats Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: isAr ? "إجمالي الخطط" : "Total Plans", value: stats.total, color: "text-white", accent: "#64748b" },
          { label: isAr ? "معتمدة" : "Approved", value: stats.approved, color: "text-emerald-400", accent: "#10b981" },
          { label: isAr ? "مُفعَّلة" : "Active", value: stats.active, color: "text-red-400", accent: "#ef4444" },
          { label: isAr ? "مسودات" : "Drafts", value: stats.draft, color: "text-slate-400", accent: "#94a3b8" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }} />
            <p className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      
      {/* ─── Plan Cards ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {filtered.map((plan) => {
          const sc = statusConfig[plan.status] || statusConfig.DRAFT;
          const StatusIcon = sc.icon;
          const title = isAr ? plan.title_ar : (plan.title_en || plan.title_ar);
          const procCount = getProcCount(plan);
          const assetCount = getAssetCount(plan);
          
          return (
            <div key={plan.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 hover:border-slate-600 hover:bg-slate-800/60 transition-all group">
              <div className={`flex items-start justify-between ${isAr ? "flex-row-reverse" : ""}`}>
                <div className={isAr ? "text-right flex-1" : "flex-1"}>
                  <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                    <span className="font-mono text-cyan-400 text-xs font-bold">{plan.id}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${sc.bg} ${sc.color} ${sc.border}`}>
                      <StatusIcon size={10} />
                      {isAr ? sc.ar : sc.en}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600">v{plan.version}</span>
                    {plan.classification === "CONFIDENTIAL" && (
                      <span className="text-[9px] font-bold text-red-400 bg-red-950 border border-red-800 px-1.5 py-0.5 rounded">
                        {isAr ? "سري" : "CONFIDENTIAL"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-white mt-1.5">{title}</p>
                  <div className={`flex items-center gap-4 mt-2 text-[11px] text-slate-500 flex-wrap ${isAr ? "flex-row-reverse" : ""}`}>
                    <span className={`flex items-center gap-1 ${isAr ? "flex-row-reverse" : ""}`}>
                      <AlertTriangle size={10} className="text-amber-500" />
                      {plan.disruption_scenario}
                    </span>
                    <span>{isAr ? "العمليات:" : "Processes:"} <span className="text-cyan-400 font-bold">{procCount}</span></span>
                    <span>{isAr ? "الأصول:" : "Assets:"} <span className="text-cyan-400 font-bold">{assetCount}</span></span>
                    <span>{isAr ? "الإدارة:" : "Dept:"} <span className="text-slate-300">{isAr ? plan.department_name_ar : plan.department_name_en}</span></span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className={`flex items-center gap-1.5 flex-shrink-0 ${isAr ? "flex-row-reverse" : ""}`}>
                  {/* Generate DOCX */}
                  <button onClick={(e) => { e.stopPropagation(); handleGenerateDocx(plan); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-violet-950 text-violet-400 border border-violet-800 hover:bg-violet-900 transition-colors"
                    title={isAr ? "تنزيل وثيقة Word" : "Download Word Document"}>
                    <Download size={11} />
                    <span className="hidden sm:inline">.DOCX</span>
                  </button>
                  
                  {/* View Detail */}
                  <button onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); setShowDetail(true); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
                    title={isAr ? "عرض التفاصيل" : "View Details"}>
                    <Eye size={11} />
                  </button>
                  
                  {/* Submit for review (draft only) */}
                  {plan.status === "DRAFT" && (
                    <button onClick={(e) => { e.stopPropagation(); handleSubmit(plan.id); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800 hover:bg-amber-900 transition-colors"
                      title={isAr ? "إرسال للمراجعة" : "Submit for Review"}>
                      <Send size={11} />
                    </button>
                  )}
                  
                  {/* Approve (under review only) */}
                  {plan.status === "UNDER_REVIEW" && (
                    <button onClick={(e) => { e.stopPropagation(); handleApprove(plan.id); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-colors"
                      title={isAr ? "اعتماد" : "Approve"}>
                      <CheckCircle2 size={11} />
                    </button>
                  )}
                  
                  {/* Delete (draft only) */}
                  {plan.status === "DRAFT" && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold text-red-400 hover:bg-red-950 border border-transparent hover:border-red-800 transition-colors"
                      title={isAr ? "حذف" : "Delete"}>
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Footer: Dates */}
              <div className={`mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-600 font-mono ${isAr ? "flex-row-reverse" : ""}`}>
                <span>{isAr ? "أُنشئت:" : "Created:"} {new Date(plan.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>
                {plan.approved_at && <span className="text-emerald-600">{isAr ? "اُعتمدت:" : "Approved:"} {new Date(plan.approved_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>}
                {plan.last_generated_at && <span className="text-violet-600">{isAr ? "آخر توليد:" : "Last Gen:"} {new Date(plan.last_generated_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}</span>}
                {plan.next_review_date && <span className="text-amber-600">{isAr ? "المراجعة القادمة:" : "Next Review:"} {plan.next_review_date}</span>}
              </div>
            </div>
          );
        })}
        
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Shield size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm">{isAr ? "لا توجد خطط تطابق الفلتر" : "No plans match the current filter"}</p>
          </div>
        )}
      </div>
      
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CREATE BCP MODAL                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            style={{ direction: isAr ? "rtl" : "ltr" }}>
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800">
              <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(14,165,233,0.1))", border: "1px solid rgba(6,182,212,0.3)" }}>
                  <FilePlus2 size={18} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{isAr ? "إنشاء خطة استمرارية أعمال جديدة" : "Create New Business Continuity Plan"}</p>
                  <p className="text-[10px] text-slate-500 font-mono">ISO 22301:2019 Clause 8.4</p>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Title AR */}
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                  {isAr ? "عنوان الخطة (عربي) *" : "Plan Title (Arabic) *"}
                </label>
                <input value={newPlan.title_ar} onChange={(e) => setNewPlan(p => ({ ...p, title_ar: e.target.value }))}
                  placeholder={isAr ? "مثال: خطة استمرارية — هجوم سيبراني" : "e.g. خطة استمرارية — Cyber Attack on Infrastructure"}
                  className="w-full px-3 py-2.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition-colors" />
              </div>
              
              {/* Title EN */}
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                  {isAr ? "عنوان الخطة (إنجليزي)" : "Plan Title (English)"}
                </label>
                <input value={newPlan.title_en} onChange={(e) => setNewPlan(p => ({ ...p, title_en: e.target.value }))}
                  placeholder="e.g. BCP — Ransomware Attack on Core Systems"
                  className="w-full px-3 py-2.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition-colors" />
              </div>
              
              {/* Disruption Scenario */}
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                  {isAr ? "سيناريو التعطل *" : "Disruption Scenario *"}
                </label>
                <select value={newPlan.disruption_scenario} onChange={(e) => setNewPlan(p => ({ ...p, disruption_scenario: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-500 transition-colors">
                  <option value="">{isAr ? "اختر سيناريو..." : "Select scenario..."}</option>
                  {SCENARIO_PRESETS.map((s, i) => (
                    <option key={i} value={isAr ? s.ar : s.en}>{isAr ? s.ar : s.en}</option>
                  ))}
                </select>
              </div>
              
              {/* Scope + Classification */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                    {isAr ? "نطاق الخطة" : "Scope"}
                  </label>
                  <select value={newPlan.scope_type} onChange={(e) => setNewPlan(p => ({ ...p, scope_type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-500 transition-colors">
                    <option value="DEPARTMENT">{isAr ? "إدارة" : "Department"}</option>
                    <option value="ORGANIZATION">{isAr ? "المنظمة بالكامل" : "Organization-wide"}</option>
                    <option value="SITE">{isAr ? "موقع محدد" : "Specific Site"}</option>
                    <option value="SYSTEM">{isAr ? "نظام محدد" : "Specific System"}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                    {isAr ? "التصنيف" : "Classification"}
                  </label>
                  <select value={newPlan.classification} onChange={(e) => setNewPlan(p => ({ ...p, classification: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-500 transition-colors">
                    <option value="INTERNAL">{isAr ? "داخلي" : "Internal"}</option>
                    <option value="CONFIDENTIAL">{isAr ? "سري" : "Confidential"}</option>
                    <option value="SECRET">{isAr ? "سري للغاية" : "Secret"}</option>
                  </select>
                </div>
              </div>
              
              {/* BIA Link + Auto-import */}
              <div className="rounded-xl border-2 border-dashed border-cyan-800/60 p-4"
                style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.05), rgba(14,165,233,0.03))" }}>
                <div className={`flex items-center gap-2 mb-3 ${isAr ? "flex-row-reverse" : ""}`}>
                  <Zap size={14} className="text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-300">
                    {isAr ? "ربط تلقائي بتقييم BIA" : "Auto-Link BIA Assessment"}
                  </span>
                </div>
                
                <select value={newPlan.bia_assessment_id} onChange={(e) => setNewPlan(p => ({ ...p, bia_assessment_id: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-white outline-none focus:border-cyan-500 transition-colors mb-3">
                  <option value="">{isAr ? "اختر تقييم BIA لاستيراد العمليات والأصول..." : "Select BIA Assessment to import processes & assets..."}</option>
                  {assessments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.id} — {isAr ? a.title : (a.titleEn || a.title)} ({a.status})
                    </option>
                  ))}
                </select>
                
                {newPlan.bia_assessment_id && (
                  <label className={`flex items-center gap-2 text-xs text-slate-300 cursor-pointer ${isAr ? "flex-row-reverse" : ""}`}>
                    <input type="checkbox" checked={newPlan.auto_import} onChange={(e) => setNewPlan(p => ({ ...p, auto_import: e.target.checked }))}
                      className="rounded border-cyan-600 text-cyan-500 focus:ring-cyan-500" />
                    {isAr ? "استيراد العمليات الحيوية والاعتماديات تلقائياً من BIA" : "Auto-import critical processes & dependencies from BIA"}
                  </label>
                )}
                
                {newPlan.bia_assessment_id && (
                  <div className={`mt-2 flex items-center gap-3 text-[10px] text-slate-500 ${isAr ? "flex-row-reverse" : ""}`}>
                    <span>{isAr ? "العمليات:" : "Processes:"} <span className="text-cyan-400 font-bold">{processes.filter(p => p.assessment_id === newPlan.bia_assessment_id).length}</span></span>
                    <span>{isAr ? "الاعتماديات:" : "Dependencies:"} <span className="text-cyan-400 font-bold">{dependencies.filter(d => processes.filter(p => p.assessment_id === newPlan.bia_assessment_id).map(p => p.id).includes(d.process_id)).length}</span></span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className={`p-5 border-t border-slate-800 flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
              <button onClick={handleCreate}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg transition-all"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                  color: "#0f172a",
                  boxShadow: "0 4px 16px rgba(6,182,212,0.3)",
                }}>
                <FilePlus2 size={14} />
                {isAr ? "إنشاء الخطة" : "Create Plan"}
              </button>
              <button onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-400 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DETAIL DRAWER                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {showDetail && selectedPlan && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={() => setShowDetail(false)}>
          <div className="w-full max-w-xl bg-slate-950 border-l border-slate-800 overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ direction: isAr ? "rtl" : "ltr" }}>
            
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 p-4 border-b border-slate-800" style={{ background: "rgba(2,6,23,0.95)", backdropFilter: "blur(12px)" }}>
              <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
                <div>
                  <span className="font-mono text-cyan-400 text-xs font-bold">{selectedPlan.id}</span>
                  <p className="text-sm font-bold text-white mt-0.5">{isAr ? selectedPlan.title_ar : (selectedPlan.title_en || selectedPlan.title_ar)}</p>
                </div>
                <button onClick={() => setShowDetail(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Status + Meta */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: isAr ? "الحالة" : "Status", value: isAr ? statusConfig[selectedPlan.status]?.ar : statusConfig[selectedPlan.status]?.en, color: statusConfig[selectedPlan.status]?.color },
                  { label: isAr ? "الإصدار" : "Version", value: `v${selectedPlan.version}`, color: "text-slate-300" },
                  { label: isAr ? "التصنيف" : "Classification", value: selectedPlan.classification, color: selectedPlan.classification === "CONFIDENTIAL" ? "text-red-400" : "text-slate-300" },
                  { label: isAr ? "النطاق" : "Scope", value: selectedPlan.scope_type, color: "text-slate-300" },
                ].map((m, i) => (
                  <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                    <p className="text-[10px] text-slate-500 font-mono">{m.label}</p>
                    <p className={`text-sm font-bold ${m.color} mt-0.5`}>{m.value}</p>
                  </div>
                ))}
              </div>
              
              {/* Processes */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <p className="text-xs font-bold text-white mb-3">{isAr ? "العمليات الحيوية المشمولة" : "Covered Critical Processes"}</p>
                {(() => {
                  try {
                    const procs = JSON.parse(selectedPlan.critical_processes || "[]");
                    if (procs.length === 0) return <p className="text-xs text-slate-500">{isAr ? "لم يتم ربط عمليات بعد" : "No processes linked yet"}</p>;
                    return (
                      <div className="space-y-2">
                        {procs.map((p, i) => (
                          <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 ${isAr ? "flex-row-reverse" : ""}`}>
                            <div className={isAr ? "text-right" : ""}>
                              <span className="text-[10px] font-mono text-cyan-400">{p.id}</span>
                              <p className="text-xs text-white font-medium">{p.process_name}</p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-mono">
                              <span className="text-red-400">MTPD {p.mtpd_hours}h</span>
                              <span className="text-amber-400">RTO {p.rto_hours}h</span>
                              <span className="text-cyan-400">RPO {p.rpo_hours}h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } catch { return null; }
                })()}
              </div>
              
              {/* CMT */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <p className="text-xs font-bold text-white mb-3">{isAr ? "فريق إدارة الأزمات" : "Crisis Management Team"}</p>
                {(() => {
                  try {
                    const team = JSON.parse(selectedPlan.crisis_management_team || "[]");
                    if (team.length === 0) return <p className="text-xs text-slate-500">{isAr ? "لم يتم تحديد الفريق بعد" : "No team defined yet"}</p>;
                    return (
                      <div className="space-y-2">
                        {team.map((m, i) => (
                          <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 ${isAr ? "flex-row-reverse" : ""}`}>
                            <div className={isAr ? "text-right" : ""}>
                              <p className="text-xs text-white font-medium">{m.name}</p>
                              <p className="text-[10px] text-slate-500">{m.role}</p>
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono">{m.phone}</p>
                          </div>
                        ))}
                      </div>
                    );
                  } catch { return null; }
                })()}
              </div>
              
              {/* Actions */}
              <div className={`flex items-center gap-2 flex-wrap ${isAr ? "flex-row-reverse" : ""}`}>
                <button onClick={() => handleGenerateDocx(selectedPlan)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#ede9fe", border: "1px solid rgba(139,92,246,0.4)" }}>
                  <Download size={12} />
                  {isAr ? "تنزيل Word (.docx)" : "Download Word (.docx)"}
                </button>
                {selectedPlan.status === "DRAFT" && (
                  <button onClick={() => { handleSubmit(selectedPlan.id); setShowDetail(false); }}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                    <Send size={12} />
                    {isAr ? "إرسال للمراجعة" : "Submit for Review"}
                  </button>
                )}
                {selectedPlan.status === "UNDER_REVIEW" && (
                  <button onClick={() => { handleApprove(selectedPlan.id); setShowDetail(false); }}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <CheckCircle2 size={12} />
                    {isAr ? "اعتماد الخطة" : "Approve Plan"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
