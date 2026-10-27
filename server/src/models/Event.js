const mongoose = require('mongoose');

const CATEGORIES = [
  'Technology',
  'Business',
  'Education',
  'Workshop',
  'Conference',
  'Networking',
  'Webinar',
  'Other'
];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Invalid category'
      }
    },
    date: {
      type: Date,
      required: [true, 'Event date is required']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location or venue is required'],
      trim: true
    },
    eventType: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline'
    },
    meetingUrl: {
      type: String,
      trim: true,
      default: ''
    },
    coverImage: {
      type: String,
      trim: true,
      default: ''
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
      index: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: [0, 'Registered count cannot be negative']
    },
    status: {
      type: String,
      enum: ['published', 'cancelled', 'completed'],
      default: 'published',
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for remaining seats
eventSchema.virtual('remainingSeats').get(function () {
  return Math.max(0, this.capacity - (this.registeredCount || 0));
});

// Virtual for isFull
eventSchema.virtual('isFull').get(function () {
  return (this.registeredCount || 0) >= this.capacity;
});

// Compound indexes for query optimization
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ organizer: 1, createdAt: -1 });
eventSchema.index({ title: 'text', description: 'text', location: 'text' });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
module.exports.CATEGORIES = CATEGORIES;
