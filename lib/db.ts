// Define the base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Mock database implementation - replace with your preferred database
interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockProject {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
  status: string;
  startDate: Date;
  endDate: Date;
  ownerId: string;
  teamMembers: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface MockTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId: string;
  projectId: string;
  estimatedHours: number;
  actualHours: number;
  estimatedCost: number;
  actualCost: number;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface MockSprint {
  id: string;
  name: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  status: string;
  goals: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface MockBudgetEntry {
  id: string;
  projectId: string;
  category: string;
  amount: number;
  type: string;
  description: string;
  date: Date;
  createdAt: Date;
}

class MockDatabase {
  private users: MockUser[] = [
    {
      id: "1",
      email: "demo@example.com",
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private projects: MockProject[] = [
    {
      id: "1",
      name: "Website Redesign",
      description: "Complete overhaul of company website",
      budget: 50000,
      spent: 15000,
      status: "active",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-06-01"),
      ownerId: "1",
      teamMembers: ["1"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private tasks: MockTask[] = [
    {
      id: "1",
      title: "Design Homepage",
      description: "Create new homepage design",
      status: "in-progress",
      priority: "high",
      assigneeId: "1",
      projectId: "1",
      estimatedHours: 40,
      actualHours: 20,
      estimatedCost: 2000,
      actualCost: 1000,
      dueDate: new Date("2024-02-15"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private sprints: MockSprint[] = [
    {
      id: "1",
      name: "Sprint 1 - Foundation",
      projectId: "1",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-14"),
      budget: 10000,
      spent: 5000,
      status: "completed",
      goals: ["Setup project structure", "Initial designs"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private budgetEntries: MockBudgetEntry[] = [
    {
      id: "1",
      projectId: "1",
      category: "Design",
      amount: 5000,
      type: "expense",
      description: "UI/UX Design work",
      date: new Date(),
      createdAt: new Date(),
    },
  ];

  // User methods
  async findUserByEmail(email: string): Promise<MockUser | null> {
    return this.users.find((user) => user.email === email) || null;
  }

  async findUserById(id: string): Promise<MockUser | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  async createUser(userData: Omit<MockUser, "id" | "createdAt" | "updatedAt">): Promise<MockUser> {
    const user: MockUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // Project methods
  async getProjectsByUserId(userId: string): Promise<MockProject[]> {
    return this.projects.filter((project) => project.ownerId === userId || project.teamMembers.includes(userId));
  }

  async getProjectById(id: string): Promise<MockProject | null> {
    return this.projects.find((project) => project.id === id) || null;
  }

  async createProject(projectData: Omit<MockProject, "id" | "createdAt" | "updatedAt">): Promise<MockProject> {
    const project: MockProject = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.push(project);
    return project;
  }

  async updateProject(id: string, updates: Partial<MockProject>): Promise<MockProject | null> {
    const index = this.projects.findIndex((project) => project.id === id);
    if (index === -1) return null;

    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.projects[index];
  }

  // Task methods
  async getTasksByProjectId(projectId: string): Promise<MockTask[]> {
    return this.tasks.filter((task) => task.projectId === projectId);
  }

  async getTasksByUserId(userId: string): Promise<MockTask[]> {
    return this.tasks.filter((task) => task.assigneeId === userId);
  }

  async createTask(taskData: Omit<MockTask, "id" | "createdAt" | "updatedAt">): Promise<MockTask> {
    const task: MockTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.push(task);
    return task;
  }

  async updateTask(id: string, updates: Partial<MockTask>): Promise<MockTask | null> {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) return null;

    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.tasks[index];
  }

  // Sprint methods
  async getSprintsByProjectId(projectId: string): Promise<MockSprint[]> {
    return this.sprints.filter((sprint) => sprint.projectId === projectId);
  }

  async createSprint(sprintData: Omit<MockSprint, "id" | "createdAt" | "updatedAt">): Promise<MockSprint> {
    const sprint: MockSprint = {
      ...sprintData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sprints.push(sprint);
    return sprint;
  }

  // Budget methods
  async getBudgetEntriesByProjectId(projectId: string): Promise<MockBudgetEntry[]> {
    return this.budgetEntries.filter((entry) => entry.projectId === projectId);
  }

  async createBudgetEntry(entryData: Omit<MockBudgetEntry, "id" | "createdAt">): Promise<MockBudgetEntry> {
    const entry: MockBudgetEntry = {
      ...entryData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.budgetEntries.push(entry);
    return entry;
  }
}

export const db = new MockDatabase();

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

// Mock boards for testing
const mockBoards: Board[] = [
  {
    id: "board-1",
    projectId: "1",
    name: "Development Board",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock sprints for testing
const mockSprints: Sprint[] = [
  {
    id: "sprint-1",
    boardId: "board-1",
    projectId: "1",
    name: "Sprint 1",
    goal: "Complete initial features",
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    status: "Active",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock epics for testing
const mockEpics: Epic[] = [
  {
    id: "epic-1",
    projectId: "1",
    name: "User Authentication",
    description: "Implement user authentication system",
    status: "In Progress",
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock stories for testing
const mockStories: Story[] = [
  {
    id: "story-1",
    epicId: "epic-1",
    projectId: "1",
    title: "User Registration",
    description: "Implement user registration functionality",
    status: "In Progress",
    priority: "High",
    points: 5,
    isReady: true,
    sprintId: "sprint-1",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock tasks for testing
const mockTasks: Task[] = [
  {
    id: "task-1",
    key: "PROJ-1",
    title: "Setup User Authentication API",
    description: "Implement user authentication endpoints",
    status: "In Progress",
    type: "Task",
    priority: "High",
    projectId: "1",
    epicId: "epic-1",
    storyId: "story-1",
    sprintId: "sprint-1",
    storyPoints: 3,
    assigneeId: "user-1",
    estimatedHours: 8,
    actualHours: 4,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

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
    return mockTasks.filter(task => {
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
    return mockTasks.filter(t => t.projectId === projectId);
  }
}

export async function getTaskById(id: string): Promise<Task> {
  try {
    return await fetchApi(`tasks/${id}`);
  } catch (error) {
    console.error('Error fetching task, using mock data:', error);
    return mockTasks.find(t => t.id === id) || {
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

export async function updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
  try {
    return await fetchApi(`tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  } catch (error) {
    console.error('Error updating task, using mock data:', error);
    const taskIndex = mockTasks.findIndex(t => t.id === id);
    if (taskIndex >= 0) {
      mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...taskData, updatedAt: new Date() };
      return mockTasks[taskIndex];
    }
    throw new Error(`Task with id ${id} not found`);
  }
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
  status: 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked';
  priority: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
  points?: number;
  isReady?: boolean;
  sprintId?: string;
  labels?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper function for API calls
async function fetchApi(url: string, options: RequestInit = {}) {
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
  // The Postman spec GET /boards/{{boardId}} implies boardId is globally unique or context is known.
  // Adjust if projectId is needed in path.
  try {
    return await fetchApi(`boards/${boardId}`);
  } catch (error) {
    console.error('Error fetching board, using mock data:', error);
    return mockBoards.find(b => b.id === boardId) || {
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
    return mockBoards.filter(b => b.projectId === projectId);
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
  // Assuming sprintId is globally unique or context known.
  try {
    return await fetchApi(`sprints/${sprintId}`);
  } catch (error) {
    console.error('Error fetching sprint, using mock data:', error);
    return mockSprints.find(s => s.id === sprintId) || {
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
    return mockSprints.filter(s => s.boardId === boardId && s.projectId === projectId);
  }
}

export async function getSprintsByProject(projectId: string): Promise<Sprint[]> {
  try {
    return await fetchApi(`projects/${projectId}/sprints`);
  } catch (error) {
    console.error('Error fetching sprints by project, using mock data:', error);
    return mockSprints.filter(s => s.projectId === projectId);
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
    return mockEpics.find(e => e.id === epicId) || {
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
    return mockEpics.filter(e => e.projectId === projectId);
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
    const response = await fetchApi(`/projects/${projectId}/stories`, {
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
      status: storyData.status,
      priority: storyData.priority,
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
    return mockStories.find(s => s.id === storyId) || {
      id: storyId,
      epicId: "epic-1",
      projectId: "1",
      title: "Default Story",
      description: "Default story description",
      status: "Backlog",
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
    return mockStories.filter(s => s.epicId === epicId);
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
    let filteredStories = mockStories.filter(s => s.projectId === projectId);
    if (filters.sprintId) {
      filteredStories = filteredStories.filter(s => s.sprintId === filters.sprintId);
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
  // The actual endpoint might be /api/stories/${storyId} or /api/projects/${projectId}/stories/${storyId}
  // Adjust based on Postman collection. Assuming /api/projects/${projectId}/stories/${storyId} for now.
  return fetchApi(`projects/${projectId}/stories/${storyId}`, {
    method: 'PATCH', // Or PUT
    body: JSON.stringify(storyData),
  });
}

export async function deleteStory(projectId: string, storyId: string): Promise<void> {
  // Adjust endpoint based on Postman. Assuming /api/projects/${projectId}/stories/${storyId} for now.
  await fetchApi(`projects/${projectId}/stories/${storyId}`, {
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
