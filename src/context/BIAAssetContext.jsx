import { createContext, useContext, useState, useCallback } from "react";

// ── Demo seed data ──────────────────────────────────────────────────────────
const SEED_ASSETS = [
  {
    id: "a1", asset_code: "ITS-0001", name: "Core Banking System", name_ar: "نظام الخدمات المصرفية الأساسي",
    asset_type: "IT_SYSTEM", description: "Primary core banking platform handling all transaction processing",
    description_ar: "المنصة المصرفية الأساسية لمعالجة جميع المعاملات",
    owner: "IT Infrastructure", department: "IT", location: "Primary DC — Riyadh",
    criticality: "CRITICAL", status: "ACTIVE", rto_hours: 2, rpo_hours: 0, mtpd_hours: 4,
    recovery_procedure: "Failover to DR site, restore from real-time replication",
    vendor_name: "Oracle", vendor_contact: "support@oracle.com", contract_expiry: "2027-12-31",
    created_at: "2026-01-15T10:00:00Z", updated_at: "2026-03-20T14:30:00Z",
  },
  {
    id: "a2", asset_code: "APP-0001", name: "Customer Portal", name_ar: "بوابة العملاء",
    asset_type: "APPLICATION", description: "Web/mobile application for customer self-service banking",
    description_ar: "تطبيق الويب والهاتف للخدمة المصرفية الذاتية",
    owner: "Digital Banking", department: "Digital", location: "Cloud — AWS GCC",
    criticality: "HIGH", status: "ACTIVE", rto_hours: 4, rpo_hours: 1, mtpd_hours: 8,
    recovery_procedure: "Auto-scaling failover via AWS Route53",
    vendor_name: "Internal", vendor_contact: "-", contract_expiry: null,
    created_at: "2026-01-20T08:00:00Z", updated_at: "2026-03-18T11:15:00Z",
  },
  {
    id: "a3", asset_code: "FAC-0001", name: "Primary Data Center", name_ar: "مركز البيانات الرئيسي",
    asset_type: "FACILITY", description: "Tier-4 data center hosting all production workloads",
    description_ar: "مركز بيانات من الدرجة الرابعة يستضيف جميع الأحمال الإنتاجية",
    owner: "Facilities Mgmt", department: "Operations", location: "Riyadh, KSA",
    criticality: "CRITICAL", status: "ACTIVE", rto_hours: 24, rpo_hours: null, mtpd_hours: 48,
    recovery_procedure: "Transfer operations to DR site in Jeddah",
    vendor_name: "STC", vendor_contact: "enterprise@stc.com.sa", contract_expiry: "2028-06-30",
    created_at: "2026-01-10T06:00:00Z", updated_at: "2026-02-28T09:00:00Z",
  },
  {
    id: "a4", asset_code: "PER-0001", name: "CISO — Khalid Alghofaili", name_ar: "المسؤول الأمني — خالد الغفيلي",
    asset_type: "PERSONNEL", description: "Chief Information Security Officer — single point of executive authority for security",
    description_ar: "كبير مسؤولي أمن المعلومات — سلطة تنفيذية منفردة للأمن",
    owner: "Board of Directors", department: "Executive", location: "HQ — Riyadh",
    criticality: "CRITICAL", status: "ACTIVE", rto_hours: null, rpo_hours: null, mtpd_hours: null,
    recovery_procedure: "Deputy CISO assumes authority per succession plan",
    vendor_name: null, vendor_contact: null, contract_expiry: null,
    created_at: "2026-01-05T07:00:00Z", updated_at: "2026-01-05T07:00:00Z",
  },
  {
    id: "a5", asset_code: "VEN-0001", name: "AWS Cloud Services", name_ar: "خدمات AWS السحابية",
    asset_type: "VENDOR", description: "Primary cloud infrastructure provider for non-core workloads",
    description_ar: "مزود البنية التحتية السحابية الرئيسي للأحمال غير الأساسية",
    owner: "Vendor Management", department: "Procurement", location: "Global (GCC Region)",
    criticality: "HIGH", status: "ACTIVE", rto_hours: 4, rpo_hours: 1, mtpd_hours: 12,
    recovery_procedure: "Multi-region failover, Azure DR standby",
    vendor_name: "Amazon Web Services", vendor_contact: "enterprise-ksa@aws.com", contract_expiry: "2027-03-31",
    created_at: "2026-02-01T10:00:00Z", updated_at: "2026-03-15T16:00:00Z",
  },
  {
    id: "a6", asset_code: "DAT-0001", name: "Customer PII Database", name_ar: "قاعدة بيانات المعلومات الشخصية",
    asset_type: "DATA", description: "Centralized customer personally identifiable information store (~2.4M records)",
    description_ar: "مخزن مركزي لمعلومات العملاء الشخصية (~2.4 مليون سجل)",
    owner: "Data Office", department: "IT", location: "Primary DC — Encrypted at rest",
    criticality: "CRITICAL", status: "ACTIVE", rto_hours: 1, rpo_hours: 0, mtpd_hours: 2,
    recovery_procedure: "Real-time replication to DR, point-in-time recovery available",
    vendor_name: null, vendor_contact: null, contract_expiry: null,
    created_at: "2026-01-12T09:00:00Z", updated_at: "2026-03-22T08:45:00Z",
  },
];

