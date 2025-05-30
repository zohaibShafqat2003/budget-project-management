import { refreshAccessToken } from "./auth";

// Base API URL from environment variable or fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle specific error status codes
    if (response.status === 401) {
      // Attempt to refresh the token if unauthorized
      try {
        await refreshAccessToken();
        // Let the caller retry with the new token
        throw new Error('Token refreshed, please retry the request');
      } catch (refreshError) {
        throw new Error('Authentication failed. Please log in again.');
      }
    }
    
    // For other errors, use the error message from the API or a fallback
    throw new Error(data.message || 'An error occurred while fetching data');
  }
  
  return data;
};

// Generic API request function with authentication
const apiRequest = async (
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET', 
  body?: any,
  customHeaders: Record<string, string> = {}
) => {
  // Get auth token from local storage (browser only)
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

// Project API services
export const projectApi = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/projects${query}`);
  },
  
  getById: async (id: string) => {
    return apiRequest(`/projects/${id}`);
  },
  
  create: async (projectData: any) => {
    return apiRequest('/projects', 'POST', projectData);
  },
  
  update: async (id: string, projectData: any) => {
    return apiRequest(`/projects/${id}`, 'PUT', projectData);
  },
  
  delete: async (id: string) => {
    return apiRequest(`/projects/${id}`, 'DELETE');
  },
  
  addMembers: async (projectId: string, userIds: string[]) => {
    return apiRequest(`/projects/${projectId}/members`, 'POST', { userIds });
  }
};

// Task API services
export const taskApi = {
  getAll: async (filters: Record<string, any> = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/tasks${queryString}`);
  },
  
  getProjectTasks: async (projectId: string) => {
    return apiRequest(`/tasks?projectId=${projectId}`);
  },
  
  getById: async (taskId: string) => {
    return apiRequest(`/tasks/${taskId}`);
  },
  
  create: async (taskData: any) => {
    return apiRequest('/tasks', 'POST', taskData);
  },
  
  update: async (taskId: string, taskData: any) => {
    return apiRequest(`/tasks/${taskId}`, 'PUT', taskData);
  },
  
  updateStatus: async (taskId: string, status: string) => {
    return apiRequest(`/tasks/${taskId}/status`, 'PATCH', { status });
  },
  
  delete: async (taskId: string) => {
    return apiRequest(`/tasks/${taskId}`, 'DELETE');
  }
};

// Budget API services
export const budgetApi = {
  getProjectBudget: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/budget`);
  },
  
  createBudgetItem: async (projectId: string, budgetData: any) => {
    return apiRequest(`/projects/${projectId}/budget`, 'POST', budgetData);
  },
  
  updateBudgetItem: async (projectId: string, itemId: string, budgetData: any) => {
    return apiRequest(`/projects/${projectId}/budget/${itemId}`, 'PUT', budgetData);
  },
  
  deleteBudgetItem: async (projectId: string, itemId: string) => {
    return apiRequest(`/projects/${projectId}/budget/${itemId}`, 'DELETE');
  }
};

// Expense API services
export const expenseApi = {
  getProjectExpenses: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/expenses`);
  },
  
  createExpense: async (projectId: string, expenseData: any) => {
    return apiRequest(`/projects/${projectId}/expenses`, 'POST', expenseData);
  },
  
  updateExpense: async (projectId: string, expenseId: string, expenseData: any) => {
    return apiRequest(`/projects/${projectId}/expenses/${expenseId}`, 'PUT', expenseData);
  },
  
  deleteExpense: async (projectId: string, expenseId: string) => {
    return apiRequest(`/projects/${projectId}/expenses/${expenseId}`, 'DELETE');
  }
};

// User API services
export const userApi = {
  getAll: async () => {
    return apiRequest('/users');
  },
  
  getById: async (id: string) => {
    return apiRequest(`/users/${id}`);
  },
  
  getProfile: async () => {
    return apiRequest('/users/me');
  },
  
  update: async (id: string, userData: any) => {
    return apiRequest(`/users/${id}`, 'PUT', userData);
  },
  
  updateProfile: async (userData: any) => {
    return apiRequest('/users/me', 'PUT', userData);
  }
};

