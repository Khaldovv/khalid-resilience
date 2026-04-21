const db = require('../config/database');
const aiService = require('./ai/aiService');

// ── Department-Specific Personas for simulation context ──────────────────────
const DEPT_SIMULATION_PERSONAS = {
  IT: `أنت محلل مخاطر سيبرانية وتقنية في منظمة سعودية. تفهم ضوابط NCA ECC ومتطلبات SAMA للأمن السيبراني.
خبراتك: أمن الشبكات، حماية البنية التحتية، حوكمة تقنية المعلومات، إدارة الثغرات، التعافي من الكوارث.
عند المحاكاة، ركز على: البنية التحتية التقنية، الأنظمة المتأثرة، وقت الاستجابة، سلسلة الهجوم.`,

  Finance: `أنت محلل مخاطر مالية ومحاسبية في منظمة سعودية. تفهم متطلبات ZATCA وأنظمة ضريبة القيمة المضافة ومعايير IFRS.
خبراتك: التقارير المالية، الرقابة الداخلية، مكافحة الاحتيال، إدارة التدفقات النقدية، المراجعة المحاسبية.
عند المحاكاة، ركز على: الأثر المالي المباشر، الامتثال الضريبي، تعليق العمليات المالية، غرامات الجهات الرقابية.`,

  Operations: `أنت محلل مخاطر تشغيلية وسلاسل إمداد في منظمة سعودية. تفهم ISO 22301 ومتطلبات استمرارية الأعمال.
خبراتك: إدارة سلاسل الإمداد، الصيانة، السلامة المهنية، ضبط الجودة، التخطيط الإنتاجي.
عند المحاكاة، ركز على: توقف سلاسل الإمداد، تأثير الإنتاج، السلامة المهنية، الموردين البديلين.`,

  HR: `أنت محلل مخاطر موارد بشرية في منظمة سعودية. تفهم نظام العمل السعودي ومتطلبات التوطين وبرنامج نطاقات وتقييمات مدد.
خبراتك: الاحتفاظ بالمواهب، معدلات الدوران الوظيفي، تكاليف التوظيف والتدريب، خصوصية بيانات الموظفين، الامتثال لنظام العمل.
عند المحاكاة، ركز على: تكاليف الاستبدال، فقدان المعرفة المؤسسية، انخفاض الإنتاجية، تأثير نطاقات، معنويات الفريق.`,

  Legal: `أنت محلل مخاطر قانونية في منظمة سعودية. تفهم الأنظمة السعودية ونظام حماية البيانات الشخصية PDPL.
خبراتك: إدارة العقود، الامتثال التنظيمي، حماية الملكية الفكرية، التقاضي، الاختصاص القضائي.
عند المحاكاة، ركز على: المخاطر القانونية، الغرامات التنظيمية، الدعاوى المحتملة، مخالفات PDPL.`,

  Compliance: `أنت محلل امتثال ورقابة في منظمة سعودية. تفهم متطلبات NCA، SAMA، DGA، NDMO وأطر الحوكمة.
خبراتك: جاهزية التدقيق، إدارة السياسات، مكافحة غسل الأموال، الإفصاح، التدريب على الامتثال.
عند المحاكاة، ركز على: الفجوات التنظيمية، نتائج التدقيق، العقوبات المحتملة، الإجراءات التصحيحية.`,
};

const DEFAULT_SIMULATION_PERSONA = `أنت محلل مخاطر مؤسسية متخصص في البيئة السعودية. تفهم ISO 31000 ومتطلبات الحوكمة السعودية.
حلل الخطر المقدم وابنِ سيناريوهات واقعية بناءً على بيانات الخطر الفعلية والسياق التشغيلي للإدارة المعنية.`;

/**
 * Simulate risk scenarios using AI (OpenRouter).
 * Enhanced with:
 * - Department-specific AI personas for contextual analysis
 * - Multi-dimensional impact (financial, operational, reputational, regulatory, human)
 * - Saudi Arabia context (NCA, SAMA, NDMO, sector-specific data)
 * - BIA-linked dependency chain impact
 */
