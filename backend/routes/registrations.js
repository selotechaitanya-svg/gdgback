const express = require('express');
const QRCode = require('qrcode');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const { clearCachePattern } = require('../config/redis');

const router = express.Router();

// @route   POST /api/registrations/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/events/:id/register', protect, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if event date has passed
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for a past event',
      });
    }

    // Check for duplicate registration
    const existingRegistration = await Registration.findOne({
      user: userId,
      event: eventId,
    });

    if (existingRegistration) {
      if (existingRegistration.status === 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'You are already registered for this event',
        });
      }
      // Re-activate cancelled registration
      if (existingRegistration.status === 'cancelled') {
        // Check capacity again
        const currentCount = await Registration.countDocuments({
          event: eventId,
          status: 'confirmed',
        });

        if (currentCount >= event.capacity) {
          return res.status(400).json({
            success: false,
            message: 'Event is full — no spots available',
          });
        }

        existingRegistration.status = 'confirmed';
        await existingRegistration.save();

        // Update event registration count
        await Event.findByIdAndUpdate(eventId, {
          registrationCount: currentCount + 1,
        });

        return res.json({
          success: true,
          message: 'Re-registered successfully',
          data: existingRegistration,
        });
      }
    }

    // Check capacity
    const currentCount = await Registration.countDocuments({
      event: eventId,
      status: 'confirmed',
    });

    if (currentCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is full — no spots available',
      });
    }

    // Generate QR Code
    const qrData = JSON.stringify({
      registrationId: `${userId}-${eventId}`,
      event: event.title,
      user: req.user.name,
      email: req.user.email,
      date: event.date,
    });

    const qrCode = await QRCode.toDataURL(qrData);

    // Create registration
    const registration = await Registration.create({
      user: userId,
      event: eventId,
      qrCode,
      status: 'confirmed',
    });

    // Update event registration count
    await Event.findByIdAndUpdate(eventId, {
      registrationCount: currentCount + 1,
    });

    // Invalidate Redis events cache
    await clearCachePattern('events:*');

    res.status(201).json({
      success: true,
      message: 'Registered successfully!',
      data: registration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/registrations/events/:id/unregister
// @desc    Unregister from an event
// @access  Private
router.delete('/events/:id/unregister', protect, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const registration = await Registration.findOne({
      user: userId,
      event: eventId,
      status: 'confirmed',
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    // Mark as cancelled instead of deleting (audit trail)
    registration.status = 'cancelled';
    await registration.save();

    // Update event registration count
    const currentCount = await Registration.countDocuments({
      event: eventId,
      status: 'confirmed',
    });

    await Event.findByIdAndUpdate(eventId, {
      registrationCount: currentCount,
    });

    // Invalidate Redis events cache
    await clearCachePattern('events:*');

    res.json({
      success: true,
      message: 'Unregistered successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/registrations/my-events
// @desc    Get current user's registered events
// @access  Private
router.get('/my-events', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
      status: 'confirmed',
    }).populate('event');

    res.json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/registrations/check/:eventId
// @desc    Check if current user is registered for an event
// @access  Private
router.get('/check/:eventId', protect, async (req, res) => {
  try {
    const registration = await Registration.findOne({
      user: req.user._id,
      event: req.params.eventId,
      status: 'confirmed',
    });

    res.json({
      success: true,
      isRegistered: !!registration,
      registration,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
