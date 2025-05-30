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

// Import the API_URL from auth.ts
import { API_URL } from './auth';

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
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await fetch(`${API_URL}/tasks${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch tasks');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
    // For development/demo, return mock data
    return [
      {
        id: "task-1",
        key: "PROJ-1",
        title: "Create user authentication system",
        description: "Implement secure user authentication with JWT",
        status: "In Progress",
        type: "Task",
        priority: "High",
        projectId: "project-1",
        storyPoints: 5,
        assigneeId: "user-1",
        assignee: { id: "user-1", email: "john@example.com", firstName: "John", lastName: "Doe" },
        labels: ["Backend", "Security"],
        estimatedHours: 20,
        actualHours: 10,
        dueDate: new Date("2024-05-15"),
        createdAt: new Date("2024-04-01"),
        updatedAt: new Date("2024-04-05")
      },
      {
        id: "task-2",
        key: "PROJ-2",
        title: "Design homepage layout",
        description: "Create responsive design for the homepage",
        status: "To Do",
        type: "Story",
        priority: "Medium",
        projectId: "project-1",
        storyPoints: 8,
        assigneeId: "user-2",
        assignee: { id: "user-2", email: "jane@example.com", firstName: "Jane", lastName: "Smith" },
        labels: ["Design", "Frontend"],
        estimatedHours: 15,
        dueDate: new Date("2024-05-20"),
        createdAt: new Date("2024-04-02"),
        updatedAt: new Date("2024-04-02")
      },
      {
        id: "task-3",
        key: "PROJ-3",
        title: "Setup CI/CD pipeline",
        description: "Configure automated testing and deployment",
        status: "Backlog",
        type: "Task",
        priority: "Medium",
        projectId: "project-1",
        storyPoints: 5,
        labels: ["DevOps", "Infrastructure"],
        createdAt: new Date("2024-04-03"),
        updatedAt: new Date("2024-04-03")
      },
      {
        id: "task-4",
        key: "PROJ-4",
        title: "Fix login form validation",
        description: "Fix validation errors in the login form",
        status: "In Review",
        type: "Bug",
        priority: "High",
        projectId: "project-1",
        storyPoints: 3,
        assigneeId: "user-1",
        assignee: { id: "user-1", email: "john@example.com", firstName: "John", lastName: "Doe" },
        labels: ["Frontend", "Bug"],
        estimatedHours: 4,
        actualHours: 5,
        createdAt: new Date("2024-04-04"),
        updatedAt: new Date("2024-04-08")
      },
      {
        id: "task-5",
        key: "PROJ-5",
        title: "User onboarding experience",
        description: "Create a streamlined onboarding process for new users",
        status: "Done",
        type: "Epic",
        priority: "Highest",
        projectId: "project-1",
        assigneeId: "user-2",
        assignee: { id: "user-2", email: "jane@example.com", firstName: "Jane", lastName: "Smith" },
        labels: ["UX", "Frontend"],
        completedDate: new Date("2024-04-10"),
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-04-10")
      }
    ];
  }
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  return getTasks({ projectId });
}

export async function getTaskById(id: string): Promise<Task> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/tasks/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch task');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    
    // For development/demo, return mock data
    const mockTasks = await getTasks();
    const task = mockTasks.find(task => task.id === id);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    return task;
  }
}

export async function createTask(taskData: Partial<Task>): Promise<Task> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create task');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating task:', error);
    
    // For development/demo, return mock data
    const mockTask: Task = {
      id: `task-${Date.now()}`,
      key: `PROJ-${Math.floor(Math.random() * 1000)}`,
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      status: taskData.status || 'Backlog',
      type: taskData.type || 'Task',
      priority: taskData.priority || 'Medium',
      projectId: taskData.projectId || 'project-1',
      storyPoints: taskData.storyPoints,
      assigneeId: taskData.assigneeId,
      assignee: taskData.assigneeId ? { id: taskData.assigneeId, email: "user@example.com", firstName: "Test", lastName: "User" } : undefined,
      labels: taskData.labels || [],
      estimatedHours: taskData.estimatedHours,
      dueDate: taskData.dueDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return mockTask;
  }
}

export async function updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update task');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating task:', error);
    
    // For development/demo, update mock data
    const existingTask = await getTaskById(id);
    
    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...existingTask,
      ...taskData,
      updatedAt: new Date()
    };
    
    return updatedTask;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete task');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    // For development/demo, just log the error
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
    const response = await fetch(`${API_URL}/issues/${issueId}/comments`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add comment');
    }

    const data = await response.json();
    return data.data;
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
    return fetchApi(`${API_URL}/issues/${issueId}/comments`); 
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
  const token = localStorage.getItem('authToken');
  if (!token) {
    // Allow some public endpoints or handle error as appropriate
    // For now, most item-specific calls will need a token.
    // throw new Error('No authentication token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use status text
      throw new Error(response.statusText || 'API request failed');
    }
    throw new Error(errorData?.message || errorData?.error || 'API request failed');
  }
  // For DELETE or 204 No Content responses
  if (response.status === 204) {
    return null;
  }
  const responseData = await response.json();
  return responseData.data; // Assuming backend wraps data in a 'data' field
}

// Board API functions
export async function createBoard(projectId: string, boardData: { name: string; filterJQL?: string }): Promise<Board> {
  return fetchApi(`${API_URL}/projects/${projectId}/boards`, {
    method: 'POST',
    body: JSON.stringify(boardData),
  });
}

export async function getBoardById(boardId: string): Promise<Board> {
  // The Postman spec GET /boards/{{boardId}} implies boardId is globally unique or context is known.
  // Adjust if projectId is needed in path.
  return fetchApi(`${API_URL}/boards/${boardId}`);
}

export async function getBoardsByProject(projectId: string): Promise<Board[]> {
    return fetchApi(`${API_URL}/projects/${projectId}/boards`);
}

// Sprint API functions
export async function createSprint(
  projectId: string, 
  boardId: string, 
  sprintData: { name: string; goal?: string; startDate: string; endDate: string; status: Sprint['status'] }
): Promise<Sprint> {
  return fetchApi(`${API_URL}/projects/${projectId}/boards/${boardId}/sprints`, {
    method: 'POST',
    body: JSON.stringify(sprintData),
  });
}

export async function getSprintById(sprintId: string): Promise<Sprint> {
  // Assuming sprintId is globally unique or context known.
  return fetchApi(`${API_URL}/sprints/${sprintId}`);
}

export async function getSprintsByBoard(projectId: string, boardId: string): Promise<Sprint[]> {
  return fetchApi(`${API_URL}/projects/${projectId}/boards/${boardId}/sprints`);
}

export async function getSprintsByProject(projectId: string): Promise<Sprint[]> {
    return fetchApi(`${API_URL}/projects/${projectId}/sprints`);
}

// Epic API functions
export async function createEpic(
  projectId: string, 
  epicData: { name: string; description?: string; status: Epic['status']; startDate?: string; endDate?: string }
): Promise<Epic> {
  return fetchApi(`${API_URL}/projects/${projectId}/epics`, {
    method: 'POST',
    body: JSON.stringify(epicData),
  });
}

export async function getEpicById(epicId: string): Promise<Epic> {
  return fetchApi(`${API_URL}/epics/${epicId}`);
}

export async function getEpicsByProject(projectId: string): Promise<Epic[]> {
  return fetchApi(`${API_URL}/projects/${projectId}/epics`);
}

// Story API functions
export async function createStory(
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
    projectId: string; // Include projectId if not implicitly derived by backend from epic
  }
): Promise<Story> {
  // If projectId is not part of storyData payload but derived from epicId on backend, remove from storyData.
  // The Postman spec for creating story under epic implies epicId in path is sufficient.
  return fetchApi(`${API_URL}/epics/${epicId}/stories`, {
    method: 'POST',
    body: JSON.stringify(storyData), // Ensure payload matches backend expectation
  });
}

export async function getStoryById(storyId: string): Promise<Story> {
  return fetchApi(`${API_URL}/stories/${storyId}`);
}

export async function getStoriesByEpic(epicId: string): Promise<Story[]> {
  return fetchApi(`${API_URL}/epics/${epicId}/stories`);
}

export async function getStoriesByProject(
  projectId: string, 
  filters: { sprintId?: string } = {} // sprintId can be specific ID or "backlog"
): Promise<Story[]> {
  const queryParams = new URLSearchParams();
  if (filters.sprintId) queryParams.append('sprintId', filters.sprintId);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return fetchApi(`${API_URL}/projects/${projectId}/stories${queryString}`);
}

export async function assignStoryToSprint(storyId: string, sprintId: string): Promise<Story> {
  return fetchApi(`${API_URL}/stories/${storyId}/sprint`, {
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
  return fetchApi(`${API_URL}/projects/${projectId}/stories/${storyId}`, {
    method: 'PATCH', // Or PUT
    body: JSON.stringify(storyData),
  });
}

export async function deleteStory(projectId: string, storyId: string): Promise<void> {
  // Adjust endpoint based on Postman. Assuming /api/projects/${projectId}/stories/${storyId} for now.
  await fetchApi(`${API_URL}/projects/${projectId}/stories/${storyId}`, {
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
    return fetchApi(`${API_URL}/projects/${projectId}/budgets`, {
        method: 'POST',
        body: JSON.stringify(budgetItemData),
    });
}

export async function getBudgetItems(projectId: string): Promise<BudgetItem[]> {
    return fetchApi(`${API_URL}/projects/${projectId}/budgets`);
}

export async function getBudgetSummary(projectId: string): Promise<BudgetSummary> {
    return fetchApi(`${API_URL}/projects/${projectId}/budgets/summary`);
}

export async function createExpense(projectId: string, expenseData: {
    budgetItemId: string;
    amount: number;
    description?: string;
    category: string;
    paymentMethod?: string;
    date?: string; // API might expect ISO string
}): Promise<Expense> {
    return fetchApi(`${API_URL}/projects/${projectId}/expenses`, {
        method: 'POST',
        body: JSON.stringify(expenseData),
    });
}

export async function getExpensesByProject(projectId: string): Promise<Expense[]> {
    return fetchApi(`${API_URL}/projects/${projectId}/expenses`);
}

export async function getExpenseById(expenseId: string): Promise<Expense> {
    return fetchApi(`${API_URL}/expenses/${expenseId}`);
}
