const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Expense = sequelize.define('Expense', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    budgetItemId: {
      type: DataTypes.UUID,
      references: {
        model: 'BudgetItems',
        key: 'id'
      },
      comment: 'Optional reference to the budget item this expense is associated with'
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: 'Expense category (e.g., "Development", "Marketing")'
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      comment: 'Method of payment (e.g., "Credit Card", "Wire Transfer")'
    },
    paymentStatus: {
      type: DataTypes.ENUM('Pending', 'Paid', 'Rejected'),
      defaultValue: 'Pending'
    },
    receiptUrl: {
      type: DataTypes.STRING,
      comment: 'URL to the receipt image/document'
    },
    approvedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'User who approved this expense'
    },
    approvedAt: {
      type: DataTypes.DATE
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'User who created this expense'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['budgetItemId'] },
      { fields: ['category'] },
      { fields: ['date'] },
      { fields: ['paymentStatus'] },
      { fields: ['createdBy'] },
      { fields: ['approvedBy'] }
    ],
    hooks: {
      afterCreate: async (expense, options) => {
        try {
          const Project = sequelize.models.Project;
          
          // Update project's used budget
          await Project.increment('usedBudget', {
            by: expense.amount,
            where: { id: expense.projectId },
            transaction: options.transaction
          });

          // Update budgetItem usedAmount if it exists
          if (expense.budgetItemId) {
            const BudgetItem = sequelize.models.BudgetItem;
            await BudgetItem.increment('usedAmount', {
              by: expense.amount,
              where: { id: expense.budgetItemId },
              transaction: options.transaction
            });
          }
        } catch (error) {
          console.error('Error updating project budget:', error);
        }
      },
      afterUpdate: async (expense, options) => {
        try {
          // If amount changed, update project budget
          if (expense.changed('amount')) {
            const Project = sequelize.models.Project;
            const amountDiff = expense.amount - expense.previous('amount');
            
            // Update project's used budget
            await Project.increment('usedBudget', {
              by: amountDiff,
              where: { id: expense.projectId },
              transaction: options.transaction
            });

            // Update budgetItem usedAmount if it exists
            if (expense.budgetItemId) {
              const BudgetItem = sequelize.models.BudgetItem;
              await BudgetItem.increment('usedAmount', {
                by: amountDiff,
                where: { id: expense.budgetItemId },
                transaction: options.transaction
              });
            }
          }
        } catch (error) {
          console.error('Error updating project budget:', error);
        }
      },
      afterDestroy: async (expense, options) => {
        try {
          const Project = sequelize.models.Project;
          
          // Update project's used budget when expense is deleted
          await Project.decrement('usedBudget', {
            by: expense.amount,
            where: { id: expense.projectId },
            transaction: options.transaction
          });

          // Update budgetItem usedAmount if it exists
          if (expense.budgetItemId) {
            const BudgetItem = sequelize.models.BudgetItem;
            await BudgetItem.decrement('usedAmount', {
              by: expense.amount,
              where: { id: expense.budgetItemId },
              transaction: options.transaction
            });
          }
        } catch (error) {
          console.error('Error updating project budget after deletion:', error);
        }
      }
    }
  });

  return Expense;
}; 