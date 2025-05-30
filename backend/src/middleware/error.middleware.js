const logger = require('../config/logger');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user ? req.user.id : null
  });

  // Default error
  let error = {
    success: false,
    message: 'Internal server error',
    status: 500
  };

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    error = {
      success: false,
      message: err.errors.map(e => e.message).join(', '),
      status: 400,
      validationErrors: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    };
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    error = {
      success: false,
      message: 'A record with this data already exists',
      status: 409,
      validationErrors: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    };
  }

  // Handle Sequelize foreign key errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = {
      success: false,
      message: 'Referenced record does not exist',
      status: 400
    };
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid token',
      status: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      message: 'Token expired',
      status: 401
    };
  }

  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      success: false,
      message: 'File too large',
      status: 400
    };
  }

  // Handle custom errors
  if (err.status) {
    error = {
      success: false,
      message: err.message || 'An error occurred',
      status: err.status
    };
  }

  // Add error details in development mode
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.details = err.message;
  }

  // Send error response
  res.status(error.status).json(error);
};

module.exports = errorHandler; 