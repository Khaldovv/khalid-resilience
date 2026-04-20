import { useState, useEffect, useRef } from "react";
import { useToast } from "../components/ToastProvider";
import {
  AlertTriangle, CheckCircle2, Lock, Zap, ChevronDown,
  Shield, Network, Database, Key, Search, FileText, Clock, TrendingUp,
  Info, Cpu, GitBranch, Terminal, Eye, Activity, Layers, RefreshCw,
  User, Radio, BarChart2, Crosshair, ShieldAlert, Play, SkipForward,
  XCircle, Sparkles, BrainCircuit, FlaskConical, Fingerprint, Globe,
  Server, Wifi, HardDrive, Settings, CheckCircle
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

// ─── Styles & Arabic Font ─────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { direction: rtl; }
    body { background: #020817; color: #cbd5e1; font-family: 'IBM Plex Sans Arabic', 'Segoe UI', system-ui, sans-serif; }
    .mono { font-family: 'JetBrains Mono', 'Courier New', monospace !important; direction: ltr; unicode-bidi: isolate; display: inline-block; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes glowPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); border-color: rgba(6,182,212,0.35); }
      50% { box-shadow: 0 0 0 5px rgba(6,182,212,0.1), 0 0 28px rgba(6,182,212,0.18); border-color: rgba(6,182,212,0.85); }
    }
    @keyframes ping { 75%,100% { transform:scale(2.2); opacity:0; } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    @keyframes slideInR { from { opacity:0; transform:translateX(14px); } to { opacity:1; transform:translateX(0); } }

    .fade-up    { animation: fadeUp .55s ease forwards; }
    .fade-up-d1 { animation: fadeUp .55s .1s ease both; }
    .fade-up-d2 { animation: fadeUp .55s .2s ease both; }
    .fade-up-d3 { animation: fadeUp .55s .3s ease both; }
    .fade-up-d4 { animation: fadeUp .55s .4s ease both; }
    .glow-active { animation: glowPulse 2.2s ease-in-out infinite; }
    .ping   { animation: ping  1.2s cubic-bezier(0,0,0.2,1) infinite; }
    .pulse  { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
    .spin   { animation: spin  1s linear infinite; }
    .slide-in { animation: slideInR .3s ease forwards; }

    .ai-shimmer {
      background: linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.14) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: shimmer 2.8s ease-in-out infinite;
    }
    .branch-card {
      background: linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.07));
      border: 1px solid rgba(139,92,246,0.28);
    }
    .xai-popup { display:none; position:absolute; z-index:200; }
    .xai-wrap:hover .xai-popup { display:block; }
  `}</style>
);

// ─── Mock Data (Arabic labels) ────────────────────────────────────────────────
const escalationData = [
  { t: "الآن",   expected: 42, upper: 56, lower: 31, actual: 42 },
  { t: "+6س",   expected: 58, upper: 75, lower: 43, actual: 58 },
  { t: "+12س",  expected: 67, upper: 87, lower: 49 },
  { t: "+18س",  expected: 73, upper: 92, lower: 54 },
  { t: "+24س",  expected: 79, upper: 96, lower: 58 },
  { t: "+36س",  expected: 82, upper: 97, lower: 62 },
  { t: "+48س",  expected: 76, upper: 93, lower: 55 },
  { t: "+60س",  expected: 65, upper: 83, lower: 47 },
  { t: "+72س",  expected: 51, upper: 69, lower: 36 },
];

const vectorData = [
  { t: "ت+0",   exfil: 12, lateral: 8,  escalation: 15 },
  { t: "ت+1س",  exfil: 28, lateral: 19, escalation: 22 },
  { t: "ت+2س",  exfil: 47, lateral: 38, escalation: 35 },
  { t: "ت+3س",  exfil: 61, lateral: 52, escalation: 51 },
  { t: "ت+4س",  exfil: 55, lateral: 48, escalation: 63 },
  { t: "ت+5س",  exfil: 49, lateral: 41, escalation: 58 },
];

const xaiInsights = [
  {
    id: 1, icon: AlertTriangle, color: "red",
    label: "تسريب بيانات ثانوي",
    probability: 85, delta: "+12%", deltaDir: "up",
    summary: "احتمالية عالية لتسريب مُدرَّج عبر نفق DNS",
    explanation: "حجم استعلامات DNS الصادرة شاذ (+340% من الخط الأساسي) من الشبكة الفرعية 10.14.8.0/24 يتطابق مع أساليب APT-29 (حملة CloudHopper). تحليل إنتروبيا حمولات DNS يكشف عن بيانات مُرمَّزة بـ Base64. مُتقاطَع مع 3 نشرات تهديد ISAC خلال 14 يوماً الأخيرة.",
    signals: ["درجة إنتروبيا DNS: 4.8/8 (العتبة: 3.5)", "فترة Beacon: 47 ثانية ±3", "تداخل C2: نطاقان معروفان لـ APT-29"],
    framework: "MITRE ATT&CK T1048.003",
  },
  {
    id: 2, icon: Network, color: "amber",
    label: "حركة جانبية نحو مجموعة ERP",
    probability: 63, delta: "+8%", deltaDir: "up",
    summary: "اختراق بالاعتمادات نحو بيئة SAP S/4HANA",
    explanation: "رُصدت ناقلات هجوم SMB Relay على القطاع الداخلي. استعلمت 4 حسابات مميزة عن أسماء SPN في Active Directory (نمط Kerberoasting). بيانات الحوادث التاريخية INC-2024-044 و INC-2025-012 أظهرت وصول المهاجم إلى ERP خلال 18-24 ساعة من الاختراق الأولي.",
    signals: ["استعلامات Kerberoasting SPN: 127 في 6 دقائق", "محاولة NTLM Relay: 3 مضيفات", "إمكانية الوصول لشبكة ERP: مُؤكَّدة"],
    framework: "MITRE ATT&CK T1550.002",
  },
  {
    id: 3, icon: FileText, color: "blue",
    label: "إشعار تنظيمي — تعرض بيانات شخصية",
    probability: 71, delta: "مستقر", deltaDir: "flat",
    summary: "تعرض PII يُفعِّل إشعار GDPR المادة 33 خلال 72 ساعة",
    explanation: "مسح NLP لمشاركات الملفات في الشبكة المخترقة (3,847 وثيقة) رصد 12,400+ سجل يحتوي على بيانات شخصية لمقيمين في الاتحاد الأوروبي تشمل IBAN ورقم الهوية الوطنية وبيانات صحية. إذا تأكد التسريب، يصبح الإشعار للجهة التنظيمية إلزامياً قانوناً خلال 72 ساعة.",
    signals: ["سجلات PII المُحددة: 12,447", "حساسية البيانات: الفئة 3 (صحة + مالية)", "ساعة الرقابة التنظيمية: ت-68 ساعة متبقية"],
    framework: "GDPR المادة 33 · DPDP § 8(1)",
  },
];

const sopSteps = [
  {
    id: 1, status: "completed",
    title: "الفرز الأولي وعزل الشبكة",
    category: "الكشف والاحتواء",
    icon: Shield,
    completedAt: "09:14 UTC",
    completedBy: "محرك SOAR الذكي",
    summary: "قطاع DMZ الخاص بالمورد مُعزَل. حُقن مسار BGP Blackhole لـ 3 أنظمة مستقلة. اكتمل استخراج مؤشرات IOC الأولية — 47 مؤشراً تم حصادها.",
    artifacts: ["PCAP-INC089-0914.gz", "IOC-Feed-v1.stix"],
  },
  {
    id: 2, status: "active",
    title: "إلغاء مفاتيح API ورموز OAuth للمورد",
    category: "نظافة الاعتمادات",
    icon: Key,
    aiReason: "رموز مصادقة المورد لا تزال صالحة. جلسات API نشطة مُرصودة على 3 نقاط تكامل: الفوترة، المخزون، إدارة علاقات العملاء. كل دقيقة تأخير تمدد نطاق وصول المهاجم المُصادَق عليه.",
    substeps: [
      "تعداد جلسات OAuth النشطة عبر واجهة برمجة موفر الهوية",
      "إلغاء دفعي للرموز عبر نقاط الفوترة والمخزون وCRM",
      "تدوير 8 اعتمادات حسابات الخدمة في HashiCorp Vault",
      "التحقق من الإلغاء عبر تأكيد سجلات الوصول",
      "تحديث بوابة المورد بإشعار التعليق المؤقت",
    ],
    actions: [
      { id: "a1", label: "تنفيذ إلغاء المفاتيح (تلقائي)", variant: "danger", icon: Zap, description: "إبطال فوري لـ 23 رمز OAuth2 وتدوير 8 مفاتيح API لحسابات الخدمة عبر IAM API. صفر توقف — اعتمادات احتياطية مُهيأة مسبقاً." },
      { id: "a2", label: "تصعيد إلى قائد SecOps", variant: "amber", icon: User, description: "تعيين ملكية الحادث لقائد SecOps المناوب. يُولِّد تلقائياً قناة غرفة حرب Slack ويُلخِّص تقييم TTP الحالي." },
      { id: "a3", label: "توليد حزمة أدلة المراجعة", variant: "ghost", icon: FileText, description: "تجميع أدلة سجل مُختومة بالوقت لتوثيق الحضانة القانونية وسلسلة الأدلة الجنائية." },
    ],
  },
  {
    id: 3, status: "locked",
    title: "بدء لقطة بيانات جنائية",
    category: "الطب الشرعي الرقمي",
    icon: HardDrive,
    pendingReason: "في انتظار اكتمال الخطوة 2 — يجب تأكيد إلغاء مفاتيح API قبل التصوير الجنائي لمنع عمليات الكتابة النشطة من إتلاف أدلة القرص.",
    estimatedUnlock: "~15 دقيقة بعد تنفيذ الخطوة 2",
  },
  {
    id: 4, status: "branched",
    title: "تعرض PII — سير عمل الإشعار التنظيمي",
    category: "القانونية والامتثال",
    icon: FileText,
    branchReason: "تعديل مسار الدليل التشغيلي بواسطة الذكاء الاصطناعي: تم اكتشاف بيانات شخصية (12,447 سجلاً، الفئة 3) في الشبكة الفرعية المخترقة 10.14.8.0/24. تسري الآن التزامات الإشعار التنظيمي.",
    originalPath: "الخطوة 4 كانت: مراجعة داخلية ما بعد الحادث",
    newPath: "إشعار الجهة التنظيمية وفق GDPR المادة 33 (نافذة 72 ساعة نشطة)",
    timeRemaining: "ت-68 ساعة",
    branchActions: [
      { label: "صياغة إشعار GDPR المادة 33", icon: FileText },
      { label: "إخطار مسؤول حماية البيانات والمستشار القانوني", icon: User },
      { label: "بدء تقييم تأثير الأشخاص المعنيين", icon: Search },
    ],
  },
];

// ─── UI Primitives ─────────────────────────────────────────────────────────────
const Badge = ({ children, variant = "default", pulse: doPulse = false, className = "" }) => {
  const v = {
    default: "bg-slate-700/80 text-slate-300 border-slate-600",
    critical: "bg-red-950 text-red-300 border-red-700",
    warning: "bg-amber-950 text-amber-300 border-amber-700",
    success: "bg-emerald-950 text-emerald-300 border-emerald-700",
    info: "bg-blue-950 text-blue-300 border-blue-700",
    violet: "bg-violet-950 text-violet-300 border-violet-700",
    cyan: "bg-cyan-950 text-cyan-300 border-cyan-700",
    ghost: "bg-slate-900 text-slate-400 border-slate-700",
  };
  const dotColor = { critical: "bg-red-400", warning: "bg-amber-400", success: "bg-emerald-400", cyan: "bg-cyan-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${v[variant]} ${className}`}>
      {doPulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor[variant] || "bg-slate-400"}`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dotColor[variant] || "bg-slate-400"}`} />
        </span>
      )}
      {children}
    </span>
  );
};

