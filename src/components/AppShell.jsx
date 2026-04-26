import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Shield, ClipboardList, Flag, Activity, Menu, X, Sparkles, Bot, Building2,
  AlertTriangle, Calculator, ScrollText, Bell, ShieldCheck, Target, Layers,
  ChevronDown, Database, LayoutDashboard, Crosshair, FileCheck, FileText, LogOut
} from "lucide-react";
import Logo from "./brand/Logo";
import SettingsToolbar from "./SettingsToolbar";
import LanguageToggle from "./LanguageToggle";
import NotificationBell from "./NotificationBell";
import { useApp } from "../context/AppContext";
import { CrisisBanner } from "../context/CrisisContext";
import { clearToken } from "../services/api";

// ── Unified Navigation Items ──────────────────────────────────────────────────
// Items with `hash` are internal ERM tabs, items with `path` are full routes.
const navItems = [
  // ERM internal tabs (hash-based)
  { hash: "dashboard",  labelKey: "nav.dashboard",       icon: LayoutDashboard, color: "#06b6d4" },
  { path: "/executive",  labelKey: "nav.executive",       icon: Shield,          color: "#8b5cf6" },
  { hash: "register",   labelKey: "nav.riskRegister",    icon: ClipboardList,   color: "#06b6d4" },
  { hash: "matrix",     labelKey: "nav.riskMatrix",      icon: Crosshair,       color: "#06b6d4" },
  { hash: "situation",  labelKey: "nav.situationRoom",   icon: Activity,        color: "#ef4444", badge: true },
  // Global routes
  { path: "/ai-agent",       labelKey: "nav.aiAgent",        icon: Bot,           color: "#8b5cf6" },
  { path: "/vendors",        labelKey: "nav.tprm",           icon: Building2,     color: "#f59e0b" },
  { path: "/incidents",      labelKey: "nav.incidents",       icon: AlertTriangle, color: "#ef4444" },
  { path: "/quantification", labelKey: "nav.monteCarlo",      icon: Calculator,    color: "#8b5cf6" },
  // Compliance — expandable parent
  {
    id: "compliance",
    labelKey: "nav.compliance",
    icon: ShieldCheck,
    color: "#10b981",
    expandable: true,
    children: [
      { path: "/compliance",  labelKey: "nav.complianceDashboard", color: "#10b981", icon: ShieldCheck },
      { path: "/sumood",      labelKey: "nav.sumoodIndex",         color: "#8b5cf6", icon: Target },
      { path: "/regulatory",  labelKey: "nav.regulatoryFeed",      color: "#06b6d4", icon: ScrollText },
    ],
  },
  { path: "/sop-en",         labelKey: "nav.sopEn",           icon: FileCheck,     color: "#f59e0b" },
  { path: "/sop-ar",         labelKey: "nav.sopAr",           icon: FileText,      color: "#f59e0b" },
  { path: "/ai-risk",        labelKey: "nav.aiRisk",          icon: Sparkles,      color: "#8b5cf6" },
  // BIA
  { hash: "bia",        labelKey: "nav.biaModule",       icon: Database,        color: "#06b6d4" },
  { path: "/bia-assets", labelKey: "sidebar.biaAssets",   icon: Layers,          color: "#06b6d4" },
];

