import { useSumood } from "../../context/SumoodContext";
import { Target, TrendingUp, Award, ChevronRight } from "lucide-react";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from "recharts";

export default function SumoodDashboard({ lang = "en", deptId = "IT", year = 2026 }) {
  const { pillars, getAllPillarScores, getOrgScore, MATURITY_LEVELS } = useSumood();
  const isAr = lang === "ar";

  const orgScore = getOrgScore(deptId, year);
  const pillarData = getAllPillarScores(deptId, year);

  const radarData = pillarData.map((p) => ({
    subject: isAr ? p.pillar.name_ar : p.pillar.name_en,
    score: p.score,
    fullMark: 7,
  }));

  const maturityLevel = MATURITY_LEVELS.find((m) => m.level === Math.round(orgScore)) || MATURITY_LEVELS[0];

  const ScoreGauge = ({ score, size = "lg" }) => {
    const pct = (score / 7) * 100;
    const level = MATURITY_LEVELS.find((m) => m.level === Math.round(score)) || MATURITY_LEVELS[0];
    const radius = size === "lg" ? 60 : 30;
    const stroke = size === "lg" ? 8 : 5;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (pct / 100) * circ;
    const svgSize = (radius + stroke) * 2;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke="#1e293b" strokeWidth={stroke} />
          <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke={level.color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${size === "lg" ? "text-2xl" : "text-sm"} font-black font-mono`} style={{ color: level.color }}>
            {score.toFixed(1)}
          </span>
          <span className={`${size === "lg" ? "text-[10px]" : "text-[8px]"} text-slate-500`}>/7</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
        <div className={isAr ? "text-right" : ""}>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest">{isAr ? "مؤشر صمود الوطني" : "NATIONAL RESILIENCE INDEX (SUMOOD)"}</p>
          <p className="text-lg font-bold text-white mt-0.5">{isAr ? "لوحة معلومات مؤشر صمود" : "Sumood Index Dashboard"}</p>
        </div>
        <span className="text-[9px] font-mono text-slate-600">{isAr ? "مقياس النضج السباعي" : "7-Level Maturity Scale"}</span>
      </div>

      {/* Main Score + Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Organization Score Card */}
        <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center">
          <p className="text-[10px] font-mono text-slate-500 tracking-widest mb-3">{isAr ? "النضج المؤسسي" : "ORGANIZATIONAL MATURITY"}</p>
          <ScoreGauge score={orgScore} />
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border" style={{ color: maturityLevel.color, background: `${maturityLevel.color}18`, borderColor: `${maturityLevel.color}40` }}>
              <Award size={12} />
              {isAr ? maturityLevel.ar : maturityLevel.en}
            </span>
            <p className="text-[10px] text-slate-500 mt-2">{isAr ? `${deptId} — السنة المالية ${year}` : `${deptId} — FY ${year}`}</p>
          </div>

          {/* Maturity Scale Legend */}
          <div className="mt-4 pt-4 border-t border-slate-800 w-full">
            <p className="text-[9px] text-slate-600 mb-2 text-center">{isAr ? "مقياس النضج" : "MATURITY SCALE"}</p>
            <div className="grid grid-cols-7 gap-1">
              {MATURITY_LEVELS.map((m) => (
                <div key={m.level} className="text-center">
                  <div className={`w-full h-2 rounded ${m.bg} ${Math.round(orgScore) >= m.level ? "opacity-100" : "opacity-30"}`} />
                  <span className="text-[8px] text-slate-600">{m.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="xl:col-span-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className={`text-[10px] font-mono text-slate-500 tracking-widest mb-2 ${isAr ? "text-right" : ""}`}>
            {isAr ? "المحاور الخمسة — نظرة شاملة" : "FIVE PILLARS — OVERVIEW"}
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 9 }} />
              <PolarRadiusAxis angle={90} domain={[0, 7]} tick={{ fill: "#475569", fontSize: 8 }} />
              <Radar name={isAr ? "مستوى النضج" : "Maturity Level"} dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {pillarData.map((pd) => {
          const level = MATURITY_LEVELS.find((m) => m.level === Math.round(pd.score)) || MATURITY_LEVELS[0];
          return (
            <div key={pd.pillar.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-600 transition-all">
              <div className={`flex items-center justify-between mb-3 ${isAr ? "flex-row-reverse" : ""}`}>
                <ScoreGauge score={pd.score} size="sm" />
                <div className={isAr ? "text-right flex-1 mr-3" : "flex-1 ml-3"}>
                  <p className="text-[11px] font-semibold text-white leading-snug">
                    {isAr ? pd.pillar.name_ar : pd.pillar.name_en}
                  </p>
                  <span className="text-[9px] font-mono" style={{ color: level.color }}>{isAr ? level.ar : level.en}</span>
                </div>
              </div>
              {/* Component scores */}
              <div className="space-y-1.5">
                {pd.components.map((cd) => {
                  const compLevel = MATURITY_LEVELS.find((m) => m.level === Math.round(cd.score)) || MATURITY_LEVELS[0];
                  return (
                    <div key={cd.component.id} className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(cd.score / 7) * 100}%`, background: compLevel.color }} />
                      </div>
                      <span className="text-[9px] font-mono font-bold min-w-[24px] text-right" style={{ color: compLevel.color }}>{cd.score.toFixed(1)}</span>
                      <span className="text-[8px] text-slate-600 min-w-[48px] truncate">{cd.component.code}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
