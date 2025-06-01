module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
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
    storyId: {
      type: DataTypes.UUID,
      references: {
        model: 'Stories',
        key: 'id'
      }
    },
    assigneeId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    reporterId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'User who created the task'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('Created', 'To Do', 'In Progress', 'In Review', 'Done', 'Closed'),
      defaultValue: 'Created'
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
      defaultValue: 'Medium'
    },
    startDate: {
      type: DataTypes.DATE
    },
    dueDate: {
      type: DataTypes.DATE,
      validate: {
        isAfterStartDate(value) {
          if (this.startDate && value && new Date(value) <= new Date(this.startDate)) {
            throw new Error('Due date must be after start date');
          }
        }
      }
    },
    completedDate: {
      type: DataTypes.DATE
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    actualHours: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    type: {
      type: DataTypes.ENUM('Task', 'Bug', 'Improvement', 'Subtask'),
      defaultValue: 'Task'
    },
    blockers: {
      type: DataTypes.TEXT
    },
    originalEstimate: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Original estimated story points'
    },
    remainingEstimate: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Remaining story points'
    },
    environment: {
      type: DataTypes.TEXT,
      comment: 'Environment details for bugs'
    },
    reproduceSteps: {
      type: DataTypes.TEXT,
      comment: 'Steps to reproduce for bugs'
    },
    acceptanceCriteria: {
      type: DataTypes.TEXT,
      comment: 'Acceptance criteria for task completion'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional task metadata'
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['storyId'] },
      { fields: ['assigneeId'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['type'] }
    ],
    hooks: {
      beforeCreate: (task) => {
        if (task.type === 'Bug' && !task.priority) {
          // Bugs default to high priority
          task.priority = 'High';
        }
        
        if (!task.remainingEstimate && task.originalEstimate) {
          task.remainingEstimate = task.originalEstimate;
        }
      },
      beforeUpdate: (task) => {
        // Update dates based on status
        if (task.changed('status')) {
          if (task.status === 'In Progress' && !task.startDate) {
            task.startDate = new Date();
          }
          
          if ((task.status === 'Done' || task.status === 'Closed') && !task.completedDate) {
            task.completedDate = new Date();
            task.remainingEstimate = 0;
          }
        }
      }
    }
  });

  return Task;
}; 