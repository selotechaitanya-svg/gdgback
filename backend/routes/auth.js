const express = require('express');
const User = require('../models/User');
const Otp = require('../models/Otp');
const Session = require('../models/Session');
const { protect } = require('../middleware/auth');
const { sendOtpEmail } = require('../services/emailService');
const {
  generateOtp,
  hashOtp,
  generateRefreshToken,
  hashRefreshToken,
  generateAccessToken,
  isAuthorizedAdminEmail,
} = require('../utils/security');

const router = express.Router();

/**
 * Cookie configuration helper
 */
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const baseCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };

  // 15-minute Access Token Cookie (both names for complete compatibility)
  res.cookie('gdg_access_token', accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('gdg_token', accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // 7-day Refresh Token Cookie
  if (refreshToken) {
    res.cookie('gdg_refresh_token', refreshToken, {
      ...baseCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
};

/**
 * Clear authentication cookies
 */
const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
    path: '/',
  };

  res.cookie('gdg_access_token', '', clearOptions);
  res.cookie('gdg_token', '', clearOptions);
  res.cookie('gdg_refresh_token', '', clearOptions);
};

/**
 * Format safe user payload
 */
const formatSafeUser = (user) => {
  const isAdmin = isAuthorizedAdminEmail(user.email) || user.role === 'admin';
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: isAdmin ? 'admin' : user.role || 'user',
    isAdmin,
    avatar: user.avatar || '',
    authProvider: user.authProvider || 'otp',
    emailVerified: user.emailVerified ?? true,
    createdAt: user.createdAt,
  };
};

// ============================================================================
// OTP AUTHENTICATION FLOW
// ============================================================================

/**
 * Handler to request a 6-digit email OTP
 * Validates email, enforces rate limits and resend cooldowns,
 * hashes the OTP with HMAC-SHA256, and sends via Resend/SMTP.
 */
const handleRequestOtp = async (req, res) => {
  try {
    const { email, type = 'login' } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    const cleanEmail = email.toLowerCase().trim();

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format.',
      });
    }

    // If requesting OTP for 'login', check if account exists in database
    if (type === 'login') {
      const existingUser = await User.findOne({ email: cleanEmail });
      const isServerAdmin = isAuthorizedAdminEmail(cleanEmail);
      if (!existingUser && !isServerAdmin) {
        return res.status(404).json({
          success: false,
          notFound: true,
          message: 'No account found with this email. Please sign up to create your account.',
        });
      }
    }

    // Enforce 60-second cooldown between OTP requests for the same email
    const existingRecentChallenge = await Otp.findOne({
      email: cleanEmail,
      isUsed: false,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });

    if (existingRecentChallenge) {
      const waitSeconds = Math.ceil(
        (60 * 1000 - (Date.now() - new Date(existingRecentChallenge.createdAt).getTime())) / 1000
      );
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting a new verification code.`,
        retryAfter: waitSeconds,
      });
    }

    // Invalidate/supersede any previous unverified challenges for this email
    await Otp.updateMany(
      { email: cleanEmail, isUsed: false },
      { $set: { isUsed: true } }
    );

    // Generate cryptographically secure random 6-digit OTP
    const rawOtp = generateOtp();

    // Securely hash OTP before storing (Plaintext OTP NEVER stored in DB)
    const otpHash = hashOtp(cleanEmail, rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store hashed challenge in database
    await Otp.create({
      email: cleanEmail,
      otpHash,
      attempts: 0,
      isUsed: false,
      expiresAt,
      createdAt: new Date(),
    });

    // Send verification email via configured delivery provider (Resend / SMTP)
    await sendOtpEmail(cleanEmail, rawOtp, type);

    // CRITICAL SECURITY REQUIREMENT: Never return OTP in the API response
    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Check your inbox!`,
      email: cleanEmail,
    });
  } catch (error) {
    console.error('Request OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process OTP request. Please try again.',
    });
  }
};

// @route   POST /api/auth/request-otp (Primary specification endpoint)
router.post('/request-otp', handleRequestOtp);

