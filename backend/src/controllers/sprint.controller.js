const { Sprint, Story, Task, User, Project, Board, Epic } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// Get all sprints for a project
exports.getProjectSprints = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;
    
    // Find all boards for this project
    const boards = await Board.findAll({
      where: { projectId },
      attributes: ['id']
    });
    
    const boardIds = boards.map(board => board.id);
    
    // Build filter object
    const filter = { 
      boardId: { [Op.in]: boardIds } 
    };
    
    if (status) filter.status = status;
    
    const sprints = await Sprint.findAll({
      where: filter,
      include: [
        { 
          model: Story, 
          as: 'stories',
          include: [
            { model: Task, as: 'tasks' }
          ]
        },
        { model: User, as: 'owner' },
        { model: Board, as: 'board', include: [{ model: Project, as: 'project' }] }
      ],
      order: [['startDate', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      count: sprints.length,
      data: sprints
    });
  } catch (error) {
    next(error);
  }
};

// Get sprints for a specific board
exports.getBoardSprints = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { status } = req.query;
    
    // Build filter object
    const filter = { boardId };
    
    if (status) filter.status = status;
    
    const sprints = await Sprint.findAll({
      where: filter,
      include: [
        { 
          model: Story, 
          as: 'stories',
          include: [
            { model: Task, as: 'tasks' }
          ]
        },
        { model: User, as: 'owner' },
        { model: Board, as: 'board', include: [{ model: Project, as: 'project' }] }
      ],
      order: [['startDate', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      count: sprints.length,
      data: sprints
    });
  } catch (error) {
    next(error);
  }
};

// Get sprint by ID
exports.getSprintById = async (req, res, next) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id, {
      include: [
        { 
          model: Story, 
          as: 'stories',
          include: [
            { model: Task, as: 'tasks' }
          ]
        },
        { model: User, as: 'owner' },
        { model: Board, as: 'board', include: [{ model: Project, as: 'project' }] }
      ]
    });
    
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: sprint
    });
  } catch (error) {
    next(error);
  }
};

// Create a new sprint
exports.createSprint = async (req, res, next) => {
  try {
    // Get projectId and boardId from params or body
    const projectId = req.params.projectId || req.body.projectId;
    const boardId = req.params.boardId || req.body.boardId;
    
    if (!boardId) {
      return res.status(400).json({
        success: false,
        message: 'Board ID is required'
      });
    }
    
    // Check if board exists and belongs to the project
    const board = await Board.findByPk(boardId, {
      include: [{ model: Project, as: 'project' }]
    });
    
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }
    
    // If projectId is provided, verify that the board belongs to this project
    if (projectId && board.projectId !== projectId) {
      return res.status(400).json({
        success: false,
        message: 'Board does not belong to the specified project'
      });
    }
    
    // Set current user as owner if not specified
    if (!req.body.ownerId) {
      req.body.ownerId = req.user.id;
    }
    
    // Create sprint data object
    const sprintData = {
      ...req.body,
      boardId, // Use the boardId
      status: req.body.status || 'Planning'
    };
    
    // Create sprint
    const sprint = await Sprint.create(sprintData);
    
    return res.status(201).json({
      success: true,
      data: sprint
    });
  } catch (error) {
    next(error);
  }
};

// Update a sprint
exports.updateSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id);
    
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // If trying to change status, apply special rules
    if (req.body.status && req.body.status !== sprint.status) {
      // Only allow specific transitions
      switch (req.body.status) {
        case 'Active':
          // Lock sprint when activating
          if (sprint.status === 'Planning') {
            req.body.isLocked = true;
          } else {
            return res.status(400).json({
              success: false,
              message: 'Sprint can only be activated from Planning status'
            });
          }
          break;
        case 'Completed':
          // Can only complete from Active
          if (sprint.status !== 'Active') {
            return res.status(400).json({
              success: false,
              message: 'Sprint can only be completed from Active status'
            });
          }
          break;
        case 'Cancelled':
          // Can cancel from any status
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid sprint status'
          });
      }
    }
    
    await sprint.update(req.body);
    
    return res.status(200).json({
      success: true,
      data: sprint
    });
  } catch (error) {
    next(error);
  }
};

