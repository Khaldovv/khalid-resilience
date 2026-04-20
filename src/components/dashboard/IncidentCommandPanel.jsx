import { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Clock, Zap, Shield } from 'lucide-react';

export default function IncidentCommandPanel({ data, lang = 'ar', onNavigate }) {
  const isRtl = lang === 'ar';
  if (!data) return null;

  const { activeCount, activeIncidents, lastIncidentDaysAgo, mttrHours, resolvedThisMonth, recentResolved } = data;

  // Live elapsed timer for active incidents
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (activeCount === 0) return;
    const t = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, [activeCount]);

  const formatElapsed = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const severityColor = (sev) => ({
    P1: { bg: 'bg-red-950', text: 'text-red-400', border: 'border-red-800' },
    P2: { bg: 'bg-amber-950', text: 'text-amber-400', border: 'border-amber-800' },
    P3: { bg: 'bg-blue-950', text: 'text-blue-400', border: 'border-blue-800' },
  }[sev] || { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' });

  return (
    <div className="rounded-xl border border-slate-800 p-4 h-full"
      style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center justify-between mb-4" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <p className="text-[10px] text-slate-500 tracking-wide">{isRtl ? 'مركز قيادة الحوادث' : 'Incident Command Center'}</p>
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeCount > 0 ? 'bg-red-950/60 border border-red-800/50' : 'bg-emerald-950/60 border border-emerald-800/50'}`}>
          {activeCount > 0 ? <AlertTriangle size={14} className="text-red-400" /> : <Shield size={14} className="text-emerald-400" />}
        </div>
      </div>

      {activeCount === 0 ? (
        /* ═══ State A: No Active Incidents ═══ */
        <div>
          <div className="text-center py-3">
            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)' }}>
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-emerald-400">{isRtl ? 'لا توجد حوادث نشطة حالياً' : 'No Active Incidents'}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: isRtl ? 'آخر حادث' : 'Last Incident', value: isRtl ? `${lastIncidentDaysAgo} يوم` : `${lastIncidentDaysAgo}d ago`, icon: Clock },
              { label: 'MTTR', value: `${mttrHours}h`, icon: Zap },
              { label: isRtl ? 'محلولة هذا الشهر' : 'Resolved (Month)', value: resolvedThisMonth, icon: CheckCircle2 },
            ].map((s, i) => (
              <div key={i} className="text-center p-2 rounded-lg border border-slate-800" style={{ background: 'rgba(15,23,42,0.5)' }}>
                <s.icon size={12} className="text-slate-500 mx-auto" />
                <p className="text-sm font-bold text-white mt-1">{s.value}</p>
                <p className="text-[8px] text-slate-600">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent resolved timeline */}
          <div className="mt-3 pt-3 border-t border-slate-800">
            <p className="text-[9px] text-slate-600 mb-2">{isRtl ? 'آخر الحوادث المحلولة' : 'Recently Resolved'}</p>
            <div className="space-y-1.5">
              {(recentResolved || []).slice(0, 4).map((inc, i) => {
                const sc = severityColor(inc.severity);
                return (
                  <div key={i} className="flex items-center gap-2" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-[10px] text-slate-400 flex-1 truncate">{inc.title[lang]}</span>
                    <span className={`text-[8px] px-1 py-0.5 rounded font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>{inc.severity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ═══ State B: Active Incidents ═══ */
        <div>
          {activeIncidents.slice(0, 1).map((inc, i) => (
            <div key={i} className="rounded-xl border border-red-800 p-3" style={{ background: 'rgba(69,10,10,0.2)' }}>
              <div className="flex items-center justify-between" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" /></span>
                  <span className="text-[10px] font-bold text-red-400 bg-red-950 border border-red-800 px-1.5 py-0.5 rounded">P1-CRITICAL</span>
                </div>
                <span className="text-xs font-mono font-bold text-red-400">{formatElapsed(elapsed)}</span>
              </div>
              <p className="text-xs font-bold text-white mt-2">{inc.title[lang]}</p>
              <p className="text-[10px] text-slate-400 mt-1">{inc.commander || (isRtl ? 'قائد الحادث: خالد الغفيلي' : 'IC: Khalid Al-Ghufaili')}</p>
              <button onClick={() => onNavigate?.('situation')}
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all">
                {isRtl ? 'انتقال لغرفة العمليات ←' : 'Go to Situation Room →'}
              </button>
            </div>
          ))}
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            {isRtl ? `إجمالي الحوادث النشطة: ${activeCount}` : `Total Active: ${activeCount}`}
          </p>
        </div>
      )}
    </div>
  );
}