const Btn = ({ children, variant = "primary", size = "sm", onClick, icon: Icon, disabled = false, loading = false }) => {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 active:scale-95 select-none border cursor-pointer";
  const sizes = { xs: "px-2.5 py-1 text-[11px]", sm: "px-3.5 py-1.5 text-xs", md: "px-5 py-2.5 text-sm" };
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20",
    danger:  "bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-600/25",
    amber:   "bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-600/20",
    ghost:   "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500",
    outline: "bg-transparent hover:bg-slate-800 text-slate-300 border-slate-600",
    emerald: "bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600",
    violet:  "bg-violet-700 hover:bg-violet-600 text-white border-violet-600",
  };
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
      {loading ? <RefreshCw size={12} className="spin" /> : Icon && <Icon size={12} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = "", glow = false }) => (
  <div className={`rounded-xl border border-slate-800 ${glow ? "border-slate-700 shadow-lg shadow-cyan-500/5" : ""} ${className}`}
    style={{ background: "rgba(15,23,42,0.72)", backdropFilter: "blur(8px)" }}>
    {children}
  </div>
);

const Progress = ({ value, color = "cyan", height = "h-1.5", className = "" }) => {
  const c = { cyan: "bg-cyan-500", emerald: "bg-emerald-500", red: "bg-red-500", amber: "bg-amber-500", violet: "bg-violet-500", blue: "bg-blue-500" };
  return (
    <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${height} ${className}`}>
      <div className={`h-full rounded-full transition-all duration-1000 ${c[color]}`} style={{ width: `${value}%` }} />
    </div>
  );
};

const PulsingDot = ({ color = "red", size = "sm" }) => {
  const c = { red: "bg-red-500", amber: "bg-amber-500", emerald: "bg-emerald-500", cyan: "bg-cyan-500" };
  const s = { sm: "h-2 w-2", md: "h-2.5 w-2.5" };
  return (
    <span className={`relative flex ${s[size]}`}>
      <span className={`ping absolute inline-flex h-full w-full rounded-full ${c[color]} opacity-75`} />
      <span className={`relative inline-flex rounded-full ${s[size]} ${c[color]}`} />
    </span>
  );
};

// ─── XAI Tooltip (hover) ──────────────────────────────────────────────────────
const XAICard = ({ insight }) => {
  const [open, setOpen] = useState(false);
  const colMap = {
    red:   { border: "border-red-700",   bg: "rgba(69,10,10,0.96)",    text: "text-red-400",   tag: "bg-red-900/50 text-red-300 border-red-800" },
    amber: { border: "border-amber-700", bg: "rgba(78,40,0,0.96)",     text: "text-amber-400", tag: "bg-amber-900/50 text-amber-300 border-amber-800" },
    blue:  { border: "border-blue-700",  bg: "rgba(15,30,70,0.96)",    text: "text-blue-400",  tag: "bg-blue-900/50 text-blue-300 border-blue-800" },
  };
  const c = colMap[insight.color];
  const cardBg = { red: "rgba(69,10,10,0.18)", amber: "rgba(120,53,15,0.14)", blue: "rgba(30,58,138,0.13)" };
  const hoverBorder = { red: "border-red-800/50 hover:border-red-700/70", amber: "border-amber-800/50 hover:border-amber-700/70", blue: "border-blue-800/50 hover:border-blue-700/70" };

  return (
    <div className="relative xai-wrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {/* Insight card */}
      <div className={`rounded-xl border p-3.5 cursor-help transition-all duration-200 ${hoverBorder[insight.color]}`}
        style={{ background: cardBg[insight.color] }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-2.5">
            <insight.icon size={14} className={`${c.text} mt-0.5 flex-shrink-0`} />
            <div>
              <p className="text-xs font-semibold text-white leading-tight">{insight.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{insight.summary}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Info size={11} className="text-slate-600" />
            <span className="text-[9px] text-slate-600">XAI</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex-1">
            <Progress value={insight.probability} color={insight.color === "red" ? "red" : insight.color === "amber" ? "amber" : "blue"} />
          </div>
          <span className={`text-sm font-black mono ${c.text}`}>{insight.probability}%</span>
          {insight.deltaDir !== "flat" && <span className={`text-[10px] mono font-bold ${c.text}`}>{insight.delta}</span>}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[9px] text-slate-600 mono">{insight.framework}</span>
          <span className="text-[9px] text-slate-700">·</span>
          <span className="text-[9px] text-slate-600 italic">مرّر للتفسير</span>
        </div>
      </div>

      {/* XAI Popup */}
      {open && (
        <div className="xai-popup right-0 top-full mt-2 w-96 slide-in" style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.7))" }}>
          <div className={`rounded-xl border ${c.border} p-4`} style={{ background: c.bg, backdropFilter: "blur(20px)" }}>
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit size={13} className="text-cyan-400" />
              <span className="text-xs font-bold text-cyan-400 tracking-wide">محرك XAI · تفسير الذكاء الاصطناعي</span>
              <span className={`mr-auto text-[10px] mono ${c.text}`}>{insight.framework}</span>
            </div>
            <p className="text-sm font-semibold text-white mb-2">{insight.label}</p>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">{insight.explanation}</p>
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">الإشارات المساهِمة</p>
              {insight.signals.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] ${c.tag}`}>
                  <span className={`w-1 h-1 rounded-full flex-shrink-0 ${insight.color === "red" ? "bg-red-400" : insight.color === "amber" ? "bg-amber-400" : "bg-blue-400"}`} />
                  <span className="text-right">{s}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <FlaskConical size={10} className="text-slate-500 flex-shrink-0" />
              <span className="text-[10px] text-slate-500">مصدر الثقة: نماذج ML السلوكية + استخبارات التهديدات + قاعدة بيانات IR التاريخية</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Chart Tooltip ────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 p-3 text-xs shadow-2xl" style={{ background: "rgba(8,14,26,0.98)", direction: "rtl" }}>
      <p className="text-slate-400 mb-2 mono font-semibold">{label}</p>
      {payload.map((p, i) => p.value != null && (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.stroke || p.fill }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-white mono">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── LEFT COLUMN ──────────────────────────────────────────────────────────────
const PredictivePanel = () => (
  <div className="space-y-4 flex flex-col h-full">

    {/* Escalation Chart */}
    <Card className="p-4 fade-up-d1">
      <div className="flex items-start justify-between mb-3">
        <Badge variant="critical" pulse>نموذج مباشر</Badge>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-0.5">
            <span className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase">مسار التصعيد التنبؤي</span>
            <TrendingUp size={13} className="text-red-400" />
          </div>
          <p className="text-sm font-bold text-white">مسار التأثير خلال 72 ساعة</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mb-3 text-[10px] text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5">فترة الثقة<span className="w-3 h-2 inline-block rounded opacity-30 mr-1" style={{ background: "#ef4444" }} /></span>
        <span className="flex items-center gap-1.5">التأثير المتوقع<span className="w-3 h-0.5 inline-block rounded mr-1" style={{ background: "#ef4444" }} /></span>
        <span className="flex items-center gap-1.5">حد الخطر<span className="w-3 h-0.5 inline-block rounded bg-amber-500 mr-1" /></span>
      </div>

      <ResponsiveContainer width="100%" height={185}>
        <AreaChart data={escalationData} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
          <defs>
            <linearGradient id="upG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="loG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#020817" stopOpacity={1} />
              <stop offset="100%" stopColor="#020817" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip content={<ChartTip />} />
          <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
          <Area type="monotone" dataKey="upper"    name="الحد الأعلى CI" stroke="none" fill="url(#upG)" />
          <Area type="monotone" dataKey="lower"    name="الحد الأدنى CI"  stroke="none" fill="url(#loG)" />
          <Area type="monotone" dataKey="expected" name="التأثير المتوقع"  stroke="#ef4444" strokeWidth={2.5} fill="none" dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
          <Area type="monotone" dataKey="actual"   name="مُؤكَّد فعلياً"    stroke="#06b6d4" strokeWidth={2}   fill="none" dot={{ fill: "#06b6d4", r: 4, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-3 gap-3 text-center">
        {[
          { label: "ذروة الخطر (+18س)", value: "79", unit: "/100", color: "text-red-400" },
          { label: "مستوى الثقة",       value: "87", unit: "%",    color: "text-amber-400" },
          { label: "إصدار النموذج",     value: "v3.8", unit: "",   color: "text-cyan-400" },
        ].map((s, i) => (
          <div key={i}>
            <p className={`text-lg font-black mono ${s.color}`}>{s.value}<span className="text-xs text-slate-500">{s.unit}</span></p>
            <p className="text-[9px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </Card>

    {/* Attack Vector Trends */}
    <Card className="p-4 fade-up-d2">
      <div className="flex items-center justify-between mb-3">
        <Badge variant="ghost">مُرصَد</Badge>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase mb-0.5">نشاط ناقل الهجوم</p>
          <p className="text-sm font-bold text-white">الاتجاهات المرصودة ت+0 → ت+5س</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={vectorData} margin={{ top: 4, right: 8, bottom: 0, left: -22 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTip />} />
          <Line type="monotone" dataKey="exfil"      name="تسريب البيانات"        stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="lateral"    name="الحركة الجانبية"       stroke="#f59e0b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="escalation" name="تصعيد الصلاحيات" stroke="#8b5cf6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-end gap-4 mt-2 text-[10px] text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5">تصعيد الصلاحيات<span className="w-2.5 h-0.5 bg-violet-500 inline-block rounded mr-1" /></span>
        <span className="flex items-center gap-1.5">الحركة الجانبية<span className="w-2.5 h-0.5 bg-amber-500 inline-block rounded mr-1" /></span>
        <span className="flex items-center gap-1.5">تسريب البيانات<span className="w-2.5 h-0.5 bg-red-500 inline-block rounded mr-1" /></span>
      </div>
    </Card>

    {/* XAI Insights */}
    <div className="flex-1 space-y-3 fade-up-d3">
      <div className="flex items-center justify-end gap-2">
        <p className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase">عوامل الخطر بالذكاء الاصطناعي · مرّر للتفسير</p>
        <BrainCircuit size={13} className="text-cyan-400" />
      </div>
      {xaiInsights.map(ins => <XAICard key={ins.id} insight={ins} />)}
    </div>
  </div>
);

// ─── SOP Step Renderers ───────────────────────────────────────────────────────
const CompletedStep = ({ step }) => (
  <div className="rounded-xl border border-emerald-900/50 p-4" style={{ background: "rgba(6,46,35,0.22)" }}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 size={16} className="text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center gap-2 flex-wrap justify-end mb-1">
          <span className="text-[10px] text-slate-500 mono">{step.completedAt}</span>
          <Badge variant="success">مكتملة</Badge>
          <p className="text-sm font-semibold text-emerald-300">{step.title}</p>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">{step.summary}</p>
        {step.artifacts?.length > 0 && (
          <div className="flex gap-2 mt-2 justify-end flex-wrap">
            {step.artifacts.map((a, i) => (
              <span key={i} className="text-[10px] mono bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                <FileText size={9} />{a}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-shrink-0">
        <Cpu size={10} /><span>{step.completedBy}</span>
      </div>
    </div>
  </div>
);

const ActiveStep = ({ step }) => {
  const [expanded, setExpanded] = useState(true);
  const [executing, setExecuting] = useState(null);
  const [executed, setExecuted] = useState([]);

  const handleExecute = (id) => {
    setExecuting(id);
    setTimeout(() => { setExecuting(null); setExecuted(p => [...p, id]); }, 2200);
  };

  return (
    <div className="rounded-xl border border-cyan-700/55 glow-active overflow-hidden" style={{ background: "rgba(8,42,56,0.32)" }}>
      {/* AI Banner */}
      <div className="px-4 py-2.5 border-b border-cyan-800/40 flex items-center gap-2 ai-shimmer">
        <div className="mr-auto flex items-center gap-1.5">
          <PulsingDot color="cyan" />
          <span className="text-[10px] text-cyan-500 mono">الأولوية: 97/100</span>
        </div>
        <span className="text-[11px] font-bold text-cyan-300 tracking-wide">✨ الإجراء الأمثل التالي — توصية الذكاء الاصطناعي</span>
        <Sparkles size={12} className="text-cyan-400 flex-shrink-0" />
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <button onClick={() => setExpanded(!expanded)} className="text-slate-500 hover:text-slate-300 transition-colors p-1 flex-shrink-0 mt-1">
            <ChevronDown size={16} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
          <div className="flex-1 text-right">
            <div className="flex items-center gap-2 flex-wrap mb-1 justify-end">
              <Badge variant="ghost">{step.category}</Badge>
              <Badge variant="cyan" pulse>نشطة</Badge>
              <p className="text-base font-bold text-white">{step.title}</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{step.aiReason}</p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-700/60"
            style={{ background: "rgba(6,182,212,0.12)" }}>
            <step.icon size={16} className="text-cyan-400" />
          </div>
        </div>

        {expanded && (
          <div className="space-y-4">
            {/* Checklist */}
            <div className="rounded-lg border border-slate-800 p-3" style={{ background: "rgba(15,23,42,0.5)" }}>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-2.5 text-right">قائمة مراجعة التنفيذ</p>
              <div className="space-y-2">
                {step.substeps.map((sub, i) => (
                  <div key={i} className="flex items-start gap-2.5 flex-row-reverse">
                    <div className="w-4 h-4 rounded border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(30,41,59,0.8)" }}>
                      <span className="text-[8px] text-slate-500 mono">{i + 1}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed text-right">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase text-right">خيارات التنفيذ</p>
              {step.actions.map(action => {
                const isDone = executed.includes(action.id);
                const isLoading = executing === action.id;
                return (
                  <div key={action.id} className={`rounded-lg border p-3 transition-all duration-300 ${isDone ? "border-emerald-800/50" : "border-slate-700/60 hover:border-slate-600"}`}
                    style={{ background: isDone ? "rgba(6,46,35,0.25)" : "rgba(15,23,42,0.6)" }}>
                    <div className="flex items-start gap-3">
                      {isDone ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          <span className="text-[11px] text-emerald-400 font-semibold whitespace-nowrap">مُنفَّذ</span>
                        </div>
                      ) : (
                        <Btn variant={action.variant} size="sm" icon={isLoading ? null : action.icon}
                          loading={isLoading} onClick={() => handleExecute(action.id)}
                          disabled={!!executing && !isLoading}>
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

const LockedStep = ({ step }) => (
  <div className="rounded-xl border border-slate-800/60 p-4 opacity-50" style={{ background: "rgba(15,23,42,0.3)" }}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0">
        <Lock size={14} className="text-slate-500" />
      </div>
      <div className="flex-1 text-right">
        <div className="flex items-center gap-2 flex-wrap justify-end mb-1">
          <Badge variant="ghost">{step.category}</Badge>
          <Badge variant="default">مقفلة</Badge>
          <p className="text-sm font-semibold text-slate-500">{step.title}</p>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">{step.pendingReason}</p>
        <div className="flex items-center gap-1.5 mt-1.5 justify-end">
          <span className="text-[10px] text-slate-600">{step.estimatedUnlock}</span>
          <Clock size={10} className="text-slate-600" />
        </div>
      </div>
    </div>
  </div>
);

const BranchedStep = ({ step }) => {
  const toast = useToast();
  return (
  <div className="rounded-xl branch-card p-4 fade-up">
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-1 text-right">
        <div className="flex items-center gap-2 flex-wrap justify-end mb-0.5">
          <Badge variant="violet">تعديل ذكاء اصطناعي</Badge>
          <p className="text-sm font-bold text-violet-300">{step.title}</p>
        </div>
        <Badge variant="ghost">{step.category}</Badge>
      </div>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.5)" }}>
        <GitBranch size={15} className="text-violet-400" />
      </div>
    </div>

    <div className="rounded-lg border border-violet-800/40 p-3 mb-3 text-xs text-right" style={{ background: "rgba(139,92,246,0.08)" }}>
      <div className="flex items-start gap-2 flex-row-reverse">
        <Sparkles size={12} className="text-violet-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-violet-300 mb-1">تعديل مسار الدليل التشغيلي بواسطة الذكاء الاصطناعي</p>
          <p className="text-slate-300 leading-relaxed">{step.branchReason}</p>
        </div>
      </div>
    </div>

    <div className="space-y-2 text-xs mb-3 text-right">
      <div className="flex items-center gap-2 text-slate-500 flex-row-reverse justify-end">
        <XCircle size={11} className="text-slate-600" />
        <span className="line-through text-slate-600">{step.originalPath}</span>
      </div>
      <div className="flex items-center gap-2 flex-row-reverse justify-end">
        <CheckCircle size={11} className="text-violet-400" />
        <span className="text-violet-300 font-semibold">{step.newPath}</span>
        <Badge variant="critical" pulse>{step.timeRemaining}</Badge>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 pt-2 border-t border-violet-800/30 justify-end">
      {step.branchActions.map((a, i) => (
        <Btn key={i} variant={i === 0 ? "violet" : "ghost"} size="xs" icon={a.icon}
          onClick={() => toast.info(`جارٍ التنفيذ: ${a.label}…`)}>{a.label}</Btn>
      ))}
    </div>
  </div>
);
};

// ─── RIGHT COLUMN ─────────────────────────────────────────────────────────────
const PlaybookPanel = () => {
  const toast = useToast();
  return (
  <div className="h-full flex flex-col space-y-4">

    {/* Playbook Header Card */}
    <Card className="p-4 fade-up-d1 flex-shrink-0" glow>
      <div className="flex items-start justify-between gap-4">
        <div className="text-left flex-shrink-0">
          <p className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">التقدم</p>
          <p className="text-xl font-black text-cyan-400 mono">1/4</p>
          <p className="text-[9px] text-slate-600">خطوات مكتملة</p>
        </div>
        <div className="flex items-center gap-3 flex-1 text-right">
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase mb-0.5">الدليل التشغيلي الديناميكي</p>
            <p className="text-base font-bold text-white leading-snug">دليل الاستجابة الآلية: اختراق المورد</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-end">
              <span className="text-[10px] text-slate-600 mono">تحديث: 2026-03-01</span>
              <Badge variant="ghost">فريق IR ألفا</Badge>
              <Badge variant="cyan">v2.4</Badge>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,rgba(6,182,212,0.25),rgba(59,130,246,0.15))", border: "1px solid rgba(6,182,212,0.4)" }}>
            <Layers size={18} className="text-cyan-400" />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-400 mono">25%</span>
          <span className="text-[10px] text-slate-500">تقدم تنفيذ الدليل التشغيلي</span>
        </div>
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="absolute h-full rounded-full" style={{ width: "25%", background: "linear-gradient(90deg,#0e7490,#06b6d4)" }} />
          <div className="absolute h-full w-full ai-shimmer rounded-full" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-4 gap-3 text-center">
        {[
          { label: "إجمالي الخطوات", value: "4" },
          { label: "مُؤتمَتة",        value: "3" },
          { label: "تفرعات AI",       value: "1" },
          { label: "الحل المتوقع",    value: "~4س" },
        ].map((s, i) => (
          <div key={i}>
            <p className="text-base font-black text-white mono">{s.value}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </Card>

    {/* Steps */}
    <div className="flex-1 overflow-y-auto space-y-3 fade-up-d2 pl-0.5"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>

      {sopSteps.map((step, i) => {
        const statusLabel = { completed: "✓ مكتملة", active: "⚡ نشطة", locked: "⊘ مقفلة", branched: "⇌ متفرعة" }[step.status];
        const statusColor = { completed: "text-emerald-600", active: "text-cyan-600", locked: "text-slate-700", branched: "text-violet-600" }[step.status];
        const numColor = { completed: "bg-emerald-900 text-emerald-400 border-emerald-700", active: "bg-cyan-900 text-cyan-300 border-cyan-600", locked: "bg-slate-900 text-slate-600 border-slate-700", branched: "bg-violet-900 text-violet-300 border-violet-700" }[step.status];

        return (
          <div key={step.id}>
            <div className="flex items-center gap-2 mb-2 flex-row-reverse">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mono flex-shrink-0 border ${numColor}`}>
                {step.id}
              </div>
              <div className="h-px flex-1 bg-slate-800" />
              <span className={`text-[10px] mono uppercase font-semibold tracking-wider ${statusColor}`}>{statusLabel}</span>
            </div>

            {step.status === "completed" && <CompletedStep step={step} />}
            {step.status === "active"    && <ActiveStep    step={step} />}
            {step.status === "locked"    && <LockedStep    step={step} />}
            {step.status === "branched"  && <BranchedStep  step={step} />}

            {i < sopSteps.length - 1 && (
              <div className="flex justify-end ml-2.5 mt-1 pr-2.5">
                <div className="w-px h-4" style={{ background: "linear-gradient(180deg,#1e293b,#334155)" }} />
              </div>
            )}
          </div>
        );
      })}

      {/* Footer Controls */}
      <div className="rounded-xl border border-slate-800 p-4 mt-2" style={{ background: "rgba(15,23,42,0.5)" }}>
        <div className="flex items-center justify-between mb-3">
          <Badge variant="ghost">فريق IR ألفا · مناوب</Badge>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-slate-400">ضوابط الدليل التشغيلي</p>
            <Settings size={13} className="text-slate-500" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Btn variant="ghost" size="xs" icon={SkipForward} onClick={() => toast.warning('التخطي يتطلب موافقة قائد الحادث')}>تخطي للخطوة التالية</Btn>
          <Btn variant="ghost" size="xs" icon={GitBranch} onClick={() => toast.info('سجل التفرعات: تفرع واحد بواسطة AI في الخطوة 4')}>عرض سجل التفرعات</Btn>
          <Btn variant="ghost" size="xs" icon={FileText} onClick={() => toast.success('جارٍ تجميع حزمة الأدلة… ملفان في الانتظار')}>تصدير حزمة الأدلة</Btn>
          <Btn variant="ghost" size="xs" icon={Terminal} onClick={() => toast.warning('وحدة CLI مخصصة لمستخدمي المستوى الخامس')}>فتح وحدة CLI</Btn>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 flex-row-reverse">
          <Radio size={11} className="text-cyan-500 pulse flex-shrink-0" />
          <span className="text-[10px] text-slate-500 text-right">محرك الدليل الذكي يُعيد تقييم الإجراء الأمثل التالي باستمرار استناداً إلى البيانات التشغيلية المباشرة.</span>
        </div>
      </div>
    </div>
  </div>
);
};
// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function SOPPlaybookAR() {
  const [elapsed, setElapsed] = useState(5092);
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s) => [Math.floor(s/3600), Math.floor((s%3600)/60), s%60].map(n => String(n).padStart(2,"0")).join(":");

  return (
    <>
      <Styles />
      <div className="min-h-screen flex flex-col bg-transparent" style={{ direction: "rtl" }}>

        {/* Grid BG */}
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.018) 1px,transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%,rgba(239,68,68,0.05) 0%,transparent 70%)",
        }} />

        {/* ─── HEADER ─── */}
        <header className="relative z-20 border-b border-slate-800 flex-shrink-0"
          style={{ background: "rgba(2,8,23,0.96)", backdropFilter: "blur(12px)" }}>

          {/* Alert Strip */}
          <div className="px-4 py-2 border-b border-red-900/50 flex items-center gap-3"
            style={{ background: "linear-gradient(270deg,rgba(69,10,10,0.55) 0%,rgba(69,10,10,0.15) 60%,transparent 100%)" }}>
            <div className="mr-auto flex items-center gap-3 text-[10px] text-slate-500 mono flex-wrap">
              <span className="flex items-center gap-1.5"><Globe  size={10} className="text-blue-500"    />بث TI: نشط</span>
              <span className="flex items-center gap-1.5"><Activity size={10} className="text-cyan-500"  />EDR: مباشر</span>
              <span className="flex items-center gap-1.5"><Wifi size={10}    className="text-emerald-500"/>SIEM: متصل</span>
            </div>
            <span className="text-[11px] text-red-400/80 text-right">محرك SOAR مُفعَّل · دليل AI قيد التنفيذ · غرفة الحرب: #INC-089-warroom نشطة</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[11px] font-bold text-red-300 tracking-wide uppercase">استجابة حادث نشط</span>
              <PulsingDot color="red" size="md" />
            </div>
          </div>

          {/* Main Header Row */}
          <div className="px-5 py-3 flex items-center gap-4">

            {/* Status Cluster */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Severity */}
              <div className="text-center px-4 py-2 rounded-xl border border-red-800/60"
                style={{ background: "rgba(127,29,29,0.22)" }}>
                <p className="text-[9px] text-slate-500 tracking-wider uppercase mb-0.5">الخطورة</p>
                <p className="text-xl font-black text-red-300">حرج</p>
                <p className="text-[9px] text-red-600">المستوى 1 / 5</p>
              </div>

              {/* GDPR Clock */}
              <div className="text-center px-4 py-2 rounded-xl border border-amber-800/50"
                style={{ background: "rgba(120,53,15,0.16)" }}>
                <p className="text-[9px] text-amber-600 tracking-wider uppercase mb-0.5">GDPR م.33</p>
                <p className="text-xl font-black mono text-amber-400">ت-68:00</p>
                <p className="text-[9px] text-amber-600/70">نافذة الإشعار</p>
              </div>

              {/* Elapsed */}
              <div className="text-center px-4 py-2 rounded-xl border border-slate-700"
                style={{ background: "rgba(15,23,42,0.8)" }}>
                <p className="text-[9px] text-slate-500 tracking-wider uppercase mb-0.5">الوقت المنقضي</p>
                <p className="text-xl font-black mono text-red-400">{fmt(elapsed)}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="text-[9px] text-red-500">العداد يعمل</span>
                  <PulsingDot color="red" />
                </div>
              </div>
            </div>

            {/* Incident Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0 text-right">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5 justify-end">
                  <Badge variant="warning">مرحلة الاحتواء</Badge>
                  <Badge variant="critical" pulse>P1 · SEV-1</Badge>
                  <span className="text-[11px] mono font-bold text-red-400 tracking-widest">INC-2026-089</span>
                </div>
                <h1 className="text-lg font-black text-white truncate leading-tight">
                  اختراق حرج لمورد سلسلة الإمداد — تسريب اعتمادات API
                </h1>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  المورد: GlobalTech Integrations Ltd. · الأنظمة المتأثرة: API الفوترة، CRM، تغذية المخزون · المحلل: Chen Wei - SOC-L3
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", boxShadow: "0 0 20px rgba(239,68,68,0.1)" }}>
                <ShieldAlert size={18} className="text-red-400" />
              </div>
            </div>
          </div>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <main className="relative z-10 flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: "calc(100vh - 152px)" }}>

            {/* Right col (RTL = rendered first visually on right = predictive analytics 40%) */}
            <div className="lg:col-span-2 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 168px)", scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
              <PredictivePanel />
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:flex flex-col items-center py-2">
              <div className="w-px flex-1" style={{ background: "linear-gradient(180deg,transparent,#334155,transparent)" }} />
            </div>

            {/* Left col (RTL = rendered second visually on left = SOP playbook 60%) */}
            <div className="lg:col-span-3 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 168px)", scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
              <PlaybookPanel />
            </div>
          </div>
        </main>

        {/* ─── STATUS BAR ─── */}
        <footer className="relative z-20 border-t border-slate-800/60 px-5 py-1.5 flex items-center justify-between"
          style={{ background: "rgba(2,8,23,0.9)" }}>
          <div className="flex items-center gap-3 text-[10px] mono text-slate-600">
            <span>التصنيف: <span className="text-amber-600">مقيَّد // TLP:AMBER</span></span>
            <span className="text-slate-700">·</span>
            <span>خالد ريزيلينس AI · محرك SOP v4.2.1</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] mono text-slate-600">
            <span>محرك XAI: <span className="text-slate-500">Shapley SHAP v2.1</span></span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block pulse" />نموذج ML: v3.8 · استدلال نشط</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />SOAR: يعمل</span>
          </div>
        </footer>
      </div>
    </>
  );
}
