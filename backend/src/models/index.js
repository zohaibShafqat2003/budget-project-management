const { sequelize, DataTypes } = require('../config/db');

// Import all models
const User = require('./User')(sequelize, DataTypes);
const Project = require('./Project')(sequelize, DataTypes);
const Task = require('./Task')(sequelize, DataTypes);
const BudgetItem = require('./BudgetItem')(sequelize, DataTypes);
const Client = require('./Client')(sequelize, DataTypes);
const Epic = require('./Epic')(sequelize, DataTypes);
const Story = require('./Story')(sequelize, DataTypes);
const Board = require('./Board')(sequelize, DataTypes);
const Sprint = require('./Sprint')(sequelize, DataTypes);
const Comment = require('./Comment')(sequelize, DataTypes);
const Attachment = require('./Attachment')(sequelize, DataTypes);
const ProjectLabel = require('./ProjectLabel')(sequelize, DataTypes);
const TaskDependency = require('./TaskDependency')(sequelize, DataTypes);

// Import new models
const ProjectMember = require('./ProjectMember')(sequelize, DataTypes);
const WorkflowTransition = require('./WorkflowTransition')(sequelize, DataTypes);
const ActivityLog = require('./ActivityLog')(sequelize, DataTypes);
const StoryLabel = require('./StoryLabel')(sequelize, DataTypes);
const TaskLabel = require('./TaskLabel')(sequelize, DataTypes);
const EpicLabel = require('./EpicLabel')(sequelize, DataTypes);
const SprintTask = require('./SprintTask')(sequelize, DataTypes);
const Report = require('./Report')(sequelize, DataTypes);
const RefreshToken = require('./RefreshToken')(sequelize, DataTypes);
const Expense = require('./Expense')(sequelize, DataTypes);

// Define relationships
// Client - Project (One-to-Many)
Client.hasMany(Project, { as: 'projects', foreignKey: 'clientId' });
Project.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });

// User - Project (many-to-many through ProjectMembers)
User.belongsToMany(Project, { through: ProjectMember, as: 'projects', foreignKey: 'userId' });
Project.belongsToMany(User, { through: ProjectMember, as: 'members', foreignKey: 'projectId' });

// Project - Owner (One-to-Many)
User.hasMany(Project, { as: 'ownedProjects', foreignKey: 'ownerId' });
Project.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

// Project - Epic (One-to-Many)
Project.hasMany(Epic, { as: 'epics', foreignKey: 'projectId' });
Epic.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Epic - Owner (One-to-Many)
User.hasMany(Epic, { as: 'ownedEpics', foreignKey: 'ownerId' });
Epic.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

// Epic - Story (One-to-Many)
Epic.hasMany(Story, { as: 'stories', foreignKey: 'epicId' });
Story.belongsTo(Epic, { as: 'epic', foreignKey: 'epicId' });

// Project - Story (One-to-Many)
Project.hasMany(Story, { as: 'stories', foreignKey: 'projectId' });
Story.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Story - Assignee (Many-to-One)
User.hasMany(Story, { as: 'assignedStories', foreignKey: 'assigneeId' });
Story.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });

// Story - Task (One-to-Many)
Story.hasMany(Task, { as: 'tasks', foreignKey: 'storyId' });
Task.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });

// Project - Task (One-to-Many)
Project.hasMany(Task, { as: 'tasks', foreignKey: 'projectId' });
Task.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Project - Board (One-to-Many)
Project.hasMany(Board, { as: 'boards', foreignKey: 'projectId' });
Board.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Board - Sprint (One-to-Many)
Board.hasMany(Sprint, { as: 'sprints', foreignKey: 'boardId' });
Sprint.belongsTo(Board, { as: 'board', foreignKey: 'boardId' });

// Note: Project and Sprint are related indirectly through Board
// Direct association is handled in the controller

// Sprint - Owner (Many-to-One)
User.hasMany(Sprint, { as: 'ownedSprints', foreignKey: 'ownerId' });
Sprint.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

// Sprint - Story (One-to-Many relationship)
// A story can only belong to one sprint at a time
Sprint.hasMany(Story, { as: 'stories', foreignKey: 'sprintId' });
Story.belongsTo(Sprint, { as: 'sprint', foreignKey: 'sprintId' });

// Sprint - Task (Many-to-Many) via SprintTask table
Sprint.belongsToMany(Task, { through: SprintTask, as: 'tasks', foreignKey: 'sprintId' });
Task.belongsToMany(Sprint, { through: SprintTask, as: 'sprints', foreignKey: 'taskId' });

// User - Task (One-to-Many, assignee)
User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assigneeId' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });

// User - Task (One-to-Many, reporter)
User.hasMany(Task, { as: 'reportedTasks', foreignKey: 'reporterId' });
Task.belongsTo(User, { as: 'reporter', foreignKey: 'reporterId' });

// Task Dependency relationships
Task.belongsToMany(Task, { 
  through: TaskDependency, 
  as: 'dependsOn', 
  foreignKey: 'sourceTaskId', 
  otherKey: 'targetTaskId' 
});
Task.belongsToMany(Task, { 
  through: TaskDependency, 
  as: 'dependedOnBy', 
  foreignKey: 'targetTaskId', 
  otherKey: 'sourceTaskId' 
});

