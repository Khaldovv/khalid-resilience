/**
 * Admin AI Monitoring Routes — models, usage, test, cache management.
 */
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const aiService = require('../services/ai/aiService');

router.use(authenticate);

// GET /models — List available open-source models from OpenRouter
router.get('/models', authorize('MANAGE_RISKS'), async (req, res) => {
  try {
    const models = await aiService.listAvailableModels();
    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /usage — Aggregated usage statistics
router.get('/usage', authorize('MANAGE_RISKS'), async (req, res) => {
  try {
    const { TokenTracker } = require('../services/ai/tokenTracker');
    const tracker = new TokenTracker();
    const stats = await tracker.getUsageStats(req.query.period || '30days');
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /test — Test AI connection with a simple Arabic prompt
router.post('/test', authorize('MANAGE_RISKS'), async (req, res) => {
  try {
    const result = await aiService.chat('اكتب كلمة واحدة: مرحباً', {
      feature: 'test',
      userId: req.user.id,
      maxTokens: 20,
    });
    res.json({
      success: true,
      response: result.content,
      model: result.model,
      latencyMs: result.latencyMs,
      usage: result.usage,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /cache/clear — Clear AI response cache
router.post('/cache/clear', authorize('MANAGE_RISKS'), async (req, res) => {
  try {
    const { CacheManager } = require('../services/ai/cacheManager');
    const cache = new CacheManager();
    await cache.clear();
    res.json({ message: 'تم مسح الذاكرة المؤقتة بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /config — Current AI configuration (no secrets)
router.get('/config', authorize('MANAGE_RISKS'), async (req, res) => {
  try {
    const { getConfig } = require('../services/ai/config');
    const config = getConfig();
    res.json({
      provider: config.provider,
      models: config.models,
      cache: config.cache,
      apiKeyConfigured: !!process.env.OPENROUTER_API_KEY,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
