import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import RiskDetailDrawer from "../components/RiskDetailDrawer";
import AddRiskModal from "../components/AddRiskModal";
import RiskMatrix from "../components/RiskMatrix";
import { useRisks } from "../context/RiskContext";
import { useToast } from "../components/ToastProvider";
import BIAAssessmentList from "../components/bia/BIAAssessmentList";
import BIAProcessForm from "../components/bia/BIAProcessForm";
import BIAImpactMatrix from "../components/bia/BIAImpactMatrix";
import BIADependencyMap from "../components/bia/BIADependencyMap";
import BIAWorkflowTracker from "../components/bia/BIAWorkflowTracker";
import BIAConsolidatedReport from "../components/bia/BIAConsolidatedReport";
import BCPListTab from "../components/bia/BCPListTab";
import SumoodDashboard from "../components/sumood/SumoodDashboard";
import SumoodSelfAssessment from "../components/sumood/SumoodSelfAssessment";
import SumoodGapAnalysis from "../components/sumood/SumoodGapAnalysis";
import SumoodDocumentCompliance from "../components/sumood/SumoodDocumentCompliance";
import ExecutiveDashboard from "../components/dashboard/ExecutiveDashboard";
import { useBIA } from "../context/BIAContext";
import {
  LayoutDashboard, BookOpen, Activity, Sparkles, ShieldCheck,
  Settings, Bell, Search, AlertTriangle, CheckCircle2,
  Clock, Zap, Globe, Lock, Database, Server, Users, Package,
  ChevronLeft, Play, Download, Filter, RefreshCw, Eye, FileText,
  Network, Shield, AlertCircle, Radio, BarChart3,
  ArrowUpRight, ArrowDownRight, Cpu, GitBranch, Terminal,
  Layers, Target, Crosshair, XCircle, Menu, Bot, Plus
} from "lucide-react";
import {
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, ReferenceLine
} from "recharts";

// ─── Arabic Font Injection ────────────────────────────────────────────────────
const StyleTag = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&display=swap');
    * { font-family: 'IBM Plex Sans Arabic', 'Segoe UI', system-ui, sans-serif !important; }
    body { direction: rtl; }
    .font-mono { font-family: 'IBM Plex Mono', 'Courier New', monospace !important; direction: ltr; unicode-bidi: isolate; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
    @keyframes bounce { 0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8,0,1,1); } 50% { transform: translateY(-4px); animation-timing-function: cubic-bezier(0,0,0.2,1); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .animate-ping { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }
    .animate-bounce { animation: bounce 1s infinite; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
    .fade-in { animation: fadeIn 0.5s ease forwards; }
    @keyframes fadeIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `}</style>
);

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  bg950: "#020817", bg900: "#0a1628", slate800: "#1e293b",
  cyan500: "#06b6d4", red500: "#ef4444", amber500: "#f59e0b",
  emerald500: "#10b981", blue500: "#3b82f6", violet500: "#8b5cf6",
};

// ─── Mock Data (Arabic) ───────────────────────────────────────────────────────
const riskTrendData = [
  { month: "أكت", inherent: 88, residual: 71 },
  { month: "نوف", inherent: 85, residual: 68 },
  { month: "ديس", inherent: 91, residual: 74 },
  { month: "يناير", inherent: 87, residual: 69 },
  { month: "فبر", inherent: 82, residual: 65 },
  { month: "مارس", inherent: 79, residual: 61 },
];

const complianceData = [
  { name: "ISO 22301", value: 96, color: C.emerald500 },
  { name: "سما", value: 91, color: C.cyan500 },
  { name: "GDPR", value: 88, color: C.blue500 },
  { name: "DPDP", value: 83, color: C.violet500 },
  { name: "SOC 2", value: 94, color: C.amber500 },
];

const scatterData = [
  { x: 0.9, y: 0.85, z: 20, name: "برامج الفدية" },
  { x: 0.75, y: 0.7, z: 15, name: "اختراق API" },
  { x: 0.6, y: 0.9, z: 18, name: "سلسلة الإمداد" },
  { x: 0.45, y: 0.55, z: 10, name: "انجراف الامتثال" },
  { x: 0.3, y: 0.4, z: 8, name: "فشل تشغيلي" },
  { x: 0.8, y: 0.3, z: 12, name: "طرف ثالث" },
  { x: 0.15, y: 0.7, z: 6, name: "تسرب بيانات" },
];

const riskRegisterData = [
  {
    id: "RSK-1042", date: "2026-03-20", department: "تقنية المعلومات", riskType: "الأمن السيبراني",
    category: "الأمن السيبراني", riskName: "تسريب بيانات عبر API قديمة",
    description: "احتمال تسريب بيانات عبر واجهة API قديمة لطرف ثالث",
    owner: "أمن المعلومات",
    inherentScore: 25, inherentLabel: "كارثي", inherentColor: "#7f1d1d",
    residualScore: 15, residualLabel: "عالي", residualColor: "#ef4444",
    inherent: "حرج", residual: "مرتفع",
    status: "قيد التنفيذ", lifecycleStatus: "قيد التنفيذ",
    aiStatus: "عزل فوري مُنفَّذ", aiColor: "emerald", score: 94, delta: -3,
  },
  {
    id: "RSK-0891", date: "2026-03-18", department: "العمليات", riskType: "تشغيلي",
    category: "تشغيلي", riskName: "نقطة فشل منفردة في آسيا",
    description: "نقطة فشل منفردة في مركز اللوجستيات الرئيسي (آسيا-باسيفيك)",
    owner: "نائب الرئيس التنفيذي",
    inherentScore: 16, inherentLabel: "عالي", inherentColor: "#ef4444",
    residualScore: 10, residualLabel: "متوسط", residualColor: "#f97316",
    inherent: "مرتفع", residual: "متوسط",
    status: "مُراقَب", lifecycleStatus: "مُراقَب",
    aiStatus: "مراقبة KRI", aiColor: "blue", score: 78, delta: +2,
  },
  {
    id: "RSK-0553", date: "2026-03-12", department: "القانونية", riskType: "امتثال",
    category: "امتثال", riskName: "فجوة إقامة البيانات DPDP",
    description: "عدم الالتزام ببنود إقامة البيانات وفق لوائح DPDP",
    owner: "الشؤون القانونية",
    inherentScore: 12, inherentLabel: "متوسط", inherentColor: "#f97316",
    residualScore: 6, residualLabel: "منخفض", residualColor: "#eab308",
    inherent: "متوسط", residual: "منخفض",
    status: "مُخطَّط / مُعتمَد", lifecycleStatus: "مُخطَّط / مُعتمَد",
    aiStatus: "تدقيق مُجدوَل", aiColor: "amber", score: 52, delta: -8,
  },
  {
    id: "RSK-1108", date: "2026-03-15", department: "المالية", riskType: "مالي",
    category: "مالي", riskName: "تعرض لتقلبات العملات",
    description: "تعرض لتقلبات العملات الأجنبية في الشركات التابعة (+200M$)",
    owner: "مكتب المدير المالي",
    inherentScore: 20, inherentLabel: "كارثي", inherentColor: "#7f1d1d",
    residualScore: 16, residualLabel: "عالي", residualColor: "#ef4444",
    inherent: "مرتفع", residual: "مرتفع",
    status: "قيد التنفيذ", lifecycleStatus: "قيد التنفيذ",
    aiStatus: "مُصعَّد للمجلس", aiColor: "red", score: 81, delta: +5,
  },
  {
    id: "RSK-0774", date: "2026-03-10", department: "الاستراتيجية", riskType: "جيوسياسي",
    category: "جيوسياسي", riskName: "خطر سلسلة الإمداد — تايوان",
    description: "تعطل سلسلة الإمداد في آسيا-باسيفيك — سيناريو مضيق تايوان",
    owner: "كبير مسؤولي المخاطر",
    inherentScore: 25, inherentLabel: "كارثي", inherentColor: "#7f1d1d",
    residualScore: 12, residualLabel: "متوسط", residualColor: "#f97316",
    inherent: "حرج", residual: "متوسط",
    status: "قيد التحليل", lifecycleStatus: "قيد التحليل",
    aiStatus: "محاكاة نشطة", aiColor: "violet", score: 88, delta: -1,
  },
  {
    id: "RSK-0620", date: "2026-03-08", department: "التسويق", riskType: "سمعي",
    category: "سمعي", riskName: "فجوة الإفصاح ESG",
    description: "ناقل أزمة وسائل التواصل — فجوة الإفصاح عن معايير ESG",
    owner: "مدير الاتصالات",
    inherentScore: 10, inherentLabel: "متوسط", inherentColor: "#f97316",
    residualScore: 4, residualLabel: "منخفض جداً", residualColor: "#22c55e",
    inherent: "متوسط", residual: "منخفض",
    status: "مُغلَق", lifecycleStatus: "مُغلَق",
    aiStatus: "السياسة مُحدَّثة", aiColor: "emerald", score: 44, delta: -12,
  },
];

const timelineEvents = [
  {
    time: "10:00 ص", icon: AlertTriangle, color: "red",
    title: "اكتشاف الاختراق الأولي",
    detail: "تشفير 14 خادم قاعدة بيانات — بدأ عداد RTO فوراً.",
  },
  {
    time: "10:08 ص", icon: Cpu, color: "amber",
    title: "عزل تلقائي عبر SOAR",
    detail: "تجزئة الشبكة مُنفَّذة. العنقود الأوروبي في الحجر الرقمي.",
  },
  {
    time: "10:15 ص", icon: Shield, color: "blue",
    title: "تعيين قائد إدارة الحادث",
    detail: "خالد الغفيلي مُفعَّل كـ IC. قناة غرفة الحرب مُنشأة.",
  },
  {
    time: "10:22 ص", icon: Globe, color: "amber",
    title: "تحديد أسلوب الجهة المُهدِّدة",
    detail: "خلاصة NLP تربط مجموعة IOC بـ LockBit 3.0. الثقة: 92%.",
  },
  {
    time: "10:30 ص", icon: Database, color: "red",
    title: "إشارة تسريب على الدارك ويب",
    detail: "بيانات عملاء (~2.4M سجل) رُصدت في منتديات سرية. بدأ عداد GDPR.",
  },
  {
    time: "10:45 ص", icon: CheckCircle2, color: "emerald",
    title: "تفعيل موقع الاسترداد الاحتياطي",
    detail: "الموقع الساخن نشط. هدف RTO 4 ساعات — T+0:45. التعافي في المسار.",
  },
];

const navItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", id: "dashboard" },
  { icon: BookOpen, label: "سجل المخاطر", id: "register" },
  { icon: Crosshair, label: "خريطة المخاطر", id: "matrix" },
  { icon: Activity, label: "محاكاة الأزمات والطوارئ", id: "situation" },
  { icon: ShieldCheck, label: "الامتثال التنظيمي", id: "compliance" },
  { icon: Database, label: "تحليل تأثير الأعمال", id: "bia" },
  { icon: Target, label: "مؤشر صمود", id: "sumood" },
];

// ─── UI Primitives ─────────────────────────────────────────────────────────────
const Badge = ({ children, variant = "default" }) => {
  const v = {
    default: "bg-slate-700 text-slate-300",
    critical: "bg-red-950 text-red-400 border border-red-800",
    high: "bg-amber-950 text-amber-400 border border-amber-800",
    medium: "bg-blue-950 text-blue-400 border border-blue-800",
    low: "bg-emerald-950 text-emerald-400 border border-emerald-800",
    success: "bg-emerald-950 text-emerald-400",
    warning: "bg-amber-950 text-amber-400",
    info: "bg-blue-950 text-blue-400",
    violet: "bg-violet-950 text-violet-400 border border-violet-800",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${v[variant]}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = "", glow = false, onClick }) => (
  <div onClick={onClick}
    className={`rounded-xl border border-slate-800 p-4 transition-all duration-300
      ${glow ? "shadow-lg shadow-cyan-500/5 border-slate-700" : ""}
      ${onClick ? "cursor-pointer hover:border-slate-600" : ""}
      ${className}`}
    style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)" }}>
    {children}
  </div>
);

const Btn = ({ children, variant = "primary", size = "sm", onClick, icon: Icon }) => {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all duration-200 active:scale-95 whitespace-nowrap";
  const sizes = { xs: "px-2.5 py-1 text-[11px]", sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950",
    danger: "bg-red-600 hover:bg-red-500 text-white",
    ghost: "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700",
    outline: "border border-slate-600 hover:border-slate-500 text-slate-300 hover:bg-slate-800",
    amber: "bg-amber-600 hover:bg-amber-500 text-white",
    emerald: "bg-emerald-700 hover:bg-emerald-600 text-white",
  };
  return (
    <button onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
};

const Progress = ({ value, color = "cyan", className = "" }) => {
  const colors = { cyan: "bg-cyan-500", emerald: "bg-emerald-500", red: "bg-red-500", amber: "bg-amber-500" };
  return (
    <div className={`h-1.5 bg-slate-800 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-1000 ${colors[color]}`} style={{ width: `${value}%` }} />
    </div>
  );
};

const PulsingDot = ({ color = "red" }) => {
  const c = { red: "bg-red-500", amber: "bg-amber-500", emerald: "bg-emerald-500", cyan: "bg-cyan-500" };
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c[color]} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${c[color]}`} />
    </span>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl text-xs" style={{ direction: "rtl" }}>
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

const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-slate-900 border border-red-800 rounded-lg p-2.5 shadow-xl text-xs" style={{ direction: "rtl" }}>
      <p className="text-red-400 font-bold">{d?.name}</p>
      <p className="text-slate-400 mt-1">الاحتمالية: <span className="text-white">{(d?.x * 100).toFixed(0)}%</span></p>
      <p className="text-slate-400">التأثير: <span className="text-white">{(d?.y * 100).toFixed(0)}%</span></p>
    </div>
  );
};

