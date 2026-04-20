import { createContext, useContext, useState, useCallback } from "react";
import { vendorsAPI } from "../services/api";

const VendorContext = createContext();

// ── Fallback seed data when API is unavailable ──────────────────────────────
const SEED_VENDORS = [
  { id: "VND-001", vendor_name: "شركة علم لأمن المعلومات", category: "IT_SERVICES", country: "Saudi Arabia", contact_name: "م. عبدالرحمن الشهري", contact_email: "a.alshehri@elm.sa", contract_start: "2024-01-15", contract_end: "2026-06-30", contract_value_sar: 2850000, data_access_level: "EXTENSIVE", hosts_data_offshore: false, is_critical: true, status: "ACTIVE", latest_risk_tier: "MEDIUM", latest_overall_score: 3.8 },
  { id: "VND-002", vendor_name: "أمازون ويب سيرفسز (AWS)", category: "CLOUD_PROVIDER", country: "United States", contact_name: "Sarah Johnson", contact_email: "enterprise@aws.com", contract_start: "2025-03-01", contract_end: "2026-05-15", contract_value_sar: 4200000, data_access_level: "FULL", hosts_data_offshore: true, is_critical: true, status: "ACTIVE", latest_risk_tier: "HIGH", latest_overall_score: 2.9 },
  { id: "VND-003", vendor_name: "شركة الحلول المتقدمة للاتصالات", category: "TELECOM", country: "Saudi Arabia", contact_name: "م. فهد القحطاني", contact_email: "f.alqahtani@ats.sa", contract_start: "2023-07-01", contract_end: "2026-05-15", contract_value_sar: 1650000, data_access_level: "MODERATE", hosts_data_offshore: false, is_critical: true, status: "ACTIVE", latest_risk_tier: "MEDIUM", latest_overall_score: 3.5 },
  { id: "VND-004", vendor_name: "ديلويت الشرق الأوسط", category: "CONSULTING", country: "Saudi Arabia", contact_name: "أحمد المالكي", contact_email: "ahmed@deloitte.com", contract_start: "2025-01-01", contract_end: "2026-12-31", contract_value_sar: 3500000, data_access_level: "LIMITED", hosts_data_offshore: false, is_critical: false, status: "ACTIVE", latest_risk_tier: "LOW", latest_overall_score: 4.2 },
  { id: "VND-005", vendor_name: "شركة البيانات الذكية", category: "IT_SERVICES", country: "UAE", contact_name: "خالد العمري", contact_email: "k.alomari@smartdata.ae", contract_start: "2024-06-01", contract_end: "2026-04-30", contract_value_sar: 980000, data_access_level: "EXTENSIVE", hosts_data_offshore: true, is_critical: true, status: "UNDER_REVIEW", latest_risk_tier: "CRITICAL", latest_overall_score: 1.8 },
  { id: "VND-006", vendor_name: "مايكروسوفت العربية", category: "CLOUD_PROVIDER", country: "Saudi Arabia", contact_name: "نورة السبيعي", contact_email: "n.alsubaie@microsoft.com", contract_start: "2025-04-01", contract_end: "2027-03-31", contract_value_sar: 5100000, data_access_level: "FULL", hosts_data_offshore: false, is_critical: true, status: "ACTIVE", latest_risk_tier: "LOW", latest_overall_score: 4.5 },
  { id: "VND-007", vendor_name: "شركة STC للاتصالات", category: "TELECOM", country: "Saudi Arabia", contact_name: "م. سعد العتيبي", contact_email: "s.alotaibi@stc.sa", contract_start: "2022-01-01", contract_end: "2027-12-31", contract_value_sar: 8200000, data_access_level: "LIMITED", hosts_data_offshore: false, is_critical: true, status: "ACTIVE", latest_risk_tier: "LOW", latest_overall_score: 4.4 },
  { id: "VND-008", vendor_name: "شركة SAP السعودية", category: "IT_SERVICES", country: "Saudi Arabia", contact_name: "Thomas Mueller", contact_email: "t.mueller@sap.com", contract_start: "2023-06-01", contract_end: "2028-05-31", contract_value_sar: 6800000, data_access_level: "EXTENSIVE", hosts_data_offshore: false, is_critical: true, status: "ACTIVE", latest_risk_tier: "LOW", latest_overall_score: 4.3 },
  { id: "VND-009", vendor_name: "مجموعة الأمن الموحد", category: "IT_SERVICES", country: "Saudi Arabia", contact_name: "م. عبدالله الدوسري", contact_email: "a.aldosari@unified.sa", contract_start: "2024-03-15", contract_end: "2026-04-30", contract_value_sar: 450000, data_access_level: "EXTENSIVE", hosts_data_offshore: false, is_critical: false, status: "ACTIVE", latest_risk_tier: "MEDIUM", latest_overall_score: 3.6 },
  { id: "VND-010", vendor_name: "شركة نظم المعلومات المتقدمة", category: "IT_SERVICES", country: "Saudi Arabia", contact_name: "نايف الغامدي", contact_email: "n.alghamdi@ais.sa", contract_start: "2024-09-01", contract_end: "2026-05-20", contract_value_sar: 1200000, data_access_level: "MODERATE", hosts_data_offshore: false, is_critical: true, status: "ACTIVE", latest_risk_tier: "MEDIUM", latest_overall_score: 3.4 },
  { id: "VND-011", vendor_name: "أوراكل السعودية", category: "IT_SERVICES", country: "Saudi Arabia", contact_name: "Rebecca Chen", contact_email: "r.chen@oracle.com", contract_start: "2024-05-01", contract_end: "2027-04-30", contract_value_sar: 3900000, data_access_level: "FULL", hosts_data_offshore: false, is_critical: true, status: "ACTIVE", latest_risk_tier: "LOW", latest_overall_score: 4.1 },
  { id: "VND-012", vendor_name: "شركة تعاون الأمن السيبراني", category: "IT_SERVICES", country: "Saudi Arabia", contact_name: "م. ماجد الحربي", contact_email: "m.alharbi@taawon.sa", contract_start: "2024-11-01", contract_end: "2026-06-15", contract_value_sar: 780000, data_access_level: "EXTENSIVE", hosts_data_offshore: false, is_critical: true, status: "ACTIVE", latest_risk_tier: "MEDIUM", latest_overall_score: 3.2 },
  { id: "VND-013", vendor_name: "PwC الشرق الأوسط", category: "CONSULTING", country: "UAE", contact_name: "Jennifer Adams", contact_email: "j.adams@pwc.com", contract_start: "2025-02-01", contract_end: "2026-05-01", contract_value_sar: 2100000, data_access_level: "LIMITED", hosts_data_offshore: false, is_critical: false, status: "ACTIVE", latest_risk_tier: "LOW", latest_overall_score: 4.0 },
  { id: "VND-014", vendor_name: "شركة معدات الطاقة المتقدمة", category: "HARDWARE", country: "Saudi Arabia", contact_name: "م. خالد الزهراني", contact_email: "k.alzahrani@power.sa", contract_start: "2023-12-01", contract_end: "2026-11-30", contract_value_sar: 1850000, data_access_level: "NONE", hosts_data_offshore: false, is_critical: false, status: "ACTIVE", latest_risk_tier: "LOW", latest_overall_score: 4.6 },
];

