/**
 * Middleware: Block Super Admin Desktop Tracking
 * Disables logging app usage metrics for Super Admin accounts.
 */
const { sendError } = require('../utils/response');

module.exports = function blockSuperAdminTracking(req, res, next) {
  const role = (req.user?.roleCode || req.user?.role || '').toUpperCase();
  
  if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || role === 'SUPER_ADMINISTRATOR') {
    return sendError(res, 403, 'App usage tracking is disabled for Super Admin users by system security policy.');
  }

  next();
};
