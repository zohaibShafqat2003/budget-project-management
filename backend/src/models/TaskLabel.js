const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaskLabel = sequelize.define('TaskLabel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Tasks',
        key: 'id'
      }
    },
    labelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ProjectLabels',
        key: 'id'
      }
    }
  }, {
    timestamps: false,
    indexes: [
      { fields: ['taskId'] },
      { fields: ['labelId'] },
      { unique: true, fields: ['taskId', 'labelId'] }
    ]
  });

  return TaskLabel;
}; 