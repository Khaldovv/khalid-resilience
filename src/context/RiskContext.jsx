import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { demoRisks } from "../data/demoRisks";
import { risksAPI } from "../services/api";

// ─── Shared Risk Data Store ───────────────────────────────────────────────────
// Fetches risks from the backend API. Falls back to demo data only if API fails.

const RiskContext = createContext();

// ─── Risk Level Calculation (reused from AddRiskModal) ────────────────────────
function getRiskLevel(likelihood, impact) {
  const score = likelihood * impact;
  if (score >= 20) return { score, label: { en: "Catastrophic", ar: "كارثي" }, color: "#7f1d1d" };
  if (score >= 15) return { score, label: { en: "High", ar: "عالي" }, color: "#ef4444" };
  if (score >= 10) return { score, label: { en: "Medium", ar: "متوسط" }, color: "#f97316" };
  if (score >= 5)  return { score, label: { en: "Low", ar: "منخفض" }, color: "#eab308" };
  return { score, label: { en: "Very Low", ar: "منخفض جداً" }, color: "#22c55e" };
}

// ─── Normalize backend risk to frontend format ─────────────────────────────────
function normalizeRisk(r) {
  return {
    id: r.id,
    date: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : '',
    department: r.department_id || '',
    riskType: r.risk_type || 'Operational',
    category: r.risk_type || 'Operational',
    riskName: r.risk_name,
    risk_name: r.risk_name,
    description: r.description || '',
    owner: r.risk_owner_id || '',
    inherentScore: r.inherent_score,
    inherentLabel: r.inherent_level,
    inherentColor: r.inherent_level === 'Catastrophic' ? '#7f1d1d' : r.inherent_level === 'High' ? '#ef4444' : r.inherent_level === 'Medium' ? '#f97316' : r.inherent_level === 'Low' ? '#eab308' : '#22c55e',
    residualScore: r.residual_score || 0,
    residualLabel: r.residual_level || '—',
    residualColor: r.residual_level === 'Catastrophic' ? '#7f1d1d' : r.residual_level === 'High' ? '#ef4444' : r.residual_level === 'Medium' ? '#f97316' : r.residual_level === 'Low' ? '#eab308' : r.residual_level === 'Very Low' ? '#22c55e' : '#94a3b8',
    inherent: r.inherent_level,
    residual: r.residual_level || '—',
    status: r.lifecycle_status || 'IDENTIFIED',
    lifecycleStatus: r.lifecycle_status || 'IDENTIFIED',
    aiStatus: r.response_type || '',
    aiColor: 'blue',
    score: r.inherent_score,
    delta: 0,
    source: 'backend',
    // Keep raw backend fields for simulation
    inherent_likelihood: r.inherent_likelihood,
    inherent_impact: r.inherent_impact,
    residual_likelihood: r.residual_likelihood,
    residual_impact: r.residual_impact,
    confidence_level: r.confidence_level,
    department_id: r.department_id,
    risk_owner_id: r.risk_owner_id,
    response_type: r.response_type,
    mitigation_plan: r.mitigation_plan,
  };
}

