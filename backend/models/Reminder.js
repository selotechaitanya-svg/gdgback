const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    reminderTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    sentAt: {
      type: Date,
    },
    channel: {
      type: String,
      enum: ['email', 'in-app', 'calendar'],
      default: 'email',
    },
  },
  { timestamps: true }
);

reminderSchema.index({ event: 1, user: 1 }, { unique: true });
reminderSchema.index({ reminderTime: 1, status: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