// ─── SIDEBAR (RTL: RIGHT side) ─────────────────────────────────────────────────
const Sidebar = ({ activeNav, setActiveNav, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  const toast = useToast();
  const handleNav = (id) => {
    setActiveNav(id);
    if (["dashboard", "register", "matrix", "situation", "bia", "sumood"].includes(id)) setActiveTab(id);
    setIsSidebarOpen(false); // Auto-close on mobile
  };

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`fixed right-0 top-0 h-screen w-64 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} md:translate-x-0`}
        style={{
        background: "linear-gradient(180deg, #020c1b 0%, #020817 100%)",
        borderLeft: "1px solid #1e293b",
      }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)", boxShadow: "0 0 20px rgba(6,182,212,0.45)" }}>
              <Shield size={18} className="text-white" />
            </div>
            <span className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">جاهزية</p>
            <p className="text-cyan-400 text-[10px] tracking-widest mt-1">منصة جاهزية</p>
          </div>
        </div>
        <div className="mt-3.5 flex items-center gap-2">
          <PulsingDot color="emerald" />
          <span className="text-[10px] text-emerald-400">جميع الأنظمة تعمل بكفاءة</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-slate-600 text-[10px] tracking-widest px-2 mb-3">التنقل الرئيسي</p>
        {navItems.map(({ icon: Icon, label, id }) => {
          const isActive = activeNav === id;
          return (
            <button key={id} onClick={() => handleNav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right transition-all duration-200 group
                ${isActive ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}>
              <Icon size={15} className={isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"} />
              <span className="text-[13px] font-medium flex-1 text-right">{label}</span>
              {isActive && <ChevronLeft size={12} className="text-cyan-500 flex-shrink-0" />}
              {id === "situation" && <PulsingDot color="red" />}
            </button>
          );
        })}


      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
            خ غ
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[12px] font-semibold truncate">خالد الغفيلي</p>
            <p className="text-slate-500 text-[10px] truncate">كبير مسؤولي المخاطر</p>
          </div>
          <button onClick={() => toast.info('إعدادات الحساب — استخدم أيقونة الترس في الزاوية السفلية')} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <Settings size={14} />
          </button>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[10px]">
          <span className="text-slate-600">صلاحية الوصول:</span>
          <span className="text-cyan-400 font-bold">المستوى 5 · تنفيذي</span>
        </div>
      </div>
    </aside>
    </>
  );
};

// ─── TOP HEADER ───────────────────────────────────────────────────────────────
const TopHeader = ({ activeTab, setActiveTab, onMenuClick }) => {
  const toast = useToast();
  const [time, setTime] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const tabs = [
    { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "register", label: "سجل المخاطر", icon: BookOpen },
    { id: "matrix", label: "خريطة المخاطر", icon: Crosshair },
    { id: "situation", label: "غرفة العمليات", icon: Activity },
    { id: "bia", label: "تحليل تأثير الأعمال", icon: Database },
    { id: "sumood", label: "مؤشر صمود", icon: Target },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-slate-800" style={{ background: "rgba(2,8,23,0.95)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center gap-4 px-4 md:px-6 py-3">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -mr-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="flex-1 relative max-w-lg">
          <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full border border-slate-700 rounded-lg pr-9 pl-4 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-600 transition-all text-right"
            style={{ background: "rgba(15,23,42,0.8)" }}
            placeholder="ابحث عن المخاطر، السياسات، أصول BIA..."
            onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) { toast.info(`نتائج البحث عن: "${e.target.value}" — قريباً`); } }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 border border-slate-700 px-1.5 py-0.5 rounded">⌘K</span>
        </div>

        <div className="flex items-center gap-3 mr-auto">
          {/* Live Clock */}
          <div className="hidden lg:flex items-center gap-2 border border-slate-800 rounded-lg px-3 py-2" style={{ background: "rgba(15,23,42,0.8)" }}>
            <PulsingDot color="cyan" />
            <div className="text-right">
              <p className="text-[9px] text-slate-500 leading-none">حالة النظام المباشرة</p>
              <p className="text-[11px] text-cyan-400 font-bold leading-none mt-0.5 font-mono">
                {time.toLocaleTimeString("ar-SA", { hour12: false })} · UTC+3
              </p>
            </div>
          </div>

          {/* Threat Level */}
          <div className="hidden lg:flex items-center gap-2 border rounded-lg px-3 py-2"
            style={{ background: "rgba(69,10,10,0.4)", borderColor: "rgba(185,28,28,0.5)" }}>
            <AlertTriangle size={11} className="text-red-400" />
            <div className="text-right">
              <p className="text-[9px] text-slate-500">مستوى التهديد</p>
              <p className="text-[11px] text-red-400 font-bold">مرتفع</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 flex items-center justify-center border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
              style={{ background: "rgba(15,23,42,0.8)" }}>
              <Bell size={15} className="text-slate-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">3</span>
            </button>
            {notifOpen && (
              <div className="absolute left-0 top-11 w-80 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden" style={{ background: "#0f172a" }}>
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">التنبيهات الحرجة</p>
                  <Badge variant="critical">3 غير مقروءة</Badge>
                </div>
                {[
                  { icon: AlertTriangle, color: "text-red-400", title: "تصعيد محاكاة برامج الفدية", time: "منذ دقيقتين" },
                  { icon: Shield, color: "text-amber-400", title: "نافذة إشعار GDPR: ت-48 ساعة", time: "منذ 18 دقيقة" },
                  { icon: Zap, color: "text-cyan-400", title: "دفتر تشغيل AI مُنفَّذ تلقائياً: قاعدة جدار الحماية 7B", time: "منذ 41 دقيقة" },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50 cursor-pointer border-b border-slate-800/50"
                    onClick={() => { toast.warning(n.title); setNotifOpen(false); }}>
                    <n.icon size={13} className={`${n.color} mt-0.5 flex-shrink-0`} />
                    <div className="text-right">
                      <p className="text-xs text-slate-200">{n.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
            خ غ
          </div>
        </div>
      </div>


    </div>
  );
};

// ─── VIEW 1: DASHBOARD ────────────────────────────────────────────────────────
const DashboardView = () => {
  const toast = useToast();
  const kpis = [
    {
      label: "نقاط المخاطر المؤسسية", value: "72", unit: "/100",
      sub: "انخفض الخطر 4% عبر التخفيف الآلي",
      icon: Target, trend: "down", trendVal: "‏-4%", color: "amber",
      extra: <Progress value={72} color="amber" className="mt-2" />,
    },
    {
      label: "الشذوذات النشطة", value: "3", unit: "",
      sub: "2 حرجة · 1 مرتفعة الخطورة",
      icon: AlertCircle, trend: "up", trendVal: "‏+1", color: "red",
      extra: (
        <div className="mt-2 flex items-center gap-1.5">
          <PulsingDot color="red" />
          <span className="text-[10px] text-red-400">تتطلب تدخلاً فورياً</span>
        </div>
      ),
    },
    {
      label: "وضع الامتثال العام", value: "94", unit: "%",
      sub: "ISO 22301 · سما · GDPR · DPDP",
      icon: ShieldCheck, trend: "up", trendVal: "‏+2%", color: "emerald",
      extra: <Progress value={94} color="emerald" className="mt-2" />,
    },
    {
      label: "تعرضات الأطراف الثالثة", value: "12", unit: "",
      sub: "4 غير مُخففة · 3 قيد المراجعة",
      icon: Network, trend: "down", trendVal: "‏-2", color: "amber",
      extra: <Progress value={40} color="amber" className="mt-2" />,
    },
  ];

  const aiInsights = [
    {
      severity: "critical", icon: Globe,
      title: "تنبؤ بتعطل سلسلة الإمداد — آسيا-باسيفيك",
      detail: "نمذجة التوترات الجيوسياسية تُشير إلى احتمال 85% لفشل مورد من الطبقة الثانية خلال 21 يوماً. فعّل بروتوكول البديل الفوري.",
      tags: ["احتمالية: 85%", "آسيا-باسيفيك", "موردون الطبقة 2"],
      action: "محاكاة التأثير", actionVariant: "danger",
    },
    {
      severity: "warning", icon: ShieldCheck,
      title: "انجراف امتثال ISO 22301 — العمليات الأوروبية",
      detail: "مراجعة سياسة BCM متأخرة 47 يوماً في الفروع الأوروبية. محرك التدقيق اكتشف 3 انحرافات في وثائق BCP.",
      tags: ["ISO 22301", "عمليات EU", "فجوة سياسات"],
      action: "عرض تحليل الفجوة", actionVariant: "amber",
    },
    {
      severity: "info", icon: Cpu,
      title: "تحديث ذكاء برامج الفدية عبر NLP",
      detail: "استوعب النظام 14 مجموعة IOC جديدة من ISAC. قواعد WAF السحابية مُعدَّلة تلقائياً. تعيين MITRE ATT&CK: TA0040·T1486 مكتمل.",
      tags: ["ذكاء آلي", "MITRE ATT&CK", "بدون تدخل بشري"],
      action: "عرض ملخص التهديد", actionVariant: "ghost",
    },
  ];

  const severityStyles = {
    critical: { border: "border-red-800/60", bg: "rgba(69,10,10,0.2)", iconBg: "bg-red-950/60 border-red-800/50", iconColor: "text-red-400", tag: "bg-red-950 text-red-400" },
    warning: { border: "border-amber-800/60", bg: "rgba(120,53,15,0.15)", iconBg: "bg-amber-950/60 border-amber-800/50", iconColor: "text-amber-400", tag: "bg-amber-950 text-amber-400" },
    info: { border: "border-cyan-800/60", bg: "rgba(8,51,68,0.2)", iconBg: "bg-cyan-950/60 border-cyan-800/50", iconColor: "text-cyan-400", tag: "bg-cyan-950 text-cyan-400" },
  };

  return (
    <div className="space-y-5 fade-in">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} glow>
            <div className="flex items-start justify-between mb-1">
              <div className="text-right flex-1">
                <p className="text-[10px] text-slate-500 tracking-wide">{kpi.label}</p>
                <div className="flex items-end gap-1 mt-1.5 justify-end">
                  {kpi.unit && <span className="text-slate-500 text-sm mb-0.5">{kpi.unit}</span>}
                  <span className={`text-3xl font-black leading-none
                    ${kpi.color === "red" ? "text-red-400" : kpi.color === "amber" ? "text-amber-400" : kpi.color === "emerald" ? "text-emerald-400" : "text-white"}`}>
                    {kpi.value}
                  </span>
                </div>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mr-3
                ${kpi.color === "red" ? "bg-red-950/60 border border-red-800/50" :
                  kpi.color === "amber" ? "bg-amber-950/60 border border-amber-800/50" :
                  kpi.color === "emerald" ? "bg-emerald-950/60 border border-emerald-800/50" : "bg-slate-800 border border-slate-700"}`}>
                <kpi.icon size={16} className={kpi.color === "red" ? "text-red-400" : kpi.color === "amber" ? "text-amber-400" : kpi.color === "emerald" ? "text-emerald-400" : "text-slate-400"} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1 justify-end">
              <span className="text-[10px] text-slate-600">مقارنة بالدورة السابقة</span>
              <span className={`text-[11px] font-bold ${kpi.trend === "up" && kpi.color === "red" ? "text-red-400" : "text-emerald-400"}`}>{kpi.trendVal}</span>
              {kpi.trend === "down"
                ? <ArrowDownRight size={11} className="text-emerald-400" />
                : <ArrowUpRight size={11} className={kpi.color === "red" ? "text-red-400" : "text-emerald-400"} />}
            </div>
            {kpi.extra}
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed text-right">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      {/* Mid Split */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Chart */}
        <Card className="xl:col-span-3" glow>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Btn variant="ghost" size="xs" icon={RefreshCw} onClick={() => toast.success('تم تحديث بيانات اتجاهات المخاطر بنجاح')}>تحديث</Btn>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="w-3 h-0.5 bg-cyan-500 inline-block rounded" />متبقي
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="w-3 h-0.5 bg-red-500 inline-block rounded" />كامن
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 tracking-wide">اتجاهات التعرض للمخاطر</p>
              <p className="text-sm font-semibold text-white mt-0.5">الخطر الكامن مقابل المتبقي · 6 أشهر</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={riskTrendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="iG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="inherent" name="الخطر الكامن" stroke="#ef4444" strokeWidth={2} fill="url(#iG)" dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="residual" name="الخطر المتبقي" stroke="#06b6d4" strokeWidth={2} fill="url(#rG)" dot={{ fill: "#06b6d4", r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
            <Btn variant="ghost" size="xs" icon={BarChart3} onClick={() => toast.info('جارٍ إنشاء تقرير التعرض للمخاطر الكامل…')}>تقرير كامل</Btn>
            <p className="text-[10px] text-slate-500">فعالية التخفيف: <span className="text-emerald-400 font-bold">‏+18.6%</span> ربعياً</p>
          </div>
        </Card>

        {/* AI Insights */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <PulsingDot color="cyan" />
              <span className="text-[10px] text-cyan-400">استدلال مباشر</span>
            </div>
            <p className="text-[10px] text-slate-500 tracking-wide">رؤى الذكاء الاصطناعي التنبؤية</p>
          </div>
          {aiInsights.map((ins, i) => {
            const s = severityStyles[ins.severity];
            return (
              <div key={i} className={`rounded-xl border ${s.border} p-3.5 transition-all duration-300`} style={{ background: s.bg }}>
                <div className="flex items-start gap-2.5">
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-[12px] font-semibold text-white leading-snug">{ins.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{ins.detail}</p>
                    <div className="flex flex-wrap gap-1 mt-2 justify-end">
                      {ins.tags.map((tag, j) => (
                        <span key={j} className={`text-[9px] px-1.5 py-0.5 rounded ${s.tag}`}>{tag}</span>
                      ))}
                    </div>
                    <div className="mt-2.5 flex justify-end">
                      <Btn variant={ins.actionVariant} size="xs" icon={Play} onClick={() => toast.info(`جارٍ التشغيل: ${ins.action}…`)}>{ins.action}</Btn>
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${s.iconBg} border`}>
                    <ins.icon size={13} className={s.iconColor} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance Pie */}
      <Card glow>
        <div className="flex items-center justify-between mb-4">
          <Badge variant="success">آخر تدقيق: 18 مارس 2026</Badge>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 tracking-wide">توزيع الامتثال التنظيمي</p>
            <p className="text-sm font-semibold text-white mt-0.5">تحليل الالتزام بالأطر · الوقت الفعلي</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-5 gap-3 w-full">
            {complianceData.map((f, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-black" style={{ color: f.color }}>{f.value}%</div>
                <p className="text-[10px] text-slate-400 mt-0.5">{f.name}</p>
                <Progress value={f.value} color={f.value >= 93 ? "emerald" : "amber"} className="mt-1.5" />
                <p className="text-[9px] text-slate-600 mt-1">{f.value >= 90 ? "ملتزم" : "قرب الحد"}</p>
              </div>
            ))}
          </div>
          <div className="flex-shrink-0">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={complianceData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {complianceData.map((e, i) => <Cell key={i} fill={e.color} opacity={0.9} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, "الالتزام"]}
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── VIEW 2: RISK REGISTER ────────────────────────────────────────────────────
const RiskRegisterView = ({ onSelectRisk }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const { risks, addRisk, updateRiskStatus } = useRisks();
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [viewTab, setViewTab] = useState("all"); // "all" | "pending"
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [activeCardFilter, setActiveCardFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState([]);
  const [showSevDropdown, setShowSevDropdown] = useState(false);
  const toast = useToast();

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filtered = useMemo(() => {
    let result = risks.filter(r => {
      if (viewTab === "pending" && r.status !== "Identified" && r.status !== "مُحدَّد") return false;
      const q = filter.toLowerCase();
      return !q || r.id.toLowerCase().includes(q) ||
        r.description.includes(filter) ||
        r.category.includes(filter) ||
        (r.riskName && r.riskName.includes(filter));
    });

    if (activeCardFilter === 'catastrophic') result = result.filter(r => (r.inherentScore || r.score || 0) >= 20);
    else if (activeCardFilter === 'high') result = result.filter(r => { const s = r.inherentScore || r.score || 0; return s >= 15 && s < 20; });
    else if (activeCardFilter === 'medium') result = result.filter(r => { const s = r.inherentScore || r.score || 0; return s >= 8 && s < 15; });

    if (severityFilter.length > 0) {
      result = result.filter(r => {
        const label = (r.inherentLabel || r.inherent || '').toLowerCase();
        return severityFilter.some(s => label.includes(s.toLowerCase()));
      });
    }

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aVal, bVal;
        const k = sortConfig.key;
        if (k === 'inherentScore') { aVal = a.inherentScore || a.score || 0; bVal = b.inherentScore || b.score || 0; }
        else if (k === 'residualScore') { aVal = a.residualScore || 0; bVal = b.residualScore || 0; }
        else if (k === 'date') { aVal = a.date || ''; bVal = b.date || ''; }
        else { aVal = a[k] || ''; bVal = b[k] || ''; }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
      });
    }
    return result;
  }, [risks, filter, viewTab, activeCardFilter, severityFilter, sortConfig]);

  const aiColor = (c) => ({ emerald: "text-emerald-400", blue: "text-blue-400", amber: "text-amber-400", red: "text-red-400", violet: "text-violet-400" }[c] || "text-slate-400");
  const dotColor = (c) => ({ emerald: "bg-emerald-400", blue: "bg-blue-400", amber: "bg-amber-400", red: "bg-red-400", violet: "bg-violet-400" }[c] || "bg-slate-400");

  const catIcon = (cat) => {
    const m = {
      "الأمن السيبراني": Lock, "أمن سيبراني": Lock,
      "تشغيلي": Server, "تقنية المعلومات": Server, "العمليات": Server,
      "امتثال": ShieldCheck, "الامتثال التنظيمي": ShieldCheck,
      "مالي": BarChart3, "المالية": BarChart3,
      "جيوسياسي": Globe, "استراتيجي": Globe, "التخطيط الاستراتيجي": Globe,
      "سمعي": Eye, "التسويق": Eye,
      "قانوني": ShieldCheck, "الشؤون القانونية": ShieldCheck,
      "الموارد البشرية": Users, "المشتريات": Package,
    };
    const I = m[cat] || AlertCircle;
    return <I size={12} className="text-slate-500" />;
  };

  // Risk score badge with color
  const scoreBadge = (score, label, color) => {
    if (!score && score !== 0) return <span className="text-slate-600 text-[10px]">—</span>;
    return (
      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{
          color: color || "#94a3b8",
          background: color ? `${color}18` : "rgba(148,163,184,0.1)",
          border: `1px solid ${color || "#334155"}40`,
        }}>{label || "—"}</span>
        <span className="font-mono font-bold text-sm" style={{ color: color || "#94a3b8" }}>{score}</span>
      </div>
    );
  };

  // Status badge (supports Arabic and English status values from context)
  const statusBadge = (status) => {
    const colorMap = {
      // Arabic — new demo data values
      "قيد المعالجة":      { bg: "bg-cyan-950",    text: "text-cyan-400",    border: "border-cyan-800" },
      "تحت المراقبة":      { bg: "bg-emerald-950", text: "text-emerald-400", border: "border-emerald-800" },
      "قيد التحليل":      { bg: "bg-amber-950",   text: "text-amber-400",   border: "border-amber-800" },
      "مخطط / معتمد":     { bg: "bg-violet-950",  text: "text-violet-400",  border: "border-violet-800" },
      "تم التحديد":       { bg: "bg-blue-950",    text: "text-blue-400",    border: "border-blue-800" },
      "مغلق":             { bg: "bg-slate-800",   text: "text-slate-500",   border: "border-slate-700" },
      "مُصعَّد":           { bg: "bg-red-950",     text: "text-red-400",     border: "border-red-800" },
      "مرفوض":            { bg: "bg-red-950",     text: "text-red-400",     border: "border-red-800" },
      // Arabic — legacy values (backwards compat)
      "مسودة":            { bg: "bg-slate-800",   text: "text-slate-400",   border: "border-slate-700" },
      "مُحدَّد":           { bg: "bg-blue-950",    text: "text-blue-400",    border: "border-blue-800" },
      "مُخطَّط / مُعتمَد": { bg: "bg-violet-950",  text: "text-violet-400",  border: "border-violet-800" },
      "قيد التنفيذ":      { bg: "bg-cyan-950",    text: "text-cyan-400",    border: "border-cyan-800" },
      "مُراقَب":           { bg: "bg-emerald-950", text: "text-emerald-400", border: "border-emerald-800" },
      "مُغلَق":            { bg: "bg-slate-800",   text: "text-slate-500",   border: "border-slate-700" },
      // English (from backend / RiskContext)
      "IDENTIFIED":         { bg: "bg-blue-950",    text: "text-blue-400",    border: "border-blue-800" },
      "IN_PROGRESS":        { bg: "bg-cyan-950",    text: "text-cyan-400",    border: "border-cyan-800" },
      "MONITORED":          { bg: "bg-emerald-950", text: "text-emerald-400", border: "border-emerald-800" },
      "PLANNED":            { bg: "bg-violet-950",  text: "text-violet-400",  border: "border-violet-800" },
      "CLOSED":             { bg: "bg-slate-800",   text: "text-slate-500",   border: "border-slate-700" },
      "ESCALATED":          { bg: "bg-red-950",     text: "text-red-400",     border: "border-red-800" },
      "Draft":              { bg: "bg-slate-800",   text: "text-slate-400",   border: "border-slate-700" },
      "Identified":         { bg: "bg-blue-950",    text: "text-blue-400",    border: "border-blue-800" },
      "Under Analysis":     { bg: "bg-amber-950",   text: "text-amber-400",   border: "border-amber-800" },
      "Planned / Approved": { bg: "bg-violet-950",  text: "text-violet-400",  border: "border-violet-800" },
      "In Progress":        { bg: "bg-cyan-950",    text: "text-cyan-400",    border: "border-cyan-800" },
      "Monitored":          { bg: "bg-emerald-950", text: "text-emerald-400", border: "border-emerald-800" },
      "Closed":             { bg: "bg-slate-800",   text: "text-slate-500",   border: "border-slate-700" },
      "Rejected":           { bg: "bg-red-950",     text: "text-red-400",     border: "border-red-800" },
    };
    const c = colorMap[status] || colorMap["مسودة"];
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>{status || "مسودة"}</span>;
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="primary" size="sm" icon={Plus} onClick={() => setShowAddRisk(true)}>إضافة خطر</Btn>
          <Btn variant="amber" size="sm" icon={Sparkles} onClick={() => navigate('/ai-risk')}>توليد خطر بالذكاء الاصطناعي</Btn>
          <Btn variant="outline" size="sm" icon={Download} onClick={async () => {
            toast.success('جارٍ إنشاء ملف PDF...');
            const { exportToPDF } = await import('../utils/exportUtils');
            const cols = [
              { label: 'رقم الخطر', accessor: 'id' },
              { label: 'التاريخ', accessor: 'date' },
              { label: 'الإدارة', accessor: 'department' },
              { label: 'نوع الخطر', accessor: 'riskType' },
              { label: 'اسم الخطر', accessor: 'riskName' },
              { label: 'الخطر الكامن', accessor: (r) => `${r.inherentScore || 0} (${r.inherentLabel || '—'})` },
              { label: 'الخطر المتبقي', accessor: (r) => `${r.residualScore || 0} (${r.residualLabel || '—'})` },
              { label: 'الحالة', accessor: (r) => r.lifecycleStatus || r.status || '—' },
              { label: 'رائد الخطر', accessor: 'owner' },
            ];
            const ok = await exportToPDF(filtered, cols, 'risk-register', { title: 'سجل المخاطر المؤسسي — Risk Register' });
            if (ok) toast.success('تم فتح صفحة الطباعة ✅ — اختر "حفظ PDF" من نافذة الطباعة');
            else toast.error('فشل إنشاء ملف PDF');
          }}>تصدير PDF</Btn>
          <Btn variant="ghost" size="sm" icon={Download} onClick={async () => {
            toast.success('جارٍ تصدير CSV...');
            const { exportToCSV } = await import('../utils/exportUtils');
            const cols = [
              { label: 'رقم الخطر', accessor: 'id' },
              { label: 'التاريخ', accessor: 'date' },
              { label: 'اسم الخطر', accessor: 'riskName' },
              { label: 'الوصف', accessor: 'description' },
              { label: 'الإدارة', accessor: 'department' },
              { label: 'نوع الخطر', accessor: 'riskType' },
              { label: 'درجة كامنة', accessor: 'inherentScore' },
              { label: 'تصنيف كامن', accessor: 'inherentLabel' },
              { label: 'درجة متبقية', accessor: 'residualScore' },
              { label: 'تصنيف متبقي', accessor: 'residualLabel' },
              { label: 'الحالة', accessor: (r) => r.lifecycleStatus || r.status || '—' },
              { label: 'رائد الخطر', accessor: 'owner' },
              { label: 'نوع الاستجابة', accessor: 'responseType' },
            ];
            const ok = exportToCSV(filtered, cols, 'risk-register');
            if (ok) toast.success('تم تصدير CSV بنجاح ✅');
            else toast.error('فشل تصدير CSV');
          }}>تصدير CSV</Btn>
          <Btn variant="ghost" size="sm" icon={FileText} onClick={async () => {
            toast.success('جارٍ تصدير DOCX...');
            const { exportToDocx } = await import('../utils/exportUtils');
            const cols = [
              { label: 'رقم الخطر', accessor: 'id' },
              { label: 'التاريخ', accessor: 'date' },
              { label: 'الإدارة', accessor: 'department' },
              { label: 'نوع الخطر', accessor: 'riskType' },
              { label: 'اسم الخطر', accessor: 'riskName' },
              { label: 'الخطر الكامن', accessor: (r) => `${r.inherentScore || 0}` },
              { label: 'الخطر المتبقي', accessor: (r) => `${r.residualScore || 0}` },
              { label: 'الحالة', accessor: (r) => r.lifecycleStatus || r.status || '—' },
              { label: 'رائد الخطر', accessor: 'owner' },
            ];
            const ok = exportToDocx(filtered, cols, 'risk-register', { title: 'سجل المخاطر المؤسسي — Risk Register' });
            if (ok) toast.success('تم تصدير DOCX بنجاح ✅');
            else toast.error('فشل تصدير DOCX');
          }}>تصدير DOCX</Btn>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 tracking-wide">سجل المخاطر المؤسسي</p>
          <p className="text-lg font-bold text-white mt-0.5">المستودع المركزي لحوكمة المخاطر</p>
        </div>
      </div>

      <AddRiskModal
        isOpen={showAddRisk}
        onClose={() => setShowAddRisk(false)}
        onSave={(newRisk) => addRisk(newRisk)}
        lang="ar"
      />

      {/* View Tabs */}
      <div className="flex items-center gap-2 justify-end">
        {[
          { id: "all", label: "جميع المخاطر", count: risks.length },
          { id: "pending", label: "بانتظار الاعتماد", count: risks.filter(r => r.status === "Identified" || r.status === "مُحدَّد").length },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setViewTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border
              ${viewTab === tab.id
                ? "bg-cyan-950 text-cyan-400 border-cyan-800"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"}`}>
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono
              ${viewTab === tab.id ? "bg-cyan-900 text-cyan-300" : "bg-slate-800 text-slate-500"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Stats — Clickable Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "إجمالي المخاطر", value: risks.length, color: "text-white", filterKey: "all" },
          { label: "كارثية", value: risks.filter(r => (r.inherentScore || r.score || 0) >= 20).length, color: "text-red-400", filterKey: "catastrophic" },
          { label: "عالية", value: risks.filter(r => { const s = r.inherentScore || r.score || 0; return s >= 15 && s < 20; }).length, color: "text-orange-400", filterKey: "high" },
          { label: "متوسط الخطر الكامن", value: Math.round(risks.reduce((a, r) => a + (r.inherentScore || r.score || 0), 0) / risks.length), color: "text-amber-400", filterKey: "medium" },
        ].map((s, i) => (
          <Card key={i}
            className={`text-center py-3 cursor-pointer transition-all hover:scale-[1.02] ${activeCardFilter === s.filterKey ? 'ring-2 ring-cyan-500 ring-offset-1 ring-offset-slate-900' : ''}`}
            onClick={() => setActiveCardFilter(activeCardFilter === s.filterKey ? 'all' : s.filterKey)}
          >
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Severity Filter + Active Filter Indicators */}
      <div className="flex items-center gap-3 justify-end">
        {(activeCardFilter !== 'all' || severityFilter.length > 0) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-cyan-400">تصفية نشطة: {activeCardFilter !== 'all' ? activeCardFilter : ''} {severityFilter.join(', ')}</span>
            <button onClick={() => { setActiveCardFilter('all'); setSeverityFilter([]); }} className="text-slate-500 hover:text-white text-[10px]">✕ إزالة</button>
          </div>
        )}
        <div className="relative">
          <button onClick={() => setShowSevDropdown(!showSevDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 transition-colors">
            <Filter size={12} /> الخطورة {severityFilter.length > 0 && <span className="bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{severityFilter.length}</span>}
          </button>
          {showSevDropdown && (
            <div className="absolute top-full mt-1 right-0 z-20 w-52 rounded-xl border border-slate-700 bg-slate-900 p-2 space-y-0.5 shadow-xl">
              {[{v:'كارثي',l:'كارثي',color:'text-red-400'},{v:'عالي',l:'عالي',color:'text-orange-400'},{v:'متوسط',l:'متوسط',color:'text-amber-400'},{v:'منخفض',l:'منخفض',color:'text-emerald-400'}].map(sev => (
                <label key={sev.v} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs" style={{direction:'rtl'}}>
                  <input type="checkbox" checked={severityFilter.includes(sev.v)}
                    onChange={() => setSeverityFilter(prev => prev.includes(sev.v) ? prev.filter(s => s !== sev.v) : [...prev, sev.v])}
                    className="rounded" />
                  <span className={sev.color}>{sev.l}</span>
                </label>
              ))}
              <button onClick={() => { setSeverityFilter([]); setShowSevDropdown(false); }} className="w-full text-center text-[10px] text-slate-500 hover:text-white py-1 mt-1 border-t border-slate-800">إعادة تعيين</button>
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 border border-slate-700 rounded-lg px-3 py-2" style={{ background: "rgba(15,23,42,0.8)" }}>
          <input
            className="bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none w-56 text-right"
            placeholder="فلترة حسب رقم الخطر، الاسم، أو الكلمة المفتاحية..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Filter size={12} className="text-slate-500" />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-xs" style={{ direction: "rtl" }}>
            <thead>
              <tr className="border-b border-slate-800" style={{ background: "rgba(15,23,42,0.9)" }}>
                {[
                  { label: "رقم الخطر", key: "id" },
                  { label: "التاريخ", key: "date" },
                  { label: "الإدارة", key: "department" },
                  { label: "نوع الخطر", key: "riskType" },
                  { label: "اسم الخطر", key: "riskName", wide: true },
                  { label: "الخطر الكامن", key: "inherentScore" },
                  { label: "الخطر المتبقي", key: "residualScore" },
                  { label: "الحالة", key: "status" },
                  { label: "نوع الاستجابة", key: "responseType" },
                  { label: viewTab === "pending" ? "الإجراءات" : "الإجراء الحالي", key: null },
                ].map(h => (
                  <th key={h.label}
                    onClick={() => h.key && handleSort(h.key)}
                    className={`px-3 py-3 text-right font-semibold text-slate-500 text-[10px] tracking-wider whitespace-nowrap ${h.key ? 'cursor-pointer select-none hover:text-cyan-400 hover:bg-slate-800/40 transition-colors' : ''}`}>
                    <div className="flex items-center gap-1 justify-end">
                      {h.key && (
                        <span className={`transition-colors ${sortConfig.key === h.key ? 'text-cyan-400' : 'text-slate-700'}`}>
                          {sortConfig.key === h.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      )}
                      {h.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id}
                  onClick={() => onSelectRisk && onSelectRisk(r)}
                  className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-slate-900/20"}`}>
                  {/* رقم الخطر */}
                  <td className="px-3 py-3.5 font-mono font-bold text-cyan-400 whitespace-nowrap" style={{ direction: "ltr" }}>{r.id}</td>
                  {/* التاريخ */}
                  <td className="px-3 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap" style={{ direction: "ltr" }}>{r.date || "—"}</td>
                  {/* الإدارة */}
                  <td className="px-3 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center gap-1.5 justify-end" style={{direction:'rtl'}}>
                      {catIcon(r.department || r.riskType || r.category)}
                      <span className="text-slate-400 text-[11px]">{r.department || r.category}</span>
                    </div>
                  </td>
                  {/* نوع الخطر */}
                  <td className="px-3 py-3.5 whitespace-nowrap text-right">
                    <span className="text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                      {r.riskType || r.category || "—"}
                    </span>
                  </td>
                  {/* اسم الخطر — عريض */}
                  <td className="px-3 py-3.5 text-slate-300 text-right" style={{minWidth: 280, maxWidth: 380}}>
                    <span className="line-clamp-2 font-medium text-[12px] leading-relaxed">{r.riskName || r.description}</span>
                  </td>
                  {/* الخطر الكامن */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    {scoreBadge(r.inherentScore, r.inherentLabel || r.inherent, r.inherentColor)}
                  </td>
                  {/* الخطر المتبقي */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    {scoreBadge(r.residualScore, r.residualLabel || r.residual, r.residualColor)}
                  </td>
                  {/* الحالة */}
                  <td className="px-3 py-3.5 whitespace-nowrap text-right">
                    {statusBadge(r.lifecycleStatus || r.status)}
                  </td>
                  {/* نوع الاستجابة */}
                  <td className="px-3 py-3.5 whitespace-nowrap text-right">
                    {r.responseType ? (
                      <span className="text-[11px] text-violet-300 bg-violet-950 border border-violet-800 px-2 py-0.5 rounded">
                        {r.responseType}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[10px]">—</span>
                    )}
                  </td>
                  {/* الذكاء الاصطناعي / الإجراءات */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    {viewTab === "pending" ? (
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={(e) => { e.stopPropagation(); updateRiskStatus(r.id, "Planned / Approved"); toast.success(`تم اعتماد الخطر ${r.id}`); }}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-colors">
                          ✅ اعتماد
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); updateRiskStatus(r.id, "Rejected"); toast.warning(`تم رفض الخطر ${r.id}`); }}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-950 text-red-400 border border-red-800 hover:bg-red-900 transition-colors">
                          ❌ رفض
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className={`text-[10px] font-semibold ${aiColor(r.aiColor)}`}>{r.aiStatus}</span>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotColor(r.aiColor)}`} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between" style={{ background: "rgba(15,23,42,0.5)" }}>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(p => (
              <button key={p} onClick={() => toast.info(`الصفحة ${p} — عرض البيانات التجريبية (الصفحة 1 فقط)`)} className={`w-7 h-7 rounded text-[11px] transition-colors ${p === 1 ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:bg-slate-800"}`}>{p}</button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 text-right">
            عرض {filtered.length} من {risks.length} مخاطر · آخر تحديث: <span className="text-cyan-400">22/03/2026 09:14 UTC</span>
          </p>
        </div>
      </Card>
    </div>
  );
};

// ─── VIEW 3: SITUATION ROOM ───────────────────────────────────────────────────
const SituationRoomView = () => {
  const toast = useToast();
  const [elapsed, setElapsed] = useState(4472);
  const [playbooks, setPlaybooks] = useState({ iso: false, notify: false, failover: false });

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const tlColors = {
    red: { dot: "bg-red-500", line: "border-red-900/60", text: "text-red-400" },
    amber: { dot: "bg-amber-500", line: "border-amber-900/60", text: "text-amber-400" },
    blue: { dot: "bg-blue-500", line: "border-blue-900/60", text: "text-blue-400" },
    emerald: { dot: "bg-emerald-500", line: "border-emerald-900/60", text: "text-emerald-400" },
  };

  const PlaybookToggle = ({ id, label, sublabel, rto, icon: Icon }) => {
    const active = playbooks[id];
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 cursor-pointer
        ${active ? "border-emerald-700/60" : "border-slate-800 hover:border-slate-700"}`}
        style={{ background: active ? "rgba(6,78,59,0.2)" : "rgba(15,23,42,0.6)" }}
        onClick={() => setPlaybooks(p => ({ ...p, [id]: !p[id] }))}>
        <div className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center px-0.5 flex-shrink-0 ${active ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"}`}>
          <div className="w-4 h-4 bg-white rounded-full shadow" />
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className={`text-[12px] font-semibold ${active ? "text-emerald-300" : "text-slate-300"}`}>{label}</p>
            <p className="text-[10px] text-slate-500">{sublabel} {rto && <span className="text-slate-600 mr-1">{rto}</span>}</p>
          </div>
          <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${active ? "bg-emerald-900/60 border border-emerald-700/50" : "bg-slate-800 border border-slate-700"}`}>
            <Icon size={13} className={active ? "text-emerald-400" : "text-slate-500"} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 fade-in">
      {/* Alert Banner */}
      <div className="rounded-xl border border-red-700 p-4 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, rgba(69,10,10,0.75) 0%, rgba(127,29,29,0.2) 100%)" }}>
        <div className="text-left flex-shrink-0">
          <p className="text-[10px] text-slate-500">الوقت المنقضي</p>
          <p className="text-3xl font-black text-red-400 font-mono">{fmt(elapsed)}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] text-red-400">العداد يعمل</span>
            <PulsingDot color="red" />
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[9px] text-slate-500">INC-2026-0322-001</span>
              <span className="text-[9px] font-bold text-red-400 border border-red-700 px-2 py-0.5 rounded animate-pulse" style={{ background: "rgba(69,10,10,0.6)" }}>
                ● محاكاة نشطة
              </span>
            </div>
            <p className="text-red-100 font-bold text-sm mt-1">هجوم برامج الفدية على أنظمة الخدمات المصرفية الأساسية</p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(252,165,165,0.7)" }}>النطاق: البنية التحتية المصرفية · الخطورة: P1-حرج · إشعار GDPR مطلوب</p>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(127,29,29,0.6)", border: "1px solid rgba(185,28,28,0.7)" }}>
            <AlertTriangle size={18} className="text-red-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Command Center */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Timeline */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PulsingDot color="red" />
              <span className="text-[10px] text-red-400">مباشر</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 tracking-wide">الجدول الزمني للحادث</p>
              <p className="text-sm font-semibold text-white mt-0.5">بث الأحداث المباشرة · زمنياً</p>
            </div>
          </div>

          <div className="space-y-0 relative overflow-y-auto max-h-[380px] pl-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
            {timelineEvents.map((ev, i) => {
              const c = tlColors[ev.color];
              const isLast = i === timelineEvents.length - 1;
              return (
                <div key={i} className="flex gap-4 flex-row-reverse">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${c.dot} z-10`}>
                      <ev.icon size={12} className="text-white" />
                    </div>
                    {!isLast && <div className={`w-px flex-1 border-r border-dashed ${c.line} min-h-[24px] mt-1`} />}
                  </div>
                  <div className="pb-5 flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      {isLast && <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">أحدث</span>}
                      <p className={`text-[11px] font-mono font-bold ${c.text}`}>{ev.time}</p>
                    </div>
                    <p className="text-[13px] font-semibold text-white leading-snug">{ev.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{ev.detail}</p>
                  </div>
                </div>
              );
            })}
            {/* Typing */}
            <div className="flex gap-4 flex-row-reverse">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <span className="flex gap-0.5">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </span>
                </div>
              </div>
              <div className="pb-3 text-right">
                <p className="text-[10px] text-slate-600">محرك الذكاء الاصطناعي يعالج الحقن التالي...</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Heatmap + Playbooks */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <Btn variant="ghost" size="xs" icon={Crosshair} onClick={() => toast.info('تم تفعيل وضع التركيز — تكبير المنطقة عالية الخطورة')}>وضع التركيز</Btn>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 tracking-wide">خريطة حرارة التهديدات</p>
                <p className="text-sm font-semibold text-white mt-0.5">مصفوفة التأثير × الاحتمالية</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={185}>
              <ScatterChart margin={{ top: 5, right: 15, bottom: 15, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="x" domain={[0, 1]} name="الاحتمالية"
                  tick={{ fill: "#64748b", fontSize: 9 }} tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                  label={{ value: "← الاحتمالية →", position: "insideBottom", offset: -10, fill: "#475569", fontSize: 9 }}
                  axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="y" domain={[0, 1]} name="التأثير"
                  tick={{ fill: "#64748b", fontSize: 9 }} tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                  label={{ value: "التأثير", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 9 }}
                  axisLine={false} tickLine={false} />
                <ReferenceLine x={0.5} stroke="#334155" strokeDasharray="3 3" />
                <ReferenceLine y={0.5} stroke="#334155" strokeDasharray="3 3" />
                <Tooltip content={<ScatterTooltip />} />
                <Scatter data={scatterData} shape={(props) => {
                  const { cx, cy, payload } = props;
                  const isHot = payload.x > 0.6 && payload.y > 0.6;
                  const isMed = payload.x > 0.4 || payload.y > 0.4;
                  const color = isHot ? "#ef4444" : isMed ? "#f59e0b" : "#10b981";
                  const r = isHot ? 10 : 7;
                  return (
                    <g>
                      {isHot && <circle cx={cx} cy={cy} r={r + 6} fill={color} opacity={0.15} />}
                      <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.8} />
                    </g>
                  );
                }} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-end gap-3 mt-1 text-[9px] text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />منطقة مُدارة</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />منطقة متوسطة</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />منطقة حرجة</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="warning">3 معلقة</Badge>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 tracking-wide">دفاتر الاستجابة الآلية</p>
                <p className="text-sm font-semibold text-white mt-0.5">إجراءات موصى بها بالذكاء الاصطناعي</p>
              </div>
            </div>
            <div className="space-y-2">
              <PlaybookToggle id="iso" icon={Network} label="عزل شبكات المنطقة الأوروبية"
                sublabel="SOAR · جدار الحماية · BGP Blackhole" rto="آلي" />
              <PlaybookToggle id="notify" icon={ShieldCheck} label="مسودة إشعار الجهة التنظيمية (سما)"
                sublabel="النموذج SN-201 · إشعار الاختراق" rto="مهلة: 2 ساعة" />
              <PlaybookToggle id="failover" icon={Server} label="التحويل للموقع الاحتياطي الإقليمي"
                sublabel="الاستعداد الساخن · DR-SITE-EU-02" rto="RTO: 4 ساعات" />
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <Btn variant="ghost" size="sm" icon={Terminal} onClick={() => toast.info('جارٍ فتح سجلات تنفيذ دفاتر التشغيل…')}>سجلات دفتر التشغيل</Btn>
              <Btn variant="danger" size="sm" icon={Zap} onClick={() => { setPlaybooks({ iso: true, notify: true, failover: true }); toast.success('تم تفعيل جميع الدفاتر الثلاثة — التنفيذ الذكي جارٍ'); }}>تنفيذ جميع النشطة</Btn>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600">
              <span className="text-cyan-400">{Object.values(playbooks).filter(Boolean).length > 0 ? "التنفيذ الذكي جارٍ..." : "بانتظار موافقة قائد الحادث"}</span>
              <span>{Object.values(playbooks).filter(Boolean).length}/3 دفاتر مُفعَّلة</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "نافذة إشعار GDPR", value: "ت-46:23", color: "text-red-400", sub: "نافذة 72 ساعة · خرق مؤكد", icon: Clock },
          { label: "هدف وقت الاسترداد", value: "ت+3:52", color: "text-amber-400", sub: "هدف 4 ساعات · في المسار", icon: Target },
          { label: "فريق الأزمة النشط", value: "11", color: "text-cyan-400", sub: "IC + غرفة الحرب + SecOps", icon: Crosshair },
        ].map((s, i) => (
          <Card key={i} className="flex items-center gap-3">
            <div className="flex-1 text-right">
              <p className="text-[10px] text-slate-500">{s.label}</p>
              <p className={`text-xl font-black font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{s.sub}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              <s.icon size={16} className={s.color} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── VIEW: BIA MODULE (Arabic) ────────────────────────────────────────────────
const BIAViewAR = () => {
  const toast = useToast();
  const { assessments, getProcessesForAssessment, approveStep, rejectStep, addAssessment } = useBIA();
  const [biaSubTab, setBiaSubTab] = useState("assessments");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showProcessForm, setShowProcessForm] = useState(false);

  const subTabs = [
    { id: "assessments", label: "دورات التقييم" },
    { id: "processes", label: "العمليات الحيوية" },
    { id: "impact", label: "مصفوفة التأثير" },
    { id: "dependencies", label: "الاعتماديات" },
    { id: "workflow", label: "سير العمل" },
    { id: "consolidated", label: "التقرير المجمع" },
    { id: "bcp", label: "خطط BCP", badge: "ISO" },
  ];

  const procs = selectedAssessment ? getProcessesForAssessment(selectedAssessment.id) : [];

  const handleApprove = (stepId) => { approveStep(stepId); toast.success("تم الاعتماد"); };
  const handleReject = (stepId) => {
    const reason = prompt("أدخل سبب الرفض:");
    if (reason) { rejectStep(stepId, reason); toast.warning("تم الرفض"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide flex-row-reverse">
        {subTabs.map((tab) => (
          <button key={tab.id} onClick={() => setBiaSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border
              ${biaSubTab === tab.id ? "bg-cyan-950 text-cyan-400 border-cyan-800" : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"}`}>
            {tab.label}
            {tab.badge && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(14,165,233,0.15))', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.3)' }}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {selectedAssessment && biaSubTab !== "assessments" && biaSubTab !== "consolidated" && (
        <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-xs flex-row-reverse">
          <div className="flex items-center gap-2 flex-row-reverse">
            <span className="text-slate-500">التقييم:</span>
            <span className="font-mono text-cyan-400 font-bold">{selectedAssessment.id}</span>
            <span className="text-slate-300">{selectedAssessment.title}</span>
          </div>
          <button onClick={() => { setSelectedAssessment(null); setBiaSubTab("assessments"); }} className="text-slate-500 hover:text-white text-[10px]">✕ مسح</button>
        </div>
      )}

      {(biaSubTab === "impact" || biaSubTab === "dependencies") && selectedAssessment && !selectedProcess && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 text-right">اختر عملية لعرض التفاصيل:</p>
          {procs.map((p) => (
            <button key={p.id} onClick={() => setSelectedProcess(p)}
              className="w-full text-right px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-800 transition-colors">
              <span className="text-xs font-mono text-cyan-400">{p.id}</span>
              <span className="text-xs text-slate-300 mr-2">{p.process_name}</span>
              <span className="text-[10px] text-slate-500 mr-2">RTO: {p.rto_hours}h · MTPD: {p.mtpd_hours}h</span>
            </button>
          ))}
          {procs.length === 0 && <p className="text-xs text-slate-500 text-right">لا توجد عمليات في هذا التقييم.</p>}
        </div>
      )}

      {biaSubTab === "assessments" && (
        <BIAAssessmentList lang="ar"
          onSelectAssessment={(a) => { setSelectedAssessment(a); setSelectedProcess(null); setBiaSubTab("processes"); }}
          onCreateNew={() => {
            const newAsm = addAssessment({
              title: `تقييم BIA — ${new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}`,
              titleEn: `BIA Assessment — ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`,
              department_id: 'IT',
              fiscal_year: 2026,
            });
            toast.success(`تم إنشاء دورة تقييم جديدة: ${newAsm.id}`);
            setSelectedAssessment(newAsm);
            setSelectedProcess(null);
            setBiaSubTab("processes");
          }} />
      )}

      {biaSubTab === "processes" && selectedAssessment && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-row-reverse">
            <p className="text-sm font-bold text-white">{selectedAssessment.title} — العمليات الحيوية</p>
            <button onClick={() => setShowProcessForm(!showProcessForm)}
              className="px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg">
              {showProcessForm ? "إغلاق النموذج" : "+ إضافة عملية"}
            </button>
          </div>
          {showProcessForm && <BIAProcessForm assessmentId={selectedAssessment.id} lang="ar" onSave={() => setShowProcessForm(false)} onCancel={() => setShowProcessForm(false)} />}
          {procs.map((p) => (
            <div key={p.id} onClick={() => { setSelectedProcess(p); setBiaSubTab("impact"); }}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-600 cursor-pointer transition-all">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="text-right">
                  <span className="text-xs font-mono text-cyan-400 font-bold">{p.id}</span>
                  <p className="text-sm text-white font-semibold mt-0.5">{p.process_name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="text-red-400">MTPD {p.mtpd_hours}h</span>
                    <span className="text-amber-400">RTO {p.rto_hours}h</span>
                    <span className="text-cyan-400">RPO {p.rpo_hours}h</span>
                  </div>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border
                    ${p.criticality_level === "CRITICAL" ? "text-red-400 bg-red-950 border-red-800" :
                      p.criticality_level === "HIGH" ? "text-amber-400 bg-amber-950 border-amber-800" :
                      "text-emerald-400 bg-emerald-950 border-emerald-800"}`}>
                    {p.criticality_level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {biaSubTab === "impact" && selectedProcess && (
        <div className="space-y-3">
          <button onClick={() => setSelectedProcess(null)} className="text-[10px] text-slate-500 hover:text-white">→ العودة لقائمة العمليات</button>
          <BIAImpactMatrix processId={selectedProcess.id} lang="ar" />
        </div>
      )}

      {biaSubTab === "dependencies" && selectedProcess && (
        <div className="space-y-3">
          <button onClick={() => setSelectedProcess(null)} className="text-[10px] text-slate-500 hover:text-white">→ العودة لقائمة العمليات</button>
          <BIADependencyMap processId={selectedProcess.id} lang="ar" />
        </div>
      )}

      {biaSubTab === "workflow" && selectedAssessment && (
        <BIAWorkflowTracker assessmentId={selectedAssessment.id} lang="ar" onApprove={handleApprove} onReject={handleReject} />
      )}

      {biaSubTab === "consolidated" && <BIAConsolidatedReport lang="ar" />}

      {biaSubTab === "bcp" && <BCPListTab lang="ar" />}

      {!selectedAssessment && biaSubTab !== "assessments" && biaSubTab !== "consolidated" && biaSubTab !== "bcp" && (
        <div className="text-center py-12 text-slate-500">
          <Database size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-sm">اختر دورة تقييم أولاً</p>
          <button onClick={() => setBiaSubTab("assessments")} className="mt-2 text-xs text-cyan-400 hover:underline">← الذهاب لقائمة التقييمات</button>
        </div>
      )}
    </div>
  );
};

// ─── VIEW: SUMOOD INDEX (Arabic) ──────────────────────────────────────────────
const SumoodViewAR = () => {
  const [sumoodSubTab, setSumoodSubTab] = useState("dashboard");

  const subTabs = [
    { id: "dashboard", label: "لوحة المعلومات" },
    { id: "assessment", label: "التقييم الذاتي" },
    { id: "gap", label: "تحليل الفجوات" },
    { id: "documents", label: "مطابقة المستندات", badge: "AI" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 flex-row-reverse">
        {subTabs.map((tab) => (
          <button key={tab.id} onClick={() => setSumoodSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border
              ${sumoodSubTab === tab.id ? "bg-violet-950 text-violet-400 border-violet-800" : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"}`}>
            {tab.label}
            {tab.badge && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.15))', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>{tab.badge}</span>}
          </button>
        ))}
      </div>
      {sumoodSubTab === "dashboard" && <SumoodDashboard lang="ar" />}
      {sumoodSubTab === "assessment" && <SumoodSelfAssessment lang="ar" />}
      {sumoodSubTab === "gap" && <SumoodGapAnalysis lang="ar" />}
      {sumoodSubTab === "documents" && <SumoodDocumentCompliance lang="ar" />}
    </div>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AutoResilienceAR() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedRisk, setSelectedRisk] = useState(null);

  // Read hash from URL for tab navigation (driven by AppShell sidebar)
  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    if (hash && ["dashboard", "register", "matrix", "situation", "bia", "sumood"].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  return (
    <>
      <StyleTag />
      <div className="min-h-screen bg-transparent" style={{ direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', system-ui, sans-serif" }}>
        {/* Grid BG */}
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.015) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }} />
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          background: "radial-gradient(ellipse 80% 50% at 80% -10%, rgba(6,182,212,0.06) 0%, transparent 60%)",
        }} />

        <main className="flex-1 flex flex-col min-h-screen relative z-10 w-full overflow-hidden">


          <div className="flex-1 p-4 md:p-6 overflow-x-hidden">
            {activeTab === "dashboard" && <ExecutiveDashboard lang="ar" onNavigate={setActiveTab} />}
            {activeTab === "register" && <RiskRegisterView onSelectRisk={setSelectedRisk} />}
            {activeTab === "matrix" && <RiskMatrix lang="ar" />}
            {activeTab === "situation" && <SituationRoomView />}

            {activeTab === "bia" && <BIAViewAR />}
            {activeTab === "sumood" && <SumoodViewAR />}
          </div>

          <div className="border-t border-slate-800/60 px-6 py-2 flex items-center justify-between text-[10px] text-slate-600" style={{ background: "rgba(2,8,23,0.8)" }}>
            <div className="flex items-center gap-4">
              <span className="text-cyan-600">النسخة المؤسسية 2026 ·</span>
              <span>منصة جاهزية للذكاء الاصطناعي · الإصدار 4.2.1</span>
            </div>
            <div className="flex items-center gap-4">
              <span>محرك SOAR: <span className="text-emerald-500">يعمل</span></span>
              <span>بث SIEM: <span className="text-slate-400">نشط</span></span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />API متصل · 12ms زمن استجابة</span>
            </div>
          </div>
        </main>

        {/* Risk Detail Drawer — outside main to avoid stacking context */}
        <RiskDetailDrawer risk={selectedRisk} onClose={() => setSelectedRisk(null)} />
      </div>
    </>
  );
}
