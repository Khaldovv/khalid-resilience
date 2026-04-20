const express = require('express');
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');

const router = express.Router();
router.use(authenticate);
router.use(auditLog);

// ── Helpers ────────────────────────────────────────────────────────────────────

let incidentCounter = 0;
async function nextIncidentId() {
  // Get max existing counter for this year
  const year = new Date().getFullYear();
  const prefix = `INC-${year}-`;
  const latest = await db('incidents')
    .where('id', 'like', `${prefix}%`)
    .orderBy('id', 'desc')
    .first()
    .select('id');

  if (latest) {
    const num = parseInt(latest.id.replace(prefix, ''));
    incidentCounter = Math.max(incidentCounter, num);
  }
  incidentCounter++;
  return `${prefix}${String(incidentCounter).padStart(4, '0')}`;
}

// Status → timestamp mapping
const STATUS_TIMESTAMPS = {
  INVESTIGATING: 'responded_at',
  CONTAINED: 'contained_at',
  RESOLVED: 'resolved_at',
  CLOSED: 'closed_at',
};

/**
 * @swagger
 * /incidents/dashboard:
 *   get:
 *     tags: [Incidents]
 *     summary: Incident management dashboard
 *     description: Returns open count, severity distribution, monthly trend, avg resolution time, and pending regulatory notifications
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
// ── Dashboard ──────────────────────────────────────────────────────────────────

router.get('/dashboard', authorize('VIEW_INCIDENTS'), async (req, res, next) => {
  try {
    const [openCount, bySeverity, thisMonth, avgResolution, pendingNotifications] = await Promise.all([
      db('incidents').whereNotIn('status', ['CLOSED', 'RESOLVED']).count('* as c').first(),
      db('incidents').whereNotIn('status', ['CLOSED']).select('severity').count('* as count').groupBy('severity'),
      db('incidents').where('created_at', '>=', db.raw("DATE_TRUNC('month', CURRENT_DATE)")).count('* as c').first(),
      db('incidents')
        .whereNotNull('resolved_at')
        .select(db.raw("AVG(EXTRACT(EPOCH FROM (resolved_at - detected_at))/3600) as avg_hours"))
        .first()
        .catch(() => ({ avg_hours: null })),
      db('incidents')
        .where('requires_regulatory_notification', true)
        .whereNull('notification_sent_at')
        .count('* as c').first().catch(() => ({ c: 0 })),
    ]);

    res.json({
      open_incidents: parseInt(openCount?.c || 0),
      by_severity: bySeverity,
      incidents_this_month: parseInt(thisMonth?.c || 0),
      avg_resolution_hours: avgResolution?.avg_hours ? Math.round(avgResolution.avg_hours * 10) / 10 : null,
      pending_regulatory_notifications: parseInt(pendingNotifications?.c || 0),
    });
  } catch (err) { next(err); }
});

// ── GET /incidents — List ──────────────────────────────────────────────────────

router.get('/', authorize('VIEW_INCIDENTS'), async (req, res, next) => {
  try {
    const { incident_type, severity, status, date_from, date_to, search,
            sort_by, sort_dir, page, per_page } = req.query;

    let query = db('incidents');

    if (incident_type) query = query.where('incident_type', incident_type);
    if (severity) query = query.where('severity', severity);
    if (status) query = query.where('status', status);
    if (date_from) query = query.where('detected_at', '>=', date_from);
    if (date_to) query = query.where('detected_at', '<=', date_to);
    if (search) query = query.where(function () {
      this.whereILike('title', `%${search}%`).orWhereILike('description', `%${search}%`);
    });

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limit = Math.min(100, parseInt(per_page) || 25);
    const offset = (pageNum - 1) * limit;

    const [countResult, incidents] = await Promise.all([
      db('incidents').count('* as total').first(),
      query.orderBy(sort_by || 'detected_at', sort_dir === 'asc' ? 'asc' : 'desc').limit(limit).offset(offset),
    ]);

    res.json({
      data: incidents,
      pagination: { page: pageNum, per_page: limit, total: parseInt(countResult?.total || 0) },
    });
  } catch (err) { next(err); }
});

// ── POST /incidents — Create ───────────────────────────────────────────────────

router.post('/', authorize('MANAGE_INCIDENTS'), async (req, res, next) => {
  try {
    const { title, description, incident_type, severity,
            affected_departments, affected_systems, estimated_financial_impact_sar,
            incident_commander_id, department_id, requires_regulatory_notification,
            regulatory_body, notification_deadline } = req.body;

    if (!title || !incident_type || !severity) {
      return res.status(400).json({ error: 'title, incident_type, and severity are required.' });
    }

    const id = await nextIncidentId();
    const [incident] = await db('incidents').insert({
      id, title, description, incident_type, severity,
      affected_departments: JSON.stringify(affected_departments || []),
      affected_systems: JSON.stringify(affected_systems || []),
      estimated_financial_impact_sar,
      incident_commander_id, department_id,
      requires_regulatory_notification: requires_regulatory_notification || false,
      regulatory_body, notification_deadline,
      created_by: req.user.id,
    }).returning('*');

    // Auto-create detection timeline event
    await db('incident_timeline').insert({
      incident_id: id,
      event_type: 'DETECTION',
      description: `Incident detected and logged: ${title}`,
      user_id: req.user.id,
    });

    res.status(201).json(incident);
  } catch (err) { next(err); }
});

// ── GET /incidents/:id — Detail with timeline ──────────────────────────────────

router.get('/:id', authorize('VIEW_INCIDENTS'), async (req, res, next) => {
  try {
    const incident = await db('incidents').where({ id: req.params.id }).first();
    if (!incident) return res.status(404).json({ error: 'Incident not found.' });

    const [timeline, riskLinks, review] = await Promise.all([
      db('incident_timeline').where({ incident_id: req.params.id }).orderBy('event_time', 'asc'),
      db('incident_risk_links').where({ incident_id: req.params.id }),
      db('post_incident_reviews').where({ incident_id: req.params.id }).first(),
    ]);

    res.json({ ...incident, timeline, risk_links: riskLinks, review });
  } catch (err) { next(err); }
});

// ── PATCH /incidents/:id — Update ──────────────────────────────────────────────

router.patch('/:id', authorize('MANAGE_INCIDENTS'), async (req, res, next) => {
  try {
    const incident = await db('incidents').where({ id: req.params.id }).first();
    if (!incident) return res.status(404).json({ error: 'Incident not found.' });

    const allowed = ['title', 'description', 'incident_type', 'severity',
      'affected_departments', 'affected_systems', 'estimated_financial_impact_sar',
      'data_records_affected', 'service_downtime_hours', 'incident_commander_id',
      'department_id', 'root_cause', 'lessons_learned',
      'requires_regulatory_notification', 'regulatory_body', 'notification_deadline',
      'notification_sent_at', 'triggered_bcp', 'bcp_plan_id'];

    const updates = {};
    for (const f of allowed) {
      if (req.body[f] !== undefined) {
        updates[f] = Array.isArray(req.body[f]) ? JSON.stringify(req.body[f]) : req.body[f];
      }
    }
    updates.updated_at = new Date();

    await db('incidents').where({ id: req.params.id }).update(updates);
    const updated = await db('incidents').where({ id: req.params.id }).first();
    res.json(updated);
  } catch (err) { next(err); }
});

// ── POST /incidents/:id/timeline — Add timeline event ──────────────────────────

router.post('/:id/timeline', authorize('MANAGE_INCIDENTS'), async (req, res, next) => {
  try {
    const { event_type, description, event_time, attachments } = req.body;
    if (!event_type || !description) {
      return res.status(400).json({ error: 'event_type and description are required.' });
    }

    const [event] = await db('incident_timeline').insert({
      incident_id: req.params.id,
      event_type,
      description,
      event_time: event_time || new Date(),
      user_id: req.user.id,
      attachments: JSON.stringify(attachments || []),
    }).returning('*');

    res.status(201).json(event);
  } catch (err) { next(err); }
});

// ── GET /incidents/:id/timeline — Get full timeline ────────────────────────────

router.get('/:id/timeline', authorize('VIEW_INCIDENTS'), async (req, res, next) => {
  try {
    const timeline = await db('incident_timeline')
      .where({ incident_id: req.params.id })
      .orderBy('event_time', 'asc');
    res.json({ data: timeline });
  } catch (err) { next(err); }
});

// ── POST /incidents/:id/link-risk — Link to risk ───────────────────────────────

router.post('/:id/link-risk', authorize('MANAGE_INCIDENTS'), async (req, res, next) => {
  try {
    const { risk_id, link_type } = req.body;
    if (!risk_id) return res.status(400).json({ error: 'risk_id is required.' });

    const [link] = await db('incident_risk_links').insert({
      incident_id: req.params.id,
      risk_id,
      link_type: link_type || 'MATERIALIZED',
    }).returning('*');

    res.status(201).json(link);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Link already exists.' });
    next(err);
  }
});

// ── PATCH /incidents/:id/status — Change status ────────────────────────────────

router.patch('/:id/status', authorize('MANAGE_INCIDENTS'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED', 'POST_REVIEW'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const updates = { status, updated_at: new Date() };
    // Auto-set timestamp for the status
    if (STATUS_TIMESTAMPS[status]) {
      updates[STATUS_TIMESTAMPS[status]] = new Date();
    }

    await db('incidents').where({ id: req.params.id }).update(updates);

    // Add timeline event for status change
    await db('incident_timeline').insert({
      incident_id: req.params.id,
      event_type: 'STATUS_CHANGE',
      description: `Status changed to ${status}`,
      user_id: req.user.id,
    });

    const updated = await db('incidents').where({ id: req.params.id }).first();
    res.json(updated);
  } catch (err) { next(err); }
});

// ── GET /incidents/:id/review — Get post-incident review ───────────────────────

router.get('/:id/review', authorize('VIEW_INCIDENTS'), async (req, res, next) => {
  try {
    const review = await db('post_incident_reviews').where({ incident_id: req.params.id }).first();
    if (!review) return res.status(404).json({ error: 'No review found for this incident.' });
    res.json(review);
  } catch (err) { next(err); }
});

// ── POST /incidents/:id/review — Create/update post-incident review ────────────

router.post('/:id/review', authorize('MANAGE_INCIDENTS'), async (req, res, next) => {
  try {
    const { what_happened, what_went_well, what_went_wrong, action_items,
            prevention_measures, bcp_update_required, risk_register_update_required,
            status, review_date } = req.body;

    const existing = await db('post_incident_reviews').where({ incident_id: req.params.id }).first();

    if (existing) {
      // Update existing review
      await db('post_incident_reviews').where({ id: existing.id }).update({
        what_happened, what_went_well, what_went_wrong,
        action_items: JSON.stringify(action_items || []),
        prevention_measures,
        bcp_update_required: bcp_update_required || false,
        risk_register_update_required: risk_register_update_required || false,
        status: status || existing.status,
        review_date: review_date || existing.review_date,
        updated_at: new Date(),
      });
      const updated = await db('post_incident_reviews').where({ id: existing.id }).first();
      return res.json(updated);
    }

    // Create new review
    const [review] = await db('post_incident_reviews').insert({
      incident_id: req.params.id,
      reviewer_id: req.user.id,
      review_date: review_date || new Date(),
      what_happened, what_went_well, what_went_wrong,
      action_items: JSON.stringify(action_items || []),
      prevention_measures,
      bcp_update_required: bcp_update_required || false,
      risk_register_update_required: risk_register_update_required || false,
      status: status || 'DRAFT',
    }).returning('*');

    res.status(201).json(review);
  } catch (err) { next(err); }
});

module.exports = router;
