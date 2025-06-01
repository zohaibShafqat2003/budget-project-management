import { refreshAccessToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response: Response) => {
  try {
    const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    if (response.status === 401) {
      try {
          const newToken = await refreshAccessToken();
          if (typeof window !== 'undefined' && newToken?.accessToken) {
            localStorage.setItem('authToken', newToken.accessToken);
          }
        throw new Error('Token refreshed, please retry the request');
      } catch (refreshError) {
        throw new Error('Authentication failed. Please log in again.');
      }
    }
    throw new Error(data.message || 'An error occurred while fetching data');
  }
  
  return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {}; // Handle empty responses
    }
    throw error;
  }
};

const apiRequest = async (
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET', 
  body?: any,
  customHeaders: Record<string, string> = {}
) => {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken') || '';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse(response);
};

// Authentication API services
export const authApi = {
  register: async (userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
    role: string 
  }) => {
    return apiRequest('/auth/register', 'POST', userData);
  },
  
  login: async (credentials: { email: string; password: string }) => {
    return apiRequest('/auth/login', 'POST', credentials);
  },
  
  refreshToken: async (refreshToken: string) => {
    return apiRequest('/auth/refresh-token', 'POST', { refreshToken });
  },
  
  logout: async () => {
    return apiRequest('/auth/logout', 'POST');
  },
  
  getCurrentUser: async () => {
    return apiRequest('/auth/me', 'GET');
  }
};

// Client API services
export const clientApi = {
  create: async (clientData: { 
    name: string; 
    contactEmail: string; 
    active: boolean 
  }) => {
    return apiRequest('/clients', 'POST', clientData);
  },
  
  getAll: async () => {
    return apiRequest('/clients');
  },
  
  getById: async (clientId: string) => {
    return apiRequest(`/clients/${clientId}`);
  },
  
  update: async (clientId: string, clientData: { 
    name?: string; 
    contactEmail?: string; 
    active?: boolean 
  }) => {
    return apiRequest(`/clients/${clientId}`, 'PUT', clientData);
  },
  
  delete: async (clientId: string) => {
    return apiRequest(`/clients/${clientId}`, 'DELETE');
  }
};

// Project API services
export const projectApi = {
  create: async (projectData: {
    projectIdStr: string;
    name: string;
    clientId: string;
    type: string;
    status: string;
    priority: string;
    totalBudget: number;
    startDate: string;
    completionDate: string;
  }) => {
    return apiRequest('/projects', 'POST', projectData);
  },
  
  getAllProjects: async () => {
    return apiRequest('/projects');
  },
  
  getById: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}`);
  },
  
  update: async (projectId: string, projectData: {
    name?: string;
    status?: string;
    totalBudget?: number;
  }) => {
    return apiRequest(`/projects/${projectId}`, 'PUT', projectData);
  },
  
  delete: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}`, 'DELETE');
  },
  
  // Boards under a project
  getBoards: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/boards`);
  },
  
  // Sprints under a project
  getSprints: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/sprints`);
  },
  
  // Epics under a project
  getEpics: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/epics`);
  },
  
  // Stories under a project
  getStories: async (projectId: string, sprintId?: string) => {
    const query = sprintId ? `?sprintId=${sprintId}` : '';
    return apiRequest(`/projects/${projectId}/stories${query}`);
  },
  
  // Budget items and summary
  getBudgetItems: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/budgets`);
  },
  
  getBudgetSummary: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/budgets/summary`);
  },
  
  // Expenses
  getExpenses: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/expenses`);
  }
};

