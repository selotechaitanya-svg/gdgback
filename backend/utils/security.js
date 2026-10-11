const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Generate a cryptographically secure 6-digit random OTP
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash an OTP using HMAC-SHA256 bound to normalized email and server secret.
 * Plaintext OTP is NEVER stored in the database.
 */
const hashOtp = (email, otp) => {
  const secret = process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || 'gdg_otp_secure_hmac_secret_2026';
  const normalized = email.toLowerCase().trim();
  const cleanOtp = otp.toString().trim();
  return crypto.createHmac('sha256', secret).update(`${normalized}:${cleanOtp}`).digest('hex');
};

/**
 * Generate a cryptographically secure random refresh token string
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Hash a refresh token using SHA-256 for safe database storage
 */
const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
};

/**
 * Generate a short-lived access JWT (15 minutes default)
 */
const generateAccessToken = (user) => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'gdg_access_jwt_secret_2026';
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    secret,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
      subject: user._id.toString(),
      issuer: 'gdg-rbu-eventhub',
      audience: 'gdg-rbu-client',
    }
  );
};

/**
 * Parse and normalize the ADMIN_EMAILS environment variable allowlist
 */
const getAdminEmails = () => {
  const raw =
    process.env.ADMIN_EMAILS ||
    'admin@gdgrbu.app,chaitanya@gdgrbu.app,selotechaitanya09@gmail.com';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
};

/**
 * Check if an email address is explicitly authorized in the server ADMIN_EMAILS allowlist.
 * If ADMIN_EMAILS is not configured or empty, administrative access fails closed (returns false).
 */
const isAuthorizedAdminEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return false; // Fails closed!
  }
  return adminEmails.includes(email.toLowerCase().trim());
};

module.exports = {
  generateOtp,
  hashOtp,
  generateRefreshToken,
  hashRefreshToken,
  generateAccessToken,
  getAdminEmails,
  isAuthorizedAdminEmail,
};
