// Define the base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Project type definitions based on your backend model
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

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'Admin' | 'Developer' | 'User';
}

// Task interface for Jira-like workflow
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
  sprintId?: string;
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

export interface TaskComment {
  id: string;
  issueId: string;
  userId: string;
  user?: User;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data arrays
const mockTasks: Task[] = [];
const mockBoards: Board[] = [];
const mockSprints: Sprint[] = [];
const mockEpics: Epic[] = [];
const mockStories: Story[] = [];

// Projects API functions
export async function getProjects(filters = {}): Promise<Project[]> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await fetch(`${API_URL}/projects${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch projects');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

// Get a project by ID
export async function getProjectById(id: string): Promise<Project> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/projects/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch project');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    throw error;
  }
}

// Create a new project
export async function createProject(projectData: Partial<Project>): Promise<Project> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create project');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

// Update a project
export async function updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update project');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error updating project ${id}:`, error);
    throw error;
  }
}

// Delete a project
export async function deleteProject(id: string): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete project');
    }
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    throw error;
  }
}

// Add team members to a project
export async function addTeamMembers(projectId: string, userIds: string[]): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/projects/${projectId}/team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add team members');
    }
  } catch (error) {
    console.error(`Error adding team members to project ${projectId}:`, error);
    throw error;
  }
}

// Remove team members from a project
export async function removeTeamMembers(projectId: string, userIds: string[]): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/projects/${projectId}/team`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove team members');
    }
  } catch (error) {
    console.error(`Error removing team members from project ${projectId}:`, error);
    throw error;
  }
}

// Client management functions

// Get all clients
export async function getClients(): Promise<Client[]> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/clients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch clients');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}

// Get a client by ID
export async function getClientById(id: string): Promise<Client> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/clients/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch client');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching client ${id}:`, error);
    throw error;
  }
}

// Create a new client
export async function createClient(clientData: Partial<Client>): Promise<Client> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create client');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
}

// Update a client
export async function updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update client');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error updating client ${id}:`, error);
    throw error;
  }
}

// Delete a client
export async function deleteClient(id: string): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete client');
    }
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error);
    throw error;
  }
}

// User management functions

// Get all users
export async function getUsers(): Promise<User[]> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch users');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Tasks API functions
export async function getTasks(filters = {}): Promise<Task[]> {
  try {
    // Convert filters to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return await fetchApi(`tasks?${queryString}`);
  } catch (error) {
    console.error('Error fetching tasks, using mock data:', error);
    // Apply filters to mock data
    return mockTasks.filter((task: Task) => {
      return Object.entries(filters).every(([key, value]) => {
        // @ts-ignore - dynamic property access
        return task[key] === value;
      });
    });
  }
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  try {
    return await getTasks({ projectId });
  } catch (error) {
    console.error('Error fetching tasks by project, using mock data:', error);
    return mockTasks.filter((t: Task) => t.projectId === projectId);
  }
}

