import { createContext, useContext, useState, useCallback } from "react";
import { regulatoryAPI } from "../services/api";

const RegulatoryContext = createContext();

// ── Fallback data when backend has no records ──────────────────────────────────
const FALLBACK_UPDATES = [
  { id: 'REG-001', title: 'تعميم NCA — تحديث ضوابط الأمن السيبراني الأساسية (ECC-2:2024)', update_type: 'CIRCULAR', severity: 'CRITICAL', status: 'ACTION_REQUIRED', body_name_en: 'National Cybersecurity Authority', body_name_ar: 'الهيئة الوطنية للأمن السيبراني', description: 'تحديث شامل لضوابط الأمن السيبراني الأساسية يشمل 114 ضابطاً محدثاً. يجب على جميع الجهات الحكومية والخاصة المشمولة تطبيق التحديثات خلال 180 يوماً من تاريخ الإصدار.', compliance_deadline: '2026-10-15', created_at: '2026-04-01T10:00:00' },
  { id: 'REG-002', title: 'SAMA BCM Framework — Mandatory Annual Testing', update_type: 'NEW_REGULATION', severity: 'HIGH', status: 'UNDER_REVIEW', body_name_en: 'Saudi Central Bank (SAMA)', body_name_ar: 'البنك المركزي السعودي', description: 'SAMA requires all licensed financial institutions to conduct annual BCM testing including tabletop exercises. Results must be submitted within 30 days of testing completion.', compliance_deadline: '2026-06-30', created_at: '2026-03-15T08:00:00' },
  { id: 'REG-003', title: 'نظام حماية البيانات الشخصية (PDPL) — اللائحة التنفيذية', update_type: 'GUIDELINE', severity: 'HIGH', status: 'NEW', body_name_en: 'SDAIA', body_name_ar: 'الهيئة السعودية للبيانات والذكاء الاصطناعي', description: 'صدور اللائحة التنفيذية لنظام حماية البيانات الشخصية بنسختها النهائية. تضمنت تفاصيل آليات الموافقة ونقل البيانات عبر الحدود والإخطار بالحوادث.', compliance_deadline: '2026-09-14', created_at: '2026-03-01T12:00:00' },
  { id: 'REG-004', title: 'NDMO Data Classification Policy Update v3.0', update_type: 'AMENDMENT', severity: 'MEDIUM', status: 'COMPLIANT', body_name_en: 'National Data Management Office', body_name_ar: 'مكتب إدارة البيانات الوطنية', description: 'Updated classification levels and handling procedures for government data. Includes new categories for AI training data and cloud-hosted datasets.', compliance_deadline: '2026-08-01', created_at: '2026-02-20T09:30:00' },
  { id: 'REG-005', title: 'تعميم ISO 22301 — متطلبات مؤشر صمود الوطني', update_type: 'CIRCULAR', severity: 'MEDIUM', status: 'UNDER_REVIEW', body_name_en: 'NDMA', body_name_ar: 'الهيئة الوطنية لإدارة الطوارئ', description: 'إلزام الجهات الحيوية بتحقيق المستوى الرابع (مُدار) كحد أدنى في مؤشر صمود الوطني بنهاية السنة المالية 2026.', compliance_deadline: '2026-12-31', created_at: '2026-02-10T14:00:00' },
  { id: 'REG-006', title: 'Cloud Computing Regulatory Framework Update', update_type: 'AMENDMENT', severity: 'LOW', status: 'COMPLIANT', body_name_en: 'CITC', body_name_ar: 'هيئة الاتصالات والفضاء والتقنية', description: 'Updated guidelines for cloud service providers and consumers operating in KSA. Includes new provisions for multi-cloud resilience.', compliance_deadline: null, created_at: '2026-01-15T11:00:00' },
];
const FALLBACK_BODIES = [
  { id: 1, name_en: 'National Cybersecurity Authority', name_ar: 'الهيئة الوطنية للأمن السيبراني', abbreviation: 'NCA', jurisdiction: 'Cybersecurity', website_url: 'https://nca.gov.sa' },
  { id: 2, name_en: 'Saudi Central Bank', name_ar: 'البنك المركزي السعودي', abbreviation: 'SAMA', jurisdiction: 'Financial Regulation', website_url: 'https://sama.gov.sa' },
  { id: 3, name_en: 'SDAIA', name_ar: 'الهيئة السعودية للبيانات والذكاء الاصطناعي', abbreviation: 'SDAIA', jurisdiction: 'Data Protection', website_url: 'https://sdaia.gov.sa' },
  { id: 4, name_en: 'National Data Management Office', name_ar: 'مكتب إدارة البيانات الوطنية', abbreviation: 'NDMO', jurisdiction: 'Data Governance', website_url: 'https://ndmo.gov.sa' },
  { id: 5, name_en: 'CITC', name_ar: 'هيئة الاتصالات والفضاء والتقنية', abbreviation: 'CITC', jurisdiction: 'Telecom & Technology', website_url: 'https://citc.gov.sa' },
];
const FALLBACK_DASHBOARD = { total_updates_this_year: 6, compliance_rate_pct: 72, pending_review: 2, overdue_action_items: 1 };

export function RegulatoryProvider({ children }) {
  const [updates, setUpdates] = useState([]);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [bodies, setBodies] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUpdates = useCallback(async (params) => {
    try {
      setLoading(true);
      const res = await regulatoryAPI.listUpdates(params);
      const data = res.data || [];
      setUpdates(data.length > 0 ? data : FALLBACK_UPDATES);
    } catch (e) { console.error("Failed to load updates:", e); setUpdates(FALLBACK_UPDATES); }
    finally { setLoading(false); }
  }, []);

  const loadUpdate = useCallback(async (id) => {
    try {
      const res = await regulatoryAPI.getUpdate(id);
      setSelectedUpdate(res);
      return res;
    } catch (e) { console.error("Failed to load update:", e); return null; }
  }, []);

  const createUpdate = useCallback(async (data) => {
    try {
      const res = await regulatoryAPI.createUpdate(data);
      setUpdates(prev => [res, ...prev]);
      return res;
    } catch (e) { console.error("Failed to create update:", e); return null; }
  }, []);

  const loadBodies = useCallback(async () => {
    try {
      const res = await regulatoryAPI.bodies();
      const data = res.data || [];
      setBodies(data.length > 0 ? data : FALLBACK_BODIES);
    } catch (e) { console.error("Failed to load bodies:", e); setBodies(FALLBACK_BODIES); }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await regulatoryAPI.dashboard();
      setDashboard(res || FALLBACK_DASHBOARD);
    } catch (e) { console.error("Failed to load dashboard:", e); setDashboard(FALLBACK_DASHBOARD); }
  }, []);

  const loadCalendar = useCallback(async (days) => {
    try {
      const res = await regulatoryAPI.calendar(days);
      setCalendar(res);
    } catch (e) { console.error("Failed to load calendar:", e); }
  }, []);

  return (
    <RegulatoryContext.Provider value={{
      updates, selectedUpdate, bodies, dashboard, calendar, loading,
      loadUpdates, loadUpdate, createUpdate, loadBodies,
      loadDashboard, loadCalendar, setSelectedUpdate,
    }}>
      {children}
    </RegulatoryContext.Provider>
  );
}

export function useRegulatory() {
  const ctx = useContext(RegulatoryContext);
  if (!ctx) throw new Error("useRegulatory must be used within RegulatoryProvider");
  return ctx;
}

export default RegulatoryContext;
