import { Database, Network, Target, TrendingUp } from 'lucide-react';

export default function OperationalResiliencePanel({ data, lang = 'ar' }) {
  const isRtl = lang === 'ar';
  if (!data) return null;

  const { overallIndex, bia, vendors, sumood } = data;
  const indexColor = overallIndex >= 7 ? '#10b981' : overallIndex >= 5 ? '#f59e0b' : '#ef4444';

  const subMetrics = [
    {
      icon: Database, accent: 'cyan',
      title: isRtl ? 'تحليل تأثير الأعمال' : 'Business Impact Analysis',
      line1: isRtl ? `${bia.criticalProcesses} عملية حيوية مُقيّمة` : `${bia.criticalProcesses} critical processes assessed`,
      line2: isRtl ? `${bia.approvedCycles} دورات معتمدة | ${bia.pendingCycles} بانتظار الاعتماد` : `${bia.approvedCycles} approved cycles | ${bia.pendingCycles} pending`,
      badge: isRtl ? `أقصر RTO: ${bia.shortestRTO}س` : `Shortest RTO: ${bia.shortestRTO}h`,
    },
    {
      icon: Network, accent: 'amber',
      title: isRtl ? 'استمرارية الموردين' : 'Vendor Continuity',
      line1: isRtl ? `${vendors.criticalCount} مورد حرج | ${vendors.needsReview} بحاجة لمراجعة عاجلة` : `${vendors.criticalCount} critical vendors | ${vendors.needsReview} need urgent review`,
      line2: isRtl ? `متوسط درجة الخطورة: ${vendors.avgRiskScore}/5` : `Avg risk score: ${vendors.avgRiskScore}/5`,
      badge: isRtl ? `${vendors.expiringContracts} عقود تنتهي قريباً` : `${vendors.expiringContracts} contracts expiring`,
    },
    {
      icon: Target, accent: 'violet',
      title: isRtl ? 'النضج المؤسسي (صمود)' : 'Org. Maturity (Sumood)',
      line1: isRtl ? `مستوى ${sumood.maturityLevel}/7 (متقدم)` : `Level ${sumood.maturityLevel}/7 (Advanced)`,
      line2: isRtl ? `${sumood.kpisAssessed} مقياس مُقيّم | أقل محور: ${sumood.lowestPillarName[lang]} (${sumood.lowestScore})` : `${sumood.kpisAssessed} KPIs assessed | Lowest: ${sumood.lowestPillarName[lang]} (${sumood.lowestScore})`,
      badge: isRtl ? `↑ +${sumood.trend} منذ آخر تقييم` : `↑ +${sumood.trend} since last assessment`,
    },
  ];

  const accentMap = {
    cyan: { iconBg: 'bg-cyan-950/60 border-cyan-800/50', iconColor: 'text-cyan-400' },
    amber: { iconBg: 'bg-amber-950/60 border-amber-800/50', iconColor: 'text-amber-400' },
    violet: { iconBg: 'bg-violet-950/60 border-violet-800/50', iconColor: 'text-violet-400' },
  };

  return (
    <div className="rounded-xl border border-slate-800 p-4 h-full"
      style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center justify-between mb-4" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <p className="text-[10px] text-slate-500 tracking-wide">{isRtl ? 'مؤشر المرونة التشغيلية' : 'Operational Resilience Index'}</p>
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-950/60 border border-emerald-800/50">
          <TrendingUp size={14} className="text-emerald-400" />
        </div>
      </div>

      {/* Overall Index */}
      <div className="text-center mb-4">
        <p className="text-4xl font-black" style={{ color: indexColor }}>{overallIndex}</p>
        <p className="text-slate-500 text-[10px]">{isRtl ? 'من 10' : 'out of 10'}</p>
        <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden max-w-[200px] mx-auto">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${overallIndex * 10}%`, background: `linear-gradient(90deg, ${indexColor}cc, ${indexColor})` }} />
        </div>
      </div>

      {/* 3 Sub-metrics */}
      <div className="space-y-2.5">
        {subMetrics.map((m, i) => {
          const ac = accentMap[m.accent];
          return (
            <div key={i} className="rounded-lg border border-slate-800 p-2.5" style={{ background: 'rgba(15,23,42,0.5)' }}>
              <div className="flex items-start gap-2" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${ac.iconBg} border`}>
                  <m.icon size={13} className={ac.iconColor} />
                </div>
                <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <p className="text-[11px] font-semibold text-white">{m.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{m.line1}</p>
                  <p className="text-[9px] text-slate-500">{m.line2}</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 flex-shrink-0 whitespace-nowrap">{m.badge}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
