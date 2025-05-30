const { Expense, Project, BudgetItem } = require('../models');
const { sequelize } = require('../config/db');

// Get all expenses for a project
exports.getProjectExpenses = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const expenses = await Expense.findAll({
      where: { projectId },
      include: [
        { model: BudgetItem, as: 'budgetItem' },
        { model: Project, as: 'project' },
        { model: sequelize.models.User, as: 'creator' },
        { model: sequelize.models.User, as: 'approver' }
      ],
      order: [['date', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id, {
      include: [
        { model: BudgetItem, as: 'budgetItem' },
        { model: Project, as: 'project' },
        { model: sequelize.models.User, as: 'creator' },
        { model: sequelize.models.User, as: 'approver' }
      ]
    });
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// Create a new expense
exports.createExpense = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { projectId } = req.params;
    
    // Check if project exists
    const project = await Project.findByPk(projectId, { transaction });
    
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if budget item exists if provided
    if (req.body.budgetItemId) {
      const budgetItem = await BudgetItem.findByPk(req.body.budgetItemId, { transaction });
      
      if (!budgetItem) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Budget item not found'
        });
      }
      
      // Ensure budget item belongs to the project
      if (budgetItem.projectId !== projectId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Budget item does not belong to this project'
        });
      }
    }
    
    // Create expense
    const expense = await Expense.create({
      ...req.body,
      projectId,
      createdBy: req.user.id
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Update an expense
exports.updateExpense = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const expense = await Expense.findByPk(req.params.id, { transaction });
    
    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Check if budget item exists if provided
    if (req.body.budgetItemId) {
      const budgetItem = await BudgetItem.findByPk(req.body.budgetItemId, { transaction });
      
      if (!budgetItem) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Budget item not found'
        });
      }
      
      // Ensure budget item belongs to the project
      if (budgetItem.projectId !== expense.projectId) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Budget item does not belong to this project'
        });
      }
    }
    
    // Update expense
    await expense.update(req.body, { transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Delete an expense
exports.deleteExpense = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const expense = await Expense.findByPk(req.params.id, { transaction });
    
    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Delete expense
    await expense.destroy({ transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Approve expense
exports.approveExpense = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const expense = await Expense.findByPk(req.params.id, { transaction });
    
    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Update expense status
    await expense.update({
      paymentStatus: 'Paid',
      approvedBy: req.user.id,
      approvedAt: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Reject expense
exports.rejectExpense = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const expense = await Expense.findByPk(req.params.id, { transaction });
    
    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Update expense status
    await expense.update({
      paymentStatus: 'Rejected',
      approvedBy: req.user.id,
      approvedAt: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
}; 