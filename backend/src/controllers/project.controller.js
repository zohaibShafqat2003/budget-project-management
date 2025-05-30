const { Project, Epic, Client, User, BudgetItem } = require('../models');
const { Op } = require('sequelize');

// Get all projects with filtering
exports.getAllProjects = async (req, res, next) => {
  try {
    const {
      projectIdStr, name, clientId, status, priority,
      country, city, startDate, completionDate
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (projectIdStr) filter.projectIdStr = { [Op.iLike]: `%${projectIdStr}%` };
    if (name) filter.name = { [Op.iLike]: `%${name}%` };
    if (clientId) filter.clientId = clientId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (country) filter.country = { [Op.iLike]: `%${country}%` };
    if (city) filter.city = { [Op.iLike]: `%${city}%` };
    
    // Date ranges
    if (startDate) filter.startDate = { [Op.gte]: new Date(startDate) };
    if (completionDate) filter.completionDate = { [Op.lte]: new Date(completionDate) };
    
    const projects = await Project.findAll({
      where: filter,
      include: [
        { model: Client, as: 'client' },
        { model: User, as: 'owner' },
        { model: User, as: 'members' }
      ],
      order: [['updatedAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// Get project details with epics, budget items
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'client' },
        { model: Epic, as: 'epics' },
        { model: User, as: 'owner' },
        { model: User, as: 'members' },
        { model: BudgetItem, as: 'budgetItems' }
      ]
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Create a new project
exports.createProject = async (req, res, next) => {
  try {
    // Generate projectIdStr if not provided
    const projectData = { ...req.body };
    
    if (!projectData.projectIdStr && projectData.name) {
      // Create a simple projectIdStr from the name - the model hooks will handle uniqueness
      const prefix = projectData.name.substring(0, 4).toUpperCase();
      projectData.projectIdStr = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    
    // Ensure ownerId is set to current user
    projectData.ownerId = req.user.id;
    
    const project = await Project.create(projectData);
    
    // Add owner as a member
    if (project) {
      await project.addMember(req.user.id);
    }
    
    return res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Update a project
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Calculate progress if not explicitly set
    if (!req.body.progress && req.body.status) {
      switch (req.body.status) {
        case 'Not Started':
          req.body.progress = 0;
          break;
        case 'Active':
          req.body.progress = 25;
          break;
        case 'In Progress':
          req.body.progress = 50;
          break;
        case 'Review':
          req.body.progress = 80;
          break;
        case 'Completed':
          req.body.progress = 100;
          req.body.completionDate = new Date();
          break;
        case 'On Hold':
          // Keep existing progress
          req.body.progress = project.progress;
          break;
        case 'Archived':
          // Assume completed when archived
          req.body.progress = 100;
          break;
      }
    }
    
    await project.update(req.body);
    
    return res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Delete a project
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // This now uses soft delete since paranoid:true is set in the model
    await project.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add team members to a project
exports.addTeamMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs'
      });
    }
    
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    await project.addMembers(userIds);
    
    // Get updated members
    const updatedProject = await Project.findByPk(id, {
      include: [{ model: User, as: 'members' }]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedProject.members
    });
  } catch (error) {
    next(error);
  }
};

// Remove team members from a project
exports.removeTeamMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs'
      });
    }
    
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    await project.removeMembers(userIds);
    
    return res.status(200).json({
      success: true,
      message: 'Team members removed successfully'
    });
  } catch (error) {
    next(error);
  }
}; 