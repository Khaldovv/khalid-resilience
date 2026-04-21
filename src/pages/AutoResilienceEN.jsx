import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";

import RiskDetailDrawer from "../components/RiskDetailDrawer";
import AddRiskModal from "../components/AddRiskModal";
import RiskMatrix from "../components/RiskMatrix";
import { useRisks } from "../context/RiskContext";
import { useToast } from "../components/ToastProvider";
import { useCrisis } from "../context/CrisisContext";
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
  Settings, Bell, Search, TrendingDown, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, Zap, Globe, Lock, Database, Server,
  ChevronRight, Play, Download, Filter, RefreshCw, Eye,
  Network, Shield, XCircle, AlertCircle, Radio, BarChart3,
  ArrowUpRight, ArrowDownRight, Cpu, GitBranch, Terminal,
  Layers, Target, Wifi, WifiOff, CircleDot, Crosshair, Menu, Bot
} from "lucide-react";
import {
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Area, AreaChart, ReferenceLine
} from "recharts";

// ─── Color Palette ───────────────────────────────────────────────────────────
const C = {
  bg950: "#020817", bg900: "#0a1628", bg800: "#0f1f3d", bg700: "#1a2d4f",
  slate800: "#1e293b", slate700: "#334155", slate600: "#475569",
  slate400: "#94a3b8", slate300: "#cbd5e1", slate200: "#e2e8f0",
  cyan500: "#06b6d4", cyan400: "#22d3ee", cyan300: "#67e8f9",
  red500: "#ef4444", red400: "#f87171", red900: "#450a0a",
  amber500: "#f59e0b", amber400: "#fbbf24",
  emerald500: "#10b981", emerald400: "#34d399",
  blue500: "#3b82f6", blue400: "#60a5fa",
  violet500: "#8b5cf6",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const riskTrendData = [
  { month: "Oct", inherent: 88, residual: 71 },
  { month: "Nov", inherent: 85, residual: 68 },
  { month: "Dec", inherent: 91, residual: 74 },
  { month: "Jan", inherent: 87, residual: 69 },
  { month: "Feb", inherent: 82, residual: 65 },
  { month: "Mar", inherent: 79, residual: 61 },
];

const complianceData = [
  { name: "ISO 22301", value: 96, color: C.emerald500 },
  { name: "SAMA", value: 91, color: C.cyan500 },
  { name: "GDPR", value: 88, color: C.blue500 },
  { name: "DPDP", value: 83, color: C.violet500 },
  { name: "SOC 2", value: 94, color: C.amber500 },
];

const scatterData = [
  { x: 0.9, y: 0.85, z: 20, name: "Ransomware" },
  { x: 0.75, y: 0.7, z: 15, name: "API Breach" },
  { x: 0.6, y: 0.9, z: 18, name: "Supply Chain" },
  { x: 0.45, y: 0.55, z: 10, name: "Compliance Drift" },
  { x: 0.3, y: 0.4, z: 8, name: "Ops Failure" },
  { x: 0.8, y: 0.3, z: 12, name: "3rd Party" },
  { x: 0.15, y: 0.7, z: 6, name: "Data Leak" },
];

const riskRegisterData = [
  {
    id: "RSK-1042", date: "2026-03-20", department: "IT", riskType: "Cybersecurity",
    category: "Cybersecurity", riskName: "Legacy API Data Exfiltration",
    description: "Potential data exfiltration via legacy third-party API endpoint",
    owner: "IT Security",
    inherentScore: 25, inherentLabel: "Catastrophic", inherentColor: "#7f1d1d",
    residualScore: 15, residualLabel: "High", residualColor: "#ef4444",
    inherent: "Critical", residual: "High",
    status: "In Progress", lifecycleStatus: "In Progress",
    aiStatus: "Quarantine Initiated", aiColor: "emerald", score: 94, delta: -3,
  },
  {
    id: "RSK-0891", date: "2026-03-18", department: "Operations", riskType: "Operational",
    category: "Operational", riskName: "APAC Logistics Hub SPOF",
    description: "Single point of failure in central logistics hub (APAC)",
    owner: "Ops VP",
    inherentScore: 16, inherentLabel: "High", inherentColor: "#ef4444",
    residualScore: 10, residualLabel: "Medium", residualColor: "#f97316",
    inherent: "High", residual: "Medium",
    status: "Monitored", lifecycleStatus: "Monitored",
    aiStatus: "Monitoring KRI", aiColor: "blue", score: 78, delta: +2,
  },
  {
    id: "RSK-0553", date: "2026-03-12", department: "Legal", riskType: "Compliance",
    category: "Compliance", riskName: "DPDP Data Residency Gap",
    description: "Non-adherence to DPDP data residency clauses — Q1 audit gap",
    owner: "Legal Dept",
    inherentScore: 12, inherentLabel: "Medium", inherentColor: "#f97316",
    residualScore: 6, residualLabel: "Low", residualColor: "#eab308",
    inherent: "Medium", residual: "Low",
    status: "Planned / Approved", lifecycleStatus: "Planned / Approved",
    aiStatus: "Audit Scheduled", aiColor: "amber", score: 52, delta: -8,
  },
  {
    id: "RSK-1108", date: "2026-03-15", department: "Finance", riskType: "Financial",
    category: "Financial", riskName: "FX Exposure in Emerging Markets",
    description: "FX volatility exposure in emerging market subsidiaries (>$200M)",
    owner: "CFO Office",
    inherentScore: 20, inherentLabel: "Catastrophic", inherentColor: "#7f1d1d",
    residualScore: 16, residualLabel: "High", residualColor: "#ef4444",
    inherent: "High", residual: "High",
    status: "In Progress", lifecycleStatus: "In Progress",
    aiStatus: "Escalated to Board", aiColor: "red", score: 81, delta: +5,
  },
  {
    id: "RSK-0774", date: "2026-03-10", department: "Strategy", riskType: "Geopolitical",
    category: "Geopolitical", riskName: "Taiwan Strait Supply Chain Risk",
    description: "APAC supply chain disruption — Taiwan Strait tension scenario",
    owner: "Strategy CRO",
    inherentScore: 25, inherentLabel: "Catastrophic", inherentColor: "#7f1d1d",
    residualScore: 12, residualLabel: "Medium", residualColor: "#f97316",
    inherent: "Critical", residual: "Medium",
    status: "Under Analysis", lifecycleStatus: "Under Analysis",
    aiStatus: "Simulation Active", aiColor: "violet", score: 88, delta: -1,
  },
  {
    id: "RSK-0620", date: "2026-03-08", department: "Marketing", riskType: "Reputational",
    category: "Reputational", riskName: "ESG Disclosure Gap",
    description: "Social media crisis vector — ESG disclosure gap identified",
    owner: "Comms Director",
    inherentScore: 10, inherentLabel: "Medium", inherentColor: "#f97316",
    residualScore: 4, residualLabel: "Very Low", residualColor: "#22c55e",
    inherent: "Medium", residual: "Low",
    status: "Closed", lifecycleStatus: "Closed",
    aiStatus: "Policy Updated", aiColor: "emerald", score: 44, delta: -12,
  },
];

const timelineEvents = [
  {
    time: "10:00 AM", icon: "alert", color: "red",
    title: "Initial Compromise Detected",
    detail: "DB servers encrypted — 14 nodes offline. RTO clock initiated.",
  },
  {
    time: "10:08 AM", icon: "cpu", color: "amber",
    title: "AI SOAR Isolation Triggered",
    detail: "Automated network segmentation executed. European cluster quarantined via SOAR playbook.",
  },
  {
    time: "10:15 AM", icon: "shield", color: "blue",
    title: "Incident Commander Assigned",
    detail: "Khalid Alghofaili activated as IC. War room channel established in SecureComms.",
  },
  {
    time: "10:22 AM", icon: "globe", color: "amber",
    title: "Threat Actor TTP Identified",
    detail: "NLP threat feed cross-references IOC cluster with LockBit 3.0 variant. Confidence: 92%.",
  },
  {
    time: "10:30 AM", icon: "database", color: "red",
    title: "Dark Web Exfiltration Signal",
    detail: "Customer PII dataset (~2.4M records) detected on underground forum. GDPR breach timer started.",
  },
  {
    time: "10:45 AM", icon: "check", color: "emerald",
    title: "Backup Failover Initiated",
    detail: "Regional hot-standby site activated. RTO 4h target — currently T+0:45. Recovery on track.",
  },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: BookOpen, label: "Risk Register", id: "register" },
  { icon: Crosshair, label: "Risk Matrix", id: "matrix" },
  { icon: Activity, label: "Crisis & Emergency Simulation", id: "situation" },
  { icon: ShieldCheck, label: "Regulatory Compliance", id: "compliance" },
  { icon: Database, label: "BIA Module", id: "bia" },
  { icon: Target, label: "Sumood Index", id: "sumood" },
];

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold font-mono tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = "", glow = false, onClick }) => (
  <div
    onClick={onClick}
    className={`rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300
      ${glow ? "shadow-lg shadow-cyan-500/5 border-slate-700" : ""}
      ${onClick ? "cursor-pointer hover:border-slate-600 hover:bg-slate-800/60" : ""}
      ${className}`}
  >
    {children}
  </div>
);

