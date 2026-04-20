import { createContext, useContext, useState, useCallback } from "react";
import { demoBIAAssessments, demoBIAProcesses } from "../data/demoBIA";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uuid = () => "BIA-" + Math.random().toString(36).slice(2, 10).toUpperCase();

/** Compute risk label + color from a numeric score (likelihood × impact) */
const scoreMeta = (score) => {
  if (score >= 20) return { label: "كارثي", labelEn: "Catastrophic", color: "#7f1d1d" };
  if (score >= 15) return { label: "عالي", labelEn: "High", color: "#ef4444" };
  if (score >= 10) return { label: "متوسط", labelEn: "Medium", color: "#f97316" };
  if (score >= 5)  return { label: "منخفض", labelEn: "Low", color: "#eab308" };
  return { label: "منخفض جداً", labelEn: "Very Low", color: "#22c55e" };
};

/** Auto-suggest RTO from MTPD (20% safety margin per ISO 22301 Clause 8.2.2) */
const suggestRTO = (mtpd) => Math.round(mtpd * 0.7 * 100) / 100;

/**
 * Derive MTPD from impact ratings: the earliest time period where any
 * impact category reaches severity 5 (catastrophic).
 */
const deriveMTPD = (impactRatings) => {
  const periods = [1, 4, 8, 24, 48, 72, 168];
  for (const h of periods) {
    const atTime = impactRatings.filter((r) => r.time_interval_hours === h);
    if (atTime.some((r) => r.severity_score >= 5)) return h;
  }
  return 168; // default to max if nothing is catastrophic
};

// ─── Impact Categories (DGA-compliant) ────────────────────────────────────────
const IMPACT_CATEGORIES = ["OPERATIONAL", "FINANCIAL", "LEGAL_REGULATORY_STRATEGIC", "REPUTATIONAL"];
const TIME_INTERVALS = [1, 4, 8, 24, 48, 72, 168];

const IMPACT_CATEGORY_LABELS = {
  OPERATIONAL:                { ar: "تشغيلية",           en: "Operational" },
  FINANCIAL:                  { ar: "مالية",             en: "Financial" },
  LEGAL_REGULATORY_STRATEGIC: { ar: "قانونية/تنظيمية/استراتيجية", en: "Legal / Regulatory / Strategic" },
  REPUTATIONAL:               { ar: "سمعة",             en: "Reputational" },
};

const CRITICALITY_LEVELS = [
  { value: "CRITICAL", ar: "حرج", en: "Critical", color: "#ef4444" },
  { value: "HIGH",     ar: "عالي", en: "High",     color: "#f97316" },
  { value: "MEDIUM",   ar: "متوسط", en: "Medium",   color: "#eab308" },
  { value: "LOW",      ar: "منخفض", en: "Low",     color: "#22c55e" },
];

const DEPENDENCY_TYPES = [
  { value: "IT_SYSTEM",       ar: "نظام تقني",     en: "IT System" },
  { value: "APPLICATION",     ar: "تطبيق",         en: "Application" },
  { value: "HUMAN_RESOURCE",  ar: "موارد بشرية",    en: "Human Resource" },
  { value: "SUPPLIER",        ar: "مورد خارجي",     en: "Supplier" },
  { value: "FACILITY",        ar: "مرفق/موقع",     en: "Facility" },
  { value: "DATA",            ar: "بيانات",         en: "Data" },
];

const STRATEGY_PHASES = [
  { value: "PRE_DISRUPTION",    ar: "قبل الانقطاع",  en: "Pre-Disruption" },
  { value: "DURING_DISRUPTION", ar: "أثناء الانقطاع", en: "During Disruption" },
  { value: "POST_DISRUPTION",   ar: "بعد الانقطاع",  en: "Post-Disruption" },
];

const WORKFLOW_STATUSES = ["PENDING", "APPROVED", "REJECTED", "ESCALATED"];
const ASSESSMENT_STATUSES = ["DRAFT", "IN_REVIEW", "APPROVED", "ARCHIVED"];
const APPROVER_ROLES = ["DEPT_HEAD", "BC_COORDINATOR", "CISO", "CEO"];

