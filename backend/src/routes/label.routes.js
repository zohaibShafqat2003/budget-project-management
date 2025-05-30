const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/auth.middleware');
const { ProjectLabel, Project, Epic, Story, Task } = require('../models');

// Label controller with actual model connections
const labelController = {
  // Project labels
  getProjectLabels: async (req, res) => {
    try {
      const { projectId } = req.params;
      
      // Check if project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      
      // Get labels for this project
      const labels = await ProjectLabel.findAll({
        where: { projectId }
      });
      
      return res.status(200).json({
        success: true,
        count: labels.length,
        data: labels
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching project labels',
        error: error.message
      });
    }
  },
  
  createProjectLabel: async (req, res) => {
    try {
      const { projectId } = req.params;
      const { name, color, description } = req.body;
      
      // Check if project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      
      // Create new label
      const label = await ProjectLabel.create({
        projectId,
        name,
        color,
        description
      });
      
      return res.status(201).json({
        success: true,
        data: label
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating project label',
        error: error.message
      });
    }
  },
  
  getLabelById: async (req, res) => {
    try {
      const label = await ProjectLabel.findByPk(req.params.id);
      
      if (!label) {
        return res.status(404).json({
          success: false,
          message: 'Label not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: label
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching label',
        error: error.message
      });
    }
  },
  
  updateLabel: async (req, res) => {
    try {
      const { name, color, description } = req.body;
      const label = await ProjectLabel.findByPk(req.params.id);
      
      if (!label) {
        return res.status(404).json({
          success: false,
          message: 'Label not found'
        });
      }
      
      // Update label
      await label.update({
        name: name || label.name,
        color: color || label.color,
        description: description || label.description
      });
      
      return res.status(200).json({
        success: true,
        data: label
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error updating label',
        error: error.message
      });
    }
  },
  
  deleteLabel: async (req, res) => {
    try {
      const label = await ProjectLabel.findByPk(req.params.id);
      
      if (!label) {
        return res.status(404).json({
          success: false,
          message: 'Label not found'
        });
      }
      
      await label.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Label deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting label',
        error: error.message
      });
    }
  },
  
  // Story label associations
  addLabelToStory: async (req, res) => {
    try {
      const { storyId, labelId } = req.params;
      
      const story = await Story.findByPk(storyId);
      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Story not found'
        });
      }
      
      const label = await ProjectLabel.findByPk(labelId);
      if (!label) {
        return res.status(404).json({
          success: false,
          message: 'Label not found'
        });
      }
      
      // Check if label belongs to the same project as the story
      if (label.projectId !== story.projectId) {
        return res.status(400).json({
          success: false,
          message: 'Label must belong to the same project as the story'
        });
      }
      
      // Add label to story
      await story.addLabel(label);
      
      return res.status(200).json({
        success: true,
        message: 'Label added to story successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error adding label to story',
        error: error.message
      });
    }
  },
  
  removeLabelFromStory: async (req, res) => {
    try {
      const { storyId, labelId } = req.params;
      
      const story = await Story.findByPk(storyId);
      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Story not found'
        });
      }
      
      const label = await ProjectLabel.findByPk(labelId);
      if (!label) {
        return res.status(404).json({
          success: false,
          message: 'Label not found'
        });
      }
      
      // Remove label from story
      await story.removeLabel(label);
      
      return res.status(200).json({
        success: true,
        message: 'Label removed from story successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error removing label from story',
        error: error.message
      });
    }
  },
  
  // Task label associations
  addLabelToTask: async (req, res) => {
    try {
      const { taskId, labelId } = req.params;
      
      const task = await Task.findByPk(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      const label = await ProjectLabel.findByPk(labelId);
      if (!label) {
        return res.status(404).json({
          success: false,
          message: 'Label not found'
        });
      }
      
      // Check if label belongs to the same project as the task
      if (label.projectId !== task.projectId) {
        return res.status(400).json({
          success: false,
          message: 'Label must belong to the same project as the task'
        });
      }
      
      // Add label to task
      await task.addLabel(label);
      
      return res.status(200).json({
        success: true,
        message: 'Label added to task successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error adding label to task',
        error: error.message
      });
    }
  },
  
  removeLabelFromTask: async (req, res) => {
    try {
      const { taskId, labelId } = req.params;
      
      const task = await Task.findByPk(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      const label = await ProjectLabel.findByPk(labelId);
      if (!label) {
        return res.status(404).json({
          success: false,
          message: 'Label not found'
        });
      }
      
      // Remove label from task
      await task.removeLabel(label);
      
      return res.status(200).json({
        success: true,
        message: 'Label removed from task successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error removing label from task',
        error: error.message
      });
    }
  }
};

// Apply authentication to all routes
router.use(authenticateToken);

// Project label routes
router
  .route('/projects/:projectId/labels')
  .get(authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']), labelController.getProjectLabels)
  .post(authorize(['Admin', 'Scrum Master', 'Product Owner']), labelController.createProjectLabel);

// Label management routes
router
  .route('/labels/:id')
  .get(authorize(['Admin', 'Developer', 'Scrum Master', 'Product Owner', 'Viewer']), labelController.getLabelById)
  .put(authorize(['Admin', 'Scrum Master', 'Product Owner']), labelController.updateLabel)
  .delete(authorize(['Admin', 'Product Owner']), labelController.deleteLabel);

// Story label association routes
router
  .route('/stories/:storyId/labels/:labelId')
  .post(authorize(['Admin', 'Scrum Master', 'Product Owner']), labelController.addLabelToStory)
  .delete(authorize(['Admin', 'Scrum Master', 'Product Owner']), labelController.removeLabelFromStory);

// Task label association routes
router
  .route('/tasks/:taskId/labels/:labelId')
  .post(authorize(['Admin', 'Scrum Master', 'Product Owner']), labelController.addLabelToTask)
  .delete(authorize(['Admin', 'Scrum Master', 'Product Owner']), labelController.removeLabelFromTask);

module.exports = router; 