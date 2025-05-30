const express = require('express');
const router = express.Router();
const { param, body, query, validationResult } = require('express-validator');
const budgetController = require('../controllers/budget.controller');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/projects/:projectId/budgets
// @desc    Get all budget items for a project
// @access  Private
router.get('/projects/:projectId/budgets', [
  param('projectId').isUUID(),
  query('category').optional().isString(),
  query('status').optional().isIn(['Active', 'Completed', 'On Hold', 'Cancelled']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  validateRequest
], budgetController.getProjectBudgetItems);

// @route   POST /api/projects/:projectId/budgets
// @desc    Create a new budget item
// @access  Private (Admin, Product Owner)
router.post('/projects/:projectId/budgets', [
  param('projectId').isUUID(),
  body('name').isString().notEmpty().isLength({ min: 2, max: 100 }),
  body('category').isString().notEmpty(),
  body('amount').isNumeric({ min: 0 }),
  body('status').optional().isIn(['Active', 'Completed', 'On Hold', 'Cancelled']),
  body('priority').optional().isIn(['Low', 'Medium', 'High']),
  body('description').optional().isString(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  validateRequest
], authorize(['Admin', 'Product Owner']), budgetController.createBudgetItem);

// @route   GET /api/projects/:projectId/budgets/summary
// @desc    Get budget summary for a project
// @access  Private
router.get('/projects/:projectId/budgets/summary', [
  param('projectId').isUUID(),
  validateRequest
], budgetController.getProjectBudgetSummary);

// @route   GET /api/budgets/:id
// @desc    Get a budget item by ID
// @access  Private
router.get('/budgets/:id', [
  param('id').isUUID(),
  validateRequest
], budgetController.getBudgetItemById);

// @route   PUT /api/budgets/:id
// @desc    Update a budget item
// @access  Private (Admin, Product Owner)
router.put('/budgets/:id', [
  param('id').isUUID(),
  body('name').optional().isString().isLength({ min: 2, max: 100 }),
  body('category').optional().isString(),
  body('amount').optional().isNumeric({ min: 0 }),
  body('status').optional().isIn(['Active', 'Completed', 'On Hold', 'Cancelled']),
  body('priority').optional().isIn(['Low', 'Medium', 'High']),
  body('description').optional().isString(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  validateRequest
], authorize(['Admin', 'Product Owner']), budgetController.updateBudgetItem);

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget item
// @access  Private (Admin)
router.delete('/budgets/:id', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin']), budgetController.deleteBudgetItem);

module.exports = router; 