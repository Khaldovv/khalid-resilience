const db = require('../config/database');
const aiService = require('./ai/aiService');

/**
 * AI Service — OpenRouter integration for the GRC platform.
 * Provides: chat(), runScheduledAnalysis(), getPlatformContext()
 *
 * Refactored from Anthropic Claude to use the unified AI service layer.
 */

// ── Gather live platform context ─────────────────────────────────────────────

async function getPlatformContext() {
  const [
    riskTotal,
    criticalRisks,
    topRisks,
    biaProcessTotal,
    shortestRto,
    pendingApprovals,
    sumoodScores,
  ] = await Promise.all([
    db('risks').where('is_archived', false).count('* as c').first(),
    db('risks').where('is_archived', false).where('inherent_level', 'Catastrophic').count('* as c').first(),
    db('risks').where('is_archived', false).orderBy('inherent_score', 'desc').limit(5)
      .select('id', 'risk_name', 'inherent_score', 'inherent_level', 'lifecycle_status'),
    db('bia_processes').count('* as c').first(),
    db('bia_processes').orderBy('rto_hours', 'asc').first().select('process_name', 'rto_hours'),
    db('bia_assessments').where('status', 'IN_REVIEW').count('* as c').first(),
    db('sumood_scores').orderBy('created_at', 'desc').limit(10)
      .select('pillar_id', 'component_id', 'score', 'department_id').catch(() => []),
  ]);

  return `
=== PLATFORM DATA CONTEXT (live) ===
RISK REGISTER:
- Total active risks: ${riskTotal?.c || 0}
- Critical/Catastrophic risks: ${criticalRisks?.c || 0}
- Top 5 risks by score: ${topRisks.map(r => `${r.id}: ${r.risk_name} (score=${r.inherent_score}, ${r.inherent_level})`).join('; ')}

BIA SUMMARY:
- Total business processes: ${biaProcessTotal?.c || 0}
- Shortest RTO: ${shortestRto ? `${shortestRto.process_name} (${shortestRto.rto_hours}h)` : 'N/A'}
- Pending BIA approvals: ${pendingApprovals?.c || 0}

SUMOOD NATIONAL RESILIENCE INDEX:
- Latest scores sample: ${sumoodScores.length > 0 ? sumoodScores.map(s => `pillar=${s.pillar_id} component=${s.component_id} score=${s.score}`).join('; ') : 'No scores recorded'}
===================================`;
}

// ── Build system prompt ──────────────────────────────────────────────────────

