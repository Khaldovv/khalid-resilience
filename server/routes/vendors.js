const express = require('express');
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');

const router = express.Router();
router.use(authenticate);
router.use(auditLog);

// ── Helpers ────────────────────────────────────────────────────────────────────

function calcRiskTier(score) {
  if (score <= 2.0) return 'CRITICAL';
  if (score <= 3.0) return 'HIGH';
  if (score <= 4.0) return 'MEDIUM';
  return 'LOW';
}

function calcOverallScore(body) {
  const dims = [
    body.financial_stability_score,
    body.cybersecurity_score,
    body.compliance_score,
    body.operational_reliability_score,
    body.data_privacy_score,
    body.business_continuity_score,
  ].filter(v => v != null);
  if (dims.length === 0) return { overall_score: null, risk_tier: null };
  const avg = dims.reduce((s, v) => s + v, 0) / dims.length;
  return { overall_score: Math.round(avg * 10) / 10, risk_tier: calcRiskTier(avg) };
}

/**
 * @swagger
 * /vendors/dashboard:
 *   get:
 *     tags: [Vendors]
 *     summary: Vendor risk dashboard
 *     description: Returns total vendors, risk tier distribution, expiring contracts, and average risk score
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
// ── Dashboard ──────────────────────────────────────────────────────────────────

router.get('/dashboard', authorize('VIEW_VENDORS'), async (req, res, next) => {
  try {
    const [total, byTier, expiringCount, criticalCount, avgScore] = await Promise.all([
      db('vendors').count('* as c').first(),
      db('vendor_assessments as va')
        .select('va.risk_tier')
        .count('* as count')
        .whereIn('va.id', db('vendor_assessments').select(db.raw('DISTINCT ON (vendor_id) id')).orderBy('vendor_id').orderBy('created_at', 'desc'))
        .groupBy('va.risk_tier')
        .catch(() => []),
      db('vendors').where('contract_end', '<=', db.raw("CURRENT_DATE + INTERVAL '30 days'")).where('contract_end', '>=', db.raw('CURRENT_DATE')).count('* as c').first().catch(() => ({ c: 0 })),
      db('vendors').where('is_critical', true).count('* as c').first(),
      db('vendor_assessments').avg('overall_score as avg').first().catch(() => ({ avg: null })),
    ]);

    res.json({
      total_vendors: parseInt(total?.c || 0),
      by_tier: byTier,
      expiring_contracts_30d: parseInt(expiringCount?.c || 0),
      critical_vendors: parseInt(criticalCount?.c || 0),
      average_risk_score: avgScore?.avg ? Math.round(avgScore.avg * 10) / 10 : null,
    });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /vendors/expiring:
 *   get:
 *     tags: [Vendors]
 *     summary: List vendors with expiring contracts
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Vendors with contracts expiring within N days
 */
// ── Expiring Contracts ─────────────────────────────────────────────────────────

router.get('/expiring', authorize('VIEW_VENDORS'), async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const vendors = await db('vendors')
      .where('contract_end', '<=', db.raw(`CURRENT_DATE + INTERVAL '${days} days'`))
      .where('contract_end', '>=', db.raw('CURRENT_DATE'))
      .where('status', '!=', 'TERMINATED')
      .orderBy('contract_end', 'asc');

    res.json({ data: vendors, days });
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /vendors:
 *   get:
 *     tags: [Vendors]
 *     summary: List vendors with filters and pagination
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, UNDER_REVIEW, SUSPENDED, TERMINATED] }
 *       - in: query
 *         name: risk_tier
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, CRITICAL] }
 *     responses:
 *       200:
 *         description: Paginated vendor list
 */
// ── GET /vendors — List vendors ────────────────────────────────────────────────

