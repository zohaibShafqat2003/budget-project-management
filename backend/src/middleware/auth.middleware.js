const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models');

/**
 * Middleware to authenticate user by JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.',
        status: 401
      });
    }
    
    // Check if token is in blacklist
    if (global.revokedTokens && global.revokedTokens.has(token)) {
      return res.status(401).json({ 
        success: false,
        message: 'Token has been revoked. Please login again.',
        status: 401
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. User not found.',
        status: 401
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'Account is inactive. Please contact administrator.',
        status: 403
      });
    }
    
    // Add user info to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please login again.',
        status: 401
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token.',
        status: 401
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication.',
      status: 500
    });
  }
};

/**
 * Middleware to verify refresh token
 */
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify JWT signature first
    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token signature'
      });
    }

    const token = await RefreshToken.findOne({
      where: { token: refreshToken, isRevoked: false },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
    });

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    if (token.expiresAt < new Date()) {
      await token.update({ isRevoked: true });
      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired'
      });
    }

    req.user = token.user;
    req.refreshToken = token;
    next();
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during refresh token verification'
    });
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User with role '${req.user.role}' is not authorized to access this route`
      });
    }
    
    next();
  };
};

/**
 * Middleware to check if user has admin role
 */
const isAdmin = authorize(['Admin']);

/**
 * Middleware to check if user has manager role or higher
 */
const isManager = authorize(['Admin', 'Product Owner', 'Scrum Master']);

module.exports = {
  authenticateToken,
  verifyRefreshToken,
  authorize,
  isAdmin,
  isManager
}; 