// ─── Seed Data (from demo data file) ──────────────────────────────────────────
const seedAssessments = demoBIAAssessments;

const seedProcesses = demoBIAProcesses;

// DGA impact matrix seed for BIA-PRC-001
const seedImpactRatings = (() => {
  const ratings = [];
  const processImpacts = {
    "BIA-PRC-001": { OPERATIONAL: [1,2,3,4,5,5,5], FINANCIAL: [1,1,2,3,4,4,5], LEGAL_REGULATORY_STRATEGIC: [1,1,2,2,3,4,5], REPUTATIONAL: [1,1,2,3,4,5,5] },
    "BIA-PRC-002": { OPERATIONAL: [2,3,4,5,5,5,5], FINANCIAL: [1,2,3,4,4,5,5], LEGAL_REGULATORY_STRATEGIC: [1,2,3,4,5,5,5], REPUTATIONAL: [1,2,3,3,4,4,5] },
    "BIA-PRC-003": { OPERATIONAL: [1,1,2,3,4,5,5], FINANCIAL: [1,1,1,2,3,4,5], LEGAL_REGULATORY_STRATEGIC: [1,1,1,2,3,3,4], REPUTATIONAL: [1,1,1,2,3,3,4] },
    "BIA-PRC-004": { OPERATIONAL: [2,3,4,5,5,5,5], FINANCIAL: [2,3,4,5,5,5,5], LEGAL_REGULATORY_STRATEGIC: [1,2,3,4,5,5,5], REPUTATIONAL: [1,2,3,4,4,5,5] },
  };
  Object.entries(processImpacts).forEach(([pid, cats]) => {
    Object.entries(cats).forEach(([cat, scores]) => {
      scores.forEach((s, i) => {
        ratings.push({
          id: uuid(), process_id: pid,
          impact_category: cat,
          time_interval_hours: TIME_INTERVALS[i],
          severity_score: s,
          justification: "",
        });
      });
    });
  });
  return ratings;
})();

const seedDependencies = [
  { id: "BIA-DEP-001", process_id: "BIA-PRC-001", dependency_type: "IT_SYSTEM", resource_name: "Microsoft Exchange Server 2019", resource_name_en: "Microsoft Exchange Server 2019", criticality: "CRITICAL", has_alternative: true, alternative_description: "Microsoft 365 Cloud Failover", min_staff_required: 2, vendor_contract_ref: "MSFT-SA-2025-001" },
  { id: "BIA-DEP-002", process_id: "BIA-PRC-001", dependency_type: "IT_SYSTEM", resource_name: "Active Directory Domain Controller", resource_name_en: "Active Directory Domain Controller", criticality: "CRITICAL", has_alternative: true, alternative_description: "Secondary DC in DR Site", min_staff_required: 1, vendor_contract_ref: null },
  { id: "BIA-DEP-003", process_id: "BIA-PRC-001", dependency_type: "HUMAN_RESOURCE", resource_name: "فريق إدارة البريد الإلكتروني (3 مهندسين)", resource_name_en: "Email Admin Team (3 Engineers)", criticality: "IMPORTANT", has_alternative: false, alternative_description: null, min_staff_required: 2, vendor_contract_ref: null },
  { id: "BIA-DEP-004", process_id: "BIA-PRC-002", dependency_type: "APPLICATION", resource_name: "Azure Active Directory + MFA", resource_name_en: "Azure Active Directory + MFA", criticality: "CRITICAL", has_alternative: false, alternative_description: null, min_staff_required: 1, vendor_contract_ref: "MSFT-AAD-2025-007" },
  { id: "BIA-DEP-005", process_id: "BIA-PRC-004", dependency_type: "APPLICATION", resource_name: "SAP S/4HANA Finance Module", resource_name_en: "SAP S/4HANA Finance Module", criticality: "CRITICAL", has_alternative: false, alternative_description: null, min_staff_required: 3, vendor_contract_ref: "SAP-ENT-2024-012" },
  { id: "BIA-DEP-006", process_id: "BIA-PRC-004", dependency_type: "SUPPLIER", resource_name: "الراجحي — بوابة التسويات البنكية", resource_name_en: "Al Rajhi — Settlement Gateway", criticality: "CRITICAL", has_alternative: true, alternative_description: "البنك الأهلي — بوابة بديلة", min_staff_required: 0, vendor_contract_ref: "ARB-GW-2025-003" },
  { id: "BIA-DEP-007", process_id: "BIA-PRC-006", dependency_type: "SUPPLIER", resource_name: "DHL Express — APAC Logistics", resource_name_en: "DHL Express — APAC Logistics", criticality: "IMPORTANT", has_alternative: true, alternative_description: "Aramex Regional Alternative", min_staff_required: 0, vendor_contract_ref: "DHL-APAC-2025-019" },
];

