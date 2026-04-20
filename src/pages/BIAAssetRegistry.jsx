import { useState, useMemo, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useBIAAssets } from "../context/BIAAssetContext";
import AddEditAssetModal from "../components/bia/AddEditAssetModal";
import AssetDetailDrawer from "../components/bia/AssetDetailDrawer";
import {
  Layers, Plus, Search, Filter, BarChart3, GitBranch, AlertTriangle,
  Server, Monitor, Building2, HardDrive, Users, Truck, Database as DbIcon,
  FileText, ChevronDown, Download, RefreshCw, Eye, Trash2, Edit,
  Activity, ShieldAlert, ArrowUpRight, ArrowDownRight, Target
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────
const TYPE_META = {
  IT_SYSTEM:   { icon: Server,    color: "#06b6d4", label: "IT System",   labelAr: "نظام تقني" },
  APPLICATION: { icon: Monitor,   color: "#8b5cf6", label: "Application", labelAr: "تطبيق" },
  FACILITY:    { icon: Building2, color: "#f59e0b", label: "Facility",    labelAr: "مرفق" },
  EQUIPMENT:   { icon: HardDrive, color: "#64748b", label: "Equipment",   labelAr: "معدات" },
  PERSONNEL:   { icon: Users,     color: "#ec4899", label: "Personnel",   labelAr: "أفراد" },
  VENDOR:      { icon: Truck,     color: "#f97316", label: "Vendor",      labelAr: "مورد" },
  DATA:        { icon: DbIcon,    color: "#10b981", label: "Data",        labelAr: "بيانات" },
  DOCUMENT:    { icon: FileText,  color: "#3b82f6", label: "Document",    labelAr: "مستند" },
};

const CRIT_META = {
  LOW:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)",  label: "Low",      labelAr: "منخفض" },
  MEDIUM:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", label: "Medium",   labelAr: "متوسط" },
  HIGH:     { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)",  label: "High",     labelAr: "مرتفع" },
  CRITICAL: { color: "#dc2626", bg: "rgba(220,38,38,0.15)", border: "rgba(220,38,38,0.4)",  label: "Critical", labelAr: "حرج" },
};

const STATUS_META = {
  ACTIVE:         { color: "#10b981", label: "Active",         labelAr: "نشط" },
  INACTIVE:       { color: "#64748b", label: "Inactive",       labelAr: "غير نشط" },
  DECOMMISSIONED: { color: "#ef4444", label: "Decommissioned", labelAr: "ملغى" },
  PLANNED:        { color: "#3b82f6", label: "Planned",        labelAr: "مخطط" },
};

// ── Shared UI Primitives ──────────────────────────────────────────────────
const Badge = ({ children, color, bg, border }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
    style={{ color, background: bg || `${color}18`, border: `1px solid ${border || `${color}40`}` }}>
    {children}
  </span>
);

const Btn = ({ children, variant = "primary", size = "sm", onClick, icon: Icon, className = "" }) => {
  const styles = {
    primary: "bg-cyan-600 hover:bg-cyan-500 text-white",
    danger:  "bg-red-600 hover:bg-red-500 text-white",
    ghost:   "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700",
    outline: "border border-slate-600 hover:border-slate-500 text-slate-300 hover:bg-slate-800",
  };
  const sizes = { xs: "px-2 py-1 text-[10px]", sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all active:scale-95 whitespace-nowrap ${styles[variant]} ${sizes[size]} ${className}`}>
      {Icon && <Icon size={size === "xs" ? 10 : 12} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl border border-slate-800 p-4 ${className}`} style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}>
    {children}
  </div>
);

// ── Tab Views ──────────────────────────────────────────────────────────────

