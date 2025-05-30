const express = require('express');
const router = express.Router();
const { param, body, query, validationResult } = require('express-validator');
const sprintController = require('../controllers/sprint.controller');
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

// ====================
// Sprint-centric routes
// ====================

// @route   GET /api/sprints/:id
// @desc    Get a sprint by ID
// @access  Private
router.get('/sprints/:id', [
  param('id').isUUID(),
  validateRequest
], sprintController.getSprintById);

// @route   POST /api/sprints
// @desc    Create a new sprint
// @access  Private (Admin, Product Owner, Scrum Master)
router.post('/sprints', [
  body('boardId').isUUID(),
  body('name').isString().notEmpty().isLength({ min: 2, max: 100 }),
  body('goal').optional().isString(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('ownerId').optional().isUUID(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), sprintController.createSprint);

// @route   PUT /api/sprints/:id
// @desc    Update a sprint
// @access  Private (Admin, Product Owner, Scrum Master)
router.put('/sprints/:id', [
  param('id').isUUID(),
  body('name').optional().isString().isLength({ min: 2, max: 100 }),
  body('goal').optional().isString(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('status').optional().isIn(['Planning', 'Active', 'Completed', 'Cancelled']),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), sprintController.updateSprint);

// @route   DELETE /api/sprints/:id
// @desc    Delete a sprint
// @access  Private (Admin, Product Owner, Scrum Master)
router.delete('/sprints/:id', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), sprintController.deleteSprint);

// @route   POST /api/sprints/:id/start
// @desc    Start a sprint
// @access  Private (Admin, Product Owner, Scrum Master)
router.post('/sprints/:id/start', [
  param('id').isUUID(),
  body('goal').isString().notEmpty(),
  body('endDate').isISO8601(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), sprintController.startSprint);

// @route   POST /api/sprints/:id/complete
// @desc    Complete a sprint
// @access  Private (Admin, Product Owner, Scrum Master)
router.post('/sprints/:id/complete', [
  param('id').isUUID(),
  body('moveUnfinishedToBacklog').optional().isBoolean(),
  body('retrospectiveNotes').optional().isString(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), sprintController.completeSprint);

// @route   POST /api/sprints/:id/cancel
// @desc    Cancel a sprint
// @access  Private (Admin, Product Owner, Scrum Master)
router.post('/sprints/:id/cancel', [
  param('id').isUUID(),
  body('moveUnfinishedToBacklog').optional().isBoolean(),
  body('reason').optional().isString(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), sprintController.cancelSprint);

// @route   POST /api/sprints/:id/stories
// @desc    Add stories to a sprint
// @access  Private (Admin, Product Owner, Scrum Master)
router.post('/sprints/:id/stories', [
  param('id').isUUID(),
  body('storyIds').isArray().notEmpty(),
  body('storyIds.*').isUUID(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), sprintController.addStoriesToSprint);

// @route   DELETE /api/sprints/:id/stories
// @desc    Remove stories from a sprint
// @access  Private (Admin, Product Owner, Scrum Master)
router.delete('/sprints/:id/stories', [
  param('id').isUUID(),
  body('storyIds').isArray().notEmpty(),
  body('storyIds.*').isUUID(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), sprintController.removeStoriesFromSprint);

// ====================
// Project and Board related sprint routes
// ====================

// @route   GET /api/projects/:projectId/sprints
// @desc    Get all sprints for a project (across all boards)
// @access  Private
router.get('/projects/:projectId/sprints', [
  param('projectId').isUUID(),
  query('status').optional().isIn(['Planning', 'Active', 'Completed', 'Cancelled']),
  validateRequest
], sprintController.getProjectSprints);

// @route   GET /api/boards/:boardId/sprints
// @desc    Get all sprints for a specific board
// @access  Private
router.get('/boards/:boardId/sprints', [
  param('boardId').isUUID(),
  query('status').optional().isIn(['Planning', 'Active', 'Completed', 'Cancelled']),
  validateRequest
], sprintController.getBoardSprints);

// @route   GET /api/boards/:boardId/backlog
// @desc    Get all stories not assigned to a sprint for this board
// @access  Private
router.get('/boards/:boardId/backlog', [
  param('boardId').isUUID(),
  validateRequest
], sprintController.getBoardBacklog);

// @route   POST /api/projects/:projectId/boards/:boardId/sprints
// @desc    Create a new sprint for a specific board in a project
// @access  Private (Admin, Product Owner, Scrum Master)
router.post('/projects/:projectId/boards/:boardId/sprints', [
  param('projectId').isUUID(),
  param('boardId').isUUID(),
  body('name').isString().notEmpty().isLength({ min: 2, max: 100 }),
  body('goal').optional().isString(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('status').optional().isIn(['Planning', 'Active', 'Completed', 'Cancelled']),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), sprintController.createSprint);

// @route   PUT /api/projects/:projectId/boards/:boardId/sprints/:sprintId
// @desc    Update a sprint for a specific board in a project
// @access  Private (Admin, Product Owner, Scrum Master)
router.put('/projects/:projectId/boards/:boardId/sprints/:sprintId', [
  param('projectId').isUUID(),
  param('boardId').isUUID(),
  param('sprintId').isUUID(),
  body('name').optional().isString().isLength({ min: 2, max: 100 }),
  body('goal').optional().isString(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('status').optional().isIn(['Planning', 'Active', 'Completed', 'Cancelled']),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), 
// Add middleware to map sprintId to id
(req, res, next) => {
  req.params.id = req.params.sprintId;
  next();
},
sprintController.updateSprint);

// @route   POST /api/projects/:projectId/boards/:boardId/sprints/:sprintId/complete
// @desc    Complete a sprint for a specific board in a project
// @access  Private (Admin, Product Owner, Scrum Master)
router.post('/projects/:projectId/boards/:boardId/sprints/:sprintId/complete', [
  param('projectId').isUUID(),
  param('boardId').isUUID(),
  param('sprintId').isUUID(),
  body('moveUnfinishedToBacklog').optional().isBoolean(),
  body('retrospectiveNotes').optional().isString(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), 
// Add middleware to map sprintId to id
(req, res, next) => {
  req.params.id = req.params.sprintId;
  next();
},
sprintController.completeSprint);

// @route   POST /api/projects/:projectId/boards/:boardId/sprints/:sprintId/cancel
// @desc    Cancel a sprint for a specific board in a project
// @access  Private (Admin, Product Owner, Scrum Master)
router.post('/projects/:projectId/boards/:boardId/sprints/:sprintId/cancel', [
  param('projectId').isUUID(),
  param('boardId').isUUID(),
  param('sprintId').isUUID(),
  body('moveUnfinishedToBacklog').optional().isBoolean(),
  body('reason').optional().isString(),
  validateRequest
], authorize(['Admin', 'Product Owner', 'Scrum Master']), 
// Add middleware to map sprintId to id
(req, res, next) => {
  req.params.id = req.params.sprintId;
  next();
},
sprintController.cancelSprint);

module.exports = router; 