async function simulateRisk(riskId, userId) {
  const risk = await db('risks').where('id', riskId).first();
  if (!risk) throw new Error('Risk not found');

  const treatments = await db('risk_treatments').where('risk_id', riskId);
  const department = await db('departments').where('id', risk.department_id).first();

  // Resolve department persona
  const deptName = department?.name_en || '';
  const persona = DEPT_SIMULATION_PERSONAS[deptName] || DEFAULT_SIMULATION_PERSONA;

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

  // Get similar risks in the same category for context
  let similarRisks = [];
  try {
    similarRisks = await db('risks')
      .where('risk_type', risk.risk_type)
      .where('is_archived', false)
      .whereNot('id', riskId)
      .orderBy('inherent_score', 'desc')
      .limit(5)
      .select('id', 'risk_name', 'inherent_score', 'residual_score', 'lifecycle_status', 'response_type');
  } catch { /* ignore */ }

  const prompt = `${persona}

قم بتحليل الخطر التالي وإنشاء محاكاة شاملة للسيناريوهات المحتملة.

## تعليمات مهمة:
1. استخدم البيانات المقدمة فقط. لا تخترع أنظمة أو تأثيرات غير مذكورة.
2. جميع المبالغ بالريال السعودي (SAR)، متناسبة مع درجة الخطر المتبقي ${risk.residual_score || risk.inherent_score}/25.
3. السيناريوهات يجب أن تشير لسياق سعودي فعلي (أنظمة NCA، متطلبات SAMA، معايير NDMO).
4. الاحتمالات يجب أن يكون مجموعها ~100%.
5. الرد بالعربية والإنجليزية.
6. أنواع التأثير المطلوبة: مالي، تشغيلي، سمعة، تنظيمي/قانوني، بشري.
7. ابحث في السياق السعودي عن حوادث مشابهة لهذا النوع من المخاطر.

## بيانات الخطر:
- المعرف: ${risk.id}
- الاسم: ${risk.risk_name}
- الوصف: ${risk.description || 'غير محدد'}
- النوع: ${risk.risk_type}
- الإدارة: ${department?.name_ar || department?.name_en || 'غير محدد'}
- الدرجة الأصلية: ${risk.inherent_score}/25 (${risk.inherent_level})
- الاحتمالية الأصلية: ${risk.inherent_likelihood}/5
- الأثر الأصلي: ${risk.inherent_impact}/5
- الدرجة المتبقية: ${risk.residual_score || 'غير محسوبة'}/25 (${risk.residual_level || 'N/A'})
- الاحتمالية المتبقية: ${risk.residual_likelihood || 'N/A'}/5
- الأثر المتبقي: ${risk.residual_impact || 'N/A'}/5
- نوع الاستجابة: ${risk.response_type || 'غير محدد'}
- خطة التخفيف الحالية: ${risk.mitigation_plan || 'لا يوجد'}
- حالة دورة الحياة: ${risk.lifecycle_status}

## المعالجات الحالية:
${treatments.map(t => `- [${t.treatment_type}] ${t.description} — ${t.completion_pct || 0}% مكتمل`).join('\n') || 'لا توجد معالجات'}

## العمليات الحرجة المرتبطة:
${linkedBIA.map(p => `- ${p.process_name} (${p.criticality_level}, RTO: ${p.rto_hours}h, MTPD: ${p.mtpd_hours || 'N/A'}h)`).join('\n') || 'لا توجد عمليات مرتبطة'}

## التبعيات المعرضة للخطر:
${dependencies.map(d => `- [${d.dependency_type}] ${d.resource_name} (${d.criticality}, بديل: ${d.has_alternative ? 'نعم' : 'لا - SPOF'})`).join('\n') || 'لا توجد تبعيات'}

## مخاطر مشابهة في المنظمة:
${similarRisks.map(r => `- ${r.id}: ${r.risk_name} (أصلي: ${r.inherent_score}, متبقي: ${r.residual_score || 'N/A'}, حالة: ${r.lifecycle_status})`).join('\n') || 'لا توجد مخاطر مشابهة'}`;

  const schema = {
    confidence_score: 0.85,
    saudi_context_ar: 'string — سياق سعودي من حوادث أو أنظمة مشابهة',
    saudi_context_en: 'string — Saudi context from similar incidents or regulations',
    scenario_best: {
      narrative_ar: 'string', narrative_en: 'string',
      probability_pct: 25,
      financial_impact_sar: 0,
      operational_impact_ar: 'string — وصف التأثير التشغيلي',
      operational_impact_en: 'string',
      reputational_impact_ar: 'string — وصف التأثير على السمعة',
      reputational_impact_en: 'string',
      regulatory_impact_ar: 'string — المخالفات التنظيمية المحتملة (NCA/SAMA/NDMO)',
      regulatory_impact_en: 'string',
      human_impact_ar: 'string — التأثير على الموظفين والأفراد',
      human_impact_en: 'string',
      timeline_days: 0, affected_systems: [], severity: 'LOW',
      recovery_time_hours: 0,
    },
    scenario_likely: {
      narrative_ar: 'string', narrative_en: 'string',
      probability_pct: 50,
      financial_impact_sar: 0,
      operational_impact_ar: 'string', operational_impact_en: 'string',
      reputational_impact_ar: 'string', reputational_impact_en: 'string',
      regulatory_impact_ar: 'string', regulatory_impact_en: 'string',
      human_impact_ar: 'string', human_impact_en: 'string',
      timeline_days: 0, affected_systems: [], severity: 'MEDIUM',
      recovery_time_hours: 0,
    },
    scenario_worst: {
      narrative_ar: 'string', narrative_en: 'string',
      probability_pct: 25,
      financial_impact_sar: 0,
      operational_impact_ar: 'string', operational_impact_en: 'string',
      reputational_impact_ar: 'string', reputational_impact_en: 'string',
      regulatory_impact_ar: 'string', regulatory_impact_en: 'string',
      human_impact_ar: 'string', human_impact_en: 'string',
      timeline_days: 0, affected_systems: [], severity: 'CRITICAL',
      recovery_time_hours: 0,
    },
    mitigation_strategies: [{
      title_ar: 'string', title_en: 'string',
      description_ar: 'string', description_en: 'string',
      priority: 'IMMEDIATE|SHORT_TERM|LONG_TERM',
      estimated_cost_sar: 0,
      risk_reduction_pct: 0,
      responsible_role: 'CISO|IT_SECURITY|DEPT_HEAD|BC_COORDINATOR|CRO',
      implementation_steps: ['string'],
      saudi_regulation_reference: 'string — مرجع من NCA ECC أو SAMA أو NDMO إن وجد',
    }],
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
