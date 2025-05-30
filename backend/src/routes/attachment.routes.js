const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth.middleware');

// Temporary placeholder for attachment controller
const attachmentController = {
  getProjectAttachments: (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Attachment functionality coming soon',
      data: []
    });
  },
  uploadAttachment: (req, res) => {
    res.status(201).json({ 
      success: true, 
      message: 'Attachment functionality coming soon',
      data: { id: 'placeholder' }
    });
  },
  getAttachmentById: (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Attachment functionality coming soon',
      data: { id: req.params.id }
    });
  },
  deleteAttachment: (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Attachment deleted successfully'
    });
  }
};

router.use(authenticateToken);

// List & upload attachments for a project
router
  .route('/projects/:projectId/attachments')
  .get(authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']), attachmentController.getProjectAttachments)
  .post(authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner']), attachmentController.uploadAttachment);

// Single attachment operations
router
  .route('/attachments/:id')
  .get(authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']), attachmentController.getAttachmentById)
  .delete(authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner']), attachmentController.deleteAttachment);

module.exports = router; 