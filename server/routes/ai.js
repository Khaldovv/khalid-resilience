const express = require('express');
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');
const aiService = require('../services/aiService');

const router = express.Router();
router.use(authenticate);
router.use(auditLog);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVERSATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// POST /conversations — Create new conversation
router.post('/conversations', async (req, res, next) => {
  try {
    const { context_type, context_entity_id, title } = req.body;
    if (!context_type) return res.status(400).json({ error: 'context_type is required.' });

    const [conversation] = await db('ai_conversations').insert({
      user_id: req.user.id,
      title: title || null,
      context_type,
      context_entity_id: context_entity_id || null,
    }).returning('*');

    res.status(201).json(conversation);
  } catch (err) { next(err); }
});

// GET /conversations — List user's conversations
router.get('/conversations', async (req, res, next) => {
  try {
    const conversations = await db('ai_conversations')
      .where({ user_id: req.user.id })
      .where('status', '!=', 'ARCHIVED')
      .orderBy('updated_at', 'desc');

    res.json({ data: conversations });
  } catch (err) { next(err); }
});

// GET /conversations/:id — Get conversation with messages
router.get('/conversations/:id', async (req, res, next) => {
  try {
    const conversation = await db('ai_conversations').where({ id: req.params.id }).first();
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });

    const messages = await db('ai_messages')
      .where({ conversation_id: req.params.id })
      .orderBy('created_at', 'asc');

    res.json({ ...conversation, messages });
  } catch (err) { next(err); }
});

// POST /conversations/:id/message — Send message and get AI response
router.post('/conversations/:id/message', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required.' });

    const conversation = await db('ai_conversations').where({ id: req.params.id }).first();
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });

    const result = await aiService.chat(req.params.id, message);
    res.json(result);
  } catch (err) {
    // Friendly error for missing API key or SDK
    if (err.message?.includes('OPENROUTER_API_KEY') || err.message?.includes('OpenRouter')) {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
});

// DELETE /conversations/:id — Archive conversation
router.delete('/conversations/:id', async (req, res, next) => {
  try {
    const conversation = await db('ai_conversations').where({ id: req.params.id }).first();
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });

    await db('ai_conversations').where({ id: req.params.id }).update({ status: 'ARCHIVED', updated_at: new Date() });
    res.json({ message: 'Conversation archived.' });
  } catch (err) { next(err); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INSIGHTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /insights — List all insights
router.get('/insights', authorize('VIEW_RISKS'), async (req, res, next) => {
  try {
    const { severity, status, insight_type, limit } = req.query;
    let query = db('ai_insights').orderBy('created_at', 'desc');

    if (severity) query = query.where('severity', severity);
    if (status) query = query.where('status', status);
    if (insight_type) query = query.where('insight_type', insight_type);
    query = query.limit(parseInt(limit) || 100);

    const insights = await query;
    res.json({ data: insights });
  } catch (err) { next(err); }
});

// PATCH /insights/:id — Update insight status
router.patch('/insights/:id', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const updates = { status };
    if (status === 'RESOLVED') {
      updates.resolved_by = req.user.id;
      updates.resolved_at = new Date();
    }

    await db('ai_insights').where({ id: req.params.id }).update(updates);
    const insight = await db('ai_insights').where({ id: req.params.id }).first();
    res.json(insight);
  } catch (err) { next(err); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ON-DEMAND ANALYSIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.post('/analyze/risks', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const result = await aiService.runScheduledAnalysis('DAILY_RISK_SCAN');
    res.json(result);
  } catch (err) {
    if (err.message?.includes('OPENROUTER_API_KEY') || err.message?.includes('OpenRouter')) {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
});

router.post('/analyze/bia', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const result = await aiService.runScheduledAnalysis('WEEKLY_BIA_REVIEW');
    res.json(result);
  } catch (err) {
    if (err.message?.includes('OPENROUTER_API_KEY') || err.message?.includes('OpenRouter')) {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
});

router.post('/analyze/sumood', authorize('MANAGE_SUMOOD'), async (req, res, next) => {
  try {
    const result = await aiService.runScheduledAnalysis('MONTHLY_SUMOOD_AUDIT');
    res.json(result);
  } catch (err) {
    if (err.message?.includes('OPENROUTER_API_KEY') || err.message?.includes('OpenRouter')) {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
});

router.post('/analyze/compliance', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const result = await aiService.runScheduledAnalysis('COMPLIANCE_DRIFT_CHECK');
    res.json(result);
  } catch (err) {
    if (err.message?.includes('OPENROUTER_API_KEY') || err.message?.includes('OpenRouter')) {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCHEDULED ANALYSES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /scheduled — List scheduled analyses (ADMIN)
router.get('/scheduled', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const scheduled = await db('ai_scheduled_analyses').orderBy('created_at', 'desc');
    res.json({ data: scheduled });
  } catch (err) { next(err); }
});

// POST /scheduled — Create scheduled analysis (ADMIN)
router.post('/scheduled', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const { analysis_type, schedule_cron, config } = req.body;
    if (!analysis_type || !schedule_cron) {
      return res.status(400).json({ error: 'analysis_type and schedule_cron are required.' });
    }

    const [record] = await db('ai_scheduled_analyses').insert({
      analysis_type,
      schedule_cron,
      config: JSON.stringify(config || {}),
      created_by: req.user.id,
    }).returning('*');

    res.status(201).json(record);
  } catch (err) { next(err); }
});

// PATCH /scheduled/:id — Toggle active/inactive (ADMIN)
router.patch('/scheduled/:id', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const existing = await db('ai_scheduled_analyses').where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ error: 'Scheduled analysis not found.' });

    const is_active = req.body.is_active !== undefined ? req.body.is_active : !existing.is_active;
    await db('ai_scheduled_analyses').where({ id: req.params.id }).update({ is_active });

    const updated = await db('ai_scheduled_analyses').where({ id: req.params.id }).first();
    res.json(updated);
  } catch (err) { next(err); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI RISK GENERATOR — department-specific persona-driven risk generation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

router.post('/generate-risks', async (req, res, next) => {
  try {
    const { employeeName, department, dailyTasks, language } = req.body;
    if (!employeeName || !department || !dailyTasks) {
      return res.status(400).json({ error: 'employeeName, department, and dailyTasks are required' });
    }
    const riskGenerator = require('../services/riskGeneratorService');
    const risks = await riskGenerator.generateRisks(
      employeeName, department, dailyTasks,
      language || 'ar', req.user?.id
    );
    res.json({ risks });
  } catch (err) {
    if (err.message?.includes('OPENROUTER_API_KEY') || err.message?.includes('OpenRouter')) {
      return res.status(503).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;
