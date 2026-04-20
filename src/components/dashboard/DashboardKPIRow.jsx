import { useState, useEffect, useRef } from 'react';
import { Target, ShieldCheck, Network, AlertCircle, Zap, BarChart3, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// ─── Animated Counter Hook ────────────────────────────────────────────────────
function useAnimatedValue(target, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
const Sparkline = ({ data, color }) => (
  <ResponsiveContainer width={72} height={28}>
    <AreaChart data={data.map((v, i) => ({ v, i }))}>
      <defs>
        <linearGradient id={`sp-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sp-${color})`} dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Translations ─────────────────────────────────────────────────────────────
const labels = {
  riskScore:    { ar: 'نقاط المخاطر المؤسسية', en: 'Enterprise Risk Score' },
  compliance:   { ar: 'الامتثال العام', en: 'Overall Compliance' },
  thirdParty:   { ar: 'تعرضات الأطراف الثالثة', en: 'Third-Party Exposures' },
  anomalies:    { ar: 'الشذوذات النشطة', en: 'Active Anomalies' },
  incidents:    { ar: 'الحوادث النشطة', en: 'Active Incidents' },
  ale:          { ar: 'الخسارة السنوية المتوقعة', en: 'Annualized Loss Expectancy' },
  vsPrev:       { ar: 'مقارنة بالدورة السابقة', en: 'vs last period' },
  noIncidents:  { ar: 'لا توجد حوادث نشطة', en: 'No Active Incidents' },
  needsAction:  { ar: 'يتطلب تدخل فوري', en: 'Requires Immediate Action' },
};

// ─── Single KPI Card ──────────────────────────────────────────────────────────
const KPICard = ({ config, lang, onClick, delay = 0 }) => {
  const { icon: Icon, label, value, unit, subtitle, trend, trendGood, sparkline, sparkColor, accent, pulsingDot } = config;
  const animVal = useAnimatedValue(value);
  const isRtl = lang === 'ar';

  const trendIsPositive = trend > 0;
  const trendIsGoodForUser = trendGood === 'down' ? !trendIsPositive : trendIsPositive;

  const accentMap = {
    amber:   { text: 'text-amber-400',   bg: 'bg-amber-950/60 border-amber-800/50', iconColor: 'text-amber-400' },
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/50', iconColor: 'text-emerald-400' },
    red:     { text: 'text-red-400',     bg: 'bg-red-950/60 border-red-800/50', iconColor: 'text-red-400' },
    cyan:    { text: 'text-cyan-400',    bg: 'bg-cyan-950/60 border-cyan-800/50', iconColor: 'text-cyan-400' },
    violet:  { text: 'text-violet-400',  bg: 'bg-violet-950/60 border-violet-800/50', iconColor: 'text-violet-400' },
  };
  const a = accentMap[accent] || accentMap.cyan;

  return (
    <div onClick={onClick}
      className="rounded-xl border border-slate-800 p-4 transition-all duration-300 cursor-pointer hover:border-slate-600 hover:-translate-y-0.5 hover:shadow-lg group"
      style={{
        background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)',
        animation: `fadeIn 0.5s ease ${delay}ms both`,
      }}>
      <div className="flex items-start justify-between mb-1" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
          <p className="text-[10px] text-slate-500 tracking-wide">{label}</p>
          <div className={`flex items-end gap-1 mt-1.5 ${isRtl ? 'justify-end' : 'justify-start'}`}>
            {unit && <span className="text-slate-500 text-sm mb-0.5">{unit}</span>}
            <span className={`text-3xl font-black leading-none ${a.text}`}>{unit === 'M ريال' || unit === 'M SAR' ? (animVal / 1000000).toFixed(1) : animVal}</span>
          </div>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isRtl ? 'mr-3' : 'ml-3'} ${a.bg} border`}>
          <Icon size={16} className={a.iconColor} />
        </div>
      </div>

      <div className={`flex items-center gap-1.5 mt-1 ${isRtl ? 'justify-end' : 'justify-start'}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        <span className="text-[10px] text-slate-600">{labels.vsPrev[lang]}</span>
        <span className={`text-[11px] font-bold ${trendIsGoodForUser ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}{typeof value === 'number' && value > 100 ? '' : '%'}
        </span>
        {trendIsGoodForUser
          ? <ArrowDownRight size={11} className="text-emerald-400" />
          : <ArrowUpRight size={11} className="text-red-400" />
        }
        {sparkline && <div className={`${isRtl ? 'mr-auto' : 'ml-auto'}`}><Sparkline data={sparkline} color={sparkColor || '#06b6d4'} /></div>}
      </div>

      {pulsingDot && (
        <div className={`mt-2 flex items-center gap-1.5 ${isRtl ? 'justify-end' : 'justify-start'}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[10px] text-red-400">{labels.needsAction[lang]}</span>
        </div>
      )}

      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed" style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>{subtitle}</p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN: 6-Card KPI Row
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardKPIRow({ data, lang = 'ar', onNavigate }) {
  const k = data?.kpis;
  if (!k) return null;
  const isRtl = lang === 'ar';

  const cards = [
    {
      icon: Target, label: labels.riskScore[lang],
      value: k.riskScore.value, unit: '/100',
      subtitle: isRtl
        ? `من أصل ${k.riskScore.total} خطر مسجل | ${k.riskScore.catastrophic} كارثي • ${k.riskScore.high} عالي`
        : `Out of ${k.riskScore.total} registered risks | ${k.riskScore.catastrophic} catastrophic • ${k.riskScore.high} high`,
      trend: k.riskScore.trend, trendGood: 'down', accent: 'amber',
      sparkline: k.riskScore.sparkline, sparkColor: '#f59e0b',
      nav: 'register',
    },
    {
      icon: ShieldCheck, label: labels.compliance[lang],
      value: k.compliance.value, unit: '%',
      subtitle: isRtl
        ? `مؤشر صمود ${k.compliance.sumoodMaturity}/7 • ${k.compliance.frameworksCompliant} أطر مطبقة`
        : `Sumood ${k.compliance.sumoodMaturity}/7 • ${k.compliance.frameworksCompliant} frameworks compliant`,
      trend: k.compliance.trend, trendGood: 'up', accent: 'emerald',
      sparkline: k.compliance.sparkline, sparkColor: '#10b981',
      nav: 'compliance',
    },
    {
      icon: Network, label: labels.thirdParty[lang],
      value: k.thirdPartyExposures.value, unit: '',
      subtitle: isRtl
        ? `${k.thirdPartyExposures.criticalVendors} مورد حرج | ${k.thirdPartyExposures.expiringContracts30d} عقود تنتهي خلال 30 يوم`
        : `${k.thirdPartyExposures.criticalVendors} critical vendors | ${k.thirdPartyExposures.expiringContracts30d} contracts expiring in 30d`,
      trend: k.thirdPartyExposures.trend, trendGood: 'down', accent: 'amber',
      nav: 'register',
    },
    {
      icon: AlertCircle, label: labels.anomalies[lang],
      value: k.activeAnomalies.value, unit: '',
      subtitle: isRtl
        ? `${k.activeAnomalies.critical} حرجة • ${k.activeAnomalies.high} عالية | تتطلب تدخل فوري`
        : `${k.activeAnomalies.critical} critical • ${k.activeAnomalies.high} high | requires action`,
      trend: k.activeAnomalies.trend, trendGood: 'down', accent: 'red',
      pulsingDot: k.activeAnomalies.needsAction,
      nav: 'ai',
    },
    {
      icon: Zap, label: labels.incidents[lang],
      value: k.activeIncidents.value, unit: '',
      subtitle: k.activeIncidents.value === 0
        ? (isRtl ? `آخر حادث قبل ${k.activeIncidents.lastIncidentDaysAgo} يوم | MTTR: ${k.activeIncidents.mttrThisMonth}س` : `Last incident ${k.activeIncidents.lastIncidentDaysAgo}d ago | MTTR: ${k.activeIncidents.mttrThisMonth}h`)
        : (isRtl ? `${k.activeIncidents.p1} حرج • ${k.activeIncidents.p2} عالي` : `${k.activeIncidents.p1} P1 • ${k.activeIncidents.p2} P2`),
      trend: 0, trendGood: 'down',
      accent: k.activeIncidents.value === 0 ? 'emerald' : 'red',
      nav: 'situation',
    },
    {
      icon: BarChart3, label: labels.ale[lang],
      value: k.ale.value, unit: isRtl ? 'M ريال' : 'M SAR',
      subtitle: isRtl
        ? `من ${k.ale.quantifiedRisks} خطر تم قياسه كمياً | VaR 95%: ${(k.ale.var95 / 1000000).toFixed(0)}M`
        : `From ${k.ale.quantifiedRisks} quantified risks | VaR 95%: ${(k.ale.var95 / 1000000).toFixed(0)}M`,
      trend: k.ale.trend, trendGood: 'down', accent: 'violet',
      nav: 'register',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3">
      {cards.map((c, i) => (
        <KPICard key={i} config={c} lang={lang} delay={i * 60}
          onClick={() => onNavigate?.(c.nav)} />
      ))}
    </div>
  );
}
