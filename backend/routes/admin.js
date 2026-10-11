const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, requireAdmin } = require('../middleware/auth');

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

module.exports = router;
