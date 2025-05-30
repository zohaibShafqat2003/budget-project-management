const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SprintTask = sequelize.define('SprintTask', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sprintId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Sprints',
        key: 'id'
      }
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Tasks',
        key: 'id'
      }
    },
    addedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    completedInSprint: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indicates if the task was completed in this sprint'
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['sprintId'] },
      { fields: ['taskId'] },
      { unique: true, fields: ['sprintId', 'taskId'] }
    ]
  });

  return SprintTask;
}; 