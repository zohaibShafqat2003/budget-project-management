import { apiRequest, retryRequestWithNewToken } from './core';

export interface BudgetItem {
  id: string;
  projectId: string;
  name: string;
  category: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  projectId: string;
  budgetItemId: string; // Link to a budget item
  amount: number;
  description?: string;
  category: string; // Can be different from budget item's category
  paymentMethod?: string;
  date: Date; // Date of expense
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  items: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
  }>;
}

// Budget API functions
export const budgetApi = {
  // Get all budget items for a project
  getItems: async (projectId: string): Promise<BudgetItem[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/budget`)
    );
  },
  
  // Get budget summary for a project
  getSummary: async (projectId: string): Promise<BudgetSummary> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/budget/summary`)
    );
  },
  
  // Create a new budget item
  createItem: async (
    projectId: string, 
    budgetItemData: {
      name: string;
      category: string;
      amount: number;
    }
  ): Promise<BudgetItem> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/budget`, 'POST', budgetItemData)
    );
  },
  
  // Update an existing budget item
  updateItem: async (
    projectId: string, 
    itemId: string,
    budgetItemData: Partial<Omit<BudgetItem, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>
  ): Promise<BudgetItem> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/budget/${itemId}`, 'PUT', budgetItemData)
    );
  },
  
  // Delete a budget item
  deleteItem: async (projectId: string, itemId: string): Promise<void> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/budget/${itemId}`, 'DELETE')
    );
  }
};

// Expense API functions
export const expenseApi = {
  // Get all expenses for a project
  getByProject: async (projectId: string): Promise<Expense[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/expenses`)
    );
  },
  
  // Get a specific expense by ID
  getById: async (expenseId: string): Promise<Expense> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/expenses/${expenseId}`)
    );
  },
  
  // Create a new expense
  create: async (
    projectId: string, 
    expenseData: {
      budgetItemId: string;
      amount: number;
      description?: string;
      category: string;
      paymentMethod?: string;
      date?: string; // API might expect ISO string
    }
  ): Promise<Expense> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/expenses`, 'POST', expenseData)
    );
  },
  
  // Update an existing expense
  update: async (
    projectId: string, 
    expenseId: string,
    expenseData: Partial<Omit<Expense, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Expense> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/expenses/${expenseId}`, 'PUT', expenseData)
    );
  },
  
  // Delete an expense
  delete: async (projectId: string, expenseId: string): Promise<void> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/expenses/${expenseId}`, 'DELETE')
    );
  }
}; 