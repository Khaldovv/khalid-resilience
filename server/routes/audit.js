const express = require('express');
const db = require('../config/database');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(authenticate);

// ── GET /audit — Query audit log ───────────────────────────────────────────────
router.get('/', authorize('VIEW_REPORTS'), async (req, res, next) => {
  try {
    const { entity_type, entity_id, user_id, from, to, page, per_page } = req.query;

    let query = db('audit_log')
      .leftJoin('users', 'audit_log.user_id', 'users.id')
      .select('audit_log.*', 'users.full_name_en as user_name', 'users.email as user_email');

    if (entity_type) query = query.where('audit_log.entity_type', entity_type);
    if (entity_id) query = query.where('audit_log.entity_id', entity_id);
    if (user_id) query = query.where('audit_log.user_id', user_id);
    if (from) query = query.where('audit_log.created_at', '>=', new Date(from));
    if (to) query = query.where('audit_log.created_at', '<=', new Date(to));

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limit = Math.min(100, parseInt(per_page) || 50);
    const offset = (pageNum - 1) * limit;

    const [countResult, rows] = await Promise.all([
      db('audit_log').count('* as total').first(),
      query.orderBy('audit_log.created_at', 'desc').limit(limit).offset(offset),
    ]);

    res.json({
      data: rows,
      pagination: { page: pageNum, per_page: limit, total: parseInt(countResult.total) },
    });
  } catch (err) { next(err); }
});

module.exports = router;
