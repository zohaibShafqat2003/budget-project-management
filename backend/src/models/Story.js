module.exports = (sequelize, DataTypes) => {
  const Story = sequelize.define('Story', {
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
    epicId: {
      type: DataTypes.UUID,
      references: {
        model: 'Epics',
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
      }
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
      type: DataTypes.ENUM('To Do', 'In Progress', 'Review', 'Done'),
      defaultValue: 'To Do'
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
      defaultValue: 'Medium'
    },
    isReady: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Has the PO marked this story ready for sprint planning?'
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'Story points for effort estimation'
    },
    acceptanceCriteria: {
      type: DataTypes.TEXT,
      comment: 'Acceptance criteria for the story'
    },
    startDate: {
      type: DataTypes.DATE
    },
    dueDate: {
      type: DataTypes.DATE
    },
    completedDate: {
      type: DataTypes.DATE
    },
    sprintId: {
      type: DataTypes.UUID,
      references: {
        model: 'Sprints',
        key: 'id'
      }
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Order within epic or project backlog'
    },
    businessValue: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Business value score (0-100)'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['epicId'] },
      { fields: ['assigneeId'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['sprintId'] },
      { fields: ['isReady'] }
    ],
    hooks: {
      beforeUpdate: (story) => {
        // Update dates based on status changes
        if (story.changed('status')) {
          if (story.status === 'In Progress' && !story.startDate) {
            story.startDate = new Date();
          }
          
          if (story.status === 'Done' && !story.completedDate) {
            story.completedDate = new Date();
          }
        }
      }
    }
  });

  return Story;
}; 