const seedRecoveryStrategies = [
  { id: "BIA-STR-001", process_id: "BIA-PRC-001", strategy_phase: "PRE_DISRUPTION", strategy_description: "تفعيل النسخ المتماثل (Database Mirroring) للبريد إلى موقع التعافي", strategy_description_en: "Enable database mirroring to DR site for email services", estimated_cost_sar: 45000, responsible_user: "م. عبدالله المحمدي" },
  { id: "BIA-STR-002", process_id: "BIA-PRC-001", strategy_phase: "DURING_DISRUPTION", strategy_description: "تحويل DNS إلى خوادم Microsoft 365 السحابية خلال 30 دقيقة", strategy_description_en: "DNS failover to M365 cloud servers within 30 minutes", estimated_cost_sar: 0, responsible_user: "م. عبدالله المحمدي" },
  { id: "BIA-STR-003", process_id: "BIA-PRC-002", strategy_phase: "PRE_DISRUPTION", strategy_description: "إعداد Conditional Access Policies مع Fallback إلى Certificate Auth", strategy_description_en: "Configure Conditional Access Policies with Certificate Auth fallback", estimated_cost_sar: 12000, responsible_user: "أ. سارة القحطاني" },
  { id: "BIA-STR-004", process_id: "BIA-PRC-004", strategy_phase: "DURING_DISRUPTION", strategy_description: "تفعيل بوابة التسويات البديلة (البنك الأهلي) وتحويل المعاملات", strategy_description_en: "Activate alternative settlement gateway (SNB) and redirect transactions", estimated_cost_sar: 0, responsible_user: "أ. نورة العتيبي" },
];

const seedWorkflowSteps = [
  { id: "BIA-WF-001", assessment_id: "BIA-ASM-001", step_order: 1, approver_role: "DEPT_HEAD", approver_name: "م. خالد الغفيلي", decision: "APPROVED", comments: "تمت المراجعة والموافقة", decided_at: "2026-01-20T09:00:00Z", deadline: "2026-01-25T17:00:00Z" },
  { id: "BIA-WF-002", assessment_id: "BIA-ASM-001", step_order: 2, approver_role: "BC_COORDINATOR", approver_name: "أ. فاطمة الشهراني", decision: "APPROVED", comments: "البيانات متسقة — تم التحقق من RTO < MTPD", decided_at: "2026-01-28T14:00:00Z", deadline: "2026-02-01T17:00:00Z" },
  { id: "BIA-WF-003", assessment_id: "BIA-ASM-001", step_order: 3, approver_role: "CISO", approver_name: "م. خالد الغفيلي", decision: "APPROVED", comments: "معتمد — يتم تشغيل التجميع الآلي", decided_at: "2026-02-15T10:00:00Z", deadline: "2026-02-20T17:00:00Z" },
  { id: "BIA-WF-004", assessment_id: "BIA-ASM-002", step_order: 1, approver_role: "DEPT_HEAD", approver_name: "أ. محمد العنزي", decision: "APPROVED", comments: "تمت الموافقة على المرحلة الأولى", decided_at: "2026-02-10T11:00:00Z", deadline: "2026-02-15T17:00:00Z" },
  { id: "BIA-WF-005", assessment_id: "BIA-ASM-002", step_order: 2, approver_role: "BC_COORDINATOR", approver_name: "أ. فاطمة الشهراني", decision: "PENDING", comments: null, decided_at: null, deadline: "2026-03-10T17:00:00Z" },
];