// Board API services
export const boardApi = {
  create: async (projectId: string, boardData: { 
    name: string; 
    filterJQL: string 
  }) => {
    return apiRequest(`/projects/${projectId}/boards`, 'POST', boardData);
  },
  
  getProjectBoards: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/boards`);
  },
  
  getById: async (boardId: string) => {
    return apiRequest(`/boards/${boardId}`);
  },
  
  update: async (projectId: string, boardId: string, boardData: { 
    name?: string; 
    filterJQL?: string 
  }) => {
    return apiRequest(`/projects/${projectId}/boards/${boardId}`, 'PUT', boardData);
  },
  
  delete: async (boardId: string) => {
    return apiRequest(`/boards/${boardId}`, 'DELETE');
  },
  
  archive: async (boardId: string) => {
    return apiRequest(`/boards/${boardId}/archive`, 'POST');
  },
  
  getSprints: async (boardId: string) => {
    return apiRequest(`/boards/${boardId}/sprints`);
  },
  
  getBacklog: async (boardId: string) => {
    return apiRequest(`/boards/${boardId}/backlog`);
  }
};

// Sprint API services
export const sprintApi = {
  create: async (projectId: string, boardId: string, sprintData: {
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    status: string;
  }) => {
    return apiRequest(`/projects/${projectId}/boards/${boardId}/sprints`, 'POST', sprintData);
  },
  
  getProjectSprints: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/sprints`);
  },
  
  getById: async (sprintId: string) => {
    return apiRequest(`/sprints/${sprintId}`);
  },
  
  update: async (sprintId: string, sprintData: {
    goal?: string;
    endDate?: string;
    status?: string;
  }) => {
    return apiRequest(`/sprints/${sprintId}`, 'PUT', sprintData);
  },
  
  start: async (sprintId: string, data: { goal: string; endDate: string }) => {
    return apiRequest(`/sprints/${sprintId}/start`, 'POST', data);
  },
  
  complete: async (sprintId: string, data: { 
    moveUnfinishedToBacklog: boolean; 
    retrospectiveNotes: string 
  }) => {
    return apiRequest(`/sprints/${sprintId}/complete`, 'POST', data);
  },
  
  cancel: async (sprintId: string) => {
    return apiRequest(`/sprints/${sprintId}/cancel`, 'POST');
  }
};

// Epic API services
export const epicApi = {
  create: async (projectId: string, epicData: {
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
  }) => {
    return apiRequest(`/projects/${projectId}/epics`, 'POST', epicData);
  },
  
  getAll: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/epics`);
  },
  
  getById: async (epicId: string) => {
    return apiRequest(`/epics/${epicId}`);
  },
  
  getStories: async (epicId: string) => {
    return apiRequest(`/epics/${epicId}/stories`);
  },
  
  update: async (epicId: string, epicData: { 
    description?: string; 
    status?: string 
  }) => {
    return apiRequest(`/epics/${epicId}`, 'PUT', epicData);
  },
  
  delete: async (projectId: string, epicId: string) => {
    return apiRequest(`/projects/${projectId}/epics/${epicId}`, 'DELETE');
  }
};

// Story API services
export const storyApi = {
  create: async (epicId: string, storyData: {
    title: string;
    description: string;
    assigneeId?: string;
    reporterId: string;
    status: string;
    priority: string;
    points: number;
    isReady: boolean;
  }) => {
    return apiRequest(`/epics/${epicId}/stories`, 'POST', storyData);
  },
  
  assignToSprint: async (storyId: string, sprintId: string | null) => {
    return apiRequest(`/stories/${storyId}/sprint`, 'PUT', { sprintId });
  },
  
  getById: async (storyId: string) => {
    return apiRequest(`/stories/${storyId}`);
  },
  
  update: async (storyId: string, storyData: {
    priority?: string;
    points?: number;
    status?: string;
  }) => {
    return apiRequest(`/stories/${storyId}`, 'PUT', storyData);
  },
  
  toggleReady: async (storyId: string, isReady: boolean) => {
    return apiRequest(`/stories/${storyId}/ready`, 'PUT', { isReady });
  },
  
  delete: async (storyId: string) => {
    return apiRequest(`/stories/${storyId}`, 'DELETE');
  }
};

// Task API services
export const taskApi = {
  create: async (taskData: {
    title: string;
    description: string;
    projectId: string;
    storyId: string;
    assigneeId: string;
    reporterId: string;
    status: string;
    priority: string;
    estimatedHours: number;
  }) => {
    return apiRequest('/tasks', 'POST', taskData);
  },
  
  getById: async (taskId: string) => {
    return apiRequest(`/tasks/${taskId}`);
  },
  
  update: async (taskId: string, taskData: {
    estimatedHours?: number;
    status?: string;
  }) => {
    return apiRequest(`/tasks/${taskId}`, 'PUT', taskData);
  },
  
  delete: async (taskId: string) => {
    return apiRequest(`/tasks/${taskId}`, 'DELETE');
  },
  
  getAll: async (filters: Record<string, any> = {}) => {
    // Convert filters to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    return apiRequest(`/tasks${queryString ? `?${queryString}` : ''}`);
  },
  
  assign: async (taskId: string, assigneeId: string | null) => {
    return apiRequest(`/tasks/${taskId}/assign`, 'PUT', { assigneeId });
  },
  
  addLabels: async (taskId: string, labelIds: string[]) => {
    return apiRequest(`/tasks/${taskId}/labels`, 'POST', { labelIds });
  },
  
  removeLabels: async (taskId: string, labelIds: string[]) => {
    return apiRequest(`/tasks/${taskId}/labels`, 'DELETE', { labelIds });
  },
  
  addDependency: async (sourceTaskId: string, targetTaskId: string, type: string) => {
    return apiRequest('/tasks/dependencies', 'POST', { sourceTaskId, targetTaskId, type });
  },
  
  removeDependency: async (dependencyId: string) => {
    return apiRequest(`/tasks/dependencies/${dependencyId}`, 'DELETE');
  }
};

// Budget API services
export const budgetApi = {
  createItem: async (projectId: string, budgetData: {
    name: string;
    category: string;
    amount: number;
  }) => {
    return apiRequest(`/projects/${projectId}/budgets`, 'POST', budgetData);
  },
  
  getItems: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/budgets`);
  },
  
  getItemById: async (budgetItemId: string) => {
    return apiRequest(`/budgets/${budgetItemId}`);
  },
  
  updateItem: async (budgetItemId: string, budgetData: {
    amount?: number;
    status?: string;
  }) => {
    return apiRequest(`/budgets/${budgetItemId}`, 'PUT', budgetData);
  },
  
  deleteItem: async (budgetItemId: string) => {
    return apiRequest(`/budgets/${budgetItemId}`, 'DELETE');
  }
};

