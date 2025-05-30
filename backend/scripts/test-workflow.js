const { Project, Board, Sprint, Story, Task, Epic } = require('../src/models');
const { sequelize } = require('../src/config/db');
const { Op } = require('sequelize');

/**
 * This script tests the workflow of our Board-Sprint-Story-Task structure
 * by retrieving and displaying the relationships between these entities
 */
async function testWorkflow() {
  try {
    console.log('🔍 Testing Board-Sprint-Story-Task workflow...');
    
    // Get all projects
    const projects = await Project.findAll({
      attributes: ['id', 'name', 'projectIdStr', 'status']
    });
    
    console.log(`\n📁 Found ${projects.length} projects:`);
    for (const project of projects) {
      console.log(`  - ${project.name} (${project.projectIdStr}) [${project.status}]`);
    }
    
    // For the first project, get all boards
    if (projects.length > 0) {
      const project = projects[0];
      console.log(`\n📋 Examining boards for project: ${project.name}`);
      
      const boards = await Board.findAll({
        where: { projectId: project.id },
        attributes: ['id', 'name', 'filterJQL']
      });
      
      console.log(`  Found ${boards.length} boards:`);
      for (const board of boards) {
        console.log(`  - ${board.name} (${board.id})`);
        if (board.filterJQL) {
          console.log(`    Filter: ${board.filterJQL}`);
        }
        
        // Get all sprints for this board
        const sprints = await Sprint.findAll({
          where: { boardId: board.id },
          attributes: ['id', 'name', 'status', 'startDate', 'endDate']
        });
        
        console.log(`    📅 Found ${sprints.length} sprints on this board:`);
        for (const sprint of sprints) {
          console.log(`    - ${sprint.name} [${sprint.status}]`);
          if (sprint.startDate) {
            console.log(`      Start: ${sprint.startDate.toDateString()}, End: ${sprint.endDate.toDateString()}`);
          }
          
          // Get all stories for this sprint with Epic information
          const stories = await Story.findAll({
            where: { sprintId: sprint.id },
            attributes: ['id', 'title', 'status', 'priority', 'points'],
            include: [{ 
              model: Epic, 
              as: 'epic',  // Fixed: must match the association alias
              attributes: ['name'] 
            }]
          });
          
          console.log(`      📝 Found ${stories.length} stories in this sprint:`);
          for (const story of stories) {
            const epicName = story.epic ? story.epic.name : 'No Epic';
            console.log(`      - ${story.title} [${story.status}] (${story.points} points, ${story.priority} priority, Epic: ${epicName})`);
            
            // Get all tasks for this story
            const tasks = await Task.findAll({
              where: { storyId: story.id },
              attributes: ['id', 'title', 'status', 'estimatedHours', 'actualHours']
            });
            
            console.log(`        ✅ Found ${tasks.length} tasks for this story:`);
            for (const task of tasks) {
              console.log(`        - ${task.title} [${task.status}] (Est: ${task.estimatedHours}h, Actual: ${task.actualHours}h)`);
            }
          }
          
          // Testing Sprint↔Task many-to-many relationship
          console.log(`      🔄 Testing Sprint-Task direct relationship:`);
          try {
            // This will use the SprintTasks junction table to get tasks directly linked to sprint
            const sprintTasks = await sprint.getTasks();
            console.log(`        Found ${sprintTasks.length} tasks directly linked to this sprint`);
            for (const task of sprintTasks) {
              console.log(`        - ${task.title} [${task.status}]`);
            }
          } catch (error) {
            console.error(`        ❌ Error getting sprint tasks: ${error.message}`);
          }
        }
        
        // Get backlog stories for this project (not assigned to any sprint) with Epic information
        const backlogStories = await Story.findAll({
          where: { 
            projectId: project.id,
            sprintId: null
          },
          attributes: ['id', 'title', 'status', 'priority', 'points', 'isReady'],
          include: [{ 
            model: Epic, 
            as: 'epic',  // Fixed: must match the association alias
            attributes: ['name'] 
          }]
        });
        
        console.log(`    📚 Found ${backlogStories.length} stories in the backlog:`);
        for (const story of backlogStories) {
          const epicName = story.epic ? story.epic.name : 'No Epic';
          console.log(`    - ${story.title} [${story.status}] (${story.points} points, ${story.priority} priority, Ready: ${story.isReady}, Epic: ${epicName})`);
          
          // Get all tasks for this backlog story
          const tasks = await Task.findAll({
            where: { storyId: story.id },
            attributes: ['id', 'title', 'status']
          });
          
          console.log(`      ✅ Found ${tasks.length} tasks for this backlog story`);
        }
      }
    }
    
    // Test JQL filtering (simple implementation)
    console.log('\n🔍 Testing JQL filtering functionality:');
    try {
      const board = await Board.findOne({
        where: { filterJQL: { [Op.ne]: '' } }
      });
      
      if (board) {
        console.log(`  Found board with JQL filter: ${board.name} (${board.filterJQL})`);
        // Very basic JQL parsing - just looks for project= pattern
        const projectMatch = board.filterJQL.match(/project=(\S+)/);
        if (projectMatch && projectMatch[1]) {
          const projectId = projectMatch[1];
          console.log(`  JQL parsed: Looking for project ${projectId}`);
          
          const matchingProject = await Project.findOne({
            where: { projectIdStr: projectId }
          });
          
          if (matchingProject) {
            console.log(`  ✅ Found matching project: ${matchingProject.name}`);
          } else {
            console.log(`  ❌ No matching project found for ${projectId}`);
          }
        }
      } else {
        console.log('  No boards with JQL filters found');
      }
    } catch (error) {
      console.error('  ❌ Error testing JQL filtering:', error.message);
    }
    
    console.log('\n✅ Workflow test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing workflow:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the test
testWorkflow(); 