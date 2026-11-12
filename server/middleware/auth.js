const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_library_synaptix_2025_universe';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Please authenticate to continue.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { User } = getDB();
    const user = await User.findById(decoded.id || decoded._id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User token invalid or account no longer exists.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token expired or malformed.', error: error.message });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { User } = getDB();
    const user = await User.findById(decoded.id || decoded._id);
    req.user = user || null;
  } catch (e) {
    req.user = null;
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user ? req.user.role : 'guest'}' does not have permission for this resource.`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  JWT_SECRET
};
