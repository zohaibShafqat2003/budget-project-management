/**
 * Central configuration for all API routes
 * This ensures consistency between frontend and backend routes
 */

export const API_ROUTES = {
  // Budget API routes
  BUDGET: {
    LIST: (projectId: string) => `/api/projects/${projectId}/budgets`,
    SUMMARY: (projectId: string) => `/api/projects/${projectId}/budgets/summary`,
    DETAIL: (budgetId: string) => `/api/budgets/${budgetId}`,
  },
  
  // Expense API routes
  EXPENSE: {
    LIST: (projectId: string) => `/api/projects/${projectId}/expenses`,
    DETAIL: (expenseId: string) => `/api/expenses/${expenseId}`,
    APPROVE: (expenseId: string) => `/api/expenses/${expenseId}/approve`,
    REJECT: (expenseId: string) => `/api/expenses/${expenseId}/reject`,
  },
  
  // Project API routes
  PROJECT: {
    LIST: () => `/api/projects`,
    DETAIL: (projectId: string) => `/api/projects/${projectId}`,
  },
};

// Export backend API base URL for direct requests
export const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'; 