// TAB 1: Assets List
function AssetsListTab({ isRTL, onSelectAsset, onAddAsset }) {
  const { assets, getEffectiveCriticality, getInheritedRTO, deleteAsset, processLinks } = useBIAAssets();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [critFilter, setCritFilter] = useState("");
  const [editAsset, setEditAsset] = useState(null);

  const filtered = useMemo(() => {
    return assets.filter(a => {
      if (typeFilter && a.asset_type !== typeFilter) return false;
      if (critFilter && a.criticality !== critFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.asset_code.toLowerCase().includes(q) || (a.name_ar && a.name_ar.includes(search));
      }
      return true;
    });
  }, [assets, search, typeFilter, critFilter]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-600 transition-all"
            placeholder={isRTL ? "ابحث عن الأصول..." : "Search assets..."}
          />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-600">
          <option value="">{isRTL ? "جميع الأنواع" : "All Types"}</option>
          {Object.entries(TYPE_META).map(([k, v]) => (
            <option key={k} value={k}>{isRTL ? v.labelAr : v.label}</option>
          ))}
        </select>
        <select value={critFilter} onChange={e => setCritFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-600">
          <option value="">{isRTL ? "جميع مستويات الأهمية" : "All Criticality"}</option>
          {Object.entries(CRIT_META).map(([k, v]) => (
            <option key={k} value={k}>{isRTL ? v.labelAr : v.label}</option>
          ))}
        </select>
        <Btn icon={Plus} onClick={onAddAsset}>{isRTL ? "إضافة أصل" : "Add Asset"}</Btn>
      </div>

      {/* Results count */}
      <p className="text-[10px] text-slate-500 font-mono">{filtered.length} {isRTL ? "أصل" : "assets"}</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800" style={{ background: "rgba(15,23,42,0.6)" }}>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px]">
              <th className="px-4 py-3 text-left">{isRTL ? "الكود" : "CODE"}</th>
              <th className="px-4 py-3 text-left">{isRTL ? "الاسم" : "NAME"}</th>
              <th className="px-4 py-3 text-left">{isRTL ? "النوع" : "TYPE"}</th>
              <th className="px-4 py-3 text-left">{isRTL ? "الأهمية" : "CRITICALITY"}</th>
              <th className="px-4 py-3 text-left">{isRTL ? "RTO" : "RTO"}</th>
              <th className="px-4 py-3 text-left">{isRTL ? "القسم" : "DEPT"}</th>
              <th className="px-4 py-3 text-left">{isRTL ? "الحالة" : "STATUS"}</th>
              <th className="px-4 py-3 text-left">{isRTL ? "إجراءات" : "ACTIONS"}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(asset => {
              const tmeta = TYPE_META[asset.asset_type];
              const cmeta = CRIT_META[asset.criticality];
              const smeta = STATUS_META[asset.status];
              const effCrit = getEffectiveCriticality(asset);
              const iRTO = getInheritedRTO(asset.id);
              const TIcon = tmeta?.icon || Server;
              const linkCount = processLinks.filter(l => l.asset_id === asset.id).length;

              return (
                <tr key={asset.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => onSelectAsset(asset)}>
                  <td className="px-4 py-3 font-mono text-cyan-400 font-semibold">{asset.asset_code}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TIcon size={13} style={{ color: tmeta?.color }} />
                      <div>
                        <p className="text-slate-200 font-medium">{isRTL ? asset.name_ar || asset.name : asset.name}</p>
                        {linkCount > 0 && <p className="text-[9px] text-slate-500">{linkCount} {isRTL ? "عملية مرتبطة" : "linked processes"}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={tmeta?.color} bg={`${tmeta?.color}15`}>{isRTL ? tmeta?.labelAr : tmeta?.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={cmeta?.color} bg={cmeta?.bg} border={cmeta?.border}>{isRTL ? cmeta?.labelAr : cmeta?.label}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {asset.rto_hours != null ? `${asset.rto_hours}h` : "—"}
                    {iRTO != null && iRTO !== asset.rto_hours && (
                      <span className="text-amber-400 text-[9px] ml-1" title="Inherited RTO">({iRTO}h)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{asset.department || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: smeta?.color }} />
                      <span style={{ color: smeta?.color }} className="text-[10px] font-semibold">{isRTL ? smeta?.labelAr : smeta?.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onSelectAsset(asset)} className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-cyan-400 transition-colors"><Eye size={13} /></button>
                      <button onClick={() => setEditAsset(asset)} className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-amber-400 transition-colors"><Edit size={13} /></button>
                      <button onClick={() => { if (confirm(isRTL ? "حذف هذا الأصل؟" : "Delete this asset?")) deleteAsset(asset.id); }} className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-slate-500">{isRTL ? "لا توجد أصول" : "No assets found"}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editAsset && <AddEditAssetModal asset={editAsset} onClose={() => setEditAsset(null)} />}
    </div>
  );
}

// TAB 2: Dashboard
function DashboardTab({ isRTL }) {
  const { getDashboardStats, assets } = useBIAAssets();
  const stats = getDashboardStats();

  const kpis = [
    { label: isRTL ? "إجمالي الأصول" : "Total Assets", value: stats.totalAssets, color: "#06b6d4", icon: Layers },
    { label: isRTL ? "أصول نشطة" : "Active Assets", value: stats.activeCount, color: "#10b981", icon: Activity },
    { label: isRTL ? "نقاط فشل منفردة" : "SPOF Warnings", value: stats.spofCount, color: "#ef4444", icon: ShieldAlert },
    { label: isRTL ? "عمليات مرتبطة" : "Linked Processes", value: stats.linkedProcesses, color: "#8b5cf6", icon: GitBranch },
  ];

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-[10px] text-slate-500 font-mono tracking-wider">{kpi.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}30` }}>
                  <Icon size={14} style={{ color: kpi.color }} />
                </div>
              </div>
              <span className="text-3xl font-black font-mono" style={{ color: kpi.color }}>{kpi.value}</span>
            </Card>
          );
        })}
      </div>

      {/* Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Type */}
        <Card>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider mb-3">{isRTL ? "توزيع حسب النوع" : "DISTRIBUTION BY TYPE"}</p>
          <div className="space-y-2">
            {Object.entries(stats.byType).map(([type, count]) => {
              const meta = TYPE_META[type];
              const Icon = meta?.icon || Server;
              const pct = Math.round((count / stats.totalAssets) * 100);
              return (
                <div key={type} className="flex items-center gap-3">
                  <Icon size={13} style={{ color: meta?.color }} className="shrink-0" />
                  <span className="text-xs text-slate-300 w-24 shrink-0">{isRTL ? meta?.labelAr : meta?.label}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: meta?.color }} />
                  </div>
                  <span className="text-xs text-slate-400 font-mono w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* By Criticality */}
        <Card>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider mb-3">{isRTL ? "توزيع حسب الأهمية" : "DISTRIBUTION BY CRITICALITY"}</p>
          <div className="space-y-2">
            {Object.entries(stats.byCriticality).map(([crit, count]) => {
              const meta = CRIT_META[crit];
              const pct = Math.round((count / stats.totalAssets) * 100);
              return (
                <div key={crit} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta?.color }} />
                  <span className="text-xs text-slate-300 w-24 shrink-0">{isRTL ? meta?.labelAr : meta?.label}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: meta?.color }} />
                  </div>
                  <span className="text-xs text-slate-400 font-mono w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

// TAB 3: Dependency Graph (Canvas-based)
function DependencyGraphTab({ isRTL }) {
  const { assets, dependencies } = useBIAAssets();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = 600;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;

    // Position nodes in a circle
    const nodes = assets.map((a, i) => {
      const angle = (2 * Math.PI * i) / assets.length - Math.PI / 2;
      const rx = w * 0.35, ry = h * 0.35;
      return { ...a, x: w / 2 + rx * Math.cos(angle), y: h / 2 + ry * Math.sin(angle) };
    });

    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

    // Clear
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, w, h);

    // Draw edges
    dependencies.forEach(dep => {
      const src = nodeMap[dep.source_asset_id];
      const tgt = nodeMap[dep.target_asset_id];
      if (!src || !tgt) return;
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.strokeStyle = "rgba(6,182,212,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Arrow
      const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x);
      const mx = (src.x + tgt.x) / 2, my = (src.y + tgt.y) / 2;
      ctx.beginPath();
      ctx.moveTo(mx + 6 * Math.cos(angle), my + 6 * Math.sin(angle));
      ctx.lineTo(mx - 6 * Math.cos(angle - 0.4), my - 6 * Math.sin(angle - 0.4));
      ctx.lineTo(mx - 6 * Math.cos(angle + 0.4), my - 6 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fillStyle = "rgba(6,182,212,0.4)";
      ctx.fill();
    });

    // Draw nodes
    nodes.forEach(node => {
      const meta = TYPE_META[node.asset_type];
      const cmeta = CRIT_META[node.criticality];
      const r = node.criticality === "CRITICAL" ? 22 : 18;

      // Glow
      const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 2);
      grad.addColorStop(0, `${meta?.color || "#06b6d4"}30`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(node.x - r * 2, node.y - r * 2, r * 4, r * 4);

      // Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.strokeStyle = meta?.color || "#06b6d4";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Criticality ring
      if (node.criticality === "CRITICAL") {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = `${cmeta?.color}60`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Label
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(node.asset_code, node.x, node.y + r + 14);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "8px sans-serif";
      ctx.fillText(node.name.length > 16 ? node.name.slice(0, 16) + "…" : node.name, node.x, node.y + r + 24);
    });

  }, [assets, dependencies]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-slate-500 font-mono tracking-wider">{isRTL ? "خريطة الاعتماديات" : "ASSET DEPENDENCY MAP"}</p>
          <div className="flex items-center gap-3">
            {Object.entries(TYPE_META).slice(0, 4).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1 text-[9px] text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ background: v.color }} />{isRTL ? v.labelAr : v.label}
              </span>
            ))}
          </div>
        </div>
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 300, background: "#0a1628", border: "1px solid #1e293b" }} />
        <p className="text-[9px] text-slate-600 mt-2 font-mono">{assets.length} {isRTL ? "عقدة" : "nodes"} · {dependencies.length} {isRTL ? "اعتمادية" : "edges"}</p>
      </Card>
    </div>
  );
}

