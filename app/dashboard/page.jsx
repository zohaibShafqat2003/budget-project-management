"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CreditCard, FileText, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ProjectCard } from "@/components/project-card"
import { TaskSummary } from "@/components/task-summary"
import { BudgetOverview } from "@/components/budget-overview"
import { AIInsights } from "@/components/ai-insights"
import { projectApi, taskApi } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    activeProjects: 0,
    pendingTasks: 0,
    budgetUtilization: 0,
    teamProductivity: 0
  })
  const [projects, setProjects] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get current user
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Fetch projects
        const projectsResponse = await projectApi.getAll({ 
          status: 'Active,In Progress,Review' 
        })
        
        const projectsData = projectsResponse.data || []
        setProjects(projectsData.slice(0, 3)) // Get first 3 projects for display
        
        // Calculate dashboard stats
        const activeProjects = projectsData.length
        
        // Fetch tasks
        const tasksResponse = await taskApi.getAll({
          status: 'To Do,In Progress'
        })
        
        const tasksData = tasksResponse.data || []
        const pendingTasks = tasksData.length
        
        // Calculate budget utilization
        let totalBudget = 0
        let totalUsedBudget = 0
        
        projectsData.forEach(project => {
          totalBudget += parseFloat(project.totalBudget || 0)
          totalUsedBudget += parseFloat(project.usedBudget || 0)
        })
        
        const budgetUtilization = totalBudget > 0 
          ? Math.round((totalUsedBudget / totalBudget) * 100) 
          : 0
        
        // Set dummy value for team productivity for now
        const teamProductivity = 92
        
        setDashboardData({
          activeProjects,
          pendingTasks,
          budgetUtilization,
          teamProductivity
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName || 'User'}</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : dashboardData.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Projects in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : dashboardData.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks to be completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : `${dashboardData.budgetUtilization}%`}</div>
            <p className="text-xs text-muted-foreground">Average across all projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : `${dashboardData.teamProductivity}%`}</div>
            <p className="text-xs text-muted-foreground">Based on task completion rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="space-y-4">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.length > 0 ? (
                  projects.map(project => (
            <ProjectCard
                      key={project.id}
                      title={project.name}
                      client={project.clientName || project.nameOfClient || 'No Client'}
                      progress={project.progress || 0}
                      budget={`$${parseFloat(project.totalBudget || 0).toLocaleString()}`}
                      dueDate={project.completionDate ? new Date(project.completionDate).toLocaleDateString() : 'Not set'}
                      status={project.status}
                      projectId={project.id}
                    />
                  ))
                ) : (
                  <div className="col-span-3 text-center p-8 border rounded-lg">
                    <h3 className="text-lg font-medium mb-2">No active projects</h3>
                    <p className="text-muted-foreground mb-4">Get started by creating your first project</p>
                    <Button asChild>
                      <Link href="/projects/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                      </Link>
                    </Button>
                  </div>
                )}
          </div>
              {projects.length > 0 && (
          <Button variant="outline" asChild>
            <Link href="/projects">View All Projects</Link>
          </Button>
              )}
            </>
          )}
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <TaskSummary />
        </TabsContent>
        <TabsContent value="budget" className="space-y-4">
          <BudgetOverview />
        </TabsContent>
        <TabsContent value="ai-insights" className="space-y-4">
          <AIInsights />
        </TabsContent>
      </Tabs>
    </div>
  )
}
