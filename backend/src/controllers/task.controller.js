const { Task, Story, User, TaskDependency, ProjectLabel, Sprint } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// Get all tasks
exports.getAllTasks = async (req, res, next) => {
  console.log('>>> HIT getAllTasks with query:', req.query);
  try {
    const { 
      projectId, storyId, assigneeId, status, 
      priority, sprintId, type, labelId,
      limit = 20, offset = 0
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (projectId) filter.projectId = projectId;
    if (storyId) filter.storyId = storyId;
    if (assigneeId) filter.assigneeId = assigneeId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    
    // Pagination options
    const paginationOptions = {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['updatedAt', 'DESC']]
    };
    
    // Query setup
    let taskQuery = {
      where: filter,
      include: [
        { model: User, as: 'assignee' },
        { model: ProjectLabel, as: 'labels' },
        { model: Story, as: 'story' }
      ],
      ...paginationOptions
    };
    
    // Filter by label if provided
    if (labelId) {
      taskQuery.include.find(i => i.model === ProjectLabel).where = { id: labelId };
    }
    
    // If filtering by sprint, include Sprint through SprintTask junction
    if (sprintId) {
      taskQuery.include.push({
        model: Sprint, 
        as: 'sprints',
        where: { id: sprintId },
        through: { attributes: [] } // Don't include junction table fields
      });
    }
    
    const tasks = await Task.findAndCountAll(taskQuery);
    
    return res.status(200).json({
      success: true,
      count: tasks.count,
      data: tasks.rows,
      pagination: {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        totalPages: Math.ceil(tasks.count / parseInt(limit, 10)),
        currentPage: Math.floor(parseInt(offset, 10) / parseInt(limit, 10)) + 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get task by ID
exports.getTaskById = async (req, res, next) => {
  console.log('>>> HIT getTaskById with id:', req.params.id);
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: Story, as: 'story' },
        { model: User, as: 'assignee' },
        { 
          model: Task, 
          as: 'dependsOn',
          through: { 
            model: TaskDependency,
            attributes: ['id', 'type']
          }
        },
        { 
          model: Task, 
          as: 'dependedOnBy',
          through: { 
            model: TaskDependency,
            attributes: ['id', 'type'],
            where: { type: 'blocks' },
            required: false
          }
        }
      ]
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// Create a new task
exports.createTask = async (req, res, next) => {
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    // Get projectId and storyId from either params or body
    const projectId = req.params.projectId || req.body.projectId;
    const storyId = req.params.storyId || req.body.storyId;
    
    // Check if story exists
    if (storyId) {
      const story = await Story.findByPk(storyId, { transaction });
      
      if (!story) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Story not found'
        });
      }
      
      // Inherit project ID from story if not provided
      if (!projectId) {
        req.body.projectId = story.projectId;
      }
    } else if (!projectId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Project ID is required when story is not provided'
      });
    }
    
    // Extract labels from request body
    const { labelIds, ...taskData } = req.body;
    
    // Create the task
    const task = await Task.create({
      ...taskData,
      projectId: projectId || req.body.projectId,
      storyId: storyId || req.body.storyId
    }, { transaction });
    
    // Add labels if provided
    if (labelIds && labelIds.length > 0) {
      await task.setLabels(labelIds, { transaction });
    }
    
    // Create dependencies if provided
    if (req.body.dependencies && Array.isArray(req.body.dependencies)) {
      const dependencies = req.body.dependencies.map(dep => ({
        sourceTaskId: task.id,
        targetTaskId: dep.targetTaskId,
        type: dep.type || 'blocks',
        createdBy: req.user.id
      }));
      
      if (dependencies.length > 0) {
        await TaskDependency.bulkCreate(dependencies, { transaction });
      }
    }
    
    // Commit the transaction
    await transaction.commit();
    
    // Fetch the task with all associations
    const createdTask = await Task.findByPk(task.id, {
      include: [
        { model: Story, as: 'story' },
        { model: User, as: 'assignee' },
        { model: ProjectLabel, as: 'labels' }
      ]
    });
    
    return res.status(201).json({
      success: true,
      data: createdTask
    });
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();
    next(error);
  }
};

// Update a task
exports.updateTask = async (req, res, next) => {
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    const task = await Task.findByPk(req.params.id, { transaction });
    
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Handle status transitions
    if (req.body.status && req.body.status !== task.status) {
      // Enforce assignee for In Progress tasks
      if (req.body.status === 'In Progress' && !task.assigneeId && !req.body.assigneeId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Tasks must have an assignee before moving to In Progress'
        });
      }
      
      // Update date fields based on status
      switch(req.body.status) {
        case 'In Progress':
          if (!task.startDate) req.body.startDate = new Date();
          break;
        case 'Done':
        case 'Closed':
          if (!task.completedDate) req.body.completedDate = new Date();
          break;
      }
    }
    
    // Extract labels from request body
    const { labelIds, ...taskData } = req.body;
    
    await task.update(taskData, { transaction });
    
    // Update labels if provided
    if (labelIds !== undefined) {
      await task.setLabels(labelIds || [], { transaction });
    }
    
    // Update dependencies if provided
    if (req.body.dependencies && Array.isArray(req.body.dependencies)) {
      // Delete existing dependencies
      await TaskDependency.destroy({
        where: { sourceTaskId: task.id },
        transaction
      });
      
      // Create new dependencies
      const dependencies = req.body.dependencies.map(dep => ({
        sourceTaskId: task.id,
        targetTaskId: dep.targetTaskId,
        type: dep.type || 'blocks',
        createdBy: req.user.id
      }));
      
      if (dependencies.length > 0) {
        await TaskDependency.bulkCreate(dependencies, { transaction });
      }
    }
    
    // Commit the transaction
    await transaction.commit();
    
    // Get updated task with associations
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: Story, as: 'story' },
        { model: User, as: 'assignee' },
        { model: ProjectLabel, as: 'labels' }
      ]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();
    next(error);
  }
};

