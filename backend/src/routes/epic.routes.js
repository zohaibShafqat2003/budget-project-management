const express = require('express');
const router = express.Router();
const { param, body, query, validationResult } = require('express-validator');
const epicController = require('../controllers/epic.controller');
const storyController = require('../controllers/story.controller');
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

// Project-scoped epic routes
// @route   GET /api/projects/:projectId/epics
// @desc    Get all epics for a project
// @access  Private
router.get('/projects/:projectId/epics', [
  param('projectId').isUUID(),
  query('status').optional().isIn(['To Do', 'In Progress', 'Done']),
  query('labelId').optional().isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer', 'Tester']), epicController.getProjectEpics);

// @route   POST /api/projects/:projectId/epics
// @desc    Create a new epic for a specific project
// @access  Private (Product Owner, Scrum Master)
router.post('/projects/:projectId/epics', [
  param('projectId').isUUID(),
  body('name').notEmpty().isString().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Done']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('order').optional().isInt({ min: 0 }),
  body('labelIds').optional().isArray(),
  body('labelIds.*').optional().isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), epicController.createEpic);

// @route   PUT /api/projects/:projectId/epics/reorder
// @desc    Reorder epics
// @access  Private (Product Owner, Scrum Master)
router.put('/projects/:projectId/epics/reorder', [
  param('projectId').isUUID(),
  body('epicOrders').isArray().notEmpty(),
  body('epicOrders.*.id').isUUID(),
  body('epicOrders.*.order').isInt({ min: 0 }),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), epicController.reorderEpics);

// Epic-specific routes
// @route   GET /api/epics/:id
// @desc    Get an epic by ID
// @access  Private
router.get('/epics/:id', [
  param('id').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer', 'Tester']), epicController.getEpicById);

// @route   POST /api/epics
// @desc    Create a new epic
// @access  Private (Product Owner, Scrum Master)
router.post('/epics', [
  body('projectId').isUUID(),
  body('name').notEmpty().isString().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Done']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('order').optional().isInt({ min: 0 }),
  body('labelIds').optional().isArray(),
  body('labelIds.*').optional().isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), epicController.createEpic);

// @route   PUT /api/epics/:id
// @desc    Update an epic
// @access  Private (Product Owner, Scrum Master)
router.put('/epics/:id', [
  param('id').isUUID(),
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Done']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('labelIds').optional().isArray(),
  body('labelIds.*').optional().isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), epicController.updateEpic);

// @route   DELETE /api/epics/:id
// @desc    Delete an epic
// @access  Private (Product Owner)
router.delete('/epics/:id', [
  param('id').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner']), epicController.deleteEpic);

// @route   DELETE /api/epics/:id/purge
// @desc    Permanently delete an epic (no recovery)
// @access  Private (Admin, Product Owner)
router.delete('/epics/:id/purge', [
  param('id').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner']), epicController.purgeEpic);

// @route   POST /api/epics/:id/labels
// @desc    Add labels to an epic
// @access  Private (Product Owner, Scrum Master)
router.post('/epics/:id/labels', [
  param('id').isUUID(),
  body('labelIds').isArray().notEmpty(),
  body('labelIds.*').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), epicController.addLabelsToEpic);

// @route   DELETE /api/epics/:id/labels
// @desc    Remove labels from an epic
// @access  Private (Product Owner, Scrum Master)
router.delete('/epics/:id/labels', [
  param('id').isUUID(),
  body('labelIds').isArray().notEmpty(),
  body('labelIds.*').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), epicController.removeLabelsFromEpic);

// @route   PUT /api/epics/:epicId/stories/reorder
// @desc    Reorder stories within an epic
// @access  Private (Admin, Product Owner, Scrum Master)
router.put('/epics/:epicId/stories/reorder', [
  param('epicId').isUUID(),
  body('storyOrders').isArray().notEmpty(),
  body('storyOrders.*.id').isUUID(),
  body('storyOrders.*.order').isInt({ min: 0 }),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), storyController.reorderStories);

module.exports = router; 