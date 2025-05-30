const { Project, Epic, Story, Task, Sprint, User, Client, ProjectLabel } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// Advanced search across entities
exports.advancedSearch = async (req, res, next) => {
  try {
    // Get search parameters from query
    const {
      query, entity, status, priority, assigneeId,
      projectId, epicId, storyId, sprintId,
      startDate, dueDate, clientId, country, city,
      isReady, label
    } = req.query;
    
    // Determine which entity to search in
    const entityType = entity || 'all';
    
    // Build response object
    const response = {
      success: true,
      query: query || '',
      entity: entityType,
      results: {}
    };
    
    // Common text search condition (searches in title/name/summary and description)
    const textSearchCondition = query ? {
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { name: { [Op.iLike]: `%${query}%` } }
      ]
    } : {};
    
    // Common filters for all entity types
    const commonFilters = {};
    
    if (status) commonFilters.status = status;
    if (priority) commonFilters.priority = priority;
    
    // Date filters
    const dateFilters = {};
    if (startDate) dateFilters.startDate = { [Op.gte]: new Date(startDate) };
    if (dueDate) dateFilters.dueDate = { [Op.lte]: new Date(dueDate) };
    
    // Search in projects
    if (entityType === 'all' || entityType === 'projects') {
      const projectFilters = {
        ...textSearchCondition,
        ...commonFilters,
        ...dateFilters
      };
      
      if (clientId) projectFilters.clientId = clientId;
      if (country) projectFilters.country = { [Op.iLike]: `%${country}%` };
      if (city) projectFilters.city = { [Op.iLike]: `%${city}%` };
      
      const projects = await Project.findAll({
        where: projectFilters,
        include: [
          { model: Client, as: 'client' },
          { model: User, as: 'owner' }
        ],
        limit: 50
      });
      
      response.results.projects = projects;
    }
    
    // Search in epics
    if (entityType === 'all' || entityType === 'epics') {
      const epicFilters = {
        ...textSearchCondition,
        ...commonFilters,
        ...dateFilters
      };
      
      if (projectId) epicFilters.projectId = projectId;
      
      const epics = await Epic.findAll({
        where: epicFilters,
        include: [
          { model: Project, as: 'project' }
        ],
        limit: 50
      });
      
      response.results.epics = epics;
    }
    
    // Search in stories
    if (entityType === 'all' || entityType === 'stories') {
      const storyFilters = {
        ...textSearchCondition,
        ...commonFilters,
        ...dateFilters
      };
      
      if (projectId) storyFilters.projectId = projectId;
      if (epicId) storyFilters.epicId = epicId;
      if (sprintId) storyFilters.sprintId = sprintId;
      if (assigneeId) storyFilters.assigneeId = assigneeId;
      if (isReady !== undefined) storyFilters.isReady = (isReady === 'true');
      
      const stories = await Story.findAll({
        where: storyFilters,
        include: [
          { model: Epic, as: 'epic' },
          { model: User, as: 'assignee' },
          { model: Sprint, as: 'sprints' }
        ],
        limit: 50
      });
      
      response.results.stories = stories;
    }
    
    // Search in tasks
    if (entityType === 'all' || entityType === 'tasks') {
      const taskFilters = {
        ...textSearchCondition,
        ...commonFilters,
        ...dateFilters
      };
      
      if (projectId) taskFilters.projectId = projectId;
      if (storyId) taskFilters.storyId = storyId;
      if (assigneeId) taskFilters.assigneeId = assigneeId;
      
      // Handle label search
      if (label) {
        taskFilters.labels = { [Op.contains]: [label] };
      }
      
      const tasks = await Task.findAll({
        where: taskFilters,
        include: [
          { model: Story, as: 'story' },
          { model: User, as: 'assignee' }
        ],
        limit: 50
      });
      
      response.results.tasks = tasks;
    }
    
    // Search in sprints
    if (entityType === 'all' || entityType === 'sprints') {
      const sprintFilters = {
        ...commonFilters,
        ...dateFilters
      };
      
      // Adjust text search for sprints
      if (query) {
        sprintFilters[Op.or] = [
          { name: { [Op.iLike]: `%${query}%` } },
          { goal: { [Op.iLike]: `%${query}%` } }
        ];
      }
      
      if (projectId) sprintFilters.projectId = projectId;
      
      const sprints = await Sprint.findAll({
        where: sprintFilters,
        include: [
          { model: Project, as: 'project' },
          { model: User, as: 'owner' }
        ],
        limit: 50
      });
      
      response.results.sprints = sprints;
    }
    
    // Count total results
    let totalResults = 0;
    Object.keys(response.results).forEach(key => {
      totalResults += response.results[key].length;
    });
    
    response.totalResults = totalResults;
    
    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Generate project velocity report
exports.projectVelocityReport = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    // Get project
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Get completed sprints
    const sprints = await Sprint.findAll({
      where: {
        projectId,
        status: 'Completed'
      },
      order: [['endDate', 'ASC']]
    });
    
    // Calculate velocity metrics
    const velocityData = sprints.map(sprint => ({
      sprintId: sprint.id,
      sprintName: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      committedPoints: sprint.committedPoints,
      completedPoints: sprint.completedPoints,
      completionRate: sprint.committedPoints > 0 
        ? Math.round((sprint.completedPoints / sprint.committedPoints) * 100)
        : 0
    }));
    
    // Calculate average velocity (last 3 sprints)
    const recentSprints = sprints.slice(-3);
    const averageVelocity = recentSprints.length > 0
      ? Math.round(recentSprints.reduce((sum, s) => sum + s.completedPoints, 0) / recentSprints.length)
      : 0;
    
    return res.status(200).json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name
        },
        metrics: {
          totalSprints: sprints.length,
          averageVelocity,
          predictedVelocity: averageVelocity // Can be adjusted with more sophisticated algorithms
        },
        sprints: velocityData
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate project burndown report
exports.sprintBurndownReport = async (req, res, next) => {
  try {
    const { sprintId } = req.params;
    
    // Get sprint with stories and tasks
    const sprint = await Sprint.findByPk(sprintId, {
      include: [
        { 
          model: Story, 
          as: 'stories',
          include: [
            { model: Task, as: 'tasks' }
          ]
        },
        { model: Project, as: 'project' }
      ]
    });
    
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found'
      });
    }
    
    // Calculate sprint duration in days
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Generate ideal burndown line
    const idealBurndown = [];
    const dailyIdealBurndown = sprint.committedPoints / durationDays;
    
    for (let day = 0; day <= durationDays; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      
      idealBurndown.push({
        day,
        date: date.toISOString().split('T')[0],
        remainingPoints: Math.max(0, sprint.committedPoints - (dailyIdealBurndown * day))
      });
    }
    
    // Get actual burndown data (simplified for this example)
    // In a real app, you'd track task completion daily in a separate table
    const actualBurndown = [];
    
    // Use current data for completed points (simplified)
    let completedPoints = 0;
    if (sprint.stories && sprint.stories.length > 0) {
      completedPoints = sprint.stories
        .filter(story => story.status === 'Done')
        .reduce((sum, story) => sum + (story.points || 0), 0);
    }
    
    // Current day in sprint (capped at duration)
    const today = new Date();
    const currentDay = Math.min(
      Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)),
      durationDays
    );
    
    // Generate actual burndown (simplified)
    for (let day = 0; day <= currentDay; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      
      // Simple linear interpolation for this example
      // In a real app, you'd use actual daily completion data
      const dayCompletedPoints = day === currentDay 
        ? completedPoints 
        : (completedPoints / currentDay) * day;
      
      actualBurndown.push({
        day,
        date: date.toISOString().split('T')[0],
        remainingPoints: Math.max(0, sprint.committedPoints - dayCompletedPoints)
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        sprint: {
          id: sprint.id,
          name: sprint.name,
          goal: sprint.goal,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          committedPoints: sprint.committedPoints,
          completedPoints: sprint.completedPoints || completedPoints
        },
        project: {
          id: sprint.project.id,
          name: sprint.project.name
        },
        metrics: {
          durationDays,
          currentDay,
          completionPercentage: sprint.committedPoints > 0 
            ? Math.round((completedPoints / sprint.committedPoints) * 100)
            : 0
        },
        burndown: {
          ideal: idealBurndown,
          actual: actualBurndown
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate workload distribution report
exports.workloadDistributionReport = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    // Get project
    const project = await Project.findByPk(projectId, {
      include: [
        { model: User, as: 'members' }
      ]
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Get active sprint if any
    const activeSprint = await Sprint.findOne({
      where: {
        projectId,
        status: 'Active'
      }
    });
    
    // Gather workload data for each team member
    const workloadData = [];
    
    for (const member of project.members) {
      // Get all assigned tasks
      const assignedTasks = await Task.findAll({
        where: {
          projectId,
          assigneeId: member.id
        },
        include: [
          { model: Story, as: 'story' }
        ]
      });
      
      // Get tasks in current sprint
      const sprintTasks = activeSprint
        ? assignedTasks.filter(task => 
            task.story && 
            task.story.sprintId === activeSprint.id
          )
        : [];
      
      // Calculate story points
      const totalPoints = assignedTasks.reduce((sum, task) => {
        if (task.story) {
          return sum + (task.story.points || 0);
        }
        return sum;
      }, 0);
      
      const sprintPoints = sprintTasks.reduce((sum, task) => {
        if (task.story) {
          return sum + (task.story.storyPoints || 0);
        }
        return sum;
      }, 0);
      
      // Count tasks by status
      const tasksByStatus = {};
      assignedTasks.forEach(task => {
        tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1;
      });
      
      workloadData.push({
        user: {
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          role: member.role
        },
        metrics: {
          totalAssignedTasks: assignedTasks.length,
          tasksInCurrentSprint: sprintTasks.length,
          totalStoryPoints: totalPoints,
          sprintStoryPoints: sprintPoints,
          tasksByStatus
        }
      });
    }
    
    // Sort by workload (highest first)
    workloadData.sort((a, b) => b.metrics.totalStoryPoints - a.metrics.totalStoryPoints);
    
    return res.status(200).json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name
        },
        currentSprint: activeSprint 
          ? {
              id: activeSprint.id,
              name: activeSprint.name
            }
          : null,
        teamSize: project.members.length,
        workloadDistribution: workloadData
      }
    });
  } catch (error) {
    next(error);
  }
}; 