import { useBIA } from "../../context/BIAContext";
import { useToast } from "../ToastProvider";
import { BarChart3, Clock, AlertTriangle, ArrowUpRight, Download, RefreshCw, Target, Database } from "lucide-react";

export default function BIAConsolidatedReport({ lang = "en" }) {
  const { consolidatedReports, processes, dependencies, runConsolidation } = useBIA();
  const toast = useToast();
  const isAr = lang === "ar";

  const latestReport = consolidatedReports[0];

  const handleRefresh = () => {
    try {
      const r = runConsolidation(2026);
      toast.success(isAr ? `تم التجميع الآلي — ${r.total_processes} عملية` : `Consolidated — ${r.total_processes} processes`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const critColors = { CRITICAL: "text-red-400", HIGH: "text-amber-400", MEDIUM: "text-yellow-400", LOW: "text-emerald-400" };

  if (!latestReport) {
    return (
      <div className="space-y-4">
        <div className={isAr ? "text-right" : ""}>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest">{isAr ? "التقرير المجمع" : "CONSOLIDATED REPORT"}</p>
          <p className="text-sm font-bold text-white mt-0.5">{isAr ? "تقرير BIA المؤسسي" : "Enterprise BIA Report"}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <Database size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400 text-sm">{isAr ? "لا يوجد تقرير مجمع حتى الآن" : "No consolidated report yet"}</p>
          <button onClick={handleRefresh} className="mt-3 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors mx-auto">
            <RefreshCw size={12} />{isAr ? "تشغيل التجميع الآلي" : "Run Auto-Consolidation"}
          </button>
        </div>
      </div>
    );
  }

  const data = latestReport.aggregated_data;

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
        <div className={isAr ? "text-right" : ""}>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest">{isAr ? "التقرير المجمع — التجميع الآلي" : "CONSOLIDATED REPORT — AUTO-AGGREGATED"}</p>
          <p className="text-sm font-bold text-white mt-0.5">{isAr ? `BIA المؤسسي — السنة المالية ${latestReport.fiscal_year}` : `Enterprise BIA — FY ${latestReport.fiscal_year}`}</p>
        </div>
        <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
          <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors">
            <RefreshCw size={12} />{isAr ? "إعادة التجميع" : "Re-Consolidate"}
          </button>
          <button onClick={() => toast.success(isAr ? "جاري تصدير PDF..." : "Exporting PDF...")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors">
            <Download size={12} />{isAr ? "تصدير PDF" : "Export PDF"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: isAr ? "إجمالي العمليات" : "Total Processes", value: latestReport.total_processes, color: "text-white", icon: Database },
          { label: isAr ? "أقصر RTO" : "Minimum RTO", value: `${latestReport.org_min_rto}h`, color: "text-amber-400", icon: Clock },
          { label: isAr ? "أقصر MTPD" : "Minimum MTPD", value: `${latestReport.org_min_mtpd}h`, color: "text-red-400", icon: Target },
          { label: isAr ? "نقاط الفشل الموحدة" : "Single Points of Failure", value: data.spof_count, color: data.spof_count > 0 ? "text-red-400" : "text-emerald-400", icon: AlertTriangle },
        ].map((kpi, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <kpi.icon size={14} className="text-slate-500" />
              </div>
              <div className={isAr ? "text-right" : ""}>
                <p className={`text-xl font-black font-mono ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[9px] text-slate-500">{kpi.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Criticality Distribution */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className={`text-[10px] font-mono text-slate-500 tracking-widest mb-3 ${isAr ? "text-right" : ""}`}>
          {isAr ? "توزيع مستويات الأهمية" : "CRITICALITY DISTRIBUTION"}
        </p>
        <div className="flex items-center gap-4">
          {[
            { label: isAr ? "حرج" : "Critical", count: data.critical_count, color: "#ef4444" },
            { label: isAr ? "عالي" : "High", count: data.high_count, color: "#f97316" },
            { label: isAr ? "متوسط" : "Medium", count: data.medium_count, color: "#eab308" },
            { label: isAr ? "منخفض" : "Low", count: data.low_count, color: "#22c55e" },
          ].map((c, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="text-xl font-black font-mono" style={{ color: c.color }}>{c.count}</div>
              <p className="text-[10px] text-slate-500">{c.label}</p>
              <div className="h-1.5 mt-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ background: c.color, width: `${latestReport.total_processes ? (c.count / latestReport.total_processes) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery Priority Order */}
      {data.recovery_priority_order && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className={`text-[10px] font-mono text-slate-500 tracking-widest mb-3 ${isAr ? "text-right" : ""}`}>
            {isAr ? "أولويات التعافي — مرتبة حسب RTO تصاعدياً" : "RECOVERY PRIORITY ORDER — SORTED BY RTO ASC"}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ direction: isAr ? "rtl" : "ltr" }}>
              <thead>
                <tr className="border-b border-slate-800">
                  {[isAr ? "#" : "#", isAr ? "العملية" : "Process", "RTO", "MTPD", isAr ? "الأهمية" : "Criticality"].map((h) => (
                    <th key={h} className={`px-3 py-2 ${isAr ? "text-right" : "text-left"} text-[10px] text-slate-500 font-semibold`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recovery_priority_order.map((p, i) => (
                  <tr key={p.id} className={`border-b border-slate-800/60 ${i % 2 === 0 ? "" : "bg-slate-900/20"}`}>
                    <td className="px-3 py-2.5 font-mono text-cyan-400 font-bold">{i + 1}</td>
                    <td className={`px-3 py-2.5 text-slate-300 ${isAr ? "text-right" : ""}`}>{p.name}</td>
                    <td className="px-3 py-2.5 font-mono text-amber-400 font-bold">{p.rto}h</td>
                    <td className="px-3 py-2.5 font-mono text-red-400">{p.mtpd}h</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-semibold ${critColors[p.criticality] || "text-slate-400"}`}>{p.criticality}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono px-1">
        <span>{isAr ? "الإدارات المشمولة:" : "Departments covered:"} {data.departments_covered?.join(", ")}</span>
        <span>{isAr ? "حالة التقرير:" : "Report status:"} <span className="text-emerald-400">{latestReport.report_status}</span></span>
      </div>
    </div>
  );
}