export function RiskProvider({ children }) {
  const [risks, setRisks] = useState(demoRisks); // Start with demo data immediately
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Try to load risks from backend on mount
  const fetchRisks = useCallback(async () => {
    try {
      const token = localStorage.getItem('grc_token');
      if (!token) {
        setLoading(false);
        return; // No auth — stay with demo data
      }
      const result = await risksAPI.list({ per_page: 100 });
      if (result?.data && result.data.length > 0) {
        const normalized = result.data.map(normalizeRisk);
        // Merge backend risks with demo data (backend risks first, avoiding duplicates)
        const backendIds = new Set(normalized.map(r => r.id));
        const uniqueDemoRisks = demoRisks.filter(r => !backendIds.has(r.id));
        setRisks([...normalized, ...uniqueDemoRisks]);
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn('[RiskContext] Backend not available, using demo data:', err.message);
      // Keep demo data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRisks(); }, [fetchRisks]);

  // Add a single risk (from AddRiskModal) — try backend first
  const addRisk = async (risk) => {
    if (isBackendConnected) {
      try {
        const created = await risksAPI.create({
          risk_name: risk.riskName || risk.risk_name,
          description: risk.description,
          risk_type: risk.riskType || risk.risk_type || 'Operational',
          inherent_likelihood: risk.inherentLikelihood || risk.inherent_likelihood || 3,
          inherent_impact: risk.inherentImpact || risk.inherent_impact || 3,
          confidence_level: risk.confidenceLevel || risk.confidence_level || 3,
          department_id: risk.department_id || risk.department || null,
        });
        const normalized = normalizeRisk(created);
        setRisks((prev) => [normalized, ...prev]);
        return normalized;
      } catch (err) {
        console.error('[RiskContext] Failed to create via API:', err);
      }
    }
    // Fallback: add locally
    setRisks((prev) => [risk, ...prev]);
    return risk;
  };

  // Add multiple AI-generated risks
  const addAIRisks = (aiRisks, department, employeeName) => {
    const newRisks = aiRisks.map((r, i) => {
      const level = getRiskLevel(r.likelihood, r.impact);
      return {
        id: `AI-${Date.now()}-${i}`,
        date: new Date().toISOString().slice(0, 10),
        department,
        riskType: "AI-Generated",
        category: "AI-Generated",
        riskName: r.riskName,
        description: r.description,
        owner: employeeName,
        inherentScore: level.score,
        inherentLabel: level.label.en,
        inherentColor: level.color,
        residualScore: 0,
        residualLabel: "—",
        residualColor: "#94a3b8",
        inherent: level.label.en,
        residual: "—",
        status: "Identified",
        lifecycleStatus: "Identified",
        aiStatus: "Pending Review",
        aiColor: "blue",
        score: level.score,
        delta: 0,
        source: "ai-assistant",
      };
    });
    setRisks((prev) => [...newRisks, ...prev]);
    return newRisks;
  };

  // Update risk status (approve / reject)
  const updateRiskStatus = (riskId, newStatus) => {
    setRisks((prev) =>
      prev.map((r) =>
        r.id === riskId ? { ...r, status: newStatus, lifecycleStatus: newStatus } : r
      )
    );
  };

  // Update risk fields (from Edit view)
  const updateRisk = (riskId, changes) => {
    // If backend connected, also update on server
    if (isBackendConnected) {
      risksAPI.update(riskId, changes).catch(err => 
        console.error('[RiskContext] Failed to update via API:', err)
      );
    }

    setRisks((prev) =>
      prev.map((r) => {
        if (r.id !== riskId) return r;
        const updated = { ...r };
        if (changes.residual_likelihood != null) updated.residualLikelihood = changes.residual_likelihood;
        if (changes.residual_impact != null) updated.residualImpact = changes.residual_impact;
        if (changes.residual_score != null) {
          updated.residualScore = changes.residual_score;
          const lvl = (s) => s >= 20 ? 'Catastrophic' : s >= 15 ? 'High' : s >= 10 ? 'Medium' : s >= 5 ? 'Low' : 'Very Low';
          updated.residualLabel = lvl(changes.residual_score);
          updated.residual = lvl(changes.residual_score);
        }
        if (changes.response_type) updated.responseType = changes.response_type;
        if (changes.lifecycle_status) {
          updated.lifecycleStatus = changes.lifecycle_status;
          updated.status = changes.lifecycle_status;
        }
        if (changes.mitigation_plan !== undefined) updated.mitigationPlan = changes.mitigation_plan;
        if (changes.confidence_level != null) updated.confidenceLevel = changes.confidence_level;
        if (changes.notes !== undefined) updated.notes = changes.notes;
        if (changes.current_action !== undefined) updated.aiStatus = changes.current_action;
        if (changes.implementation_timeframe) updated.implementationTimeframe = changes.implementation_timeframe;
        return updated;
      })
    );
  };

  // Refresh risks from backend
  const refreshRisks = () => { fetchRisks(); };

  return (
    <RiskContext.Provider value={{ risks, addRisk, addAIRisks, updateRiskStatus, updateRisk, refreshRisks, isBackendConnected, loading }}>
      {children}
    </RiskContext.Provider>
  );
}

export function useRisks() {
  const ctx = useContext(RiskContext);
  if (!ctx) throw new Error("useRisks must be used within RiskProvider");
  return ctx;
}

export default RiskContext;
