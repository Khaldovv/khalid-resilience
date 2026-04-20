import { useState } from "react";
import { useApp } from "../context/AppContext";
import { NavLink } from "react-router-dom";
import { ShieldCheck, Target, ScrollText, TrendingUp, CheckCircle2, AlertTriangle, BarChart3, ArrowRight, ExternalLink } from "lucide-react";

const frameworks = [
  { name: "ISO 22301", score: 96, status: "compliant", color: "#10b981" },
  { name: "SAMA BCM", score: 91, status: "compliant", color: "#06b6d4" },
  { name: "GDPR", score: 88, status: "nearCompliant", color: "#3b82f6" },
  { name: "NCA ECC", score: 94, status: "compliant", color: "#f59e0b" },
  { name: "PDPL", score: 82, status: "nearCompliant", color: "#8b5cf6" },
  { name: "SOC 2", score: 94, status: "compliant", color: "#10b981" },
];

export default function ComplianceDashboard() {
  const { t, isRTL } = useApp();
  const overallScore = Math.round(frameworks.reduce((s, f) => s + f.score, 0) / frameworks.length);

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <div className={`mb-6 ${isRTL ? "text-right" : ""}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white m-0">{t('nav.compliance')}</h1>
            <p className="text-xs text-slate-400 m-0">{isRTL ? "نظرة شاملة على الامتثال للأطر التنظيمية والمعايير الدولية" : "Unified compliance overview across regulatory frameworks & standards"}</p>
          </div>
        </div>
      </div>

      {/* Overall Score + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-emerald-800/40 p-5" style={{ background: "rgba(16,185,129,0.06)" }}>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider mb-1">{isRTL ? "درجة الامتثال الإجمالية" : "OVERALL COMPLIANCE SCORE"}</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-emerald-400 font-mono">{overallScore}%</span>
          </div>
          <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000" style={{ width: `${overallScore}%` }} />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <TrendingUp size={11} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-semibold">+2.3% {isRTL ? "عن الدورة السابقة" : "vs last cycle"}</span>
          </div>
        </div>

        {/* Quick Access Panels */}
        <NavLink to="/sumood" className="rounded-xl border border-slate-800 p-5 hover:border-violet-800/40 transition-all group no-underline" style={{ background: "rgba(15,23,42,0.6)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-950/60 border border-violet-800/50">
              <Target size={14} className="text-violet-400" />
            </div>
            <p className="text-sm font-semibold text-white m-0">{isRTL ? "مؤشر صمود الوطني" : "National Sumood Index"}</p>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed m-0">{isRTL ? "تقييم النضج المؤسسي وفق مؤشر صمود الوطني" : "National resilience maturity assessment"}</p>
          <div className="mt-3 flex items-center gap-1 text-violet-400 text-[11px] font-semibold group-hover:gap-2 transition-all">
            <span>{isRTL ? "عرض التقييم" : "View Assessment"}</span>
            <ArrowRight size={11} />
          </div>
        </NavLink>

        <NavLink to="/regulatory" className="rounded-xl border border-slate-800 p-5 hover:border-cyan-800/40 transition-all group no-underline" style={{ background: "rgba(15,23,42,0.6)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-950/60 border border-cyan-800/50">
              <ScrollText size={14} className="text-cyan-400" />
            </div>
            <p className="text-sm font-semibold text-white m-0">{isRTL ? "التحديثات التنظيمية" : "Regulatory Updates"}</p>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed m-0">{isRTL ? "أحدث التحديثات والتغييرات في اللوائح والأنظمة" : "Latest regulatory changes & policy updates"}</p>
          <div className="mt-3 flex items-center gap-1 text-cyan-400 text-[11px] font-semibold group-hover:gap-2 transition-all">
            <span>{isRTL ? "عرض التحديثات" : "View Updates"}</span>
            <ArrowRight size={11} />
          </div>
        </NavLink>

        <div className="rounded-xl border border-slate-800 p-5" style={{ background: "rgba(15,23,42,0.6)" }}>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider mb-2">{isRTL ? "الملخص" : "SUMMARY"}</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{isRTL ? "أطر ملتزمة" : "Compliant Frameworks"}</span>
              <span className="text-sm font-bold text-emerald-400">{frameworks.filter(f => f.status === "compliant").length}/{frameworks.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{isRTL ? "تتطلب انتباه" : "Need Attention"}</span>
              <span className="text-sm font-bold text-amber-400">{frameworks.filter(f => f.status === "nearCompliant").length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{isRTL ? "آخر تدقيق" : "Last Audit"}</span>
              <span className="text-[11px] text-slate-400 font-mono">18 Mar 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Framework Grid */}
      <div className="mb-3">
        <p className="text-[10px] text-slate-500 font-mono tracking-wider">{isRTL ? "حالة الأطر التنظيمية" : "FRAMEWORK STATUS"}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {frameworks.map((fw, i) => (
          <div key={i} className="rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-all" style={{ background: "rgba(15,23,42,0.6)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: fw.color }} />
                <span className="text-sm font-semibold text-white">{fw.name}</span>
              </div>
              {fw.status === "compliant" ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} />
                  {isRTL ? "ملتزم" : "Compliant"}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                  <AlertTriangle size={10} />
                  {isRTL ? "قرب الحد" : "Near-compliant"}
                </span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-black font-mono" style={{ color: fw.color }}>{fw.score}%</span>
              <span className="text-[10px] text-slate-500 mb-1">{isRTL ? "درجة الالتزام" : "adherence"}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${fw.score}%`, background: fw.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
