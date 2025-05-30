// Reset database script
require('dotenv').config();
const { Pool } = require('pg');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Database configuration from environment variables
const DB_NAME = process.env.DB_NAME || 'budget_project_db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '1122';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

// Create a fix for the projectIdStr issue
const fixProjectModel = () => {
  try {
    const projectModelPath = path.join(__dirname, '../src/models/Project.js');
    let content = fs.readFileSync(projectModelPath, 'utf8');
    
    // Ensure the projectIdStr field has unique constraint properly defined
    // This regex looks for the projectIdStr field definition and ensures unique is set to true
    const hasFixedDefinition = /projectIdStr:\s*\{\s*type:\s*DataTypes\.STRING\(20\),\s*allowNull:\s*false,\s*unique:\s*true,/s.test(content);
    
    if (!hasFixedDefinition) {
      console.log('Fixing Project model definition...');
      // Replace the projectIdStr field definition with the corrected one
      content = content.replace(
        /projectIdStr:\s*\{[^}]*\}/s,
        `projectIdStr: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      },
      comment: 'Unique string ID for the project (e.g., "PROJ-123")'
    }`
      );
      
      fs.writeFileSync(projectModelPath, content, 'utf8');
      console.log('Project model fixed successfully.');
    } else {
      console.log('Project model definition is already correct.');
    }
  } catch (error) {
    console.error('Error fixing Project model:', error);
  }
};

async function resetDatabase() {
  try {
    console.log(`Attempting to reset database "${DB_NAME}"...`);
    
    // Connect to default postgres database to manage our app database
    const pool = new Pool({
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
      database: 'postgres' // Connect to default postgres database
    });
    
    // 1. Fix the Project model definition first
    fixProjectModel();
    
    // 2. Drop the database if it exists
    await pool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${DB_NAME}'
      AND pid <> pg_backend_pid();
    `).catch(err => console.log('No active connections to terminate'));
    
    await pool.query(`DROP DATABASE IF EXISTS "${DB_NAME}";`)
      .then(() => console.log(`Dropped database "${DB_NAME}" if it existed`))
      .catch(err => console.error('Error dropping database:', err));
    
    // 3. Create a new database
    await pool.query(`CREATE DATABASE "${DB_NAME}";`)
      .then(() => console.log(`Created new database "${DB_NAME}"`))
      .catch(err => console.error('Error creating database:', err));
    
    // Close the postgres connection
    await pool.end();
    
    console.log('Database reset completed successfully');
    console.log('Now you can run the server with:');
    console.log('npm run dev');
    
  } catch (error) {
    console.error('Database reset failed:', error);
  }
}

resetDatabase(); 