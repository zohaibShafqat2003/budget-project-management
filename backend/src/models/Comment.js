module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    projectId: {
      type: DataTypes.UUID,
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
    storyId: {
      type: DataTypes.UUID,
      references: {
        model: 'Stories',
        key: 'id'
      }
    },
    taskId: {
      type: DataTypes.UUID,
      references: {
        model: 'Tasks',
        key: 'id'
      }
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['projectId'] },
      { fields: ['epicId'] },
      { fields: ['storyId'] },
      { fields: ['taskId'] },
      { fields: ['createdAt'] }
    ],
    hooks: {
      beforeCreate: (comment) => {
        // Validate that the comment is associated with at least one entity
        if (!comment.projectId && !comment.epicId && 
            !comment.storyId && !comment.taskId) {
          throw new Error('Comment must be associated with at least one entity');
        }
      }
    }
  });

  return Comment;
}; 