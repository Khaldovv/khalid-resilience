import { Globe, ShieldCheck, Cpu, Play } from 'lucide-react';

const iconMap = { SUPPLY_CHAIN: Globe, COMPLIANCE_DRIFT: ShieldCheck, THREAT_INTEL: Cpu };
const severityStyles = {
  critical: { border: 'border-red-800/60', bg: 'rgba(69,10,10,0.2)', iconBg: 'bg-red-950/60 border-red-800/50', iconColor: 'text-red-400', tag: 'bg-red-950 text-red-400' },
  warning:  { border: 'border-amber-800/60', bg: 'rgba(120,53,15,0.15)', iconBg: 'bg-amber-950/60 border-amber-800/50', iconColor: 'text-amber-400', tag: 'bg-amber-950 text-amber-400' },
  info:     { border: 'border-cyan-800/60', bg: 'rgba(8,51,68,0.2)', iconBg: 'bg-cyan-950/60 border-cyan-800/50', iconColor: 'text-cyan-400', tag: 'bg-cyan-950 text-cyan-400' },
};

export default function AIInsightsPanel({ insights = [], lang = 'ar', onNavigate }) {
  const isRtl = lang === 'ar';
  return (
    <div className="rounded-xl border border-slate-800 p-4 h-full"
      style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center justify-between mb-3" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <p className="text-[10px] text-slate-500 tracking-wide">{isRtl ? 'رؤى الذكاء الاصطناعي التنبؤية' : 'AI Predictive Insights'}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" /></span>
          <span className="text-[10px] text-cyan-400">{isRtl ? 'استدلال مباشر' : 'Live Inference'}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {insights.map((ins, i) => {
          const s = severityStyles[ins.severity] || severityStyles.info;
          const Icon = iconMap[ins.type] || Globe;
          return (
            <div key={i} className={`rounded-xl border ${s.border} p-3.5 transition-all duration-300 hover:scale-[1.01]`} style={{ background: s.bg }}>
              <div className="flex items-start gap-2.5" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <p className="text-[12px] font-semibold text-white leading-snug">{ins.title[lang]}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{ins.description[lang]}</p>
                  <div className={`flex flex-wrap gap-1 mt-2 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                    {ins.tags[lang].map((tag, j) => (
                      <span key={j} className={`text-[9px] px-1.5 py-0.5 rounded ${s.tag}`}>{tag}</span>
                    ))}
                  </div>
                  <div className={`mt-2.5 flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
                    <button className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all active:scale-95 ${
                      ins.severity === 'critical' ? 'bg-red-600 hover:bg-red-500 text-white' :
                      ins.severity === 'warning' ? 'bg-amber-600 hover:bg-amber-500 text-white' :
                      'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}>
                      <Play size={10} />
                      {ins.actionLabel[lang]}
                    </button>
                  </div>
                </div>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${s.iconBg} border`}>
                  <Icon size={13} className={s.iconColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <button onClick={() => onNavigate?.('ai')}
          className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
          {isRtl ? `عرض كل الرؤى (${insights.length}) ←` : `View All Insights (${insights.length}) →`}
        </button>
      </div>
    </div>
  );
}
