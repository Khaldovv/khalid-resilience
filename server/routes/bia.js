const express = require('express');
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');

const router = express.Router();
router.use(authenticate);
router.use(auditLog);

// ── Helper: ID generation ──────────────────────────────────────────────────────
let asmCounter = 100, prcCounter = 200;
const nextAsmId = () => `BIA-ASM-${String(++asmCounter).padStart(3, '0')}`;
const nextPrcId = () => `BIA-PRC-${String(++prcCounter).padStart(3, '0')}`;

// ─── ASSESSMENTS ───────────────────────────────────────────────────────────────

/**
 * @swagger
 * /bia/assessments:
 *   get:
 *     tags: [BIA]
 *     summary: List BIA assessments
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, IN_REVIEW, APPROVED, ARCHIVED] }
 *       - in: query
 *         name: department_id
 *         schema: { type: string }
 *       - in: query
 *         name: fiscal_year
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of BIA assessments
 *   post:
 *     tags: [BIA]
 *     summary: Create new BIA assessment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [department_id, title, fiscal_year]
 *             properties:
 *               department_id: { type: string }
 *               title: { type: string }
 *               fiscal_year: { type: integer }
 *     responses:
 *       201:
 *         description: Assessment created
 * /bia/assessments/{id}:
 *   get:
 *     tags: [BIA]
 *     summary: Get BIA assessment with processes and workflow
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assessment details
 * /bia/processes:
 *   get:
 *     tags: [BIA]
 *     summary: List BIA processes
 *     parameters:
 *       - in: query
 *         name: assessment_id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of processes
 *   post:
 *     tags: [BIA]
 *     summary: Create BIA process (validates RTO < MTPD per ISO 22301)
 *     responses:
 *       201:
 *         description: Process created
 *       400:
 *         description: Validation error (RTO/MTPD/RPO)
 * /bia/consolidate/{year}:
 *   post:
 *     tags: [BIA]
 *     summary: Generate consolidated BIA report for fiscal year
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Consolidated report with SPOF analysis
 */

// GET /bia/assessments
router.get('/assessments', authorize('VIEW_BIA'), async (req, res, next) => {
  try {
    const { status, department_id, fiscal_year } = req.query;
    let q = db('bia_assessments').orderBy('created_at', 'desc');
    if (status) q = q.where('status', status);
    if (department_id) q = q.where('department_id', department_id);
    if (fiscal_year) q = q.where('fiscal_year', parseInt(fiscal_year));
    const rows = await q;
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// GET /bia/assessments/:id
router.get('/assessments/:id', authorize('VIEW_BIA'), async (req, res, next) => {
  try {
    const asm = await db('bia_assessments').where({ id: req.params.id }).first();
    if (!asm) return res.status(404).json({ error: 'Assessment not found.' });
    const processes = await db('bia_processes').where({ assessment_id: req.params.id });
    const workflow = await db('bia_workflow_steps').where({ assessment_id: req.params.id }).orderBy('step_order');
    res.json({ ...asm, processes, workflow });
  } catch (err) { next(err); }
});

// POST /bia/assessments
router.post('/assessments', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const { department_id, title, title_en, fiscal_year } = req.body;
    if (!department_id || !title || !fiscal_year) return res.status(400).json({ error: 'department_id, title, and fiscal_year are required.' });
    const id = nextAsmId();
    const row = { id, department_id, title, title_en, fiscal_year, status: 'DRAFT', created_by: req.user.id };
    await db('bia_assessments').insert(row);
    res.status(201).json(row);
  } catch (err) { next(err); }
});

// PATCH /bia/assessments/:id
router.patch('/assessments/:id', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const updates = {};
    ['title', 'title_en', 'status', 'fiscal_year'].forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    updates.updated_at = new Date();
    await db('bia_assessments').where({ id: req.params.id }).update(updates);
    const updated = await db('bia_assessments').where({ id: req.params.id }).first();
    res.json(updated);
  } catch (err) { next(err); }
});

// ─── PROCESSES ─────────────────────────────────────────────────────────────────

// GET /bia/processes?assessment_id=XXX
router.get('/processes', authorize('VIEW_BIA'), async (req, res, next) => {
  try {
    let q = db('bia_processes');
    if (req.query.assessment_id) q = q.where('assessment_id', req.query.assessment_id);
    res.json({ data: await q.orderBy('criticality_level') });
  } catch (err) { next(err); }
});

