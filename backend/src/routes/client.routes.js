const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const clientController = require('../controllers/client.controller');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');

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

// @route   GET /api/clients
// @desc    Get all clients with filtering and pagination
// @access  Private (Admin, Product Owner)
router.get('/', [
  query('includeInactive').optional().isBoolean().toBoolean(),
  query('name').optional().isString().trim(),
  query('industry').optional().isString().trim(),
  query('country').optional().isString().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
  validateRequest
], authorize(['Admin', 'Product Owner']), clientController.getAllClients);

// @route   GET /api/clients/:id
// @desc    Get a client by ID
// @access  Private (Admin, Product Owner)
router.get('/:id', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin', 'Product Owner']), clientController.getClientById);

// @route   POST /api/clients
// @desc    Create a new client
// @access  Private (Admin)
router.post('/', [
  body('name').notEmpty().isString().trim().withMessage('Name is required'),
  body('email').optional().isEmail().trim().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isString().trim(),
  body('country').optional().isString().trim(),
  body('city').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('contactPerson').optional().isString().trim(),
  body('industry').optional().isString().trim(),
  body('website').optional().isURL().trim().withMessage('Valid URL is required'),
  body('isActive').optional().isBoolean(),
  validateRequest
], authorize(['Admin']), clientController.createClient);

// @route   PUT /api/clients/:id
// @desc    Update a client
// @access  Private (Admin)
router.put('/:id', [
  param('id').isUUID(),
  body('name').optional().isString().trim(),
  body('email').optional().isEmail().trim().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isString().trim(),
  body('country').optional().isString().trim(),
  body('city').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('contactPerson').optional().isString().trim(),
  body('industry').optional().isString().trim(),
  body('website').optional().isURL().trim().withMessage('Valid URL is required'),
  body('isActive').optional().isBoolean(),
  validateRequest
], authorize(['Admin']), clientController.updateClient);

// @route   DELETE /api/clients/:id
// @desc    Delete a client
// @access  Private (Admin)
router.delete('/:id', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin']), clientController.deleteClient);

// @route   PATCH /api/clients/:id/toggle-status
// @desc    Toggle client active status
// @access  Private (Admin)
router.patch('/:id/toggle-status', [
  param('id').isUUID(),
  validateRequest
], authorize(['Admin']), clientController.toggleClientStatus);

module.exports = router; 