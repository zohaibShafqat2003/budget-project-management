const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken, verifyRefreshToken } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rate-limit.middleware');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, authController.register);

// @route   POST /api/auth/login
// @desc    Login user and get tokens
// @access  Public
router.post('/login', authLimiter, authController.login);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', authLimiter, verifyRefreshToken, authController.refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user and invalidate refresh token
// @access  Private
router.post('/logout', authenticateToken, authController.logout);

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router; 