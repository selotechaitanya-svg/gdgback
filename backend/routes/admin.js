const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Session = require('../models/Session');
const { protect, requireAdmin } = require('../middleware/auth');
const { isAuthorizedAdminEmail } = require('../utils/security');

const router = express.Router();

// Enforce authentication AND server-side administrator allowlist authorization
// on EVERY admin route
router.use(protect);
router.use(requireAdmin);

/**
 * @route   GET /api/admin/events
 * @desc    Get all events with accurate registration counts (Read-only)
 * @access  Private / Administrator Only
 */
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    // Calculate real-time confirmed registration count for each event from database
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const actualCount = await Registration.countDocuments({
          event: event._id,
          status: 'confirmed',
        });

        return {
          id: event._id,
          title: event.title,
          description: event.description,
          date: event.date,
          venue: event.venue,
          capacity: event.capacity,
          category: event.category,
          registrationCount: actualCount,
          image: event.image || '',
          createdAt: event.createdAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      total: eventsWithCounts.length,
      events: eventsWithCounts,
    });
  } catch (error) {
    console.error('Admin Get Events Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve events for admin overview.',
    });
  }
});

/**
 * @route   GET /api/admin/events/:eventId/registrations
 * @desc    Get actual registered attendees for a specific event (Read-only)
 * @access  Private / Administrator Only
 */
router.get('/events/:eventId/registrations', async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event identifier format.',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found in database.',
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const [registrations, total] = await Promise.all([
      Registration.find({ event: eventId, status: 'confirmed' })
        .populate('user', 'name email createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Registration.countDocuments({ event: eventId, status: 'confirmed' }),
    ]);

    const formattedAttendees = registrations.map((reg) => ({
      id: reg._id,
      attendeeName: reg.user?.name || 'Not provided',
      attendeeEmail: reg.user?.email || 'N/A',
      registrationDate: reg.createdAt,
      status: reg.status,
    }));

    return res.status(200).json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        date: event.date,
        venue: event.venue,
        capacity: event.capacity,
        category: event.category,
        registrationCount: total,
      },
      registrations: formattedAttendees,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Admin Get Registrations Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve event attendee registrations.',
    });
  }
});

/**
 * @route   POST /api/admin/events
 * @desc    Create a new event
 * @access  Private / Administrator Only
 */
router.post('/events', async (req, res) => {
  try {
    const { title, description, date, venue, capacity, category, image } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      capacity,
      category,
      image: image || '',
      createdBy: req.user._id,
    });

    try {
      const { clearCachePattern } = require('../config/redis');
      await clearCachePattern('events:*');
    } catch (_) {}

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: event,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    return res.status(500).json({ success: false, message: 'Server error creating event.' });
  }
});

/**
 * @route   PUT /api/admin/events/:eventId
 * @desc    Update an existing event
 * @access  Private / Administrator Only
 */
router.put('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, date, venue, capacity, category, image } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (capacity && capacity < event.registrationCount) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce capacity below current registrations (${event.registrationCount}).`,
      });
    }

    const updated = await Event.findByIdAndUpdate(
      eventId,
      { title, description, date, venue, capacity, category, image },
      { new: true, runValidators: true }
    );

    try {
      const { clearCachePattern } = require('../config/redis');
      await clearCachePattern('events:*');
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: updated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    return res.status(500).json({ success: false, message: 'Server error updating event.' });
  }
});

/**
 * @route   DELETE /api/admin/events/:eventId
 * @desc    Delete an event and all its registrations
 * @access  Private / Administrator Only
 */
router.delete('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await Registration.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(eventId);

    try {
      const { clearCachePattern } = require('../config/redis');
      await clearCachePattern('events:*');
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error deleting event.' });
  }
});

// ============================================================================
// HELPER: USER AGENT PARSER
// ============================================================================
function parseDeviceAgent(userAgent = '') {
  if (!userAgent) return 'Unknown Device';
  let browser = 'Browser';
  let os = 'Unknown OS';

  if (userAgent.includes('Edg/')) browser = 'Edge';
  else if (userAgent.includes('Chrome/')) browser = 'Chrome';
  else if (userAgent.includes('Firefox/')) browser = 'Firefox';
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) browser = 'Safari';
  else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) browser = 'IE';

  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('iPhone')) os = 'iOS (iPhone)';
  else if (userAgent.includes('iPad')) os = 'iOS (iPad)';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

