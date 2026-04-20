const express = require('express');
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');

const router = express.Router();
router.use(authenticate);
router.use(auditLog);

// ── GET /bodies — List regulatory bodies ───────────────────────────────────────

router.get('/bodies', authorize('VIEW_REGULATORY'), async (req, res, next) => {
  try {
    const bodies = await db('regulatory_bodies').where('is_active', true).orderBy('id');
    res.json({ data: bodies });
  } catch (err) { next(err); }
});

// ── Dashboard ──────────────────────────────────────────────────────────────────

router.get('/dashboard', authorize('VIEW_REGULATORY'), async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const [totalUpdates, overdueActions, pendingReview, complianceRate, byBody] = await Promise.all([
      db('regulatory_updates')
        .where(db.raw("EXTRACT(YEAR FROM created_at)"), currentYear)
        .count('* as c').first(),
      db('regulatory_action_items')
        .where('status', '!=', 'COMPLETED')
        .where('deadline', '<', db.raw('CURRENT_DATE'))
        .count('* as c').first(),
      db('regulatory_updates')
        .where('status', 'NEW')
        .count('* as c').first(),
      db('regulatory_updates')
        .where('status', 'COMPLIANT')
        .count('* as c').first(),
      db('regulatory_updates')
        .select('regulatory_body_id')
        .count('* as count')
        .groupBy('regulatory_body_id'),
    ]);

    const totalCount = parseInt(totalUpdates?.c || 0);
    const compliantCount = parseInt(complianceRate?.c || 0);

    res.json({
      total_updates_this_year: totalCount,
      overdue_action_items: parseInt(overdueActions?.c || 0),
      pending_review: parseInt(pendingReview?.c || 0),
      compliance_rate_pct: totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 100,
      by_regulatory_body: byBody,
    });
  } catch (err) { next(err); }
});

// ── Calendar — Upcoming deadlines ──────────────────────────────────────────────

router.get('/calendar', authorize('VIEW_REGULATORY'), async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const deadlines = await db('regulatory_updates')
      .whereNotNull('compliance_deadline')
      .where('compliance_deadline', '>=', db.raw('CURRENT_DATE'))
      .where('compliance_deadline', '<=', db.raw(`CURRENT_DATE + INTERVAL '${days} days'`))
      .where('status', '!=', 'ARCHIVED')
      .leftJoin('regulatory_bodies', 'regulatory_updates.regulatory_body_id', 'regulatory_bodies.id')
      .select(
        'regulatory_updates.*',
        'regulatory_bodies.name_en as body_name_en',
        'regulatory_bodies.name_ar as body_name_ar'
      )
      .orderBy('compliance_deadline', 'asc');

    // Also get action item deadlines
    const actionDeadlines = await db('regulatory_action_items')
      .whereNotNull('deadline')
      .where('deadline', '>=', db.raw('CURRENT_DATE'))
      .where('deadline', '<=', db.raw(`CURRENT_DATE + INTERVAL '${days} days'`))
      .where('status', '!=', 'COMPLETED')
      .orderBy('deadline', 'asc');

    res.json({ compliance_deadlines: deadlines, action_deadlines: actionDeadlines });
  } catch (err) { next(err); }
});

// ── GET /updates — List regulatory updates ─────────────────────────────────────

router.get('/updates', authorize('VIEW_REGULATORY'), async (req, res, next) => {
  try {
    const { regulatory_body_id, severity, status, update_type, date_from, date_to,
            search, sort_by, sort_dir, page, per_page } = req.query;

    let query = db('regulatory_updates')
      .leftJoin('regulatory_bodies', 'regulatory_updates.regulatory_body_id', 'regulatory_bodies.id')
      .select(
        'regulatory_updates.*',
        'regulatory_bodies.name_en as body_name_en',
        'regulatory_bodies.name_ar as body_name_ar'
      );

    if (regulatory_body_id) query = query.where('regulatory_updates.regulatory_body_id', regulatory_body_id);
    if (severity) query = query.where('regulatory_updates.severity', severity);
    if (status) query = query.where('regulatory_updates.status', status);
    if (update_type) query = query.where('regulatory_updates.update_type', update_type);
    if (date_from) query = query.where('regulatory_updates.created_at', '>=', date_from);
    if (date_to) query = query.where('regulatory_updates.created_at', '<=', date_to);
    if (search) query = query.where(function () {
      this.whereILike('regulatory_updates.title', `%${search}%`)
        .orWhereILike('regulatory_updates.description', `%${search}%`);
    });

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limit = Math.min(100, parseInt(per_page) || 25);
    const offset = (pageNum - 1) * limit;

    const [countResult, updates] = await Promise.all([
      db('regulatory_updates').count('* as total').first(),
      query.orderBy(sort_by ? `regulatory_updates.${sort_by}` : 'regulatory_updates.created_at', sort_dir === 'asc' ? 'asc' : 'desc')
        .limit(limit).offset(offset),
    ]);

    res.json({
      data: updates,
      pagination: { page: pageNum, per_page: limit, total: parseInt(countResult?.total || 0) },
    });
  } catch (err) { next(err); }
});

