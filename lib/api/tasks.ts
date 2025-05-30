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
    return retryRequestWithNewToken(() => 
      apiRequest(`/tasks${buildQueryString(filters)}`)
    );
  },
  
  // Get tasks for a specific project
  getByProject: async (projectId: string, filters: Record<string, any> = {}): Promise<Task[]> => {
    const allFilters = { ...filters, projectId };
    return retryRequestWithNewToken(() => 
      apiRequest(`/tasks${buildQueryString(allFilters)}`)
    );
  },
  
  // Get a specific task by ID
  getById: async (taskId: string): Promise<Task> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/tasks/${taskId}`)
    );
  },
  
  // Create a new task
  create: async (taskData: Partial<Task>): Promise<Task> => {
    return retryRequestWithNewToken(() => 
      apiRequest('/tasks', 'POST', taskData)
    );
  },
  
  // Update an existing task
  update: async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/tasks/${taskId}`, 'PUT', taskData)
    );
  },
  
  // Update just the status of a task
  updateStatus: async (taskId: string, status: Task['status']): Promise<Task> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/tasks/${taskId}/status`, 'PATCH', { status })
    );
  },
  
  // Delete a task
  delete: async (taskId: string): Promise<void> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/tasks/${taskId}`, 'DELETE')
    );
  },
  
  // Get comments for a task
  getComments: async (issueId: string): Promise<TaskComment[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/issues/${issueId}/comments`)
    );
  },
  
  // Add a comment to a task
  addComment: async (issueId: string, content: string): Promise<TaskComment> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/issues/${issueId}/comments`, 'POST', { content })
    );
  }
}; 