// ============================================================================
// REGISTERED ACCOUNTS & DATABASE USERS SECTION
// ============================================================================

/**
 * @route   GET /api/admin/users
 * @desc    Get all accounts registered in the database with stats, activity & event counts
 * @access  Private / Administrator Only
 */
router.get('/users', async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim() : '';
    const roleFilter = req.query.role; // 'all', 'admin', 'user'
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = parseInt(req.query.limit, 10) === 0 ? 0 : Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));

    // Base query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (roleFilter && roleFilter !== 'all') {
      query.role = roleFilter;
    }

    let usersQuery = User.find(query).sort({ createdAt: -1 });
    if (limit > 0) {
      usersQuery = usersQuery.skip((page - 1) * limit).limit(limit);
    }

    const now = new Date();
    const [users, totalFiltered, totalAllUsers, totalAdmins, verifiedCount, activeSessions] = await Promise.all([
      usersQuery,
      User.countDocuments(query),
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ emailVerified: true }),
      Session.find({
        isRevoked: false,
        expiresAt: { $gt: now },
      }).select('user lastUsedAt createdAt'),
    ]);

    // Track active sessions per user
    const activeSessionsCountMap = new Map();
    activeSessions.forEach((s) => {
      const uId = s.user?.toString();
      if (uId) {
        activeSessionsCountMap.set(uId, (activeSessionsCountMap.get(uId) || 0) + 1);
      }
    });

    // Event registrations count per user for the returned users
    const userIds = users.map((u) => u._id);
    const regAgg = await Registration.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    const regMap = new Map();
    regAgg.forEach((r) => regMap.set(r._id.toString(), r.count));

    const formattedUsers = users.map((u) => {
      const isAdmin = isAuthorizedAdminEmail(u.email) || u.role === 'admin';
      const activeCount = activeSessionsCountMap.get(u._id.toString()) || 0;
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: isAdmin ? 'admin' : u.role || 'user',
        isAdmin,
        authProvider: u.authProvider || 'otp',
        avatar: u.avatar || '',
        emailVerified: u.emailVerified ?? true,
        emailVerifiedAt: u.emailVerifiedAt,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt || null,
        eventsCount: regMap.get(u._id.toString()) || 0,
        hasActiveSession: activeCount > 0,
        activeSessionsCount: activeCount,
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: totalAllUsers,
        totalAdmins,
        verifiedUsers: verifiedCount,
        activeUsersNow: activeSessionsCountMap.size,
      },
      users: formattedUsers,
      pagination: {
        total: totalFiltered,
        page,
        limit: limit || totalFiltered,
        pages: limit > 0 ? (Math.ceil(totalFiltered / limit) || 1) : 1,
      },
    });
  } catch (error) {
    console.error('Admin Get Users Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve registered users list.',
    });
  }
});

/**
 * @route   GET /api/admin/users/:userId/registrations
 * @desc    Get all events a specific user is registered for
 * @access  Private / Administrator Only
 */
router.get('/users/:userId/registrations', async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found in database.' });
    }

    const registrations = await Registration.find({ user: userId })
      .populate('event', 'title date venue category capacity image')
      .sort({ createdAt: -1 });

    const formatted = registrations.map((r) => ({
      id: r._id,
      event: r.event
        ? {
            id: r.event._id,
            title: r.event.title,
            date: r.event.date,
            venue: r.event.venue,
            category: r.event.category,
          }
        : null,
      status: r.status,
      registeredAt: r.createdAt,
    }));

    return res.status(200).json({
      success: true,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
      },
      registrations: formatted,
    });
  } catch (error) {
    console.error('Get User Registrations Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve registrations for user.' });
  }
});

/**
 * @route   POST /api/admin/users/:userId/revoke-sessions
 * @desc    Revoke all active sessions for a user
 * @access  Private / Administrator Only
 */
