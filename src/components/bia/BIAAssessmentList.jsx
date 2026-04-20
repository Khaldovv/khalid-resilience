import { useState } from "react";
import { useBIA } from "../../context/BIAContext";
import { useToast } from "../ToastProvider";
import {
  Plus, FileText, CheckCircle2, Clock, AlertCircle, Archive,
  ChevronRight, Filter, Download, Search
} from "lucide-react";

const statusConfig = {
  DRAFT:      { ar: "مسودة",    en: "Draft",      color: "text-slate-400",   bg: "bg-slate-800",   border: "border-slate-700", icon: FileText },
  IN_REVIEW:  { ar: "قيد المراجعة", en: "In Review",  color: "text-amber-400",   bg: "bg-amber-950",   border: "border-amber-800", icon: Clock },
  APPROVED:   { ar: "معتمد",    en: "Approved",   color: "text-emerald-400", bg: "bg-emerald-950", border: "border-emerald-800", icon: CheckCircle2 },
  ARCHIVED:   { ar: "مؤرشف",   en: "Archived",   color: "text-slate-500",   bg: "bg-slate-800",   border: "border-slate-700", icon: Archive },
};

export default function BIAAssessmentList({ lang = "en", onSelectAssessment, onCreateNew }) {
  const { assessments, processes, workflowSteps, getPendingApprovals } = useBIA();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const isAr = lang === "ar";

  const pending = getPendingApprovals();

  const filtered = assessments.filter((a) => {
    if (statusFilter !== "ALL" && a.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = isAr ? a.title : (a.titleEn || a.title);
      return title.toLowerCase().includes(q) || a.department_id.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
    }
    return true;
  });

  const getProcessCount = (asmId) => processes.filter((p) => p.assessment_id === asmId).length;
  const getWorkflowStatus = (asmId) => {
    const steps = workflowSteps.filter((s) => s.assessment_id === asmId);
    const lastStep = steps[steps.length - 1];
    return lastStep || null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest">
            {isAr ? "تحليل تأثير الأعمال" : "BUSINESS IMPACT ANALYSIS"}
          </p>
          <p className="text-lg font-bold text-white mt-0.5">
            {isAr ? "دورات التقييم" : "Assessment Cycles"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
            <Search size={12} className="text-slate-500" />
            <input
              className="bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none w-48"
              placeholder={isAr ? "بحث بالرقم أو الإدارة..." : "Search by ID or department..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => toast.success(isAr ? "جاري تصدير CSV..." : "CSV export started...")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors"
          >
            <Download size={12} />
            {isAr ? "تصدير" : "Export"}
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors"
          >
            <Plus size={12} />
            {isAr ? "دورة تقييم جديدة" : "New Assessment"}
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className={`flex items-center gap-2 ${isAr ? "justify-end" : ""}`}>
        {[
          { id: "ALL", label: isAr ? "الكل" : "All", count: assessments.length },
          { id: "DRAFT", label: isAr ? "مسودات" : "Drafts", count: assessments.filter((a) => a.status === "DRAFT").length },
          { id: "IN_REVIEW", label: isAr ? "قيد المراجعة" : "In Review", count: assessments.filter((a) => a.status === "IN_REVIEW").length },
          { id: "APPROVED", label: isAr ? "معتمدة" : "Approved", count: assessments.filter((a) => a.status === "APPROVED").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border
              ${statusFilter === tab.id
                ? "bg-cyan-950 text-cyan-400 border-cyan-800"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"
              }`}
          >
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${statusFilter === tab.id ? "bg-cyan-900 text-cyan-300" : "bg-slate-800 text-slate-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: isAr ? "إجمالي الدورات" : "Total Assessments", value: assessments.length, color: "text-white" },
          { label: isAr ? "العمليات الحيوية" : "Critical Processes", value: processes.length, color: "text-cyan-400" },
          { label: isAr ? "بانتظار الاعتماد" : "Pending Approvals", value: pending.length, color: "text-amber-400" },
          { label: isAr ? "معتمدة" : "Approved", value: assessments.filter((a) => a.status === "APPROVED").length, color: "text-emerald-400" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 text-center">
            <p className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Assessment Cards */}
      <div className="space-y-3">
        {filtered.map((asm) => {
          const sc = statusConfig[asm.status];
          const StatusIcon = sc.icon;
          const procCount = getProcessCount(asm.id);
          const wf = getWorkflowStatus(asm.id);
          const title = isAr ? asm.title : (asm.titleEn || asm.title);

          return (
            <div
              key={asm.id}
              onClick={() => onSelectAssessment && onSelectAssessment(asm)}
              className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 hover:border-slate-600 hover:bg-slate-800/60 transition-all cursor-pointer group"
            >
              <div className={`flex items-start justify-between ${isAr ? "flex-row-reverse" : ""}`}>
                <div className={isAr ? "text-right" : ""}>
                  <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                    <span className="font-mono text-cyan-400 text-xs font-bold">{asm.id}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${sc.bg} ${sc.color} ${sc.border}`}>
                      <StatusIcon size={10} />
                      {isAr ? sc.ar : sc.en}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-1.5">{title}</p>
                  <div className={`flex items-center gap-4 mt-2 text-[11px] text-slate-500 ${isAr ? "flex-row-reverse" : ""}`}>
                    <span>{isAr ? "الإدارة:" : "Dept:"} <span className="text-slate-300">{asm.department_id}</span></span>
                    <span>{isAr ? "السنة المالية:" : "FY:"} <span className="text-slate-300">{asm.fiscal_year}</span></span>
                    <span>{isAr ? "العمليات:" : "Processes:"} <span className="text-cyan-400 font-bold">{procCount}</span></span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                  {wf && (
                    <span className={`text-[10px] font-mono px-2 py-1 rounded border
                      ${wf.decision === "PENDING" ? "bg-amber-950 text-amber-400 border-amber-800" :
                        wf.decision === "APPROVED" ? "bg-emerald-950 text-emerald-400 border-emerald-800" :
                        "bg-red-950 text-red-400 border-red-800"
                      }`}>
                      {isAr ? `المرحلة ${wf.step_order}` : `Step ${wf.step_order}`} · {wf.approver_role}
                    </span>
                  )}
                  <ChevronRight size={16} className={`text-slate-600 group-hover:text-cyan-400 transition-colors ${isAr ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Progress bar for workflow */}
              {asm.status !== "DRAFT" && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                    {["DEPT_HEAD", "BC_COORDINATOR", "CISO", "CEO"].map((role, i) => {
                      const step = workflowSteps.find((s) => s.assessment_id === asm.id && s.approver_role === role);
                      const isDone = step?.decision === "APPROVED";
                      const isPending = step?.decision === "PENDING";
                      const isRejected = step?.decision === "REJECTED";
                      return (
                        <div key={role} className="flex items-center gap-2 flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border
                            ${isDone ? "bg-emerald-950 border-emerald-700 text-emerald-400" :
                              isPending ? "bg-amber-950 border-amber-700 text-amber-400 animate-pulse" :
                              isRejected ? "bg-red-950 border-red-700 text-red-400" :
                              "bg-slate-800 border-slate-700 text-slate-600"
                            }`}>
                            {i + 1}
                          </div>
                          {i < 3 && <div className={`flex-1 h-0.5 rounded ${isDone ? "bg-emerald-700" : "bg-slate-800"}`} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className={`flex items-center justify-between mt-1.5 text-[9px] text-slate-600 font-mono ${isAr ? "flex-row-reverse" : ""}`}>
                    <span>{isAr ? "مدير الإدارة" : "Dept Head"}</span>
                    <span>{isAr ? "منسق BC" : "BC Coord"}</span>
                    <span>CISO</span>
                    <span>CEO</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle size={32} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm">{isAr ? "لا توجد دورات تقييم تطابق الفلتر" : "No assessments match the current filter"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
