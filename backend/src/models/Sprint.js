module.exports = (sequelize, DataTypes) => {
  const Sprint = sequelize.define('Sprint', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    boardId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Boards',
        key: 'id'
      }
    },
    ownerId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'User who is the Scrum Master or owner of this sprint'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    goal: {
      type: DataTypes.TEXT,
      comment: 'The sprint goal'
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE,
      validate: {
        isAfterStartDate(value) {
          if (this.startDate && value && new Date(value) <= new Date(this.startDate)) {
            throw new Error('End date must be after start date');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM('Planning', 'Active', 'Completed', 'Cancelled'),
      defaultValue: 'Planning'
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether the sprint is locked for edits'
    },
    completedPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    retrospective: {
      type: DataTypes.TEXT,
      comment: 'Notes from the sprint retrospective'
    },
    velocity: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: 'Calculated velocity for this sprint'
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Order of sprints in the project'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['boardId'] },
      { fields: ['ownerId'] },
      { fields: ['status'] },
      { fields: ['isLocked'] },
      { fields: ['startDate'] },
      { fields: ['endDate'] }
    ],
    hooks: {
      beforeCreate: (sprint) => {
        if (!sprint.startDate) {
          sprint.startDate = new Date();
        }
        
        if (!sprint.endDate && sprint.startDate) {
          // Default to 2 weeks sprint
          const endDate = new Date(sprint.startDate);
          endDate.setDate(endDate.getDate() + 14);
          sprint.endDate = endDate;
        }
      },
      beforeUpdate: (sprint) => {
        // If sprint is completed, calculate velocity
        if (sprint.changed('status') && sprint.status === 'Completed') {
          const velocity = sprint.completedPoints / 
            (Math.ceil((new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24 * 7)));
          
          sprint.velocity = parseFloat(velocity.toFixed(2));
        }
      }
    }
  });

  Sprint.associate = function(models) {
    Sprint.belongsTo(models.Board, { foreignKey: 'boardId', as: 'board' });
    Sprint.belongsTo(models.User, { foreignKey: 'ownerId', as: 'owner' });
    Sprint.hasMany(models.Story, { foreignKey: 'sprintId', as: 'stories' });
    Sprint.belongsToMany(models.Task, { through: models.SprintTask, as: 'tasks', foreignKey: 'sprintId' });
  };

  return Sprint;
}; 