const logger = require('../config/logger');
const { User } = require('../models');

/**
 * Permission matrix defining which roles have access to which resources and actions
 */
const permissionMatrix = {
  'Admin': {
    // Admins have access to all resources and actions
    '*': ['*']
  },
  'Product Owner': {
    projects: ['read', 'create', 'update', 'delete'],
    tasks: ['read', 'create', 'update', 'delete'],
    users: ['read'],
    clients: ['read', 'create', 'update'],
    budgets: ['read', 'create', 'update', 'delete'],
    expenses: ['read', 'create', 'update', 'delete', 'approve', 'reject'],
    reports: ['read', 'export']
  },
  'Scrum Master': {
    projects: ['read', 'create', 'update'],
    tasks: ['read', 'create', 'update', 'delete'],
    users: ['read'],
    clients: ['read'],
    budgets: ['read', 'create', 'update'],
    expenses: ['read', 'create', 'update', 'approve', 'reject'],
    reports: ['read', 'export']
  },
  'Developer': {
    projects: ['read'],
    tasks: ['read', 'update'],
    users: ['read'],
    clients: ['read'],
    budgets: ['read'],
    expenses: ['read', 'create'],
    reports: ['read']
  },
  'Viewer': {
    projects: ['read'],
    tasks: ['read'],
    users: ['read'],
    clients: ['read'],
    budgets: ['read'],
    expenses: ['read'],
    reports: ['read']
  }
};

/**
 * Check if user has permission to access a resource and perform an action
 * @param {String} resource - The resource being accessed
 * @param {String} action - The action being performed
 * @returns {Function} Express middleware
 */
const checkUserPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Get user from request (added by auth middleware)
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      // Get user role
      const role = user.role || 'Viewer';
      
      // Check if role exists in permission matrix
      if (!permissionMatrix[role]) {
        logger.error(`Role not found in permission matrix: ${role}`);
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Role not defined'
        });
      }
      
      // Admin has access to everything
      if (role === 'Admin') {
        return next();
      }
      
      // Check if role has access to resource
      const rolePermissions = permissionMatrix[role];
      
      // Check if role has permission for resource
      if (!rolePermissions[resource] && !rolePermissions['*']) {
        logger.debug(`User ${user.id} with role ${role} denied access to ${resource}`);
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Insufficient permissions'
        });
      }
      
      // Check if role has permission for action on resource
      const allowedActions = rolePermissions[resource] || [];
      
      if (!allowedActions.includes(action) && !allowedActions.includes('*')) {
        logger.debug(`User ${user.id} with role ${role} denied ${action} action on ${resource}`);
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Insufficient permissions'
        });
      }
      
      // If we reach here, user has permission
      next();
    } catch (error) {
      logger.error('Error checking permissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error checking permissions'
      });
    }
  };
};

module.exports = {
  checkUserPermission
}; 