// TAB 4: SPOF Detection
function SPOFTab({ isRTL, onSelectAsset }) {
  const { getSPOFs, processLinks } = useBIAAssets();
  const spofs = getSPOFs();

  return (
    <div className="space-y-4">
      <Card className={spofs.length > 0 ? "border-red-800/40" : "border-emerald-800/40"}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${spofs.length > 0 ? "bg-red-950/60 border border-red-800/50" : "bg-emerald-950/60 border border-emerald-800/50"}`}>
            <ShieldAlert size={18} className={spofs.length > 0 ? "text-red-400" : "text-emerald-400"} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {spofs.length > 0
                ? (isRTL ? `${spofs.length} نقطة فشل منفردة مكتشفة` : `${spofs.length} Single Points of Failure Detected`)
                : (isRTL ? "لا توجد نقاط فشل منفردة" : "No SPOFs Detected")}
            </p>
            <p className="text-[10px] text-slate-500">
              {isRTL ? "أصول مرتبطة بعمليات حرجة بدون بديل متاح" : "Assets linked to critical processes with no alternative available"}
            </p>
          </div>
        </div>
      </Card>

      {spofs.length > 0 && (
        <div className="space-y-3">
          {spofs.map(asset => {
            const tmeta = TYPE_META[asset.asset_type];
            const links = processLinks.filter(l => l.asset_id === asset.id && l.dependency_type === "CRITICAL" && !l.is_alternative_available);
            const TIcon = tmeta?.icon || Server;
            return (
              <Card key={asset.id} className="border-red-800/30 hover:border-red-800/50 cursor-pointer transition-all" onClick={() => onSelectAsset(asset)}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-950/40 border border-red-800/40 shrink-0">
                    <TIcon size={16} style={{ color: tmeta?.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-cyan-400">{asset.asset_code}</span>
                      <span className="text-sm font-semibold text-white">{isRTL ? asset.name_ar || asset.name : asset.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">
                      {isRTL ? "مرتبط بعمليات حرجة بدون بديل:" : "Linked to critical processes without alternatives:"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {links.map(link => (
                        <span key={link.id} className="text-[10px] px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40 text-red-400 font-semibold">
                          {isRTL ? link.process_name_ar || link.process_name : link.process_name}
                          {link.rto_hours != null && <span className="ml-1 text-red-500">RTO: {link.rto_hours}h</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                  <AlertTriangle size={16} className="text-red-400 shrink-0 mt-1 animate-pulse" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BIAAssetRegistry() {
  const { isRTL } = useApp();
  const [activeTab, setActiveTab] = useState("list");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const tabs = [
    { id: "list",      label: isRTL ? "سجل الأصول" : "Assets List",       icon: Layers },
    { id: "dashboard", label: isRTL ? "لوحة المعلومات" : "Dashboard",     icon: BarChart3 },
    { id: "graph",     label: isRTL ? "خريطة الاعتماديات" : "Dependency Map", icon: GitBranch },
    { id: "spof",      label: isRTL ? "نقاط الفشل" : "SPOF Detection",     icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <div className={`mb-5 ${isRTL ? "text-right" : ""}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)", boxShadow: "0 0 20px rgba(6,182,212,0.3)" }}>
            <Layers size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white m-0">{isRTL ? "سجل أصول تحليل تأثير الأعمال" : "BIA Asset Registry"}</h1>
            <p className="text-xs text-slate-400 m-0">{isRTL ? "جرد شامل للأصول المؤسسية وفق ISO 22301 البند 8.2.2" : "Enterprise asset inventory per ISO 22301 Clause 8.2.2"}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap
                ${isActive ? "bg-cyan-950 text-cyan-400 border-cyan-800" : "bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600"}`}>
              <Icon size={12} />
              {tab.label}
              {tab.id === "spof" && (
                <span className="ml-1 w-4 h-4 rounded-full bg-red-950 border border-red-800 flex items-center justify-center text-[9px] text-red-400 font-bold">
                  !
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "list" && <AssetsListTab isRTL={isRTL} onSelectAsset={setSelectedAsset} onAddAsset={() => setShowAddModal(true)} />}
      {activeTab === "dashboard" && <DashboardTab isRTL={isRTL} />}
      {activeTab === "graph" && <DependencyGraphTab isRTL={isRTL} />}
      {activeTab === "spof" && <SPOFTab isRTL={isRTL} onSelectAsset={setSelectedAsset} />}

      {/* Modals / Drawers */}
      {showAddModal && <AddEditAssetModal onClose={() => setShowAddModal(false)} />}
      {selectedAsset && <AssetDetailDrawer asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
    </div>
  );
}
