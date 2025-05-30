const express = require('express');
const router = express.Router();
const { param, body, query, validationResult } = require('express-validator');
const taskController = require('../controllers/task.controller');
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

// @route   GET /api/tasks
// @desc    Get all tasks with filtering
// @access  Private
router.get('/tasks', [
  query('projectId').optional().isUUID(),
  query('storyId').optional().isUUID(),
  query('assigneeId').optional().isUUID(),
  query('status').optional().isIn(['Created', 'To Do', 'In Progress', 'Review', 'Done', 'Closed']),
  query('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  query('type').optional().isIn(['Task', 'Bug', 'Improvement', 'Subtask']),
  query('labelId').optional().isUUID(),
  query('sprintId').optional().isUUID(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validateRequest
], authenticateToken, taskController.getAllTasks);

// @route   GET /api/tasks/:id
// @desc    Get a task by ID
// @access  Private
router.get('/tasks/:id', [
  param('id').isUUID(),
  validateRequest
], authenticateToken, taskController.getTaskById);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.post('/tasks', [
  body('projectId').optional().isUUID(),
  body('storyId').optional().isUUID(),
  body('assigneeId').optional().isUUID(),
  body('reporterId').optional().isUUID(),
  body('title').notEmpty().isString().trim().isLength({ min: 2, max: 255 }),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['Created', 'To Do', 'In Progress', 'Review', 'Done', 'Closed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('estimatedHours').optional().isFloat({ min: 0 }),
  body('actualHours').optional().isFloat({ min: 0 }),
  body('type').optional().isIn(['Task', 'Bug', 'Improvement', 'Subtask']),
  body('labelIds').optional().isArray(),
  body('dependencies').optional().isArray(),
  body('dependencies.*.targetTaskId').optional().isUUID(),
  body('dependencies.*.type').optional().isIn(['blocks', 'is-blocked-by', 'relates-to', 'duplicates', 'is-duplicated-by']),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), taskController.createTask);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.put('/tasks/:id', [
  param('id').isUUID(),
  body('projectId').optional().isUUID(),
  body('storyId').optional().isUUID(),
  body('assigneeId').optional().isUUID(),
  body('reporterId').optional().isUUID(),
  body('title').optional().isString().trim().isLength({ min: 2, max: 255 }),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['Created', 'To Do', 'In Progress', 'Review', 'Done', 'Closed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('estimatedHours').optional().isFloat({ min: 0 }),
  body('actualHours').optional().isFloat({ min: 0 }),
  body('type').optional().isIn(['Task', 'Bug', 'Improvement', 'Subtask']),
  body('labelIds').optional().isArray(),
  body('dependencies').optional().isArray(),
  body('dependencies.*.targetTaskId').optional().isUUID(),
  body('dependencies.*.type').optional().isIn(['blocks', 'is-blocked-by', 'relates-to', 'duplicates', 'is-duplicated-by']),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), taskController.updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private (Admin, Product Owner, Scrum Master)
router.delete('/tasks/:id', [
  param('id').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master']), taskController.deleteTask);

// Tasks and Labels routes
// @route   POST /api/tasks/:id/labels
// @desc    Add labels to task
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.post('/tasks/:id/labels', [
  param('id').isUUID(),
  body('labelIds').isArray().notEmpty(),
  body('labelIds.*').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), taskController.addLabelsToTask);

// @route   DELETE /api/tasks/:id/labels
// @desc    Remove labels from task
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.delete('/tasks/:id/labels', [
  param('id').isUUID(),
  body('labelIds').isArray().notEmpty(),
  body('labelIds.*').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), taskController.removeLabelsFromTask);

// Tasks and Assignment routes
// @route   PUT /api/tasks/:id/assign
// @desc    Assign task to user
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.put('/tasks/:id/assign', [
  param('id').isUUID(),
  body('assigneeId').optional().isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), taskController.assignTask);

// Task Dependencies routes
// @route   POST /api/tasks/dependencies
// @desc    Add dependency between tasks
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.post('/tasks/dependencies', [
  body('sourceTaskId').isUUID(),
  body('targetTaskId').isUUID(),
  body('type').optional().isIn(['blocks', 'is-blocked-by', 'relates-to', 'duplicates', 'is-duplicated-by']),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), taskController.addDependency);

// @route   DELETE /api/tasks/dependencies/:id
// @desc    Remove dependency
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.delete('/tasks/dependencies/:id', [
  param('id').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), taskController.removeDependency);

// @route   DELETE /api/tasks/:id/purge
// @desc    Permanently delete a task
// @access  Private (Admin only)
router.delete('/tasks/:id/purge', [
  param('id').isUUID(),
  validateRequest
], authenticateToken, authorize(['Admin']), taskController.purgeTask);

// @route   POST /api/projects/:projectId/tasks
// @desc    Create a new task for a specific project
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.post('/projects/:projectId/tasks', [
  param('projectId').isUUID(),
  body('storyId').optional().isUUID(),
  body('assigneeId').optional().isUUID(),
  body('reporterId').optional().isUUID(),
  body('title').notEmpty().isString().trim().isLength({ min: 2, max: 255 }),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['Created', 'To Do', 'In Progress', 'Review', 'Done', 'Closed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('estimatedHours').optional().isFloat({ min: 0 }),
  body('actualHours').optional().isFloat({ min: 0 }),
  body('type').optional().isIn(['Task', 'Bug', 'Improvement', 'Subtask']),
  body('labelIds').optional().isArray(),
  body('dependencies').optional().isArray(),
  body('dependencies.*.targetTaskId').optional().isUUID(),
  body('dependencies.*.type').optional().isIn(['blocks', 'is-blocked-by', 'relates-to', 'duplicates', 'is-duplicated-by']),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), taskController.createTask);

// @route   POST /api/stories/:storyId/tasks
// @desc    Create a new task for a specific story
// @access  Private (Admin, Product Owner, Scrum Master, Developer)
router.post('/stories/:storyId/tasks', [
  param('storyId').isUUID(),
  body('assigneeId').optional().isUUID(),
  body('reporterId').optional().isUUID(),
  body('title').notEmpty().isString().trim().isLength({ min: 2, max: 255 }),
  body('description').optional().isString().trim(),
  body('status').optional().isIn(['Created', 'To Do', 'In Progress', 'Review', 'Done', 'Closed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('estimatedHours').optional().isFloat({ min: 0 }),
  body('actualHours').optional().isFloat({ min: 0 }),
  body('type').optional().isIn(['Task', 'Bug', 'Improvement', 'Subtask']),
  body('labelIds').optional().isArray(),
  body('dependencies').optional().isArray(),
  body('dependencies.*.targetTaskId').optional().isUUID(),
  body('dependencies.*.type').optional().isIn(['blocks', 'is-blocked-by', 'relates-to', 'duplicates', 'is-duplicated-by']),
  validateRequest
], authenticateToken, authorize(['Admin', 'Product Owner', 'Scrum Master', 'Developer']), taskController.createTask);

module.exports = router; 