import { createContext, useContext, useState, useCallback } from "react";
import { incidentsAPI } from "../services/api";

const IncidentContext = createContext();

// ── Fallback seed data when API is unavailable ──────────────────────────────
const SEED_INCIDENTS = [
  {
    id: "INC-2026-0001",
    title: "هجوم فدية على خوادم قواعد البيانات",
    description: "رصد نشاط مشبوه على خادم DB-PRIMARY-01 من قبل نظام SIEM، تم تأكيد وجود برنامج فدية LockBit 3.0",
    incident_type: "CYBER_ATTACK",
    severity: "P1_CRITICAL",
    status: "INVESTIGATING",
    detected_at: "2026-04-03T08:15:00Z",
    affected_systems: ["خوادم قواعد البيانات الرئيسية", "نظام البريد الإلكتروني"],
    affected_departments: ["تقنية المعلومات", "العمليات"],
    estimated_financial_impact_sar: 3500000,
    data_records_affected: 0,
    service_downtime_hours: 18.5,
    requires_regulatory_notification: true,
    regulatory_body: "NCA",
    notification_deadline: "2026-04-04T08:15:00Z",
    notification_sent_at: "2026-04-03T10:30:00Z",
    created_at: "2026-04-03T08:20:00Z",
    updated_at: "2026-04-03T14:00:00Z",
  },
  {
    id: "INC-2026-0002",
    title: "انقطاع خدمة البوابة الإلكترونية",
    description: "انقطاع مفاجئ في البوابة الإلكترونية بسبب تحديث فاشل لقاعدة البيانات أدى لتعطل نظام الخدمات الإلكترونية",
    incident_type: "SYSTEM_OUTAGE",
    severity: "P2_HIGH",
    status: "RESOLVED",
    detected_at: "2026-03-28T14:30:00Z",
    resolved_at: "2026-03-28T18:45:00Z",
    affected_systems: ["البوابة الإلكترونية", "نظام الخدمات الذاتية"],
    affected_departments: ["خدمة العملاء"],
    estimated_financial_impact_sar: 450000,
    service_downtime_hours: 4.25,
    requires_regulatory_notification: false,
    created_at: "2026-03-28T14:35:00Z",
    updated_at: "2026-03-28T18:50:00Z",
  },
  {
    id: "INC-2026-0003",
    title: "تسريب بيانات موظفين عبر مورد خارجي",
    description: "اكتشاف بيانات موظفين على منتدى ويب مظلم — مصدرها مورد «البيانات الذكية» المتعاقد على خدمة إدارة الرواتب",
    incident_type: "DATA_BREACH",
    severity: "P1_CRITICAL",
    status: "CONTAINED",
    detected_at: "2026-03-15T11:00:00Z",
    contained_at: "2026-03-15T16:30:00Z",
    affected_systems: ["نظام إدارة الموارد البشرية", "بوابة الموظفين"],
    affected_departments: ["الموارد البشرية", "المالية"],
    estimated_financial_impact_sar: 2100000,
    data_records_affected: 3200,
    requires_regulatory_notification: true,
    regulatory_body: "SDAIA",
    notification_deadline: "2026-03-16T11:00:00Z",
    notification_sent_at: "2026-03-15T14:00:00Z",
    created_at: "2026-03-15T11:10:00Z",
    updated_at: "2026-03-16T09:00:00Z",
  },
  {
    id: "INC-2026-0004",
    title: "محاولة تصيّد استهدفت الإدارة العليا",
    description: "رسائل تصيد متقدمة استهدفت 5 من أعضاء الإدارة العليا تحاكي رسائل من جهة حكومية رسمية",
    incident_type: "CYBER_ATTACK",
    severity: "P3_MEDIUM",
    status: "CLOSED",
    detected_at: "2026-03-10T09:00:00Z",
    resolved_at: "2026-03-10T12:00:00Z",
    closed_at: "2026-03-12T10:00:00Z",
    affected_systems: ["نظام البريد الإلكتروني"],
    affected_departments: ["الإدارة التنفيذية"],
    estimated_financial_impact_sar: 0,
    requires_regulatory_notification: false,
    created_at: "2026-03-10T09:05:00Z",
    updated_at: "2026-03-12T10:00:00Z",
  },
  {
    id: "INC-2026-0005",
    title: "عطل في نظام التكييف — مركز البيانات الرئيسي",
    description: "ارتفاع درجة الحرارة في الجناح الشرقي من مركز البيانات بسبب عطل في وحدة التبريد رقم 3",
    incident_type: "OPERATIONAL_FAILURE",
    severity: "P2_HIGH",
    status: "RESOLVED",
    detected_at: "2026-02-20T22:30:00Z",
    resolved_at: "2026-02-21T04:15:00Z",
    affected_systems: ["مركز البيانات الرئيسي"],
    affected_departments: ["تقنية المعلومات"],
    estimated_financial_impact_sar: 180000,
    service_downtime_hours: 0,
    requires_regulatory_notification: false,
    created_at: "2026-02-20T22:35:00Z",
    updated_at: "2026-02-21T04:20:00Z",
  },
];