const SEED_PROCESS_LINKS = [
  { id: "l1", asset_id: "a1", process_id: "p1", process_name: "Payment Processing", process_name_ar: "معالجة المدفوعات", dependency_type: "CRITICAL", is_alternative_available: false, rto_hours: 2 },
  { id: "l2", asset_id: "a1", process_id: "p2", process_name: "Loan Origination", process_name_ar: "إصدار القروض", dependency_type: "IMPORTANT", is_alternative_available: true, rto_hours: 8 },
  { id: "l3", asset_id: "a2", process_id: "p1", process_name: "Payment Processing", process_name_ar: "معالجة المدفوعات", dependency_type: "SUPPORTING", is_alternative_available: true, rto_hours: 2 },
  { id: "l4", asset_id: "a6", process_id: "p3", process_name: "KYC / AML Screening", process_name_ar: "فحص KYC / AML", dependency_type: "CRITICAL", is_alternative_available: false, rto_hours: 1 },
  { id: "l5", asset_id: "a3", process_id: "p1", process_name: "Payment Processing", process_name_ar: "معالجة المدفوعات", dependency_type: "CRITICAL", is_alternative_available: false, rto_hours: 2 },
  { id: "l6", asset_id: "a4", process_id: "p4", process_name: "Incident Response", process_name_ar: "الاستجابة للحوادث", dependency_type: "CRITICAL", is_alternative_available: false, rto_hours: 0.5 },
];

const SEED_DEPENDENCIES = [
  { id: "d1", source_asset_id: "a2", target_asset_id: "a1", relationship_type: "DEPENDS_ON" },
  { id: "d2", source_asset_id: "a1", target_asset_id: "a3", relationship_type: "DEPENDS_ON" },
  { id: "d3", source_asset_id: "a1", target_asset_id: "a6", relationship_type: "FEEDS_DATA" },
  { id: "d4", source_asset_id: "a2", target_asset_id: "a5", relationship_type: "DEPENDS_ON" },
  { id: "d5", source_asset_id: "a6", target_asset_id: "a3", relationship_type: "DEPENDS_ON" },
];

const BIAAssetContext = createContext();

