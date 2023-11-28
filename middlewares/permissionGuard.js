const permissionGuard = (roles, permission) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          errors: [{ 'msg': 'invalid access' }]
        });
      }
      if (req.user.role === "admin" && !req.user.rule?.permissions?.includes(permission)) {
        return res.status(403).json({
          success: false,
          errors: [{ 'msg': 'invalid access' }]
        });
      }
      next();
    } catch (e) {
      return res.status(403).json({
        success: false,
        errors: [{ 'msg': 'invalid access' }]
      });
    }
  }
}

module.exports = permissionGuard;