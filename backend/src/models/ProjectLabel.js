module.exports = (sequelize, DataTypes) => {
  const ProjectLabel = sequelize.define('ProjectLabel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#0052CC',
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['name'] }
    ]
  });

  return ProjectLabel;
}; 