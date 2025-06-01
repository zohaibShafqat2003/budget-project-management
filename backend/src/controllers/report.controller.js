const { Project } = require('../models');
const { Budget } = require('../models');
const { Expense } = require('../models');
const { User } = require('../models');
const { Task } = require('../models');
const { Sprint } = require('../models');
const { Client } = require('../models');
const { Sequelize, Op } = require('sequelize');
const logger = require('../config/logger');
const { formatCurrency } = require('../utils/format.utils');
const { generateAIInsights } = require('../services/ai.service');

/**
 * Get project summary reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Project summary report data
 */
const getProjectSummaryReports = async (req, res) => {
  try {
    // Get project status distribution
    const projectStatusData = await Project.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status'],
      where: {
        deletedAt: null
      }
    });

    // Get project timeline data
    const projectTimelineData = await Project.findAll({
      attributes: [
        'id',
        'name',
        'startDate',
        'completionDate',
        'status',
        'progress'
      ],
      where: {
        deletedAt: null
      },
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });

    // Get AI-generated project summaries
    // For demo, we'll just return static data for now
    const projectSummaries = await Project.findAll({
      attributes: [
        'id',
        'name',
        'status',
        'progress',
        'totalBudget',
        'startDate',
        'completionDate',
        'description'
      ],
      where: {
        deletedAt: null,
        status: {
          [Op.not]: 'Completed'
        }
      },
      limit: 3,
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['name']
        }
      ]
    });

    // Format the summaries for AI-like response
    const formattedSummaries = projectSummaries.map(project => {
      const usedBudget = project.totalBudget * (project.progress / 100);
      const budgetUtilization = Math.round((usedBudget / project.totalBudget) * 100);
      
      return {
        id: project.id,
        name: project.name,
        progress: project.progress,
        status: project.status,
        client: project.client ? project.client.name : 'No Client',
        budgetUtilization: budgetUtilization,
        totalBudget: formatCurrency(project.totalBudget),
        completionDate: project.completionDate,
        summary: generateProjectSummary(project.name, project.progress, project.completionDate, budgetUtilization)
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        projectStatusData,
        projectTimelineData,
        projectSummaries: formattedSummaries
      }
    });
  } catch (error) {
    logger.error('Error generating project summary reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate project summary reports',
      error: error.message
    });
  }
};

/**
 * Get budget analysis reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Budget analysis report data
 */
const getBudgetAnalysisReports = async (req, res) => {
  try {
    // Get budget utilization trends
    const budgetTrends = await Project.findAll({
      attributes: [
        'id',
        'name',
        'totalBudget',
        'progress'
      ],
      where: {
        deletedAt: null
      },
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });

    // Calculate budget utilization for each project
    const budgetUtilizationData = budgetTrends.map(project => {
      const usedBudget = project.totalBudget * (project.progress / 100);
      return {
        id: project.id,
        name: project.name,
        totalBudget: project.totalBudget,
        usedBudget: usedBudget,
        utilizationPercentage: Math.round((usedBudget / project.totalBudget) * 100)
      };
    });

    // Get expense distribution by category
    const expenseDistribution = await Expense.findAll({
      attributes: [
        'category',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
      ],
      group: ['category'],
      where: {
        deletedAt: null
      }
    });

    // Get AI budget analysis
    // For demo, we'll just return static data for now
    const budgetAnalysis = {
      budgetEfficiency: 85,
      costSavingOpportunities: 7800,
      recommendations: [
        {
          project: 'Mobile App Development',
          description: 'Optimize cloud infrastructure',
          potentialSavings: 4200
        },
        {
          project: 'All Projects',
          description: 'Consolidate software licenses',
          potentialSavings: 2100
        },
        {
          project: 'Marketing Campaign',
          description: 'Streamline content creation workflows',
          potentialSavings: 1500
        }
      ]
    };

    return res.status(200).json({
      success: true,
      data: {
        budgetUtilizationData,
        expenseDistribution,
        budgetAnalysis
      }
    });
  } catch (error) {
    logger.error('Error generating budget analysis reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate budget analysis reports',
      error: error.message
    });
  }
};

