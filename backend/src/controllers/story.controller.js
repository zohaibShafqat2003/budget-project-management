const { Story, Task, Epic, User, Sprint, ProjectLabel } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// Get all stories for an epic
exports.getEpicStories = async (req, res, next) => {
  try {
    const { epicId } = req.params;
    const { 
      status, 
      priority, 
      labelId,
      limit = 20,
      offset = 0
    } = req.query;
    
    // Build filter object
    const filter = { epicId };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    // More robust boolean handling
    if (req.query.isReady != null) {
      filter.isReady = req.query.isReady === 'true';
    }
    
    // Build query options
    const queryOptions = {
      where: filter,
      include: [
        { model: Task, as: 'tasks' },
        { model: User, as: 'assignee' },
        { model: Sprint, as: 'sprint' },
        { model: ProjectLabel, as: 'labels' }
      ],
      order: [['order', 'ASC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };
    
    // Filter by label if provided - more robust approach
    if (labelId) {
      const labelInclude = queryOptions.include.find(i => i.model === ProjectLabel && i.as === 'labels');
      if (labelInclude) {
        labelInclude.where = { id: labelId };
      }
    }
    
    const stories = await Story.findAndCountAll(queryOptions);
    
    return res.status(200).json({
      success: true,
      count: stories.count,
      data: stories.rows,
      pagination: {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        totalPages: Math.ceil(stories.count / parseInt(limit, 10)),
        currentPage: Math.floor(parseInt(offset, 10) / parseInt(limit, 10)) + 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all stories for a project
exports.getProjectStories = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { 
      status, 
      priority, 
      epicId, 
      sprintId,
      labelId,
      limit = 20,
      offset = 0
    } = req.query;
    
    // Build filter object
    const filter = { projectId };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    // More robust boolean handling
    if (req.query.isReady != null) {
      filter.isReady = req.query.isReady === 'true';
    }
    if (epicId) filter.epicId = epicId;
    
    // Pagination options
    const paginationOptions = {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['order', 'ASC']]
    };
    
    // Common includes for all queries
    const commonIncludes = [
      { model: Task, as: 'tasks' },
      { model: User, as: 'assignee' },
      { model: Epic, as: 'epic' },
      { model: ProjectLabel, as: 'labels' }
    ];
    
    // Filter by label if provided - more robust approach
    if (labelId) {
      const labelInclude = commonIncludes.find(i => i.model === ProjectLabel && i.as === 'labels');
      if (labelInclude) {
        labelInclude.where = { id: labelId };
      }
    }
    
    // Get stories that either belong to the specified sprint or are in the backlog
    let stories;
    
    if (sprintId === 'backlog') {
      // Find stories not assigned to any sprint
      stories = await Story.findAndCountAll({
        where: {
          ...filter,
          sprintId: null
        },
        include: commonIncludes,
        ...paginationOptions
      });
    } else if (sprintId && sprintId !== 'backlog') {
      // Validate that sprintId is a valid UUID if not 'backlog'
      // Find stories for a specific sprint
      stories = await Story.findAndCountAll({
        where: {
          ...filter,
          sprintId
        },
        include: commonIncludes,
        ...paginationOptions
      });
    } else {
      // Find all stories for the project
      const includesWithSprint = [
        ...commonIncludes,
        { model: Sprint, as: 'sprint' }
      ];
      
      stories = await Story.findAndCountAll({
        where: filter,
        include: includesWithSprint,
        ...paginationOptions
      });
    }
    
    return res.status(200).json({
      success: true,
      count: stories.count,
      data: stories.rows,
      pagination: {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        totalPages: Math.ceil(stories.count / parseInt(limit, 10)),
        currentPage: Math.floor(parseInt(offset, 10) / parseInt(limit, 10)) + 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get story by ID
exports.getStoryById = async (req, res, next) => {
  try {
    const story = await Story.findByPk(req.params.id, {
      include: [
        { model: Task, as: 'tasks' },
        { model: Epic, as: 'epic' },
        { model: User, as: 'assignee' },
        { model: Sprint, as: 'sprint' },
        { model: ProjectLabel, as: 'labels' }
      ]
    });
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    next(error);
  }
};

// Create a new story
exports.createStory = async (req, res, next) => {
  try {
    // Get projectId and epicId from either params or body
    const projectId = req.params.projectId || req.body.projectId;
    const epicId = req.params.epicId || req.body.epicId;
    
    // Check if epic exists if provided
    if (epicId) {
      const epic = await Epic.findByPk(epicId);
      
      if (!epic) {
        return res.status(404).json({
          success: false,
          message: 'Epic not found'
        });
      }
      
      // Inherit project ID from epic if not provided
      if (!projectId) {
        req.body.projectId = epic.projectId;
      }
    } else if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required when epic is not provided'
      });
    }
    
    // Get max order value and increment
    const maxOrderStory = await Story.findOne({
      where: { 
        epicId: epicId || req.body.epicId,
        projectId: projectId || req.body.projectId
      },
      order: [['order', 'DESC']]
    });
    
    const order = maxOrderStory ? maxOrderStory.order + 1 : 0;
    
    // Extract labels from request body
    const { labelIds, ...storyData } = req.body;
    
    const story = await Story.create({
      ...storyData,
      projectId: projectId || req.body.projectId,
      epicId: epicId || req.body.epicId,
      order
    });
    
    // Add labels if provided
    if (labelIds && labelIds.length > 0) {
      await story.setLabels(labelIds);
    }
    
    // Fetch the story with its labels
    const storyWithLabels = await Story.findByPk(story.id, {
      include: [
        { model: Epic, as: 'epic' },
        { model: User, as: 'assignee' },
        { model: ProjectLabel, as: 'labels' }
      ]
    });
    
    return res.status(201).json({
      success: true,
      data: storyWithLabels
    });
  } catch (error) {
    next(error);
  }
};

// Update a story
exports.updateStory = async (req, res, next) => {
  try {
    const story = await Story.findByPk(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    // Extract labels from request body
    const { labelIds, ...storyData } = req.body;
    
    await story.update(storyData);
    
    // Update labels if provided
    if (labelIds !== undefined) {
      await story.setLabels(labelIds || []);
    }
    
    // Fetch the updated story with its labels
    const updatedStory = await Story.findByPk(story.id, {
      include: [
        { model: Epic, as: 'epic' },
        { model: User, as: 'assignee' },
        { model: ProjectLabel, as: 'labels' }
      ]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedStory
    });
  } catch (error) {
    next(error);
  }
};

// Delete a story
exports.deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findByPk(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    await story.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Mark story as ready/not ready
exports.toggleReadyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isReady } = req.body;
    
    if (isReady === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isReady field is required'
      });
    }
    
    const story = await Story.findByPk(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    await story.update({ isReady });
    
    return res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    next(error);
  }
};

// Assign story to sprint
exports.assignToSprint = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { sprintId } = req.body;
    
    const story = await Story.findByPk(id, { transaction });
    
    if (!story) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    // If sprintId is null, remove from sprint (move to backlog)
    if (!sprintId) {
      // If story was previously in a sprint, reduce that sprint's committedPoints
      if (story.sprintId) {
        const oldSprint = await Sprint.findByPk(story.sprintId, { transaction });
        if (oldSprint) {
          const newCommittedPoints = Math.max(0, oldSprint.committedPoints - (story.points || 0));
          await oldSprint.update({ 
            committedPoints: newCommittedPoints,
            totalPoints: newCommittedPoints
          }, { transaction });
        }
      }
      
      await story.update({ sprintId: null }, { transaction });
      await transaction.commit();
      
      return res.status(200).json({
        success: true,
        message: 'Story moved to backlog',
        data: story
      });
    }
    
    // Check if sprint exists and is not locked
    const sprint = await Sprint.findByPk(sprintId, { transaction });
    
    if (!sprint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    if (sprint.isLocked) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot add story to locked sprint'
      });
    }
    
    // Check if story is ready
    if (!story.isReady) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only ready stories can be added to sprints'
      });
    }
    
    // If story was previously in a different sprint, reduce that sprint's committedPoints
    if (story.sprintId && story.sprintId !== sprintId) {
      const oldSprint = await Sprint.findByPk(story.sprintId, { transaction });
      if (oldSprint) {
        const newCommittedPoints = Math.max(0, oldSprint.committedPoints - (story.points || 0));
        await oldSprint.update({ 
          committedPoints: newCommittedPoints,
          totalPoints: newCommittedPoints
        }, { transaction });
      }
    }
    
    // Add to sprint
    await story.update({ sprintId }, { transaction });
    
    // Update sprint committed points - only add points if story wasn't already in this sprint
    if (story.sprintId !== sprintId) {
      const committedPoints = sprint.committedPoints + (story.points || 0);
      await sprint.update({ 
        committedPoints,
        totalPoints: committedPoints
      }, { transaction });
    }
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Reorder stories
exports.reorderStories = async (req, res, next) => {
  try {
    const { epicId } = req.params;
    const { storyOrders } = req.body;
    
    if (!storyOrders || !Array.isArray(storyOrders)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of story orders'
      });
    }
    
    // Start a transaction to ensure atomicity
    const transaction = await sequelize.transaction();
    
    try {
      // Use Promise.all for better performance with batch updates
      await Promise.all(storyOrders.map(item =>
        Story.update(
          { order: item.order },
          { 
            where: { id: item.id, epicId },
            transaction
          }
        )
      ));
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
    // Get updated stories
    const stories = await Story.findAll({
      where: { epicId },
      order: [['order', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      data: stories
    });
  } catch (error) {
    next(error);
  }
};

// Add labels to story
exports.addLabelsToStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { labelIds } = req.body;
    
    if (!labelIds || !Array.isArray(labelIds) || labelIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Label IDs array is required'
      });
    }
    
    const story = await Story.findByPk(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    await story.addLabels(labelIds);
    
    const updatedStory = await Story.findByPk(id, {
      include: [{ model: ProjectLabel, as: 'labels' }]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedStory
    });
  } catch (error) {
    next(error);
  }
};

// Remove labels from story
exports.removeLabelsFromStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { labelIds } = req.body;
    
    if (!labelIds || !Array.isArray(labelIds) || labelIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Label IDs array is required'
      });
    }
    
    const story = await Story.findByPk(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    await story.removeLabels(labelIds);
    
    const updatedStory = await Story.findByPk(id, {
      include: [{ model: ProjectLabel, as: 'labels' }]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedStory
    });
  } catch (error) {
    next(error);
  }
}; 