export function BIAAssetProvider({ children }) {
  const [assets, setAssets] = useState(SEED_ASSETS);
  const [processLinks, setProcessLinks] = useState(SEED_PROCESS_LINKS);
  const [dependencies, setDependencies] = useState(SEED_DEPENDENCIES);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const addAsset = useCallback((data) => {
    const typePrefix = { IT_SYSTEM: "ITS", APPLICATION: "APP", FACILITY: "FAC", EQUIPMENT: "EQP", PERSONNEL: "PER", VENDOR: "VEN", DATA: "DAT", DOCUMENT: "DOC" };
    const prefix = typePrefix[data.asset_type] || "AST";
    const maxNum = assets
      .filter(a => a.asset_code.startsWith(prefix))
      .reduce((max, a) => Math.max(max, parseInt(a.asset_code.split("-")[1]) || 0), 0);
    const newAsset = {
      ...data,
      id: `a${Date.now()}`,
      asset_code: `${prefix}-${String(maxNum + 1).padStart(4, "0")}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAssets(prev => [newAsset, ...prev]);
    return newAsset;
  }, [assets]);

  const updateAsset = useCallback((id, data) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...data, updated_at: new Date().toISOString() } : a));
  }, []);

  const deleteAsset = useCallback((id) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    setProcessLinks(prev => prev.filter(l => l.asset_id !== id));
    setDependencies(prev => prev.filter(d => d.source_asset_id !== id && d.target_asset_id !== id));
  }, []);

  // ── RTO Inheritance ──────────────────────────────────────────────────────
  const getInheritedRTO = useCallback((assetId) => {
    const links = processLinks.filter(l => l.asset_id === assetId && l.rto_hours != null);
    if (!links.length) return null;
    return Math.min(...links.map(l => l.rto_hours));
  }, [processLinks]);

  // ── Effective Criticality ────────────────────────────────────────────────
  const CRIT_ORDER = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const CRIT_LABELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  const getEffectiveCriticality = useCallback((asset) => {
    const intrinsic = CRIT_ORDER[asset.criticality] || 1;
    const links = processLinks.filter(l => l.asset_id === asset.id);
    const inherited = links.length > 0
      ? Math.max(...links.map(l => CRIT_ORDER[l.dependency_type === "CRITICAL" ? "CRITICAL" : l.dependency_type === "IMPORTANT" ? "HIGH" : "MEDIUM"]))
      : 0;
    const effective = Math.max(intrinsic, inherited);
    return CRIT_LABELS[effective - 1] || "LOW";
  }, [processLinks]);

  // ── SPOF Detection ─────────────────────────────────────────────────────
  const getSPOFs = useCallback(() => {
    return assets.filter(asset => {
      const links = processLinks.filter(l => l.asset_id === asset.id);
      return links.some(l => l.dependency_type === "CRITICAL" && !l.is_alternative_available);
    });
  }, [assets, processLinks]);

  // ── Dashboard Stats ────────────────────────────────────────────────────
  const getDashboardStats = useCallback(() => {
    const byType = {};
    const byCrit = {};
    assets.forEach(a => {
      byType[a.asset_type] = (byType[a.asset_type] || 0) + 1;
      byCrit[a.criticality] = (byCrit[a.criticality] || 0) + 1;
    });
    return {
      totalAssets: assets.length,
      byType,
      byCriticality: byCrit,
      activeCount: assets.filter(a => a.status === "ACTIVE").length,
      spofCount: getSPOFs().length,
      linkedProcesses: new Set(processLinks.map(l => l.process_id)).size,
    };
  }, [assets, processLinks, getSPOFs]);

  // ── Get links/deps for an asset ────────────────────────────────────────
  const getAssetLinks = useCallback((assetId) => processLinks.filter(l => l.asset_id === assetId), [processLinks]);
  const getAssetDeps = useCallback((assetId) =>
    dependencies.filter(d => d.source_asset_id === assetId || d.target_asset_id === assetId), [dependencies]);

  const value = {
    assets, processLinks, dependencies,
    addAsset, updateAsset, deleteAsset,
    getInheritedRTO, getEffectiveCriticality, getSPOFs,
    getDashboardStats, getAssetLinks, getAssetDeps,
  };

  return <BIAAssetContext.Provider value={value}>{children}</BIAAssetContext.Provider>;
}

export function useBIAAssets() {
  const ctx = useContext(BIAAssetContext);
  if (!ctx) throw new Error("useBIAAssets must be used within BIAAssetProvider");
  return ctx;
}
