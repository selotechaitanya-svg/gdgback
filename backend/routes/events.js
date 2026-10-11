const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const { protect, admin } = require('../middleware/auth');
const { getCache, setCache, clearCachePattern } = require('../config/redis');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events (with search, filter, pagination)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 12, upcoming } = req.query;

    const cacheKey = `events:${JSON.stringify(req.query)}`;
    let cachedData = null;
    try {
      cachedData = await getCache(cacheKey);
    } catch {
      // cache bypass
    }
    if (cachedData) {
      return res.json(cachedData);
    }

    let query = {};

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Upcoming / past filter
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    } else if (upcoming === 'false') {
      query.date = { $lt: new Date() };
    }

    // Sort options
    let sortOption = { date: -1 }; // default: newest first
    if (sort === 'date_asc') sortOption = { date: 1 };
    if (sort === 'date_desc') sortOption = { date: -1 };
    if (sort === 'title') sortOption = { title: 1 };
    if (sort === 'capacity') sortOption = { capacity: -1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name'),
      Event.countDocuments(query),
    ]);

    const responsePayload = {
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };

    // Cache result in Redis for 60 seconds (non-blocking)
    try {
      await setCache(cacheKey, responsePayload, 60);
    } catch {
      // ignore
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('GET /api/events error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// @route   GET /api/events/stats
// @desc    Get event statistics (admin analytics)
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const [
      totalEvents,
      totalRegistrations,
      upcomingEvents,
      categoryStats,
    ] = await Promise.all([
      Event.countDocuments(),
      Registration.countDocuments({ status: 'confirmed' }),
      Event.countDocuments({ date: { $gte: new Date() } }),
      Event.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalCapacity: { $sum: '$capacity' }, totalRegistered: { $sum: '$registrationCount' } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Most popular events (by registration count)
    const popularEvents = await Event.find()
      .sort({ registrationCount: -1 })
      .limit(5)
      .select('title registrationCount capacity category date');

    res.json({
      success: true,
      data: {
        totalEvents,
        totalRegistrations,
        upcomingEvents,
        pastEvents: totalEvents - upcomingEvents,
        categoryStats,
        popularEvents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Get registration count
    const registrationCount = await Registration.countDocuments({
      event: event._id,
      status: 'confirmed',
    });

    res.json({
      success: true,
      data: {
        ...event.toObject(),
        registrationCount,
        spotsLeft: event.capacity - registrationCount,
      },
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
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

    // Invalidate Redis cache
    await clearCachePattern('events:*');

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, description, date, venue, capacity, category, image } = req.body;

    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Prevent reducing capacity below current registrations
    if (capacity && capacity < event.registrationCount) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce capacity below current registrations (${event.registrationCount})`,
      });
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, date, venue, capacity, category, image },
      { new: true, runValidators: true }
    );

    // Invalidate Redis cache
    await clearCachePattern('events:*');

    res.json({ success: true, data: event });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event (and all its registrations)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Delete all registrations for this event
    await Registration.deleteMany({ event: event._id });

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    // Invalidate Redis cache
    await clearCachePattern('events:*');

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/events/:id/registrations
// @desc    Get all registrations for an event
// @access  Private/Admin
router.get('/:id/registrations', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const registrations = await Registration.find({
      event: req.params.id,
      status: 'confirmed',
    }).populate('user', 'name email');

    res.json({
      success: true,
      data: registrations,
      total: registrations.length,
      event: { title: event.title, capacity: event.capacity },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
