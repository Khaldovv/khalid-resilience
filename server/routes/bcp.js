const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');
const { generateBCPDocument } = require('../services/bcpDocumentService');

// ─── Helper: Generate BCP ID ──────────────────────────────────────────────────
async function generateBCPId() {
  const year = new Date().getFullYear();
  const prefix = `BCP-${year}-`;
  const existing = await db('bcp_plans')
    .where('id', 'like', `${prefix}%`)
    .orderBy('id', 'desc')
    .first();
  
  let seq = 1;
  if (existing) {
    const lastNum = parseInt(existing.id.replace(prefix, ''), 10);
    if (!isNaN(lastNum)) seq = lastNum + 1;
  }
  return `${prefix}${String(seq).padStart(3, '0')}`;
}

/**
 * @swagger
 * /bcp:
 *   get:
 *     tags: [BCP]
 *     summary: List all BCP plans
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, UNDER_REVIEW, APPROVED, ACTIVE, RETIRED] }
 *       - in: query
 *         name: department_id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated BCP plan list
 *   post:
 *     tags: [BCP]
 *     summary: Create new BCP plan (BC_COORDINATOR only)
 *     responses:
 *       201:
 *         description: BCP plan created
 * /bcp/{id}:
 *   get:
 *     tags: [BCP]
 *     summary: Get single BCP plan details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, example: "BCP-2026-001" }
 *     responses:
 *       200:
 *         description: BCP plan details
 *   put:
 *     tags: [BCP]
 *     summary: Update BCP plan (not allowed on APPROVED plans)
 *     responses:
 *       200:
 *         description: BCP plan updated
 *   delete:
 *     tags: [BCP]
 *     summary: Delete BCP plan (not allowed on ACTIVE plans)
 *     responses:
 *       200:
 *         description: BCP plan deleted
 * /bcp/{id}/approve:
 *   patch:
 *     tags: [BCP]
 *     summary: Approve a BCP plan (CISO/CEO only)
 *     responses:
 *       200:
 *         description: BCP plan approved
 * /bcp/{id}/generate:
 *   get:
 *     tags: [BCP]
 *     summary: Generate ISO 22301 compliant DOCX document
 *     produces: [application/vnd.openxmlformats-officedocument.wordprocessingml.document]
 *     responses:
 *       200:
 *         description: DOCX file download
 * /bcp/{id}/activate:
 *   post:
 *     tags: [BCP]
 *     summary: Activate BCP during incident
 *     responses:
 *       201:
 *         description: BCP activated
 */

// ─── GET /api/v1/bcp — List all BCP plans ─────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, department_id, page = 1, limit = 20 } = req.query;
    let query = db('bcp_plans')
      .leftJoin('departments', 'bcp_plans.department_id', 'departments.id')
      .select(
        'bcp_plans.*',
        'departments.name_ar as department_name_ar',
        'departments.name_en as department_name_en'
      );
    
    if (status) query = query.where('bcp_plans.status', status);
    if (department_id) query = query.where('bcp_plans.department_id', department_id);
    
    // Non-admin users see only their department's plans or all (BC_COORDINATOR/CISO/CEO)
    const bypassRoles = ['ADMIN', 'BC_COORDINATOR', 'CISO', 'CEO'];
    if (!bypassRoles.includes(req.user.role)) {
      query = query.where('bcp_plans.department_id', req.user.department_id);
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const plans = await query.orderBy('bcp_plans.created_at', 'desc').limit(parseInt(limit)).offset(offset);
    
    const [{ count }] = await db('bcp_plans').count('* as count');
    
    res.json({
      data: plans,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(count) }
    });
  } catch (err) {
    console.error('[BCP GET /] Error:', err);
    res.status(500).json({ error: 'Failed to fetch BCP plans.' });
  }
});

// ─── GET /api/v1/bcp/:id — Get single BCP plan ───────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const plan = await db('bcp_plans')
      .leftJoin('departments', 'bcp_plans.department_id', 'departments.id')
      .select(
        'bcp_plans.*',
        'departments.name_ar as department_name_ar',
        'departments.name_en as department_name_en'
      )
      .where('bcp_plans.id', req.params.id)
      .first();
    
    if (!plan) return res.status(404).json({ error: 'BCP plan not found.' });
    
    res.json({ data: plan });
  } catch (err) {
    console.error('[BCP GET /:id] Error:', err);
    res.status(500).json({ error: 'Failed to fetch BCP plan.' });
  }
});

