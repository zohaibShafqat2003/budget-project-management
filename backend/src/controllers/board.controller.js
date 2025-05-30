const { Board, Project, Sprint, Story } = require('../models');
const { sequelize } = require('../config/db');

// Get all boards for a project
exports.getProjectBoards = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { includeArchived } = req.query;
    
    // Check if project exists
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Build filter to exclude archived boards by default
    const filter = { projectId };
    
    // Only include archived boards if explicitly requested
    if (!includeArchived || includeArchived !== 'true') {
      filter.archived = false;
    }
    
    const boards = await Board.findAll({
      where: filter,
      include: [
        {
          model: Sprint,
          as: 'sprints',
          attributes: ['id', 'name', 'status', 'startDate', 'endDate']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      count: boards.length,
      data: boards
    });
  } catch (error) {
    next(error);
  }
};

// Get a board by ID
exports.getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'projectIdStr']
        },
        {
          model: Sprint,
          as: 'sprints',
          attributes: ['id', 'name', 'status', 'startDate', 'endDate']
        }
      ]
    });
    
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: board
    });
  } catch (error) {
    next(error);
  }
};

// Create a new board
exports.createBoard = async (req, res, next) => {
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
    
    // Create board data object
    const boardData = {
      ...req.body,
      projectId
    };
    
    // Create board
    const board = await Board.create(boardData);
    
    return res.status(201).json({
      success: true,
      data: board
    });
  } catch (error) {
    next(error);
  }
};

// Update a board
exports.updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findByPk(req.params.id);
    
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }
    
    await board.update(req.body);
    
    return res.status(200).json({
      success: true,
      data: board
    });
  } catch (error) {
    next(error);
  }
};

// Delete a board
exports.deleteBoard = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const board = await Board.findByPk(req.params.id, {
      include: [
        {
          model: Sprint,
          as: 'sprints'
        }
      ],
      transaction
    });
    
    if (!board) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }
    
    // Check if board has any sprints
    if (board.sprints && board.sprints.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete board with associated sprints'
      });
    }
    
    await board.destroy({ transaction });
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Board deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}; 