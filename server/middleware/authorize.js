/**
 * RBAC Authorization Middleware
 * Usage: authorize('MANAGE_RISKS', 'VIEW_BIA')
 * User must have at least ONE of the listed permissions.
 */
function authorize(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required before authorization.' });
    }

    // ADMIN role bypasses all permission checks
    if (req.user.role === 'ADMIN') return next();

    const userPerms = req.user.permissions || [];
    const hasPermission = requiredPermissions.some(p => userPerms.includes(p));

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions.',
        required: requiredPermissions,
        your_role: req.user.role,
      });
    }
    next();
  };
}

module.exports = authorize;
