const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
      allowNull: true, 
      references: {
        model: 'Projects', 
        key: 'id'
      },
      comment: 'If null, this is a global report'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.ENUM('Filter', 'Report', 'Dashboard'),
      allowNull: false,
      defaultValue: 'Filter'
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Task',
      comment: 'The entity this report targets (e.g., "Task", "Story", "Project")'
    },
    query: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: 'JSON query parameters (e.g., { status: "Done", priority: "High" })'
    },
    columns: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'List of columns to display in the report'
    },
    sortBy: {
      type: DataTypes.STRING(50),
      comment: 'Field to sort by'
    },
    sortDirection: {
      type: DataTypes.ENUM('ASC', 'DESC'),
      defaultValue: 'ASC'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'If true, visible to all users in the project'
    },
    lastRun: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'Reports', 
    timestamps: true,
    paranoid: true, 
    deletedAt: 'deletedAt', 
    indexes: [
      { fields: ['userId'] },
      { fields: ['projectId'] },
      { fields: ['type'] },
      { fields: ['entityType'] },
      { fields: ['isPublic'] }
    ]
  });

  return Report;
}; 