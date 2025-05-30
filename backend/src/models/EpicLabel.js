const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EpicLabel = sequelize.define('EpicLabel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    epicId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Epics',
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
      { fields: ['epicId'] },
      { fields: ['labelId'] },
      { unique: true, fields: ['epicId', 'labelId'] }
    ]
  });

  return EpicLabel;
}; 