// Expense API services
export const expenseApi = {
  create: async (projectId: string, expenseData: {
    budgetItemId: string;
    amount: number;
    description: string;
    category: string;
    paymentMethod: string;
  }) => {
    return apiRequest(`/projects/${projectId}/expenses`, 'POST', expenseData);
  },
  
  createExpense: async (projectId: string, expenseData: {
    budgetItemId: string | null;
    amount: number;
    description: string;
    category?: string;
    date?: string;
    paymentMethod?: string;
    paymentStatus?: string;
  }) => {
    return apiRequest(`/projects/${projectId}/expenses`, 'POST', expenseData);
  },
  
  getProjectExpenses: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/expenses`);
  },
  
  getById: async (expenseId: string) => {
    return apiRequest(`/expenses/${expenseId}`);
  },
  
  update: async (expenseId: string, expenseData: {
    amount?: number;
    paymentMethod?: string;
  }) => {
    return apiRequest(`/expenses/${expenseId}`, 'PUT', expenseData);
  },
  
  delete: async (expenseId: string) => {
    return apiRequest(`/expenses/${expenseId}`, 'DELETE');
  },
  
  approve: async (expenseId: string) => {
    return apiRequest(`/expenses/${expenseId}/approve`, 'POST');
  },
  
  reject: async (expenseId: string) => {
    return apiRequest(`/expenses/${expenseId}/reject`, 'POST');
  }
};

// Reports API services
export const reportApi = {
  getProjectSummary: async () => {
    return apiRequest('/reports/projects');
  },
  
  getBudgetAnalysis: async () => {
    return apiRequest('/reports/budget');
  },
  
  getTeamPerformance: async () => {
    return apiRequest('/reports/team');
  },
  
  getAIInsights: async () => {
    return apiRequest('/reports/ai-insights');
  },
  
  exportReport: async (data: { reportType: string; format: string }) => {
    return apiRequest('/reports/export', 'POST', data);
  }
}; 