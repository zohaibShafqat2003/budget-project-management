const { v4: uuidv4 } = require('uuid');
const { Project, Board } = require('../src/models');
const { sequelize } = require('../src/config/db');

// This script creates a default board for each project
// Run this after your database reset and project seeding

async function seedBoards() {
  try {
    console.log('Starting board seeding...');
    
    // Find all projects
    const projects = await Project.findAll();
    console.log(`Found ${projects.length} projects to process`);
    
    for (const project of projects) {
      console.log(`Creating board for project: ${project.name} (${project.id})`);
      
      // Check if project already has boards
      const existingBoards = await Board.findAll({
        where: { projectId: project.id }
      });
      
      if (existingBoards.length > 0) {
        console.log(`Project ${project.name} already has ${existingBoards.length} boards. Skipping.`);
        continue;
      }
      
      // Create a default board for this project
      const board = await Board.create({
        id: uuidv4(),
        name: `${project.name} Board`,
        filterJQL: '',
        projectId: project.id
      });
      
      console.log(`Created default board: ${board.name} (${board.id})`);
    }
    
    console.log('Board seeding completed successfully!');
  } catch (error) {
    console.error('Error during board seeding:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the seeding
seedBoards(); 