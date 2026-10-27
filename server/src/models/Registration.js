const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Participant reference is required'],
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['registered', 'cancelled'],
        message: 'Registration status must be registered or cancelled'
      },
      default: 'registered',
      index: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// One registration record per participant-event pair (reactivated upon re-registration)
registrationSchema.index({ participant: 1, event: 1 }, { unique: true });
registrationSchema.index({ event: 1, status: 1 });
registrationSchema.index({ participant: 1, status: 1, createdAt: -1 });

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
