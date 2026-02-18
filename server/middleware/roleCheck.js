const TEACHER_EMAIL = 'kiruthick3238q@gmail.com';

const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions' });
    }

    // Extra safety: only the preconfigured teacher account can use teacher routes
    if (req.user.role === 'teacher' && req.user.email !== TEACHER_EMAIL) {
      return res.status(403).json({ message: 'Access denied. Only the configured teacher account can access this resource' });
    }

    next();
  };
};

const isTeacher = roleCheck(['teacher']);
const isStudent = roleCheck(['student']);

module.exports = { roleCheck, isTeacher, isStudent };
