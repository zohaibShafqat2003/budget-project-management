module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectIdStr: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      },
      comment: 'Unique string ID for the project (e.g., "PROJ-123")'
    },
    name: {
      type: DataTypes.STRING(3550),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 3550]
      }
    },
    clientId: {
      type: DataTypes.UUID,
      references: {
        model: 'Clients',
        key: 'id'
      }
    },
    ownerId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      },
      comment: 'The user who created the project or is the project manager'
    },
    duration: {
      type: DataTypes.STRING(50),
      comment: 'Duration of the project (e.g., "6 months")'
    },
    startDate: {
      type: DataTypes.DATE
    },
    completionDate: {
      type: DataTypes.DATE
    },
    approxValueOfServices: {
      type: DataTypes.DECIMAL(15, 2),
      comment: 'Approximate value of services (e.g., 50000.00)'
    },
    narrativeDescription: {
      type: DataTypes.TEXT,
      comment: 'Project purpose description'
    },
    actualServicesDescription: {
      type: DataTypes.TEXT,
      comment: 'Description of services actually delivered'
    },
    country: {
      type: DataTypes.STRING(100),
      comment: 'Country where the project is implemented'
    },
    city: {
      type: DataTypes.STRING(100),
      comment: 'City where the project is implemented'
    },
    nameOfClient: {
      type: DataTypes.STRING(255),
      comment: 'Name of the client, redundant with Client.name for reporting'
    },
    type: {
      type: DataTypes.ENUM('Scrum', 'Kanban'),
      defaultValue: 'Scrum',
      comment: 'Project methodology type'
    },
    status: {
      type: DataTypes.ENUM('Not Started', 'Active', 'In Progress', 'Review', 'Completed', 'Archived', 'On Hold'),
      defaultValue: 'Active'
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Overall project progress in percentage'
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
      defaultValue: 'Medium'
    },
    totalBudget: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'Planned budget for the project'
    },
    usedBudget: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: 'Actual expenses incurred so far'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional project metadata including custom fields, workflow configuration, velocity'
    }
  }, {
    timestamps: true,
    paranoid: true, // Add soft delete with deletedAt timestamp
    indexes: [
      { fields: ['projectIdStr'] },
      { fields: ['name'] },
      { fields: ['clientId'] },
      { fields: ['ownerId'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['country'] },
      { fields: ['city'] }
    ],
    hooks: {
      beforeCreate: async (project) => {
        // Set default values
        if (!project.projectIdStr) {
          const prefix = project.name.substring(0, 4).toUpperCase();
          
          // Create a collision-safe ID with retry
          let candidate;
          let exists = true;
          let attempts = 0;
          
          do {
            candidate = `${prefix}-${Math.floor(Math.random() * 10000)}`;
            
            // Check if this ID already exists
            const existingProject = await project.constructor.findOne({
              where: { projectIdStr: candidate }
            });
            
            exists = !!existingProject;
            attempts++;
            
            // Safety valve to prevent infinite loops
            if (attempts > 5 && exists) {
              // Try a different format with timestamp
              candidate = `${prefix}-${Math.floor(Date.now() / 1000).toString().slice(-5)}`;
              break;
            }
            
          } while (exists);
          
          project.projectIdStr = candidate;
        }
        
        // Initialize metadata
        project.metadata = project.metadata || {};
        project.metadata.customFields = project.metadata.customFields || {};
        project.metadata.workflowConfig = project.metadata.workflowConfig || {
          statuses: ['Created', 'To Do', 'In Progress', 'Review', 'Done', 'Closed'],
          defaultStatus: 'To Do'
        };
      },
      beforeUpdate: (project) => {
        // Update completion date when status changes to Completed
        if (project.changed('status') && project.status === 'Completed' && !project.completionDate) {
          project.completionDate = new Date();
        }
      }
    }
  });

  return Project;
}; 