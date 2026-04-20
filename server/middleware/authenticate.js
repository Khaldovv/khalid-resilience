const jwt = require('jsonwebtoken');
const { secret } = require('../config/auth');

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token and injects req.user
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Provide a valid Bearer token.' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      department_id: decoded.department_id,
      full_name: decoded.full_name,
      permissions: decoded.permissions || [],
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

module.exports = authenticate;
