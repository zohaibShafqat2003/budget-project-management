const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth.middleware');
const attachmentController = require('../controllers/attachment.controller');
const { uploadMiddleware } = require('../middleware/upload.middleware');
const { check, param, query, validationResult } = require('express-validator');
const { uploadLimiter } = require('../middleware/rate-limit.middleware');

// Validate request
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// Authentication middleware for all routes except public downloads
router.use([
  '/:id/stream', 
  '/public/:id/stream'
], (req, res, next) => {
  // These routes have their own auth via token
  next();
});
router.use(authenticateToken);

// Entity-specific attachment routes
// Project attachments
router
  .route('/projects/:projectId/attachments')
  .get(
    [
      param('projectId').isUUID().withMessage('Invalid project ID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']),
    attachmentController.getAttachments
  )
  .post(
    uploadLimiter,
    [
      param('projectId').isUUID().withMessage('Invalid project ID'),
      check('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be a string under 500 characters'),
      check('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner']),
    uploadMiddleware.single('file'),
    attachmentController.uploadAttachment
  );

// Epic attachments
router
  .route('/epics/:epicId/attachments')
  .get(
    [
      param('epicId').isUUID().withMessage('Invalid epic ID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']),
    attachmentController.getAttachments
  )
  .post(
    uploadLimiter,
    [
      param('epicId').isUUID().withMessage('Invalid epic ID'),
      check('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be a string under 500 characters'),
      check('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner']),
    uploadMiddleware.single('file'),
    attachmentController.uploadAttachment
  );

// Story attachments
router
  .route('/stories/:storyId/attachments')
  .get(
    [
      param('storyId').isUUID().withMessage('Invalid story ID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']),
    attachmentController.getAttachments
  )
  .post(
    uploadLimiter,
    [
      param('storyId').isUUID().withMessage('Invalid story ID'),
      check('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be a string under 500 characters'),
      check('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner']),
    uploadMiddleware.single('file'),
    attachmentController.uploadAttachment
  );

// Task attachments
router
  .route('/tasks/:taskId/attachments')
  .get(
    [
      param('taskId').isUUID().withMessage('Invalid task ID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']),
    attachmentController.getAttachments
  )
  .post(
    uploadLimiter,
    [
      param('taskId').isUUID().withMessage('Invalid task ID'),
      check('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be a string under 500 characters'),
      check('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner']),
    uploadMiddleware.single('file'),
    attachmentController.uploadAttachment
  );

// Single attachment operations
router
  .route('/attachments/:id')
  .get(
    [
      param('id').isUUID().withMessage('Invalid attachment ID')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']),
    attachmentController.getAttachmentById
  )
  .put(
    [
      param('id').isUUID().withMessage('Invalid attachment ID'),
      check('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be a string under 500 characters'),
      check('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner']),
    attachmentController.updateAttachment
  )
  .delete(
    [
      param('id').isUUID().withMessage('Invalid attachment ID')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner']),
    attachmentController.deleteAttachment
  );

// Generate secure download URL
router.get(
  '/attachments/:id/generate-url',
  [
    param('id').isUUID().withMessage('Invalid attachment ID')
  ],
  validate,
  authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']),
  attachmentController.generateDownloadUrl
);

// Secure file streaming with token
router.get(
  '/attachments/:id/stream',
  [
    param('id').isUUID().withMessage('Invalid attachment ID'),
    query('token').isString().withMessage('Valid download token required')
  ],
  validate,
  // No auth middleware here as we're using token-based auth
  attachmentController.streamAttachment
);

// Public file streaming for publicly shared files
router.get(
  '/public/:id/stream',
  [
    param('id').isUUID().withMessage('Invalid attachment ID')
  ],
  validate,
  // TODO: Implement public file access controller
  (req, res) => res.status(501).json({ message: 'Not implemented yet' })
);

// Version management
router
  .route('/attachments/:id/versions')
  .get(
    [
      param('id').isUUID().withMessage('Invalid attachment ID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']),
    attachmentController.getAttachmentVersions
  )
  .post(
    uploadLimiter,
    [
      param('id').isUUID().withMessage('Invalid attachment ID'),
      check('versionComment').optional().isString().isLength({ max: 500 }).withMessage('Version comment must be a string under 500 characters')
    ],
    validate,
    authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner']),
    uploadMiddleware.single('file'),
    attachmentController.uploadNewVersion
  );

module.exports = router; 