const { body, param, query, validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Validates request using the provided validation rules
 * @param {Array} validations - Array of validation rules
 * @returns {Function} Express middleware
 */
const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // Log validation errors
    logger.debug('Validation errors:', errors.array());
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

/**
 * Common validation rules
 */
const validationRules = {
  // ID validation
  id: param('id').isUUID().withMessage('Invalid ID format'),
  
  // Report validation
  // Report validation
  reportExport: [
    body('reportType').isString().notEmpty().withMessage('Report type is required'),
    body('format').isString().notEmpty().isIn(['pdf', 'csv', 'excel']).withMessage('Valid format is required (pdf, csv, excel)'),
    body('projectId')
      .optional()
      .isUUID().withMessage('Valid project ID is required for comprehensive reports')
      .custom((value, { req }) => {
        if (req.body.reportType === 'comprehensive' && !value) {
          throw new Error('Project ID is required for comprehensive reports');
        }
        return true;
      })
  ],
  
  // Project validation
  projectCreate: [
    body('name').isString().notEmpty().withMessage('Project name is required'),
    body('clientId').isUUID().withMessage('Valid client ID is required'),
    body('totalBudget').isNumeric().withMessage('Budget must be a number')
  ],
  
  // Expense validation
  expenseCreate: [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('description').isString().notEmpty().withMessage('Description is required'),
    body('category').isString().notEmpty().withMessage('Category is required')
  ]
};

module.exports = {
  validateRequest,
  validationRules
};