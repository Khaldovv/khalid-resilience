import { useState, useEffect, useRef } from "react";
import { useToast } from "../components/ToastProvider";
import {
  Shield, AlertTriangle, CheckCircle2, Lock, Zap, ChevronDown,
  Globe, Network, TrendingUp, TrendingDown, FileText, Clock,
  Info, Cpu, GitBranch, Terminal, Activity, Layers, RefreshCw,
  User, Radio, BarChart2, Crosshair, ShieldAlert, SkipForward,
  XCircle, Sparkles, BrainCircuit, FlaskConical, Anchor, Ship,
  Landmark, Building2, DollarSign, Fuel, Wifi, Server, Settings,
  ArrowRight, ChevronRight, Eye, Siren, MapPin, Navigation,
  Building, Banknote, Package, Truck, AlertCircle, CheckCircle,
  HardDrive, Users, Flag, Star
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from "recharts";

// ─── CSS Injection ────────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #020c14;
      color: #cbd5e1;
      font-family: 'DM Sans', system-ui, sans-serif;
    }
    .font-display { font-family: 'Syne', sans-serif; }
    .mono        { font-family: 'JetBrains Mono', monospace; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #1e3a2f; border-radius: 4px; }

    /* ── Animations ── */
    @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes slideR   { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:translateX(0)} }
    @keyframes ping     { 75%,100%{transform:scale(2.2);opacity:0} }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes scanline { 0%{top:0%} 100%{top:100%} }
    @keyframes glowGreen{
      0%,100%{ box-shadow:0 0 0 0 rgba(0,108,53,0); border-color:rgba(0,108,53,.45); }
      50%    { box-shadow:0 0 0 5px rgba(0,108,53,.12),0 0 28px rgba(0,108,53,.22); border-color:rgba(0,108,53,.9); }
    }
    @keyframes glowRed  {
      0%,100%{ border-color:rgba(239,68,68,.4); }
      50%    { box-shadow:0 0 22px rgba(239,68,68,.18); border-color:rgba(239,68,68,.85); }
    }
    @keyframes numberTick { 0%{transform:translateY(10px);opacity:0} 100%{transform:translateY(0);opacity:1} }

    .fade-up    { animation: fadeUp .6s ease forwards; }
    .fade-d1    { animation: fadeUp .6s .08s ease both; }
    .fade-d2    { animation: fadeUp .6s .16s ease both; }
    .fade-d3    { animation: fadeUp .6s .24s ease both; }
    .fade-d4    { animation: fadeUp .6s .32s ease both; }
    .fade-d5    { animation: fadeUp .6s .40s ease both; }
    .ping       { animation: ping  1.3s cubic-bezier(0,0,.2,1) infinite; }
    .pulse-anim { animation: pulse 2.2s cubic-bezier(.4,0,.6,1) infinite; }
    .spin       { animation: spin  1.1s linear infinite; }
    .slide-r    { animation: slideR .28s ease forwards; }

    .glow-green { animation: glowGreen 2.4s ease-in-out infinite; }
    .glow-red   { animation: glowRed   2s   ease-in-out infinite; }

    .ai-shimmer {
      background: linear-gradient(90deg, transparent 0%, rgba(0,108,53,.15) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: shimmer 3s ease-in-out infinite;
    }
    .scan-overlay::after {
      content:'';
      position:absolute;
      left:0; right:0; height:2px;
      background: linear-gradient(transparent, rgba(0,180,80,.18), transparent);
      animation: scanline 4s linear infinite;
      pointer-events: none;
    }

    /* Grid background */
    .grid-bg {
      background-image:
        linear-gradient(rgba(0,108,53,.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,108,53,.025) 1px, transparent 1px);
      background-size: 52px 52px;
    }

    /* Saudi palm/sword motif border accent */
    .ksa-border-top { border-top: 2px solid; border-image: linear-gradient(90deg, transparent, #006C35, #00a854, #006C35, transparent) 1; }
    .ksa-border-bottom { border-bottom: 1px solid rgba(0,108,53,.25); }

    /* Tooltip wrapper */
    .xai-wrap { position:relative; }
    .xai-wrap:hover .xai-popup { display:block; }
    .xai-popup { display:none; position:absolute; z-index:200; }

    .number-tick { animation: numberTick .4s ease forwards; }
  `}</style>
);

// ─── Color tokens ─────────────────────────────────────────────────────────────
const KSA_GREEN  = "#006C35";
const KSA_LIGHT  = "#00a854";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const escalationData = [
  { t:"Now",   eco:38, cyber:45, upper:60, lower:28 },
  { t:"+6h",   eco:52, cyber:58, upper:74, lower:40 },
  { t:"+12h",  eco:61, cyber:67, upper:83, lower:47 },
  { t:"+18h",  eco:74, cyber:79, upper:93, lower:56 },
  { t:"+24h",  eco:81, cyber:85, upper:97, lower:62 },
  { t:"+36h",  eco:78, cyber:82, upper:95, lower:58 },
  { t:"+48h",  eco:69, cyber:71, upper:87, lower:50 },
  { t:"+60h",  eco:58, cyber:60, upper:76, lower:42 },
  { t:"+72h",  eco:46, cyber:49, upper:64, lower:33 },
];

const sectorData = [
  { t:"T-5h", financial:30, energy:22, maritime:48, telecom:18 },
  { t:"T-4h", financial:42, energy:29, maritime:61, telecom:24 },
  { t:"T-3h", financial:55, energy:38, maritime:72, telecom:31 },
  { t:"T-2h", financial:63, energy:45, maritime:79, telecom:27 },
  { t:"T-1h", financial:71, energy:52, maritime:85, telecom:35 },
  { t:"Now",  financial:68, energy:58, maritime:89, telecom:42 },
];

const xaiAlerts = [
  {
    id:1, icon:Ship, color:"red", sector:"بحري / لوجستي",
    label:"تعطل الملاحة البحرية — البحر الأحمر / هرمز",
    probability:89, delta:"+14%", deltaDir:"up",
    summary:"اضطراب حاد في حركة الناقلات عبر الممرات الاستراتيجية",
    explanation:"رصد الذكاء الاصطناعي انخفاضاً 40% في بيانات تتبع السفن المتوقعة عبر AIS، مقروناً بارتفاع حدة المشاعر الجيوسياسية في بيانات NLP من 14 مصدراً إخبارياً إقليمياً. أنماط الحمولة الجزئية تطابق سيناريو الاضطراب لعامَي 2019 و2021. تأثير الواردات غير النفطية مُقدَّر بـ 2.3 مليار ريال/أسبوع.",
    signals:["انخفاض AIS: 40% دون الخط الأساسي","حدة مشاعر NLP: 8.1/10","تعطيل 3 مسارات شحن رئيسية","تطابق 87% مع سيناريو 2021"],
    framework:"إطار NCA-SCR · SAMA-ORC-2024",
    kpiImpact:"تأثير GDP المتوقع: ‑0.35% إذا امتد أسبوعين",
  },
  {
    id:2, icon:Landmark, color:"amber", sector:"مالي / سيبراني",
    label:"هجوم فدية موجَّه على القطاع المالي",
    probability:73, delta:"+9%", deltaDir:"up",
    summary:"نشاط APT يستهدف الجهات الخاضعة لإشراف ساما",
    explanation:"رُصدت ارتفاعات غير مألوفة في حركة الشبكة عبر الحدود من عناوين IP تعود لعقد تهديد معروف. الأنماط تتطابق مع حملة APT-41 التي استهدفت 6 بنوك خليجية في Q4-2025. محاكاة Monte Carlo تُقدِّر احتمال التأثير على أنظمة الدفع الأساسية بـ 73% خلال 24 ساعة.",
    signals:["ارتفاع حركة C2: +380% عن الخط","تحديد 4 عناوين IP ضمن قائمة حظر NCA","إنذار SWIFT من نظراء إقليميين","تطابق TTPs: APT-41 / APT-32"],
    framework:"إطار NCA-ECC · ضوابط ساما السيبرانية",
    kpiImpact:"احتمال توقف خدمات الدفع: 73% خلال 24 ساعة",
  },
  {
    id:3, icon:Package, color:"blue", sector:"تجاري / اقتصادي",
    label:"تأثير التعريفات الجمركية على الصادرات غير النفطية",
    probability:58, delta:"مستقر", deltaDir:"flat",
    summary:"نماذج تنبؤية تُشير لتأثير سلبي على نمو الناتج المحلي",
    explanation:"تُظهر نماذج التعلم الآلي المدرَّبة على بيانات تجارة 40 عاماً أن التعريفات الجمركية الأمريكية والأوروبية المُعلَن عنها ستُحدث احتكاكاً في صادرات البتروكيماويات والمعادن. سيناريو الأساس يُقدِّر تراجع نمو الناتج بـ 0.2% مع إمكانية الوصول لـ 0.4% في سيناريو التصعيد. منظومة Vision 2030 لتنويع الصادرات تُخفف الأثر جزئياً.",
    signals:["تراجع حجم صادرات البتروكيماويات: ‑8%","تأخر مفاوضات FTA مع 3 شركاء","ضغط على أسعار صرف المنافسين","تنبيه من صندوق النقد الدولي"],
    framework:"رؤية 2030 · وزارة الاقتصاد والتخطيط",
    kpiImpact:"سحب متوقع من نمو GDP: 0.2%‑0.4%",
  },
];

const sopSteps = [
  {
    id:1, status:"completed",
    title:"الكشف الأولي عن التهديد وتجميع البيانات",
    category:"مرحلة الكشف",
    icon:Activity,
    completedAt:"07:42 UTC",
    completedBy:"نظام الإنذار المبكر بالذكاء الاصطناعي",
    summary:"استوعب النظام بنجاح بيانات الملاحة البحرية وتغذيات الأمن السيبراني من NCA. تجميع 847 مؤشر تهديد عبر 12 مصدراً. تنبيه مجلس NREC مُرسَل تلقائياً.",
    artifacts:["Maritime-AIS-Feed-v2.json","NCA-ThreatPulse-0742.stix","SAMA-FinAlert-01.pdf"],
  },
  {
    id:2, status:"active",
    title:"تفعيل دفاع NCA السيبراني وإعادة توجيه اللوجستيات",
    category:"الاحتواء والاستجابة",
    icon:Shield,
    aiReason:"نقاط الاتصال مع الموردين تبقى مكشوفة. تُشير نتائج التحليل البيني إلى أن كل ساعة تأخير ترفع احتمال الاختراق المالي الثانوي بمقدار 6%. إجراء فوري ضروري.",
    substeps:[
      "تفعيل مركز عمليات الأمن القومي (SOC) - المستوى الثالث",
      "إصدار تحذير NCA للقطاع المالي (درجة التهديد: عالية)",
      "تفعيل مسارات الشحن البديلة عبر ميناء جدة وميناء الملك عبدالله",
      "تنسيق مع الهيئة العامة للجمارك لتسريع التخليص",
      "تفعيل بروتوكول الاحتياطي الاستراتيجي للسلع الأساسية",
    ],
    actions:[
      { id:"a1", label:"تنفيذ بروتوكول الحماية المالية SAMA (آلي)", variant:"ksa", icon:Zap,
        description:"تفعيل فوري لـ 23 ضابطاً لبروتوكول الحماية المالية SAMA-ORC، وتطبيق حدود المعاملات الاحترازية، وتفعيل مسارات التسوية الاحتياطية عبر AFAQ و SARIE." },
      { id:"a2", label:"تنبيه وزارة الاقتصاد والتخطيط والجمارك", variant:"amber", icon:Building2,
        description:"إرسال إحاطة رسمية لوزارة الاقتصاد والتخطيط وهيئة الجمارك وهيئة الزكاة والضريبة مع ملخص تنفيذي مؤتمَت وتوصيات الذكاء الاصطناعي." },
      { id:"a3", label:"توليد حزمة الأدلة الجنائية", variant:"ghost", icon:FileText,
        description:"تجميع الأدلة المرقَّمة زمنياً للمتطلبات القانونية والتنظيمية وسلسلة حفظ الأدلة الجنائية." },
    ],
  },
  {
    id:3, status:"locked",
    title:"تفعيل تكرارية سلسلة الإمداد واستقرار السوق",
    category:"الاسترداد والمرونة",
    icon:Package,
    pendingReason:"في انتظار تأكيد اكتمال الخطوة 2 — يجب التحقق من تفعيل بروتوكولات الحماية المالية SAMA وتأمين قنوات الاتصال مع الوزارات قبل الانتقال لهذه المرحلة.",
    estimatedUnlock:"~20 دقيقة بعد تنفيذ الخطوة 2",
  },
  {
    id:4, status:"branched",
    title:"تهديد ثانوي للشبكة الكهربائية — تعديل مسار الدليل",
    category:"الطاقة والبنية التحتية الحرجة",
    icon:Fuel,
    branchReason:"تعديل مسار الدليل التشغيلي بواسطة الذكاء الاصطناعي: رُصدت أنماط هجوم إلكتروني على منظومة SCADA لشبكة الكهرباء السعودية (SEC). هذا التهديد المتزامن يُشير لعملية منسَّقة تستهدف البنية التحتية الحرجة في إطار سيناريو هجوم هجين.",
    originalPath:"الخطوة 4 كانت: مراجعة ما بعد الأزمة وتقرير الدروس المستفادة",
    newPath:"بروتوكول حماية الشبكة الكهربائية الحرجة — تنسيق NEOM/SEC/الطاقة",
    timeRemaining:"نافذة استجابة حرجة: T-4h",
    branchActions:[
      { label:"تفعيل خلية أزمة الطاقة وSEC", icon:Fuel },
      { label:"عزل أنظمة SCADA المخترقة", icon:Shield },
      { label:"تنسيق مع وزارة الطاقة وARAMCO", icon:Building2 },
    ],
  },
];

// ─── Primitives ───────────────────────────────────────────────────────────────
const Bdg = ({ children, variant="default", pulse:doPulse=false, className="" }) => {
  const V = {
    default:"bg-slate-800 text-slate-300 border-slate-600",
    critical:"bg-red-950 text-red-300 border-red-700",
    warning:"bg-amber-950 text-amber-300 border-amber-700",
    success:"bg-emerald-950 text-emerald-300 border-emerald-700",
    info:"bg-blue-950 text-blue-300 border-blue-700",
    ksa:"text-white border-green-700",
    ghost:"bg-slate-900 text-slate-400 border-slate-700",
    violet:"bg-violet-950 text-violet-300 border-violet-700",
  };
  const dotC = { critical:"bg-red-400", warning:"bg-amber-400", success:"bg-emerald-400", ksa:"bg-green-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${V[variant]} ${className}`}
      style={variant==="ksa" ? {background:`rgba(0,108,53,0.25)`} : {}}>
      {doPulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotC[variant]||"bg-slate-400"}`}/>
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotC[variant]||"bg-slate-400"}`}/>
        </span>
      )}
      {children}
    </span>
  );
};

