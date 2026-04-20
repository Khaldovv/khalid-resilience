import { useSumood } from "../../context/SumoodContext";
import { AlertTriangle, TrendingUp, CheckCircle2, Target } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, Legend } from "recharts";

const priorityConfig = {
  critical: { color: "#ef4444", ar: "حرج — تدخل عاجل", en: "Critical — Urgent Action" },
  high:     { color: "#f97316", ar: "عالي — خطة تحسين", en: "High — Improvement Plan" },
  medium:   { color: "#eab308", ar: "متوسط — تعزيز",    en: "Medium — Enhancement" },
  low:      { color: "#22c55e", ar: "منخفض — صيانة",    en: "Low — Maintenance" },
};

export default function SumoodGapAnalysis({ lang = "en", deptId = "IT", year = 2026, targetLevel = 5 }) {
  const { getGapAnalysis, MATURITY_LEVELS } = useSumood();
  const isAr = lang === "ar";

  const gaps = getGapAnalysis(deptId, year, targetLevel);

  // Flatten for chart
  const chartData = gaps.flatMap((pg) =>
    pg.components.map((cg) => ({
      name: cg.component.code,
      current: cg.currentScore,
      target: targetLevel,
      gap: cg.gap,
      priority: cg.priority,
    }))
  );

  const totalGaps = chartData.filter((d) => d.gap > 0).length;
  const criticalGaps = chartData.filter((d) => d.priority === "critical").length;
  const avgGap = chartData.length ? +(chartData.reduce((a, d) => a + d.gap, 0) / chartData.length).toFixed(2) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
        <div className={isAr ? "text-right" : ""}>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest">{isAr ? "تحليل الفجوات — مؤشر صمود" : "GAP ANALYSIS — SUMOOD INDEX"}</p>
          <p className="text-sm font-bold text-white mt-0.5">{isAr ? "الحالي مقابل المستهدف" : "Current vs. Target Assessment"}</p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs text-slate-400 ${isAr ? "flex-row-reverse" : ""}`}>
          <Target size={12} className="text-cyan-400" />
          {isAr ? "المستهدف:" : "Target:"} <span className="font-mono font-bold text-cyan-400">{targetLevel}/7</span>
          <span className="text-slate-600">({isAr ? MATURITY_LEVELS.find((m) => m.level === targetLevel)?.ar : MATURITY_LEVELS.find((m) => m.level === targetLevel)?.en})</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: isAr ? "إجمالي الفجوات" : "Total Gaps", value: totalGaps, color: "text-white", icon: TrendingUp },
          { label: isAr ? "فجوات حرجة" : "Critical Gaps", value: criticalGaps, color: criticalGaps > 0 ? "text-red-400" : "text-emerald-400", icon: AlertTriangle },
          { label: isAr ? "متوسط الفجوة" : "Average Gap", value: avgGap.toFixed(1), color: "text-amber-400", icon: Target },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <s.icon size={14} className="text-slate-500" />
            </div>
            <div>
              <p className={`text-xl font-black font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className={`text-[10px] font-mono text-slate-500 tracking-widest mb-3 ${isAr ? "text-right" : ""}`}>
          {isAr ? "مقارنة مستوى النضج لكل مكون" : "MATURITY LEVEL PER COMPONENT"}
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9 }} />
            <YAxis domain={[0, 7]} tick={{ fill: "#475569", fontSize: 9 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }} />
            <ReferenceLine y={targetLevel} stroke="#06b6d4" strokeDasharray="5 5" strokeWidth={2} label={{ value: isAr ? "المستهدف" : "Target", fill: "#06b6d4", fontSize: 10 }} />
            <Bar dataKey="current" name={isAr ? "الحالي" : "Current"} radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={priorityConfig[entry.priority]?.color || "#64748b"} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Gap Analysis per Pillar */}
      <div className="space-y-3">
        {gaps.map((pg) => (
          <div key={pg.pillar.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className={`text-xs font-semibold text-white mb-3 ${isAr ? "text-right" : ""}`}>
              {isAr ? pg.pillar.name_ar : pg.pillar.name_en}
            </p>
            <div className="space-y-2">
              {pg.components.map((cg) => {
                const pc = priorityConfig[cg.priority];
                return (
                  <div key={cg.component.id} className="rounded-lg border border-slate-800/50 p-3">
                    <div className={`flex items-center justify-between mb-2 ${isAr ? "flex-row-reverse" : ""}`}>
                      <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                        <span className="font-mono text-[10px] text-cyan-400 font-bold">{cg.component.code}</span>
                        <span className="text-[11px] text-slate-300">{isAr ? cg.component.name_ar : cg.component.name_en}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                        <span className="text-[10px] font-mono text-slate-400">{cg.currentScore.toFixed(1)} → {targetLevel}</span>
                        {cg.gap > 0 ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border" style={{ color: pc.color, background: `${pc.color}18`, borderColor: `${pc.color}40` }}>
                            <AlertTriangle size={9} />
                            {isAr ? `فجوة ${cg.gap.toFixed(1)}` : `Gap ${cg.gap.toFixed(1)}`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800">
                            <CheckCircle2 size={9} />
                            {isAr ? "مستوفى" : "Met"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar: current vs target */}
                    <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${(cg.currentScore / 7) * 100}%`, background: pc.color }} />
                      <div className="absolute inset-y-0 w-0.5 bg-cyan-400" style={{ left: `${(targetLevel / 7) * 100}%` }} />
                    </div>

                    {/* Recommendation */}
                    {cg.gap > 0 && (
                      <p className={`text-[10px] text-slate-500 mt-1.5 ${isAr ? "text-right" : ""}`}>
                        💡 {cg.recommendation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
