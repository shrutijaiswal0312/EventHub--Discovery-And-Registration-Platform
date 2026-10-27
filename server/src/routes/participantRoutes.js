const express = require('express');
const router = express.Router();
const { getParticipantDashboardStats } = require('../controllers/dashboardController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken, requireRole('participant'));

router.get('/dashboard/stats', getParticipantDashboardStats);

module.exports = router;