// Client API services
export const clientApi = {
  getAll: async () => {
    return apiRequest('/clients');
  },
  
  getById: async (id: string) => {
    return apiRequest(`/clients/${id}`);
  },
  
  create: async (clientData: any) => {
    return apiRequest('/clients', 'POST', clientData);
  },
  
  update: async (id: string, clientData: any) => {
    return apiRequest(`/clients/${id}`, 'PUT', clientData);
  },
  
  delete: async (id: string) => {
    return apiRequest(`/clients/${id}`, 'DELETE');
  }
};

// File upload API service
export const fileApi = {
  uploadAttachment: async (file: File, entityType: string, entityId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    
    // Get auth token from local storage (browser only)
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken') || '';
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/attachments`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include'
    });
    
    return handleResponse(response);
  },
  
  deleteAttachment: async (attachmentId: string) => {
    return apiRequest(`/attachments/${attachmentId}`, 'DELETE');
  }
};

// Board API service
export const boardApi = {
  getByProject: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/boards`);
  },
  
  getById: async (boardId: string) => {
    return apiRequest(`/boards/${boardId}`);
  },
  
  getSprints: async (boardId: string) => {
    return apiRequest(`/boards/${boardId}/sprints`);
  },
  
  getBacklog: async (boardId: string) => {
    return apiRequest(`/boards/${boardId}/backlog`);
  },
  
  create: async (projectId: string, boardData: any) => {
    return apiRequest(`/projects/${projectId}/boards`, 'POST', boardData);
  },
  
  update: async (projectId: string, boardId: string, boardData: any) => {
    return apiRequest(`/projects/${projectId}/boards/${boardId}`, 'PUT', boardData);
  },
  
  archive: async (boardId: string) => {
    return apiRequest(`/boards/${boardId}/archive`, 'POST');
  }
};

// Sprint API service
export const sprintApi = {
  getByProject: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/sprints`);
  },
  
  getByBoard: async (boardId: string) => {
    return apiRequest(`/boards/${boardId}/sprints`);
  },
  
  getById: async (sprintId: string) => {
    return apiRequest(`/sprints/${sprintId}`);
  },
  
  create: async (projectId: string, boardId: string, sprintData: any) => {
    return apiRequest(`/projects/${projectId}/boards/${boardId}/sprints`, 'POST', sprintData);
  },
  
  update: async (sprintId: string, sprintData: any) => {
    return apiRequest(`/sprints/${sprintId}`, 'PUT', sprintData);
  },
  
  start: async (sprintId: string, startData: any) => {
    return apiRequest(`/sprints/${sprintId}/start`, 'POST', startData);
  },
  
  complete: async (sprintId: string, completeData: any) => {
    return apiRequest(`/sprints/${sprintId}/complete`, 'POST', completeData);
  },
  
  cancel: async (sprintId: string) => {
    return apiRequest(`/sprints/${sprintId}/cancel`, 'POST');
  }
};

// Epic API service
export const epicApi = {
  getByProject: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}/epics`);
  },
  
  getById: async (epicId: string) => {
    return apiRequest(`/epics/${epicId}`);
  },
  
  getStories: async (epicId: string) => {
    return apiRequest(`/epics/${epicId}/stories`);
  },
  
  create: async (projectId: string, epicData: any) => {
    return apiRequest(`/projects/${projectId}/epics`, 'POST', epicData);
  },
  
  update: async (epicId: string, epicData: any) => {
    return apiRequest(`/epics/${epicId}`, 'PUT', epicData);
  },
  
  delete: async (epicId: string) => {
    return apiRequest(`/epics/${epicId}`, 'DELETE');
  }
};

// Story API service
export const storyApi = {
  getByProject: async (projectId: string, options: Record<string, any> = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/projects/${projectId}/stories${queryString}`);
  },
  
  getById: async (storyId: string) => {
    return apiRequest(`/stories/${storyId}`);
  },
  
  create: async (epicId: string, storyData: any) => {
    return apiRequest(`/epics/${epicId}/stories`, 'POST', storyData);
  },
  
  update: async (storyId: string, storyData: any) => {
    return apiRequest(`/stories/${storyId}`, 'PUT', storyData);
  },
  
  assignToSprint: async (storyId: string, sprintId: string | null) => {
    return apiRequest(`/stories/${storyId}/sprint`, 'PUT', { sprintId });
  },
  
  setReadyStatus: async (storyId: string, isReady: boolean) => {
    return apiRequest(`/stories/${storyId}/ready`, 'PUT', { isReady });
  },
  
  delete: async (storyId: string) => {
    return apiRequest(`/stories/${storyId}`, 'DELETE');
  }
}; 