// ─── POST /api/v1/bcp — Create new BCP plan ──────────────────────────────────
router.post('/', authenticate, authorize('MANAGE_BCP', 'BC_COORDINATOR'), auditLog, async (req, res) => {
  try {
    const id = await generateBCPId();
    const plan = {
      id,
      title_ar: req.body.title_ar,
      title_en: req.body.title_en || null,
      disruption_scenario: req.body.disruption_scenario,
      scenario_description_ar: req.body.scenario_description_ar || null,
      scenario_description_en: req.body.scenario_description_en || null,
      department_id: req.body.department_id || req.user.department_id,
      scope_type: req.body.scope_type || 'DEPARTMENT',
      scope_site: req.body.scope_site || null,
      bia_assessment_id: req.body.bia_assessment_id || null,
      classification: req.body.classification || 'CONFIDENTIAL',
      status: 'DRAFT',
      version: '1.0',
      activation_criteria: JSON.stringify(req.body.activation_criteria || []),
      crisis_management_team: JSON.stringify(req.body.crisis_management_team || []),
      recovery_teams: JSON.stringify(req.body.recovery_teams || []),
      communication_plan: JSON.stringify(req.body.communication_plan || {}),
      recovery_procedures: JSON.stringify(req.body.recovery_procedures || []),
      required_resources: JSON.stringify(req.body.required_resources || []),
      critical_processes: JSON.stringify(req.body.critical_processes || []),
      critical_assets: JSON.stringify(req.body.critical_assets || []),
      testing_schedule: JSON.stringify(req.body.testing_schedule || []),
      created_by: req.user.id,
      last_updated_by: req.user.id,
    };
    
    await db('bcp_plans').insert(plan);
    const created = await db('bcp_plans').where('id', id).first();
    
    res.status(201).json({ data: created, message: 'BCP plan created successfully.' });
  } catch (err) {
    console.error('[BCP POST /] Error:', err);
    res.status(500).json({ error: 'Failed to create BCP plan.' });
  }
});

// ─── PUT /api/v1/bcp/:id — Update BCP plan ───────────────────────────────────
router.put('/:id', authenticate, authorize('MANAGE_BCP', 'BC_COORDINATOR'), auditLog, async (req, res) => {
  try {
    const plan = await db('bcp_plans').where('id', req.params.id).first();
    if (!plan) return res.status(404).json({ error: 'BCP plan not found.' });
    
    if (plan.status === 'APPROVED') {
      return res.status(403).json({ error: 'Approved plans cannot be edited. Create a new version instead.' });
    }
    
    const updates = {};
    const fields = [
      'title_ar', 'title_en', 'disruption_scenario', 'scenario_description_ar',
      'scenario_description_en', 'department_id', 'scope_type', 'scope_site',
      'bia_assessment_id', 'classification', 'next_review_date', 'expiry_date'
    ];
    
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    
    const jsonFields = [
      'activation_criteria', 'crisis_management_team', 'recovery_teams',
      'communication_plan', 'recovery_procedures', 'required_resources',
      'critical_processes', 'critical_assets', 'testing_schedule'
    ];
    
    jsonFields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = JSON.stringify(req.body[f]);
    });
    
    updates.last_updated_by = req.user.id;
    updates.updated_at = db.fn.now();
    
    await db('bcp_plans').where('id', req.params.id).update(updates);
    const updated = await db('bcp_plans').where('id', req.params.id).first();
    
    res.json({ data: updated, message: 'BCP plan updated successfully.' });
  } catch (err) {
    console.error('[BCP PUT /:id] Error:', err);
    res.status(500).json({ error: 'Failed to update BCP plan.' });
  }
});

