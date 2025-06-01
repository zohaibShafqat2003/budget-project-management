const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// Parse environment variables for rate limits
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // Default 15 minutes
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 1000; // Default 100 requests

// For development, allow more auth requests
const isDevelopment = process.env.NODE_ENV === 'development';
const AUTH_RATE_LIMIT_WINDOW_MS = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 60 * 60 * 1000; // Default 1 hour
const AUTH_RATE_LIMIT_MAX_REQUESTS = isDevelopment ? 50 : (parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 5); // 50 in dev, 5 in prod

// Create rate limiter
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    status: 429
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user ? req.user.id : req.ip;
  }
});

// Create stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});

module.exports = {
  limiter,
  authLimiter
}; 