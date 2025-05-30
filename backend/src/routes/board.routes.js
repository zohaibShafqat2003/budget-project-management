const express = require('express');
const router = express.Router();
const { param, body, validationResult } = require('express-validator');
const boardController = require('../controllers/board.controller');
const sprintController = require('../controllers/sprint.controller');
const { authorize } = require('../middleware/auth.middleware');
const { Board } = require('../models');

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
// Board-centric routes with direct paths for API client
// ====================

// @route   GET /api/boards/:id
// @desc    Get a board by ID
// @access  Private
router.get('/boards/:id', [
  param('id').isUUID(),
  validateRequest
], boardController.getBoardById);

// Original route kept for compatibility
router.get('/:id', [
  param('id').isUUID(),
  validateRequest
], boardController.getBoardById);

// @route   PUT /api/boards/:id
// @desc    Update a board
// @access  Private (Admin, Product Owner)
router.put('/boards/:id', [
  param('id').isUUID(),
  body('name').optional().isString().isLength({ min: 2, max: 100 }),
  body('filterJQL').optional().isString(),
  validateRequest
], authorize(['Admin', 'Product Owner']), boardController.updateBoard);

// Original route kept for compatibility
router.put('/:id', [
  param('id').isUUID(),
  body('name').optional().isString().isLength({ min: 2, max: 100 }),
  body('filterJQL').optional().isString(),
  validateRequest
], authorize(['Admin', 'Product Owner']), boardController.updateBoard);

// @route   DELETE /api/boards/:id
// @desc    Delete a board
// @access  Private (Admin, Product Owner)
router.delete('/boards/:id', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin', 'Product Owner']), boardController.deleteBoard);

// Original route kept for compatibility
router.delete('/:id', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin', 'Product Owner']), boardController.deleteBoard);

// @route   POST /api/boards/:id/archive
// @desc    Archive a board
// @access  Private (Admin, Product Owner)
router.post('/boards/:id/archive', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin', 'Product Owner']), async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) {
      return res.status(404).json({ 
        success: false, 
        message: 'Board not found' 
      });
    }
    await board.update({ archived: true });
    return res.status(200).json({ 
      success: true, 
      data: board 
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/boards/:id/unarchive
// @desc    Unarchive a board
// @access  Private (Admin, Product Owner)
router.post('/boards/:id/unarchive', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin', 'Product Owner']), async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) {
      return res.status(404).json({ 
        success: false, 
        message: 'Board not found' 
      });
    }
    await board.update({ archived: false });
    return res.status(200).json({ 
      success: true, 
      data: board 
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/boards/:boardId/backlog
// @desc    Get backlog for a board
// @access  Private
router.get('/boards/:boardId/backlog', [
  param('boardId').isUUID(),
  validateRequest
], sprintController.getBoardBacklog);

// ====================
// Project-related board routes
// ====================

// @route   GET /api/projects/:projectId/boards
// @desc    Get all boards for a project
// @access  Private
router.get('/projects/:projectId/boards', [
  param('projectId').isUUID(),
  validateRequest
], boardController.getProjectBoards);

// @route   POST /api/projects/:projectId/boards
// @desc    Create a new board for a project
// @access  Private (Admin, Product Owner)
router.post('/projects/:projectId/boards', [
  param('projectId').isUUID(),
  body('name').isString().notEmpty().isLength({ min: 2, max: 100 }),
  body('filterJQL').optional().isString(),
  validateRequest
], authorize(['Admin', 'Product Owner']), boardController.createBoard);

// @route   PUT /api/projects/:projectId/boards/:boardId
// @desc    Update a board within a project
// @access  Private (Admin, Product Owner)
router.put('/projects/:projectId/boards/:boardId', [
  param('projectId').isUUID(),
  param('boardId').isUUID(),
  body('name').optional().isString().isLength({ min: 2, max: 100 }),
  body('filterJQL').optional().isString(),
  validateRequest
], authorize(['Admin', 'Product Owner']), 
// Add middleware to map boardId to id
(req, res, next) => {
  req.params.id = req.params.boardId;
  next();
},
boardController.updateBoard);

module.exports = router; 