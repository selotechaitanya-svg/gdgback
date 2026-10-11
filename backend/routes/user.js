const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isAuthorizedAdminEmail } = require('../utils/security');

const router = express.Router();

/**
 * @route   GET /api/user/profile
 * @desc    Get currently authenticated user's profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isAdmin = isAuthorizedAdminEmail(user.email) || user.role === 'admin';

    return res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: isAdmin ? 'admin' : user.role || 'user',
        isAdmin,
        avatar: user.avatar || '',
        emailVerified: user.emailVerified ?? true,
        emailVerifiedAt: user.emailVerifiedAt,
        authProvider: user.authProvider || 'otp',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving profile.' });
  }
});

/**
 * @route   PATCH /api/user/profile
 * @desc    Update permitted profile fields (name, avatar)
 * @access  Private
 */
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Only permit updating safe profile fields
    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim().slice(0, 50);
    }

    if (typeof avatar === 'string') {
      user.avatar = avatar.trim();
    }

    await user.save();

    const isAdmin = isAuthorizedAdminEmail(user.email) || user.role === 'admin';

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: isAdmin ? 'admin' : user.role || 'user',
        isAdmin,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
});

module.exports = router;