export async function getTaskById(id: string): Promise<Task> {
  try {
    return await fetchApi(`tasks/${id}`);
  } catch (error) {
    console.error('Error fetching task, using mock data:', error);
    return mockTasks.find((t: Task) => t.id === id) || {
      id,
      title: "Default Task",
      description: "Default task description",
      status: "To Do",
      type: "Task",
      priority: "Medium",
      projectId: "1",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export async function createTask(taskData: Partial<Task>): Promise<Task> {
  try {
    // Determine the correct endpoint based on provided data
    let endpoint = 'tasks';
    if (taskData.projectId && !taskData.storyId) {
      endpoint = `projects/${taskData.projectId}/tasks`;
    } else if (taskData.storyId) {
      endpoint = `stories/${taskData.storyId}/tasks`;
    }

    return await fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  } catch (error) {
    console.error('Error creating task, using mock data:', error);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      key: `PROJ-${mockTasks.length + 1}`,
      title: taskData.title || "New Task",
      description: taskData.description || "",
      status: taskData.status || "To Do",
      type: taskData.type || "Task",
      priority: taskData.priority || "Medium",
      projectId: taskData.projectId || "1",
      epicId: taskData.epicId,
      storyId: taskData.storyId,
      sprintId: taskData.sprintId,
      assigneeId: taskData.assigneeId,
      estimatedHours: taskData.estimatedHours,
      actualHours: taskData.actualHours,
      estimatedCost: taskData.estimatedCost,
      actualCost: taskData.actualCost,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockTasks.push(newTask);
    return newTask;
  }
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<{
    status: string;
    priority: string;
    assigneeId: string;
    title: string;
    description: string;
    estimatedHours: number;
    actualHours: number;
    dueDate: string | Date;
    startDate: string | Date;
    [key: string]: any; // Add index signature to allow string indexing
  }> = {} // Default to empty object to prevent null/undefined
): Promise<Task> {
  // Remove null/undefined fields
  const cleanData: Record<string, any> = {};
  
  // Ensure data is not null or undefined
  const safeData = data || {};
  
  // Use Object.entries to avoid TypeScript errors with indexing
  Object.entries(safeData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleanData[key] = value;
    }
  });
  
  // Only make API call if there are fields to update
  if (Object.keys(cleanData).length === 0) {
    throw new Error('No valid fields to update');
  }

  return fetchApi(`tasks/${taskId}`, {
      method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cleanData),
    });
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await fetchApi(`tasks/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting task, using mock data:', error);
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    if (taskIndex >= 0) {
      mockTasks.splice(taskIndex, 1);
    }
  }
}

// Add functions for task label management and dependencies
export async function addLabelsToTask(taskId: string, labelIds: string[]): Promise<void> {
  try {
    const response = await fetchApi(`tasks/${taskId}/labels`, {
      method: 'POST',
      body: JSON.stringify({ labelIds }),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to add labels to task');
    }
  } catch (error) {
    console.error(`Error adding labels to task ${taskId}:`, error);
    throw error;
  }
}

export async function removeLabelsFromTask(taskId: string, labelIds: string[]): Promise<void> {
  try {
    const response = await fetchApi(`tasks/${taskId}/labels`, {
      method: 'DELETE',
      body: JSON.stringify({ labelIds }),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to remove labels from task');
    }
  } catch (error) {
    console.error(`Error removing labels from task ${taskId}:`, error);
    throw error;
  }
}

export async function assignTask(taskId: string, assigneeId?: string): Promise<Task> {
  try {
    const response = await fetchApi(`tasks/${taskId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assigneeId }),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to assign task');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error assigning task ${taskId}:`, error);
    throw error;
  }
}