router.get('/', authorize('VIEW_VENDORS'), async (req, res, next) => {
  try {
    const { category, status, risk_tier, search, sort_by, sort_dir, page, per_page } = req.query;
    let query = db('vendors');

    if (category) query = query.where('category', category);
    if (status) query = query.where('status', status);
    if (search) query = query.where(function () {
      this.whereILike('vendor_name', `%${search}%`).orWhereILike('contact_name', `%${search}%`);
    });

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limit = Math.min(100, parseInt(per_page) || 25);
    const offset = (pageNum - 1) * limit;

    const [countResult, vendors] = await Promise.all([
      db('vendors').count('* as total').first(),
      query.orderBy(sort_by || 'created_at', sort_dir === 'asc' ? 'asc' : 'desc').limit(limit).offset(offset),
    ]);

    // Attach latest assessment risk tier to each vendor
    const vendorIds = vendors.map(v => v.id);
    const latestAssessments = vendorIds.length > 0
      ? await db('vendor_assessments')
          .whereIn('vendor_id', vendorIds)
          .orderBy('created_at', 'desc')
          .select('vendor_id', 'overall_score', 'risk_tier')
      : [];

    const assessmentMap = {};
    latestAssessments.forEach(a => {
      if (!assessmentMap[a.vendor_id]) assessmentMap[a.vendor_id] = a;
    });

    const data = vendors.map(v => ({
      ...v,
      latest_risk_tier: assessmentMap[v.id]?.risk_tier || null,
      latest_overall_score: assessmentMap[v.id]?.overall_score || null,
    }));

    // Filter by risk_tier if requested (post-query filter)
    const filtered = risk_tier ? data.filter(v => v.latest_risk_tier === risk_tier) : data;

    res.json({
      data: filtered,
      pagination: { page: pageNum, per_page: limit, total: parseInt(countResult?.total || 0) },
    });
  } catch (err) { next(err); }
});

// ── POST /vendors — Create vendor ──────────────────────────────────────────────

router.post('/', authorize('MANAGE_VENDORS'), async (req, res, next) => {
  try {
    const { vendor_name, vendor_name_ar, registration_number, category, country,
            contact_name, contact_email, contact_phone, website,
            contract_start, contract_end, contract_value_sar,
            data_access_level, hosts_data_offshore, is_critical,
            department_id } = req.body;

    if (!vendor_name || !category) {
      return res.status(400).json({ error: 'vendor_name and category are required.' });
    }

    const [vendor] = await db('vendors').insert({
      vendor_name, vendor_name_ar, registration_number, category,
      country: country || 'Saudi Arabia',
      contact_name, contact_email, contact_phone, website,
      contract_start, contract_end, contract_value_sar,
      data_access_level: data_access_level || 'NONE',
      hosts_data_offshore: hosts_data_offshore || false,
      is_critical: is_critical || false,
      department_id, created_by: req.user.id,
    }).returning('*');

    res.status(201).json(vendor);
  } catch (err) { next(err); }
});

// ── GET /vendors/:id — Vendor detail with assessments ──────────────────────────

router.get('/:id', authorize('VIEW_VENDORS'), async (req, res, next) => {
  try {
    const vendor = await db('vendors').where({ id: req.params.id }).first();
    if (!vendor) return res.status(404).json({ error: 'Vendor not found.' });

    const [assessments, biaLinks, riskLinks] = await Promise.all([
      db('vendor_assessments').where({ vendor_id: req.params.id }).orderBy('created_at', 'desc'),
      db('vendor_bia_links').where({ vendor_id: req.params.id }),
      db('vendor_risk_links').where({ vendor_id: req.params.id }),
    ]);

    res.json({ ...vendor, assessments, bia_links: biaLinks, risk_links: riskLinks });
  } catch (err) { next(err); }
});

// ── PATCH /vendors/:id — Update vendor ─────────────────────────────────────────