// Delete a task (soft delete)
exports.deleteTask = async (req, res, next) => {
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    const task = await Task.findByPk(req.params.id, { transaction });
    
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Soft delete the task (uses paranoid: true)
    await task.destroy({ transaction });
    
    // Commit the transaction
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();
    next(error);
  }
};

// Permanently delete a task (purge)
exports.purgeTask = async (req, res, next) => {
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    const task = await Task.findByPk(req.params.id, { 
      paranoid: false,
      transaction 
    });
    
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Delete dependencies (permanently)
    await TaskDependency.destroy({
      where: {
        [Op.or]: [
          { sourceTaskId: task.id },
          { targetTaskId: task.id }
        ]
      },
      force: true,
      transaction
    });
    
    // Permanently delete the task
    await task.destroy({ 
      force: true,
      transaction 
    });
    
    // Commit the transaction
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Task permanently deleted'
    });
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();
    next(error);
  }
};

// Assign task to user
exports.assignTask = async (req, res, next) => {
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;
    
    const task = await Task.findByPk(id, { transaction });
    
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // If assigneeId is null, unassign the task
    if (assigneeId === null) {
      await task.update({ assigneeId: null }, { transaction });
      await transaction.commit();
      return res.status(200).json({
        success: true,
        message: 'Task unassigned successfully',
        data: task
      });
    }
    
    // Check if user exists
    const user = await User.findByPk(assigneeId, { transaction });
    
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await task.update({ assigneeId }, { transaction });
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Add labels to task
exports.addLabelsToTask = async (req, res, next) => {
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { labelIds } = req.body;
    
    if (!labelIds || !Array.isArray(labelIds) || labelIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Label IDs array is required'
      });
    }
    
    const task = await Task.findByPk(id, { transaction });
    
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    await task.addLabels(labelIds, { transaction });
    await transaction.commit();
    
    // Fetch the updated task with its labels
    const updatedTask = await Task.findByPk(id, {
      include: [{ model: ProjectLabel, as: 'labels' }]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Remove labels from task
exports.removeLabelsFromTask = async (req, res, next) => {
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { labelIds } = req.body;
    
    if (!labelIds || !Array.isArray(labelIds) || labelIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Label IDs array is required'
      });
    }
    
    const task = await Task.findByPk(id, { transaction });
    
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    await task.removeLabels(labelIds, { transaction });
    await transaction.commit();
    
    // Fetch the updated task with its labels
    const updatedTask = await Task.findByPk(id, {
      include: [{ model: ProjectLabel, as: 'labels' }]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Add dependency between tasks
exports.addDependency = async (req, res, next) => {
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    const { sourceTaskId, targetTaskId, type } = req.body;
    
    if (!sourceTaskId || !targetTaskId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Source and target task IDs are required'
      });
    }
    
    // Check if both tasks exist
    const sourcetask = await Task.findByPk(sourceTaskId, { transaction });
    const targetTask = await Task.findByPk(targetTaskId, { transaction });
    
    if (!sourcetask || !targetTask) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'One or both tasks not found'
      });
    }
    
    // Check for circular dependency
    const existingReverseDependency = await TaskDependency.findOne({
      where: {
        sourceTaskId: targetTaskId,
        targetTaskId: sourceTaskId,
        type: type || 'blocks'
      },
      transaction
    });
    
    if (existingReverseDependency) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot create circular dependency'
      });
    }
    
    // Check if dependency already exists
    const existingDependency = await TaskDependency.findOne({
      where: {
        sourceTaskId,
        targetTaskId
      },
      transaction
    });
    
    if (existingDependency) {
      // Update type if different
      if (existingDependency.type !== (type || 'blocks')) {
        await existingDependency.update({ type: type || 'blocks' }, { transaction });
      }
      
      await transaction.commit();
      return res.status(200).json({
        success: true,
        message: 'Dependency updated',
        data: existingDependency
      });
    }
    
    // Create new dependency
    const dependency = await TaskDependency.create({
      sourceTaskId,
      targetTaskId,
      type: type || 'blocks',
      createdBy: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(201).json({
      success: true,
      data: dependency
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Remove dependency between tasks
exports.removeDependency = async (req, res, next) => {
  // Start a transaction
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const dependency = await TaskDependency.findByPk(id, { transaction });
    
    if (!dependency) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Dependency not found'
      });
    }
    
    await dependency.destroy({ transaction });
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Dependency removed successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}; 