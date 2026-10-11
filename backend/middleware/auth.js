const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAuthorizedAdminEmail } = require('../utils/security');

/**
 * Protect routes — verify JWT access token
 * Checks httpOnly cookies first ('gdg_access_token' or 'gdg_token'),
 * then falls back to Authorization Bearer header.
 */
const protect = async (req, res, next) => {
  let token = null;

  // 1. Check httpOnly cookies
  if (req.cookies) {
    if (req.cookies.gdg_access_token) {
      token = req.cookies.gdg_access_token;
    } else if (req.cookies.gdg_token) {
      token = req.cookies.gdg_token;
    }
  }

  // 2. Fallback to Authorization: Bearer <token>
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No session or access token provided.',
    });
  }

  try {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'gdg_access_jwt_secret_2026';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id || decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user account associated with this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Access token has expired. Please refresh your session.',
      });
    }
    return res.status(401).json({
      success: false,
      code: 'TOKEN_INVALID',
      message: 'Invalid access token. Authentication failed.',
    });
  }
};

/**
 * Admin authorization middleware
 * Enforces server-side ADMIN_EMAILS allowlist check.
 * Entering an email address alone or claiming admin via frontend is strictly rejected.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required before accessing administrative endpoints.',
    });
  }

  const authorized = isAuthorizedAdminEmail(req.user.email) || req.user.role === 'admin';

  if (!authorized) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Your authenticated account is not authorized as an administrator.',
    });
  }

  next();
};

module.exports = {
  protect,
  requireAdmin,
  admin: requireAdmin, // Backward compatibility alias
};
