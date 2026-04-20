import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const statusLabels = {
  COMPLIANT:    { ar: 'متوافق',      en: 'Compliant',       color: 'text-emerald-400', bg: 'bg-emerald-950 border-emerald-800' },
  NEAR_LIMIT:   { ar: 'قريب الحد',    en: 'Near Limit',      color: 'text-amber-400',   bg: 'bg-amber-950 border-amber-800' },
  NEEDS_ACTION: { ar: 'يتطلب تدخل',  en: 'Needs Action',    color: 'text-red-400',     bg: 'bg-red-950 border-red-800' },
  OVERDUE:      { ar: 'متأخر',       en: 'Overdue',         color: 'text-red-400',     bg: 'bg-red-950 border-red-800' },
};

export default function ComplianceDistributionPanel({ frameworks = [], lang = 'ar' }) {
  const isRtl = lang === 'ar';
  const donutData = [
    { name: isRtl ? 'متوافق' : 'Compliant', value: frameworks.filter(f => f.status === 'COMPLIANT').length, color: '#10b981' },
    { name: isRtl ? 'قريب الحد' : 'Near Limit', value: frameworks.filter(f => f.status === 'NEAR_LIMIT').length, color: '#f59e0b' },
    { name: isRtl ? 'يتطلب تدخل' : 'Needs Action', value: frameworks.filter(f => f.status === 'NEEDS_ACTION' || f.status === 'OVERDUE').length, color: '#ef4444' },
  ];

  return (
    <div className="rounded-xl border border-slate-800 p-4 h-full"
      style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center justify-between mb-4" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <p className="text-[10px] text-slate-500 tracking-wide">{isRtl ? 'توزيع الامتثال التنظيمي' : 'Regulatory Compliance Distribution'}</p>
          <p className="text-sm font-semibold text-white mt-0.5">{isRtl ? 'الوقت الفعلي' : 'Real-Time'}</p>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
          {isRtl ? 'آخر تدقيق: 18 مارس 2026' : 'Last Audit: Mar 18, 2026'}
        </span>
      </div>

      <div className="flex gap-4" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        {/* Framework bars */}
        <div className="flex-1 space-y-2.5">
          {frameworks.map((f, i) => {
            const st = statusLabels[f.status] || statusLabels.COMPLIANT;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-300 font-medium">{f.name[lang]}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${st.bg} ${st.color}`}>{st[lang] || st.en}</span>
                    <span className="text-xs font-bold text-white font-mono">{f.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${f.percentage}%`,
                      background: `linear-gradient(90deg, ${f.color}cc, ${f.color})`,
                      boxShadow: `0 0 6px ${f.color}40`,
                    }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Mini donut */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center">
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie data={donutData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={28} outerRadius={42} dataKey="value" paddingAngle={4} strokeWidth={0}>
                {donutData.filter(d => d.value > 0).map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center -mt-1">
            {donutData.filter(d => d.value > 0).map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[9px] text-slate-400">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                {d.name}: <span className="text-white font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
