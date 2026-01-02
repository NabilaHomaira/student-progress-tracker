// middleware/auth.js
const jwt = require('jsonwebtoken');
const { __tokenBlacklist } = require('../controllers/authController');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Check blacklist
    if (__tokenBlacklist.has(token)) {
      return res.status(401).json({ message: 'Token is invalid (logged out)' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // attach to request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    return next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