function buildSystemPrompt(contextType, platformCtx) {
  const base = `You are the AI Risk Intelligence Agent for the AutoResilience GRC Platform.
You are an expert in Enterprise Risk Management (ERM), Business Continuity (ISO 22301),
Risk Management (ISO 31000), and Saudi regulatory compliance (NCA ECC, SAMA BCM, DGA, NDMO SUMOOD).

You analyze risk data, BIA data, and Sumood maturity scores to provide actionable intelligence.
Always be precise, cite specific risk IDs or process names when available, and format your
responses in clear Markdown with headers, bullet points, and tables where appropriate.

${platformCtx}`;

  const contextPrompts = {
    RISK_ANALYSIS: `${base}

أنت محلل مخاطر متخصص. ركّز على:
- تحليل أنماط التسجيل والتصنيف في سجل المخاطر
- كشف المخاطر التي تحتاج تصعيد فوري (درجة ≥20)
- تحديد الترابطات بين المخاطر المسجلة
- تقييم فعالية المعالجات الحالية
- اقتراح تحسينات على خطط التخفيف
Focus: Risk register analysis — scoring patterns, escalation triggers, risk correlations, treatment effectiveness.`,

    BIA_REVIEW: `${base}

أنت خبير استمرارية أعمال (ISO 22301). ركّز على:
- مراجعة اتساق RTO/RPO/MTPD لكل عملية
- كشف فجوات التبعيات والموارد الحرجة
- تقييم كفاية استراتيجيات التعافي
- تحديد نقاط الفشل المنفردة (SPOF)
- مراجعة أولويات الاستعادة
Focus: BIA process review — RTO/RPO consistency, dependency gaps, recovery strategy adequacy, SPOF identification.`,

    SUMOOD_GAP: `${base}

أنت محلل مؤشر الصمود الوطني (NDMO SUMOOD). ركّز على:
- تحديد المكونات دون مستوى النضج 3
- رصد أي تراجع في النتائج عن الفترة السابقة
- اقتراح خارطة طريق تحسين مرحلية
- تحليل التوازن بين مكونات كل محور
Focus: Sumood National Resilience Index — maturity gaps below level 3, regression detection, improvement roadmap.`,

    POLICY_CHECK: `${base}

أنت مدقق امتثال (NCA ECC, SAMA BCM, DGA). ركّز على:
- التحقق من مواءمة السياسات مع المعايير السعودية
- كشف الثغرات في التغطية التنظيمية
- تقييم جاهزية التدقيق الخارجي
- مراجعة تحديثات الأنظمة واللوائح
Focus: Compliance verification — policy alignment with Saudi regulations, audit readiness, regulatory coverage gaps.`,

    INCIDENT_ADVISOR: `${base}

أنت مستشار استجابة حوادث (ISO 27001, NIST CSF). ركّز على:
- تصنيف الحوادث حسب الخطورة والنطاق
- تقديم إرشادات الاحتواء الفوري
- اقتراح خطوات التحقيق والاستعادة
- تحديد الدروس المستفادة والإجراءات الوقائية
Focus: Incident response — classification, containment, investigation, recovery, lessons learned.`,

    GENERAL: base,
  };

  return contextPrompts[contextType] || base;
}

// ── Chat ─────────────────────────────────────────────────────────────────────

async function chat(conversationId, userMessage) {
  // Load conversation
  const conversation = await db('ai_conversations').where({ id: conversationId }).first();
  if (!conversation) throw new Error('Conversation not found.');

  // Load message history
  const history = await db('ai_messages')
    .where({ conversation_id: conversationId })
    .orderBy('created_at', 'asc')
    .select('role', 'content');

  // Save user message
  await db('ai_messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: userMessage,
  });

  // Build messages for AI
  const platformCtx = await getPlatformContext();
  const systemPrompt = buildSystemPrompt(conversation.context_type, platformCtx);

  const response = await aiService.chat(userMessage, {
    feature: 'ai_agent',
    userId: conversation.user_id,
    history: history.map(m => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })),
    systemPrompt,
    language: 'ar',
    temperature: 0.7,
    maxTokens: 4096,
  });

  const assistantContent = response.content || 'No response generated.';
  const tokensUsed = response.usage?.totalTokens || 0;

  // Save assistant response
  await db('ai_messages').insert({
    conversation_id: conversationId,
    role: 'assistant',
    content: assistantContent,
    tokens_used: tokensUsed,
    model: response.model,
  });

  // Update conversation title if first message
  if (history.length === 0) {
    const title = userMessage.slice(0, 100) + (userMessage.length > 100 ? '...' : '');
    await db('ai_conversations').where({ id: conversationId }).update({ title, updated_at: new Date() });
  } else {
    await db('ai_conversations').where({ id: conversationId }).update({ updated_at: new Date() });
  }

  return { content: assistantContent, tokens_used: tokensUsed };
}

// ── Scheduled Analysis ───────────────────────────────────────────────────────