router.post('/users/:userId/revoke-sessions', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Session.updateMany(
      { user: userId, isRevoked: false },
      { $set: { isRevoked: true, revokedAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: `Revoked ${result.modifiedCount} active session(s) for user.`,
    });
  } catch (error) {
    console.error('Revoke User Sessions Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to revoke user sessions.' });
  }
});

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete a user account and associated registrations & sessions
 * @access  Private / Administrator Only
 */
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own administrative account.',
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found in database.' });
    }

    // Cascade delete: user, registrations, sessions
    await Promise.all([
      User.findByIdAndDelete(userId),
      Registration.deleteMany({ user: userId }),
      Session.deleteMany({ user: userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: `User account "${targetUser.email}" and related records deleted successfully.`,
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user account.' });
  }
});

// ============================================================================
// LOGIN SESSIONS & WHO LOGGED IN ACTIVITY SECTION
// ============================================================================

/**
 * @route   GET /api/admin/sessions
 * @desc    Get who logged in (sessions history, active status, IP, device)
 * @access  Private / Administrator Only
 */
router.get('/sessions', async (req, res) => {
  try {
    const statusFilter = req.query.status || 'all'; // 'all', 'active', 'revoked', 'expired'
    const search = req.query.search ? req.query.search.trim().toLowerCase() : '';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const now = new Date();
    const query = {};

    if (statusFilter === 'active') {
      query.isRevoked = false;
      query.expiresAt = { $gt: now };
    } else if (statusFilter === 'revoked') {
      query.isRevoked = true;
    } else if (statusFilter === 'expired') {
      query.isRevoked = false;
      query.expiresAt = { $lte: now };
    }

    let sessions = await Session.find(query)
      .populate('user', 'name email role avatar')
      .sort({ lastUsedAt: -1, createdAt: -1 })
      .lean();

    if (search) {
      sessions = sessions.filter((s) => {
        const userName = s.user?.name?.toLowerCase() || '';
        const userEmail = s.user?.email?.toLowerCase() || '';
        const ip = s.ipAddress?.toLowerCase() || '';
        const ua = s.userAgent?.toLowerCase() || '';
        return userName.includes(search) || userEmail.includes(search) || ip.includes(search) || ua.includes(search);
      });
    }

    const total = sessions.length;
    const paginatedSessions = sessions.slice(skip, skip + limit);

    const [totalSessions, activeCount, revokedCount] = await Promise.all([
      Session.countDocuments(),
      Session.countDocuments({ isRevoked: false, expiresAt: { $gt: now } }),
      Session.countDocuments({ isRevoked: true }),
    ]);

    const formattedSessions = paginatedSessions.map((s) => {
      const isExpired = new Date(s.expiresAt) <= now;
      let status = 'active';
      if (s.isRevoked) status = 'revoked';
      else if (isExpired) status = 'expired';

      return {
        id: s._id,
        user: s.user
          ? {
              id: s.user._id,
              name: s.user.name,
              email: s.user.email,
              role: isAuthorizedAdminEmail(s.user.email) ? 'admin' : s.user.role || 'user',
              avatar: s.user.avatar || '',
            }
          : {
              id: null,
              name: 'Deleted User',
              email: 'N/A',
              role: 'user',
              avatar: '',
            },
        loginAt: s.createdAt,
        lastUsedAt: s.lastUsedAt || s.createdAt,
        expiresAt: s.expiresAt,
        ipAddress: s.ipAddress || '127.0.0.1',
        userAgent: s.userAgent || '',
        device: parseDeviceAgent(s.userAgent),
        status,
        isRevoked: s.isRevoked,
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalSessions,
        activeSessions: activeCount,
        revokedSessions: revokedCount,
        expiredSessions: Math.max(0, totalSessions - activeCount - revokedCount),
      },
      sessions: formattedSessions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Admin Get Sessions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve login sessions log.',
    });
  }
});

/**
 * @route   POST /api/admin/sessions/:sessionId/revoke
 * @desc    Revoke an active login session immediately
 * @access  Private / Administrator Only
 */
router.post('/sessions/:sessionId/revoke', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findByIdAndUpdate(
      sessionId,
      { isRevoked: true, revokedAt: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session record not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Session has been revoked successfully.',
    });
  } catch (error) {
    console.error('Revoke Session Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to revoke session.' });
  }
});

module.exports = router;