const SEED_DASHBOARD = {
  total_vendors: 14,
  by_tier: [
    { risk_tier: "CRITICAL", count: 1 },
    { risk_tier: "HIGH", count: 1 },
    { risk_tier: "MEDIUM", count: 4 },
    { risk_tier: "LOW", count: 8 },
  ],
  expiring_contracts_30d: 4,
  critical_vendors: 10,
  average_risk_score: 3.6,
};

export function VendorProvider({ children }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, per_page: 25, total: 0 });

  const loadVendors = useCallback(async (params) => {
    try {
      setLoading(true);
      const res = await vendorsAPI.list(params);
      const data = res.data || res || [];
      if (data.length > 0) {
        setVendors(data);
        if (res.pagination) setPagination(res.pagination);
      } else {
        setVendors(SEED_VENDORS);
        setPagination({ page: 1, per_page: 25, total: SEED_VENDORS.length });
      }
    } catch (e) {
      console.warn("[VendorContext] API unavailable, using seed data:", e.message);
      setVendors(SEED_VENDORS);
      setPagination({ page: 1, per_page: 25, total: SEED_VENDORS.length });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVendor = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await vendorsAPI.get(id);
      setSelectedVendor(res);
      return res;
    } catch (e) {
      const found = SEED_VENDORS.find(v => v.id === id);
      if (found) {
        setSelectedVendor(found);
        return found;
      }
      console.error("Failed to load vendor:", e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createVendor = useCallback(async (data) => {
    try {
      const res = await vendorsAPI.create(data);
      setVendors(prev => [res, ...prev]);
      return res;
    } catch (e) {
      console.warn("[VendorContext] API unavailable, creating locally");
      const newVendor = {
        ...data,
        id: `VND-${String(vendors.length + 15).padStart(3, "0")}`,
        status: "ACTIVE",
        latest_risk_tier: null,
        latest_overall_score: null,
        created_at: new Date().toISOString(),
      };
      setVendors(prev => [newVendor, ...prev]);
      return newVendor;
    }
  }, [vendors.length]);

  const updateVendor = useCallback(async (id, data) => {
    try {
      const res = await vendorsAPI.update(id, data);
      setVendors(prev => prev.map(v => v.id === id ? res : v));
      return res;
    } catch (e) {
      const updated = { ...data, id, updated_at: new Date().toISOString() };
      setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v));
      return updated;
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await vendorsAPI.dashboard();
      setDashboard(res);
    } catch (e) {
      console.warn("[VendorContext] Dashboard API unavailable, using seed data");
      setDashboard(SEED_DASHBOARD);
    }
  }, []);

  return (
    <VendorContext.Provider value={{
      vendors, selectedVendor, dashboard, loading, pagination,
      loadVendors, loadVendor, createVendor, updateVendor,
      loadDashboard, setSelectedVendor,
    }}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendors() {
  const ctx = useContext(VendorContext);
  if (!ctx) throw new Error("useVendors must be used within VendorProvider");
  return ctx;
}

export default VendorContext;
