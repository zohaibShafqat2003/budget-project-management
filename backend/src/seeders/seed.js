// src/seeders/seed.js
require('dotenv').config();
const { User, Project, BudgetItem, Expense, Board, Epic, Sprint, Story, Task } = require('../models');
const { sequelize } = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('⚡ Database synced (dropped & recreated)');

  // 1) Users
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const [admin, po, dev, tester, devops] = await Promise.all([
    User.create({ email:'alice@corp.com', password:passwordHash, firstName:'Alice', lastName:'Admin', role:'Admin' }),
    User.create({ email:'bob@corp.com',   password:passwordHash, firstName:'Bob',   lastName:'Owner', role:'Product Owner' }),
    User.create({ email:'carol@corp.com', password:passwordHash, firstName:'Carol', lastName:'Dev',   role:'Developer' }),
    User.create({ email:'dave@corp.com',  password:passwordHash, firstName:'Dave',  lastName:'Test',  role:'Developer' }),
    User.create({ email:'emma@corp.com',  password:passwordHash, firstName:'Emma',  lastName:'Ops',   role:'Developer' }),
  ]);
  console.log('👤 Users created');

  // 2) Projects
  const [proj1, proj2] = await Promise.all([
    Project.create({
      projectIdStr:'PROJ-001',
      name:'Website Redesign',
      clientId:null, // if you have clients seeded, replace with a real ID
      ownerId:po.id,
      type:'Scrum',
      status:'Active',
      totalBudget:50000,
      usedBudget:0
    }),
    Project.create({
      projectIdStr:'PROJ-002',
      name:'Mobile App',
      clientId:null,
      ownerId:admin.id,
      type:'Kanban',
      status:'Not Started',
      totalBudget:75000,
      usedBudget:0
    })
  ]);
  console.log('📁 Projects created');

  // 3) BudgetItems
  const [bi1, bi2, bi3] = await Promise.all([
    BudgetItem.create({ projectId:proj1.id, name:'Design',        category:'Development', amount:20000 }),
    BudgetItem.create({ projectId:proj1.id, name:'Marketing Ads', category:'Marketing',   amount:15000 }),
    BudgetItem.create({ projectId:proj2.id, name:'Backend API',   category:'Development', amount:30000 }),
  ]);
  console.log('💰 Budget items created');

  // 4) Expenses
  await Promise.all([
    Expense.create({
      projectId:proj1.id,
      budgetItemId:bi1.id,
      amount: 5000,
      description:'Initial UI mockups',
      category:'Development',
      paymentMethod:'Credit Card',
      createdBy:dev.id
    }),
    Expense.create({
      projectId:proj1.id,
      budgetItemId:bi2.id,
      amount: 2000,
      description:'Facebook Ads',
      category:'Marketing',
      paymentMethod:'Wire Transfer',
      createdBy:po.id,
      paymentStatus:'Paid',
      approvedBy:admin.id,
      approvedAt:new Date()
    }),
  ]);
  console.log('💸 Expenses created');

  // 5) Boards
  const [mainBoard, secondaryBoard] = await Promise.all([
    Board.create({
      id: uuidv4(),
      name: 'Main Development Board',
      filterJQL: '',
      projectId: proj1.id
    }),
    Board.create({
      id: uuidv4(),
      name: 'Mobile App Board',
      filterJQL: 'project=PROJ-002',
      projectId: proj2.id
    })
  ]);
  console.log('📋 Boards created');

  // 6) Epics
  const [featureEpic, bugEpic, infraEpic] = await Promise.all([
    Epic.create({
      id: uuidv4(),
      projectId: proj1.id,
      ownerId: po.id,
      name: 'User Authentication Features',
      description: 'All features related to user authentication and account management',
      status: 'In Progress',
      priority: 'High'
    }),
    Epic.create({
      id: uuidv4(),
      projectId: proj1.id,
      ownerId: po.id,
      name: 'Performance Optimization',
      description: 'Improve overall application performance',
      status: 'To Do',
      priority: 'Medium'
    }),
    Epic.create({
      id: uuidv4(),
      projectId: proj2.id,
      ownerId: admin.id,
      name: 'Infrastructure Setup',
      description: 'Set up and configure infrastructure for the mobile app',
      status: 'To Do',
      priority: 'High'
    })
  ]);
  console.log('📚 Epics created');

  // 7) Sprints
  const currentDate = new Date();
  const sprintEndDate = new Date(currentDate);
  sprintEndDate.setDate(sprintEndDate.getDate() + 14); // 2 weeks from now

  const [activeSprint, planningSprint] = await Promise.all([
    Sprint.create({
      id: uuidv4(),
      boardId: mainBoard.id,
      ownerId: po.id,
      name: 'Sprint 1 - Authentication',
      goal: 'Complete user authentication features',
      startDate: currentDate,
      endDate: sprintEndDate,
      status: 'Active',
      isLocked: true
    }),
    Sprint.create({
      id: uuidv4(),
      boardId: mainBoard.id,
      ownerId: po.id,
      name: 'Sprint 2 - Dashboard',
      goal: 'Implement user dashboard',
      status: 'Planning'
    })
  ]);
  console.log('🏃 Sprints created');

  // 8) Stories
  // Stories in the active sprint
  const [story1, story2, story3] = await Promise.all([
    Story.create({
      id: uuidv4(),
      projectId: proj1.id,
      epicId: featureEpic.id,
      assigneeId: dev.id,
      reporterId: po.id,
      title: 'Implement user login',
      description: 'As a user, I want to be able to log in to access my account',
      status: 'In Progress',
      priority: 'High',
      isReady: true,
      points: 5,
      acceptanceCriteria: '- User can log in with email/password\n- Validation errors are shown\n- Password reset link is available',
      sprintId: activeSprint.id
    }),
    Story.create({
      id: uuidv4(),
      projectId: proj1.id,
      epicId: featureEpic.id,
      assigneeId: dev.id,
      reporterId: po.id,
      title: 'Implement user registration',
      description: 'As a new user, I want to be able to create an account',
      status: 'To Do',
      priority: 'High',
      isReady: true,
      points: 8,
      acceptanceCriteria: '- User can register with email/password\n- Email verification is sent\n- Duplicate accounts are prevented',
      sprintId: activeSprint.id
    }),
    Story.create({
      id: uuidv4(),
      projectId: proj1.id,
      epicId: featureEpic.id,
      assigneeId: tester.id,
      reporterId: po.id,
      title: 'Create password reset flow',
      description: 'As a user, I want to be able to reset my password if I forget it',
      status: 'To Do',
      priority: 'Medium',
      isReady: true,
      points: 5,
      acceptanceCriteria: '- User can request password reset\n- Email with reset link is sent\n- Password can be changed via reset link',
      sprintId: activeSprint.id
    })
  ]);

  // Stories in the backlog (not assigned to any sprint)
  const [backlogStory1, backlogStory2, backlogStory3] = await Promise.all([
    Story.create({
      id: uuidv4(),
      projectId: proj1.id,
      epicId: bugEpic.id,
      reporterId: tester.id,
      title: 'Optimize page load time',
      description: 'The website takes too long to load on mobile devices',
      status: 'To Do',
      priority: 'Medium',
      isReady: true,
      points: 3,
      acceptanceCriteria: '- Page load time should be under 2s on 4G connections\n- Images should be optimized\n- JavaScript bundle should be split',
      sprintId: null // backlog
    }),
    Story.create({
      id: uuidv4(),
      projectId: proj1.id,
      epicId: bugEpic.id,
      reporterId: po.id,
      title: 'Fix memory leak in dashboard',
      description: 'The dashboard page has a memory leak causing slowdowns over time',
      status: 'To Do',
      priority: 'High',
      isReady: false, // not ready for sprint yet
      points: 5,
      acceptanceCriteria: '- Identify and fix the memory leak\n- No memory growth over 30 min of usage\n- Dashboard should remain responsive',
      sprintId: null // backlog
    }),
    Story.create({
      id: uuidv4(),
      projectId: proj2.id,
      epicId: infraEpic.id,
      assigneeId: devops.id,
      reporterId: admin.id,
      title: 'Set up CI/CD pipeline',
      description: 'We need a continuous integration and deployment pipeline for the mobile app',
      status: 'To Do',
      priority: 'High',
      isReady: true,
      points: 8,
      acceptanceCriteria: '- GitHub Actions configured for CI\n- Automated testing on pull requests\n- Deployment to staging on merge to develop',
      sprintId: null // backlog
    })
  ]);
  console.log('📝 Stories created');

  // 9) Tasks
  await Promise.all([
    // Tasks for story1 (login)
    Task.create({
      id: uuidv4(),
      projectId: proj1.id,
      storyId: story1.id,
      assigneeId: dev.id,
      reporterId: po.id,
      title: 'Create login API endpoint',
      description: 'Implement the backend API for user login',
      status: 'Done',
      priority: 'High',
      estimatedHours: 4,
      actualHours: 3
    }),
    Task.create({
      id: uuidv4(),
      projectId: proj1.id,
      storyId: story1.id,
      assigneeId: dev.id,
      reporterId: po.id,
      title: 'Create login form UI',
      description: 'Design and implement the login form in the frontend',
      status: 'In Progress',
      priority: 'High',
      estimatedHours: 6,
      actualHours: 2
    }),
    Task.create({
      id: uuidv4(),
      projectId: proj1.id,
      storyId: story1.id,
      assigneeId: tester.id,
      reporterId: dev.id,
      title: 'Test login functionality',
      description: 'Test login with valid and invalid credentials',
      status: 'To Do',
      priority: 'High',
      estimatedHours: 3,
      actualHours: 0
    }),

    // Tasks for story2 (registration)
    Task.create({
      id: uuidv4(),
      projectId: proj1.id,
      storyId: story2.id,
      assigneeId: dev.id,
      reporterId: po.id,
      title: 'Create registration API endpoint',
      description: 'Implement the backend API for user registration',
      status: 'To Do',
      priority: 'High',
      estimatedHours: 5,
      actualHours: 0
    }),
    Task.create({
      id: uuidv4(),
      projectId: proj1.id,
      storyId: story2.id,
      assigneeId: dev.id,
      reporterId: po.id,
      title: 'Create registration form UI',
      description: 'Design and implement the registration form in the frontend',
      status: 'To Do',
      priority: 'High',
      estimatedHours: 6,
      actualHours: 0
    }),

    // Tasks for backlog story (CI/CD)
    Task.create({
      id: uuidv4(),
      projectId: proj2.id,
      storyId: backlogStory3.id,
      assigneeId: devops.id,
      reporterId: admin.id,
      title: 'Configure GitHub Actions',
      description: 'Set up GitHub Actions workflows for CI',
      status: 'To Do',
      priority: 'High',
      estimatedHours: 4,
      actualHours: 0
    }),
    Task.create({
      id: uuidv4(),
      projectId: proj2.id,
      storyId: backlogStory3.id,
      assigneeId: devops.id,
      reporterId: admin.id,
      title: 'Set up deployment to staging',
      description: 'Configure automated deployment to staging environment',
      status: 'To Do',
      priority: 'Medium',
      estimatedHours: 6,
      actualHours: 0
    })
  ]);
  console.log('✅ Tasks created');

  console.log('🎉 Seeding complete');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