const ANALYSIS_PROMPTS = {
  DAILY_RISK_SCAN: {
    query: () => db('risks').where('is_archived', false).select('*'),
    prompt: (data) => `Analyze the following ${data.length} active risks and provide a JSON response with the following structure:
{ "insights": [{ "insight_type": "RISK_ANOMALY", "severity": "CRITICAL|HIGH|MEDIUM|LOW|INFO", "title": "string", "description": "string", "affected_entities": [{"entity_type": "risk", "entity_id": "RSK-XXXX", "entity_name": "string"}], "recommended_actions": [{"action": "string", "priority": "HIGH|MEDIUM|LOW", "estimated_effort": "string"}] }] }

Look for: scoring inconsistencies (low likelihood but catastrophic impact ignored), risks stuck in IDENTIFIED status > 30 days, risks with no treatments, duplicate/overlapping risks, risks needing escalation.

RISK DATA:\n${JSON.stringify(data, null, 2)}`,
  },
  WEEKLY_BIA_REVIEW: {
    query: () => db('bia_processes')
      .leftJoin('bia_dependencies', 'bia_processes.id', 'bia_dependencies.process_id')
      .select('bia_processes.*', db.raw('count(bia_dependencies.id) as dep_count'))
      .groupBy('bia_processes.id'),
    prompt: (data) => `Analyze these ${data.length} BIA processes. Return JSON with insights array (same structure as risk scan).

Look for: unrealistic RTO/MTPD values, processes with zero dependencies, critical processes without recovery strategies, RTO > MTPD violations.

BIA DATA:\n${JSON.stringify(data, null, 2)}`,
  },
  MONTHLY_SUMOOD_AUDIT: {
    query: () => db('sumood_scores').select('*').orderBy('created_at', 'desc').limit(200).catch(() => []),
    prompt: (data) => `Analyze Sumood National Resilience Index scores. Return JSON with insights array.

Look for: components below maturity level 3, regression from previous period, pillars with uneven component scores, improvement roadmap suggestions.

SUMOOD DATA:\n${JSON.stringify(data, null, 2)}`,
  },
  COMPLIANCE_DRIFT_CHECK: {
    query: async () => {
      const [overdueT, staleBIA, lowSumood] = await Promise.all([
        db('risk_treatments').where('status', '!=', 'COMPLETED').where('target_date', '<', new Date()).select('*').catch(() => []),
        db('bia_assessments').where('updated_at', '<', db.raw("NOW() - INTERVAL '12 months'")).select('*').catch(() => []),
        db('sumood_scores').where('score', '<', 4).select('*').catch(() => []),
      ]);
      return { overdue_treatments: overdueT, stale_assessments: staleBIA, low_sumood_scores: lowSumood };
    },
    prompt: (data) => `Analyze compliance drift across the platform. Return JSON with insights array.

Data includes: overdue risk treatments (past target date), BIA assessments not reviewed in 12+ months, and Sumood scores below threshold 4.

COMPLIANCE DATA:\n${JSON.stringify(data, null, 2)}`,
  },
};

async function runScheduledAnalysis(analysisType) {
  const config = ANALYSIS_PROMPTS[analysisType];
  if (!config) throw new Error(`Unknown analysis type: ${analysisType}`);

  const data = await config.query();
  const prompt = config.prompt(data);

  const result = await aiService.generateJSON(
    prompt,
    { insights: [] },
    {
      feature: 'predictive_insights',
      systemPrompt: 'You are a GRC analysis engine. Return ONLY valid JSON. No markdown fencing, no explanation outside the JSON.',
      language: 'ar',
      temperature: 0.3,
      maxTokens: 4096,
    }
  );

  const parsed = result.data || { insights: [] };

  // Save insights to DB
  const insights = (parsed.insights || []).map(i => ({
    insight_type: i.insight_type || 'RECOMMENDATION',
    severity: i.severity || 'INFO',
    title: (i.title || 'Untitled Insight').slice(0, 500),
    description: i.description || '',
    affected_entities: JSON.stringify(i.affected_entities || []),
    recommended_actions: JSON.stringify(i.recommended_actions || []),
    status: 'NEW',
  }));

  if (insights.length > 0) {
    await db('ai_insights').insert(insights);
  }

  return { analysis_type: analysisType, insights_generated: insights.length, insights };
}

module.exports = { chat, runScheduledAnalysis, getPlatformContext };
