module.exports = (sequelize, DataTypes) => {
  const Epic = sequelize.define('Epic', {
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
    ownerId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('To Do', 'In Progress', 'Done'),
      defaultValue: 'To Do'
    },
    startDate: {
      type: DataTypes.DATE
    },
    endDate: {
      type: DataTypes.DATE
    },
    color: {
      type: DataTypes.STRING(7),
      validate: {
        is: /^#[0-9A-F]{6}$/i
      },
      comment: 'Color for the epic in hex format (e.g., "#FF5733")'
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Order of the epic in the project'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    paranoid: true, // Add soft delete with deletedAt timestamp
    indexes: [
      { fields: ['projectId'] },
      { fields: ['ownerId'] },
      { fields: ['status'] }
    ]
  });

  return Epic;
}; 