import { createContext, useContext, useState } from "react";
import { demoRisks } from "../data/demoRisks";

// ─── Shared Risk Data Store ───────────────────────────────────────────────────
// Provides a centralized risk state that all pages (Risk Register, AI Assistant) share.

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

// ─── Seed data (120 demo risks from data file) ────────────────────────────────
const seedRisks = demoRisks;

let riskIdCounter = 4000;

export function RiskProvider({ children }) {
  const [risks, setRisks] = useState(seedRisks);

  // Add a single risk (from AddRiskModal)
  const addRisk = (risk) => {
    setRisks((prev) => [risk, ...prev]);
  };

  // Add multiple AI-generated risks
  const addAIRisks = (aiRisks, department, employeeName) => {
    const newRisks = aiRisks.map((r) => {
      riskIdCounter++;
      const level = getRiskLevel(r.likelihood, r.impact);
      return {
        id: `RSK-${riskIdCounter}`,
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
    setRisks((prev) =>
      prev.map((r) => {
        if (r.id !== riskId) return r;
        const updated = { ...r };
        // Map snake_case changes to camelCase fields used in demo data
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

  return (
    <RiskContext.Provider value={{ risks, addRisk, addAIRisks, updateRiskStatus, updateRisk }}>
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
