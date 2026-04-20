const db = require('../config/database');

/**
 * Immutable Audit Log Middleware
 * Automatically logs every mutating request (POST/PUT/PATCH/DELETE)
 * to the audit_log table. INSERT only — no updates or deletes allowed.
 */
function auditLog(req, res, next) {
  // Only log mutating operations
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Capture the original res.json to intercept the response
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Log after successful response
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const entry = {
        user_id: req.user.id,
        action: `${req.method} ${req.originalUrl}`,
        entity_type: extractEntityType(req.originalUrl),
        entity_id: body?.id || body?.data?.id || req.params?.id || null,
        details: JSON.stringify({
          method: req.method,
          path: req.originalUrl,
          body: sanitizeBody(req.body),
          response_status: res.statusCode,
        }),
        ip_address: req.ip || req.connection?.remoteAddress,
        user_agent: req.headers['user-agent'] || null,
      };

      // Fire-and-forget insert (non-blocking)
      db('audit_log').insert(entry).catch(err => {
        console.error('[AUDIT LOG ERROR]', err.message);
      });
    }
    return originalJson(body);
  };

  next();
}

/** Extract entity type from URL path, e.g. /api/v1/risks/RSK-001 → risks */
function extractEntityType(url) {
  const parts = url.replace('/api/v1/', '').split('/');
  return parts[0] || 'unknown';
}

/** Remove sensitive fields from the logged body */
function sanitizeBody(body) {
  if (!body) return null;
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.password_hash;
  delete sanitized.token;
  return sanitized;
}

module.exports = auditLog;
