module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.UUID,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    epicId: {
      type: DataTypes.UUID,
      references: {
        model: 'Epics',
        key: 'id'
      }
    },
    storyId: {
      type: DataTypes.UUID,
      references: {
        model: 'Stories',
        key: 'id'
      }
    },
    taskId: {
      type: DataTypes.UUID,
      references: {
        model: 'Tasks',
        key: 'id'
      }
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['epicId'] },
      { fields: ['storyId'] },
      { fields: ['taskId'] },
      { fields: ['uploadedBy'] },
      { fields: ['fileType'] }
    ],
    hooks: {
      beforeCreate: (attachment) => {
        // Validate that at least one parent entity is set
        if (!attachment.projectId && !attachment.epicId && 
            !attachment.storyId && !attachment.taskId) {
          throw new Error('Attachment must be associated with at least one entity');
        }
      },
      afterDestroy: (attachment) => {
        // Delete the physical file
        const fs = require('fs');
        try {
          if (fs.existsSync(attachment.filePath)) {
            fs.unlinkSync(attachment.filePath);
          }
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }
    }
  });

  return Attachment;
}; 