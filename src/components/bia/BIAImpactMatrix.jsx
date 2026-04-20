import { useState, useMemo } from "react";
import { useBIA } from "../../context/BIAContext";
import { useToast } from "../ToastProvider";

const severityColors = {
  1: { bg: "#064e3b", text: "#6ee7b7", label: { ar: "منخفض", en: "Low" } },
  2: { bg: "#713f12", text: "#fde047", label: { ar: "متوسط", en: "Medium" } },
  3: { bg: "#7c2d12", text: "#fdba74", label: { ar: "عالي", en: "High" } },
  4: { bg: "#7f1d1d", text: "#fca5a5", label: { ar: "حرج", en: "Critical" } },
  5: { bg: "#450a0a", text: "#f87171", label: { ar: "كارثي", en: "Catastrophic" } },
};

export default function BIAImpactMatrix({ processId, lang = "en", readOnly = false }) {
  const { IMPACT_CATEGORIES, TIME_INTERVALS, IMPACT_CATEGORY_LABELS, getImpactsForProcess, upsertImpactRating } = useBIA();
  const toast = useToast();
  const isAr = lang === "ar";
  const impacts = getImpactsForProcess(processId);

  const getValue = (cat, time) => {
    const r = impacts.find((i) => i.impact_category === cat && i.time_interval_hours === time);
    return r ? r.severity_score : 0;
  };

  const maxSeverityPerCategory = useMemo(() => {
    const result = {};
    IMPACT_CATEGORIES.forEach((cat) => {
      const catImpacts = impacts.filter((i) => i.impact_category === cat);
      result[cat] = catImpacts.length ? Math.max(...catImpacts.map((i) => i.severity_score)) : 0;
    });
    return result;
  }, [impacts, IMPACT_CATEGORIES]);

  const overallMax = useMemo(() => Math.max(...Object.values(maxSeverityPerCategory), 0), [maxSeverityPerCategory]);

  const handleChange = (cat, time, score) => {
    upsertImpactRating(processId, cat, time, score);
  };

  const timeLabels = {
    1: "1h", 4: "4h", 8: "8h", 24: "24h", 48: "48h", 72: "72h", 168: "168h (7d)",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`flex items-center justify-between ${isAr ? "flex-row-reverse" : ""}`}>
        <div className={isAr ? "text-right" : ""}>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest">
            {isAr ? "مصفوفة تأثير الانقطاع — متوافق مع DGA" : "DISRUPTION IMPACT MATRIX — DGA COMPLIANT"}
          </p>
          <p className="text-sm font-bold text-white mt-0.5">
            {isAr ? "تقييم التأثيرات عبر الزمن" : "Time-Based Impact Assessment"}
          </p>
        </div>
        <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : ""}`}>
          {Object.entries(severityColors).map(([level, cfg]) => (
            <div key={level} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: cfg.bg, border: `1px solid ${cfg.text}40` }} />
              <span className="text-[9px] text-slate-500">{level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ direction: isAr ? "rtl" : "ltr" }}>
            <thead>
              <tr className="border-b border-slate-800" style={{ background: "rgba(15,23,42,0.9)" }}>
                <th className={`px-3 py-3 ${isAr ? "text-right" : "text-left"} font-semibold text-slate-500 text-[10px] tracking-wider min-w-[180px]`}>
                  {isAr ? "فئة التأثير" : "Impact Category"}
                </th>
                {TIME_INTERVALS.map((t) => (
                  <th key={t} className="px-2 py-3 text-center font-semibold text-slate-500 text-[10px] tracking-wider min-w-[70px]">
                    {timeLabels[t]}
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-semibold text-slate-500 text-[10px] tracking-wider">
                  {isAr ? "الأقصى" : "MAX"}
                </th>
              </tr>
            </thead>
            <tbody>
              {IMPACT_CATEGORIES.map((cat, catIdx) => (
                <tr key={cat} className={`border-b border-slate-800/60 ${catIdx % 2 === 0 ? "" : "bg-slate-900/20"}`}>
                  <td className={`px-3 py-3 ${isAr ? "text-right" : ""}`}>
                    <span className="text-slate-300 font-medium text-[11px]">
                      {isAr ? IMPACT_CATEGORY_LABELS[cat].ar : IMPACT_CATEGORY_LABELS[cat].en}
                    </span>
                  </td>
                  {TIME_INTERVALS.map((time) => {
                    const val = getValue(cat, time);
                    const cfg = val > 0 ? severityColors[val] : null;
                    return (
                      <td key={time} className="px-1 py-1.5 text-center">
                        {readOnly ? (
                          <div
                            className="w-full h-9 rounded-md flex items-center justify-center text-[11px] font-bold"
                            style={val > 0 ? { background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.text}40` } : { background: "#1e293b", color: "#475569" }}
                          >
                            {val || "—"}
                          </div>
                        ) : (
                          <select
                            value={val}
                            onChange={(e) => handleChange(cat, time, parseInt(e.target.value))}
                            className="w-full h-9 rounded-md text-center text-[11px] font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                            style={val > 0 ? { background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.text}40` } : { background: "#1e293b", color: "#64748b", border: "1px solid #334155" }}
                          >
                            <option value={0}>—</option>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center">
                    {maxSeverityPerCategory[cat] > 0 ? (
                      <span
                        className="inline-flex items-center justify-center w-9 h-9 rounded-md text-[11px] font-bold"
                        style={{ background: severityColors[maxSeverityPerCategory[cat]].bg, color: severityColors[maxSeverityPerCategory[cat]].text, border: `1px solid ${severityColors[maxSeverityPerCategory[cat]].text}40` }}
                      >
                        {maxSeverityPerCategory[cat]}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between" style={{ background: "rgba(15,23,42,0.5)" }}>
          <p className="text-[10px] text-slate-500">
            {isAr ? "التقييم الأعلى الإجمالي:" : "Overall Max Severity:"}{" "}
            {overallMax > 0 ? (
              <span className="font-bold" style={{ color: severityColors[overallMax].text }}>
                {overallMax} — {isAr ? severityColors[overallMax].label.ar : severityColors[overallMax].label.en}
              </span>
            ) : (
              <span className="text-slate-600">{isAr ? "لم يتم التقييم" : "Not assessed"}</span>
            )}
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            {isAr ? "ISO 22301:2019 — البند 8.2.2 · DGA v3" : "ISO 22301:2019 — Cl. 8.2.2 · DGA v3"}
          </p>
        </div>
      </div>
    </div>
  );
}