// POST /bia/processes
router.post('/processes', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const { assessment_id, process_name, process_name_en, description, process_owner_name,
            criticality_level, mtpd_hours, rto_hours, rpo_hours, mbco_percent } = req.body;

    if (!assessment_id || !process_name || !mtpd_hours || !rto_hours || !rpo_hours) {
      return res.status(400).json({ error: 'assessment_id, process_name, mtpd_hours, rto_hours, and rpo_hours are required.' });
    }

    // Server-side validation: RTO < MTPD, RPO <= RTO
    if (rto_hours >= mtpd_hours) return res.status(400).json({ error: 'RTO must be less than MTPD (ISO 22301 §8.2.2).' });
    if (rpo_hours > rto_hours) return res.status(400).json({ error: 'RPO must be ≤ RTO.' });

    const id = nextPrcId();
    const row = { id, assessment_id, process_name, process_name_en, description, process_owner_name,
                  criticality_level: criticality_level || 'MEDIUM', mtpd_hours, rto_hours, rpo_hours, mbco_percent: mbco_percent || 50 };
    await db('bia_processes').insert(row);
    res.status(201).json(row);
  } catch (err) { next(err); }
});

// PATCH /bia/processes/:id
router.patch('/processes/:id', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const existing = await db('bia_processes').where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ error: 'Process not found.' });

    const updates = {};
    ['process_name', 'process_name_en', 'description', 'process_owner_name',
     'criticality_level', 'mtpd_hours', 'rto_hours', 'rpo_hours', 'mbco_percent'].forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    // Validate timings
    const mtpd = updates.mtpd_hours ?? existing.mtpd_hours;
    const rto = updates.rto_hours ?? existing.rto_hours;
    const rpo = updates.rpo_hours ?? existing.rpo_hours;
    if (rto >= mtpd) return res.status(400).json({ error: 'RTO must be < MTPD.' });
    if (rpo > rto) return res.status(400).json({ error: 'RPO must be ≤ RTO.' });

    updates.updated_at = new Date();
    await db('bia_processes').where({ id: req.params.id }).update(updates);
    res.json(await db('bia_processes').where({ id: req.params.id }).first());
  } catch (err) { next(err); }
});

// DELETE /bia/processes/:id — cascade handled by DB FKs
router.delete('/processes/:id', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const existing = await db('bia_processes').where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ error: 'Process not found.' });
    await db('bia_processes').where({ id: req.params.id }).del();
    res.json({ message: 'Process deleted.', id: req.params.id });
  } catch (err) { next(err); }
});

// ─── IMPACT RATINGS ────────────────────────────────────────────────────────────

// GET /bia/impact-ratings/:processId
router.get('/impact-ratings/:processId', authorize('VIEW_BIA'), async (req, res, next) => {
  try {
    const rows = await db('bia_impact_ratings').where({ process_id: req.params.processId });
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// PUT /bia/impact-ratings/:processId — bulk upsert
router.put('/impact-ratings/:processId', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const { ratings } = req.body; // array of { impact_category, time_interval_hours, severity_score, justification }
    if (!Array.isArray(ratings)) return res.status(400).json({ error: 'ratings must be an array.' });

    for (const r of ratings) {
      if (r.severity_score < 1 || r.severity_score > 5) {
        return res.status(400).json({ error: `severity_score must be 1-5. Got ${r.severity_score}.` });
      }
      await db('bia_impact_ratings')
        .insert({ process_id: req.params.processId, impact_category: r.impact_category, time_interval_hours: r.time_interval_hours, severity_score: r.severity_score, justification: r.justification || '' })
        .onConflict(['process_id', 'impact_category', 'time_interval_hours'])
        .merge({ severity_score: r.severity_score, justification: r.justification || '', updated_at: new Date() });
    }

    const updated = await db('bia_impact_ratings').where({ process_id: req.params.processId });
    res.json({ data: updated });
  } catch (err) { next(err); }
});

// ─── DEPENDENCIES ──────────────────────────────────────────────────────────────

router.get('/dependencies', authorize('VIEW_BIA'), async (req, res, next) => {
  try {
    let q = db('bia_dependencies');
    if (req.query.process_id) q = q.where('process_id', req.query.process_id);
    res.json({ data: await q });
  } catch (err) { next(err); }
});

router.post('/dependencies', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const { process_id, dependency_type, resource_name, resource_name_en, criticality, has_alternative, alternative_description, min_staff_required, vendor_contract_ref } = req.body;
    if (!process_id || !dependency_type || !resource_name) return res.status(400).json({ error: 'process_id, dependency_type, resource_name required.' });
    const [row] = await db('bia_dependencies').insert({ process_id, dependency_type, resource_name, resource_name_en, criticality, has_alternative, alternative_description, min_staff_required, vendor_contract_ref }).returning('*');
    res.status(201).json(row);
  } catch (err) { next(err); }
});

