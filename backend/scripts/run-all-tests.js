/**
 * This script runs all test scripts in the correct order to validate
 * the Jira-inspired Board-Sprint-Story-Task architecture.
 * 
 * It will seed the database first, then run all test scripts one by one.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const testScripts = [
  'test-workflow.js',
  'test-workflow-transitions.js',
  'test-budget-summary.js',
  'test-rbac.js'
];

// Utility to run a command and return its output
function runCommand(command) {
  console.log(`\n🔄 Running command: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    return { success: true, output };
  } catch (error) {
    console.error(`❌ Command failed: ${error.message}`);
    return { success: false, error };
  }
}

// Main function to run all the tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive test suite for Jira-inspired architecture\n');
  
  // 1. First, seed the database
  console.log('📋 Step 1: Seeding the database with test data');
  const seedResult = runCommand('node src/seeders/seed.js');
  if (!seedResult.success) {
    console.error('❌ Database seeding failed. Cannot continue tests.');
    process.exit(1);
  }
  console.log('✅ Database seeded successfully\n');
  
  // 2. Run all test scripts
  console.log('📋 Step 2: Running all test scripts');
  
  let allTestsPassed = true;
  
  for (const scriptName of testScripts) {
    console.log(`\n🧪 Running test script: ${scriptName}`);
    
    const scriptPath = path.join(__dirname, scriptName);
    
    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      console.error(`❌ Test script not found: ${scriptPath}`);
      allTestsPassed = false;
      continue;
    }
    
    // Run the script
    const testResult = runCommand(`node ${scriptPath}`);
    
    if (!testResult.success) {
      console.error(`❌ Test script failed: ${scriptName}`);
      allTestsPassed = false;
    } else {
      console.log(`✅ Test script passed: ${scriptName}`);
    }
  }
  
  // Final summary
  console.log('\n📝 Test Suite Summary:');
  if (allTestsPassed) {
    console.log('✅ All tests passed successfully!');
    console.log('🎉 Your Jira-inspired architecture is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the logs above for details.');
  }
}

// Run all tests
runAllTests().catch(error => {
  console.error('❌ An unexpected error occurred:', error);
  process.exit(1);
}); 