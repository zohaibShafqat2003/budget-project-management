const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'The action performed (e.g., "create", "update", "delete", "status_change")'
    },
    entity: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'The entity type affected (e.g., "Project", "Epic", "Story", "Task")'
    },
    details: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Details of the action, including before/after values for changes'
    },
    ipAddress: {
      type: DataTypes.STRING,
      comment: 'IP address of the user who performed the action'
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['epicId'] },
      { fields: ['storyId'] },
      { fields: ['taskId'] },
      { fields: ['userId'] },
      { fields: ['action'] },
      { fields: ['entity'] },
      { fields: ['createdAt'] }
    ]
  });

  return ActivityLog;
}; 