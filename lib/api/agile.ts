import { apiRequest, retryRequestWithNewToken, buildQueryString } from './core';
import { User } from '../types';

export interface Board {
  id: string;
  projectId: string;
  name: string;
  filterJQL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  boardId: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate: Date;
  endDate: Date;
  status: 'Planning' | 'Active' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Epic {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Story {
  id: string;
  epicId: string;
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assignee?: User;
  reporterId?: string;
  reporter?: User;
  status: 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
  points?: number;
  isReady?: boolean;
  sprintId?: string;
  labels?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Board API functions
export const boardsApi = {
  // Get all boards for a project
  getByProject: async (projectId: string): Promise<Board[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/boards`)
    );
  },
  
  // Get a specific board by ID
  getById: async (boardId: string): Promise<Board> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/boards/${boardId}`)
    );
  },
  
  // Create a new board
  create: async (projectId: string, boardData: { name: string; filterJQL?: string }): Promise<Board> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/boards`, 'POST', boardData)
    );
  }
};

// Sprint API functions
export const sprintsApi = {
  // Get all sprints for a board
  getByBoard: async (projectId: string, boardId: string): Promise<Sprint[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/boards/${boardId}/sprints`)
    );
  },
  
  // Get all sprints for a project
  getByProject: async (projectId: string): Promise<Sprint[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/sprints`)
    );
  },
  
  // Get a specific sprint by ID
  getById: async (sprintId: string): Promise<Sprint> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/sprints/${sprintId}`)
    );
  },
  
  // Create a new sprint
  create: async (
    projectId: string, 
    boardId: string, 
    sprintData: { 
      name: string; 
      goal?: string; 
      startDate: string; 
      endDate: string; 
      status: Sprint['status'] 
    }
  ): Promise<Sprint> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/boards/${boardId}/sprints`, 'POST', sprintData)
    );
  }
};

// Epic API functions
export const epicsApi = {
  // Get all epics for a project
  getByProject: async (projectId: string): Promise<Epic[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/epics`)
    );
  },
  
  // Get a specific epic by ID
  getById: async (epicId: string): Promise<Epic> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/epics/${epicId}`)
    );
  },
  
  // Create a new epic
  create: async (
    projectId: string, 
    epicData: { 
      name: string; 
      description?: string; 
      status: Epic['status']; 
      startDate?: string; 
      endDate?: string 
    }
  ): Promise<Epic> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/epics`, 'POST', epicData)
    );
  }
};

// Story API functions
export const storiesApi = {
  // Get all stories for an epic
  getByEpic: async (epicId: string): Promise<Story[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/epics/${epicId}/stories`)
    );
  },
  
  // Get all stories for a project with optional filters
  getByProject: async (
    projectId: string, 
    filters: { sprintId?: string } = {}
  ): Promise<Story[]> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/stories${buildQueryString(filters)}`)
    );
  },
  
  // Get a specific story by ID
  getById: async (storyId: string): Promise<Story> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/stories/${storyId}`)
    );
  },
  
  // Create a new story
  create: async (
    epicId: string, 
    storyData: { 
      title: string; 
      description?: string; 
      assigneeId?: string; 
      reporterId?: string; 
      status: Story['status']; 
      priority: Story['priority']; 
      points?: number; 
      isReady?: boolean;
      projectId: string;
    }
  ): Promise<Story> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/epics/${epicId}/stories`, 'POST', storyData)
    );
  },
  
  // Update an existing story
  update: async (
    projectId: string,
    storyId: string, 
    storyData: Partial<Omit<Story, 'id' | 'projectId' | 'epicId' | 'createdAt' | 'updatedAt'>> & { epicId?: string }
  ): Promise<Story> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/stories/${storyId}`, 'PUT', storyData)
    );
  },
  
  // Delete a story
  delete: async (projectId: string, storyId: string): Promise<void> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/projects/${projectId}/stories/${storyId}`, 'DELETE')
    );
  },
  
  // Assign a story to a sprint
  assignToSprint: async (storyId: string, sprintId: string): Promise<Story> => {
    return retryRequestWithNewToken(() => 
      apiRequest(`/stories/${storyId}/sprint`, 'PUT', { sprintId })
    );
  }
}; 