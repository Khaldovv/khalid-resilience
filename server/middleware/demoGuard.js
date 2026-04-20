/**
 * Demo Guard Middleware
 * Prevents destructive actions for demo users (isDemo flag in JWT).
 * Demo users can create/update but cannot delete critical data.
 */
module.exports = function demoGuard(req, res, next) {
  if (!req.user?.isDemo) return next();

  // Block all DELETE requests for demo users
  if (req.method === 'DELETE') {
    return res.status(403).json({
      error: 'هذا الإجراء غير متاح في الوضع التجريبي',
      error_en: 'This action is not available in demo mode',
    });
  }

  // Block admin routes
  if (req.path.startsWith('/admin')) {
    return res.status(403).json({
      error: 'صفحة الإدارة غير متاحة في الوضع التجريبي',
      error_en: 'Admin panel is not available in demo mode',
    });
  }

  // Block password changes
  if (req.path.includes('/change-password') || req.path.includes('/mfa/')) {
    return res.status(403).json({
      error: 'تغيير إعدادات الأمان غير متاح في الوضع التجريبي',
      error_en: 'Security settings cannot be changed in demo mode',
    });
  }

  next();
};
