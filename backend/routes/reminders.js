const express = require('express');
const Reminder = require('../models/Reminder');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/reminders/:eventId
// @desc    Subscribe / Set reminder for an event
// @access  Private
router.post('/:eventId', protect, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { channel = 'email' } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Must be registered for the event
    const registration = await Registration.findOne({
      user: req.user._id,
      event: eventId,
      status: 'confirmed',
    });

    if (!registration) {
      return res.status(400).json({
        success: false,
        message: 'You must be registered for this event to set a reminder',
      });
    }

    // Default reminder time: 24 hours before event (or right away if event is sooner)
    const eventDate = new Date(event.date);
    const reminderTime = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);

    const reminder = await Reminder.findOneAndUpdate(
      { user: req.user._id, event: eventId },
      {
        user: req.user._id,
        event: eventId,
        email: req.user.email,
        reminderTime: reminderTime > new Date() ? reminderTime : new Date(),
        channel,
        status: 'pending',
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Reminder scheduled successfully!',
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/reminders/my-reminders
// @desc    Get user's scheduled reminders
// @access  Private
router.get('/my-reminders', protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id })
      .populate('event', 'title date venue category')
      .sort({ reminderTime: 1 });

    res.json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/reminders/:eventId
// @desc    Cancel reminder for an event
// @access  Private
router.delete('/:eventId', protect, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({
      user: req.user._id,
      event: req.params.eventId,
    });

    res.json({ success: true, message: 'Reminder cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/reminders/broadcast/:eventId
// @desc    Admin: Broadcast reminder to all registered attendees
// @access  Private/Admin
router.post('/broadcast/:eventId', protect, admin, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { customNote } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const registrations = await Registration.find({
      event: eventId,
      status: 'confirmed',
    }).populate('user', 'name email');

    const dispatchedCount = registrations.length;

    // Simulate batch reminder dispatching
    console.log(`[BACKGROUND JOB] Dispatched ${dispatchedCount} reminders for "${event.title}"`);

    res.json({
      success: true,
      message: `Successfully queued ${dispatchedCount} reminders for "${event.title}"`,
      dispatchedCount,
      event: event.title,
      customNote: customNote || 'Standard GDG event reminder',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