/**
 * Get team performance reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Team performance report data
 */
const getTeamPerformanceReports = async (req, res) => {
  try {
    // Get team utilization data
    const teamUtilizationData = await User.findAll({
      attributes: ['id', 'firstName', 'lastName'],
      include: [
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['id', 'projectId'],
          where: {
            status: {
              [Op.not]: 'Completed'
            },
            deletedAt: null
          },
          required: false
        }
      ]
    });

    // Format team utilization data
    const formattedTeamData = teamUtilizationData.map(user => {
      const projectIds = new Set();
      user.assignedTasks.forEach(task => {
        if (task.projectId) {
          projectIds.add(task.projectId);
        }
      });

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        assignedTasksCount: user.assignedTasks.length,
        projectsCount: projectIds.size,
        projects: Array.from(projectIds)
      };
    });

    // Get productivity metrics
    // For demo, we'll use static data for now
    const productivityMetrics = {
      overall: 92,
      trend: [
        { month: 'Jan', productivity: 85 },
        { month: 'Feb', productivity: 88 },
        { month: 'Mar', productivity: 90 },
        { month: 'Apr', productivity: 92 }
      ],
      teamMembers: formattedTeamData.map(member => ({
        id: member.id,
        name: member.name,
        productivity: 85 + Math.floor(Math.random() * 15) // Random productivity score between 85-100
      }))
    };

    // AI-generated team performance analysis
    const teamAnalysis = {
      resourceAllocation: {
        overallocatedMembers: formattedTeamData
          .filter(member => member.assignedTasksCount > 10 || member.projectsCount > 2)
          .map(member => member.name),
        underutilizedMembers: formattedTeamData
          .filter(member => member.assignedTasksCount < 3 && member.projectsCount < 2)
          .map(member => member.name),
        recommendation: "Redistribute tasks to balance workload across team members."
      },
      skillGapAnalysis: {
        identifiedGaps: ["Backend Development", "API Integration", "Database Optimization"],
        recommendation: "Consider upskilling team members or bringing in specialized contractors for critical phases."
      }
    };

    return res.status(200).json({
      success: true,
      data: {
        teamUtilization: formattedTeamData,
        productivityMetrics,
        teamAnalysis
      }
    });
  } catch (error) {
    logger.error('Error generating team performance reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate team performance reports',
      error: error.message
    });
  }
};

/**
 * Get AI insight reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} AI-generated insight data
 */
