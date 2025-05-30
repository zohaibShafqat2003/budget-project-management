const { Epic, Story, Project, ProjectLabel } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// Get all epics for a project
exports.getProjectEpics = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, limit = 20, offset = 0, labelId } = req.query;
    
    // Build filter object
    const filter = { projectId };
    
    if (status) filter.status = status;
    
    // Build query options
    const queryOptions = {
      where: filter,
      include: [
        { model: Story, as: 'stories' },
        { model: ProjectLabel, as: 'labels' }
      ],
      order: [['order', 'ASC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };
    
    // Filter by label if provided
    if (labelId) {
      queryOptions.include.find(i => i.model === ProjectLabel).where = { id: labelId };
    }
    
    const epics = await Epic.findAndCountAll(queryOptions);
    
    return res.status(200).json({
      success: true,
      count: epics.count,
      data: epics.rows,
      pagination: {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        totalPages: Math.ceil(epics.count / parseInt(limit, 10)),
        currentPage: Math.floor(parseInt(offset, 10) / parseInt(limit, 10)) + 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get epic by ID
exports.getEpicById = async (req, res, next) => {
  try {
    const epic = await Epic.findByPk(req.params.id, {
      include: [
        { model: Story, as: 'stories' },
        { model: Project, as: 'project' },
        { model: ProjectLabel, as: 'labels' }
      ]
    });
    
    if (!epic) {
      return res.status(404).json({
        success: false,
        message: 'Epic not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: epic
    });
  } catch (error) {
    next(error);
  }
};

// Create a new epic
exports.createEpic = async (req, res, next) => {
  try {
    // Get projectId from either params or body
    const projectId = req.params.projectId || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }
    
    // Check if project exists
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Get max order value
    const maxOrderEpic = await Epic.findOne({
      where: { projectId },
      order: [['order', 'DESC']]
    });
    
    // Set order to be at the end
    const order = maxOrderEpic ? maxOrderEpic.order + 1 : 0;
    
    // Extract labels from request body
    const { labelIds, ...epicData } = req.body;
    
    // Create epic with the calculated order
    const epic = await Epic.create({
      ...epicData,
      projectId, // Use the projectId from params or body
      order
    });
    
    // Add labels if provided
    if (labelIds && labelIds.length > 0) {
      await epic.setLabels(labelIds);
    }
    
    // Fetch the epic with its labels
    const epicWithLabels = await Epic.findByPk(epic.id, {
      include: [{ model: ProjectLabel, as: 'labels' }]
    });
    
    return res.status(201).json({
      success: true,
      data: epicWithLabels
    });
  } catch (error) {
    next(error);
  }
};

// Update an epic
exports.updateEpic = async (req, res, next) => {
  try {
    const epic = await Epic.findByPk(req.params.id);
    
    if (!epic) {
      return res.status(404).json({
        success: false,
        message: 'Epic not found'
      });
    }
    
    // Calculate progress if not explicitly set
    if (!req.body.progress && req.body.status) {
      switch (req.body.status) {
        case 'To Do':
          req.body.progress = 0;
          break;
        case 'In Progress':
          req.body.progress = 50;
          break;
        case 'Done':
          req.body.progress = 100;
          req.body.completedDate = new Date();
          break;
      }
    }
    
    // Extract labels from request body
    const { labelIds, ...epicData } = req.body;
    
    await epic.update(epicData);
    
    // Update labels if provided
    if (labelIds !== undefined) {
      await epic.setLabels(labelIds || []);
    }
    
    // Fetch the updated epic with its labels
    const updatedEpic = await Epic.findByPk(epic.id, {
      include: [{ model: ProjectLabel, as: 'labels' }]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedEpic
    });
  } catch (error) {
    next(error);
  }
};

// Delete an epic
exports.deleteEpic = async (req, res, next) => {
  try {
    const epic = await Epic.findByPk(req.params.id, {
      include: [{ model: Story, as: 'stories' }]
    });
    
    if (!epic) {
      return res.status(404).json({
        success: false,
        message: 'Epic not found'
      });
    }
    
    // Check if epic has stories
    if (epic.stories && epic.stories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete epic with active stories. Please move or delete stories first.',
        storyCount: epic.stories.length
      });
    }
    
    await epic.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Epic deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Reorder epics
exports.reorderEpics = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { epicOrders } = req.body;
    
    // Update each epic's order using transaction for atomicity
    const transaction = await sequelize.transaction();
    
    try {
      // Use Promise.all for better performance with large lists
      await Promise.all(epicOrders.map(item => 
        Epic.update(
          { order: item.order },
          { 
            where: { id: item.id, projectId },
            transaction
          }
        )
      ));
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
    // Get updated epics
    const epics = await Epic.findAll({
      where: { projectId },
      order: [['order', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      data: epics
    });
  } catch (error) {
    next(error);
  }
};

// Permanently delete an epic (purge)
exports.purgeEpic = async (req, res, next) => {
  try {
    const epic = await Epic.findByPk(req.params.id, {
      paranoid: false, // Include soft-deleted records
      include: [{ model: Story, as: 'stories', paranoid: false }]
    });
    
    if (!epic) {
      return res.status(404).json({
        success: false,
        message: 'Epic not found'
      });
    }
    
    // Check if epic has stories
    if (epic.stories && epic.stories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot permanently delete epic with associated stories. Please permanently delete stories first.',
        storyCount: epic.stories.length
      });
    }
    
    // Force delete (permanent)
    await epic.destroy({ force: true });
    
    return res.status(200).json({
      success: true,
      message: 'Epic permanently deleted'
    });
  } catch (error) {
    next(error);
  }
};

// Add labels to epic
exports.addLabelsToEpic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { labelIds } = req.body;
    
    if (!labelIds || !Array.isArray(labelIds) || labelIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Label IDs array is required'
      });
    }
    
    const epic = await Epic.findByPk(id);
    
    if (!epic) {
      return res.status(404).json({
        success: false,
        message: 'Epic not found'
      });
    }
    
    await epic.addLabels(labelIds);
    
    const updatedEpic = await Epic.findByPk(id, {
      include: [{ model: ProjectLabel, as: 'labels' }]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedEpic
    });
  } catch (error) {
    next(error);
  }
};

// Remove labels from epic
exports.removeLabelsFromEpic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { labelIds } = req.body;
    
    if (!labelIds || !Array.isArray(labelIds) || labelIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Label IDs array is required'
      });
    }
    
    const epic = await Epic.findByPk(id);
    
    if (!epic) {
      return res.status(404).json({
        success: false,
        message: 'Epic not found'
      });
    }
    
    await epic.removeLabels(labelIds);
    
    const updatedEpic = await Epic.findByPk(id, {
      include: [{ model: ProjectLabel, as: 'labels' }]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedEpic
    });
  } catch (error) {
    next(error);
  }
}; 