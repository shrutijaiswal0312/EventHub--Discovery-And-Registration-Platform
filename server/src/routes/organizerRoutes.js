const express = require('express');
const router = express.Router();
const {
  getOrganizerEvents,
  getEventParticipants
} = require('../controllers/eventController');
const { getOrganizerDashboardStats } = require('../controllers/dashboardController');
const { validateEventId } = require('../validators/eventValidators');
const validate = require('../middleware/validate');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes here require authenticated Organizer
router.use(authenticateToken, requireRole('organizer'));

// Get all events owned by current organizer
router.get('/events', getOrganizerEvents);

// Get participants list for a specific owned event
router.get('/events/:id/participants', validateEventId, validate, getEventParticipants);

// Get organizer analytics & stats
router.get('/dashboard/stats', getOrganizerDashboardStats);

module.exports = router;
