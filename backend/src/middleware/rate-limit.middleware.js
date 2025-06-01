const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// Environment based configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// Default rate limiting values (can be overridden by environment variables)
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = isDevelopment ? 1000 : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100); // Higher limit in dev

// Auth rate limiting values
const AUTH_RATE_LIMIT_WINDOW_MS = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 60 * 60 * 1000; // 1 hour
const AUTH_RATE_LIMIT_MAX_REQUESTS = isDevelopment ? 50 : (parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 5); // 50 in dev, 5 in prod

// Upload rate limiting values
const UPLOAD_RATE_LIMIT_WINDOW_MS = parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS, 10) || 60 * 60 * 1000; // 1 hour
const UPLOAD_RATE_LIMIT_MAX_REQUESTS = isDevelopment ? 100 : (parseInt(process.env.UPLOAD_RATE_LIMIT_MAX_REQUESTS, 10) || 20); // 100 in dev, 20 in prod

/**
 * Create a rate limiter middleware with custom configuration
 * @param {Object} options - Rate limiter options
 * @returns {Function} Rate limiter middleware
 */
const rateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { 
      success: false, 
      message: 'Too many requests, please try again later',
      status: 429
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user ? req.user.id : req.ip;
    }
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

// General API rate limiter
const limiter = rateLimiter();

// More restrictive limiter for authentication endpoints
const authLimiter = rateLimiter({
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX_REQUESTS,
  message: { 
    success: false, 
    message: 'Too many authentication attempts, please try again later',
    status: 429
  },
  keyGenerator: (req) => req.ip // Always use IP for auth routes
});

// File upload rate limiter
const uploadLimiter = rateLimiter({
  windowMs: UPLOAD_RATE_LIMIT_WINDOW_MS,
  max: UPLOAD_RATE_LIMIT_MAX_REQUESTS,
  message: { 
    success: false, 
    message: 'Too many file uploads, please try again later',
    status: 429
  },
  keyGenerator: (req) => `${req.ip}_upload` // Different key for upload operations
});

module.exports = {
  rateLimiter,
  limiter,
  authLimiter,
  uploadLimiter
}; 