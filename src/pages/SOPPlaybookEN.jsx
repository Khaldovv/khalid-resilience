import { useState, useEffect, useRef } from "react";
import { useToast } from "../components/ToastProvider";
import {
  AlertTriangle, CheckCircle2, Lock, Zap, ChevronDown, ChevronRight,
  Shield, Network, Database, Key, Search, FileText, Clock, TrendingUp,
  AlertCircle, Info, Cpu, GitBranch, Terminal, Eye, ArrowRight,
  Activity, Layers, RefreshCw, User, Radio, BarChart2, Crosshair,
  ShieldAlert, Play, SkipForward, XCircle, Sparkles, BrainCircuit,
  FlaskConical, Fingerprint, Globe, Server, Wifi, HardDrive, Settings
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";

// ─── Styles ──────────────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #020817; color: #cbd5e1; font-family: 'Inter', system-ui, sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes glow-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(6,182,212,0); border-color: rgba(6,182,212,0.4); } 50% { box-shadow: 0 0 0 4px rgba(6,182,212,0.12), 0 0 24px rgba(6,182,212,0.2); border-color: rgba(6,182,212,0.9); } }
    @keyframes ping { 75%,100% { transform:scale(2); opacity:0; } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.45; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slide-in { from { opacity:0; transform: translateX(-12px); } to { opacity:1; transform: translateX(0); } }
    @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
    .fade-up { animation: fadeUp 0.55s ease forwards; }
    .fade-up-d1 { animation: fadeUp 0.55s 0.1s ease both; }
    .fade-up-d2 { animation: fadeUp 0.55s 0.2s ease both; }
    .fade-up-d3 { animation: fadeUp 0.55s 0.3s ease both; }
    .fade-up-d4 { animation: fadeUp 0.55s 0.4s ease both; }
    .glow-active { animation: glow-pulse 2s ease-in-out infinite; }
    .ping { animation: ping 1.2s cubic-bezier(0,0,0.2,1) infinite; }
    .pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
    .spin { animation: spin 1s linear infinite; }
    .slide-in { animation: slide-in 0.3s ease forwards; }
    .ai-shimmer {
      background: linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.15) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: shimmer 2.5s ease-in-out infinite;
    }
    .tooltip-wrap { position: relative; }
    .tooltip-wrap:hover .xai-tooltip { display: block; }
    .xai-tooltip { display: none; position: absolute; z-index: 100; }
    .step-connector { width: 2px; background: linear-gradient(180deg, #1e293b 0%, #334155 100%); margin: 0 auto; }
    .branch-indicator { background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1)); border: 1px solid rgba(139,92,246,0.3); }
  `}</style>
);

// ─── Mock Data ────────────────────────────────────────────────────────────────
const escalationData = [
  { t: "Now",    expected: 42, upper: 55, lower: 32, actual: 42 },
  { t: "+6h",   expected: 58, upper: 74, lower: 43, actual: 58 },
  { t: "+12h",  expected: 67, upper: 86, lower: 49, actual: null },
  { t: "+18h",  expected: 73, upper: 91, lower: 54, actual: null },
  { t: "+24h",  expected: 79, upper: 95, lower: 58, actual: null },
  { t: "+36h",  expected: 82, upper: 97, lower: 61, actual: null },
  { t: "+48h",  expected: 76, upper: 93, lower: 55, actual: null },
  { t: "+60h",  expected: 65, upper: 83, lower: 46, actual: null },
  { t: "+72h",  expected: 51, upper: 69, lower: 35, actual: null },
];

const vectorData = [
  { t: "T-0", exfil: 12, lateral: 8, escalation: 15 },
  { t: "T+1h", exfil: 28, lateral: 19, escalation: 22 },
  { t: "T+2h", exfil: 47, lateral: 38, escalation: 35 },
  { t: "T+3h", exfil: 61, lateral: 52, escalation: 51 },
  { t: "T+4h", exfil: 55, lateral: 48, escalation: 63 },
  { t: "T+5h", exfil: 49, lateral: 41, escalation: 58 },
];

const xaiInsights = [
  {
    id: 1,
    icon: AlertTriangle,
    color: "red",
    label: "Secondary Data Exfiltration",
    probability: 85,
    delta: "+12%",
    deltaDir: "up",
    summary: "High probability of staged exfiltration via DNS tunneling",
    explanation: "Anomalous outbound DNS query volume (+340% baseline) from subnet 10.14.8.0/24 matches TTPs attributed to APT-29 Cozy Bear — specifically the 'CloudHopper' campaign variant. Entropy analysis of DNS payloads indicates Base64-encoded data exfiltration. Cross-correlated with 3 ISAC threat bulletins from the past 14 days.",
    signals: ["DNS entropy score: 4.8/8 (threshold: 3.5)", "Beacon interval: 47s ±3s", "C2 overlap: 2 known APT-29 domains"],
    framework: "MITRE ATT&CK T1048.003",
  },
  {
    id: 2,
    icon: Network,
    color: "amber",
    label: "Lateral Movement to ERP Cluster",
    probability: 63,
    delta: "+8%",
    deltaDir: "up",
    summary: "Credential-based pivoting toward SAP S/4HANA environment",
    explanation: "SMB relay attack vectors detected on internal segment. 4 privileged accounts queried AD for service principal names (Kerberoasting pattern). Historical incident data from 2 similar vendor compromise cases (INC-2024-044, INC-2025-012) escalated to ERP within 18–24h of initial compromise. Probability adjusted upward due to absence of network segmentation between DMZ and ERP VLAN.",
    signals: ["Kerberoasting SPN queries: 127 in 6 min", "NTLM relay attempt: 3 hosts", "ERP subnet reachability: confirmed"],
    framework: "MITRE ATT&CK T1550.002",
  },
  {
    id: 3,
    icon: FileText,
    color: "blue",
    label: "Regulatory Breach Notification Trigger",
    probability: 71,
    delta: "stable",
    deltaDir: "flat",
    summary: "PII exposure likely triggers GDPR Art. 33 72-hour notification",
    explanation: "NLP scan of compromised subnet file shares (3,847 documents analyzed) identified 12,400+ records containing EU-resident PII including IBAN, national ID, and health data fields. If exfiltration confirmed, GDPR Article 33 notification to supervisory authority is legally mandatory within 72 hours of awareness. Current T+4h from confirmed awareness window.",
    signals: ["PII records identified: 12,447", "Data sensitivity: Cat-3 (Health + Financial)", "Regulatory clock: T-68h remaining"],
    framework: "GDPR Art. 33 · DPDP § 8(1)",
  },
];

const sopSteps = [
  {
    id: 1,
    status: "completed",
    title: "Initial Triage & Network Isolation",
    category: "Detection & Containment",
    icon: Shield,
    completedAt: "09:14 UTC",
    completedBy: "AI SOAR Engine",
    actions: [],
    summary: "Vendor-facing DMZ segment quarantined. BGP blackhole route injected for 3 vendor ASNs. Initial IOC extraction complete — 47 indicators harvested.",
    artifacts: ["PCAP-INC089-0914.gz", "IOC-Feed-v1.stix"],
  },
  {
    id: 2,
    status: "active",
    title: "Revoke Vendor API Keys & OAuth Tokens",
    category: "Credential Hygiene",
    icon: Key,
    aiReason: "Vendor authentication tokens remain valid. Active API sessions detected on 3 integration endpoints (Billing, Inventory, CRM). Every minute of delay extends the adversary's authenticated access surface.",
    actions: [
      { id: "a1", label: "Execute Key Revocation (Auto)", variant: "danger", icon: Zap, description: "Immediately invalidate all 23 vendor OAuth2 tokens and rotate 8 service account API keys via IAM API. Zero downtime — backup credentials pre-provisioned." },
      { id: "a2", label: "Escalate to SecOps Lead", variant: "amber", icon: User, description: "Assign incident ownership to on-call SecOps Lead. Auto-generates war room Slack channel and briefs on current TTP assessment." },
      { id: "a3", label: "Generate Audit Evidence Package", variant: "ghost", icon: FileText, description: "Compile timestamped log evidence for legal hold and forensic chain-of-custody documentation." },
    ],
    substeps: [
      "Enumerate active OAuth sessions via Identity Provider API",
      "Batch-revoke tokens across Billing, Inventory, CRM endpoints",
      "Rotate 8 service account credentials in HashiCorp Vault",
      "Verify revocation via access log confirmation",
      "Update vendor portal with temporary lockout notice",
    ],
  },
  {
    id: 3,
    status: "locked",
    title: "Initiate Forensic Data Snapshot",
    category: "Digital Forensics & IR",
    icon: HardDrive,
    pendingReason: "Awaiting completion of Step 2 — API key revocation must be confirmed before forensic imaging to prevent active write operations corrupting disk evidence.",
    estimatedUnlock: "~15 min after Step 2 execution",
  },
  {
    id: 4,
    status: "branched",
    title: "PII Exposure — Regulatory Notification Workflow",
    category: "Legal & Compliance",
    icon: FileText,
    branchReason: "Playbook path dynamically altered by AI: PII data (12,447 records, Category-3 sensitivity) detected in compromised subnet 10.14.8.0/24. Regulatory notification obligations now apply.",
    originalPath: "Step 4 was: Internal Post-Incident Review",
    newPath: "GDPR Art. 33 Supervisory Authority Notification (72h window active)",
    timeRemaining: "T-68h",
    branchActions: [
      { label: "Draft GDPR Art. 33 Notification", icon: FileText },
      { label: "Notify DPO & Legal Counsel", icon: User },
      { label: "Initiate Subject Impact Assessment", icon: Search },
    ],
  },
];

// ─── UI Primitives ────────────────────────────────────────────────────────────
const Badge = ({ children, variant = "default", pulse = false, className = "" }) => {
  const variants = {
    default: "bg-slate-700/80 text-slate-300 border-slate-600",
    critical: "bg-red-950 text-red-300 border-red-700",
    warning: "bg-amber-950 text-amber-300 border-amber-700",
    success: "bg-emerald-950 text-emerald-300 border-emerald-700",
    info: "bg-blue-950 text-blue-300 border-blue-700",
    violet: "bg-violet-950 text-violet-300 border-violet-700",
    cyan: "bg-cyan-950 text-cyan-300 border-cyan-700",
    ghost: "bg-slate-900 text-slate-400 border-slate-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${variants[variant]} ${className}`}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`ping absolute inline-flex h-full w-full rounded-full opacity-75 ${variant === "critical" ? "bg-red-400" : variant === "warning" ? "bg-amber-400" : "bg-emerald-400"}`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${variant === "critical" ? "bg-red-400" : variant === "warning" ? "bg-amber-400" : "bg-emerald-400"}`} />
        </span>
      )}
      {children}
    </span>
  );
};

const Btn = ({ children, variant = "primary", size = "sm", onClick, icon: Icon, disabled = false, loading = false }) => {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 active:scale-95 select-none border";
  const sizes = { xs: "px-2.5 py-1 text-[11px]", sm: "px-3.5 py-1.5 text-xs", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20",
    danger: "bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-600/25",
    amber: "bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-600/20",
    ghost: "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500",
    outline: "bg-transparent hover:bg-slate-800 text-slate-300 border-slate-600",
    emerald: "bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-700/20",
    violet: "bg-violet-700 hover:bg-violet-600 text-white border-violet-600",
  };
  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
      {loading ? <RefreshCw size={12} className="spin" /> : Icon && <Icon size={12} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = "", glow = false }) => (
  <div className={`rounded-xl border border-slate-800 ${glow ? "border-slate-700 shadow-lg shadow-cyan-500/5" : ""} ${className}`}
    style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)" }}>
    {children}
  </div>
);

const Progress = ({ value, color = "cyan", showLabel = false, height = "h-1.5", className = "" }) => {
  const colors = { cyan: "bg-cyan-500", emerald: "bg-emerald-500", red: "bg-red-500", amber: "bg-amber-500", violet: "bg-violet-500", blue: "bg-blue-500" };
  return (
    <div className={`relative ${className}`}>
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${height}`}>
        <div className={`h-full rounded-full transition-all duration-1000 ${colors[color]}`} style={{ width: `${value}%` }} />
      </div>
      {showLabel && <span className="absolute right-0 -top-5 text-[10px] text-slate-400 mono">{value}%</span>}
    </div>
  );
};

