const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Registration route
router.post('/register', authLimiter, validateRegister, validate, register);

// Login route
router.post('/login', authLimiter, validateLogin, validate, login);

// Logout route
router.post('/logout', logout);

// Current user profile
router.get('/me', authenticateToken, getMe);

module.exports = router;