const SEED_DASHBOARD = {
  open_incidents: 2,
  by_severity: [
    { severity: "P1_CRITICAL", count: 2 },
    { severity: "P2_HIGH", count: 1 },
    { severity: "P3_MEDIUM", count: 1 },
  ],
  incidents_this_month: 1,
  avg_resolution_hours: 4.2,
  pending_regulatory_notifications: 0,
};

export function IncidentProvider({ children }) {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadIncidents = useCallback(async (params) => {
    try {
      setLoading(true);
      const res = await incidentsAPI.list(params);
      const data = res.data || res || [];
      setIncidents(data.length > 0 ? data : SEED_INCIDENTS);
    } catch (e) {
      console.warn("[IncidentContext] API unavailable, using seed data:", e.message);
      setIncidents(SEED_INCIDENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadIncident = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await incidentsAPI.get(id);
      setSelectedIncident(res);
      return res;
    } catch (e) {
      // Fallback: find from seed data
      const found = SEED_INCIDENTS.find(i => i.id === id);
      if (found) {
        setSelectedIncident(found);
        return found;
      }
      console.error("Failed to load incident:", e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createIncident = useCallback(async (data) => {
    try {
      const res = await incidentsAPI.create(data);
      setIncidents(prev => [res, ...prev]);
      return res;
    } catch (e) {
      // Fallback: create locally
      console.warn("[IncidentContext] API unavailable, creating locally");
      const newIncident = {
        ...data,
        id: `INC-2026-${String(incidents.length + 6).padStart(4, "0")}`,
        status: "OPEN",
        detected_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        requires_regulatory_notification:
          (data.severity === "P1_CRITICAL" || data.severity === "P2_HIGH") &&
          (data.incident_type === "CYBER_ATTACK" || data.incident_type === "DATA_BREACH"),
        regulatory_body:
          data.incident_type === "CYBER_ATTACK" ? "NCA" :
          data.incident_type === "DATA_BREACH" ? "SDAIA" : null,
      };
      setIncidents(prev => [newIncident, ...prev]);
      return newIncident;
    }
  }, [incidents.length]);

  const updateIncident = useCallback(async (id, data) => {
    try {
      const res = await incidentsAPI.update(id, data);
      setSelectedIncident(res);
      setIncidents(prev => prev.map(i => i.id === id ? res : i));
      return res;
    } catch (e) {
      // Fallback: update locally
      const updated = { ...data, id, updated_at: new Date().toISOString() };
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
      setSelectedIncident(prev => prev?.id === id ? { ...prev, ...updated } : prev);
      return updated;
    }
  }, []);

  const changeStatus = useCallback(async (id, status) => {
    try {
      const res = await incidentsAPI.changeStatus(id, status);
      setSelectedIncident(res);
      setIncidents(prev => prev.map(i => i.id === id ? res : i));
      return res;
    } catch (e) {
      // Fallback: update locally
      const updates = { status, updated_at: new Date().toISOString() };
      if (status === "RESOLVED") updates.resolved_at = new Date().toISOString();
      if (status === "CONTAINED") updates.contained_at = new Date().toISOString();
      if (status === "CLOSED") updates.closed_at = new Date().toISOString();
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
      setSelectedIncident(prev => prev?.id === id ? { ...prev, ...updates } : prev);
      return updates;
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await incidentsAPI.dashboard();
      setDashboard(res);
    } catch (e) {
      console.warn("[IncidentContext] Dashboard API unavailable, using seed data");
      setDashboard(SEED_DASHBOARD);
    }
  }, []);

  return (
    <IncidentContext.Provider value={{
      incidents, selectedIncident, dashboard, loading,
      loadIncidents, loadIncident, createIncident,
      updateIncident, changeStatus, loadDashboard,
      setSelectedIncident,
    }}>
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const ctx = useContext(IncidentContext);
  if (!ctx) throw new Error("useIncidents must be used within IncidentProvider");
  return ctx;
}

export default IncidentContext;