const PulsingDot = ({ color = "red", size = "sm" }) => {
  const c = { red: "bg-red-500", amber: "bg-amber-500", emerald: "bg-emerald-500", cyan: "bg-cyan-500", blue: "bg-blue-500" };
  const s = { sm: "h-2 w-2", md: "h-2.5 w-2.5" };
  return (
    <span className={`relative flex ${s[size]}`}>
      <span className={`ping absolute inline-flex h-full w-full rounded-full ${c[color]} opacity-75`} />
      <span className={`relative inline-flex rounded-full ${s[size]} ${c[color]}`} />
    </span>
  );
};

// ─── XAI Tooltip ─────────────────────────────────────────────────────────────
const XAITooltip = ({ insight, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const colorMap = { red: { border: "border-red-700", bg: "bg-red-950/30", text: "text-red-400", signal: "bg-red-900/40 text-red-300 border-red-800" }, amber: { border: "border-amber-700", bg: "bg-amber-950/30", text: "text-amber-400", signal: "bg-amber-900/40 text-amber-300 border-amber-800" }, blue: { border: "border-blue-700", bg: "bg-blue-950/30", text: "text-blue-400", signal: "bg-blue-900/40 text-blue-300 border-blue-800" } };
  const c = colorMap[insight.color];

  return (
    <div className="relative" ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-96 z-50 slide-in" style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.6))" }}>
          <div className={`rounded-xl border ${c.border} p-4`} style={{ background: "rgba(8,14,26,0.98)", backdropFilter: "blur(20px)" }}>
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-cyan-400 tracking-wide">XAI · EXPLAINABILITY ENGINE</span>
              <span className={`ml-auto text-[10px] mono ${c.text}`}>{insight.framework}</span>
            </div>
            <p className="text-sm font-semibold text-white mb-2">{insight.label}</p>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">{insight.explanation}</p>
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Contributing Signals</p>
              {insight.signals.map((s, i) => (
                <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] mono ${c.signal}`}>
                  <span className={`w-1 h-1 rounded-full ${insight.color === "red" ? "bg-red-400" : insight.color === "amber" ? "bg-amber-400" : "bg-blue-400"}`} />
                  {s}
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <FlaskConical size={11} className="text-slate-500" />
              <span className="text-[10px] text-slate-500">Confidence derived from: Behavioral ML + Threat Intel Fusion + Historical IR Database</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, type = "escalation" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 p-3 text-xs shadow-2xl" style={{ background: "rgba(8,14,26,0.98)" }}>
      <p className="text-slate-400 mono mb-2 font-semibold">{label}</p>
      {payload.map((p, i) => p.value != null && (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.stroke || p.fill }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-white mono">{p.value}{type === "escalation" ? "" : "%"}</span>
        </div>
      ))}
    </div>
  );
};

// ─── LEFT COLUMN: Predictive Analytics ───────────────────────────────────────
const PredictivePanel = () => {
  const [activeInsight, setActiveInsight] = useState(null);

  return (
    <div className="space-y-4 h-full flex flex-col">

      {/* Escalation Timeline Chart */}
      <Card className="p-4 fade-up-d1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} className="text-red-400" />
              <span className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase">Predictive Risk Escalation</span>
            </div>
            <p className="text-sm font-bold text-white">72-Hour Impact Trajectory</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="critical" pulse>LIVE MODEL</Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block rounded" style={{ background: "#ef4444" }} />Expected Impact</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 inline-block rounded opacity-30" style={{ background: "#ef4444" }} />Confidence Interval</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block rounded bg-amber-500" />Critical Threshold</span>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={escalationData} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id="upperFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="lowerFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#020817" stopOpacity={1} />
                <stop offset="95%" stopColor="#020817" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip type="escalation" />} />
            <ReferenceLine y={75} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
            <Area type="monotone" dataKey="upper" name="Upper CI" stroke="none" fill="url(#upperFill)" />
            <Area type="monotone" dataKey="lower" name="Lower CI" stroke="none" fill="url(#lowerFill)" />
            <Area type="monotone" dataKey="expected" name="Expected Impact" stroke="#ef4444" strokeWidth={2.5} fill="none" dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            <Area type="monotone" dataKey="actual" name="Actual (Confirmed)" stroke="#06b6d4" strokeWidth={2} strokeDasharray="0" fill="none" dot={{ fill: "#06b6d4", r: 4, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Peak Risk (+18h)", value: "79", unit: "/100", color: "text-red-400" },
            { label: "Confidence", value: "87", unit: "%", color: "text-amber-400" },
            { label: "Model Version", value: "v3.8", unit: "", color: "text-cyan-400" },
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
          <div>
            <p className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase mb-0.5">Attack Vector Activity</p>
            <p className="text-sm font-bold text-white">T+0 → T+5h Observed Trends</p>
          </div>
          <Badge variant="ghost">Observed</Badge>
        </div>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={vectorData} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip type="vector" />} />
            <Line type="monotone" dataKey="exfil" name="Exfiltration" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="lateral" name="Lateral Movement" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="escalation" name="Privilege Escalation" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-red-500 inline-block rounded" />Exfiltration</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-amber-500 inline-block rounded" />Lateral Mvmt</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-violet-500 inline-block rounded" />Priv. Escalation</span>
        </div>
      </Card>

      {/* XAI Insight Cards */}
      <div className="flex-1 space-y-3 fade-up-d3">
        <div className="flex items-center gap-2">
          <BrainCircuit size={13} className="text-cyan-400" />
          <p className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase">AI Risk Factors · Hover to Explain</p>
        </div>

        {xaiInsights.map((insight) => {
          const colorMap = {
            red: { badge: "critical", prog: "red", border: "border-red-800/40 hover:border-red-700/60", bg: "rgba(69,10,10,0.15)", icon: "text-red-400", delta: "text-red-400" },
            amber: { badge: "warning", prog: "amber", border: "border-amber-800/40 hover:border-amber-700/60", bg: "rgba(120,53,15,0.12)", icon: "text-amber-400", delta: "text-amber-400" },
            blue: { badge: "info", prog: "blue", border: "border-blue-800/40 hover:border-blue-700/60", bg: "rgba(30,58,138,0.12)", icon: "text-blue-400", delta: "text-blue-300" },
          };
          const c = colorMap[insight.color];

          return (
            <XAITooltip key={insight.id} insight={insight}>
              <div className={`rounded-xl border p-3.5 cursor-help transition-all duration-200 ${c.border}`} style={{ background: c.bg }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <insight.icon size={14} className={c.icon} />
                    <div>
                      <p className="text-xs font-semibold text-white leading-tight">{insight.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{insight.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Info size={11} className="text-slate-600" />
                    <span className="text-[10px] text-slate-600">XAI</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex-1">
                    <Progress value={insight.probability} color={c.prog} height="h-1.5" />
                  </div>
                  <span className={`text-sm font-black mono ${c.icon}`}>{insight.probability}%</span>
                  {insight.deltaDir !== "flat" && (
                    <span className={`text-[10px] mono font-bold ${c.delta}`}>{insight.delta}</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-600 mono">{insight.framework}</span>
                  <span className="text-[9px] text-slate-700">·</span>
                  <span className="text-[9px] text-slate-600 italic">hover for AI reasoning</span>
                </div>
              </div>
            </XAITooltip>
          );
        })}
      </div>
    </div>
  );
};

// ─── SOP Step Components ──────────────────────────────────────────────────────
const CompletedStep = ({ step }) => (
  <div className="rounded-xl border border-emerald-900/50 p-4" style={{ background: "rgba(6,46,35,0.2)" }}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 size={16} className="text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-emerald-300">{step.title}</p>
          <Badge variant="success">Completed</Badge>
          <span className="text-[10px] text-slate-500 mono">{step.completedAt}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">{step.summary}</p>
        {step.artifacts?.length > 0 && (
          <div className="flex gap-2 mt-2">
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

const ActiveStep = ({ step, onExecute }) => {
  const [expanded, setExpanded] = useState(true);
  const [executing, setExecuting] = useState(null);
  const [executed, setExecuted] = useState([]);

  const handleExecute = (actionId) => {
    setExecuting(actionId);
    setTimeout(() => {
      setExecuting(null);
      setExecuted(prev => [...prev, actionId]);
      if (onExecute) onExecute(actionId);
    }, 2200);
  };

  return (
    <div className="rounded-xl border border-cyan-700/60 glow-active overflow-hidden" style={{ background: "rgba(8,42,56,0.3)" }}>
      {/* AI Banner */}
      <div className="px-4 py-2.5 border-b border-cyan-800/40 flex items-center gap-2 ai-shimmer">
        <Sparkles size={12} className="text-cyan-400 flex-shrink-0" />
        <span className="text-[11px] font-bold text-cyan-300 tracking-wide">✨ AI RECOMMENDED — NEXT BEST ACTION</span>
        <div className="ml-auto flex items-center gap-1.5">
          <PulsingDot color="cyan" />
          <span className="text-[10px] text-cyan-500 mono">Priority Score: 97/100</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-700/60"
            style={{ background: "rgba(6,182,212,0.12)" }}>
            <step.icon size={16} className="text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-base font-bold text-white">{step.title}</p>
              <Badge variant="cyan" pulse>ACTIVE</Badge>
              <Badge variant="ghost">{step.category}</Badge>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{step.aiReason}</p>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-slate-500 hover:text-slate-300 transition-colors p-1 flex-shrink-0">
            <ChevronDown size={16} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        {expanded && (
          <div className="space-y-4">
            {/* Sub-steps */}
            <div className="rounded-lg border border-slate-800 p-3" style={{ background: "rgba(15,23,42,0.5)" }}>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-2.5">Execution Checklist</p>
              <div className="space-y-2">
                {step.substeps.map((sub, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(30,41,59,0.8)" }}>
                      <span className="text-[8px] text-slate-500 mono">{i + 1}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Execution Options</p>
              {step.actions.map((action) => {
                const isDone = executed.includes(action.id);
                const isLoading = executing === action.id;
                return (
                  <div key={action.id} className={`rounded-lg border p-3 transition-all duration-300 ${isDone ? "border-emerald-800/50 bg-emerald-950/20" : "border-slate-700/60 hover:border-slate-600"}`}
                    style={!isDone ? { background: "rgba(15,23,42,0.6)" } : {}}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-[11px] text-slate-300 leading-relaxed">{action.description}</p>
                      </div>
                      {isDone ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          <span className="text-[11px] text-emerald-400 font-semibold">Executed</span>
                        </div>
                      ) : (
                        <Btn variant={action.variant} size="sm" icon={isLoading ? null : action.icon}
                          loading={isLoading} onClick={() => handleExecute(action.id)} disabled={!!executing && !isLoading}>
                          {action.label}
                        </Btn>
                      )}
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
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-500">{step.title}</p>
          <Badge variant="default">Locked</Badge>
          <Badge variant="ghost">{step.category}</Badge>
        </div>
        <p className="text-[11px] text-slate-600 mt-1">{step.pendingReason}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Clock size={10} className="text-slate-600" />
          <span className="text-[10px] text-slate-600">{step.estimatedUnlock}</span>
        </div>
      </div>
    </div>
  </div>
);

const BranchedStep = ({ step }) => {
  const toast = useToast();
  return (
  <div className="rounded-xl branch-indicator p-4 fade-up">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.5)" }}>
        <GitBranch size={15} className="text-violet-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-violet-300">{step.title}</p>
          <Badge variant="violet">AI ADAPTED</Badge>
        </div>
      </div>
    </div>

    <div className="rounded-lg border border-violet-800/40 p-3 mb-3 text-xs" style={{ background: "rgba(139,92,246,0.08)" }}>
      <div className="flex items-start gap-2">
        <Sparkles size={12} className="text-violet-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-violet-300 mb-1">Playbook Branch Triggered by AI</p>
          <p className="text-slate-300 leading-relaxed">{step.branchReason}</p>
        </div>
      </div>
    </div>

    <div className="space-y-2 text-xs mb-3">
      <div className="flex items-center gap-2 text-slate-500">
        <XCircle size={11} className="text-slate-600" />
        <span className="line-through text-slate-600">{step.originalPath}</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 size={11} className="text-violet-400" />
        <span className="text-violet-300 font-semibold">{step.newPath}</span>
        <Badge variant="critical" pulse>{step.timeRemaining}</Badge>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 pt-2 border-t border-violet-800/30">
      {step.branchActions.map((a, i) => (
        <Btn key={i} variant={i === 0 ? "violet" : "ghost"} size="xs" icon={a.icon}
          onClick={() => toast.info(`Executing: ${a.label}…`)}>{a.label}</Btn>
      ))}
    </div>
  </div>
);
};

// ─── RIGHT COLUMN: SOP Playbook ───────────────────────────────────────────────
const PlaybookPanel = () => {
  const toast = useToast();
  const [playbook] = useState({ name: "Automated Response Playbook: Vendor Compromise", version: "v2.4", lastUpdated: "2026-03-01", owner: "CISO Office / IR Team Alpha" });

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Playbook Header */}
      <Card className="p-4 fade-up-d1 flex-shrink-0" glow>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(59,130,246,0.15))", border: "1px solid rgba(6,182,212,0.4)" }}>
              <Layers size={18} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 tracking-widest font-semibold uppercase mb-0.5">Dynamic AI-Driven SOP</p>
              <p className="text-base font-bold text-white leading-snug">{playbook.name}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="cyan">{playbook.version}</Badge>
                <Badge variant="ghost">IR Team Alpha</Badge>
                <span className="text-[10px] text-slate-600 mono">Updated: {playbook.lastUpdated}</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">Progress</p>
            <p className="text-xl font-black text-cyan-400 mono">1/4</p>
            <p className="text-[9px] text-slate-600">Steps Complete</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500">Playbook Execution Progress</span>
            <span className="text-[10px] text-slate-400 mono">25%</span>
          </div>
          <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="absolute h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" style={{ width: "25%" }} />
            <div className="absolute h-full w-full ai-shimmer rounded-full" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-4 gap-3 text-center">
          {[
            { label: "Steps Total", value: "4" },
            { label: "Automated", value: "3" },
            { label: "AI Branches", value: "1" },
            { label: "Est. Resolution", value: "~4h" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-base font-black text-white mono">{s.value}</p>
              <p className="text-[9px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto space-y-3 fade-up-d2 pr-0.5">
        {sopSteps.map((step, i) => (
          <div key={step.id}>
            {/* Step number row */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mono flex-shrink-0
                ${step.status === "completed" ? "bg-emerald-900 text-emerald-400 border border-emerald-700" :
                  step.status === "active" ? "bg-cyan-900 text-cyan-300 border border-cyan-600" :
                  step.status === "branched" ? "bg-violet-900 text-violet-300 border border-violet-700" :
                  "bg-slate-900 text-slate-600 border border-slate-700"}`}>
                {step.id}
              </div>
              <div className="h-px flex-1 bg-slate-800" />
              <span className={`text-[10px] mono uppercase font-semibold tracking-wider
                ${step.status === "completed" ? "text-emerald-600" :
                  step.status === "active" ? "text-cyan-600" :
                  step.status === "branched" ? "text-violet-600" : "text-slate-700"}`}>
                {step.status === "completed" ? "✓ Complete" :
                 step.status === "active" ? "⚡ Active" :
                 step.status === "branched" ? "⇌ Branched" : "⊘ Locked"}
              </span>
            </div>

            {step.status === "completed" && <CompletedStep step={step} />}
            {step.status === "active" && <ActiveStep step={step} />}
            {step.status === "locked" && <LockedStep step={step} />}
            {step.status === "branched" && <BranchedStep step={step} />}

            {/* Connector line between steps */}
            {i < sopSteps.length - 1 && (
              <div className="flex justify-start ml-2.5 mt-1">
                <div className="w-px h-4" style={{ background: "linear-gradient(180deg, #1e293b, #334155)" }} />
              </div>
            )}
          </div>
        ))}

        {/* Playbook Footer */}
        <div className="rounded-xl border border-slate-800 p-4 mt-2" style={{ background: "rgba(15,23,42,0.5)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings size={13} className="text-slate-500" />
              <p className="text-xs font-semibold text-slate-400">Playbook Controls</p>
            </div>
            <Badge variant="ghost">IR Team Alpha · On-Call</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" size="xs" icon={SkipForward} onClick={() => toast.warning('Skip requested — requires commander approval')}>Skip to Next Step</Btn>
            <Btn variant="ghost" size="xs" icon={GitBranch} onClick={() => toast.info('Branch history: 1 AI-triggered divergence at Step 4')}>View Branch History</Btn>
            <Btn variant="ghost" size="xs" icon={FileText} onClick={() => toast.success('Evidence package compiling… 2 artifacts queued')}>Export Evidence Pack</Btn>
            <Btn variant="ghost" size="xs" icon={Terminal} onClick={() => toast.warning('CLI console restricted to Level-5 security clearance')}>Open CLI Console</Btn>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
            <Radio size={11} className="text-cyan-500 pulse" />
            <span className="text-[10px] text-slate-500">AI Playbook Engine continuously re-evaluating next best action based on live telemetry.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function SOPPlaybookEN() {
  const [elapsed, setElapsed] = useState(5092);

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

  return (
    <>
      <Styles />
      <div className="min-h-screen flex flex-col bg-transparent">

        {/* Subtle grid bg */}
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.02) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          zIndex: 0,
        }} />
        <div className="fixed inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(239,68,68,0.05) 0%, transparent 70%)",
          zIndex: 0,
        }} />

        {/* ─── TOP HEADER ─── */}
        <header className="relative z-20 border-b border-slate-800 flex-shrink-0" style={{ background: "rgba(2,8,23,0.95)", backdropFilter: "blur(12px)" }}>

          {/* Critical Alert Strip */}
          <div className="px-4 py-2 border-b border-red-900/50 flex items-center gap-3"
            style={{ background: "linear-gradient(90deg, rgba(69,10,10,0.5) 0%, rgba(69,10,10,0.15) 60%, transparent 100%)" }}>
            <div className="flex items-center gap-2">
              <PulsingDot color="red" size="md" />
              <span className="text-[11px] font-bold text-red-300 tracking-wide uppercase">Active Incident Response</span>
            </div>
            <div className="h-3 w-px bg-red-900 mx-1" />
            <span className="text-[11px] text-red-400/80">SOAR Engine engaged · AI Playbook executing · War Room: Channel #INC-089-warroom active</span>
            <div className="ml-auto flex items-center gap-3 text-[10px] text-slate-500 mono">
              <span className="flex items-center gap-1.5"><Wifi size={10} className="text-emerald-500" />SIEM: Connected</span>
              <span className="flex items-center gap-1.5"><Activity size={10} className="text-cyan-500" />EDR: Live Feed</span>
              <span className="flex items-center gap-1.5"><Globe size={10} className="text-blue-500" />TI Feed: Active</span>
            </div>
          </div>

          {/* Main Header Row */}
          <div className="px-5 py-3 flex items-center gap-4">
            {/* Incident ID & Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", boxShadow: "0 0 20px rgba(239,68,68,0.1)" }}>
                <ShieldAlert size={18} className="text-red-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[11px] mono font-bold text-red-400 tracking-widest">INC-2026-089</span>
                  <Badge variant="critical" pulse>P1 · SEV-1</Badge>
                  <Badge variant="warning">Containment Phase</Badge>
                </div>
                <h1 className="text-lg font-black text-white truncate leading-tight">
                  Critical Supply Chain Vendor Breach — API Credential Compromise
                </h1>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Vendor: GlobalTech Integrations Ltd. · Affected systems: Billing API, CRM Integration, Inventory Feed · Analyst: SOC-L3 Chen Wei
                </p>
              </div>
            </div>

            {/* Right Status Cluster */}
            <div className="flex items-center gap-3 flex-shrink-0">

              {/* Elapsed Clock */}
              <div className="text-center px-4 py-2 rounded-xl border border-slate-700"
                style={{ background: "rgba(15,23,42,0.8)" }}>
                <p className="text-[9px] text-slate-500 tracking-wider uppercase mb-0.5">Time Elapsed</p>
                <p className="text-xl font-black mono text-red-400">{fmt(elapsed)}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <PulsingDot color="red" />
                  <span className="text-[9px] text-red-500">CLOCK RUNNING</span>
                </div>
              </div>

              {/* GDPR Clock */}
              <div className="text-center px-4 py-2 rounded-xl border border-amber-800/50"
                style={{ background: "rgba(120,53,15,0.15)" }}>
                <p className="text-[9px] text-amber-600 tracking-wider uppercase mb-0.5">GDPR Art.33</p>
                <p className="text-xl font-black mono text-amber-400">T-68:00</p>
                <p className="text-[9px] text-amber-600/70">Notif. Window</p>
              </div>

              {/* Severity Badge */}
              <div className="text-center px-4 py-2 rounded-xl border border-red-800/60"
                style={{ background: "rgba(127,29,29,0.2)" }}>
                <p className="text-[9px] text-slate-500 tracking-wider uppercase mb-0.5">Severity</p>
                <p className="text-xl font-black text-red-300">CRITICAL</p>
                <p className="text-[9px] text-red-600">Level 1 / 5</p>
              </div>
            </div>
          </div>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <main className="relative z-10 flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full" style={{ minHeight: "calc(100vh - 148px)" }}>

            {/* Left: 40% = 2/5 columns */}
            <div className="lg:col-span-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 164px)", scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
              <PredictivePanel />
            </div>

            {/* Divider */}
            <div className="hidden lg:flex flex-col items-center py-4 lg:col-span-0">
              <div className="w-px flex-1 bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
            </div>

            {/* Right: 60% = 3/5 columns (minus divider) */}
            <div className="lg:col-span-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 164px)", scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
              <PlaybookPanel />
            </div>
          </div>
        </main>

        {/* ─── STATUS BAR ─── */}
        <footer className="relative z-20 border-t border-slate-800/60 px-5 py-1.5 flex items-center justify-between"
          style={{ background: "rgba(2,8,23,0.9)" }}>
          <div className="flex items-center gap-4 text-[10px] mono text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />SOAR: Operational</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block pulse" />ML Model: v3.8 · Inferencing</span>
            <span>XAI Engine: Shapley SHAP v2.1</span>
          </div>
          <div className="text-[10px] mono text-slate-600 flex items-center gap-3">
            <span>JAHIZIA AI · SOP Engine v4.2.1</span>
            <span className="text-slate-700">·</span>
            <span>Classification: <span className="text-amber-600">RESTRICTED // TLP:AMBER</span></span>
          </div>
        </footer>
      </div>
    </>
  );
}
