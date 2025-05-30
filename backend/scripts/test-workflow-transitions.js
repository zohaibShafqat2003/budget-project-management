const { WorkflowTransition, Project, Sprint, Story } = require('../src/models');
const { sequelize } = require('../src/config/db');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

/**
 * This script tests workflow transitions to ensure status changes follow defined rules
 */
async function testWorkflowTransitions() {
  try {
    console.log('🔍 Testing workflow transitions...');
    
    // Get the first project to work with
    const project = await Project.findOne();
    
    if (!project) {
      console.error('❌ No projects found to test workflow transitions');
      return;
    }
    
    console.log(`Working with project: ${project.name} (${project.id})`);
    
    // 1. Create a test workflow transition rule
    const completionTransition = await WorkflowTransition.create({
      id: uuidv4(),
      projectId: project.id,
      fromStatus: 'Active',
      toStatus: 'Completed',
      name: 'Complete Sprint',
      description: 'Mark a sprint as completed',
      condition: JSON.stringify({
        requireAllStoriesDone: true,
        requireApproval: true
      }),
      isGlobal: false
    });
    
    console.log(`\n✅ Created workflow transition: ${completionTransition.name}`);
    console.log(`  From: ${completionTransition.fromStatus} → To: ${completionTransition.toStatus}`);
    console.log(`  Conditions: ${completionTransition.condition}`);
    
    // 2. Test the workflow with a sprint
    const sprint = await Sprint.findOne({
      where: { status: 'Active' }
    });
    
    if (!sprint) {
      console.log('❌ No active sprints found to test workflow');
      return;
    }
    
    console.log(`\n📅 Testing sprint transition for: ${sprint.name} (${sprint.id})`);
    console.log(`  Current status: ${sprint.status}`);
    
    // 3. Check if there are unfinished stories (simulating the condition check)
    const unfinishedStories = await Story.findAll({
      where: {
        sprintId: sprint.id,
        status: {
          [Op.ne]: 'Done'
        }
      }
    });
    
    // 4. Try to apply the transition
    console.log('\n🔄 Attempting status transition...');
    
    // Check if the transition is allowed
    if (
      sprint.status === completionTransition.fromStatus && 
      unfinishedStories.length === 0
    ) {
      console.log('  ✅ Transition is allowed (all stories are done)');
      console.log(`  Changing sprint status from ${sprint.status} to ${completionTransition.toStatus}`);
      
      // Update the sprint status
      await sprint.update({ status: completionTransition.toStatus });
      console.log(`  ✅ Sprint status updated successfully to: ${sprint.status}`);
    } else {
      console.log(`  ❌ Transition blocked: ${completionTransition.fromStatus} → ${completionTransition.toStatus}`);
      
      if (sprint.status !== completionTransition.fromStatus) {
        console.log(`  - Sprint status ${sprint.status} doesn't match required fromStatus ${completionTransition.fromStatus}`);
      }
      
      if (unfinishedStories.length > 0) {
        console.log(`  - Sprint has ${unfinishedStories.length} unfinished stories`);
        unfinishedStories.forEach(story => {
          console.log(`    * ${story.title} [${story.status}]`);
        });
      }
    }
    
    // 5. Try an illegal transition (for testing)
    const inactiveSprintToCompleted = await Sprint.findOne({
      where: { status: 'Planning' }
    });
    
    if (inactiveSprintToCompleted) {
      console.log(`\n🔄 Testing illegal transition for sprint: ${inactiveSprintToCompleted.name}`);
      console.log(`  Current status: ${inactiveSprintToCompleted.status}`);
      console.log(`  Attempting to change directly to: ${completionTransition.toStatus}`);
      
      if (inactiveSprintToCompleted.status === completionTransition.fromStatus) {
        // This should not happen based on our query, but we check anyway
        console.log('  ✅ Transition is allowed by the rules');
      } else {
        console.log(`  ❌ Transition blocked: ${inactiveSprintToCompleted.status} → ${completionTransition.toStatus}`);
        console.log(`  - Sprint status ${inactiveSprintToCompleted.status} doesn't match required fromStatus ${completionTransition.fromStatus}`);
      }
    }
    
    // 6. Clean up - Delete the test workflow transition
    await completionTransition.destroy();
    console.log('\n🧹 Cleaned up test workflow transition');
    
    console.log('\n✅ Workflow transition testing completed');
    
  } catch (error) {
    console.error('❌ Error testing workflow transitions:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testWorkflowTransitions(); 