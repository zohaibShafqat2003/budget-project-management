const {
  User,
  Project,
  Board,
  Sprint,
  Story,
  Task,
  Epic,
  Client,
  sequelize
} = require('../models');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

async function seedProjectData() {
  console.log('--- STARTING seedProjectData ---');
  console.log('Seeding project with related entities...');

  try {
    // 1. Ensure users exist or create them
    let projectOwner = await User.findOne({ where: { email: 'project.owner@example.com' } });
    if (!projectOwner) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      projectOwner = await User.create({
        username: 'projectowner',
        email: 'project.owner@example.com',
        password: hashedPassword,
        firstName: 'Project',
        lastName: 'Owner',
        role: 'Admin',
        isActive: true,
        isVerified: true
      });
      console.log('Created project owner:', projectOwner.email);
    }

    let assigneeUser = await User.findOne({ where: { email: 'assignee.user@example.com' } });
    if (!assigneeUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      assigneeUser = await User.create({
        username: 'assigneeuser',
        email: 'assignee.user@example.com',
        password: hashedPassword,
        firstName: 'Assignee',
        lastName: 'User',
        role: 'Developer',
        isActive: true,
        isVerified: true
      });
      console.log('Created assignee user:', assigneeUser.email);
    }

    // 1.1 Ensure a client exists or create one
    let testClient = await Client.findOne({ where: { name: 'Test Client Inc.' } });
    if (!testClient) {
        testClient = await Client.create({
            name: 'Test Client Inc.',
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            company: 'Test Client Solutions'
        });
        console.log('Created test client:', testClient.name);
    }

    // 2. Create a Project
    const project = await Project.create({
      name: 'Alpha Test Project',
      description: 'A sample project for testing purposes with all related entities.',
      ownerId: projectOwner.id,
      clientId: testClient.id,
      startDate: new Date(),
      endDate: faker.date.future({ years: 1 }),
      status: 'Active',
      priority: 'High',
      budget: faker.finance.amount({ min: 50000, max: 200000, dec: 2 }),
      projectIdStr: 'ALPHA-001' // Explicitly set projectIdStr
    });
    console.log('Created project:', project.name);

    // 3. Create a Board for the Project
    const board = await Board.create({
      name: `${project.name} - Main Board`,
      projectId: project.id,
      type: 'Kanban'
    });
    console.log('Created board:', board.name);

    // 4. Create an Epic (Backlog) for the Project
    const epicBacklog = await Epic.create({
      name: 'Core Functionality Epic',
      description: 'Epic containing all core features for the first release.',
      projectId: project.id,
      ownerId: projectOwner.id,
      status: 'To Do',
      priority: 'High',
      startDate: new Date(),
      dueDate: faker.date.future({ months: 6 })
    });
    console.log('Created epic (backlog):', epicBacklog.name);

    // 5. Create a Sprint for the Board
    const sprint1 = await Sprint.create({
      name: 'Sprint 1 - MVP Development',
      goal: 'Deliver Minimum Viable Product features.',
      startDate: new Date(),
      endDate: faker.date.future({ days: 14 }),
      boardId: board.id,
      ownerId: projectOwner.id,
      status: 'Active'
    });
    console.log('Created sprint:', sprint1.name);

    // 6. Create Stories
    const backlogStoriesData = [
      { title: 'User Authentication Module', description: 'Implement user login, registration, and password recovery.', points: 8, status: 'To Do', priority: 'High' },
      { title: 'Dashboard UI Development', description: 'Create the main dashboard interface.', points: 5, status: 'To Do', priority: 'Medium' },
      { title: 'Reporting Feature - Phase 1', description: 'Basic reporting capabilities.', points: 8, status: 'To Do', priority: 'High' },
    ];

    for (const storyData of backlogStoriesData) {
      await Story.create({
        ...storyData,
        projectId: project.id,
        epicId: epicBacklog.id,
        assigneeId: assigneeUser.id,
        status: 'To Do',
        reporterId: projectOwner.id
      });
    }
    console.log(`Created ${backlogStoriesData.length} stories for the epic backlog.`);

    const sprintStoriesData = [
      { title: 'Implement Login Page', description: 'Develop the UI and backend for user login.', points: 3, priority: 'High' },
      { title: 'Implement Registration Form', description: 'Develop the UI and backend for user registration.', points: 5, priority: 'High' },
      { title: 'Setup Project Structure', description: 'Initial project setup and configuration.', points: 2, priority: 'Medium' },
    ];

    const createdSprintStories = [];
    for (const storyData of sprintStoriesData) {
      const story = await Story.create({
        ...storyData,
        projectId: project.id,
        sprintId: sprint1.id,
        assigneeId: assigneeUser.id,
        status: 'To Do',
        reporterId: projectOwner.id
      });
      createdSprintStories.push(story);
    }
    console.log(`Created ${sprintStoriesData.length} stories for Sprint 1.`);

    // 7. Create Tasks for some Stories in Sprint 1
    if (createdSprintStories.length > 0) {
      const tasksData = [
        { title: 'Design login form UI', description: 'Create HTML/CSS for login form.', estimatedHours: 4, priority: 'High', storyId: createdSprintStories[0].id },
        { title: 'Develop login API endpoint', description: 'Create backend API for login.', estimatedHours: 8, priority: 'High', storyId: createdSprintStories[0].id },
        { title: 'Write unit tests for login', description: 'Ensure login functionality is tested.', estimatedHours: 6, priority: 'Medium', storyId: createdSprintStories[0].id },
        { title: 'Design registration form UI', description: 'Create HTML/CSS for registration form.', estimatedHours: 5, priority: 'High', storyId: createdSprintStories[1].id },
      ];

      for (const taskData of tasksData) {
        await Task.create({
          ...taskData,
          projectId: project.id,
          assigneeId: assigneeUser.id,
          status: 'To Do',
          type: 'Task',
          reporterId: projectOwner.id
        });
      }
      console.log(`Created ${tasksData.length} tasks for sprint stories.`);
    }

    console.log('Successfully seeded project data.');

  } catch (error) {
    console.error('Error seeding project data:', error);
    throw error;
  }
  console.log('--- FINISHED seedProjectData ---');
}

module.exports = seedProjectData;

// Optional: If you want to run this file directly for testing
// (async () => {
//   if (require.main === module) {
//     try {
//       await sequelize.authenticate();
//       console.log('Database connected for direct seeding.');
//       await seedProjectData();
//     } catch (error) {
//       console.error('Failed to run seedProjectData directly:', error);
//     } finally {
//       await sequelize.close();
//       console.log('Database connection closed.');
//     }
//   }
// })();
