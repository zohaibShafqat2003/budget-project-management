import { apiRequest, retryRequestWithNewToken, buildQueryString } from './core';
import { User } from '../types';

export interface TaskComment {
  id: string;
  issueId: string;
  userId: string;
  user?: User;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  key?: string;
  title: string;
  description: string;
  status: 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
  type: 'Epic' | 'Story' | 'Task' | 'Bug' | 'Subtask';
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
  projectId: string;
  epicId?: string;
  storyId?: string;
  storyPoints?: number;
  assigneeId?: string;
  assignee?: User;
  reporterId?: string;
  reporter?: User;
  labels?: string[];
  attachments?: string[];
  comments?: TaskComment[];
  estimatedHours?: number;
  actualHours?: number;
  estimatedCost?: number;
  actualCost?: number;
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Task API functions
export const tasksApi = {
  // Get all tasks with optional filters
  getAll: async (filters: Record<string, any> = {}): Promise<Task[]> => {
    try {
      const response = await retryRequestWithNewToken(() => 
        apiRequest(`/tasks${buildQueryString(filters)}`)
      );
      
      // Handle potential response formats:
      // 1. Direct array of tasks
      // 2. { data: Task[] } format
      // 3. { success: true, data: Task[] } format
      
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      } else {
        console.warn('Unexpected response format from tasks API:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return []; // Return empty array instead of throwing to avoid breaking UI
    }
  },
  
  // Get tasks for a specific project
  getByProject: async (projectId: string, filters: Record<string, any> = {}): Promise<Task[]> => {
    try {
      const allFilters = { ...filters, projectId };
      const response = await retryRequestWithNewToken(() => 
        apiRequest(`/tasks${buildQueryString(allFilters)}`)
      );
      
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      } else {
        console.warn('Unexpected response format from tasks API:', response);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      return [];
    }
  },
  
  // Get a specific task by ID
  getById: async (taskId: string): Promise<Task | null> => {
    try {
      const response = await retryRequestWithNewToken(() => 
        apiRequest(`/tasks/${taskId}`)
      );
      
      // Handle potential response formats
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        if ('data' in response) {
          return response.data;
        } else if ('id' in response) {
          return response;
        }
      }
      
      console.warn('Unexpected response format from task API:', response);
      return null;
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      return null;
    }
  },
  
  // Create a new task
  create: async (taskData: Partial<Task>): Promise<Task | null> => {
    try {
      const response = await retryRequestWithNewToken(() => 
        apiRequest('/tasks', 'POST', taskData)
      );
      
      // Handle potential response formats
      if (response && typeof response === 'object') {
        if ('data' in response) {
          return response.data;
        } else if ('id' in response) {
          return response;
        }
      }
      
      console.warn('Unexpected response format from task creation API:', response);
      return null;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error; // Rethrow for create operations so the UI can show appropriate error
    }
  },
  
  // Update an existing task
  update: async (taskId: string, taskData: Partial<Task>): Promise<Task | null> => {
    try {
      const response = await retryRequestWithNewToken(() => 
        apiRequest(`/tasks/${taskId}`, 'PUT', taskData)
      );
      
      // Handle potential response formats
      if (response && typeof response === 'object') {
        if ('data' in response) {
          return response.data;
        } else if ('id' in response) {
          return response;
        }
      }
      
      console.warn('Unexpected response format from task update API:', response);
      return null;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error; // Rethrow for update operations
    }
  },
  
  // Update just the status of a task
  updateStatus: async (taskId: string, status: Task['status']): Promise<Task | null> => {
    try {
      const response = await retryRequestWithNewToken(() => 
        apiRequest(`/tasks/${taskId}/status`, 'PATCH', { status })
      );
      
      // Handle potential response formats
      if (response && typeof response === 'object') {
        if ('data' in response) {
          return response.data;
        } else if ('id' in response) {
          return response;
        }
      }
      
      console.warn('Unexpected response format from task status update API:', response);
      return null;
    } catch (error) {
      console.error(`Error updating status for task ${taskId}:`, error);
      throw error; // Rethrow for update operations
    }
  },
  
  // Delete a task
  delete: async (taskId: string): Promise<boolean> => {
    try {
      await retryRequestWithNewToken(() => 
        apiRequest(`/tasks/${taskId}`, 'DELETE')
      );
      return true;
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error; // Rethrow for delete operations
    }
  },
  
  // Get comments for a task
  getComments: async (issueId: string): Promise<TaskComment[]> => {
    try {
      const response = await retryRequestWithNewToken(() => 
        apiRequest(`/issues/${issueId}/comments`)
      );
      
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      } else {
        console.warn('Unexpected response format from comments API:', response);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching comments for issue ${issueId}:`, error);
      return [];
    }
  },
  
  // Add a comment to a task
  addComment: async (issueId: string, content: string): Promise<TaskComment | null> => {
    try {
      const response = await retryRequestWithNewToken(() => 
        apiRequest(`/issues/${issueId}/comments`, 'POST', { content })
      );
      
      // Handle potential response formats
      if (response && typeof response === 'object') {
        if ('data' in response) {
          return response.data;
        } else if ('id' in response) {
          return response;
        }
      }
      
      console.warn('Unexpected response format from comment creation API:', response);
      return null;
    } catch (error) {
      console.error(`Error adding comment to issue ${issueId}:`, error);
      throw error; // Rethrow for create operations
    }
  }
}; 