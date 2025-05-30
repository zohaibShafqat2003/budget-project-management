const { Project, BudgetItem, Expense } = require('../src/models');
const { sequelize } = require('../src/config/db');

/**
 * This script tests the budget summary functionality to ensure 
 * budget vs. actual reporting works correctly
 */
async function testBudgetSummary() {
  try {
    console.log('🔍 Testing budget summary functionality...');
    
    // Get all projects
    const projects = await Project.findAll({
      attributes: ['id', 'name', 'totalBudget', 'usedBudget']
    });
    
    if (projects.length === 0) {
      console.error('❌ No projects found to test budget summary');
      return;
    }
    
    for (const project of projects) {
      console.log(`\n📊 Budget summary for project: ${project.name}`);
      console.log(`  Total Budget: $${project.totalBudget}`);
      console.log(`  Used Budget: $${project.usedBudget}`);
      console.log(`  Remaining: $${project.totalBudget - project.usedBudget}`);
      
      // Get budget items for this project
      const budgetItems = await BudgetItem.findAll({
        where: { projectId: project.id },
        attributes: ['id', 'name', 'category', 'amount', 'usedAmount']
      });
      
      console.log(`\n  Budget breakdown (${budgetItems.length} items):`);
      
      let plannedTotal = 0;
      let usedTotal = 0;
      
      budgetItems.forEach(item => {
        plannedTotal += parseFloat(item.amount);
        usedTotal += parseFloat(item.usedAmount);
        
        const remainingAmount = item.amount - item.usedAmount;
        const percentUsed = (item.usedAmount / item.amount * 100).toFixed(1);
        
        console.log(`  - ${item.name} (${item.category})`);
        console.log(`    Planned: $${item.amount}, Used: $${item.usedAmount}, Remaining: $${remainingAmount} (${percentUsed}% used)`);
      });
      
      console.log(`\n  Summary totals:`);
      console.log(`  - Total planned from budget items: $${plannedTotal.toFixed(2)}`);
      console.log(`  - Total used from budget items: $${usedTotal.toFixed(2)}`);
      console.log(`  - Difference from project total: $${(project.totalBudget - plannedTotal).toFixed(2)}`);
      
      // Get all expenses for this project
      const expenses = await Expense.findAll({
        where: { projectId: project.id },
        attributes: ['id', 'amount', 'description', 'category', 'paymentStatus']
      });
      
      const expenseTotal = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      
      console.log(`\n  Expenses (${expenses.length} items):`);
      console.log(`  - Total expenses: $${expenseTotal.toFixed(2)}`);
      
      if (Math.abs(usedTotal - expenseTotal) > 0.01) {
        console.warn(`  ⚠️ Expense total ($${expenseTotal.toFixed(2)}) doesn't match used budget ($${usedTotal.toFixed(2)})`);
      } else {
        console.log(`  ✅ Expense total matches used budget`);
      }
      
      // Group expenses by category
      const expensesByCategory = {};
      expenses.forEach(expense => {
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += parseFloat(expense.amount);
      });
      
      console.log(`\n  Expenses by category:`);
      Object.keys(expensesByCategory).forEach(category => {
        console.log(`  - ${category}: $${expensesByCategory[category].toFixed(2)}`);
      });
      
      // Group expenses by payment status
      const expensesByStatus = {};
      expenses.forEach(expense => {
        if (!expensesByStatus[expense.paymentStatus]) {
          expensesByStatus[expense.paymentStatus] = 0;
        }
        expensesByStatus[expense.paymentStatus] += parseFloat(expense.amount);
      });
      
      console.log(`\n  Expenses by payment status:`);
      Object.keys(expensesByStatus).forEach(status => {
        console.log(`  - ${status}: $${expensesByStatus[status].toFixed(2)}`);
      });
    }
    
    console.log('\n✅ Budget summary testing completed');
    
  } catch (error) {
    console.error('❌ Error testing budget summary:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testBudgetSummary(); 