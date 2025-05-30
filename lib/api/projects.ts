import { apiRequest, retryRequestWithNewToken, buildQueryString } from './core';
import { User } from '../types';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
}

export interface Project {
  id: string;
  projectIdStr: string;
  name: string;
  clientId?: string;
  ownerId: string;
  duration?: string;
  startDate?: Date;
  completionDate?: Date;
  approxValueOfServices?: number;
  narrativeDescription?: string;
  actualServicesDescription?: string;
  country?: string;
  city?: string;
  nameOfClient?: string;
  type: 'Scrum' | 'Kanban';
  status: 'Not Started' | 'Active' | 'In Progress' | 'Review' | 'Completed' | 'Archived' | 'On Hold';
  progress: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  totalBudget: number;
  usedBudget: number;
  client?: Client;
  owner?: User;
  members?: User[];
}

// Project API functions
export const projectsApi = {
  // Get all projects with optional filters
  getAll: async (filters: Record<string, any> = {}): Promise<Project[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects${buildQueryString(filters)}`)
    );
  },
  
  // Get a specific project by ID
  getById: async (projectId: string): Promise<Project> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}`)
    );
  },
  
  // Create a new project
  create: async (projectData: Partial<Project>): Promise<Project> => {
    return retryRequestWithNewToken(() => 
      apiRequest('/projects', 'POST', projectData)
    );
  },
  
  // Update an existing project
  update: async (projectId: string, projectData: Partial<Project>): Promise<Project> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}`, 'PUT', projectData)
    );
  },
  
  // Delete a project
  delete: async (projectId: string): Promise<void> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}`, 'DELETE')
    );
  },
  
  // Add team members to a project
  addMembers: async (projectId: string, userIds: string[]): Promise<void> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/members`, 'POST', { userIds })
    );
  },
  
  // Remove team members from a project
  removeMembers: async (projectId: string, userIds: string[]): Promise<void> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/members`, 'DELETE', { userIds })
    );
  },
};

// Client API functions
export const clientsApi = {
  // Get all clients
  getAll: async (): Promise<Client[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest('/clients')
    );
  },
  
  // Get a specific client by ID
  getById: async (clientId: string): Promise<Client> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/clients/${clientId}`)
    );
  },
  
  // Create a new client
  create: async (clientData: Partial<Client>): Promise<Client> => {
    return retryRequestWithNewToken(() => 
      apiRequest('/clients', 'POST', clientData)
    );
  },
  
  // Update an existing client
  update: async (clientId: string, clientData: Partial<Client>): Promise<Client> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/clients/${clientId}`, 'PUT', clientData)
    );
  },
  
  // Delete a client
  delete: async (clientId: string): Promise<void> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/clients/${clientId}`, 'DELETE')
    );
  }
}; 