// ─── PATCH /api/v1/bcp/:id/approve — Approve BCP plan ────────────────────────
router.patch('/:id/approve', authenticate, authorize('APPROVE_BCP', 'CISO', 'CEO'), auditLog, async (req, res) => {
  try {
    const plan = await db('bcp_plans').where('id', req.params.id).first();
    if (!plan) return res.status(404).json({ error: 'BCP plan not found.' });
    
    if (plan.status !== 'UNDER_REVIEW') {
      return res.status(400).json({ error: 'Only plans under review can be approved.' });
    }
    
    await db('bcp_plans').where('id', req.params.id).update({
      status: 'APPROVED',
      approved_by: req.user.id,
      approved_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
    
    const updated = await db('bcp_plans').where('id', req.params.id).first();
    res.json({ data: updated, message: 'BCP plan approved.' });
  } catch (err) {
    console.error('[BCP PATCH /:id/approve] Error:', err);
    res.status(500).json({ error: 'Failed to approve BCP plan.' });
  }
});

// ─── PATCH /api/v1/bcp/:id/submit — Submit BCP for review ────────────────────
router.patch('/:id/submit', authenticate, authorize('MANAGE_BCP', 'BC_COORDINATOR'), auditLog, async (req, res) => {
  try {
    const plan = await db('bcp_plans').where('id', req.params.id).first();
    if (!plan) return res.status(404).json({ error: 'BCP plan not found.' });
    
    if (plan.status !== 'DRAFT') {
      return res.status(400).json({ error: 'Only draft plans can be submitted for review.' });
    }
    
    await db('bcp_plans').where('id', req.params.id).update({
      status: 'UNDER_REVIEW',
      updated_at: db.fn.now(),
    });
    
    const updated = await db('bcp_plans').where('id', req.params.id).first();
    res.json({ data: updated, message: 'BCP plan submitted for review.' });
  } catch (err) {
    console.error('[BCP PATCH /:id/submit] Error:', err);
    res.status(500).json({ error: 'Failed to submit BCP plan.' });
  }
});

// ─── POST /api/v1/bcp/:id/activate — Activate BCP during incident ────────────
router.post('/:id/activate', authenticate, authorize('MANAGE_BCP', 'BC_COORDINATOR', 'CISO'), auditLog, async (req, res) => {
  try {
    const plan = await db('bcp_plans').where('id', req.params.id).first();
    if (!plan) return res.status(404).json({ error: 'BCP plan not found.' });
    
    if (plan.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Only approved plans can be activated.' });
    }
    
    const activation = {
      bcp_id: req.params.id,
      incident_id: req.body.incident_id || null,
      activated_by: req.user.id,
      activation_reason: req.body.reason || 'Manual activation',
      status: 'ACTIVE',
    };
    
    const [inserted] = await db('bcp_activations').insert(activation).returning('*');
    
    await db('bcp_plans').where('id', req.params.id).update({ status: 'ACTIVE', updated_at: db.fn.now() });
    
    res.status(201).json({ data: inserted, message: 'BCP plan activated.' });
  } catch (err) {
    console.error('[BCP POST /:id/activate] Error:', err);
    res.status(500).json({ error: 'Failed to activate BCP plan.' });
  }
});

// ─── GET /api/v1/bcp/:id/generate — Generate DOCX document ───────────────────
router.get('/:id/generate', authenticate, async (req, res) => {
  try {
    const plan = await db('bcp_plans')
      .leftJoin('departments', 'bcp_plans.department_id', 'departments.id')
      .leftJoin('users as creator', 'bcp_plans.created_by', 'creator.id')
      .leftJoin('users as approver', 'bcp_plans.approved_by', 'approver.id')
      .select(
        'bcp_plans.*',
        'departments.name_ar as department_name_ar',
        'departments.name_en as department_name_en',
        'creator.full_name as creator_name_ar',
        'approver.full_name as approver_name_ar'
      )
      .where('bcp_plans.id', req.params.id)
      .first();
    
    if (!plan) return res.status(404).json({ error: 'BCP plan not found.' });
    
    const docBuffer = await generateBCPDocument(plan);
    
    // Update last generated timestamp
    await db('bcp_plans').where('id', req.params.id).update({
      last_generated_at: db.fn.now(),
    });
    
    const filename = `BCP-${plan.id}-${Date.now()}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', docBuffer.length);
    res.send(docBuffer);
  } catch (err) {
    console.error('[BCP GET /:id/generate] Error:', err);
    res.status(500).json({ error: 'Failed to generate BCP document.' });
  }
});

// ─── GET /api/v1/bcp/:id/activations — Get activation history ────────────────
router.get('/:id/activations', authenticate, async (req, res) => {
  try {
    const activations = await db('bcp_activations')
      .where('bcp_id', req.params.id)
      .orderBy('activated_at', 'desc');
    
    res.json({ data: activations });
  } catch (err) {
    console.error('[BCP GET /:id/activations] Error:', err);
    res.status(500).json({ error: 'Failed to fetch activations.' });
  }
});

// ─── DELETE /api/v1/bcp/:id — Delete BCP plan ────────────────────────────────
router.delete('/:id', authenticate, authorize('MANAGE_BCP', 'BC_COORDINATOR'), auditLog, async (req, res) => {
  try {
    const plan = await db('bcp_plans').where('id', req.params.id).first();
    if (!plan) return res.status(404).json({ error: 'BCP plan not found.' });
    
    if (plan.status === 'ACTIVE') {
      return res.status(403).json({ error: 'Cannot delete an active BCP plan.' });
    }
    
    await db('bcp_plans').where('id', req.params.id).del();
    res.json({ message: 'BCP plan deleted.' });
  } catch (err) {
    console.error('[BCP DELETE /:id] Error:', err);
    res.status(500).json({ error: 'Failed to delete BCP plan.' });
  }
});

// ─── GET /api/v1/bcp/import/bia/:assessmentId — Import processes from BIA ────
router.get('/import/bia/:assessmentId', authenticate, async (req, res) => {
  try {
    const processes = await db('bia_processes')
      .where('assessment_id', req.params.assessmentId)
      .select('*')
      .orderBy('rto_hours', 'asc');
    
    const assets = await db('bia_assets')
      .where('assessment_id', req.params.assessmentId)
      .select('*');
    
    res.json({
      data: { processes, assets },
      message: `Found ${processes.length} processes and ${assets.length} assets.`
    });
  } catch (err) {
    console.error('[BCP GET /import/bia/:assessmentId] Error:', err);
    res.status(500).json({ error: 'Failed to import BIA data.' });
  }
});

module.exports = router;
