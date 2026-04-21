const express = require('express');
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');

const router = express.Router();
router.use(authenticate);
router.use(auditLog);

// ── Helpers ────────────────────────────────────────────────────────────────────
function calcScore(likelihood, impact) {
  const score = likelihood * impact;
  if (score >= 20) return { score, level: 'Catastrophic', color: '#7f1d1d' };
  if (score >= 15) return { score, level: 'High',         color: '#ef4444' };
  if (score >= 10) return { score, level: 'Medium',       color: '#f97316' };
  if (score >= 5)  return { score, level: 'Low',          color: '#eab308' };
  return { score, level: 'Very Low', color: '#22c55e' };
}

let riskCounter = null;
async function nextRiskId() {
  if (riskCounter === null) {
    // Initialize from DB max to survive restarts
    const result = await db('risks').max('id as max_id').first();
    const maxId = result?.max_id;
    if (maxId) {
      const num = parseInt(maxId.replace('RSK-', ''), 10);
      riskCounter = isNaN(num) ? 5000 : num;
    } else {
      riskCounter = 5000;
    }
  }
  riskCounter++;
  return `RSK-${String(riskCounter).padStart(4, '0')}`;
}

/**
 * @swagger
 * /risks:
 *   get:
 *     tags: [Risks]
 *     summary: List risks with filters, sorting, and pagination
 *     parameters:
 *       - in: query
 *         name: department
 *         schema: { type: string }
 *         description: Filter by department UUID
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [IDENTIFIED, ASSESSED, IN_PROGRESS, MONITORED, UNDER_ANALYSIS, PLANNED, CLOSED] }
 *       - in: query
 *         name: risk_type
 *         schema: { type: string, enum: [Cybersecurity, Operational, Financial, Strategic, Compliance, Geopolitical, Reputational] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search in name and description
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: per_page
 *         schema: { type: integer, default: 25, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated list of risks
 */
