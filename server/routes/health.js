/**
 * Health Check Routes — Liveness, DB, AI, and aggregated checks.
 * These endpoints are public (no authentication required).
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Basic liveness check
 *     security: []
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
  });
});

/**
 * @swagger
 * /health/db:
 *   get:
 *     tags: [Health]
 *     summary: Database connectivity check
 *     security: []
 *     responses:
 *       200:
 *         description: Database connected
 *       503:
 *         description: Database unavailable
 */
router.get('/health/db', async (req, res) => {
  try {
    const start = Date.now();
    await db.raw('SELECT 1');
    res.json({
      status: 'ok',
      service: 'postgresql',
      latencyMs: Date.now() - start,
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      service: 'postgresql',
      message: err.message,
    });
  }
});

/**
 * @swagger
 * /health/ai:
 *   get:
 *     tags: [Health]
 *     summary: AI service (OpenRouter) connectivity check
 *     security: []
 *     responses:
 *       200:
 *         description: AI service reachable
 *       503:
 *         description: AI service unavailable
 */
router.get('/health/ai', async (req, res) => {
  try {
    const start = Date.now();
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || ''}` },
      signal: AbortSignal.timeout(10000),
    });
    res.json({
      status: response.ok ? 'ok' : 'degraded',
      service: 'openrouter',
      latencyMs: Date.now() - start,
      apiKeyConfigured: !!process.env.OPENROUTER_API_KEY,
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      service: 'openrouter',
      message: err.message,
    });
  }
});

/**
 * @swagger
 * /health/all:
 *   get:
 *     tags: [Health]
 *     summary: Aggregated health check for all services
 *     security: []
 *     responses:
 *       200:
 *         description: All services status
 */
router.get('/health/all', async (req, res) => {
  const results = {};
  let allOk = true;

  // Database check
  try {
    const start = Date.now();
    await db.raw('SELECT 1');
    results.database = { status: 'ok', latencyMs: Date.now() - start };
  } catch (err) {
    results.database = { status: 'error', message: err.message };
    allOk = false;
  }

  // OpenRouter check
  try {
    const start = Date.now();
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      signal: AbortSignal.timeout(10000),
    });
    results.openrouter = { status: response.ok ? 'ok' : 'degraded', latencyMs: Date.now() - start };
    if (!response.ok) allOk = false;
  } catch (err) {
    results.openrouter = { status: 'error', message: err.message };
    allOk = false;
  }

  // Memory usage
  const mem = process.memoryUsage();
  results.memory = {
    rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
  };

  res.json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    checks: results,
  });
});

module.exports = router;
