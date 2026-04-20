import { useState, useMemo } from "react";
import { useSumood } from "../../context/SumoodContext";
import { useToast } from "../ToastProvider";
import { ChevronDown, ChevronRight, Save, FileText, CheckCircle2 } from "lucide-react";

export default function SumoodSelfAssessment({ lang = "en", deptId = "IT", year = 2026 }) {
  const { pillars, getKpisForComponent, getAssessmentForKpi, submitAssessment, MATURITY_LEVELS } = useSumood();
  const toast = useToast();
  const isAr = lang === "ar";

  const [expandedPillar, setExpandedPillar] = useState(pillars[0]?.id || null);
  const [expandedComponent, setExpandedComponent] = useState(null);

  const completionStats = useMemo(() => {
    let total = 0, answered = 0;
    pillars.forEach((p) => p.components.forEach((c) => {
      const kpis = getKpisForComponent(c.id);
      total += kpis.length;
      kpis.forEach((k) => { if (getAssessmentForKpi(k.id, deptId, year)) answered++; });
    }));
    return { total, answered, pct: total ? Math.round((answered / total) * 100) : 0 };
  }, [pillars, getKpisForComponent, getAssessmentForKpi, deptId, year]);

  const handleScore = (kpiId, level) => {
    submitAssessment(kpiId, deptId, year, level);
    toast.success(isAr ? "تم حفظ التقييم" : "Assessment saved", 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
        <div className={isAr ? "text-right" : ""}>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest">{isAr ? "التقييم الذاتي لمؤشر صمود" : "SUMOOD SELF-ASSESSMENT"}</p>
          <p className="text-sm font-bold text-white mt-0.5">{isAr ? `استبيان المقاييس الـ ${completionStats.total}` : `${completionStats.total} KPI Assessment Questionnaire`}</p>
        </div>
        <span className="text-[9px] font-mono text-slate-600">{deptId} · FY{year}</span>
      </div>

      {/* Completion Bar */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
        <div className={`flex items-center justify-between mb-2 ${isAr ? "flex-row-reverse" : ""}`}>
          <span className="text-[11px] text-slate-400">{isAr ? "نسبة الإكمال" : "Completion"}</span>
          <span className="text-xs font-bold text-cyan-400 font-mono">{completionStats.answered}/{completionStats.total} · {completionStats.pct}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${completionStats.pct}%` }} />
        </div>
      </div>

      {/* Pillars Accordion */}
      <div className="space-y-2">
        {pillars.map((pillar) => {
          const isExpanded = expandedPillar === pillar.id;
          return (
            <div key={pillar.id} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              {/* Pillar Header */}
              <button
                onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/40 transition-colors ${isAr ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex items-center gap-3 ${isAr ? "flex-row-reverse" : ""}`}>
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[10px] font-bold text-cyan-400 font-mono">
                    {pillar.sort}
                  </div>
                  <span className="text-sm font-semibold text-white">{isAr ? pillar.name_ar : pillar.name_en}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{pillar.components.length} {isAr ? "مكونات" : "components"}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {/* Components */}
              {isExpanded && (
                <div className="border-t border-slate-800 px-4 py-2 space-y-1">
                  {pillar.components.map((comp) => {
                    const kpis = getKpisForComponent(comp.id);
                    const answeredCount = kpis.filter((k) => getAssessmentForKpi(k.id, deptId, year)).length;
                    const isCompExpanded = expandedComponent === comp.id;

                    return (
                      <div key={comp.id} className="rounded-lg border border-slate-800/50">
                        <button
                          onClick={() => setExpandedComponent(isCompExpanded ? null : comp.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-slate-800/30 transition-colors ${isAr ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                            <span className="font-mono text-cyan-400 text-[10px] font-bold">{comp.code}</span>
                            <span className="text-slate-300 font-medium">{isAr ? comp.name_ar : comp.name_en}</span>
                          </div>
                          <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                            <span className={`text-[10px] font-mono ${answeredCount === kpis.length ? "text-emerald-400" : "text-slate-500"}`}>
                              {answeredCount}/{kpis.length}
                            </span>
                            {answeredCount === kpis.length && <CheckCircle2 size={11} className="text-emerald-400" />}
                            <ChevronRight size={12} className={`text-slate-600 transition-transform ${isCompExpanded ? "rotate-90" : ""}`} />
                          </div>
                        </button>

                        {/* KPIs */}
                        {isCompExpanded && (
                          <div className="border-t border-slate-800/50 px-3 py-2 space-y-2">
                            {kpis.map((kpi, kpiIdx) => {
                              const assessment = getAssessmentForKpi(kpi.id, deptId, year);
                              const currentLevel = assessment?.maturity_level || 0;

                              return (
                                <div key={kpi.id} className={`rounded-lg border border-slate-800/30 p-3 ${currentLevel > 0 ? "bg-slate-800/10" : "bg-slate-900/30"}`}>
                                  <div className={`flex items-start gap-2 mb-2 ${isAr ? "flex-row-reverse text-right" : ""}`}>
                                    <span className="font-mono text-[9px] text-slate-600 flex-shrink-0">{kpi.kpi_code}</span>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">{kpi.kpi_text_ar}</p>
                                  </div>

                                  {/* 7-Level Maturity Selector */}
                                  <div className={`flex items-center gap-1 ${isAr ? "flex-row-reverse" : ""}`}>
                                    {MATURITY_LEVELS.map((m) => (
                                      <button
                                        key={m.level}
                                        onClick={() => handleScore(kpi.id, m.level)}
                                        title={isAr ? m.ar : m.en}
                                        className={`flex-1 h-8 rounded-md text-[10px] font-bold transition-all border
                                          ${currentLevel === m.level
                                            ? "ring-2 ring-offset-1 ring-offset-slate-900"
                                            : "opacity-40 hover:opacity-80"
                                          }`}
                                        style={{
                                          background: currentLevel === m.level ? `${m.color}30` : `${m.color}10`,
                                          borderColor: currentLevel === m.level ? m.color : `${m.color}30`,
                                          color: m.color,
                                          ...(currentLevel === m.level ? { ringColor: m.color } : {}),
                                        }}
                                      >
                                        {m.level}
                                      </button>
                                    ))}
                                  </div>
                                  {currentLevel > 0 && (
                                    <p className="text-[9px] mt-1.5 font-mono" style={{ color: MATURITY_LEVELS.find((m) => m.level === currentLevel)?.color }}>
                                      {isAr ? MATURITY_LEVELS.find((m) => m.level === currentLevel)?.ar : MATURITY_LEVELS.find((m) => m.level === currentLevel)?.en}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