// ── GET /risks — List with filters, sorting, pagination ────────────────────────
router.get('/', authorize('VIEW_RISKS'), async (req, res, next) => {
  try {
    const { department, status, risk_type, search, sort_by, sort_dir, page, per_page } = req.query;
    let query = db('risks').where('is_archived', false);

    if (department) query = query.where('department_id', department);
    if (status) query = query.where('lifecycle_status', status);
    if (risk_type) query = query.where('risk_type', risk_type);
    if (search) query = query.where(function () {
      this.whereILike('risk_name', `%${search}%`).orWhereILike('description', `%${search}%`);
    });

    const sortCol = sort_by || 'created_at';
    const sortOrd = sort_dir === 'asc' ? 'asc' : 'desc';

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limit = Math.min(100, parseInt(per_page) || 25);
    const offset = (pageNum - 1) * limit;

    const [countResult, rows] = await Promise.all([
      db('risks').where('is_archived', false).count('* as total').first(),
      query.orderBy(sortCol, sortOrd).limit(limit).offset(offset),
    ]);

    res.json({
      data: rows,
      pagination: { page: pageNum, per_page: limit, total: parseInt(countResult.total), total_pages: Math.ceil(countResult.total / limit) },
    });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /risks/matrix:
 *   get:
 *     tags: [Risks]
 *     summary: Get 5×5 risk matrix aggregation
 *     parameters:
 *       - in: query
 *         name: likelihood
 *         schema: { type: integer }
 *         description: Get risks in specific cell
 *       - in: query
 *         name: impact
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Matrix cell counts and optional detail
 */
// ── GET /risks/matrix — Risk matrix data (optimized: DB aggregation) ───────────
router.get('/matrix', authorize('VIEW_RISKS'), async (req, res, next) => {
  try {
    // Phase 4 fix: aggregate in PostgreSQL instead of loading 20K rows into memory
    const [cellCounts, totalResult] = await Promise.all([
      db('risks').where('is_archived', false)
        .select('inherent_likelihood', 'inherent_impact')
        .count('* as count')
        .groupBy('inherent_likelihood', 'inherent_impact'),
      db('risks').where('is_archived', false).count('* as total').first(),
    ]);

    // Build 5×5 matrix cells with counts
    const matrix = [];
    const countMap = {};
    cellCounts.forEach(c => { countMap[`${c.inherent_likelihood}-${c.inherent_impact}`] = parseInt(c.count); });

    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        const key = `${l}-${i}`;
        matrix.push({ likelihood: l, impact: i, count: countMap[key] || 0 });
      }
    }

    // If client needs risk details for a specific cell, use query params
    let risks = [];
    if (req.query.likelihood && req.query.impact) {
      risks = await db('risks').where({
        is_archived: false,
        inherent_likelihood: parseInt(req.query.likelihood),
        inherent_impact: parseInt(req.query.impact),
      }).select('id', 'risk_name', 'inherent_score', 'inherent_level', 'lifecycle_status')
        .limit(50);
    }

    res.json({ matrix, total_risks: parseInt(totalResult.total), risks });
  } catch (err) { next(err); }
});

// ── GET /risks/:id — Single risk with treatments + audit trail ─────────────────
router.get('/:id', authorize('VIEW_RISKS'), async (req, res, next) => {
  try {
    const risk = await db('risks').where({ id: req.params.id }).first();
    if (!risk) return res.status(404).json({ error: 'Risk not found.' });

    const [treatments, trail] = await Promise.all([
      db('risk_treatments').where({ risk_id: req.params.id }).orderBy('created_at', 'desc'),
      db('risk_audit_trail').where({ risk_id: req.params.id }).orderBy('created_at', 'desc').limit(50),
    ]);

    res.json({ ...risk, treatments, audit_trail: trail });
  } catch (err) { next(err); }
});

// ── POST /risks — Create new risk (hardened: ISO 31000 validation) ─────────────
router.post('/', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const { risk_name, description, risk_type, inherent_likelihood, inherent_impact,
            residual_likelihood, residual_impact, confidence_level,
            department_id, risk_owner_id, response_type, mitigation_plan,
            plan_owner_id, implementation_timeframe, notes } = req.body;

    // ── Required fields ─────────────────────────────────────────────────────
    if (!risk_name || !inherent_likelihood || !inherent_impact) {
      return res.status(400).json({ error: 'risk_name, inherent_likelihood, and inherent_impact are required.' });
    }

    // ── Integer bounds (must be 1–5) ────────────────────────────────────────
    const iL = parseInt(inherent_likelihood), iI = parseInt(inherent_impact);
    if (!Number.isInteger(iL) || iL < 1 || iL > 5) return res.status(400).json({ error: 'inherent_likelihood must be an integer 1–5.' });
    if (!Number.isInteger(iI) || iI < 1 || iI > 5) return res.status(400).json({ error: 'inherent_impact must be an integer 1–5.' });

    // ── Confidence level required (1–5) ─────────────────────────────────────
    const conf = parseInt(confidence_level || 3);
    if (!Number.isInteger(conf) || conf < 1 || conf > 5) {
      return res.status(400).json({ error: 'confidence_level must be an integer 1–5.' });
    }

    const inherent = calcScore(iL, iI);

    // ── Residual validation ─────────────────────────────────────────────────
    let residual = { score: null, level: null };
    let rL = null, rI = null;
    if (residual_likelihood != null && residual_impact != null) {
      rL = parseInt(residual_likelihood);
      rI = parseInt(residual_impact);
      if (!Number.isInteger(rL) || rL < 1 || rL > 5) return res.status(400).json({ error: 'residual_likelihood must be an integer 1–5.' });
      if (!Number.isInteger(rI) || rI < 1 || rI > 5) return res.status(400).json({ error: 'residual_impact must be an integer 1–5.' });

      residual = calcScore(rL, rI);

      // ISO 31000 §6.4.4: Residual risk score MUST be ≤ Inherent risk score
      if (residual.score > inherent.score) {
        return res.status(400).json({
          error: `Residual risk score (${residual.score}) cannot exceed Inherent risk score (${inherent.score}). Residual risk represents the remaining risk AFTER treatment.`,
          code: 'RESIDUAL_EXCEEDS_INHERENT',
        });
      }
    }

    // ── Catastrophic risk mandates (score ≥ 20) ─────────────────────────────
    if (inherent.score >= 20) {
      if (!risk_owner_id) {
        return res.status(400).json({ error: 'Catastrophic risks (score ≥ 20) MUST have a designated Risk Owner (ISO 31000 §6.4.2).', code: 'CATASTROPHIC_NO_OWNER' });
      }
      if (!mitigation_plan || mitigation_plan.trim().length < 10) {
        return res.status(400).json({ error: 'Catastrophic risks (score ≥ 20) MUST have a mitigation plan with at least 10 characters.', code: 'CATASTROPHIC_NO_PLAN' });
      }
    }

    const id = await nextRiskId();
    const risk = {
      id, risk_name: risk_name.trim(), description, risk_type,
      inherent_likelihood: iL, inherent_impact: iI, inherent_score: inherent.score, inherent_level: inherent.level,
      residual_likelihood: rL, residual_impact: rI,
      residual_score: residual.score, residual_level: residual.level,
      confidence_level: conf,
      department_id, risk_owner_id, response_type, mitigation_plan,
      plan_owner_id, implementation_timeframe, notes,
      lifecycle_status: 'IDENTIFIED', created_by: req.user.id,
    };

    await db('risks').insert(risk);
    await db('risk_audit_trail').insert({ risk_id: id, action: 'CREATED', user_id: req.user.id });

    res.status(201).json({ id, ...risk });
  } catch (err) { next(err); }
});

