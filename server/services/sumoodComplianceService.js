const db = require('../config/database');
const { extractText } = require('./documentExtractionService');
const aiService = require('./ai/aiService');

/**
 * Sumood Compliance Document Analysis — powered by OpenRouter.
 * Classifies documents and maps them against Sumood KPIs.
 */
async function analyzeDocument(documentId) {
  const doc = await db('sumood_documents').where('id', documentId).first();
  if (!doc) throw new Error('Document not found');

  await db('sumood_documents').where('id', documentId).update({ status: 'ANALYZING' });

  try {
    const { text, pages } = await extractText(doc.storage_path);

    const kpis = await db('sumood_kpis')
      .join('sumood_components', 'sumood_kpis.component_id', 'sumood_components.id')
      .join('sumood_pillars', 'sumood_components.pillar_id', 'sumood_pillars.id')
      .where('sumood_kpis.is_applicable', true)
      .select(
        'sumood_kpis.id as kpi_id', 'sumood_kpis.kpi_code', 'sumood_kpis.kpi_text_ar',
        'sumood_components.code as component_code', 'sumood_components.name_ar as component_name',
        'sumood_pillars.name_ar as pillar_name', 'sumood_pillars.id as pillar_id'
      );

    // Classify the document
    const classResult = await aiService.generateJSON(
      `أنت محلل GRC سعودي. حلل وصنف هذا المستند:\n\nالاسم: ${doc.file_name}\nالمحتوى (أول 8000 حرف):\n${text.substring(0, 8000)}`,
      { document_type: 'string', document_type_ar: 'string', summary_ar: 'string', summary_en: 'string' },
      { feature: 'sumood_compliance', language: 'ar', maxTokens: 1500 }
    );
    const classification = classResult.data;

    // Analyze per pillar
    const pillarGroups = kpis.reduce((acc, k) => {
      if (!acc[k.pillar_name]) acc[k.pillar_name] = [];
      acc[k.pillar_name].push(k);
      return acc;
    }, {});

    const allMappings = [];
    for (const [pillarName, pillarKPIs] of Object.entries(pillarGroups)) {
      const result = await aiService.generateJSON(
        `أنت محلل صمود. حلل المستند "${doc.file_name}" (${classification.document_type_ar}) ضد مقاييس محور "${pillarName}".\n\nالمحتوى:\n${text.substring(0, 20000)}\n\nالمقاييس:\n${pillarKPIs.map(k => `- ${k.kpi_id}: ${k.kpi_code}: ${k.kpi_text_ar}`).join('\n')}\n\nلكل مقياس حدد: compliance_level (FULLY_MET/PARTIALLY_MET/MENTIONED/NOT_ADDRESSED), suggested_maturity_level (1-7), confidence_score (0-1), evidence_quote, reasoning_ar/en, identified_gaps_ar/en, improvement_suggestions [{suggestion_ar, suggestion_en, priority}].`,
        { kpi_mappings: [] },
        { feature: 'sumood_compliance', language: 'ar', maxTokens: 6000 }
      );
      allMappings.push(...result.data.kpi_mappings);
    }

    // Save mappings
    for (const m of allMappings) {
      await db('sumood_document_kpi_mappings').insert({
        document_id: documentId, kpi_id: m.kpi_id,
        compliance_level: m.compliance_level, suggested_maturity_level: m.suggested_maturity_level,
        confidence_score: m.confidence_score, evidence_quote: m.evidence_quote,
        evidence_page_number: m.evidence_page_number, evidence_section: m.evidence_section,
        reasoning_ar: m.reasoning_ar, reasoning_en: m.reasoning_en,
        identified_gaps_ar: m.identified_gaps_ar, identified_gaps_en: m.identified_gaps_en,
        improvement_suggestions: JSON.stringify(m.improvement_suggestions),
      });
    }

    // Compute summary
    const fullyMet = allMappings.filter(m => m.compliance_level === 'FULLY_MET').length;
    const partiallyMet = allMappings.filter(m => m.compliance_level === 'PARTIALLY_MET').length;
    const mentioned = allMappings.filter(m => m.compliance_level === 'MENTIONED').length;
    const notAddressed = allMappings.filter(m => m.compliance_level === 'NOT_ADDRESSED').length;
    const addressed = allMappings.filter(m => m.compliance_level !== 'NOT_ADDRESSED');
    const avgMaturity = addressed.length > 0
      ? addressed.reduce((a, m) => a + m.suggested_maturity_level, 0) / addressed.length : 0;

    await db('sumood_analysis_summaries').insert({
      document_id: documentId,
      total_kpis_assessed: allMappings.length,
      kpis_fully_met: fullyMet, kpis_partially_met: partiallyMet,
      kpis_mentioned: mentioned, kpis_not_addressed: notAddressed,
      avg_maturity_level: avgMaturity,
      pillar_coverage: JSON.stringify({}), top_gaps: JSON.stringify([]),
      top_recommendations: JSON.stringify([]),
      executive_summary_ar: '', executive_summary_en: '',
    });

    await db('sumood_documents').where('id', documentId).update({
      status: 'ANALYZED', document_type: classification.document_type,
      document_type_ar: classification.document_type_ar,
      document_summary_ar: classification.summary_ar,
      document_summary_en: classification.summary_en,
      total_pages: pages, ai_model: 'openrouter', analyzed_at: new Date(),
    });

    return { success: true, mappingsCount: allMappings.length };
  } catch (err) {
    await db('sumood_documents').where('id', documentId).update({ status: 'FAILED', error_message: err.message });
    throw err;
  }
}

module.exports = { analyzeDocument };