export async function addTaskDependency(sourceTaskId: string, targetTaskId: string, type: string = 'blocks'): Promise<void> {
  try {
    const response = await fetchApi('tasks/dependencies', {
      method: 'POST',
      body: JSON.stringify({ sourceTaskId, targetTaskId, type }),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to add task dependency');
    }
  } catch (error) {
    console.error(`Error adding dependency between tasks:`, error);
    throw error;
  }
}

export async function removeTaskDependency(dependencyId: string): Promise<void> {
  try {
    const response = await fetchApi(`tasks/dependencies/${dependencyId}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to remove task dependency');
    }
  } catch (error) {
    console.error(`Error removing task dependency:`, error);
    throw error;
  }
}

export async function addTaskComment(issueId: string, content: string): Promise<TaskComment> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Assuming a generic comments endpoint like /issues/{issueId}/comments
    // Adjust if your backend has specific routes like /tasks/{taskId}/comments
    const response = await fetchApi(`issues/${issueId}/comments`, { 
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to add comment');
    }

    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    
    // For development/demo, return mock data - ensure this matches the updated interface
    return {
      id: `comment-${Date.now()}`,
      issueId, // Changed from taskId to issueId
      userId: 'user-1', // mock user
      user: { id: 'user-1', email: "john@example.com", firstName: "John", lastName: "Doe", role: "User" }, // mock user object
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export async function getTaskComments(issueId: string): Promise<TaskComment[]> {
    // Assuming a generic comments endpoint
    return fetchApi(`issues/${issueId}/comments`); 
}

// New interfaces based on Postman spec
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
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  points?: number;
  isReady?: boolean;
  sprintId?: string;
  labels?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper function for API calls
async function fetchApi<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    // Get the auth token from localStorage
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken') || '';
    }

    // If the URL doesn't start with http or /, add the base API URL
    const fullUrl = url.startsWith('http') || url.startsWith('/') 
      ? url 
      : `${API_URL}/${url.startsWith('api/') ? url.substring(4) : url}`;

    // Set up the headers with auth token and content type
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    // Make the request
    const response = await fetch(fullUrl, {
      ...options,
      headers
    });

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    // Parse the response
    const data = await response.json();
    
    // If the API returns { success: true, data: [...] } format, extract the data
    // Otherwise return the data directly
    return data.data !== undefined ? data.data : data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Board API functions
export async function createBoard(projectId: string, boardData: { name: string; filterJQL?: string }): Promise<Board> {
  return fetchApi(`projects/${projectId}/boards`, {
    method: 'POST',
    body: JSON.stringify(boardData),
  });
}

export async function getBoardById(boardId: string): Promise<Board> {
  try {
    return await fetchApi(`boards/${boardId}`);
  } catch (error) {
    console.error('Error fetching board, using mock data:', error);
    return mockBoards.find((b: Board) => b.id === boardId) || {
      id: boardId,
      projectId: "1",
      name: "Default Board",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export async function getBoardsByProject(projectId: string): Promise<Board[]> {
  try {
    return await fetchApi(`projects/${projectId}/boards`);
  } catch (error) {
    console.error('Error fetching boards, using mock data:', error);
    return mockBoards.filter((b: Board) => b.projectId === projectId);
  }
}

// Sprint API functions
export async function createSprint(
  projectId: string, 
  boardId: string, 
  sprintData: { name: string; goal?: string; startDate: string; endDate: string; status: Sprint['status'] }
): Promise<Sprint> {
  try {
    return await fetchApi(`projects/${projectId}/boards/${boardId}/sprints`, {
      method: 'POST',
      body: JSON.stringify(sprintData),
    });
  } catch (error) {
    console.error('Error creating sprint, using mock data:', error);
    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      boardId,
      projectId,
      name: sprintData.name,
      goal: sprintData.goal,
      startDate: new Date(sprintData.startDate),
      endDate: new Date(sprintData.endDate),
      status: sprintData.status,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockSprints.push(newSprint);
    return newSprint;
  }
}

export async function getSprintById(sprintId: string): Promise<Sprint> {
  try {
    return await fetchApi(`sprints/${sprintId}`);
  } catch (error) {
    console.error('Error fetching sprint, using mock data:', error);
    return mockSprints.find((s: Sprint) => s.id === sprintId) || {
      id: sprintId,
      boardId: "board-1",
      projectId: "1",
      name: "Default Sprint",
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export async function getSprintsByBoard(projectId: string, boardId: string): Promise<Sprint[]> {
  try {
    return await fetchApi(`projects/${projectId}/boards/${boardId}/sprints`);
  } catch (error) {
    console.error('Error fetching sprints by board, using mock data:', error);
    return mockSprints.filter((s: Sprint) => s.boardId === boardId && s.projectId === projectId);
  }
}

export async function getSprintsByProject(projectId: string): Promise<Sprint[]> {
  try {
    return await fetchApi(`projects/${projectId}/sprints`);
  } catch (error) {
    console.error('Error fetching sprints by project, using mock data:', error);
    return mockSprints.filter((s: Sprint) => s.projectId === projectId);
  }
}

// Start a sprint
export async function startSprint(sprintId: string, data: { goal: string, endDate: string | Date }): Promise<Sprint> {
  try {
    return await fetchApi(`sprints/${sprintId}/start`, {
      method: 'POST',
      body: JSON.stringify({
        goal: data.goal,
        endDate: typeof data.endDate === 'string' ? data.endDate : data.endDate.toISOString(),
      }),
    });
  } catch (error) {
    console.error('Error starting sprint:', error);
    throw error;
  }
}

// Complete a sprint
export async function completeSprint(
  sprintId: string, 
  data: { moveUnfinishedToBacklog: boolean, retrospectiveNotes?: string }
): Promise<Sprint> {
  try {
    return await fetchApi(`sprints/${sprintId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error completing sprint:', error);
    throw error;
  }
}

// Epic API functions
export async function createEpic(
  projectId: string, 
  epicData: { name: string; description?: string; status: Epic['status']; startDate?: string; endDate?: string }
): Promise<Epic> {
  try {
    return await fetchApi(`projects/${projectId}/epics`, {
      method: 'POST',
      body: JSON.stringify(epicData),
    });
  } catch (error) {
    console.error('Error creating epic, using mock data:', error);
    const newEpic: Epic = {
      id: `epic-${Date.now()}`,
      projectId,
      name: epicData.name,
      description: epicData.description,
      status: epicData.status,
      startDate: epicData.startDate ? new Date(epicData.startDate) : undefined,
      endDate: epicData.endDate ? new Date(epicData.endDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockEpics.push(newEpic);
    return newEpic;
  }
}

export async function getEpicById(epicId: string): Promise<Epic> {
  try {
    return await fetchApi(`epics/${epicId}`);
  } catch (error) {
    console.error('Error fetching epic, using mock data:', error);
    return mockEpics.find((e: Epic) => e.id === epicId) || {
      id: epicId,
      projectId: "1",
      name: "Default Epic",
      description: "Default epic description",
      status: "To Do",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export async function getEpicsByProject(projectId: string): Promise<Epic[]> {
  try {
    return await fetchApi(`projects/${projectId}/epics`);
  } catch (error) {
    console.error('Error fetching epics by project, using mock data:', error);
    return mockEpics.filter((e: Epic) => e.projectId === projectId);
  }
}

// Story API functions
export async function createStory(
  projectId: string, 
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
    epicId?: string; // Make epicId optional
  }
): Promise<Story> {
  try {
    const response = await fetchApi(`projects/${projectId}/stories`, {
      method: 'POST',
      body: JSON.stringify(storyData)
    });
    
    return response;
  } catch (error) {
    console.error('Error creating story, using mock data:', error);
    // Mock data return for development
    const newStory: Story = {
      id: `story-${Date.now()}`,
      epicId: storyData.epicId || '', // Use empty string if epicId is not provided
      projectId: storyData.projectId,
      title: storyData.title,
      description: storyData.description || '',
      assigneeId: storyData.assigneeId,
      status: storyData.status || 'To Do', // Default to 'To Do' instead of 'Backlog'
      priority: storyData.priority || 'Medium',
      points: storyData.points,
      isReady: storyData.isReady || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockStories.push(newStory);
    return newStory;
  }
}

export async function getStoryById(storyId: string): Promise<Story> {
  try {
    return await fetchApi(`stories/${storyId}`);
  } catch (error) {
    console.error('Error fetching story, using mock data:', error);
    return mockStories.find((s: Story) => s.id === storyId) || {
      id: storyId,
      epicId: "epic-1",
      projectId: "1",
      title: "Default Story",
      description: "Default story description",
      status: "To Do",
      priority: "Medium",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export async function getStoriesByEpic(epicId: string): Promise<Story[]> {
  try {
    return await fetchApi(`epics/${epicId}/stories`);
  } catch (error) {
    console.error('Error fetching stories by epic, using mock data:', error);
    return mockStories.filter((s: Story) => s.epicId === epicId);
  }
}

export async function getStoriesByProject(
  projectId: string, 
  filters: { sprintId?: string } = {} // sprintId can be specific ID or "backlog"
): Promise<Story[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters.sprintId) queryParams.append('sprintId', filters.sprintId);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await fetchApi(`projects/${projectId}/stories${queryString}`);
  } catch (error) {
    console.error('Error fetching stories by project, using mock data:', error);
    let filteredStories = mockStories.filter((s: Story) => s.projectId === projectId);
    if (filters.sprintId) {
      filteredStories = filteredStories.filter((s: Story) => s.sprintId === filters.sprintId);
    }
    return filteredStories;
  }
}

export async function assignStoryToSprint(storyId: string, sprintId: string): Promise<Story> {
  return fetchApi(`stories/${storyId}/sprint`, {
    method: 'PUT', // Or POST, check backend
    body: JSON.stringify({ sprintId }),
  });
}

export async function updateStory(
  projectId: string, // Assuming projectId is needed for the endpoint or data
  storyId: string, 
  storyData: Partial<Omit<Story, 'id' | 'projectId' | 'epicId' | 'createdAt' | 'updatedAt'>> & { epicId?: string } // Allow updating epicId too
): Promise<Story> {
  return fetchApi(`stories/${storyId}`, {
    method: 'PUT',
    body: JSON.stringify(storyData),
  });
}

export async function deleteStory(projectId: string, storyId: string): Promise<void> {
  await fetchApi(`stories/${storyId}`, {
    method: 'DELETE',
  });
}

// Budget and Expense API functions
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

export async function createBudgetItem(projectId: string, budgetItemData: {
    name: string;
    category: string;
    amount: number;
}): Promise<BudgetItem> {
    return fetchApi(`projects/${projectId}/budgets`, {
        method: 'POST',
        body: JSON.stringify(budgetItemData),
    });
}

export async function getBudgetItems(projectId: string): Promise<BudgetItem[]> {
    return fetchApi(`projects/${projectId}/budgets`);
}

export async function getBudgetSummary(projectId: string): Promise<BudgetSummary> {
    return fetchApi(`projects/${projectId}/budgets/summary`);
}

export async function createExpense(projectId: string, expenseData: {
    budgetItemId: string;
    amount: number;
    description?: string;
    category: string;
    paymentMethod?: string;
    date?: string; // API might expect ISO string
}): Promise<Expense> {
    return fetchApi(`projects/${projectId}/expenses`, {
        method: 'POST',
        body: JSON.stringify(expenseData),
    });
}

export async function getExpensesByProject(projectId: string): Promise<Expense[]> {
    return fetchApi(`projects/${projectId}/expenses`);
}

export async function getExpenseById(expenseId: string): Promise<Expense> {
    return fetchApi(`expenses/${expenseId}`);
}
