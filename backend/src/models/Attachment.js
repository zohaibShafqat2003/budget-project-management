const fs = require('fs');
const path = require('path');

module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Projects',
        key: 'id'
      },
      index: true
    },
    epicId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Epics',
        key: 'id'
      },
      index: true
    },
    storyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Stories',
        key: 'id'
      },
      index: true
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Tasks',
        key: 'id'
      },
      index: true
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      index: true
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
      allowNull: false,
      index: true
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      index: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      index: true
    },
    parentAttachmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Attachments',
        key: 'id'
      },
      index: true
    },
    isLatestVersion: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      index: true
    },
    versionComment: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['projectId'] },
      { fields: ['epicId'] },
      { fields: ['storyId'] },
      { fields: ['taskId'] },
      { fields: ['uploadedBy'] },
      { fields: ['fileType'] },
      { fields: ['parentAttachmentId'] },
      { fields: ['isLatestVersion'] },
      {
        name: 'attachment_project_latest_idx',
        fields: ['projectId', 'isLatestVersion']
      },
      {
        name: 'attachment_epic_latest_idx',
        fields: ['epicId', 'isLatestVersion']
      },
      {
        name: 'attachment_story_latest_idx',
        fields: ['storyId', 'isLatestVersion']
      },
      {
        name: 'attachment_task_latest_idx',
        fields: ['taskId', 'isLatestVersion']
      },
      {
        name: 'attachment_parent_version_idx',
        fields: ['parentAttachmentId', 'versionNumber']
      },
      {
        name: 'attachment_uploaded_date_idx',
        fields: ['uploadedBy', 'createdAt']
      }
    ],
    hooks: {
      beforeCreate: (attachment) => {
        if (!attachment.projectId && !attachment.epicId && 
            !attachment.storyId && !attachment.taskId) {
          throw new Error('Attachment must be associated with at least one entity');
        }
      },
      beforeDestroy: async (attachment, options = {}) => {
        try {
          if (attachment.filePath && fs.existsSync(attachment.filePath)) {
            fs.unlinkSync(attachment.filePath);
            console.log(`Deleted file: ${attachment.filePath}`);
          }
          
          if (!attachment.parentAttachmentId) {
            const transaction = options.transaction;
            
            const childVersions = await sequelize.models.Attachment.findAll({
              where: { parentAttachmentId: attachment.id },
              ...(transaction ? { transaction } : {})
            });
            
            for (const child of childVersions) {
              if (child.filePath && fs.existsSync(child.filePath)) {
                fs.unlinkSync(child.filePath);
                console.log(`Deleted version file: ${child.filePath}`);
              }
              
              await child.destroy(transaction ? { transaction } : {});
            }
          }
        } catch (error) {
          console.error('Error in beforeDestroy hook:', error);
        }
      }
    }
  });

  Attachment.associate = (models) => {
    Attachment.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project'
    });
    
    Attachment.belongsTo(models.Epic, {
      foreignKey: 'epicId',
      as: 'epic'
    });
    
    Attachment.belongsTo(models.Story, {
      foreignKey: 'storyId',
      as: 'story'
    });
    
    Attachment.belongsTo(models.Task, {
      foreignKey: 'taskId',
      as: 'task'
    });
    
    Attachment.belongsTo(models.User, {
      foreignKey: 'uploadedBy',
      as: 'uploader'
    });
    
    Attachment.belongsTo(models.Attachment, {
      foreignKey: 'parentAttachmentId',
      as: 'parentAttachment'
    });
    
    Attachment.hasMany(models.Attachment, {
      foreignKey: 'parentAttachmentId',
      as: 'versions'
    });
  };
  
  Attachment.prototype.getUrl = function() {
    return `/api/attachments/${this.id}/generate-url`;
  };
  
  Attachment.prototype.isImage = function() {
    return this.fileType.startsWith('image/');
  };
  
  Attachment.prototype.isDocument = function() {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];
    
    return documentTypes.includes(this.fileType);
  };
  
  Attachment.prototype.getExtension = function() {
    return path.extname(this.originalName).toLowerCase();
  };

  return Attachment;
}; 