// middleware/role.js
module.exports = function permit(...allowedRoles) {
  // support either permit('teacher','admin') or permit(['teacher','admin'])
  const roles = allowedRoles.length === 1 && Array.isArray(allowedRoles[0])
    ? allowedRoles[0]
    : allowedRoles;

  return (req, res, next) => {
    const role = req.userRole;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
  };
};