const Btn = ({ children, variant = "primary", size = "sm", onClick, className = "", icon: Icon }) => {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all duration-200 active:scale-95 whitespace-nowrap";
  const sizes = { xs: "px-2.5 py-1 text-[11px]", sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950",
    danger: "bg-red-600 hover:bg-red-500 text-white",
    ghost: "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700",
    outline: "border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white hover:bg-slate-800",
    amber: "bg-amber-600 hover:bg-amber-500 text-white",
    emerald: "bg-emerald-700 hover:bg-emerald-600 text-white",
  };
  return (
    <button onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
};

const Progress = ({ value, color = "cyan", className = "" }) => {
  const colors = {
    cyan: "bg-cyan-500", emerald: "bg-emerald-500",
    red: "bg-red-500", amber: "bg-amber-500",
  };
  return (
    <div className={`h-1.5 bg-slate-800 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-1000 ${colors[color]}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const PulsingDot = ({ color = "red" }) => {
  const colors = { red: "bg-red-500", amber: "bg-amber-500", emerald: "bg-emerald-500", cyan: "bg-cyan-500" };
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[color]} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${colors[color]}`} />
    </span>
  );
};

// ─── Custom Tooltip for Charts ────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-1.5 font-mono">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold text-white font-mono">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-slate-900 border border-red-800 rounded-lg p-2.5 shadow-xl text-xs">
      <p className="text-red-400 font-bold font-mono">{d?.name}</p>
      <p className="text-slate-400 mt-1">Likelihood: <span className="text-white font-mono">{(d?.x * 100).toFixed(0)}%</span></p>
      <p className="text-slate-400">Impact: <span className="text-white font-mono">{(d?.y * 100).toFixed(0)}%</span></p>
    </div>
  );
};

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const Sidebar = ({ activeNav, setActiveNav, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  const toast = useToast();
  const handleNav = (id) => {
    setActiveNav(id);
    if (id === "dashboard") setActiveTab("dashboard");
    if (id === "register") setActiveTab("register");
    if (id === "matrix") setActiveTab("matrix");
    if (id === "situation") setActiveTab("situation");
    if (id === "bia") setActiveTab("bia");
    if (id === "sumood") setActiveTab("sumood");
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
      <aside className={`fixed left-0 top-0 h-screen w-60 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ background: "linear-gradient(180deg, #020c1b 0%, #020817 100%)", borderRight: "1px solid #1e293b" }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)", boxShadow: "0 0 16px rgba(6,182,212,0.4)" }}>
              <Shield size={16} className="text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-slate-950" />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight leading-none">Khalid Resilience</p>
            <p className="text-cyan-400 text-[10px] font-mono tracking-widest mt-0.5">AI · PLATFORM</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <PulsingDot color="emerald" />
          <span className="text-[10px] text-emerald-400 font-mono">ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-slate-600 text-[10px] font-mono tracking-widest px-2 mb-2">NAVIGATION</p>
        {navItems.map(({ icon: Icon, label, id }) => {
          const isActive = activeNav === id;
          return (
            <button key={id} onClick={() => handleNav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group
                ${isActive
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}>
              <Icon size={15} className={isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"} />
              <span className="text-[13px] font-medium">{label}</span>
              {isActive && <ChevronRight size={12} className="ml-auto text-cyan-500" />}
              {id === "situation" && (
                <span className="ml-auto flex items-center gap-1">
                  <PulsingDot color="red" />
                </span>
              )}
            </button>
          );
        })}


      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
            KA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[12px] font-semibold truncate">Khalid Alghofaili</p>
            <p className="text-slate-500 text-[10px] truncate">Chief Risk Officer</p>
          </div>
          <button onClick={() => toast.info('Account settings — use the gear icon at bottom-right corner')} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <Settings size={14} />
          </button>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-600">CLEARANCE:</span>
          <span className="text-cyan-400 font-bold">LEVEL-5 · EXEC</span>
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
    { id: "dashboard", label: "Main Dashboard", icon: LayoutDashboard },
    { id: "register", label: "Risk Register", icon: BookOpen },
    { id: "matrix", label: "Risk Matrix", icon: Crosshair },
    { id: "situation", label: "Situation Room", icon: Activity },
    { id: "bia", label: "BIA Module", icon: Database },
    { id: "sumood", label: "Sumood Index", icon: Target },
  ];

  return (
    <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Header Bar */}
      <div className="flex items-center gap-4 px-4 md:px-6 py-3">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Menu size={20} />
        </button>
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/20 transition-all"
            placeholder="Search risks, policies, BIA assets, threat intel..."
            onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) { toast.info(`Search results for: "${e.target.value}"  —  feature coming soon`); } }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 font-mono border border-slate-700 px-1.5 py-0.5 rounded">⌘K</span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Live Status */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
            <PulsingDot color="cyan" />
            <div>
              <p className="text-[9px] text-slate-500 font-mono leading-none">LIVE SYSTEM STATUS</p>
              <p className="text-[11px] text-cyan-400 font-mono font-bold leading-none mt-0.5">
                {time.toLocaleTimeString("en-US", { hour12: false })} · UTC+3
              </p>
            </div>
          </div>

          {/* Threat Level */}
          <div className="hidden lg:flex items-center gap-1.5 bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">
            <AlertTriangle size={11} className="text-red-400" />
            <div>
              <p className="text-[9px] text-slate-500 font-mono">THREAT LEVEL</p>
              <p className="text-[11px] text-red-400 font-mono font-bold">ELEVATED</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 flex items-center justify-center bg-slate-900 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
              <Bell size={15} className="text-slate-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">3</span>
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Critical Alerts</p>
                  <Badge variant="critical">3 Unread</Badge>
                </div>
                {[
                  { icon: AlertTriangle, color: "text-red-400", title: "Ransomware simulation escalated", time: "2m ago" },
                  { icon: Shield, color: "text-amber-400", title: "GDPR breach notification window: T-48h", time: "18m ago" },
                  { icon: Zap, color: "text-cyan-400", title: "AI playbook auto-executed: Firewall rule 7B", time: "41m ago" },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50 cursor-pointer border-b border-slate-800/50"
                    onClick={() => { toast.warning(n.title); setNotifOpen(false); }}>
                    <n.icon size={13} className={`${n.color} mt-0.5 flex-shrink-0`} />
                    <div>
                      <p className="text-xs text-slate-200">{n.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}>
            KA
          </div>
        </div>
      </div>


    </div>
  );
};

// ─── VIEW 1: DASHBOARD ────────────────────────────────────────────────────────
const DashboardView = () => {
  const toast = useToast();
  const [animIn, setAnimIn] = useState(false);
  const [pollTick, setPollTick] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);

  // ─── Feature 5: Real-time Dashboard Polling (5s interval) ───
  useEffect(() => {
    const interval = setInterval(() => {
      setPollTick(t => t + 1);
      setLastRefresh(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    {
      label: "Enterprise Risk Score", value: "72", unit: "/100",
      sub: "Risk reduced 4% via automated mitigation",
      icon: Target, trend: "down", trendVal: "-4%", color: "amber",
      extra: <Progress value={72} color="amber" className="mt-2" />,
    },
    {
      label: "Active Anomalies", value: "3", unit: "",
      sub: "2 Critical · 1 High severity",
      icon: AlertCircle, trend: "up", trendVal: "+1", color: "red",
      extra: (
        <div className="mt-2 flex items-center gap-1.5">
          <PulsingDot color="red" />
          <span className="text-[10px] text-red-400 font-mono">REQUIRES IMMEDIATE ACTION</span>
        </div>
      ),
    },
    {
      label: "Compliance Posture", value: "94", unit: "%",
      sub: "ISO 22301 · SAMA · GDPR · DPDP",
      icon: ShieldCheck, trend: "up", trendVal: "+2%", color: "emerald",
      extra: <Progress value={94} color="emerald" className="mt-2" />,
    },
    {
      label: "3rd-Party Exposures", value: "12", unit: "",
      sub: "4 unmitigated · 3 under review",
      icon: Network, trend: "down", trendVal: "-2", color: "amber",
      extra: <Progress value={40} color="amber" className="mt-2" />,
    },
  ];

  const aiInsights = [
    {
      id: 1, severity: "critical", icon: Globe,
      title: "APAC Supply Chain Disruption Predicted",
      detail: "Geopolitical tension modeling (Taiwan Strait) indicates 85% likelihood of tier-2 vendor failure within 21 days. Activate Vendor Fallback Protocol immediately.",
      tags: ["Likelihood: 85%", "APAC Region", "Tier-2 Vendors"],
      action: "Simulate Impact", actionVariant: "danger",
    },
    {
      id: 2, severity: "warning", icon: ShieldCheck,
      title: "ISO 22301 Compliance Drift — EU Operations",
      detail: "BCM policy review overdue by 47 days in European subsidiaries. NLP audit engine identified 3 clause deviations in the BCP documentation set.",
      tags: ["ISO 22301", "EU Ops", "Policy Gap"],
      action: "View Gap Analysis", actionVariant: "amber",
    },
    {
      id: 3, severity: "info", icon: Cpu,
      title: "Ransomware TTP Intelligence Updated",
      detail: "NLP feed ingested 14 new IOC clusters from ISAC. Cloud WAF rules automatically adjusted. MITRE ATT&CK mapping complete: TA0040 · T1486.",
      tags: ["AI Automated", "MITRE ATT&CK", "Zero-Touch"],
      action: "View Threat Brief", actionVariant: "ghost",
    },
  ];

  const severityColors = {
    critical: { border: "border-red-800/60", bg: "bg-red-950/20", icon: "text-red-400", tag: "bg-red-950 text-red-400" },
    warning: { border: "border-amber-800/60", bg: "bg-amber-950/20", icon: "text-amber-400", tag: "bg-amber-950 text-amber-400" },
    info: { border: "border-cyan-800/60", bg: "bg-cyan-950/20", icon: "text-cyan-400", tag: "bg-cyan-950 text-cyan-400" },
  };

  return (
    <div className={`space-y-5 transition-all duration-500 ${animIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

      {/* Feature 5: Live Polling Indicator */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-400 tracking-wider">LIVE — AUTO-REFRESH EVERY 5s</span>
          <span className="text-[9px] font-mono text-slate-600 ml-1">
            {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} glow className={`transition-all duration-700 delay-[${i * 80}ms]`}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">{kpi.label}</p>
                <div className="flex items-end gap-1 mt-1.5">
                  <span className={`text-3xl font-black font-mono leading-none
                    ${kpi.color === "red" ? "text-red-400" :
                      kpi.color === "amber" ? "text-amber-400" :
                      kpi.color === "emerald" ? "text-emerald-400" : "text-white"}`}>
                    {kpi.value}
                  </span>
                  {kpi.unit && <span className="text-slate-500 text-sm mb-0.5 font-mono">{kpi.unit}</span>}
                </div>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center
                ${kpi.color === "red" ? "bg-red-950/60 border border-red-800/50" :
                  kpi.color === "amber" ? "bg-amber-950/60 border border-amber-800/50" :
                  kpi.color === "emerald" ? "bg-emerald-950/60 border border-emerald-800/50" :
                  "bg-slate-800 border border-slate-700"}`}>
                <kpi.icon size={16} className={
                  kpi.color === "red" ? "text-red-400" :
                  kpi.color === "amber" ? "text-amber-400" :
                  kpi.color === "emerald" ? "text-emerald-400" : "text-slate-400"} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {kpi.trend === "down" ? (
                <ArrowDownRight size={11} className={kpi.color === "amber" || kpi.color === "red" ? "text-emerald-400" : "text-emerald-400"} />
              ) : (
                <ArrowUpRight size={11} className={kpi.color === "red" ? "text-red-400" : "text-emerald-400"} />
              )}
              <span className={`text-[11px] font-mono font-bold ${
                kpi.trend === "up" && kpi.color === "red" ? "text-red-400" : "text-emerald-400"}`}>
                {kpi.trendVal}
              </span>
              <span className="text-[10px] text-slate-600">vs last cycle</span>
            </div>
            {kpi.extra}
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      {/* Middle Split */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Risk Trends Chart - 60% */}
        <Card className="xl:col-span-3" glow>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono text-slate-500 tracking-widest">RISK EXPOSURE TRENDS</p>
              <p className="text-sm font-semibold text-white mt-0.5">Inherent vs Residual Risk · 6-Month View</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="w-3 h-0.5 bg-red-500 inline-block rounded" />Inherent
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="w-3 h-0.5 bg-cyan-500 inline-block rounded" />Residual
              </div>
              <Btn variant="ghost" size="xs" icon={RefreshCw} onClick={() => toast.success('Risk trend data refreshed successfully')}>Refresh</Btn>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={riskTrendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="inherentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="residualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="inherent" name="Inherent Risk" stroke="#ef4444" strokeWidth={2} fill="url(#inherentGrad)" dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="residual" name="Residual Risk" stroke="#06b6d4" strokeWidth={2} fill="url(#residualGrad)" dot={{ fill: "#06b6d4", r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
            <p className="text-[10px] text-slate-500 font-mono">Mitigation effectiveness: <span className="text-emerald-400 font-bold">+18.6%</span> QoQ</p>
            <Btn variant="ghost" size="xs" icon={BarChart3} onClick={() => toast.info('Generating full risk exposure report…')}>Full Report</Btn>
          </div>
        </Card>

        {/* AI Insights - 40% */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-slate-500 tracking-widest">AI PREDICTIVE INSIGHTS</p>
            <div className="flex items-center gap-1.5">
              <PulsingDot color="cyan" />
              <span className="text-[10px] text-cyan-400 font-mono">LIVE INFERENCE</span>
            </div>
          </div>
          {aiInsights.map((insight, i) => {
            const s = severityColors[insight.severity];
            return (
              <div key={i} className={`rounded-xl border ${s.border} ${s.bg} p-3.5 transition-all duration-300 hover:border-opacity-80`}>
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${s.bg} border ${s.border}`}>
                    <insight.icon size={13} className={s.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white leading-snug">{insight.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{insight.detail}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {insight.tags.map((tag, j) => (
                        <span key={j} className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${s.tag}`}>{tag}</span>
                      ))}
                    </div>
                    <div className="mt-2.5">
                      <Btn variant={insight.actionVariant} size="xs" icon={Play} onClick={() => toast.info(`Launching: ${insight.action}…`)}>{insight.action}</Btn>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance Distribution */}
      <Card glow>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-mono text-slate-500 tracking-widest">REGULATORY COMPLIANCE DISTRIBUTION</p>
            <p className="text-sm font-semibold text-white mt-0.5">Framework Adherence Analysis · Real-Time</p>
          </div>
          <Badge variant="success">Last Audit: Mar 18, 2026</Badge>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={complianceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {complianceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, "Adherence"]}
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-5 gap-3 w-full">
            {complianceData.map((f, i) => (
              <div key={i} className="text-center">
                <div className="text-xl font-black font-mono" style={{ color: f.color }}>{f.value}%</div>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{f.name}</p>
                <Progress value={f.value} color={f.name === "ISO 22301" ? "emerald" : f.name === "GDPR" ? "cyan" : "amber"} className="mt-1.5" />
                <p className="text-[9px] text-slate-600 mt-1">
                  {f.value >= 90 ? "Compliant" : f.value >= 80 ? "Near-compliant" : "At Risk"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── VIEW 2: RISK REGISTER ────────────────────────────────────────────────────
const RiskRegisterView = ({ onSelectRisk }) => {
  const [filter, setFilter] = useState("");
  const [animIn, setAnimIn] = useState(false);
  const { risks, addRisk, updateRiskStatus } = useRisks();
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [viewTab, setViewTab] = useState("all"); // "all" | "pending"
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [activeCardFilter, setActiveCardFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState([]);
  const [showSevDropdown, setShowSevDropdown] = useState(false);
  const toast = useToast();
  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);

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
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.riskName && r.riskName.toLowerCase().includes(q));
    });

    // Card filter
    if (activeCardFilter === 'catastrophic') result = result.filter(r => (r.inherentScore || r.score || 0) >= 20);
    else if (activeCardFilter === 'high') result = result.filter(r => { const s = r.inherentScore || r.score || 0; return s >= 15 && s < 20; });
    else if (activeCardFilter === 'medium') result = result.filter(r => { const s = r.inherentScore || r.score || 0; return s >= 8 && s < 15; });

    // Severity dropdown filter
    if (severityFilter.length > 0) {
      result = result.filter(r => {
        const label = (r.inherentLabel || r.inherent || '').toLowerCase();
        return severityFilter.some(s => label.includes(s.toLowerCase()));
      });
    }

    // Sorting
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

  const aiStatusColor = (color) => {
    const map = {
      emerald: "text-emerald-400", blue: "text-blue-400",
      amber: "text-amber-400", red: "text-red-400", violet: "text-violet-400",
    };
    return map[color] || "text-slate-400";
  };

  const catIcon = (cat) => {
    const m = { Cybersecurity: Lock, Operational: Server, Compliance: ShieldCheck, Financial: BarChart3, Geopolitical: Globe, Reputational: Eye };
    const I = m[cat] || AlertCircle;
    return <I size={12} className="text-slate-500" />;
  };

  // Risk score badge with color
  const scoreBadge = (score, label, color) => {
    if (!score && score !== 0) return <span className="text-slate-600 text-[10px]">—</span>;
    return (
      <div className="flex items-center gap-1.5">
        <span className="font-mono font-bold text-sm" style={{ color: color || "#94a3b8" }}>{score}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{
          color: color || "#94a3b8",
          background: color ? `${color}18` : "rgba(148,163,184,0.1)",
          border: `1px solid ${color || "#334155"}40`,
        }}>{label || "—"}</span>
      </div>
    );
  };

  // Status badge (supports both EN and AR status strings from context)
  const statusBadge = (status) => {
    const colorMap = {
      // English
      "Draft":              { bg: "bg-slate-800",   text: "text-slate-400",   border: "border-slate-700" },
      "Identified":         { bg: "bg-blue-950",    text: "text-blue-400",    border: "border-blue-800" },
      "Under Analysis":     { bg: "bg-amber-950",   text: "text-amber-400",   border: "border-amber-800" },
      "Planned / Approved": { bg: "bg-violet-950",  text: "text-violet-400",  border: "border-violet-800" },
      "In Progress":        { bg: "bg-cyan-950",    text: "text-cyan-400",    border: "border-cyan-800" },
      "Monitored":          { bg: "bg-emerald-950", text: "text-emerald-400", border: "border-emerald-800" },
      "Closed":             { bg: "bg-slate-800",   text: "text-slate-500",   border: "border-slate-700" },
      "Rejected":           { bg: "bg-red-950",     text: "text-red-400",     border: "border-red-800" },
      // Arabic (from AR form submissions)
      "مسودة":            { bg: "bg-slate-800",   text: "text-slate-400",   border: "border-slate-700" },
      "مُحدَّد":           { bg: "bg-blue-950",    text: "text-blue-400",    border: "border-blue-800" },
      "قيد التحليل":      { bg: "bg-amber-950",   text: "text-amber-400",   border: "border-amber-800" },
      "مُخطَّط / مُعتمَد": { bg: "bg-violet-950",  text: "text-violet-400",  border: "border-violet-800" },
      "قيد التنفيذ":      { bg: "bg-cyan-950",    text: "text-cyan-400",    border: "border-cyan-800" },
      "مُراقَب":           { bg: "bg-emerald-950", text: "text-emerald-400", border: "border-emerald-800" },
      "مُغلَق":            { bg: "bg-slate-800",   text: "text-slate-500",   border: "border-slate-700" },
    };
    const c = colorMap[status] || colorMap["Draft"];
    return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>{status || "Draft"}</span>;
  };

  return (
    <div className={`space-y-4 transition-all duration-500 ${animIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

      {/* Header + Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest">ENTERPRISE RISK REGISTER</p>
          <p className="text-lg font-bold text-white mt-0.5">Centralized GRC Repository</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
            <Filter size={12} className="text-slate-500" />
            <input
              className="bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none w-48"
              placeholder="Filter by Risk ID, name, or keyword..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <Btn variant="ghost" size="sm" icon={Download} onClick={async () => {
            toast.success('CSV export started — file will download shortly.');
            const { exportToCSV } = await import('../utils/exportUtils');
            const cols = [
              { label: 'Risk ID', accessor: 'id' },
              { label: 'Risk Name', accessor: 'riskName' },
              { label: 'Description', accessor: 'description' },
              { label: 'Department', accessor: 'department' },
              { label: 'Risk Type', accessor: 'riskType' },
              { label: 'Inherent Likelihood', accessor: 'inherentLikelihood' },
              { label: 'Inherent Impact', accessor: 'inherentImpact' },
              { label: 'Inherent Score', accessor: 'inherentScore' },
              { label: 'Residual Likelihood', accessor: 'residualLikelihood' },
              { label: 'Residual Impact', accessor: 'residualImpact' },
              { label: 'Residual Score', accessor: 'residualScore' },
              { label: 'Status', accessor: (r) => r.lifecycleStatus || r.status },
              { label: 'Owner', accessor: 'owner' },
              { label: 'Response Type', accessor: 'responseType' },
            ];
            const ok = exportToCSV(filtered, cols, 'risk-register');
            if (ok) toast.success('CSV exported successfully ✅');
            else toast.error('CSV export failed');
          }}>Export CSV</Btn>
          <Btn variant="outline" size="sm" icon={Download} onClick={async () => {
            toast.success('PDF export started — generating document...');
            const { exportToPDF } = await import('../utils/exportUtils');
            const cols = [
              { label: 'Risk ID', accessor: 'id' },
              { label: 'Risk Name', accessor: 'riskName' },
              { label: 'Department', accessor: 'department' },
              { label: 'Risk Type', accessor: 'riskType' },
              { label: 'Inherent Risk', accessor: (r) => r.inherentScore || 0 },
              { label: 'Residual Risk', accessor: (r) => r.residualScore || 0 },
              { label: 'Status', accessor: (r) => r.lifecycleStatus || r.status },
              { label: 'Owner', accessor: 'owner' },
            ];
            const ok = await exportToPDF(filtered, cols, 'risk-register', { title: 'Enterprise Risk Register' });
            if (ok) toast.success('PDF exported successfully ✅');
            else toast.error('PDF export failed — check connection');
          }}>Export PDF</Btn>
          <Btn variant="primary" size="sm" icon={AlertCircle} onClick={() => setShowAddRisk(true)}>Add Risk</Btn>
          <Btn variant="amber" size="sm" icon={Bot} onClick={() => toast.info('Generate AI Risk — feature coming soon. This will enable AI-driven automated risk identification.')}>Generate AI Risk</Btn>
        </div>
      </div>

      <AddRiskModal
        isOpen={showAddRisk}
        onClose={() => setShowAddRisk(false)}
        onSave={(newRisk) => addRisk(newRisk)}
        lang="en"
      />

      {/* View Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: "all", label: "All Risks", count: risks.length },
          { id: "pending", label: "Pending Approval", count: risks.filter(r => r.status === "Identified").length },
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

      {/* Stats Row — Clickable Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Risks", value: risks.length, color: "text-white", filterKey: "all" },
          { label: "Catastrophic", value: risks.filter(r => (r.inherentScore || r.score || 0) >= 20).length, color: "text-red-400", filterKey: "catastrophic" },
          { label: "High", value: risks.filter(r => { const s = r.inherentScore || r.score || 0; return s >= 15 && s < 20; }).length, color: "text-orange-400", filterKey: "high" },
          { label: "Avg Inherent", value: Math.round(risks.reduce((a, r) => a + (r.inherentScore || r.score || 0), 0) / risks.length), color: "text-amber-400", filterKey: "medium" },
        ].map((s, i) => (
          <Card key={i}
            className={`text-center py-3 cursor-pointer transition-all hover:scale-[1.02] ${activeCardFilter === s.filterKey ? 'ring-2 ring-cyan-500 ring-offset-1 ring-offset-slate-900' : ''}`}
            onClick={() => setActiveCardFilter(activeCardFilter === s.filterKey ? 'all' : s.filterKey)}
          >
            <p className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Severity Filter + Active Filter Indicators */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button onClick={() => setShowSevDropdown(!showSevDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 transition-colors">
            <Filter size={12} /> Severity {severityFilter.length > 0 && <span className="bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{severityFilter.length}</span>}
          </button>
          {showSevDropdown && (
            <div className="absolute top-full mt-1 left-0 z-20 w-52 rounded-xl border border-slate-700 bg-slate-900 p-2 space-y-0.5 shadow-xl">
              {['Catastrophic', 'High', 'Medium', 'Low'].map(sev => (
                <label key={sev} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs">
                  <input type="checkbox" checked={severityFilter.includes(sev)}
                    onChange={() => setSeverityFilter(prev => prev.includes(sev) ? prev.filter(s => s !== sev) : [...prev, sev])}
                    className="rounded" />
                  <span className={`${sev === 'Catastrophic' ? 'text-red-400' : sev === 'High' ? 'text-orange-400' : sev === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{sev}</span>
                </label>
              ))}
              <button onClick={() => { setSeverityFilter([]); setShowSevDropdown(false); }} className="w-full text-center text-[10px] text-slate-500 hover:text-white py-1 mt-1 border-t border-slate-800">Reset</button>
            </div>
          )}
        </div>
        {(activeCardFilter !== 'all' || severityFilter.length > 0) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-cyan-400">Active filter: {activeCardFilter !== 'all' ? activeCardFilter : ''} {severityFilter.join(', ')}</span>
            <button onClick={() => { setActiveCardFilter('all'); setSeverityFilter([]); }} className="text-slate-500 hover:text-white text-[10px]">✕ Clear</button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                {[
                  { label: "Risk ID", key: "id" },
                  { label: "Date", key: "date" },
                  { label: "Department", key: "department" },
                  { label: "Risk Type", key: "riskType" },
                  { label: "Risk Name", key: "riskName" },
                  { label: "Inherent Risk", key: "inherentScore" },
                  { label: "Residual Risk", key: "residualScore" },
                  { label: "Status", key: "status" },
                  { label: "Owner", key: "owner" },
                  { label: "Response Type", key: "responseType" },
                  { label: viewTab === "pending" ? "Actions" : "Current Action", key: null },
                ].map((h) => (
                  <th key={h.label}
                    onClick={() => h.key && handleSort(h.key)}
                    className={`px-3 py-3 text-left font-semibold text-slate-500 font-mono text-[10px] tracking-wider whitespace-nowrap ${h.key ? 'cursor-pointer select-none hover:text-cyan-400 hover:bg-slate-800/40 transition-colors' : ''}`}>
                    <div className="flex items-center gap-1">
                      {h.label}
                      {h.key && (
                        <span className={`transition-colors ${sortConfig.key === h.key ? 'text-cyan-400' : 'text-slate-700'}`}>
                          {sortConfig.key === h.key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id}
                  onClick={() => onSelectRisk && onSelectRisk(r)}
                  className={`border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors cursor-pointer
                    ${i % 2 === 0 ? "" : "bg-slate-900/20"}`}>
                  {/* Risk ID */}
                  <td className="px-3 py-3.5 font-mono font-bold text-cyan-400 whitespace-nowrap">{r.id}</td>
                  {/* Date */}
                  <td className="px-3 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">{r.date || "—"}</td>
                  {/* Department */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {catIcon(r.riskType || r.category)}
                      <span className="text-slate-400 text-[11px]">{r.department || r.category}</span>
                    </div>
                  </td>
                  {/* Risk Type */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    <span className="text-[11px] text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded font-mono">
                      {r.riskType || r.category || "—"}
                    </span>
                  </td>
                  {/* Risk Name */}
                  <td className="px-3 py-3.5 text-slate-300 max-w-[180px]">
                    <span className="line-clamp-1 font-medium">{r.riskName || r.description}</span>
                  </td>
                  {/* Inherent Risk */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    {scoreBadge(r.inherentScore, r.inherentLabel || r.inherent, r.inherentColor)}
                  </td>
                  {/* Residual Risk */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    {scoreBadge(r.residualScore, r.residualLabel || r.residual, r.residualColor)}
                  </td>
                  {/* Status */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    {statusBadge(r.lifecycleStatus || r.status)}
                  </td>
                  {/* Owner */}
                  <td className="px-3 py-3.5 text-slate-300 whitespace-nowrap text-[11px]">{r.owner}</td>
                  {/* Response Type */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    {r.responseType ? (
                      <span className="text-[11px] font-mono text-violet-300 bg-violet-950 border border-violet-800 px-2 py-0.5 rounded">
                        {r.responseType}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[10px]">—</span>
                    )}
                  </td>
                  {/* AI Status / Actions */}
                  <td className="px-3 py-3.5 whitespace-nowrap">
                    {viewTab === "pending" ? (
                      <div className="flex items-center gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); updateRiskStatus(r.id, "Planned / Approved"); toast.success(`Risk ${r.id} approved.`); }}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-colors">
                          ✅ Approve
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); updateRiskStatus(r.id, "Rejected"); toast.warning(`Risk ${r.id} rejected.`); }}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-950 text-red-400 border border-red-800 hover:bg-red-900 transition-colors">
                          ❌ Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full inline-block
                          ${r.aiColor === "emerald" ? "bg-emerald-400" :
                            r.aiColor === "red" ? "bg-red-400" :
                            r.aiColor === "amber" ? "bg-amber-400" :
                            r.aiColor === "violet" ? "bg-violet-400" : "bg-blue-400"}`} />
                        <span className={`font-mono text-[10px] font-semibold ${aiStatusColor(r.aiColor)}`}>{r.aiStatus}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/40">
          <p className="text-[10px] text-slate-500 font-mono">
            Showing {filtered.length} of {risks.length} risks · Last updated: <span className="text-cyan-400">03/22/2026 09:14 UTC</span>
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(p => (
              <button key={p} onClick={() => toast.info(`Page ${p} — showing mock data (page 1 only)`)} className={`w-7 h-7 rounded text-[11px] font-mono transition-colors
                ${p === 1 ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:bg-slate-800"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── VIEW 3: SITUATION ROOM ───────────────────────────────────────────────────
const SituationRoomView = () => {
  const toast = useToast();
  const { activateCrisis, crisisMode } = useCrisis();
  const [elapsed, setElapsed] = useState(4472);
  const [playbooks, setPlaybooks] = useState({ iso: false, notify: false, failover: false });
  const [panicExecuted, setPanicExecuted] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);

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

  const tlIconMap = {
    alert: AlertTriangle, cpu: Cpu, shield: Shield,
    globe: Globe, database: Database, check: CheckCircle2,
  };
  const tlColors = {
    red: { dot: "bg-red-500 shadow-red-500/50", line: "border-red-900", text: "text-red-400" },
    amber: { dot: "bg-amber-500 shadow-amber-500/50", line: "border-amber-900", text: "text-amber-400" },
    blue: { dot: "bg-blue-500 shadow-blue-500/50", line: "border-blue-900", text: "text-blue-400" },
    emerald: { dot: "bg-emerald-500 shadow-emerald-500/50", line: "border-emerald-900", text: "text-emerald-400" },
  };

  const PlaybookToggle = ({ id, label, rto, sublabel, icon: Icon }) => {
    const active = playbooks[id];
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 cursor-pointer
        ${active ? "bg-emerald-950/30 border-emerald-700/60" : "bg-slate-900/60 border-slate-800 hover:border-slate-700"}`}
        onClick={() => setPlaybooks(p => ({ ...p, [id]: !p[id] }))}>
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0
            ${active ? "bg-emerald-900/60 border border-emerald-700/50" : "bg-slate-800 border border-slate-700"}`}>
            <Icon size={13} className={active ? "text-emerald-400" : "text-slate-500"} />
          </div>
          <div>
            <p className={`text-[12px] font-semibold ${active ? "text-emerald-300" : "text-slate-300"}`}>{label}</p>
            <p className="text-[10px] text-slate-500 font-mono">{sublabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rto && <span className="text-[9px] text-slate-500 font-mono">{rto}</span>}
          <div className={`w-10 h-5 rounded-full transition-all duration-300 flex items-center px-0.5
            ${active ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"}`}>
            <div className="w-4 h-4 bg-white rounded-full shadow" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 transition-all duration-500 ${animIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

      {/* ═══ Feature 3: PANIC BUTTON — Execute All Critical Actions ═══ */}
      <div className="rounded-2xl border-2 border-dashed p-5 text-center"
        style={{
          borderColor: panicExecuted ? '#059669' : '#dc2626',
          background: panicExecuted
            ? 'linear-gradient(135deg, rgba(5,150,105,0.1), rgba(16,185,129,0.05))'
            : 'linear-gradient(135deg, rgba(127,29,29,0.2), rgba(69,10,10,0.3))',
        }}>
        {!panicExecuted ? (
          <>
            <p className="text-[10px] font-mono text-red-400 tracking-[4px] mb-2 animate-pulse">EMERGENCY OVERRIDE</p>
            <button onClick={() => {
              setPlaybooks({ iso: true, notify: true, failover: true });
              setPanicExecuted(true);
              activateCrisis({ riskName: 'EMERGENCY — All SOPs Triggered', detail: 'Panic Button activated by Crisis Commander' });
              toast.error('🚨 ALL CRITICAL ACTIONS EXECUTED — Crisis Mode Activated');
            }} style={{
              padding: '16px 48px', borderRadius: 16,
              background: 'linear-gradient(135deg, #991b1b, #7f1d1d)',
              border: '2px solid #ef4444',
              color: '#fecaca', fontSize: 16, fontWeight: 900,
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 3,
              boxShadow: '0 0 30px rgba(239,68,68,0.4), inset 0 0 20px rgba(239,68,68,0.1)',
              animation: 'crisisPulse 2s ease-in-out infinite',
              transition: 'all 0.3s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 50px rgba(239,68,68,0.6)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(239,68,68,0.4)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              🚨 EXECUTE ALL CRITICAL ACTIONS
            </button>
            <p className="text-[10px] text-red-400/60 mt-2 font-mono">Activates all playbooks + Crisis Mode + Notifications</p>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-emerald-400 font-bold text-sm">ALL CRITICAL ACTIONS EXECUTED</p>
              <p className="text-[10px] text-emerald-400/60 font-mono">3/3 playbooks active · Crisis Mode engaged · Notifications sent</p>
            </div>
          </div>
        )}
      </div>

      {/* Alert Banner */}
      <div className="rounded-xl border border-red-700 p-4 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, rgba(69,10,10,0.7) 0%, rgba(127,29,29,0.2) 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-900/60 border border-red-700">
            <AlertTriangle size={18} className="text-red-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-red-400 bg-red-900/60 border border-red-700 px-2 py-0.5 rounded animate-pulse">
                ● ACTIVE SIMULATION
              </span>
              <span className="text-[9px] font-mono text-slate-500">INC-2026-0322-001</span>
            </div>
            <p className="text-red-100 font-bold text-sm mt-1">Ransomware Attack on Core Banking Systems</p>
            <p className="text-red-300/70 text-xs mt-0.5">Scope: Core banking infrastructure · Severity: P1-CRITICAL · GDPR Notif. Required</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-slate-500 font-mono">TIME ELAPSED</p>
          <p className="text-3xl font-black font-mono text-red-400">{fmt(elapsed)}</p>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            <PulsingDot color="red" />
            <span className="text-[10px] text-red-400 font-mono">CLOCK RUNNING</span>
          </div>
        </div>
      </div>

      {/* Command Center */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Left: Incident Timeline */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-mono text-slate-500 tracking-widest">INCIDENT TIMELINE</p>
              <p className="text-sm font-semibold text-white mt-0.5">Live Event Feed · Chronological</p>
            </div>
            <div className="flex items-center gap-2">
              <PulsingDot color="red" />
              <span className="text-[10px] text-red-400 font-mono">LIVE</span>
            </div>
          </div>

          <div className="space-y-0 relative overflow-y-auto max-h-[380px] pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
            {timelineEvents.map((ev, i) => {
              const Icon = tlIconMap[ev.icon] || AlertCircle;
              const c = tlColors[ev.color];
              const isLast = i === timelineEvents.length - 1;
              return (
                <div key={i} className="flex gap-4">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${c.dot} z-10`}>
                      <Icon size={12} className="text-white" />
                    </div>
                    {!isLast && <div className={`w-px flex-1 border-l border-dashed ${c.line} min-h-[24px] mt-1`} />}
                  </div>

                  {/* Content */}
                  <div className={`pb-5 flex-1 ${isLast ? "" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-[11px] font-mono font-bold ${c.text}`}>{ev.time}</p>
                      {i === timelineEvents.length - 1 && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">LATEST</span>
                      )}
                    </div>
                    <p className="text-[13px] font-semibold text-white leading-snug">{ev.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{ev.detail}</p>
                  </div>
                </div>
              );
            })}
            {/* Typing indicator */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
              <div className="pb-3">
                <p className="text-[10px] text-slate-600 font-mono">AI engine processing next inject...</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Heatmap + Playbooks */}
        <div className="space-y-4">

          {/* Scatter Heatmap */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-mono text-slate-500 tracking-widest">ACTIVE THREAT HEATMAP</p>
                <p className="text-sm font-semibold text-white mt-0.5">Impact vs Likelihood Matrix</p>
              </div>
              <Btn variant="ghost" size="xs" icon={Crosshair} onClick={() => toast.info('Focus Mode activated — zooming into high-risk quadrant')}>Focus Mode</Btn>
            </div>
            <ResponsiveContainer width="100%" height={185}>
              <ScatterChart margin={{ top: 5, right: 10, bottom: 15, left: -10 }}>
                <defs>
                  <radialGradient id="heatGrad" cx="100%" cy="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </radialGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="x" domain={[0, 1]} name="Likelihood"
                  tick={{ fill: "#64748b", fontSize: 9, fontFamily: "monospace" }}
                  tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                  label={{ value: "Likelihood →", position: "insideBottom", offset: -10, fill: "#475569", fontSize: 9 }}
                  axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="y" domain={[0, 1]} name="Impact"
                  tick={{ fill: "#64748b", fontSize: 9, fontFamily: "monospace" }}
                  tickFormatter={v => `${(v * 100).toFixed(0)}%`}
                  label={{ value: "Impact", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 9 }}
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
                      <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.8} stroke={color} strokeWidth={1} />
                    </g>
                  );
                }} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-3 mt-1 text-[9px] font-mono text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Critical Zone</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Moderate Zone</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Managed Zone</span>
            </div>
          </Card>

          {/* Automated Response Playbooks */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-mono text-slate-500 tracking-widest">AUTOMATED RESPONSE PLAYBOOKS</p>
                <p className="text-sm font-semibold text-white mt-0.5">AI-Recommended Actions</p>
              </div>
              <Badge variant="warning">3 Pending</Badge>
            </div>
            <div className="space-y-2">
              <PlaybookToggle id="iso" icon={Network} label="Isolate European Network Segments"
                sublabel="SOAR · Firewall · BGP Blackhole" rto="Auto" />
              <PlaybookToggle id="notify" icon={ShieldCheck} label="Draft Regulator Notification (SAMA)"
                sublabel="Template SN-201 · Breach T-0h" rto="2h SLA" />
              <PlaybookToggle id="failover" icon={Server} label="Failover to Regional Backup Site"
                sublabel="Hot-standby · DR-SITE-EU-02" rto="RTO: 4h" />
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
              <Btn variant="danger" size="sm" icon={Zap} onClick={() => { setPlaybooks({ iso: true, notify: true, failover: true }); toast.success('All 3 playbooks activated — AI execution in progress'); }}>Execute All Active</Btn>
              <Btn variant="ghost" size="sm" icon={Terminal} onClick={() => toast.info('Opening playbook execution logs…')}>View Playbook Logs</Btn>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-600">
              <span>{Object.values(playbooks).filter(Boolean).length}/3 playbooks activated</span>
              <span className="text-cyan-400">{Object.values(playbooks).filter(Boolean).length > 0 ? "AI execution in progress..." : "Awaiting commander approval"}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Status Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "GDPR Notification Window", value: "T-46:23", color: "text-red-400", sub: "72h window · Breach confirmed", icon: Clock },
          { label: "Recovery Time Objective", value: "T+3:52", color: "text-amber-400", sub: "4h target · On track", icon: Target },
          { label: "Crisis Team Active", value: "11", color: "text-cyan-400", sub: "IC + War Room + SecOps", icon: Crosshair },
        ].map((s, i) => (
          <Card key={i} className="flex items-center gap-3 py-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-500 tracking-wider">{s.label}</p>
              <p className={`text-xl font-black font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{s.sub}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── VIEW: BIA MODULE ─────────────────────────────────────────────────────────
const BIAView = () => {
  const toast = useToast();
  const { assessments, getProcessesForAssessment, approveStep, rejectStep, addProcess } = useBIA();
  const [biaSubTab, setBiaSubTab] = useState("assessments");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ name: '', mtpd: '4', rto: '2', rpo: '1' });

  const subTabs = [
    { id: "assessments", label: "Assessment Cycles" },
    { id: "processes", label: "Critical Processes" },
    { id: "impact", label: "Impact Matrix" },
    { id: "dependencies", label: "Dependencies" },
    { id: "workflow", label: "Workflow" },
    { id: "consolidated", label: "Consolidated Report" },
    { id: "bcp", label: "BCP Plans", badge: "ISO" },
  ];

  const procs = selectedAssessment ? getProcessesForAssessment(selectedAssessment.id) : [];

  const handleApprove = (stepId) => { approveStep(stepId); toast.success("Step approved"); };
  const handleReject = (stepId) => {
    const reason = prompt("Enter rejection reason:"); // simplified for demo
    if (reason) { rejectStep(stepId, reason); toast.warning("Step rejected"); }
  };

  return (
    <div className="space-y-4">
      {/* ═══ Feature 2: Emergency Quick Add ═══ */}
      <div className="rounded-xl border-2 border-dashed border-amber-700/60 p-4"
        style={{ background: 'linear-gradient(135deg, rgba(120,53,15,0.15), rgba(146,64,14,0.08))' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <div>
              <p className="text-amber-300 font-bold text-xs">Emergency Quick Add</p>
              <p className="text-[10px] text-amber-400/60">Bypass assessment cycle — immediate critical process creation</p>
            </div>
          </div>
          <button onClick={() => setShowEmergencyForm(!showEmergencyForm)}
            className="px-4 py-2 text-xs font-bold rounded-lg transition-all"
            style={{
              background: showEmergencyForm ? '#92400e' : 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: showEmergencyForm ? '#fbbf24' : '#1c1917',
              border: '1px solid rgba(245,158,11,0.5)',
              boxShadow: showEmergencyForm ? 'none' : '0 4px 16px rgba(245,158,11,0.25)',
            }}>
            {showEmergencyForm ? '✕ Close' : '⚡ Emergency Quick Add'}
          </button>
        </div>
        {showEmergencyForm && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 items-end" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">Process Name</label>
              <input value={emergencyForm.name} onChange={(e) => setEmergencyForm(f => ({...f, name: e.target.value}))}
                placeholder="e.g. Core Banking / IT Services"
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">MTPD (h)</label>
              <input type="number" value={emergencyForm.mtpd} onChange={(e) => setEmergencyForm(f => ({...f, mtpd: e.target.value}))}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-semibold block mb-1">RTO (h)</label>
              <input type="number" value={emergencyForm.rto} onChange={(e) => setEmergencyForm(f => ({...f, rto: e.target.value}))}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-500" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">RPO (h)</label>
                <input type="number" value={emergencyForm.rpo} onChange={(e) => setEmergencyForm(f => ({...f, rpo: e.target.value}))}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-500" />
              </div>
              <button onClick={() => {
                if (!emergencyForm.name) { toast.error('Process name required'); return; }
                const emergencyProc = {
                  id: `BIA-EMG-${Date.now()}`,
                  process_name_en: emergencyForm.name,
                  process_name: emergencyForm.name,
                  description: 'EMERGENCY — Created via Quick Add during crisis',
                  criticality_level: 'Critical',
                  mtpd_hours: Number(emergencyForm.mtpd) || 4,
                  rto_hours: Number(emergencyForm.rto) || 2,
                  rpo_hours: Number(emergencyForm.rpo) || 1,
                  mbco_percent: 30,
                  status: 'Active',
                  tag: 'CRISIS',
                };
                if (typeof addProcess === 'function') addProcess(emergencyProc);
                toast.success(`⚡ Emergency Process "${emergencyForm.name}" created (MTPD: ${emergencyForm.mtpd}h, RTO: ${emergencyForm.rto}h)`);
                setEmergencyForm({ name: '', mtpd: '4', rto: '2', rpo: '1' });
                setShowEmergencyForm(false);
              }}
                className="self-end px-3 py-2 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all"
                style={{ marginTop: 16 }}
              >Save ⚡</button>
            </div>
          </div>
        )}
      </div>

      {/* BIA Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {subTabs.map((tab) => (
          <button key={tab.id} onClick={() => setBiaSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border
              ${biaSubTab === tab.id ? "bg-cyan-950 text-cyan-400 border-cyan-800" : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"}`}>
            {tab.label}
            {tab.badge && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(14,165,233,0.15))', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.3)' }}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* Context Banner: Selected Assessment */}
      {selectedAssessment && biaSubTab !== "assessments" && biaSubTab !== "consolidated" && (
        <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Assessment:</span>
            <span className="font-mono text-cyan-400 font-bold">{selectedAssessment.id}</span>
            <span className="text-slate-300">{selectedAssessment.titleEn || selectedAssessment.title}</span>
          </div>
          <button onClick={() => { setSelectedAssessment(null); setBiaSubTab("assessments"); }} className="text-slate-500 hover:text-white text-[10px]">✕ Clear</button>
        </div>
      )}

      {/* Process Selector */}
      {(biaSubTab === "impact" || biaSubTab === "dependencies") && selectedAssessment && !selectedProcess && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">Select a process to view details:</p>
          {procs.map((p) => (
            <button key={p.id} onClick={() => setSelectedProcess(p)}
              className="w-full text-left px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-800 transition-colors">
              <span className="text-xs font-mono text-cyan-400">{p.id}</span>
              <span className="text-xs text-slate-300 ml-2">{p.process_name_en || p.process_name}</span>
              <span className="text-[10px] text-slate-500 ml-2">RTO: {p.rto_hours}h · MTPD: {p.mtpd_hours}h</span>
            </button>
          ))}
          {procs.length === 0 && <p className="text-xs text-slate-500">No processes in this assessment.</p>}
        </div>
      )}

      {/* Sub-Tab Content */}
      {biaSubTab === "assessments" && (
        <BIAAssessmentList lang="en"
          onSelectAssessment={(a) => { setSelectedAssessment(a); setSelectedProcess(null); setBiaSubTab("processes"); }}
          onCreateNew={() => toast.info("Create new assessment flow (demo)")} />
      )}

      {biaSubTab === "processes" && selectedAssessment && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">Critical Processes — {selectedAssessment.titleEn || selectedAssessment.title}</p>
            <button onClick={() => setShowProcessForm(!showProcessForm)}
              className="px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg">
              {showProcessForm ? "Close Form" : "+ Add Process"}
            </button>
          </div>
          {showProcessForm && <BIAProcessForm assessmentId={selectedAssessment.id} lang="en" onSave={() => setShowProcessForm(false)} onCancel={() => setShowProcessForm(false)} />}
          {procs.map((p) => (
            <div key={p.id} onClick={() => { setSelectedProcess(p); setBiaSubTab("impact"); }}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-600 cursor-pointer transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{p.id}</span>
                  <p className="text-sm text-white font-semibold mt-0.5">{p.process_name_en || p.process_name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                </div>
                <div className="text-right">
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
          <button onClick={() => setSelectedProcess(null)} className="text-[10px] text-slate-500 hover:text-white">← Back to process list</button>
          <BIAImpactMatrix processId={selectedProcess.id} lang="en" />
        </div>
      )}

      {biaSubTab === "dependencies" && selectedProcess && (
        <div className="space-y-3">
          <button onClick={() => setSelectedProcess(null)} className="text-[10px] text-slate-500 hover:text-white">← Back to process list</button>
          <BIADependencyMap processId={selectedProcess.id} lang="en" />
        </div>
      )}

      {biaSubTab === "workflow" && selectedAssessment && (
        <BIAWorkflowTracker assessmentId={selectedAssessment.id} lang="en" onApprove={handleApprove} onReject={handleReject} />
      )}

      {biaSubTab === "consolidated" && <BIAConsolidatedReport lang="en" />}

      {biaSubTab === "bcp" && <BCPListTab lang="en" />}

      {/* Prompt to select assessment if needed */}
      {!selectedAssessment && biaSubTab !== "assessments" && biaSubTab !== "consolidated" && biaSubTab !== "bcp" && (
        <div className="text-center py-12 text-slate-500">
          <Database size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-sm">Select an assessment cycle first</p>
          <button onClick={() => setBiaSubTab("assessments")} className="mt-2 text-xs text-cyan-400 hover:underline">Go to Assessment List →</button>
        </div>
      )}
    </div>
  );
};

// ─── VIEW: SUMOOD INDEX ───────────────────────────────────────────────────────
const SumoodView = () => {
  const [sumoodSubTab, setSumoodSubTab] = useState("dashboard");

  const subTabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "assessment", label: "Self-Assessment" },
    { id: "gap", label: "Gap Analysis" },
    { id: "documents", label: "Document Compliance", badge: "AI" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        {subTabs.map((tab) => (
          <button key={tab.id} onClick={() => setSumoodSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all border
              ${sumoodSubTab === tab.id ? "bg-violet-950 text-violet-400 border-violet-800" : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"}`}>
            {tab.label}
            {tab.badge && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(168,85,247,0.15))', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>{tab.badge}</span>}
          </button>
        ))}
      </div>
      {sumoodSubTab === "dashboard" && <SumoodDashboard lang="en" />}
      {sumoodSubTab === "assessment" && <SumoodSelfAssessment lang="en" />}
      {sumoodSubTab === "gap" && <SumoodGapAnalysis lang="en" />}
      {sumoodSubTab === "documents" && <SumoodDocumentCompliance lang="en" />}
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function AutoResilienceEN() {
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
    <div className="min-h-screen bg-transparent" style={{ fontFamily: "'IBM Plex Sans', 'DM Sans', system-ui, sans-serif" }}>
      {/* Global Grid BG */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `
          linear-gradient(rgba(6,182,212,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6,182,212,0.015) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(6,182,212,0.06) 0%, transparent 60%)",
      }} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10 w-full overflow-hidden">
        <TopHeader activeTab={activeTab} setActiveTab={setActiveTab} onMenuClick={() => {}} />

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {activeTab === "dashboard" && <ExecutiveDashboard lang="en" onNavigate={setActiveTab} />}
          {activeTab === "register" && <RiskRegisterView onSelectRisk={setSelectedRisk} />}
          {activeTab === "matrix" && <RiskMatrix lang="en" />}
          {activeTab === "situation" && <SituationRoomView />}

          {activeTab === "bia" && <BIAView />}
          {activeTab === "sumood" && <SumoodView />}
        </div>

        {/* Bottom Status Bar */}
        <div className="border-t border-slate-800/60 bg-slate-950/80 px-6 py-2 flex items-center justify-between text-[10px] font-mono text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />API Connected · 12ms latency</span>
            <span>SIEM Feed: <span className="text-slate-500">Active</span></span>
            <span>SOAR Engine: <span className="text-emerald-500">Operational</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span>Khalid Resilience AI Platform <span className="text-slate-700">·</span> v4.2.1</span>
            <span className="text-cyan-600">© 2026 Enterprise Edition</span>
          </div>
        </div>
      </main>

      {/* Risk Detail Drawer — outside main to avoid stacking context */}
      <RiskDetailDrawer risk={selectedRisk} onClose={() => setSelectedRisk(null)} />
    </div>
  );
}