const getAIInsightReports = async (req, res) => {
  try {
    // Get project data for AI analysis
    const projects = await Project.findAll({
      attributes: [
        'id',
        'name',
        'status',
        'progress',
        'totalBudget',
        'startDate',
        'completionDate',
        'createdAt',
        'updatedAt'
      ],
      where: {
        deletedAt: null
      },
      include: [
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'status'],
          required: false
        },
        {
          model: Expense,
          as: 'expenses',
          attributes: ['id', 'amount'],
          required: false
        }
      ]
    });

    // Format projects for AI analysis
    const formattedProjects = projects.map(project => {
      const totalExpenses = project.expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const budgetUtilization = Math.round((totalExpenses / project.totalBudget) * 100);
      const completedTasks = project.tasks.filter(task => task.status === 'Completed').length;
      const totalTasks = project.tasks.length;
      
      return {
        id: project.id,
        name: project.name,
        status: project.status,
        progress: project.progress,
        budgetUtilization,
        totalBudget: project.totalBudget,
        totalExpenses,
        taskCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        startDate: project.startDate,
        completionDate: project.completionDate
      };
    });

    // Generate AI insights
    // For demo, we'll use static data for now
    const aiInsights = {
      projectRiskAssessment: [
        {
          projectName: "Marketing Campaign",
          riskLevel: "High",
          budgetOverrunProbability: 75,
          timelineSlippageProbability: 40,
          recommendation: "Implement weekly budget reviews and consider scope reduction."
        },
        {
          projectName: "Website Redesign",
          riskLevel: "Medium",
          budgetOverrunProbability: 30,
          timelineSlippageProbability: 30,
          recommendation: "Allocate additional QA resources to mitigate potential delays."
        },
        {
          projectName: "Mobile App Development",
          riskLevel: "Low",
          budgetOverrunProbability: 15,
          timelineSlippageProbability: 20,
          recommendation: "Monitor integration phase closely as risks may increase."
        }
      ],
      performancePrediction: {
        deadlineMeetingProjects: 4,
        totalActiveProjects: 5,
        projectedBudgetVariance: 5,
        productivityIncrease: 8,
        projectionsDetail: [
          {
            projectName: "Marketing Campaign",
            timelineProjection: "1 week extension likely",
            budgetProjection: "15% over budget"
          },
          {
            projectName: "Website Redesign",
            timelineProjection: "On schedule",
            budgetProjection: "Within 5% of budget"
          },
          {
            projectName: "Mobile App Development",
            timelineProjection: "On schedule",
            budgetProjection: "Within 3% of budget"
          }
        ]
      },
      strategicRecommendations: [
        {
          recommendation: "Accelerate E-commerce Platform start",
          benefit: "Better resource distribution across team",
          priority: "High"
        },
        {
          recommendation: "Merge Brand Identity and Website Redesign aspects",
          benefit: "Create synergies and reduce duplication",
          priority: "Medium"
        },
        {
          recommendation: "Implement agile approach for Marketing Campaign",
          benefit: "Better budget control with weekly checkpoints",
          priority: "High"
        },
        {
          recommendation: "Invest in backend development upskilling",
          benefit: "Address identified skill gap",
          priority: "Medium"
        }
      ]
    };

    return res.status(200).json({
      success: true,
      data: {
        projectData: formattedProjects,
        aiInsights
      }
    });
  } catch (error) {
    logger.error('Error generating AI insight reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI insight reports',
      error: error.message
    });
  }
};

/**
 * Export reports in various formats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Export status
 */
const exportReports = async (req, res) => {
  try {
    const { reportType, format } = req.body;
    
    // In a real implementation, this would generate a PDF, CSV or other format
    // For demo purposes, we'll just return a success message
    
    return res.status(200).json({
      success: true,
      message: `Report exported successfully in ${format} format`,
      downloadUrl: `/exports/${reportType}_${Date.now()}.${format}`
    });
  } catch (error) {
    logger.error('Error exporting reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export reports',
      error: error.message
    });
  }
};

// Helper function to generate project summary
const generateProjectSummary = (projectName, progress, completionDate, budgetUtilization) => {
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `The ${projectName} project is currently ${progress}% complete and ${progress >= 50 ? 'on track' : 'behind schedule'} to meet its ${formattedDate} deadline. Budget utilization is at ${budgetUtilization}%, which ${Math.abs(progress - budgetUtilization) <= 10 ? 'aligns with' : 'differs from'} the project progress. ${getBudgetRecommendation(progress, budgetUtilization)}`;
};

// Helper function to get budget recommendation
const getBudgetRecommendation = (progress, budgetUtilization) => {
  if (budgetUtilization > progress + 10) {
    return 'The budget is being consumed faster than project progress, suggesting potential cost overruns. Consider reviewing expense allocations and identifying cost-saving opportunities.';
  } else if (budgetUtilization < progress - 10) {
    return 'The budget utilization is lower than expected given the project progress. This may indicate efficient resource use or potential underreporting of expenses.';
  } else {
    return 'Budget utilization is well-aligned with project progress, indicating good financial management.';
  }
};

module.exports = {
  getProjectSummaryReports,
  getBudgetAnalysisReports,
  getTeamPerformanceReports,
  getAIInsightReports,
  exportReports
}; 