const Btn = ({ children, variant="primary", size="sm", onClick, icon:Icon, disabled=false, loading=false }) => {
  const base="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 active:scale-95 select-none border cursor-pointer";
  const S={ xs:"px-2.5 py-1 text-[11px]", sm:"px-3.5 py-1.5 text-xs", md:"px-5 py-2.5 text-sm" };
  const V={
    ksa:`text-white border-green-600 shadow-lg`,
    danger:"bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-700/20",
    amber:"bg-amber-600 hover:bg-amber-500 text-white border-amber-500",
    ghost:"bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600",
    outline:"bg-transparent hover:bg-slate-800 text-slate-300 border-slate-600",
    violet:"bg-violet-700 hover:bg-violet-600 text-white border-violet-600",
    emerald:"bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600",
  };
  return (
    <button onClick={onClick} disabled={disabled||loading}
      className={`${base} ${S[size]} ${V[variant]} ${disabled?"opacity-40 cursor-not-allowed":""}`}
      style={variant==="ksa" ? {background:`linear-gradient(135deg,${KSA_GREEN},#008a42)`,boxShadow:`0 4px 14px rgba(0,108,53,0.35)`} : {}}>
      {loading ? <RefreshCw size={12} className="spin"/> : Icon && <Icon size={12}/>}
      {children}
    </button>
  );
};

