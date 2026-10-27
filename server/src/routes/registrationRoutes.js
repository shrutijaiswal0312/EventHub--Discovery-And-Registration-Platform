const express = require('express');
const router = express.Router();
const { getMyRegistrations } = require('../controllers/registrationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All routes here require authenticated Participant
router.use(authenticateToken, requireRole('participant'));

// Get logged-in participant's registrations
router.get('/my', getMyRegistrations);

module.exports = router;
