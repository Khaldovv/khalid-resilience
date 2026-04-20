import { Clock, AlertTriangle } from 'lucide-react';

const bodyColors = {
  NCA:   { bg: 'bg-red-950', text: 'text-red-400', border: 'border-red-800' },
  SAMA:  { bg: 'bg-cyan-950', text: 'text-cyan-400', border: 'border-cyan-800' },
  NDMO:  { bg: 'bg-blue-950', text: 'text-blue-400', border: 'border-blue-800' },
  SDAIA: { bg: 'bg-violet-950', text: 'text-violet-400', border: 'border-violet-800' },
  CMA:   { bg: 'bg-amber-950', text: 'text-amber-400', border: 'border-amber-800' },
  DGA:   { bg: 'bg-emerald-950', text: 'text-emerald-400', border: 'border-emerald-800' },
};

function daysColor(days) {
  if (days <= 7) return { text: 'text-red-400', bg: 'bg-red-950 border-red-800' };
  if (days <= 30) return { text: 'text-amber-400', bg: 'bg-amber-950 border-amber-800' };
  return { text: 'text-emerald-400', bg: 'bg-emerald-950 border-emerald-800' };
}

export default function RegulatoryCalendarPanel({ events = [], lang = 'ar', onNavigate }) {
  const isRtl = lang === 'ar';

  return (
    <div className="rounded-xl border border-slate-800 p-4 h-full"
      style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center justify-between mb-4" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <p className="text-[10px] text-slate-500 tracking-wide">{isRtl ? 'التقويم التنظيمي' : 'Regulatory Calendar'}</p>
          <p className="text-sm font-semibold text-white mt-0.5">{isRtl ? 'المواعيد النهائية — 90 يوم' : 'Deadlines — Next 90 Days'}</p>
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-950/60 border border-amber-800/50">
          <Clock size={14} className="text-amber-400" />
        </div>
      </div>

      {/* Today marker */}
      <div className="flex items-center gap-2 mb-3" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 flex-shrink-0" />
        <div className="flex-1 h-px bg-cyan-800" />
        <span className="text-[9px] text-cyan-400 font-semibold">{isRtl ? 'اليوم' : 'Today'}</span>
      </div>

      {/* Timeline */}
      <div className="space-y-2.5 relative">
        {/* Vertical line */}
        <div className={`absolute top-0 bottom-0 w-px bg-slate-800 ${isRtl ? 'right-3' : 'left-3'}`} />

        {events.map((evt, i) => {
          const dc = daysColor(evt.daysRemaining);
          const bc = bodyColors[evt.body] || bodyColors.NCA;
          return (
            <div key={i} className={`${isRtl ? 'pr-7' : 'pl-7'} relative`}>
              {/* Dot on timeline */}
              <div className={`absolute top-2 ${isRtl ? 'right-2' : 'left-2'} w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${evt.daysRemaining <= 7 ? 'bg-red-500' : evt.daysRemaining <= 30 ? 'bg-amber-500' : 'bg-slate-500'}`} />

              <div className="rounded-lg border border-slate-800 p-2.5 hover:border-slate-700 transition-all cursor-pointer"
                style={{ background: 'rgba(15,23,42,0.5)' }}>
                <div className="flex items-start justify-between" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                  <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${bc.bg} ${bc.text} ${bc.border}`}>{evt.body}</span>
                      {evt.daysRemaining <= 7 && <AlertTriangle size={10} className="text-red-400" />}
                    </div>
                    <p className="text-[11px] text-slate-200 font-medium leading-snug">{evt.title[lang]}</p>
                    <p className="text-[9px] text-slate-500 mt-1">
                      {evt.openActionItems} {isRtl ? 'بنود عمل مفتوحة' : 'open action items'} · {evt.deadline}
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded border flex-shrink-0 font-mono ${dc.bg} ${dc.text}`}>
                    {evt.daysRemaining}{isRtl ? 'ي' : 'd'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <button onClick={() => onNavigate?.('compliance')}
          className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
          {isRtl ? 'عرض التقويم الكامل ←' : 'View Full Calendar →'}
        </button>
      </div>
    </div>
  );
}
