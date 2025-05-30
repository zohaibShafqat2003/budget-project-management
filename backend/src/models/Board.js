module.exports = (sequelize, DataTypes) => {
  const Board = sequelize.define('Board', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    filterJQL: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Projects', key: 'id' }
    },
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    timestamps: true
  });

  Board.associate = models => {
    Board.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    Board.hasMany(models.Sprint, { foreignKey: 'boardId', as: 'sprints' });
  };

  return Board;
}; 