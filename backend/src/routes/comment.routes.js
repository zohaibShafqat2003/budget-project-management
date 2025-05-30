const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth.middleware');

// Temporary placeholder for comment controller
const commentController = {
  getProjectComments: (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Comment functionality coming soon',
      data: []
    });
  },
  createComment: (req, res) => {
    res.status(201).json({ 
      success: true, 
      message: 'Comment functionality coming soon',
      data: { id: 'placeholder' }
    });
  },
  getCommentById: (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Comment functionality coming soon',
      data: { id: req.params.id }
    });
  },
  updateComment: (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Comment functionality coming soon',
      data: { id: req.params.id }
    });
  },
  deleteComment: (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Comment deleted successfully'
    });
  }
};

router.use(authenticateToken);

// List & create comments on a project
router
  .route('/projects/:projectId/comments')
  .get(authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']), commentController.getProjectComments)
  .post(authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner']), commentController.createComment);

// Single comment operations
router
  .route('/comments/:id')
  .get(authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']), commentController.getCommentById)
  .put(authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner']), commentController.updateComment)
  .delete(authorize(['Admin']), commentController.deleteComment);

module.exports = router; 