export default function RiskLifecycleFunnel({ stages = [], lang = 'ar' }) {
  const isRtl = lang === 'ar';
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="rounded-xl border border-slate-800 p-4 h-full"
      style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center justify-between mb-4" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <p className="text-[10px] text-slate-500 tracking-wide">{isRtl ? 'قمع دورة حياة المخاطر' : 'Risk Lifecycle Funnel'}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {stages.map((s, i) => {
          const barWidth = (s.count / maxCount) * 100;
          return (
            <div key={i} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-300">{s.label[lang]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">{s.pct.toFixed(0)}%</span>
                  <span className="text-xs font-bold text-white font-mono">{s.count}</span>
                </div>
              </div>
              <div className="h-5 bg-slate-800/60 rounded-lg overflow-hidden relative">
                <div className="h-full rounded-lg transition-all duration-1000 flex items-center"
                  style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${s.color}cc, ${s.color})`,
                    boxShadow: `0 0 8px ${s.color}30`,
                  }}>
                </div>
              </div>
              {s.avgDays !== null && (
                <p className="text-[9px] text-slate-600 mt-0.5">
                  {isRtl ? `متوسط المدة: ${s.avgDays} يوم` : `Avg Duration: ${s.avgDays} days`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
