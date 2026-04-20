/**
 * ============================================================================
 *  Input Sanitization Middleware — Red Team Auto-Fix
 * ============================================================================
 *  Strips HTML/script tags from all string inputs in req.body to prevent
 *  Stored XSS attacks. Also enforces text length limits.
 *
 *  Addresses: Phase 2 XSS findings, Phase 3 huge-text crash vector.
 * ============================================================================
 */

const MAX_STRING_LENGTH = 5000;   // 5K chars per field
const MAX_TEXT_LENGTH   = 20000;  // 20K chars for text/description fields

/**
 * Strip HTML tags and dangerous patterns from a string.
 * Lightweight server-side sanitization — no external dependency needed.
 */
function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript: protocol
    .replace(/javascript\s*:/gi, '')
    // Remove on* event handlers
    .replace(/\bon\w+\s*=/gi, '')
    // Remove data: protocol (prevent data:text/html payloads)
    .replace(/data\s*:/gi, '')
    // Trim
    .trim();
}

/**
 * Recursively sanitize all string values in an object.
 */
function sanitizeObject(obj, maxLen = MAX_STRING_LENGTH) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => sanitizeObject(item, maxLen));

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      let clean = stripHtml(value);
      // Enforce length limit — longer fields like description/notes get more room
      const limit = ['description', 'notes', 'mitigation_plan', 'evidence_notes',
                      'strategy_description', 'justification', 'comments', 'details']
        .includes(key) ? MAX_TEXT_LENGTH : maxLen;
      if (clean.length > limit) {
        clean = clean.substring(0, limit);
      }
      sanitized[key] = clean;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, maxLen);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Express middleware: sanitize req.body on all requests.
 */
function sanitizeInputs(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

module.exports = sanitizeInputs;
module.exports.stripHtml = stripHtml;
module.exports.sanitizeObject = sanitizeObject;
module.exports.MAX_STRING_LENGTH = MAX_STRING_LENGTH;
module.exports.MAX_TEXT_LENGTH = MAX_TEXT_LENGTH;
