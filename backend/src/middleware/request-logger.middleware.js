const morgan = require('morgan');
const logger = require('../config/logger');

// Custom token for request body logging (sanitized for sensitive data)
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const body = { ...req.body };
    
    // Remove sensitive data
    if (body.password) body.password = '[REDACTED]';
    if (body.token) body.token = '[REDACTED]';
    if (body.refreshToken) body.refreshToken = '[REDACTED]';
    
    return JSON.stringify(body);
  }
  return '';
});

// Custom token for response body logging (sanitized)
// Note: Express doesn't store response body by default
// This token will only work if response-capture middleware is used
morgan.token('response-body', (req, res) => {
  // Get response body from res.locals if available
  const responseBody = res.locals && res.locals.responseBody;
  
  if (responseBody) {
    try {
      // Parse response body if it's a string
      const body = typeof responseBody === 'string' ? 
        JSON.parse(responseBody) : { ...responseBody };
      
      // Remove sensitive data
      if (body.token) body.token = '[REDACTED]';
      if (body.refreshToken) body.refreshToken = '[REDACTED]';
      if (body.data && body.data.accessToken) body.data.accessToken = '[REDACTED]';
      if (body.data && body.data.refreshToken) body.data.refreshToken = '[REDACTED]';
      
      return JSON.stringify(body);
    } catch (error) {
      // If parsing fails, return sanitized string
      return typeof responseBody === 'string' ? 
        responseBody.replace(/"(access|refresh)Token":"[^"]+"/g, '"$1Token":"[REDACTED]"') : 
        String(responseBody);
    }
  }
  return '';
});

// Middleware to capture response body for logging
const captureResponseBody = (req, res, next) => {
  // Skip capturing for certain endpoints
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  
  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override send method
  res.send = function(body) {
    res.locals.responseBody = body;
    return originalSend.apply(res, arguments);
  };
  
  // Override json method
  res.json = function(body) {
    res.locals.responseBody = body;
    return originalJson.apply(res, arguments);
  };
  
  next();
};

// Custom format for logging
const logFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// More detailed format for development
const devFormat = logFormat + ' :body :response-body';

// Create request logger middleware
const requestLogger = (req, res, next) => {
  // Skip logging for health check endpoints
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  
  // Apply response capture middleware first
  captureResponseBody(req, res, () => {
    // Then apply morgan logger
    morgan(
      process.env.NODE_ENV === 'production' ? logFormat : devFormat,
      {
        stream: logger.stream,
        skip: (req) => {
          // Skip logging for health check endpoints
          return req.path === '/health' || req.path === '/api/health';
        }
      }
    )(req, res, next);
  });
};

module.exports = requestLogger; 