router.patch('/:id', authorize('MANAGE_VENDORS'), async (req, res, next) => {
  try {
    const vendor = await db('vendors').where({ id: req.params.id }).first();
    if (!vendor) return res.status(404).json({ error: 'Vendor not found.' });

    const allowed = ['vendor_name', 'vendor_name_ar', 'registration_number', 'category',
      'country', 'contact_name', 'contact_email', 'contact_phone', 'website',
      'contract_start', 'contract_end', 'contract_value_sar',
      'data_access_level', 'hosts_data_offshore', 'is_critical', 'status', 'department_id'];

    const updates = {};
    for (const f of allowed) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    updates.updated_at = new Date();

    await db('vendors').where({ id: req.params.id }).update(updates);
    const updated = await db('vendors').where({ id: req.params.id }).first();
    res.json(updated);
  } catch (err) { next(err); }
});

// ── DELETE /vendors/:id — Terminate vendor ─────────────────────────────────────

router.delete('/:id', authorize('MANAGE_VENDORS'), async (req, res, next) => {
  try {
    const vendor = await db('vendors').where({ id: req.params.id }).first();
    if (!vendor) return res.status(404).json({ error: 'Vendor not found.' });

    await db('vendors').where({ id: req.params.id }).update({ status: 'TERMINATED', updated_at: new Date() });
    res.json({ message: 'Vendor terminated.', id: req.params.id });
  } catch (err) { next(err); }
});

// ── POST /vendors/:id/assessments — Add risk assessment ────────────────────────

router.post('/:id/assessments', authorize('MANAGE_VENDORS'), async (req, res, next) => {
  try {
    const vendor = await db('vendors').where({ id: req.params.id }).first();
    if (!vendor) return res.status(404).json({ error: 'Vendor not found.' });

    const computed = calcOverallScore(req.body);
    const [assessment] = await db('vendor_assessments').insert({
      vendor_id: req.params.id,
      assessor_id: req.user.id,
      financial_stability_score: req.body.financial_stability_score,
      cybersecurity_score: req.body.cybersecurity_score,
      compliance_score: req.body.compliance_score,
      operational_reliability_score: req.body.operational_reliability_score,
      data_privacy_score: req.body.data_privacy_score,
      business_continuity_score: req.body.business_continuity_score,
      overall_score: computed.overall_score,
      risk_tier: computed.risk_tier,
      notes: req.body.notes,
      attachments: JSON.stringify(req.body.attachments || []),
      next_review_date: req.body.next_review_date,
    }).returning('*');

    res.status(201).json(assessment);
  } catch (err) { next(err); }
});

// ── GET /vendors/:id/assessments — Assessment history ──────────────────────────

router.get('/:id/assessments', authorize('VIEW_VENDORS'), async (req, res, next) => {
  try {
    const assessments = await db('vendor_assessments')
      .where({ vendor_id: req.params.id })
      .orderBy('created_at', 'desc');
    res.json({ data: assessments });
  } catch (err) { next(err); }
});

// ── POST /vendors/:id/link-bia — Link to BIA dependency ───────────────────────

router.post('/:id/link-bia', authorize('MANAGE_VENDORS'), async (req, res, next) => {
  try {
    const { dependency_id, notes } = req.body;
    if (!dependency_id) return res.status(400).json({ error: 'dependency_id is required.' });

    const [link] = await db('vendor_bia_links').insert({
      vendor_id: req.params.id,
      dependency_id,
      notes,
    }).returning('*');

    res.status(201).json(link);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Link already exists.' });
    next(err);
  }
});

// ── POST /vendors/:id/link-risk — Link to risk ────────────────────────────────

router.post('/:id/link-risk', authorize('MANAGE_VENDORS'), async (req, res, next) => {
  try {
    const { risk_id, link_type } = req.body;
    if (!risk_id) return res.status(400).json({ error: 'risk_id is required.' });

    const [link] = await db('vendor_risk_links').insert({
      vendor_id: req.params.id,
      risk_id,
      link_type: link_type || 'ASSOCIATED',
    }).returning('*');

    res.status(201).json(link);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Link already exists.' });
    next(err);
  }
});

module.exports = router;
