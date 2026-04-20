import { useState } from 'react';
import { RefreshCw, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartTooltip = ({ active, payload, label, lang }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl text-xs" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <p className="text-slate-400 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function RiskTrendChart({ data = [], lang = 'ar' }) {
  const isRtl = lang === 'ar';
  const [period, setPeriod] = useState('6m');
  const periods = [
    { id: '6m', label: isRtl ? '6 أشهر' : '6 Months' },
    { id: '12m', label: isRtl ? '12 شهر' : '12 Months' },
    { id: 'ytd', label: isRtl ? 'هذا العام' : 'YTD' },
  ];

  return (
    <div className="rounded-xl border border-slate-800 p-4 transition-all duration-300 shadow-lg shadow-cyan-500/5 border-slate-700 h-full"
      style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center justify-between mb-4" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className="flex items-center gap-2">
          {periods.map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all border ${
                period === p.id ? 'bg-cyan-950 text-cyan-400 border-cyan-800' : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-600'}`}>
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 ml-3">
            <span className="w-3 h-0.5 bg-red-500 inline-block rounded" />{isRtl ? 'كامن' : 'Inherent'}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-3 h-0.5 bg-cyan-500 inline-block rounded" />{isRtl ? 'متبقي' : 'Residual'}
          </div>
        </div>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <p className="text-[10px] text-slate-500 tracking-wide">{isRtl ? 'اتجاهات التعرض للمخاطر' : 'Risk Exposure Trends'}</p>
          <p className="text-sm font-semibold text-white mt-0.5">{isRtl ? 'الخطر الكامن مقابل المتبقي' : 'Inherent vs Residual Risk'}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="iGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip lang={lang} />} />
          <Area type="monotone" dataKey="inherent" name={isRtl ? 'الخطر الكامن' : 'Inherent Risk'} stroke="#ef4444" strokeWidth={2} fill="url(#iGrad)" dot={{ fill: '#ef4444', r: 3, strokeWidth: 0 }} />
          <Area type="monotone" dataKey="residual" name={isRtl ? 'الخطر المتبقي' : 'Residual Risk'} stroke="#06b6d4" strokeWidth={2} fill="url(#rGrad)" dot={{ fill: '#06b6d4', r: 3, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <p className="text-[10px] text-slate-500">
          {isRtl ? 'فعالية التخفيف:' : 'Mitigation Effectiveness:'} <span className="text-emerald-400 font-bold">+18.6%</span> {isRtl ? 'ربعياً' : 'QoQ'}
        </p>
      </div>
    </div>
  );
}
