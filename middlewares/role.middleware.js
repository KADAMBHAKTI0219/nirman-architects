/**
 * Role-Based Access Control Middleware
 * @param {Array<string>} allowedRoles 
 */
module.exports = function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userRole = (req.user.roleCode || req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole) && userRole !== 'SUPER_ADMIN' && userRole !== 'SUPERADMIN' && userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges.' });
    }

    next();
  };
};
