const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent
} = require('../controllers/eventController');
const {
  registerForEvent,
  cancelRegistration
} = require('../controllers/registrationController');
const {
  validateCreateEvent,
  validateUpdateEvent,
  validateEventId
} = require('../validators/eventValidators');
const validate = require('../middleware/validate');
const {
  authenticateToken,
  requireRole,
  optionalAuth
} = require('../middleware/auth');

// Public event discovery
router.get('/', optionalAuth, getEvents);

// Public/contextual event details
router.get('/:id', optionalAuth, validateEventId, validate, getEventById);

// Organizer routes
router.post(
  '/',
  authenticateToken,
  requireRole('organizer'),
  validateCreateEvent,
  validate,
  createEvent
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('organizer'),
  validateUpdateEvent,
  validate,
  updateEvent
);

router.patch(
  '/:id/cancel',
  authenticateToken,
  requireRole('organizer'),
  validateEventId,
  validate,
  cancelEvent
);

// Participant registration routes on events
router.post(
  '/:id/register',
  authenticateToken,
  requireRole('participant'),
  validateEventId,
  validate,
  registerForEvent
);

router.delete(
  '/:id/register',
  authenticateToken,
  requireRole('participant'),
  validateEventId,
  validate,
  cancelRegistration
);

module.exports = router;
