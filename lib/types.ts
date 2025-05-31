export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description: string
  budget: number
  spent: number
  status: "planning" | "active" | "completed" | "on-hold"
  startDate: Date
  endDate?: Date
  ownerId: string
  teamMembers: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "review" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  assigneeId?: string
  projectId: string
  sprintId?: string
  estimatedHours: number
  actualHours: number
  estimatedCost: number
  actualCost: number
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Sprint {
  id: string
  name: string
  projectId: string
  startDate: Date
  endDate: Date
  budget: number
  spent: number
  status: "planning" | "active" | "completed"
  goals: string[]
  createdAt: Date
  updatedAt: Date
}

export interface BudgetEntry {
  id: string
  projectId: string
  taskId?: string
  sprintId?: string
  category: string
  amount: number
  type: "expense" | "income"
  description: string
  date: Date
  createdAt: Date
}