// ── POST /updates — Create update manually ─────────────────────────────────────

router.post('/updates', authorize('MANAGE_REGULATORY'), async (req, res, next) => {
  try {
    const { regulatory_body_id, title, title_ar, description, description_ar,
            update_type, severity, effective_date, compliance_deadline,
            source_url, document_reference, affected_frameworks, affected_modules,
            impact_summary, impact_summary_ar, assigned_to } = req.body;

    if (!title || !update_type || !severity) {
      return res.status(400).json({ error: 'title, update_type, and severity are required.' });
    }

    const [update] = await db('regulatory_updates').insert({
      regulatory_body_id, title, title_ar, description, description_ar,
      update_type, severity, effective_date, compliance_deadline,
      source_url, document_reference,
      affected_frameworks: JSON.stringify(affected_frameworks || []),
      affected_modules: JSON.stringify(affected_modules || []),
      impact_summary, impact_summary_ar,
      assigned_to, created_by: req.user.id,
    }).returning('*');

    res.status(201).json(update);
  } catch (err) { next(err); }
});

// ── GET /updates/:id — Update detail with action items ─────────────────────────

router.get('/updates/:id', authorize('VIEW_REGULATORY'), async (req, res, next) => {
  try {
    const update = await db('regulatory_updates')
      .leftJoin('regulatory_bodies', 'regulatory_updates.regulatory_body_id', 'regulatory_bodies.id')
      .select(
        'regulatory_updates.*',
        'regulatory_bodies.name_en as body_name_en',
        'regulatory_bodies.name_ar as body_name_ar',
        'regulatory_bodies.website_url as body_website'
      )
      .where('regulatory_updates.id', req.params.id)
      .first();

    if (!update) return res.status(404).json({ error: 'Regulatory update not found.' });

    const actionItems = await db('regulatory_action_items')
      .where({ regulatory_update_id: req.params.id })
      .orderBy('deadline', 'asc');

    res.json({ ...update, action_items: actionItems });
  } catch (err) { next(err); }
});

// ── PATCH /updates/:id — Edit update ───────────────────────────────────────────

router.patch('/updates/:id', authorize('MANAGE_REGULATORY'), async (req, res, next) => {
  try {
    const existing = await db('regulatory_updates').where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ error: 'Regulatory update not found.' });

    const allowed = ['title', 'title_ar', 'description', 'description_ar',
      'update_type', 'severity', 'effective_date', 'compliance_deadline',
      'source_url', 'document_reference', 'affected_frameworks', 'affected_modules',
      'impact_summary', 'impact_summary_ar', 'status', 'assigned_to', 'reviewed_by', 'reviewed_at'];

    const updates = {};
    for (const f of allowed) {
      if (req.body[f] !== undefined) {
        updates[f] = Array.isArray(req.body[f]) ? JSON.stringify(req.body[f]) : req.body[f];
      }
    }
    updates.updated_at = new Date();

    await db('regulatory_updates').where({ id: req.params.id }).update(updates);
    const updated = await db('regulatory_updates').where({ id: req.params.id }).first();
    res.json(updated);
  } catch (err) { next(err); }
});

// ── POST /updates/:id/actions — Add action item ────────────────────────────────

router.post('/updates/:id/actions', authorize('MANAGE_REGULATORY'), async (req, res, next) => {
  try {
    const { description, description_ar, owner_id, deadline } = req.body;
    if (!description) return res.status(400).json({ error: 'description is required.' });

    const [item] = await db('regulatory_action_items').insert({
      regulatory_update_id: req.params.id,
      description, description_ar, owner_id, deadline,
    }).returning('*');

    res.status(201).json(item);
  } catch (err) { next(err); }
});

// ── PATCH /actions/:id — Update action item status ─────────────────────────────

router.patch('/actions/:id', authorize('MANAGE_REGULATORY'), async (req, res, next) => {
  try {
    const existing = await db('regulatory_action_items').where({ id: req.params.id }).first();
    if (!existing) return res.status(404).json({ error: 'Action item not found.' });

    const allowed = ['description', 'description_ar', 'owner_id', 'deadline', 'status', 'completion_date', 'evidence_notes'];
    const updates = {};
    for (const f of allowed) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    if (updates.status === 'COMPLETED' && !updates.completion_date) {
      updates.completion_date = new Date().toISOString().slice(0, 10);
    }
    updates.updated_at = new Date();

    await db('regulatory_action_items').where({ id: req.params.id }).update(updates);
    const updated = await db('regulatory_action_items').where({ id: req.params.id }).first();
    res.json(updated);
  } catch (err) { next(err); }
});

module.exports = router;
