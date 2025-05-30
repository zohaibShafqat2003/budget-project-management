const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkflowTransition = sequelize.define('WorkflowTransition', {
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
    fromStatus: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    toStatus: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    condition: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'JSON conditions that must be satisfied for this transition (e.g., {"requireAssignee": true})'
    },
    screenId: {
      type: DataTypes.UUID,
      comment: 'Optional reference to a screen to display during this transition'
    },
    isGlobal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'If true, applies to all projects'
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['fromStatus'] },
      { fields: ['toStatus'] }
    ]
  });

  return WorkflowTransition;
}; 