module.exports = (sequelize, DataTypes) => {
  const TaskDependency = sequelize.define('TaskDependency', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sourceTaskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Tasks',
        key: 'id'
      }
    },
    targetTaskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Tasks',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('blocks', 'is-blocked-by', 'relates-to', 'duplicates', 'is-duplicated-by'),
      defaultValue: 'blocks'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['sourceTaskId'] },
      { fields: ['targetTaskId'] },
      { unique: true, fields: ['sourceTaskId', 'targetTaskId', 'type'] }
    ]
  });

  return TaskDependency;
}; 