const Card = ({ children, className="", glow=false, ksaGlow=false }) => (
  <div className={`rounded-xl border border-slate-800 ${glow?"border-slate-700":""} ${ksaGlow?"border-green-900":""} ${className}`}
    style={{ background:"rgba(5,18,30,0.82)", backdropFilter:"blur(10px)",
      ...(ksaGlow ? {boxShadow:`0 0 0 1px rgba(0,108,53,.15), 0 8px 32px rgba(0,108,53,.08)`} : {}) }}>
    {children}
  </div>
);

const Prog = ({ value, color="ksa", height="h-1.5", className="" }) => {
  const C={ ksa:``, cyan:"bg-cyan-500", emerald:"bg-emerald-500", red:"bg-red-500", amber:"bg-amber-500" };
  return (
    <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${height} ${className}`}>
      <div className={`h-full rounded-full transition-all duration-1000 ${C[color]}`}
        style={color==="ksa" ? {background:`linear-gradient(90deg,${KSA_GREEN},${KSA_LIGHT})`} : {}} width={`${value}%`}
        role="progressbar" aria-valuenow={value}
      >
        <div style={{width:`${value}%`,height:"100%"}}/>
      </div>
    </div>
  );
};

const PulsingDot = ({ color="red", size="sm" }) => {
  const C={ red:"bg-red-500", amber:"bg-amber-500", emerald:"bg-emerald-500", ksa:"bg-green-500" };
  const S={ sm:"h-2 w-2", md:"h-2.5 w-2.5" };
  return (
    <span className={`relative flex ${S[size]}`}>
      <span className={`ping absolute inline-flex h-full w-full rounded-full ${C[color]} opacity-75`}/>
      <span className={`relative inline-flex rounded-full ${S[size]} ${C[color]}`}/>
    </span>
  );
};

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 p-3 text-xs shadow-2xl"
      style={{background:"rgba(4,14,28,.98)"}}>
      <p className="text-slate-400 mono mb-2 font-semibold">{label}</p>
      {payload.filter(p=>p.value!=null&&p.name!=="upper"&&p.name!=="lower").map((p,i)=>(
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{background:p.stroke||p.fill}}/>
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-white mono">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── XAI Alert Card ───────────────────────────────────────────────────────────
const XAIAlertCard = ({ alert }) => {
  const [open,setOpen] = useState(false);
  const CM = {
    red:  { card:"border-red-800/45 hover:border-red-700/65",   bg:"rgba(69,10,10,.17)",   text:"text-red-400",   tag:"bg-red-900/50 text-red-300 border-red-800",   badge:"critical" },
    amber:{ card:"border-amber-800/45 hover:border-amber-700/65", bg:"rgba(120,53,15,.14)", text:"text-amber-400", tag:"bg-amber-900/50 text-amber-300 border-amber-800", badge:"warning" },
    blue: { card:"border-blue-800/45 hover:border-blue-700/60",  bg:"rgba(23,49,110,.14)",  text:"text-blue-400",  tag:"bg-blue-900/50 text-blue-300 border-blue-800",  badge:"info" },
  };
  const c = CM[alert.color];
  return (
    <div className="relative xai-wrap" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
      <div className={`rounded-xl border p-3.5 cursor-help transition-all duration-200 ${c.card}`}
        style={{background:c.bg}}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2.5 flex-1">
            <alert.icon size={15} className={`${c.text} mt-0.5 flex-shrink-0`}/>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span className={`text-[10px] font-semibold ${c.text}`}>{alert.sector}</span>
              </div>
              <p className="text-xs font-semibold text-white leading-snug">{alert.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{alert.summary}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <Bdg variant={c.badge}>{alert.probability}%</Bdg>
            <div className="flex items-center gap-1">
              <Info size={10} className="text-slate-600"/>
              <span className="text-[9px] text-slate-600">XAI</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex-1">
            <div className="w-full bg-slate-800 rounded-full overflow-hidden h-1.5">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{width:`${alert.probability}%`,
                  background: alert.color==="red" ? "#ef4444" : alert.color==="amber" ? "#f59e0b" : "#3b82f6"
                }}/>
            </div>
          </div>
          <span className={`text-sm font-black mono ${c.text}`}>{alert.probability}%</span>
          {alert.deltaDir!=="flat" && <span className={`text-[10px] mono font-bold ${c.text}`}>{alert.delta}</span>}
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-[9px] mono text-slate-600">{alert.framework}</span>
          <span className="text-[9px] text-slate-600 italic">مرِّر للتفسير</span>
        </div>
      </div>

      {/* XAI Popup */}
      {open && (
        <div className="xai-popup left-0 top-full mt-2 w-96 slide-r"
          style={{filter:"drop-shadow(0 24px 48px rgba(0,0,0,.75))"}}>
          <div className={`rounded-xl border p-4`}
            style={{background:"rgba(4,12,24,.98)", backdropFilter:"blur(20px)",
              borderColor: alert.color==="red" ? "#7f1d1d" : alert.color==="amber" ? "#92400e" : "#1e3a8a"}}>
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit size={13} style={{color:KSA_LIGHT}}/>
              <span className="text-xs font-bold tracking-wide" style={{color:KSA_LIGHT}}>محرك XAI · شفافية الذكاء الاصطناعي</span>
              <span className={`ml-auto text-[10px] mono ${c.text}`}>{alert.framework}</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">{alert.label}</p>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">{alert.explanation}</p>
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">الإشارات المساهِمة في التنبؤ</p>
              {alert.signals.map((s,i)=>(
                <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] ${c.tag}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${alert.color==="red"?"bg-red-400":alert.color==="amber"?"bg-amber-400":"bg-blue-400"}`}/>
                  {s}
                </div>
              ))}
            </div>
            <div className="rounded-lg p-2.5 mb-3 text-[11px]"
              style={{background:"rgba(0,108,53,.1)", border:"1px solid rgba(0,108,53,.25)"}}>
              <span style={{color:KSA_LIGHT}} className="font-semibold">📊 التأثير الاقتصادي المتوقع: </span>
              <span className="text-slate-300">{alert.kpiImpact}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <FlaskConical size={10} className="text-slate-500 flex-shrink-0"/>
              <span className="text-[10px] text-slate-500">مصدر التنبؤ: نماذج ML اقتصادية + استخبارات تهديدات NCA + بيانات AIS/SWIFT تاريخية</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── LEFT COLUMN ─────────────────────────────────────────────────────────────
