module.exports = (sequelize, DataTypes) => {
const BudgetItem = sequelize.define('BudgetItem', {
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
  name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: 'Category of the budget item (e.g., "Development", "Marketing")'
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    usedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
      validate: {
        min: 0
      }
  },
    startDate: {
      type: DataTypes.DATE
  },
    endDate: {
      type: DataTypes.DATE
  },
  status: {
      type: DataTypes.ENUM('Active', 'Completed', 'On Hold', 'Cancelled'),
      defaultValue: 'Active'
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      defaultValue: 'Medium'
    },
    notes: {
      type: DataTypes.TEXT
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['category'] },
      { fields: ['status'] }
    ],
    hooks: {
      beforeCreate: (budgetItem) => {
        if (!budgetItem.startDate) {
          budgetItem.startDate = new Date();
        }
      },
      // Instead of using afterCreate/afterUpdate/afterDestroy hooks, which might not 
      // properly handle transactions, we'll let the controller handle budget updates
    }
  });

  return BudgetItem;
}; 