// ── PATCH /risks/:id — Update risk (hardened: residual ≤ inherent) ─────────────
router.patch('/:id', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const existing = await db('risks').where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ error: 'Risk not found.' });

    const updates = {};
    const auditEntries = [];
    const fields = ['risk_name', 'description', 'risk_type', 'inherent_likelihood', 'inherent_impact',
                     'residual_likelihood', 'residual_impact', 'confidence_level', 'department_id',
                     'risk_owner_id', 'response_type', 'lifecycle_status', 'mitigation_plan',
                     'plan_owner_id', 'implementation_timeframe', 'notes'];

    for (const f of fields) {
      if (req.body[f] !== undefined && req.body[f] !== existing[f]) {
        auditEntries.push({ risk_id: req.params.id, action: 'UPDATED', field_changed: f, old_value: String(existing[f] ?? ''), new_value: String(req.body[f]), user_id: req.user.id });
        updates[f] = req.body[f];
      }
    }

    // ── Integer bounds validation ────────────────────────────────────────────
    for (const field of ['inherent_likelihood', 'inherent_impact', 'residual_likelihood', 'residual_impact', 'confidence_level']) {
      if (updates[field] !== undefined) {
        const val = parseInt(updates[field]);
        if (!Number.isInteger(val) || val < 1 || val > 5) {
          return res.status(400).json({ error: `${field} must be an integer 1–5.` });
        }
        updates[field] = val;
      }
    }

    // Recalculate scores if likelihood/impact changed
    const finalIL = updates.inherent_likelihood ?? existing.inherent_likelihood;
    const finalII = updates.inherent_impact ?? existing.inherent_impact;
    if (updates.inherent_likelihood != null || updates.inherent_impact != null) {
      const s = calcScore(finalIL, finalII);
      updates.inherent_score = s.score;
      updates.inherent_level = s.level;
    }

    const finalRL = updates.residual_likelihood ?? existing.residual_likelihood;
    const finalRI = updates.residual_impact ?? existing.residual_impact;
    if ((updates.residual_likelihood != null || updates.residual_impact != null) && finalRL && finalRI) {
      const s = calcScore(finalRL, finalRI);
      updates.residual_score = s.score;
      updates.residual_level = s.level;
    }

    // ── Cross-validation: Residual ≤ Inherent ───────────────────────────────
    const iScore = updates.inherent_score ?? existing.inherent_score;
    const rScore = updates.residual_score ?? existing.residual_score;
    if (rScore != null && rScore > iScore) {
      return res.status(400).json({
        error: `Residual risk score (${rScore}) cannot exceed Inherent risk score (${iScore}).`,
        code: 'RESIDUAL_EXCEEDS_INHERENT',
      });
    }

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date();
      await db('risks').where({ id: req.params.id }).update(updates);
      if (auditEntries.length > 0) await db('risk_audit_trail').insert(auditEntries);
    }

    const updated = await db('risks').where({ id: req.params.id }).first();
    res.json(updated);
  } catch (err) { next(err); }
});