// Delete a sprint
exports.deleteSprint = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const sprint = await Sprint.findByPk(req.params.id, { transaction });
    
    if (!sprint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Only allow deletion of sprints in Planning status
    if (sprint.status !== 'Planning') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only sprints in Planning status can be deleted'
      });
    }
    
    // Move all stories back to backlog
    await Story.update(
      { sprintId: null },
      { 
        where: { sprintId: sprint.id },
        transaction
      }
    );
    
    await sprint.destroy({ transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Sprint deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Start a sprint
exports.startSprint = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { goal, endDate } = req.body;
    
    if (!goal || !endDate) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Sprint goal and end date are required'
      });
    }
    
    const sprint = await Sprint.findByPk(id, {
      include: [{ model: Story, as: 'stories' }],
      transaction
    });
    
    if (!sprint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Check if sprint is in Planning status
    if (sprint.status !== 'Planning') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only sprints in Planning status can be started'
      });
    }
    
    // Calculate committed points
    let committedPoints = 0;
    if (sprint.stories) {
      committedPoints = sprint.stories.reduce((sum, story) => sum + (story.points || 0), 0);
    }
    
    // Update sprint
    await sprint.update({
      status: 'Active',
      goal,
      startDate: new Date(),
      endDate: new Date(endDate),
      isLocked: true,
      committedPoints,
      totalPoints: committedPoints
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      data: sprint
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Complete a sprint
exports.completeSprint = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { moveUnfinishedToBacklog, retrospectiveNotes } = req.body;
    
    const sprint = await Sprint.findByPk(id, {
      include: [
        { 
        model: Story, 
        as: 'stories',
        include: [{ model: Task, as: 'tasks' }]
        },
        {
          model: Board,
          as: 'board'
        }
      ],
      transaction
    });
    
    if (!sprint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Check if sprint is in Active status
    if (sprint.status !== 'Active') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only active sprints can be completed'
      });
    }
    
    // Calculate completed points
    let completedPoints = 0;
    
    if (sprint.stories) {
      // Filter completed stories
      const completedStories = sprint.stories.filter(story => story.status === 'Done');
      
      // Sum their story points
      completedPoints = completedStories.reduce((sum, story) => sum + (story.points || 0), 0);
      
      // Move unfinished stories to backlog if requested
      if (moveUnfinishedToBacklog) {
        const unfinishedStoryIds = sprint.stories
          .filter(story => story.status !== 'Done')
          .map(story => story.id);
        
        if (unfinishedStoryIds.length > 0) {
          await Story.update(
            { sprintId: null },
            { 
              where: { id: unfinishedStoryIds },
              transaction
            }
          );
        }
      }
    }
    
    // Update sprint
    await sprint.update({
      status: 'Completed',
      completedPoints,
      retrospective: retrospectiveNotes || sprint.retrospective
    }, { transaction });
    
    // Get the projectId from the associated board
    const projectId = sprint.board ? sprint.board.projectId : null;
    
    if (projectId) {
    // Calculate velocity (if there are previous sprints)
    const previousSprints = await Sprint.findAll({
      where: {
          id: { [Op.ne]: sprint.id },
        status: 'Completed',
          boardId: { [Op.in]: sequelize.literal(`(SELECT id FROM "Boards" WHERE "projectId" = '${projectId}')`) }
      },
      order: [['endDate', 'DESC']],
      limit: 3,
      transaction
    });
    
    if (previousSprints.length > 0) {
      const totalCompletedPoints = previousSprints.reduce((sum, s) => sum + s.completedPoints, 0) + completedPoints;
      const velocity = Math.round(totalCompletedPoints / (previousSprints.length + 1));
      
      // Update project's sprint velocity
      await Project.update(
        { metadata: { velocity } },
        { 
            where: { id: projectId },
          transaction
        }
      );
      }
    }
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      data: sprint
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Cancel a sprint
exports.cancelSprint = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { moveUnfinishedToBacklog = true, reason } = req.body;
    
    const sprint = await Sprint.findByPk(id, {
      include: [
        { 
          model: Story, 
          as: 'stories'
        },
        {
          model: Board,
          as: 'board'
        }
      ],
      transaction
    });
    
    if (!sprint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Can only cancel sprints that are in Planning or Active status
    if (sprint.status !== 'Planning' && sprint.status !== 'Active') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Only sprints in Planning or Active status can be cancelled'
      });
    }
    
    // Move stories back to backlog if requested
    if (moveUnfinishedToBacklog && sprint.stories && sprint.stories.length > 0) {
      const storyIds = sprint.stories.map(story => story.id);
      
      await Story.update(
        { sprintId: null },
        { 
          where: { id: storyIds },
          transaction
        }
      );
    }
    
    // Update sprint
    await sprint.update({
      status: 'Cancelled',
      metadata: {
        ...sprint.metadata,
        cancelReason: reason || 'No reason provided',
        cancelledAt: new Date()
      }
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Sprint cancelled successfully',
      data: sprint
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Add stories to sprint
exports.addStoriesToSprint = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { storyIds } = req.body;
    
    if (!storyIds || !Array.isArray(storyIds)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of story IDs'
      });
    }
    
    const sprint = await Sprint.findByPk(id, { transaction });
    
    if (!sprint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Check if sprint is locked
    if (sprint.isLocked) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot add stories to locked sprint'
      });
    }
    
    // Get stories
    const stories = await Story.findAll({
      where: { id: storyIds },
      transaction
    });
    
    // Check if all stories are ready
    const notReadyStories = stories.filter(story => !story.isReady);
    
    if (notReadyStories.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'All stories must be marked as ready before adding to sprint',
        notReadyStories: notReadyStories.map(s => s.id)
      });
    }
    
    // Update stories
    await Story.update(
      { sprintId: id },
      { 
        where: { id: storyIds },
        transaction
      }
    );
    
    // Update sprint committed points
    const additionalPoints = stories.reduce((sum, story) => sum + (story.points || 0), 0);
    const committedPoints = sprint.committedPoints + additionalPoints;
    
    await sprint.update({ 
      committedPoints,
      totalPoints: committedPoints
    }, { transaction });
    
    // Get updated sprint with stories
    const updatedSprint = await Sprint.findByPk(id, {
      include: [{ model: Story, as: 'stories' }],
      transaction
    });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      data: updatedSprint
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Remove stories from sprint
exports.removeStoriesFromSprint = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { storyIds } = req.body;
    
    if (!storyIds || !Array.isArray(storyIds)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of story IDs'
      });
    }
    
    const sprint = await Sprint.findByPk(id, { transaction });
    
    if (!sprint) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Check if sprint is locked
    if (sprint.isLocked) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot remove stories from locked sprint'
      });
    }
    
    // Get stories
    const stories = await Story.findAll({
      where: { 
        id: storyIds,
        sprintId: id
      },
      transaction
    });
    
    // Update stories
    await Story.update(
      { sprintId: null },
      { 
        where: { 
          id: storyIds,
          sprintId: id
        },
        transaction
      }
    );
    
    // Update sprint committed points
    const removedPoints = stories.reduce((sum, story) => sum + (story.points || 0), 0);
    const committedPoints = Math.max(0, sprint.committedPoints - removedPoints);
    
    await sprint.update({ 
      committedPoints,
      totalPoints: committedPoints
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Stories removed from sprint'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get backlog for a board
exports.getBoardBacklog = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    
    // Check if board exists
    const board = await Board.findByPk(boardId, {
      include: [{ model: Project, as: 'project' }]
    });
    
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }
    
    // Get all stories for this project that aren't assigned to a sprint
    const stories = await Story.findAll({
      where: {
        projectId: board.projectId,
        sprintId: null
      },
      include: [
        { model: Task, as: 'tasks' },
        { model: User, as: 'assignee' },
        { model: Epic, as: 'epic' }
      ],
      order: [['order', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (error) {
    next(error);
  }
}; 