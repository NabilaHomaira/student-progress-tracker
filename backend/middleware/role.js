// middleware/role.js
module.exports = function permit(...allowedRoles) {
  return (req, res, next) => {
    const role = req.userRole;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};
