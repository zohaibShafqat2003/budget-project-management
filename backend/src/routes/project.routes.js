const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const projectController = require('../controllers/project.controller');
const { authenticateToken, isAdmin, authorize } = require('../middleware/auth.middleware');

// Create more specific role middleware
const isProductOwner = authorize(['Admin', 'Product Owner']);
const isScrumMaster = authorize(['Admin', 'Product Owner', 'Scrum Master']);

// Apply authentication to all routes in this router
router.use(authenticateToken);

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

// @route   GET /api/projects
// @desc    Get all projects with filtering
// @access  Private
router.get('/', [
  query('projectIdStr').optional().isString(),
  query('name').optional().isString(),
  query('status').optional().isIn(['Not Started', 'Active', 'In Progress', 'Review', 'Completed', 'Archived', 'On Hold']),
  query('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  query('startDate').optional().isDate(),
  query('completionDate').optional().isDate(),
  validateRequest
], projectController.getAllProjects);

// @route   GET /api/projects/:id
// @desc    Get a project by ID
// @access  Private
router.get('/:id', [
  param('id').isUUID(),
  validateRequest
], projectController.getProjectById);

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (Admin, Product Owner)
router.post('/', [
  body('name').isString().isLength({ min: 2, max: 100 }).notEmpty(),
  body('clientId').optional().isUUID(),
  body('type').optional().isIn(['Scrum', 'Kanban']),
  body('status').optional().isIn(['Not Started', 'Active', 'In Progress', 'Review', 'Completed', 'Archived', 'On Hold']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('totalBudget').optional().isNumeric(),
  body('startDate').optional().isISO8601(),
  validateRequest
], isProductOwner, projectController.createProject);

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private (Admin, Product Owner)
router.put('/:id', [
  param('id').isUUID(),
  body('name').optional().isString().isLength({ min: 2, max: 100 }),
  body('clientId').optional().isUUID(),
  body('type').optional().isIn(['Scrum', 'Kanban']),
  body('status').optional().isIn(['Not Started', 'Active', 'In Progress', 'Review', 'Completed', 'Archived', 'On Hold']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('totalBudget').optional().isNumeric(),
  body('startDate').optional().isISO8601(),
  body('completionDate').optional().isISO8601(),
  validateRequest
], isProductOwner, projectController.updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private (Admin, Product Owner)
router.delete('/:id', [
  param('id').isUUID(),
  validateRequest
], isProductOwner, projectController.deleteProject);

// @route   POST /api/projects/:id/team
// @desc    Add team members to a project
// @access  Private (Admin, Product Owner)
router.post('/:id/team', [
  param('id').isUUID(),
  body('userIds').isArray().notEmpty(),
  body('userIds.*').isUUID(),
  validateRequest
], isProductOwner, projectController.addTeamMembers);

// @route   DELETE /api/projects/:id/team
// @desc    Remove team members from a project
// @access  Private (Admin, Product Owner)
router.delete('/:id/team', [
  param('id').isUUID(),
  body('userIds').isArray().notEmpty(),
  body('userIds.*').isUUID(),
  validateRequest
], isProductOwner, projectController.removeTeamMembers);

module.exports = router; 