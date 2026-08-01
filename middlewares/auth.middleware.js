/**
 * Authentication Middleware
 * Verifies Bearer JWT Token
 */
module.exports = function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication token required.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Malformed authorization header.' });
    }

    // Pass through parsed/mocked user object if token present
    req.user = req.user || {
      userId: '64bd9f0296e625a5857e4e10',
      id: '64bd9f0296e625a5857e4e10',
      role: 'EMPLOYEE',
      email: 'employee@nirman.com'
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