const LeftPanel = () => (
  <div className="space-y-4 flex flex-col h-full">

    {/* Escalation Chart */}
    <Card className="p-4 fade-d1 scan-overlay relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <Bdg variant="critical" pulse>نموذج مباشر</Bdg>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-0.5">
            <span className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase">مسار التصعيد التنبؤي</span>
            <TrendingUp size={13} className="text-red-400"/>
          </div>
          <p className="text-sm font-display font-bold text-white">التأثير الاقتصادي والسيبراني · 72 ساعة</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mb-3 text-[10px] text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5">فترة الثقة<span className="w-3 h-2 inline-block rounded opacity-30 mr-1 bg-red-500"/></span>
        <span className="flex items-center gap-1.5">تأثير اقتصادي<span className="w-3 h-0.5 inline-block rounded mr-1" style={{background:KSA_LIGHT}}/></span>
        <span className="flex items-center gap-1.5">تأثير سيبراني<span className="w-3 h-0.5 inline-block rounded mr-1 bg-red-500"/></span>
        <span className="flex items-center gap-1.5">حد الإجراء الحرج<span className="w-3 h-0.5 inline-block rounded mr-1 bg-amber-500"/></span>
      </div>

      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={escalationData} margin={{top:4,right:8,bottom:0,left:-22}}>
          <defs>
            <linearGradient id="ciUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.22}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.03}/>
            </linearGradient>
            <linearGradient id="ciLo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#020c14" stopOpacity={1}/>
              <stop offset="100%" stopColor="#020c14" stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="ecoG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={KSA_GREEN} stopOpacity={0.18}/>
              <stop offset="95%" stopColor={KSA_GREEN} stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#0f2d1e" vertical={false}/>
          <XAxis dataKey="t" tick={{fill:"#64748b",fontSize:9,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:"#64748b",fontSize:9,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false} domain={[0,100]}/>
          <Tooltip content={<ChartTip/>}/>
          <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5}/>
          <Area type="monotone" dataKey="upper" name="upper" stroke="none" fill="url(#ciUp)"/>
          <Area type="monotone" dataKey="lower" name="lower" stroke="none" fill="url(#ciLo)"/>
          <Area type="monotone" dataKey="eco"   name="التأثير الاقتصادي"  stroke={KSA_LIGHT} strokeWidth={2.5} fill="url(#ecoG)" dot={{fill:KSA_LIGHT,r:3,strokeWidth:0}} activeDot={{r:5}}/>
          <Area type="monotone" dataKey="cyber" name="التأثير السيبراني"   stroke="#ef4444"   strokeWidth={2}   fill="none" dot={{fill:"#ef4444",r:3,strokeWidth:0}} activeDot={{r:5}}/>
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-3 gap-3 text-center">
        {[
          {label:"ذروة الخطر (+24س)", value:"85",  unit:"/100", color:"text-red-400"},
          {label:"مستوى الثقة",       value:"91",  unit:"%",    color:"text-amber-400"},
          {label:"المصادر المُحلَّلة", value:"847", unit:"",     color:""},
        ].map((s,i)=>(
          <div key={i}>
            <p className={`text-lg font-black mono ${s.color}`} style={!s.color ? {color:KSA_LIGHT} : {}}>
              {s.value}<span className="text-xs text-slate-500">{s.unit}</span>
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </Card>

    {/* Sector Activity */}
    <Card className="p-4 fade-d2">
      <div className="flex items-center justify-between mb-3">
        <Bdg variant="ghost">مُرصَد - 5 ساعات</Bdg>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase mb-0.5">نشاط القطاعات الحرجة</p>
          <p className="text-sm font-display font-bold text-white">مستوى التهديد عبر القطاعات</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={sectorData} margin={{top:4,right:8,bottom:0,left:-22}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0f2d1e" vertical={false}/>
          <XAxis dataKey="t" tick={{fill:"#64748b",fontSize:9,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:"#64748b",fontSize:9,fontFamily:"JetBrains Mono"}} axisLine={false} tickLine={false}/>
          <Tooltip content={<ChartTip/>}/>
          <Line type="monotone" dataKey="maritime"  name="بحري"    stroke="#ef4444" strokeWidth={2.5} dot={false}/>
          <Line type="monotone" dataKey="financial" name="مالي"    stroke="#f59e0b" strokeWidth={2}   dot={false}/>
          <Line type="monotone" dataKey="energy"    name="طاقة"    stroke={KSA_LIGHT} strokeWidth={2} dot={false}/>
          <Line type="monotone" dataKey="telecom"   name="اتصالات" stroke="#3b82f6" strokeWidth={1.5} dot={false}/>
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-end gap-4 mt-2 flex-wrap text-[10px] text-slate-500">
        {[
          {label:"بحري",    color:"bg-red-500"},
          {label:"مالي",    color:"bg-amber-500"},
          {label:"طاقة",    color:""},
          {label:"اتصالات", color:"bg-blue-500"},
        ].map((s,i)=>(
          <span key={i} className="flex items-center gap-1.5">
            {s.label}
            <span className={`w-2.5 h-0.5 inline-block rounded mr-0.5 ${s.color}`}
              style={!s.color ? {background:KSA_LIGHT} : {}}/>
          </span>
        ))}
      </div>
    </Card>

    {/* XAI Alert Cards */}
    <div className="flex-1 space-y-3 fade-d3">
      <div className="flex items-center justify-end gap-2">
        <p className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase">تنبيهات الإنذار المبكر · مرِّر للتفسير</p>
        <BrainCircuit size={13} style={{color:KSA_LIGHT}}/>
      </div>
      {xaiAlerts.map(a=><XAIAlertCard key={a.id} alert={a}/>)}
    </div>
  </div>
);

// ─── SOP Step Components ──────────────────────────────────────────────────────
const CompletedStep = ({step}) => (
  <div className="rounded-xl border border-emerald-900/50 p-4" style={{background:"rgba(6,46,35,.2)"}}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 size={16} className="text-emerald-400"/>
      </div>
      <div className="flex-1 text-right min-w-0">
        <div className="flex items-center gap-2 flex-wrap justify-end mb-1">
          <span className="text-[10px] text-slate-500 mono">{step.completedAt}</span>
          <Bdg variant="success">مكتملة</Bdg>
          <p className="text-sm font-semibold text-emerald-300">{step.title}</p>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">{step.summary}</p>
        {step.artifacts?.length>0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap justify-end">
            {step.artifacts.map((a,i)=>(
              <span key={i} className="text-[10px] mono bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                <FileText size={8}/>{a}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-1 text-[9px] text-slate-500 flex-shrink-0">
        <Cpu size={12} className="text-slate-600"/>
        <span className="text-center leading-tight">{step.completedBy}</span>
      </div>
    </div>
  </div>
);

const ActiveStep = ({step}) => {
  const [expanded,setExpanded] = useState(true);
  const [executing,setExecuting] = useState(null);
  const [executed,setExecuted] = useState([]);
  const handleExec = id => {
    setExecuting(id);
    setTimeout(()=>{ setExecuting(null); setExecuted(p=>[...p,id]); },2400);
  };
  return (
    <div className="rounded-xl border glow-green overflow-hidden"
      style={{background:"rgba(0,40,20,.28)", borderColor:"rgba(0,108,53,.5)"}}>
      {/* AI Banner */}
      <div className="px-4 py-2.5 border-b flex items-center gap-2 ai-shimmer"
        style={{borderColor:"rgba(0,108,53,.3)"}}>
        <div className="mr-auto flex items-center gap-1.5">
          <PulsingDot color="ksa"/>
          <span className="text-[10px] mono" style={{color:KSA_LIGHT}}>أولوية الذكاء الاصطناعي: 97/100</span>
        </div>
        <span className="text-[11px] font-bold tracking-wide" style={{color:"#5dde9a"}}>✨ الإجراء الأمثل التالي — توصية الذكاء الاصطناعي</span>
        <Sparkles size={12} style={{color:KSA_LIGHT}} className="flex-shrink-0"/>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <button onClick={()=>setExpanded(!expanded)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 flex-shrink-0 mt-0.5">
            <ChevronDown size={16} className={`transition-transform duration-200 ${expanded?"rotate-180":""}`}/>
          </button>
          <div className="flex-1 text-right">
            <div className="flex items-center gap-2 flex-wrap mb-1 justify-end">
              <Bdg variant="ghost">{step.category}</Bdg>
              <Bdg variant="ksa" pulse>نشطة</Bdg>
              <p className="text-base font-display font-bold text-white">{step.title}</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{step.aiReason}</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:"rgba(0,108,53,.18)", border:`1px solid rgba(0,108,53,.5)`}}>
            <step.icon size={16} style={{color:KSA_LIGHT}}/>
          </div>
        </div>

        {expanded && (
          <div className="space-y-4">
            {/* Substeps */}
            <div className="rounded-lg border border-slate-800 p-3" style={{background:"rgba(5,15,25,.6)"}}>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-2.5 text-right">قائمة مراجعة التنفيذ</p>
              <div className="space-y-2">
                {step.substeps.map((sub,i)=>(
                  <div key={i} className="flex items-start gap-2.5 flex-row-reverse">
                    <div className="w-4 h-4 rounded border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{background:"rgba(0,108,53,.1)", borderColor:"rgba(0,108,53,.3)"}}>
                      <span className="text-[8px] mono" style={{color:KSA_LIGHT}}>{i+1}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed text-right">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase text-right">خيارات التنفيذ</p>
              {step.actions.map(action=>{
                const isDone = executed.includes(action.id);
                const isLoad = executing===action.id;
                return (
                  <div key={action.id} className={`rounded-lg border p-3 transition-all duration-300 ${isDone?"border-emerald-800/50":"border-slate-700/60 hover:border-slate-600"}`}
                    style={{background: isDone ? "rgba(6,46,35,.25)" : "rgba(5,15,25,.6)"}}>
                    <div className="flex items-start gap-3">
                      {isDone ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <CheckCircle2 size={14} className="text-emerald-400"/>
                          <span className="text-[11px] text-emerald-400 font-semibold whitespace-nowrap">مُنفَّذ</span>
                        </div>
                      ) : (
                        <Btn variant={action.variant} size="sm" icon={isLoad?null:action.icon}
                          loading={isLoad} onClick={()=>handleExec(action.id)}
                          disabled={!!executing&&!isLoad}>
                          {action.label}
                        </Btn>
                      )}
                      <p className="text-[11px] text-slate-300 leading-relaxed text-right flex-1">{action.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LockedStep = ({step}) => (
  <div className="rounded-xl border border-slate-800/60 p-4 opacity-50" style={{background:"rgba(5,15,25,.4)"}}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0">
        <Lock size={14} className="text-slate-500"/>
      </div>
      <div className="flex-1 text-right">
        <div className="flex items-center gap-2 flex-wrap justify-end mb-1">
          <Bdg variant="ghost">{step.category}</Bdg>
          <Bdg variant="default">مقفلة</Bdg>
          <p className="text-sm font-semibold text-slate-500">{step.title}</p>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">{step.pendingReason}</p>
        <div className="flex items-center gap-1.5 mt-1.5 justify-end">
          <span className="text-[10px] text-slate-600">{step.estimatedUnlock}</span>
          <Clock size={10} className="text-slate-600"/>
        </div>
      </div>
    </div>
  </div>
);

const BranchedStep = ({step}) => (
  <div className="rounded-xl p-4 fade-up"
    style={{background:"linear-gradient(135deg,rgba(139,92,246,.1),rgba(59,130,246,.07))", border:"1px solid rgba(139,92,246,.28)"}}>
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-1 text-right">
        <div className="flex items-center gap-2 flex-wrap justify-end mb-0.5">
          <Bdg variant="violet">تعديل ذكاء اصطناعي</Bdg>
          <p className="text-sm font-display font-bold text-violet-300">{step.title}</p>
        </div>
        <Bdg variant="ghost">{step.category}</Bdg>
      </div>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{background:"rgba(139,92,246,.2)", border:"1px solid rgba(139,92,246,.5)"}}>
        <GitBranch size={15} className="text-violet-400"/>
      </div>
    </div>
    <div className="rounded-lg border border-violet-800/40 p-3 mb-3 text-xs text-right"
      style={{background:"rgba(139,92,246,.08)"}}>
      <div className="flex items-start gap-2 flex-row-reverse">
        <Sparkles size={12} className="text-violet-400 mt-0.5 flex-shrink-0"/>
        <div>
          <p className="font-semibold text-violet-300 mb-1">تعديل مسار الدليل التشغيلي — ذكاء اصطناعي</p>
          <p className="text-slate-300 leading-relaxed">{step.branchReason}</p>
        </div>
      </div>
    </div>
    <div className="space-y-2 text-xs mb-3 text-right">
      <div className="flex items-center gap-2 flex-row-reverse justify-end text-slate-500">
        <XCircle size={11} className="text-slate-600"/>
        <span className="line-through text-slate-600">{step.originalPath}</span>
      </div>
      <div className="flex items-center gap-2 flex-row-reverse justify-end flex-wrap">
        <CheckCircle size={11} className="text-violet-400"/>
        <span className="text-violet-300 font-semibold">{step.newPath}</span>
        <Bdg variant="critical" pulse>{step.timeRemaining}</Bdg>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 pt-2 border-t border-violet-800/30 justify-end">
      {step.branchActions.map((a,i)=>(
        <Btn key={i} variant={i===0?"ksa":"ghost"} size="xs" icon={a.icon}>{a.label}</Btn>
      ))}
    </div>
  </div>
);

// ─── RIGHT COLUMN ─────────────────────────────────────────────────────────────
const RightPanel = () => {
  const toast = useToast();
  return (
  <div className="h-full flex flex-col space-y-4">
    {/* Playbook Header */}
    <Card className="p-4 fade-d1 flex-shrink-0" ksaGlow>
      <div className="flex items-start justify-between gap-4">
        <div className="text-left flex-shrink-0">
          <p className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">التقدم</p>
          <p className="text-xl font-black mono" style={{color:KSA_LIGHT}}>1/4</p>
          <p className="text-[9px] text-slate-600">خطوات مكتملة</p>
        </div>
        <div className="flex items-center gap-3 flex-1 text-right">
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase mb-0.5">الدليل التشغيلي الوطني</p>
            <p className="text-base font-display font-bold text-white leading-snug">
              دليل الاستجابة الآلية: التهديدات الاقتصادية والبنية التحتية الحرجة
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-end">
              <span className="text-[10px] text-slate-600 mono">تحديث: 2026-03-15</span>
              <Bdg variant="ghost">فريق NREC - أوميغا</Bdg>
              <Bdg variant="ksa">v4.1</Bdg>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{background:`linear-gradient(135deg,rgba(0,108,53,.3),rgba(0,60,30,.2))`,
              border:`1px solid rgba(0,108,53,.5)`, boxShadow:`0 0 20px rgba(0,108,53,.15)`}}>
            <Layers size={18} style={{color:KSA_LIGHT}}/>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] mono" style={{color:KSA_LIGHT}}>25%</span>
          <span className="text-[10px] text-slate-500">تقدم تنفيذ الدليل التشغيلي</span>
        </div>
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="absolute h-full rounded-full transition-all duration-1000"
            style={{width:"25%", background:`linear-gradient(90deg,${KSA_GREEN},${KSA_LIGHT})`}}/>
          <div className="absolute h-full w-full ai-shimmer rounded-full"/>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-4 gap-3 text-center">
        {[
          {label:"الخطوات الكلية", value:"4"},
          {label:"مُؤتمَتة",       value:"3"},
          {label:"تفرعات AI",      value:"1"},
          {label:"الحل المتوقع",   value:"~6س"},
        ].map((s,i)=>(
          <div key={i}>
            <p className="text-base font-black mono" style={{color: i===0?"#fff":i===1?KSA_LIGHT:i===2?"#a78bfa":"#f59e0b"}}>{s.value}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </Card>

    {/* Steps */}
    <div className="flex-1 overflow-y-auto space-y-3 fade-d2 pl-0.5"
      style={{scrollbarWidth:"thin",scrollbarColor:`${KSA_GREEN} transparent`}}>
      {sopSteps.map((step,i)=>{
        const SL = {completed:"✓ مكتملة", active:"⚡ نشطة", locked:"⊘ مقفلة", branched:"⇌ متفرعة"}[step.status];
        const SC = {completed:"text-emerald-600", active:"", locked:"text-slate-700", branched:"text-violet-600"}[step.status];
        const NC = {
          completed:"bg-emerald-900 text-emerald-400 border-emerald-700",
          active:"border text-white",
          locked:"bg-slate-900 text-slate-600 border-slate-700",
          branched:"bg-violet-900 text-violet-300 border-violet-700",
        }[step.status];
        return (
          <div key={step.id}>
            <div className="flex items-center gap-2 mb-2 flex-row-reverse">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mono flex-shrink-0 border ${NC}`}
                style={step.status==="active" ? {background:`rgba(0,108,53,.25)`, borderColor:`rgba(0,108,53,.7)`, color:KSA_LIGHT} : {}}>
                {step.id}
              </div>
              <div className="h-px flex-1 bg-slate-800"/>
              <span className={`text-[10px] mono uppercase font-semibold tracking-wider ${SC}`}
                style={step.status==="active" ? {color:KSA_LIGHT} : {}}>{SL}</span>
            </div>
            {step.status==="completed" && <CompletedStep step={step}/>}
            {step.status==="active"    && <ActiveStep    step={step}/>}
            {step.status==="locked"    && <LockedStep    step={step}/>}
            {step.status==="branched"  && <BranchedStep  step={step}/>}
            {i<sopSteps.length-1 && (
              <div className="flex justify-end pr-2.5 mt-1">
                <div className="w-px h-4" style={{background:"linear-gradient(180deg,#0f2d1e,#1e4d35)"}}/>
              </div>
            )}
          </div>
        );
      })}

      {/* Footer */}
      <div className="rounded-xl border border-slate-800 p-4 mt-2" style={{background:"rgba(5,15,25,.55)"}}>
        <div className="flex items-center justify-between mb-3">
          <Bdg variant="ghost">فريق NREC - أوميغا · مناوب</Bdg>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-slate-400">ضوابط الدليل التشغيلي</p>
            <Settings size={13} className="text-slate-500"/>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Btn variant="ghost" size="xs" icon={SkipForward} onClick={() => toast.warning('التخطي يتطلب موافقة قائد الحادث')}>تخطي للخطوة التالية</Btn>
          <Btn variant="ghost" size="xs" icon={GitBranch} onClick={() => toast.info('سجل التفرعات: تفرع واحد بواسطة AI')}>سجل التفرعات</Btn>
          <Btn variant="ghost" size="xs" icon={FileText} onClick={() => toast.success('جارٍ تجميع حزمة الأدلة…')}>تصدير حزمة الأدلة</Btn>
          <Btn variant="ghost" size="xs" icon={Terminal} onClick={() => toast.warning('وحدة CLI مخصصة لمستخدمي المستوى الخامس')}>وحدة CLI</Btn>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 flex-row-reverse">
          <Radio size={11} style={{color:KSA_LIGHT}} className="pulse-anim flex-shrink-0"/>
          <span className="text-[10px] text-slate-500 text-right">محرك الدليل الذكي يُقيِّم الإجراء الأمثل التالي باستمرار استناداً إلى التغذية الراجعة المباشرة من مصادر NCA وSAMA والموانئ.</span>
        </div>
      </div>
    </div>
  </div>
);
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function NRECDashboard() {
  const [elapsed, setElapsed] = useState(6218);
  const [alertsCount] = useState(7);
  const [aiWarnings] = useState(3);

  useEffect(()=>{
    const t = setInterval(()=>setElapsed(e=>e+1),1000);
    return ()=>clearInterval(t);
  },[]);

  const fmt = s => [
    Math.floor(s/3600),
    Math.floor((s%3600)/60),
    s%60
  ].map(n=>String(n).padStart(2,"0")).join(":");

  return (
    <>
      <Styles/>
      <div className="min-h-screen flex flex-col grid-bg bg-transparent" style={{ direction:"rtl" }}>

        {/* Atmospheric glow */}
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          background:`radial-gradient(ellipse 70% 35% at 50% 0%, rgba(0,108,53,.07) 0%, transparent 65%),
                      radial-gradient(ellipse 40% 30% at 90% 60%, rgba(239,68,68,.04) 0%, transparent 60%)`
        }}/>

        {/* ══ HEADER ══ */}
        <header className="relative z-20 border-b border-slate-800/80 flex-shrink-0 ksa-border-top"
          style={{background:"rgba(2,10,18,.97)", backdropFilter:"blur(14px)"}}>

          {/* Threat Strip */}
          <div className="px-4 py-2 ksa-border-bottom flex items-center gap-3"
            style={{background:`linear-gradient(270deg, rgba(0,60,25,.55) 0%, rgba(0,30,15,.2) 60%, transparent 100%)`}}>
            <div className="mr-auto flex items-center gap-4 text-[10px] text-slate-500 mono flex-wrap">
              <span className="flex items-center gap-1.5"><Wifi size={9} className="text-emerald-500"/>SIEM: متصل</span>
              <span className="flex items-center gap-1.5"><Activity size={9} style={{color:KSA_LIGHT}}/>NCA EDR: مباشر</span>
              <span className="flex items-center gap-1.5"><Globe size={9} className="text-blue-400"/>TI Feed: نشط</span>
              <span className="flex items-center gap-1.5"><Anchor size={9} className="text-cyan-400"/>AIS Maritime: متصل</span>
              <span className="flex items-center gap-1.5"><Banknote size={9} className="text-amber-400"/>SWIFT Feed: نشط</span>
            </div>
            <span className="text-[11px] text-red-400/85 text-right">
              محرك SOAR الوطني مُفعَّل · دليل AI قيد التنفيذ · غرفة العمليات: #INC-042 نشطة
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] font-bold text-red-300 tracking-wide uppercase">استجابة حادث وطني نشط</span>
              <PulsingDot color="red" size="md"/>
            </div>
          </div>

          {/* Main Row */}
          <div className="px-5 py-3 flex flex-col lg:flex-row items-center gap-4">

            {/* Metrics cluster */}
            <div className="flex items-center gap-3 flex-shrink-0">

              {/* DEFCON-style badge */}
              <div className="text-center px-3 py-2 rounded-xl border border-red-800/60"
                style={{background:"rgba(100,20,20,.28)"}}>
                <p className="text-[9px] text-slate-500 tracking-wider uppercase mb-0.5">مستوى التهديد</p>
                <p className="text-2xl font-black mono text-red-300">2</p>
                <p className="text-[9px] text-red-600">DEFCON · حرج</p>
              </div>

              {/* AI Warnings */}
              <div className="text-center px-3 py-2 rounded-xl border"
                style={{background:"rgba(0,40,20,.3)", borderColor:"rgba(0,108,53,.4)"}}>
                <p className="text-[9px] text-slate-500 tracking-wider uppercase mb-0.5">تنبيهات AI</p>
                <p className="text-2xl font-black mono" style={{color:KSA_LIGHT}}>{aiWarnings}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <PulsingDot color="ksa"/>
                  <span className="text-[9px]" style={{color:KSA_GREEN}}>نشطة</span>
                </div>
              </div>

              {/* Elapsed */}
              <div className="text-center px-3 py-2 rounded-xl border border-slate-700"
                style={{background:"rgba(5,18,30,.85)"}}>
                <p className="text-[9px] text-slate-500 tracking-wider uppercase mb-0.5">الوقت المنقضي</p>
                <p className="text-xl font-black mono text-red-400">{fmt(elapsed)}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="text-[9px] text-red-600">العداد يعمل</span>
                  <PulsingDot color="red"/>
                </div>
              </div>

              {/* SAMA Notif */}
              <div className="text-center px-3 py-2 rounded-xl border border-amber-800/50"
                style={{background:"rgba(100,50,5,.18)"}}>
                <p className="text-[9px] text-amber-600 tracking-wider uppercase mb-0.5">نافذة ساما</p>
                <p className="text-xl font-black mono text-amber-400">T‑4h</p>
                <p className="text-[9px] text-amber-700">إشعار تنظيمي</p>
              </div>
            </div>

            {/* Branding & Incident */}
            <div className="flex items-center gap-3 flex-1 min-w-0 text-right">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap justify-end mb-0.5">
                  <Bdg variant="warning">مرحلة الاحتواء</Bdg>
                  <Bdg variant="critical" pulse>P1 · SEV-1</Bdg>
                  <span className="text-[11px] mono font-bold text-red-400 tracking-widest">INC-2026-042</span>
                </div>
                <h1 className="text-lg font-display font-black text-white truncate leading-tight">
                  اضطراب سلسلة الإمداد البحرية وحملة سيبرانية منسَّقة
                </h1>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  القطاعات: بحري · مالي · طاقة · اتصالات · المحلل: د. فيصل العنزي - NREC
                </p>
              </div>

              {/* KSA emblem / logo block */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:`linear-gradient(145deg,rgba(0,108,53,.35),rgba(0,50,25,.4))`,
                    border:`2px solid rgba(0,168,84,.35)`,
                    boxShadow:`0 0 24px rgba(0,108,53,.25)`
                  }}>
                  <ShieldAlert size={22} style={{color:KSA_LIGHT}}/>
                </div>
                <p className="text-[8px] font-bold tracking-widest" style={{color:KSA_GREEN}}>NREC · KSA</p>
              </div>

              {/* Title block */}
              <div className="text-right hidden xl:block flex-shrink-0">
                <p className="text-[11px] font-bold tracking-wide" style={{color:KSA_LIGHT}}>مركز المرونة الوطنية</p>
                <p className="text-[10px] text-slate-500">نظام الإنذار المبكر بالذكاء الاصطناعي</p>
                <p className="text-[9px] mono text-slate-600 mt-0.5">KSA-NREC · v4.1.2 · CLASSIFIED</p>
              </div>
            </div>
          </div>
        </header>

        {/* ══ MAIN ══ */}
        <main className="relative z-10 flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-9 gap-4" style={{minHeight:"calc(100vh - 152px)"}}>

            {/* Left: Predictive Analytics (45% ≈ 4/9) */}
            <div className="lg:col-span-4 overflow-y-auto"
              style={{maxHeight:"calc(100vh - 168px)", scrollbarWidth:"thin", scrollbarColor:`${KSA_GREEN} transparent`}}>
              <LeftPanel/>
            </div>

            {/* Divider */}
            <div className="hidden lg:flex flex-col items-center py-3">
              <div className="w-px flex-1"
                style={{background:`linear-gradient(180deg,transparent,rgba(0,108,53,.35),rgba(0,108,53,.2),transparent)`}}/>
            </div>

            {/* Right: SOP Playbook (55% ≈ 4/9 + col) */}
            <div className="lg:col-span-4 overflow-y-auto"
              style={{maxHeight:"calc(100vh - 168px)", scrollbarWidth:"thin", scrollbarColor:`${KSA_GREEN} transparent`}}>
              <RightPanel/>
            </div>
          </div>
        </main>

        {/* ══ STATUS BAR ══ */}
        <footer className="relative z-20 border-t border-slate-800/50 px-5 py-1.5 flex items-center justify-between ksa-border-top"
          style={{background:"rgba(2,8,15,.92)"}}>
          <div className="flex items-center gap-3 text-[10px] mono text-slate-600">
            <span>التصنيف: <span className="text-red-700">سري للغاية // TLP:RED</span></span>
            <span className="text-slate-800">·</span>
            <span>NREC AI Platform · SOP Engine v4.1.2</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] mono text-slate-600">
            <span>محرك XAI: <span className="text-slate-500">Shapley SHAP v2.3</span></span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full inline-block pulse-anim" style={{background:KSA_GREEN}}/>
              نموذج ML وطني: v5.1 · استدلال نشط
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/>
              SOAR الوطني: يعمل
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