// @route   POST /api/auth/send-otp (Alias for backwards compatibility)
router.post('/send-otp', handleRequestOtp);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify 6-digit OTP, establish session, create/find user, set httpOnly cookies
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and verification code.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code must be exactly 6 digits.',
      });
    }

    // Find the active challenge for this email
    const challenge = await Otp.findOne({
      email: cleanEmail,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired or was not requested. Please request a new code.',
      });
    }

    // Check maximum verification attempts (brute-force defense: max 5)
    if (challenge.attempts >= 5) {
      challenge.isUsed = true;
      await challenge.save();
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect verification attempts. This code is now invalid. Please request a new one.',
      });
    }

    // Compare HMAC-SHA256 hashes
    const expectedHash = hashOtp(cleanEmail, cleanOtp);
    if (challenge.otpHash !== expectedHash) {
      challenge.attempts += 1;
      await challenge.save();

      const remainingAttempts = 5 - challenge.attempts;
      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
      });
    }

    // OTP is valid! Atomically consume it to prevent replay attacks
    challenge.isUsed = true;
    await challenge.save();

    // Check if user already exists
    let user = await User.findOne({ email: cleanEmail });
    const isServerAdmin = isAuthorizedAdminEmail(cleanEmail);

    if (!user) {
      // Auto-create user upon first verified sign-in with password if provided
      const rawName = name?.trim() || cleanEmail.split('@')[0];
      const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      user = await User.create({
        name: displayName,
        email: cleanEmail,
        password: password && password.trim().length >= 6 ? password.trim() : undefined,
        authProvider: password ? 'local' : 'otp',
        role: isServerAdmin ? 'admin' : 'user',
        emailVerified: true,
        emailVerifiedAt: new Date(),
      });
      console.log(`🎉 New user created via verified email OTP: ${cleanEmail}`);
    } else {
      // Existing user: preserve data, sync admin role if authorized
      let needsSave = false;
      if (isServerAdmin && user.role !== 'admin') {
        user.role = 'admin';
        needsSave = true;
      }
      if (!user.emailVerified) {
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        needsSave = true;
      }
      if (password && password.trim().length >= 6) {
        user.password = password.trim();
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    // Establish refresh session in database
    const rawRefreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(rawRefreshToken);
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await Session.create({
      user: user._id,
      refreshTokenHash,
      expiresAt: sessionExpiresAt,
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
      lastUsedAt: new Date(),
    });

    // Issue short-lived JWT access token (15 mins)
    const accessToken = generateAccessToken(user);

    // Set secure httpOnly cookies
    setAuthCookies(res, accessToken, rawRefreshToken);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      token: accessToken,
      user: formatSafeUser(user),
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete verification. Please try again.',
    });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Rotate refresh token, issue new access token and new refresh session
 * @access  Public (via gdg_refresh_token cookie)
 */
router.post('/refresh', async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.gdg_refresh_token;

    if (!rawRefreshToken) {
      return res.status(401).json({
        success: false,
        code: 'NO_REFRESH_TOKEN',
        message: 'No refresh token provided in session.',
      });
    }

    const currentTokenHash = hashRefreshToken(rawRefreshToken);

    // Look up session by hashed refresh token
    const session = await Session.findOne({ refreshTokenHash: currentTokenHash });

    if (!session) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        code: 'SESSION_INVALID',
        message: 'Session not found. Please log in again.',
      });
    }

    // Check if session has been revoked (Token reuse detection)
    if (session.isRevoked) {
      // Possible stolen token replay attack! Revoke all sessions for this user.
      await Session.updateMany({ user: session.user }, { $set: { isRevoked: true, revokedAt: new Date() } });
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        code: 'SESSION_REVOKED',
        message: 'Session has been invalidated due to token reuse detection. Please log in again.',
      });
    }

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      session.isRevoked = true;
      session.revokedAt = new Date();
      await session.save();
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        code: 'SESSION_EXPIRED',
        message: 'Session has expired. Please log in again.',
      });
    }

    // Fetch user
    const user = await User.findById(session.user);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // Token Rotation: Generate new refresh token and update existing session
    const newRawRefreshToken = generateRefreshToken();
    session.refreshTokenHash = hashRefreshToken(newRawRefreshToken);
    session.lastUsedAt = new Date();
    await session.save();

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    // Update httpOnly cookies
    setAuthCookies(res, newAccessToken, newRawRefreshToken);

    return res.status(200).json({
      success: true,
      user: formatSafeUser(user),
    });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh session.',
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Revoke current refresh session and clear authentication cookies
 * @access  Public
 */
router.post('/logout', async (req, res) => {
  try {
    const rawRefreshToken = req.cookies?.gdg_refresh_token;

    if (rawRefreshToken) {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      await Session.findOneAndUpdate(
        { refreshTokenHash: tokenHash },
        { isRevoked: true, revokedAt: new Date() }
      );
    }

    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully. Authentication session revoked.',
    });
  } catch (error) {
    console.error('Logout Error:', error);
    clearAuthCookies(res);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user's profile and admin authorization status
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: formatSafeUser(req.user),
    });
  } catch (error) {
    console.error('Get Current User Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving user.' });
  }
});

// ============================================================================
// LEGACY / COMPATIBILITY ROUTES (Password / Google Sign-In)
// ============================================================================

/**
 * @route   POST /api/auth/login
 * @desc    Legacy password login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        notFound: true,
        message: 'No account found with this email. Please sign up to create your account.',
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'No password set for this account. Please sign in using Email OTP.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your password or sign in with Email OTP.' });
    }

    const rawRefreshToken = generateRefreshToken();
    await Session.create({
      user: user._id,
      refreshTokenHash: hashRefreshToken(rawRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
    });

    const accessToken = generateAccessToken(user);
    setAuthCookies(res, accessToken, rawRefreshToken);

    return res.status(200).json({ success: true, token: accessToken, user: formatSafeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Legacy password registration
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      authProvider: 'local',
      role: isAuthorizedAdminEmail(cleanEmail) ? 'admin' : 'user',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    const rawRefreshToken = generateRefreshToken();
    await Session.create({
      user: user._id,
      refreshTokenHash: hashRefreshToken(rawRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers['user-agent'] || '',
      ipAddress: req.ip || '',
    });

    const accessToken = generateAccessToken(user);
    setAuthCookies(res, accessToken, rawRefreshToken);

    return res.status(201).json({ success: true, token: accessToken, user: formatSafeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error registering user.' });
  }
});

module.exports = router;