// Project - BudgetItem (One-to-Many)
Project.hasMany(BudgetItem, { as: 'budgetItems', foreignKey: 'projectId' });
BudgetItem.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Project - Expense (One-to-Many)
Project.hasMany(Expense, { as: 'expenses', foreignKey: 'projectId' });
Expense.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// BudgetItem - Expense (One-to-Many)
BudgetItem.hasMany(Expense, { as: 'expenses', foreignKey: 'budgetItemId' });
Expense.belongsTo(BudgetItem, { as: 'budgetItem', foreignKey: 'budgetItemId' });

// User - Expense (One-to-Many, creator)
User.hasMany(Expense, { as: 'createdExpenses', foreignKey: 'createdBy' });
Expense.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

// User - Expense (One-to-Many, approver)
User.hasMany(Expense, { as: 'approvedExpenses', foreignKey: 'approvedBy' });
Expense.belongsTo(User, { as: 'approver', foreignKey: 'approvedBy' });

// User - Comment (One-to-Many)
User.hasMany(Comment, { as: 'comments', foreignKey: 'userId' });
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Comment relationships to entities (fixing polymorphic relationship)
Project.hasMany(Comment, { as: 'comments', foreignKey: 'projectId' });
Comment.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

Epic.hasMany(Comment, { as: 'comments', foreignKey: 'epicId' });
Comment.belongsTo(Epic, { as: 'epic', foreignKey: 'epicId' });

Story.hasMany(Comment, { as: 'comments', foreignKey: 'storyId' });
Comment.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });

Task.hasMany(Comment, { as: 'comments', foreignKey: 'taskId' });
Comment.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// User - Attachment (One-to-Many)
User.hasMany(Attachment, { as: 'attachments', foreignKey: 'uploadedBy' });
Attachment.belongsTo(User, { as: 'uploader', foreignKey: 'uploadedBy' });

// Attachment relationships to entities (fixing polymorphic relationship)
Project.hasMany(Attachment, { as: 'attachments', foreignKey: 'projectId' });
Attachment.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

Epic.hasMany(Attachment, { as: 'attachments', foreignKey: 'epicId' });
Attachment.belongsTo(Epic, { as: 'epic', foreignKey: 'epicId' });

Story.hasMany(Attachment, { as: 'attachments', foreignKey: 'storyId' });
Attachment.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });

Task.hasMany(Attachment, { as: 'attachments', foreignKey: 'taskId' });
Attachment.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// Project - ProjectLabel (One-to-Many)
Project.hasMany(ProjectLabel, { as: 'labels', foreignKey: 'projectId' });
ProjectLabel.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// ProjectLabel - Epic (Many-to-Many)
ProjectLabel.belongsToMany(Epic, { through: EpicLabel, as: 'epics', foreignKey: 'labelId' });
Epic.belongsToMany(ProjectLabel, { through: EpicLabel, as: 'labels', foreignKey: 'epicId' });

// ProjectLabel - Story (Many-to-Many)
ProjectLabel.belongsToMany(Story, { through: StoryLabel, as: 'stories', foreignKey: 'labelId' });
Story.belongsToMany(ProjectLabel, { through: StoryLabel, as: 'labels', foreignKey: 'storyId' });

// ProjectLabel - Task (Many-to-Many)
ProjectLabel.belongsToMany(Task, { through: TaskLabel, as: 'tasks', foreignKey: 'labelId' });
Task.belongsToMany(ProjectLabel, { through: TaskLabel, as: 'labels', foreignKey: 'taskId' });

// Project - WorkflowTransition (One-to-Many)
Project.hasMany(WorkflowTransition, { as: 'workflowTransitions', foreignKey: 'projectId' });
WorkflowTransition.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Activity Log relationships
User.hasMany(ActivityLog, { as: 'activities', foreignKey: 'userId' });
ActivityLog.belongsTo(User, { as: 'user', foreignKey: 'userId' });

Project.hasMany(ActivityLog, { as: 'activities', foreignKey: 'projectId' });
ActivityLog.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

Epic.hasMany(ActivityLog, { as: 'activities', foreignKey: 'epicId' });
ActivityLog.belongsTo(Epic, { as: 'epic', foreignKey: 'epicId' });

Story.hasMany(ActivityLog, { as: 'activities', foreignKey: 'storyId' });
ActivityLog.belongsTo(Story, { as: 'story', foreignKey: 'storyId' });

Task.hasMany(ActivityLog, { as: 'activities', foreignKey: 'taskId' });
ActivityLog.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// Report relationships
User.hasMany(Report, { as: 'reports', foreignKey: 'userId' });
Report.belongsTo(User, { as: 'user', foreignKey: 'userId' });

Project.hasMany(Report, { as: 'reports', foreignKey: 'projectId' });
Report.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// RefreshToken relationships
User.hasMany(RefreshToken, { as: 'refreshTokens', foreignKey: 'userId' });
RefreshToken.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Sync database (only in development) - Simplified to use force sync
const syncDatabase = async (force = false) => {
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('🔄 Development mode: force-syncing database');
      await sequelize.sync({ force: true });
      console.log('✅ Database schema recreated');
    } catch (error) {
      console.error('Error syncing database:', error.message);
      throw error;
    }
  }
};

module.exports = {
  User,
  Project,
  Task,
  BudgetItem,
  Client,
  Epic,
  Story,
  Board,
  Sprint,
  Comment,
  Attachment,
  ProjectLabel,
  TaskDependency,
  // New models
  ProjectMember,
  WorkflowTransition,
  ActivityLog,
  StoryLabel,
  TaskLabel,
  EpicLabel,
  SprintTask,
  Report,
  RefreshToken,
  Expense,
  // Export sync function
  syncDatabase,
  // Export the sequelize instance for transactions
  sequelize
}; 