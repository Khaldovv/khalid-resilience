import { useBIA } from "../../context/BIAContext";
import { CheckCircle2, Clock, XCircle, AlertTriangle, ChevronRight } from "lucide-react";

const roleLabels = {
  DEPT_HEAD:       { ar: "مدير الإدارة",              en: "Department Head" },
  BC_COORDINATOR:  { ar: "منسق استمرارية الأعمال",     en: "BC Coordinator" },
  CISO:            { ar: "مسؤول أمن المعلومات",       en: "CISO" },
  CEO:             { ar: "الرئيس التنفيذي",           en: "CEO" },
};

const decisionConfig = {
  PENDING:   { icon: Clock,        color: "text-amber-400",   bg: "bg-amber-950",   border: "border-amber-800", ar: "بانتظار", en: "Pending" },
  APPROVED:  { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-950", border: "border-emerald-800", ar: "معتمد",  en: "Approved" },
  REJECTED:  { icon: XCircle,      color: "text-red-400",     bg: "bg-red-950",     border: "border-red-800",    ar: "مرفوض",  en: "Rejected" },
  ESCALATED: { icon: AlertTriangle, color: "text-violet-400", bg: "bg-violet-950",  border: "border-violet-800", ar: "مُصعَّد", en: "Escalated" },
};

export default function BIAWorkflowTracker({ assessmentId, lang = "en", onApprove, onReject }) {
  const { getWorkflowForAssessment, APPROVER_ROLES } = useBIA();
  const isAr = lang === "ar";
  const steps = getWorkflowForAssessment(assessmentId);

  const allRoles = APPROVER_ROLES.map((role, i) => {
    const step = steps.find((s) => s.approver_role === role);
    return { role, step, order: i + 1 };
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(isAr ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString(isAr ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="space-y-4">
      <div className={isAr ? "text-right" : ""}>
        <p className="text-[10px] font-mono text-slate-500 tracking-widest">{isAr ? "مراحل سير عمل الاعتماد" : "APPROVAL WORKFLOW STAGES"}</p>
        <p className="text-sm font-bold text-white mt-0.5">{isAr ? "تتبع مراحل الاعتماد" : "Workflow Tracker"}</p>
      </div>

      {/* Visual Pipeline */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className={`flex items-start ${isAr ? "flex-row-reverse" : ""}`}>
          {allRoles.map(({ role, step, order }, i) => {
            const dc = step ? decisionConfig[step.decision] : null;
            const Icon = dc ? dc.icon : Clock;
            const isActive = step?.decision === "PENDING";
            const isDone = step?.decision === "APPROVED";
            const isRejected = step?.decision === "REJECTED";

            return (
              <div key={role} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  {/* Connector line */}
                  {i > 0 && (
                    <div className={`absolute top-5 ${isAr ? "right-0 -mr-[50%]" : "left-0 -ml-[50%]"} w-full h-0.5 ${isDone || (!isAr && allRoles[i-1]?.step?.decision === "APPROVED") ? "bg-emerald-700" : "bg-slate-800"}`}
                      style={{ zIndex: 0 }} />
                  )}

                  {/* Circle */}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isDone ? "border-emerald-500 bg-emerald-950" :
                      isActive ? "border-amber-500 bg-amber-950 animate-pulse" :
                      isRejected ? "border-red-500 bg-red-950" :
                      "border-slate-700 bg-slate-800"
                    }`}>
                    <Icon size={16} className={
                      isDone ? "text-emerald-400" :
                      isActive ? "text-amber-400" :
                      isRejected ? "text-red-400" :
                      "text-slate-600"
                    } />
                  </div>

                  {/* Label */}
                  <p className={`text-[10px] font-semibold mt-2 text-center ${isDone ? "text-emerald-400" : isActive ? "text-amber-400" : isRejected ? "text-red-400" : "text-slate-600"}`}>
                    {isAr ? roleLabels[role].ar : roleLabels[role].en}
                  </p>

                  {/* Status Badge */}
                  {step && (
                    <span className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${dc.bg} ${dc.color} ${dc.border}`}>
                      {isAr ? dc.ar : dc.en}
                    </span>
                  )}

                  {/* Details */}
                  {step && (
                    <div className="mt-2 text-center">
                      <p className="text-[9px] text-slate-500">{step.approver_name}</p>
                      {step.decided_at && (
                        <p className="text-[9px] text-slate-600 font-mono">
                          {formatDate(step.decided_at)} {formatTime(step.decided_at)}
                        </p>
                      )}
                      {step.comments && (
                        <p className="text-[9px] text-slate-500 mt-1 max-w-[120px] mx-auto italic">"{step.comments}"</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons — only for pending step */}
                  {isActive && onApprove && onReject && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <button onClick={() => onApprove(step.id)}
                        className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-colors">
                        ✅ {isAr ? "اعتماد" : "Approve"}
                      </button>
                      <button onClick={() => onReject(step.id)}
                        className="px-2 py-1 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800 hover:bg-red-900 transition-colors">
                        ❌ {isAr ? "رفض" : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SLA reminder */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isAr ? "flex-row-reverse" : ""}`}>
            <Clock size={10} />
            <span>{isAr ? "SLA الاعتماد: 5 أيام عمل · التصعيد بعد 10 أيام" : "Approval SLA: 5 business days · Escalation after 10 days"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
