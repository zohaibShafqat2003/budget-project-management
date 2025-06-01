const express = require('express');
const router = express.Router();
const { param, body, query, validationResult } = require('express-validator');
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

// @route   GET /api/epics/:epicId/stories
// @desc    Get all stories for an epic
// @access  Private
router.get('/epics/:epicId/stories', [
  param('epicId').isUUID(),
  query('status').optional().isIn(['To Do', 'In Progress', 'Review', 'Done']),
  query('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  query('isReady').optional().isBoolean(),
  query('labelId').optional().isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer', 'Tester']), storyController.getEpicStories);

// @route   GET /api/projects/:projectId/stories
// @desc    Get all stories for a project
// @access  Private
router.get('/projects/:projectId/stories', [
  param('projectId').isUUID(),
  query('status').optional().isIn(['To Do', 'In Progress', 'Review', 'Done']),
  query('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  query('isReady').optional().isBoolean(),
  query('epicId').optional().isUUID(),
  query('sprintId').optional().custom(value => {
    // Accept either a valid UUID or the special value 'backlog'
    if (value === 'backlog') return true;
    
    // If not 'backlog', must be a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('sprintId must be a valid UUID or the string "backlog"');
    }
    return true;
  }),
  query('labelId').optional().isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer', 'Tester']), storyController.getProjectStories);

// @route   GET /api/stories/:id
// @desc    Get a story by ID
// @access  Private
router.get('/stories/:id', [
  param('id').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer', 'Tester']), storyController.getStoryById);

// Original route kept for compatibility
router.get('/:id', [
  param('id').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer', 'Tester']), storyController.getStoryById);

// @route   POST /api/stories
// @desc    Create a new story
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.post('/', [
  body('projectId').optional().isUUID(),
  body('epicId').optional().isUUID(),
  body('assigneeId').optional().isUUID(),
  body('reporterId').optional().isUUID(),
  body('title').notEmpty().isString().trim().isLength({ min: 2, max: 255 }),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Review', 'Done']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('points').optional().isInt({ min: 0 }),
  body('acceptanceCriteria').optional().isString().trim(),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('businessValue').optional().isInt({ min: 0, max: 100 }),
  body('labelIds').optional().isArray(),
  body('labelIds.*').optional().isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), storyController.createStory);

// @route   PUT /api/stories/:id
// @desc    Update a story
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.put('/stories/:id', [
  param('id').isUUID(),
  body('epicId').optional().isUUID(),
  body('assigneeId').optional().isUUID(),
  body('reporterId').optional().isUUID(),
  body('title').optional().isString().trim().isLength({ min: 2, max: 255 }),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Review', 'Done']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('points').optional().isInt({ min: 0 }),
  body('acceptanceCriteria').optional().isString().trim(),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('businessValue').optional().isInt({ min: 0, max: 100 }),
  body('labelIds').optional().isArray(),
  body('labelIds.*').optional().isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), storyController.updateStory);

// Original route kept for compatibility
router.put('/:id', [
  param('id').isUUID(),
  body('epicId').optional().isUUID(),
  body('assigneeId').optional().isUUID(),
  body('reporterId').optional().isUUID(),
  body('title').optional().isString().trim().isLength({ min: 2, max: 255 }),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Review', 'Done']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('points').optional().isInt({ min: 0 }),
  body('acceptanceCriteria').optional().isString().trim(),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('businessValue').optional().isInt({ min: 0, max: 100 }),
  body('labelIds').optional().isArray(),
  body('labelIds.*').optional().isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), storyController.updateStory);

// @route   DELETE /api/stories/:id
// @desc    Delete a story
// @access  Private (Admin, Product Owner)
router.delete('/stories/:id', [
  param('id').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner']), storyController.deleteStory);

// Original route kept for compatibility
router.delete('/:id', [
  param('id').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner']), storyController.deleteStory);

// @route   PUT /api/stories/:id/ready
// @desc    Mark story as ready/not ready
// @access  Private (Admin, Product Owner, Scrum Master)
router.put('/stories/:id/ready', [
  param('id').isUUID(),
  body('isReady').isBoolean(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), storyController.toggleReadyStatus);

// Original route kept for compatibility
router.put('/:id/ready', [
  param('id').isUUID(),
  body('isReady').isBoolean(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), storyController.toggleReadyStatus);

// @route   PUT /api/stories/:id/sprint
// @desc    Assign story to sprint
// @access  Private (Admin, Product Owner, Scrum Master)
router.put('/stories/:id/sprint', [
  param('id').isUUID(),
  body('sprintId').optional({ nullable: true }).isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), storyController.assignToSprint);

// Original route kept for compatibility
router.put('/:id/sprint', [
  param('id').isUUID(),
  body('sprintId').optional({ nullable: true }).isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), storyController.assignToSprint);

// @route   POST /api/stories/:id/labels
// @desc    Add labels to a story
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.post('/:id/labels', [
  param('id').isUUID(),
  body('labelIds').isArray().notEmpty(),
  body('labelIds.*').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), storyController.addLabelsToStory);

// @route   DELETE /api/stories/:id/labels
// @desc    Remove labels from a story
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.delete('/:id/labels', [
  param('id').isUUID(),
  body('labelIds').isArray().notEmpty(),
  body('labelIds.*').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), storyController.removeLabelsFromStory);

// @route   POST /api/projects/:projectId/stories
// @desc    Create a new story for a specific project
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.post('/projects/:projectId/stories', [
  param('projectId').isUUID(),
  body('title').notEmpty().isString().trim().isLength({ min: 2, max: 255 }),
  body('description').optional().isString().trim(),
  body('epicId').optional().isUUID(),
  body('assigneeId').optional().isUUID(),
  body('reporterId').optional().isUUID(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Review', 'Done']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('points').optional().isInt({ min: 0 }),
  body('acceptanceCriteria').optional().isString().trim(),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('businessValue').optional().isInt({ min: 0, max: 100 }),
  body('labelIds').optional().isArray(),
  body('labelIds.*').optional().isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), storyController.createStory);

// @route   POST /api/epics/:epicId/stories
// @desc    Create a new story for a specific epic
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.post('/epics/:epicId/stories', [
  param('epicId').isUUID(),
  body('title').notEmpty().isString().trim().isLength({ min: 2, max: 255 }),
  body('description').optional().isString().trim(),
  body('assigneeId').optional().isUUID(),
  body('reporterId').optional().isUUID(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Review', 'Done']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('points').optional().isInt({ min: 0 }),
  body('acceptanceCriteria').optional().isString().trim(),
  body('startDate').optional().isISO8601(),
  
  body('dueDate').optional().isISO8601(),
  body('businessValue').optional().isInt({ min: 0, max: 100 }),
  body('labelIds').optional().isArray(),
  body('labelIds.*').optional().isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), storyController.createStory);

// @route   PUT /api/projects/:projectId/stories/:storyId
// @desc    Update a story within a project
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.put('/projects/:projectId/stories/:storyId', [
  param('projectId').isUUID(),
  param('storyId').isUUID(),
  body('epicId').optional().isUUID(),
  body('assigneeId').optional().isUUID(),
  body('reporterId').optional().isUUID(),
  body('title').optional().isString().trim().isLength({ min: 2, max: 255 }),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Review', 'Done']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('points').optional().isInt({ min: 0 }),
  body('acceptanceCriteria').optional().isString().trim(),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('businessValue').optional().isInt({ min: 0, max: 100 }),
  body('labelIds').optional().isArray(),
  body('labelIds.*').optional().isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']),
// Add middleware to map storyId to id
(req, res, next) => {
  req.params.id = req.params.storyId;
  next();
},
storyController.updateStory);

// @route   PUT /api/projects/:projectId/stories/:storyId/ready
// @desc    Mark story as ready/not ready within a project
// @access  Private (Admin, Product Owner, Scrum Master)
router.put('/projects/:projectId/stories/:storyId/ready', [
  param('projectId').isUUID(),
  param('storyId').isUUID(),
  body('isReady').isBoolean(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']),
// Add middleware to map storyId to id
(req, res, next) => {
  req.params.id = req.params.storyId;
  next();
},
storyController.toggleReadyStatus);

// @route   PUT /api/projects/:projectId/stories/:storyId/sprint
// @desc    Assign story to sprint within a project
// @access  Private (Admin, Product Owner, Scrum Master)
router.put('/projects/:projectId/stories/:storyId/sprint', [
  param('projectId').isUUID(),
  param('storyId').isUUID(),
  body('sprintId').optional({ nullable: true }).isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']),
// Add middleware to map storyId to id
(req, res, next) => {
  req.params.id = req.params.storyId;
  next();
},
storyController.assignToSprint);

module.exports = router; 