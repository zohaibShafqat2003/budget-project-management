const { BudgetItem, Project, Expense } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// List budget items for a project
exports.getProjectBudgetItems = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { category, status, startDate, endDate } = req.query;
    
    // Build filter
    const where = { projectId };
    
    if (category) where.category = category;
    if (status) where.status = status;
    
    // Date filters
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate[Op.gte] = new Date(startDate);
      if (endDate) where.startDate[Op.lte] = new Date(endDate);
    }
    
    const items = await BudgetItem.findAll({
      where,
      order: [['startDate', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// Get a single budget item by ID
exports.getBudgetItemById = async (req, res, next) => {
  try {
    const budgetItem = await BudgetItem.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project' },
        { model: Expense, as: 'expenses' }
      ]
    });
    
    if (!budgetItem) {
      return res.status(404).json({
        success: false,
        message: 'Budget item not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: budgetItem
    });
  } catch (error) {
    next(error);
  }
};

// Create a new budget item
exports.createBudgetItem = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Check if project exists
      const project = await Project.findByPk(projectId, { transaction });
      
      if (!project) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      
      // Create budget item
      const budgetItem = await BudgetItem.create({
        ...req.body,
        projectId
      }, { transaction });
      
      // Update project's total budget
      const amount = parseFloat(budgetItem.amount) || 0;
      await project.increment('totalBudget', { 
        by: amount,
        transaction 
      });
      
      await transaction.commit();
      
      return res.status(201).json({
        success: true,
        data: budgetItem
      });
    } catch (error) {
      // Make sure to rollback the transaction on error
      if (transaction) await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Update a budget item
exports.updateBudgetItem = async (req, res, next) => {
  try {
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
      const budgetItem = await BudgetItem.findByPk(req.params.id, { transaction });
      
      if (!budgetItem) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Budget item not found'
        });
      }
      
      // Calculate budget difference if amount is being updated
      if (req.body.amount && budgetItem.amount !== parseFloat(req.body.amount)) {
        const oldAmount = parseFloat(budgetItem.amount) || 0;
        const newAmount = parseFloat(req.body.amount) || 0;
        const difference = newAmount - oldAmount;
        
        // Update project's total budget to reflect the change
        const project = await Project.findByPk(budgetItem.projectId, { transaction });
        if (project) {
          await project.increment('totalBudget', { 
            by: difference,
            transaction 
          });
        }
      }
      
      // Update budget item
      await budgetItem.update(req.body, { transaction });
      
      await transaction.commit();
      
      return res.status(200).json({
        success: true,
        data: budgetItem
      });
    } catch (error) {
      // Make sure to rollback the transaction on error
      if (transaction) await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Delete a budget item
exports.deleteBudgetItem = async (req, res, next) => {
  try {
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      const budgetItem = await BudgetItem.findByPk(req.params.id, { transaction });
      
      if (!budgetItem) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Budget item not found'
        });
      }
      
      // Check if there are expenses associated with this budget item
      const expenseCount = await Expense.count({
        where: { budgetItemId: budgetItem.id },
        transaction
      });
      
      if (expenseCount > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Cannot delete budget item with associated expenses'
        });
      }
      
      // Get project to update totalBudget
      const project = await Project.findByPk(budgetItem.projectId, { transaction });
      if (project) {
        const amount = parseFloat(budgetItem.amount) || 0;
        await project.decrement('totalBudget', { 
          by: amount,
          transaction 
        });
      }
      
      // Delete budget item
      await budgetItem.destroy({ transaction });
      
      await transaction.commit();
      
      return res.status(200).json({
        success: true,
        message: 'Budget item deleted successfully'
      });
    } catch (error) {
      // Make sure to rollback the transaction on error
      if (transaction) await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Get budget summary for a project
exports.getProjectBudgetSummary = async (req, res, next) => {
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
    
    // Get budget summary by category
    const byCategory = await BudgetItem.findAll({
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalPlanned'],
        [sequelize.fn('SUM', sequelize.col('usedAmount')), 'totalUsed']
      ],
      where: { projectId },
      group: ['category']
    });
    
    // Get budget summary by status
    const byStatus = await BudgetItem.findAll({
      attributes: [
        'status',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalPlanned'],
        [sequelize.fn('SUM', sequelize.col('usedAmount')), 'totalUsed']
      ],
      where: { projectId },
      group: ['status']
    });
    
    return res.status(200).json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          totalBudget: project.totalBudget,
          usedBudget: project.usedBudget
        },
        summary: {
          byCategory,
          byStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
}; 