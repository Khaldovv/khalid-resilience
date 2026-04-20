const db = require('../config/database');
const aiService = require('./ai/aiService');

/**
 * Simulate risk scenarios using AI (OpenRouter).
 * Falls back gracefully if API key is not configured.
 */
async function simulateRisk(riskId, userId) {
  const risk = await db('risks').where('id', riskId).first();
  if (!risk) throw new Error('Risk not found');

  const treatments = await db('risk_treatments').where('risk_id', riskId);
  const department = await db('departments').where('id', risk.department_id).first();

  // Check for BIA links if table exists
  let linkedBIA = [];
  let dependencies = [];
  try {
    linkedBIA = await db('bia_risk_links')
      .join('bia_processes', 'bia_risk_links.process_id', 'bia_processes.id')
      .where('bia_risk_links.risk_id', riskId)
      .select('bia_processes.*');

    const processIds = linkedBIA.map(p => p.id);
    if (processIds.length > 0) {
      dependencies = await db('bia_dependencies').whereIn('process_id', processIds);
    }
  } catch {
    // Tables may not exist yet
  }

  const prompt = `You are an Enterprise Risk Management analyst for a Saudi Arabian organization.
Generate 3 scenarios for this SPECIFIC risk. CRITICAL RULES:
1. Use ONLY the data provided below. Do NOT invent systems or impacts.
2. All amounts in SAR, proportional to residual score ${risk.residual_score}/25.
3. Scenarios must reference the actual department and systems listed.
4. Probabilities must sum to ~100%.
5. Respond in BOTH Arabic and English.

RISK:
- ID: ${risk.id}
- Name: ${risk.risk_name}
- Description: ${risk.description}
- Type: ${risk.risk_type}
- Department: ${department?.name_ar || 'N/A'}
- Inherent Score: ${risk.inherent_score}/25 (${risk.inherent_level})
- Residual Score: ${risk.residual_score}/25 (${risk.residual_level})
- Current Mitigation: ${risk.mitigation_plan || 'None'}

EXISTING TREATMENTS:
${treatments.map(t => `- [${t.treatment_type}] ${t.description} — ${t.completion_pct}% complete`).join('\n') || 'None'}

LINKED CRITICAL PROCESSES:
${linkedBIA.map(p => `- ${p.process_name} (${p.criticality_level}, RTO: ${p.rto_hours}h)`).join('\n') || 'None'}

DEPENDENCIES AT RISK:
${dependencies.map(d => `- [${d.dependency_type}] ${d.resource_name} (${d.criticality}, Alternative: ${d.has_alternative ? 'Yes' : 'NO - SPOF'})`).join('\n') || 'None'}`;

  const schema = {
    confidence_score: 0.85,
    scenario_best: {
      narrative_ar: 'string', narrative_en: 'string',
      probability_pct: 25, financial_impact_sar: 0,
      timeline_days: 0, affected_systems: [], severity: 'LOW',
    },
    scenario_likely: {
      narrative_ar: 'string', narrative_en: 'string',
      probability_pct: 50, financial_impact_sar: 0,
      timeline_days: 0, affected_systems: [], severity: 'MEDIUM',
    },
    scenario_worst: {
      narrative_ar: 'string', narrative_en: 'string',
      probability_pct: 25, financial_impact_sar: 0,
      timeline_days: 0, affected_systems: [], severity: 'CRITICAL',
    },
    mitigation_strategies: [],
  };

  const result = await aiService.generateJSON(prompt, schema, {
    feature: 'risk_simulation',
    userId,
    language: 'ar',
    temperature: 0.7,
    maxTokens: 4000,
    useCache: false,  // CRITICAL: never cache simulations — each run must be unique
  });

  const simData = result.data;

  const [saved] = await db('risk_simulations').insert({
    risk_id: riskId,
    risk_snapshot: JSON.stringify(risk),
    scenario_best: JSON.stringify(simData.scenario_best),
    scenario_likely: JSON.stringify(simData.scenario_likely),
    scenario_worst: JSON.stringify(simData.scenario_worst),
    mitigation_strategies: JSON.stringify(simData.mitigation_strategies),
    confidence_score: simData.confidence_score,
    simulated_by: userId,
  }).returning('*');

  return saved;
}

module.exports = { simulateRisk };
