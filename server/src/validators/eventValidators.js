const { body, param } = require('express-validator');
const mongoose = require('mongoose');
const { CATEGORIES } = require('../models/Event');

// Helper to convert time strings (HH:mm or HH:mm AM/PM) into minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const str = timeStr.trim().toLowerCase();
  
  // Check 12-hour format: "09:30 am", "2:15 pm"
  const match12 = str.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = match12[3];
    if (hours === 12) hours = 0;
    if (meridiem === 'pm') hours += 12;
    return hours * 60 + minutes;
  }

  // Check 24-hour format: "09:30", "14:45"
  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return null;
};

const validateEventId = [
  param('id')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid event ID format');
      }
      return true;
    })
];

const validateCreateEvent = [
  body('title')
    .trim()
    .notEmpty().withMessage('Event title is required')
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Event description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('category')
    .trim()
    .notEmpty().withMessage('Event category is required')
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('date')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Invalid date format. Expected YYYY-MM-DD')
    .toDate(),
  body('startTime')
    .trim()
    .notEmpty().withMessage('Start time is required')
    .custom((val) => {
      if (parseTimeToMinutes(val) === null) {
        throw new Error('Start time must be a valid time (e.g. 09:00 or 09:00 AM)');
      }
      return true;
    }),
  body('endTime')
    .trim()
    .notEmpty().withMessage('End time is required')
    .custom((val, { req }) => {
      const endMins = parseTimeToMinutes(val);
      if (endMins === null) {
        throw new Error('End time must be a valid time (e.g. 17:00 or 05:00 PM)');
      }
      const startMins = parseTimeToMinutes(req.body.startTime);
      if (startMins !== null && endMins <= startMins) {
        throw new Error('End time must be later than start time');
      }
      return true;
    }),
  body('location')
    .trim()
    .notEmpty().withMessage('Location or venue is required'),
  body('eventType')
    .optional()
    .isIn(['online', 'offline']).withMessage('Event type must be online or offline'),
  body('meetingUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Meeting URL must be a valid URL'),
  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer of at least 1'),
  body('coverImage')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Cover image must be a valid URL')
];

const validateUpdateEvent = [
  ...validateEventId,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage('Title must be between 3 and 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('category')
    .optional()
    .trim()
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format. Expected YYYY-MM-DD')
    .toDate(),
  body('startTime')
    .optional()
    .trim()
    .custom((val) => {
      if (parseTimeToMinutes(val) === null) {
        throw new Error('Start time must be a valid time (e.g. 09:00 or 09:00 AM)');
      }
      return true;
    }),
  body('endTime')
    .optional()
    .trim()
    .custom((val, { req }) => {
      const endMins = parseTimeToMinutes(val);
      if (endMins === null) {
        throw new Error('End time must be a valid time (e.g. 17:00 or 05:00 PM)');
      }
      if (req.body.startTime) {
        const startMins = parseTimeToMinutes(req.body.startTime);
        if (startMins !== null && endMins <= startMins) {
          throw new Error('End time must be later than start time');
        }
      }
      return true;
    }),
  body('location')
    .optional()
    .trim()
    .notEmpty().withMessage('Location cannot be empty'),
  body('eventType')
    .optional()
    .isIn(['online', 'offline']).withMessage('Event type must be online or offline'),
  body('meetingUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Meeting URL must be a valid URL'),
  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer of at least 1'),
  body('coverImage')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Cover image must be a valid URL'),
  body('status')
    .optional()
    .isIn(['published', 'cancelled', 'completed']).withMessage('Status must be published, cancelled, or completed')
];

module.exports = {
  validateEventId,
  validateCreateEvent,
  validateUpdateEvent,
  parseTimeToMinutes
};