const SIDEBAR_WIDTH = 260;

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);
  const { t, isRTL } = useApp();
  const isDemo = localStorage.getItem('isDemo') === 'true';

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem('user');
    localStorage.removeItem('isDemo');
    window.location.href = '/login';
  };

  const toggleExpanded = (id) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isChildActive = (item) => {
    if (!item.children) return false;
    return item.children.some(child => location.pathname === child.path);
  };

  // Check if a hash-based ERM tab is active
  const isHashActive = (hash) => {
    if (location.pathname !== "/erm") return false;
    const currentHash = location.hash?.replace("#", "") || "dashboard";
    return currentHash === hash;
  };

  const handleHashNav = (hash) => {
    navigate(`/erm#${hash}`);
    setMobileMenuOpen(false);
  };

  // ── Render a single nav item (sidebar style) ──────────────────────────────
  const renderSidebarItem = (item) => {
    // Expandable parent
    if (item.expandable) {
      const isExpanded = expandedItems.includes(item.id);
      const childActive = isChildActive(item);
      const Icon = item.icon;

      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpanded(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group"
            style={{
              color: childActive ? "white" : "#94a3b8",
              background: childActive ? "rgba(16,185,129,0.08)" : "transparent",
            }}
          >
            <Icon size={15} style={{ color: childActive ? item.color : "#475569" }} />
            <span className="flex-1" style={{ textAlign: isRTL ? "right" : "left" }}>{t(item.labelKey)}</span>
            <ChevronDown
              size={12}
              className="transition-transform duration-200"
              style={{
                color: childActive ? item.color : "#475569",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>
          {isExpanded && (
            <div className="mt-0.5 space-y-0.5" style={{ paddingInlineStart: 20, marginInlineStart: 14, borderInlineStart: "1px solid rgba(255,255,255,0.06)" }}>
              {item.children.map(child => {
                const isActive = location.pathname === child.path;
                const ChildIcon = child.icon;
                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg no-underline text-xs font-medium transition-all duration-200 hover:bg-slate-800/50"
                    style={{
                      color: isActive ? "#34d399" : "#64748b",
                      background: isActive ? "rgba(16,185,129,0.06)" : "transparent",
                      textDecoration: "none",
                    }}
                  >
                    {ChildIcon && <ChildIcon size={13} style={{ color: isActive ? child.color : "#475569" }} />}
                    <span className="flex-1">{t(child.labelKey)}</span>
                    {isActive && (
                      <span className="shrink-0" style={{ width: 5, height: 5, borderRadius: "50%", background: child.color, boxShadow: `0 0 6px ${child.color}` }} />
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Hash-based ERM tab
    if (item.hash) {
      const isActive = isHashActive(item.hash);
      const Icon = item.icon;
      return (
        <button
          key={item.hash}
          onClick={() => handleHashNav(item.hash)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 group hover:bg-slate-800/40"
          style={{
            color: isActive ? "white" : "#94a3b8",
            background: isActive ? "rgba(6,182,212,0.08)" : "transparent",
            borderInlineStart: isActive ? `2px solid ${item.color}` : "2px solid transparent",
          }}
        >
          <Icon size={15} style={{ color: isActive ? item.color : "#475569" }} />
          <span className="flex-1" style={{ textAlign: isRTL ? "right" : "left" }}>{t(item.labelKey)}</span>
          {item.badge && (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
          {isActive && !item.badge && (
            <span className="shrink-0" style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
          )}
        </button>
      );
    }

    // Regular route item
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => setMobileMenuOpen(false)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline text-xs font-semibold transition-all duration-200 group hover:bg-slate-800/40"
        style={{
          color: isActive ? "white" : "#94a3b8",
          background: isActive ? "rgba(6,182,212,0.08)" : "transparent",
          textDecoration: "none",
          borderInlineStart: isActive ? `2px solid ${item.color}` : "2px solid transparent",
        }}
      >
        <Icon size={15} style={{ color: isActive ? item.color : "#475569" }} />
        <span className="flex-1">{t(item.labelKey)}</span>
        {isActive && (
          <span className="shrink-0" style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
        )}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300" style={{ background: "var(--bg-base)", color: "var(--text-primary)", direction: isRTL ? "rtl" : "ltr" }}>

      {/* ─── Desktop Sidebar ─── */}
      <aside
        className="hidden md:flex flex-col shrink-0 sticky top-0 h-screen z-[100] border-e overflow-y-auto scrollbar-hide"
        style={{
          width: SIDEBAR_WIDTH,
          background: "linear-gradient(180deg, #020c1b 0%, #020817 100%)",
          borderColor: "#1e293b",
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "#1e293b" }}>
          <NavLink to="/erm" className="flex items-center gap-3 no-underline">
            <div className="relative">
              <Logo variant="mark" size="sm" color="white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm leading-none tracking-tight m-0">
                {t('sidebar.platformName')}
              </p>
              <p className="text-[9px] leading-none mt-1 m-0 tracking-[2px]" style={{ color: "#06b6d4", fontFamily: "monospace" }}>
                {t('sidebar.platformTag')}
              </p>
            </div>
          </NavLink>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] text-emerald-400/70 font-mono">{t('sidebar.allSystems')}</span>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] text-slate-600 font-mono tracking-widest m-0">
            {t('sidebar.navigation')}
          </p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-0.5 pb-4">
          {navItems.map(item => renderSidebarItem(item))}
        </nav>

        {/* Bottom — User + Logout */}
        <div className="px-3 pb-4 mt-auto border-t pt-3" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: isDemo ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #06b6d4, #3b82f6)",
                fontSize: 11, fontWeight: 700, color: "white",
              }}
            >
              {isDemo ? 'D' : t('sidebar.userInitials')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-semibold m-0 truncate">
                {isDemo ? (isRTL ? 'مستخدم تجريبي' : 'Demo User') : 'Khalid Alghofaili'}
              </p>
              <p className="text-[10px] text-slate-500 m-0">{isDemo ? 'DEMO' : 'CISO'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-red-500/10"
            style={{ color: "#64748b", background: "transparent", border: "none", cursor: "pointer", textAlign: isRTL ? "right" : "left" }}
          >
            <LogOut size={14} />
            <span>{isRTL ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile Overlay ─── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}
      {mobileMenuOpen && (
        <aside
          className="md:hidden fixed top-0 bottom-0 z-[120] flex flex-col overflow-y-auto shadow-2xl"
          style={{
            width: SIDEBAR_WIDTH,
            background: "#020817",
            [isRTL ? "right" : "left"]: 0,
          }}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: "#1e293b" }}>
            <div className="flex items-center gap-3">
              <Logo variant="mark" size="sm" color="white" />
              <p className="text-white font-extrabold text-sm m-0">{t('sidebar.platformName')}</p>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500">
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 px-3 py-3 space-y-0.5">
            {navItems.map(item => renderSidebarItem(item))}
          </nav>
        </aside>
      )}

      {/* ─── Main Content Column ─── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* ─── Slim Top Bar ─── */}
        <header
          className="sticky top-0 z-[90] border-b flex items-center px-4 md:px-6 gap-3"
          style={{
            height: 52,
            background: "var(--bg-header, #020817e6)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderColor: "var(--border-primary, #1e293b)",
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            style={{ color: "#94a3b8" }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Mobile logo */}
          <NavLink to="/erm" className="md:hidden flex items-center gap-2 no-underline">
            <Logo variant="mark" size="xs" color="white" />
            <span className="text-white font-bold text-sm">{t('sidebar.platformName')}</span>
          </NavLink>

          <div className="flex-1" />

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <NotificationBell lang={isRTL ? 'ar' : 'en'} />
            <div
              className="hidden md:flex items-center justify-center shrink-0"
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                fontSize: 11, fontWeight: 700, color: "white",
              }}
            >
              {t('sidebar.userInitials')}
            </div>
          </div>
        </header>

        <CrisisBanner />

        {/* Demo mode banner */}
        {isDemo && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(6,182,212,0.08), rgba(139,92,246,0.08))',
            borderBottom: '1px solid rgba(6,182,212,0.15)',
            padding: '8px 16px', textAlign: 'center', fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>🎯</span>
            <span style={{ color: '#22d3ee', fontWeight: 700 }}>
              {isRTL ? 'الوضع التجريبي' : 'Demo Mode'}
            </span>
            <span style={{ color: '#475569' }}>—</span>
            <span style={{ color: '#94a3b8' }}>
              {isRTL
                ? 'أنت تستعرض المنصة ببيانات تجريبية. جميع ميزات الذكاء الاصطناعي مُفعّلة.'
                : 'You are exploring the platform with demo data. All AI features are enabled.'}
            </span>
          </div>
        )}

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <SettingsToolbar />
    </div>
  );
}