router.delete('/dependencies/:id', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    await db('bia_dependencies').where({ id: req.params.id }).del();
    res.json({ message: 'Dependency deleted.' });
  } catch (err) { next(err); }
});

// ─── RECOVERY STRATEGIES ───────────────────────────────────────────────────────

router.get('/recovery-strategies', authorize('VIEW_BIA'), async (req, res, next) => {
  try {
    let q = db('bia_recovery_strategies');
    if (req.query.process_id) q = q.where('process_id', req.query.process_id);
    res.json({ data: await q });
  } catch (err) { next(err); }
});

router.post('/recovery-strategies', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const { process_id, strategy_phase, strategy_description, strategy_description_en, estimated_cost_sar, responsible_user_name } = req.body;
    if (!process_id || !strategy_phase || !strategy_description) return res.status(400).json({ error: 'process_id, strategy_phase, strategy_description required.' });
    const [row] = await db('bia_recovery_strategies').insert({ process_id, strategy_phase, strategy_description, strategy_description_en, estimated_cost_sar, responsible_user_name }).returning('*');
    res.status(201).json(row);
  } catch (err) { next(err); }
});

router.delete('/recovery-strategies/:id', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    await db('bia_recovery_strategies').where({ id: req.params.id }).del();
    res.json({ message: 'Recovery strategy deleted.' });
  } catch (err) { next(err); }
});

// ─── RISK LINKS ────────────────────────────────────────────────────────────────

router.get('/risk-links', authorize('VIEW_BIA'), async (req, res, next) => {
  try {
    let q = db('bia_risk_links');
    if (req.query.process_id) q = q.where('process_id', req.query.process_id);
    res.json({ data: await q });
  } catch (err) { next(err); }
});

router.post('/risk-links', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    const { process_id, risk_id, link_type, notes } = req.body;
    if (!process_id || !risk_id) return res.status(400).json({ error: 'process_id and risk_id required.' });
    const [row] = await db('bia_risk_links').insert({ process_id, risk_id, link_type, notes }).returning('*');
    res.status(201).json(row);
  } catch (err) { next(err); }
});

router.delete('/risk-links/:id', authorize('MANAGE_BIA'), async (req, res, next) => {
  try {
    await db('bia_risk_links').where({ id: req.params.id }).del();
    res.json({ message: 'Risk link deleted.' });
  } catch (err) { next(err); }
});

// ─── CONSOLIDATION ─────────────────────────────────────────────────────────────

router.post('/consolidate/:year', authorize('MANAGE_BIA', 'APPROVE_BIA'), async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    const approved = await db('bia_assessments').where({ status: 'APPROVED', fiscal_year: year });
    const approvedIds = approved.map(a => a.id);

    if (approvedIds.length === 0) return res.status(400).json({ error: 'No approved assessments found for this fiscal year.' });

    const processes = await db('bia_processes').whereIn('assessment_id', approvedIds);
    const processIds = processes.map(p => p.id);
    const deps = await db('bia_dependencies').whereIn('process_id', processIds);
    const spofDeps = deps.filter(d => d.criticality === 'CRITICAL' && !d.has_alternative);

    const sorted = [...processes].sort((a, b) => a.rto_hours - b.rto_hours);
    const orgMinRto = sorted.length ? sorted[0].rto_hours : 0;
    const orgMinMtpd = sorted.length ? Math.min(...sorted.map(p => p.mtpd_hours)) : 0;

    const report = {
      fiscal_year: year,
      total_processes: processes.length,
      org_min_rto: orgMinRto,
      org_min_mtpd: orgMinMtpd,
      departments_covered: [...new Set(approved.map(a => a.department_id))],
      critical_count: processes.filter(p => p.criticality_level === 'CRITICAL').length,
      high_count: processes.filter(p => p.criticality_level === 'HIGH').length,
      medium_count: processes.filter(p => p.criticality_level === 'MEDIUM').length,
      low_count: processes.filter(p => p.criticality_level === 'LOW').length,
      spof_count: spofDeps.length,
      avg_rto: processes.length ? +(processes.reduce((a, p) => a + parseFloat(p.rto_hours), 0) / processes.length).toFixed(2) : 0,
      avg_mtpd: processes.length ? +(processes.reduce((a, p) => a + parseFloat(p.mtpd_hours), 0) / processes.length).toFixed(2) : 0,
      recovery_priority_order: sorted.map(p => ({ id: p.id, name: p.process_name, rto: p.rto_hours, mtpd: p.mtpd_hours, criticality: p.criticality_level })),
    };

    res.json(report);
  } catch (err) { next(err); }
});

module.exports = router;