// ── DELETE /risks/:id — Soft delete (archive) ──────────────────────────────────
router.delete('/:id', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const risk = await db('risks').where({ id: req.params.id }).first();
    if (!risk) return res.status(404).json({ error: 'Risk not found.' });

    await db('risks').where({ id: req.params.id }).update({ is_archived: true, updated_at: new Date() });
    await db('risk_audit_trail').insert({ risk_id: req.params.id, action: 'ARCHIVED', user_id: req.user.id });

    res.json({ message: 'Risk archived successfully.', id: req.params.id });
  } catch (err) { next(err); }
});

// ── POST /risks/:id/treatments — Add treatment plan ───────────────────────────
router.post('/:id/treatments', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const risk = await db('risks').where({ id: req.params.id }).first();
    if (!risk) return res.status(404).json({ error: 'Risk not found.' });

    const { treatment_type, description, plan_owner_id, target_date } = req.body;
    if (!treatment_type || !description) {
      return res.status(400).json({ error: 'treatment_type and description are required.' });
    }

    const [treatment] = await db('risk_treatments').insert({
      risk_id: req.params.id, treatment_type, description, plan_owner_id, target_date,
    }).returning('*');

    await db('risk_audit_trail').insert({
      risk_id: req.params.id, action: 'TREATMENT_ADDED', field_changed: 'treatments',
      new_value: JSON.stringify({ treatment_type, description }), user_id: req.user.id,
    });

    res.status(201).json(treatment);
  } catch (err) { next(err); }
});

// ── GET /risks/:id/audit-trail ─────────────────────────────────────────────────
router.get('/:id/audit-trail', authorize('VIEW_RISKS'), async (req, res, next) => {
  try {
    const trail = await db('risk_audit_trail')
      .where({ risk_id: req.params.id })
      .leftJoin('users', 'risk_audit_trail.user_id', 'users.id')
      .select('risk_audit_trail.*', 'users.full_name_en as user_name')
      .orderBy('risk_audit_trail.created_at', 'desc');

    res.json(trail);
  } catch (err) { next(err); }
});

// ── POST /risks/:id/simulate — Run AI simulation ──────────────────────────────
router.post('/:id/simulate', authorize('MANAGE_RISKS'), async (req, res, next) => {
  try {
    const { simulateRisk } = require('../services/riskSimulationService');
    const simulation = await simulateRisk(req.params.id, req.user.id);
    await db('risk_audit_trail').insert({
      risk_id: req.params.id, action: 'RUN_SIMULATION', user_id: req.user.id,
    });
    res.json(simulation);
  } catch (err) {
    if (err.message.includes('OPENROUTER_API_KEY')) {
      return res.status(503).json({ error: err.message, code: 'API_NOT_CONFIGURED' });
    }
    next(err);
  }
});

// ── GET /risks/:id/simulations — List past simulations ────────────────────────
router.get('/:id/simulations', authorize('VIEW_RISKS'), async (req, res, next) => {
  try {
    const sims = await db('risk_simulations')
      .where('risk_id', req.params.id)
      .orderBy('created_at', 'desc');
    res.json(sims);
  } catch (err) { next(err); }
});

module.exports = router;
