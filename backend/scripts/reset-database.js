const { sequelize } = require('../src/models');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * Reset database script:
 * 1. Drops all tables in the database
 * 2. Re-creates them based on the current models
 * 3. Runs the main seed script to populate the database with initial data
 */
async function resetDatabase() {
  try {
    console.log('🔄 Starting database reset...');
    
    // Force sync will drop all tables and recreate them
    console.log('📊 Dropping all tables and recreating schema...');
    await sequelize.sync({ force: true });
    console.log('✅ Database schema reset successfully');
    
    // Run the main seed script
    console.log('🌱 Running main seed script...');
    await execPromise(`node ${path.join(__dirname, '../src/seeders/seed.js')}`);
    console.log('✅ Main seed script completed successfully');
    
    console.log('🎉 Database reset and seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the reset
resetDatabase(); 