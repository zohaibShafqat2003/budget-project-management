// Re-export all our API modules for easy consumption by app components

export * from './core';

// Export individual API services 
export { tasksApi } from './tasks';

// Domain-specific API modules
export * from './tasks';
export * from './projects';
export * from './agile';
export * from './budget';
export * from './users';

// Re-export interfaces for convenience
export type {
  Task, 
  TaskComment
} from './tasks';

export type {
  Project,
  Client
} from './projects';

export type {
  Board,
  Sprint,
  Epic,
  Story
} from './agile';

export type {
  BudgetItem,
  Expense,
  BudgetSummary
} from './budget';

// Add any additional exports or type definitions here
export type { User } from '../types'; 