const seedRiskLinks = [
  { id: "BIA-RL-001", process_id: "BIA-PRC-001", risk_id: "RSK-1042", link_type: "AFFECTED_BY", notes: "اختراق API قد يعطل خدمات البريد" },
  { id: "BIA-RL-002", process_id: "BIA-PRC-002", risk_id: "RSK-1042", link_type: "CAUSES", notes: "تعطل IAM يسبب فشل المصادقة عبر المنصة" },
  { id: "BIA-RL-003", process_id: "BIA-PRC-004", risk_id: "RSK-1108", link_type: "AFFECTED_BY", notes: "تقلبات العملة تؤثر على المعاملات المالية" },
  { id: "BIA-RL-004", process_id: "BIA-PRC-006", risk_id: "RSK-0774", link_type: "AFFECTED_BY", notes: "توترات مضيق تايوان تهدد سلسلة الإمداد APAC" },
];

const seedConsolidatedReports = [
  {
    id: "BIA-CR-001", fiscal_year: 2026, total_processes: 3, org_min_rto: 0.7, org_min_mtpd: 1,
    report_status: "FINAL", generated_by: "أ. فاطمة الشهراني",
    aggregated_data: {
      departments_covered: ["IT"],
      critical_count: 2, high_count: 1, medium_count: 0, low_count: 0,
      spof_count: 2, avg_rto: 3.03, avg_mtpd: 4.33,
      top_dependencies: ["Microsoft Exchange Server 2019", "Azure Active Directory + MFA"],
    },
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────
const BIAContext = createContext();

export function BIAProvider({ children }) {
  const [assessments, setAssessments] = useState(seedAssessments);
  const [processes, setProcesses] = useState(seedProcesses);
  const [impactRatings, setImpactRatings] = useState(seedImpactRatings);
  const [dependencies, setDependencies] = useState(seedDependencies);
  const [recoveryStrategies, setRecoveryStrategies] = useState(seedRecoveryStrategies);
  const [workflowSteps, setWorkflowSteps] = useState(seedWorkflowSteps);
  const [riskLinks, setRiskLinks] = useState(seedRiskLinks);
  const [consolidatedReports, setConsolidatedReports] = useState(seedConsolidatedReports);

  // ─── Assessments CRUD ───
  const addAssessment = useCallback((data) => {
    const a = { id: uuid(), status: "DRAFT", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), approved_by: null, approved_at: null, ...data };
    setAssessments((prev) => [a, ...prev]);
    return a;
  }, []);

  const updateAssessment = useCallback((id, data) => {
    setAssessments((prev) => prev.map((a) => a.id === id ? { ...a, ...data, updated_at: new Date().toISOString() } : a));
  }, []);

  // ─── Processes CRUD ───
  const addProcess = useCallback((data) => {
    if (data.rto_hours >= data.mtpd_hours) throw new Error("RTO must be less than MTPD");
    if (data.rpo_hours > data.rto_hours) throw new Error("RPO must be ≤ RTO");
    const p = { id: uuid(), ...data };
    setProcesses((prev) => [...prev, p]);
    return p;
  }, []);

  const updateProcess = useCallback((id, data) => {
    if (data.rto_hours !== undefined && data.mtpd_hours !== undefined && data.rto_hours >= data.mtpd_hours)
      throw new Error("RTO must be less than MTPD");
    if (data.rpo_hours !== undefined && data.rto_hours !== undefined && data.rpo_hours > data.rto_hours)
      throw new Error("RPO must be ≤ RTO");
    setProcesses((prev) => prev.map((p) => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deleteProcess = useCallback((id) => {
    setProcesses((prev) => prev.filter((p) => p.id !== id));
    setImpactRatings((prev) => prev.filter((r) => r.process_id !== id));
    setDependencies((prev) => prev.filter((d) => d.process_id !== id));
    setRecoveryStrategies((prev) => prev.filter((s) => s.process_id !== id));
    setRiskLinks((prev) => prev.filter((l) => l.process_id !== id));
  }, []);

  // ─── Impact Ratings ───
  const upsertImpactRating = useCallback((process_id, category, timeHours, score, justification = "") => {
    setImpactRatings((prev) => {
      const idx = prev.findIndex((r) => r.process_id === process_id && r.impact_category === category && r.time_interval_hours === timeHours);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], severity_score: score, justification };
        return updated;
      }
      return [...prev, { id: uuid(), process_id, impact_category: category, time_interval_hours: timeHours, severity_score: score, justification }];
    });
  }, []);

  // ─── Dependencies ───
  const addDependency = useCallback((data) => {
    const d = { id: uuid(), ...data };
    setDependencies((prev) => [...prev, d]);
    return d;
  }, []);

  const updateDependency = useCallback((id, data) => {
    setDependencies((prev) => prev.map((d) => d.id === id ? { ...d, ...data } : d));
  }, []);

  const removeDependency = useCallback((id) => {
    setDependencies((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // ─── Recovery Strategies ───
  const addRecoveryStrategy = useCallback((data) => {
    const s = { id: uuid(), ...data };
    setRecoveryStrategies((prev) => [...prev, s]);
    return s;
  }, []);

  const removeRecoveryStrategy = useCallback((id) => {
    setRecoveryStrategies((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ─── Workflow ───
  const submitForApproval = useCallback((assessmentId) => {
    updateAssessment(assessmentId, { status: "IN_REVIEW" });
    const firstStep = { id: uuid(), assessment_id: assessmentId, step_order: 1, approver_role: "DEPT_HEAD", approver_name: "—", decision: "PENDING", comments: null, decided_at: null, deadline: new Date(Date.now() + 5 * 86400000).toISOString() };
    setWorkflowSteps((prev) => [...prev, firstStep]);
  }, [updateAssessment]);

  const approveStep = useCallback((stepId) => {
    setWorkflowSteps((prev) => {
      const updated = prev.map((s) => s.id === stepId ? { ...s, decision: "APPROVED", decided_at: new Date().toISOString() } : s);
      const step = updated.find((s) => s.id === stepId);
      if (step) {
        const roleOrder = APPROVER_ROLES;
        const nextIdx = roleOrder.indexOf(step.approver_role) + 1;
        if (nextIdx < roleOrder.length) {
          updated.push({ id: uuid(), assessment_id: step.assessment_id, step_order: step.step_order + 1, approver_role: roleOrder[nextIdx], approver_name: "—", decision: "PENDING", comments: null, decided_at: null, deadline: new Date(Date.now() + 5 * 86400000).toISOString() });
        } else {
          // Final approval
          setAssessments((a) => a.map((x) => x.id === step.assessment_id ? { ...x, status: "APPROVED", approved_at: new Date().toISOString() } : x));
        }
      }
      return updated;
    });
  }, []);

  const rejectStep = useCallback((stepId, comments) => {
    if (!comments) throw new Error("Comments are required for rejection");
    setWorkflowSteps((prev) => prev.map((s) => s.id === stepId ? { ...s, decision: "REJECTED", comments, decided_at: new Date().toISOString() } : s));
  }, []);

  // ─── Risk Links ───
  const addRiskLink = useCallback((data) => {
    const l = { id: uuid(), ...data };
    setRiskLinks((prev) => [...prev, l]);
    return l;
  }, []);

  const removeRiskLink = useCallback((id) => {
    setRiskLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // ─── Consolidation Engine ───
  const runConsolidation = useCallback((fiscalYear) => {
    const approved = assessments.filter((a) => a.status === "APPROVED" && a.fiscal_year === fiscalYear);
    const approvedIds = approved.map((a) => a.id);
    const relatedProcesses = processes.filter((p) => approvedIds.includes(p.assessment_id));

    const sorted = [...relatedProcesses].sort((a, b) => a.rto_hours - b.rto_hours);
    const orgMinRto = sorted.length ? sorted[0].rto_hours : 0;
    const orgMinMtpd = sorted.length ? Math.min(...sorted.map((p) => p.mtpd_hours)) : 0;

    const relProcIds = relatedProcesses.map((p) => p.id);
    const relDeps = dependencies.filter((d) => relProcIds.includes(d.process_id));
    const spofDeps = relDeps.filter((d) => d.criticality === "CRITICAL" && !d.has_alternative);

    const report = {
      id: uuid(), fiscal_year: fiscalYear, total_processes: relatedProcesses.length,
      org_min_rto: orgMinRto, org_min_mtpd: orgMinMtpd,
      report_status: "FINAL", generated_by: "النظام — تجميع آلي",
      aggregated_data: {
        departments_covered: [...new Set(approved.map((a) => a.department_id))],
        critical_count: relatedProcesses.filter((p) => p.criticality_level === "CRITICAL").length,
        high_count: relatedProcesses.filter((p) => p.criticality_level === "HIGH").length,
        medium_count: relatedProcesses.filter((p) => p.criticality_level === "MEDIUM").length,
        low_count: relatedProcesses.filter((p) => p.criticality_level === "LOW").length,
        spof_count: spofDeps.length,
        avg_rto: relatedProcesses.length ? +(relatedProcesses.reduce((a, p) => a + p.rto_hours, 0) / relatedProcesses.length).toFixed(2) : 0,
        avg_mtpd: relatedProcesses.length ? +(relatedProcesses.reduce((a, p) => a + p.mtpd_hours, 0) / relatedProcesses.length).toFixed(2) : 0,
        top_dependencies: relDeps.filter((d) => d.criticality === "CRITICAL").map((d) => d.resource_name).slice(0, 5),
        recovery_priority_order: sorted.map((p) => ({ id: p.id, name: p.process_name, rto: p.rto_hours, mtpd: p.mtpd_hours, criticality: p.criticality_level })),
      },
    };
    setConsolidatedReports((prev) => [report, ...prev]);
    return report;
  }, [assessments, processes, dependencies]);

  // ─── Getters ───
  const getProcessesForAssessment = useCallback((assessmentId) => processes.filter((p) => p.assessment_id === assessmentId), [processes]);
  const getImpactsForProcess = useCallback((processId) => impactRatings.filter((r) => r.process_id === processId), [impactRatings]);
  const getDependenciesForProcess = useCallback((processId) => dependencies.filter((d) => d.process_id === processId), [dependencies]);
  const getStrategiesForProcess = useCallback((processId) => recoveryStrategies.filter((s) => s.process_id === processId), [recoveryStrategies]);
  const getWorkflowForAssessment = useCallback((assessmentId) => workflowSteps.filter((s) => s.assessment_id === assessmentId).sort((a, b) => a.step_order - b.step_order), [workflowSteps]);
  const getRiskLinksForProcess = useCallback((processId) => riskLinks.filter((l) => l.process_id === processId), [riskLinks]);
  const getPendingApprovals = useCallback(() => workflowSteps.filter((s) => s.decision === "PENDING"), [workflowSteps]);

  return (
    <BIAContext.Provider value={{
      // Data
      assessments, processes, impactRatings, dependencies, recoveryStrategies,
      workflowSteps, riskLinks, consolidatedReports,
      // Constants
      IMPACT_CATEGORIES, TIME_INTERVALS, IMPACT_CATEGORY_LABELS, CRITICALITY_LEVELS,
      DEPENDENCY_TYPES, STRATEGY_PHASES, ASSESSMENT_STATUSES, APPROVER_ROLES, WORKFLOW_STATUSES,
      // CRUD
      addAssessment, updateAssessment,
      addProcess, updateProcess, deleteProcess,
      upsertImpactRating,
      addDependency, updateDependency, removeDependency,
      addRecoveryStrategy, removeRecoveryStrategy,
      submitForApproval, approveStep, rejectStep,
      addRiskLink, removeRiskLink,
      runConsolidation,
      // Getters
      getProcessesForAssessment, getImpactsForProcess, getDependenciesForProcess,
      getStrategiesForProcess, getWorkflowForAssessment, getRiskLinksForProcess, getPendingApprovals,
      // Utils
      scoreMeta, suggestRTO, deriveMTPD,
    }}>
      {children}
    </BIAContext.Provider>
  );
}

export function useBIA() {
  const ctx = useContext(BIAContext);
  if (!ctx) throw new Error("useBIA must be used within BIAProvider");
  return ctx;
}

export default BIAContext;
