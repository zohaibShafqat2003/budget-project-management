const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StoryLabel = sequelize.define('StoryLabel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    storyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Stories',
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
      { fields: ['storyId'] },
      { fields: ['labelId'] },
      { unique: true, fields: ['storyId', 'labelId'] }
    ]
  });

  return StoryLabel;
}; 