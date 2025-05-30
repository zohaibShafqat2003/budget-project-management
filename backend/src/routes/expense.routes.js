const express = require('express');
const router = express.Router();
const { param, body, query, validationResult } = require('express-validator');
const expenseController = require('../controllers/expense.controller');
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

// @route   GET /api/projects/:projectId/expenses
// @desc    Get all expenses for a project
// @access  Private
router.get('/projects/:projectId/expenses', [
  param('projectId').isUUID(),
  query('category').optional().isString(),
  query('paymentStatus').optional().isIn(['Pending', 'Paid', 'Rejected']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  validateRequest
], expenseController.getProjectExpenses);

// @route   POST /api/projects/:projectId/expenses
// @desc    Create a new expense
// @access  Private (Admin, Product Owner, Scrum Master)
router.post('/projects/:projectId/expenses', [
  param('projectId').isUUID(),
  body('amount').isNumeric({ min: 0 }),
  body('description').isString().notEmpty(),
  body('category').isString().notEmpty(),
  body('budgetItemId').optional().isUUID(),
  body('date').optional().isISO8601(),
  body('paymentMethod').optional().isString(),
  body('receiptUrl').optional().isURL(),
  body('notes').optional().isString(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), expenseController.createExpense);

// @route   GET /api/expenses/:id
// @desc    Get an expense by ID
// @access  Private
router.get('/expenses/:id', [
  param('id').isUUID(),
  validateRequest
], expenseController.getExpenseById);

// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private (Admin, Product Owner)
router.put('/expenses/:id', [
  param('id').isUUID(),
  body('amount').optional().isNumeric({ min: 0 }),
  body('description').optional().isString().notEmpty(),
  body('category').optional().isString().notEmpty(),
  body('budgetItemId').optional().isUUID(),
  body('date').optional().isISO8601(),
  body('paymentMethod').optional().isString(),
  body('receiptUrl').optional().isURL(),
  body('notes').optional().isString(),
  validateRequest
], authorize(['Admin', 'Product Owner']), expenseController.updateExpense);

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private (Admin)
router.delete('/expenses/:id', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin']), expenseController.deleteExpense);

// @route   POST /api/expenses/:id/approve
// @desc    Approve an expense
// @access  Private (Admin, Product Owner, Scrum Master)
router.post('/expenses/:id/approve', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), expenseController.approveExpense);

// @route   POST /api/expenses/:id/reject
// @desc    Reject an expense
// @access  Private (Admin, Product Owner, Scrum Master)
router.post('/expenses/:id/reject', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), expenseController.rejectExpense);

module.exports = router;