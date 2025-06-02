"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProjectCard } from "@/components/project-card"
import { projectApi, taskApi, epicApi, storyApi, budgetApi, expenseApi } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"
import { StatsCard } from "./components/stats-card"
import { ProjectProgressChart } from "./components/project-progress-chart"
// Removed BudgetTrendChart import as we're removing this section
import { TaskDistributionChart } from "./components/task-distribution-chart"
import { EpicStoryTaskChart } from "./components/epic-story-task-chart"
import { BudgetExpenseTrendChart } from "./components/budget-expense-trend-chart"
import { AlertCircle, Plus, FileText, Clock, CreditCard, TrendingUp } from "lucide-react"

const fadeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    activeProjects: 0,
    pendingTasks: 0,
    budgetUtilization: 0,
    teamProductivity: 0,
    completedTasks: 0,
    totalBudget: 0,
    totalExpenses: 0,
    totalEpics: 0,
    totalStories: 0
  })
  const [projects, setProjects] = useState([])
  const [epics, setEpics] = useState([])
  const [stories, setStories] = useState([])
  const [user, setUser] = useState(null)
  const [projectProgressData, setProjectProgressData] = useState([])
  // Removed budgetTrendData state as we're removing this section
  const [taskDistributionData, setTaskDistributionData] = useState([])
  const [epicStoryTaskData, setEpicStoryTaskData] = useState([])
  const [budgetExpenseTrendData, setBudgetExpenseTrendData] = useState([])

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) setUser(currentUser)
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        const projectsResponse = await projectApi.getAllProjects()
        if (!projectsResponse.success) throw new Error(projectsResponse.message || 'Failed to fetch projects')
        const projectsData = projectsResponse.data || []
        const activeProjectsData = projectsData.filter(project => ['Active', 'In Progress', 'Review'].includes(project.status))
        setProjects(activeProjectsData.slice(0, 3))
        const firstThreeProjectIds = activeProjectsData.slice(0, 3).map(p => p.id)
        const epicsFetches = firstThreeProjectIds.map(projId => epicApi.getAll(projId))
        const epicResults = await Promise.all(epicsFetches)
        const flattenedEpics = []
        epicResults.forEach((res, idx) => {
          if (res.success) {
            const epList = (res.data || []).map(e => ({ ...e, projectId: firstThreeProjectIds[idx] }))
            flattenedEpics.push(...epList)
          }
        })
        setEpics(flattenedEpics)
        const firstFiveEpics = flattenedEpics.slice(0, 5)
        const storyFetches = firstFiveEpics.map(epic => storyApi.getStories(epic.id))
        const storyResults = await Promise.all(storyFetches)
        const flattenedStories = []
        storyResults.forEach((res, idx) => {
          if (res.success) {
            const sList = (res.data || []).map(s => ({ ...s, epicId: firstFiveEpics[idx].id, projectId: firstFiveEpics[idx].projectId }))
            flattenedStories.push(...sList)
          }
        })
        setStories(flattenedStories)
        const tasksResponse = await taskApi.getAll()
        if (!tasksResponse.success) throw new Error(tasksResponse.message || 'Failed to fetch tasks')
        const tasksData = tasksResponse.data || []
        const pendingTasks = tasksData.filter(task => ['To Do', 'In Progress'].includes(task.status)).length
        const completedTasks = tasksData.filter(task => ['Done', 'Completed', 'Closed'].includes(task.status)).length
        const statusCounts = tasksData.reduce((acc, task) => { acc[task.status] = (acc[task.status] || 0) + 1; return acc }, {})
        const totalTasks = tasksData.length || 1
        const taskDistribution = [
          { name: 'To Do', value: Math.round((statusCounts['To Do'] || 0) / totalTasks * 100) },
          { name: 'In Progress', value: Math.round((statusCounts['In Progress'] || 0) / totalTasks * 100) },
          { name: 'Review', value: Math.round((statusCounts['Review'] || 0) / totalTasks * 100) },
          { name: 'Completed', value: Math.round(((statusCounts['Done'] || 0) + (statusCounts['Completed'] || 0) + (statusCounts['Closed'] || 0)) / totalTasks * 100) }
        ]
        setTaskDistributionData(taskDistribution)
        const budgetFetches = firstThreeProjectIds.map(projId => budgetApi.getItems(projId))
        const expenseFetches = firstThreeProjectIds.map(projId => expenseApi.getProjectExpenses(projId))
        const [budgetResults, expenseResults] = await Promise.all([
          Promise.all(budgetFetches),
          Promise.all(expenseFetches)
        ])
        let totalBudgetSum = 0
        let totalExpenseSum = 0
        const monthlyMap = {}
        budgetResults.forEach((res, idx) => {
          if (!res.success) return
          const items = res.data || []
          items.forEach(item => {
            const amt = parseFloat(item.amount)
            totalBudgetSum += amt
            if (item.date) {
              const m = new Date(item.date).toISOString().substr(0, 7)
              if (!monthlyMap[m]) monthlyMap[m] = { budget: 0, expense: 0 }
              monthlyMap[m].budget += amt
            }
          })
        })
        expenseResults.forEach((res, idx) => {
          if (!res.success) return
          const exs = res.data || []
          exs.forEach(xp => {
            const amt = parseFloat(xp.amount)
            totalExpenseSum += amt
            if (xp.date) {
              const m = new Date(xp.date).toISOString().substr(0, 7)
              if (!monthlyMap[m]) monthlyMap[m] = { budget: 0, expense: 0 }
              monthlyMap[m].expense += amt
            }
          })
        })
        const sortedMonths = Object.keys(monthlyMap).sort()
        const budgetExpenseTrendArray = sortedMonths.map(m => ({ month: m, budget: monthlyMap[m].budget, spent: monthlyMap[m].expense }))
        setBudgetExpenseTrendData(budgetExpenseTrendArray)
        const budgetUtilization = totalBudgetSum > 0 ? Math.round((totalExpenseSum / totalBudgetSum) * 100) : 0
        const assignedTasks = tasksData.filter(task => task.assigneeId).length || 1
        const completedAssignedTasks = tasksData.filter(task => task.assigneeId && ['Done', 'Completed', 'Closed'].includes(task.status)).length
        const teamProductivity = Math.round((completedAssignedTasks / assignedTasks) * 100)
        const lastFiveProjects = activeProjectsData.slice(0, 5)
        const barData = lastFiveProjects.map(proj => ({
          name: proj.name.length > 12 ? proj.name.substr(0, 12) + '...' : proj.name,
          epics: flattenedEpics.filter(e => e.projectId === proj.id).length,
          stories: flattenedStories.filter(s => s.projectId === proj.id).length,
          tasks: tasksData.filter(t => t.projectId === proj.id).length
        }))
        setEpicStoryTaskData(barData)
        const progressData = activeProjectsData.slice(0, 5).map(proj => ({
          name: proj.name.length > 15 ? proj.name.substring(0, 15) + '...' : proj.name,
          progress: proj.progress || 0,
          tasks: tasksData.filter(t => t.projectId === proj.id).length
        }))
        setProjectProgressData(progressData)
        setDashboardData({
          activeProjects: activeProjectsData.length,
          pendingTasks,
          completedTasks,
          budgetUtilization,
          teamProductivity,
          totalBudget: totalBudgetSum,
          totalExpenses: totalExpenseSum,
          totalEpics: flattenedEpics.length,
          totalStories: flattenedStories.length
        })
      } catch (error) {
        setError(error.message || 'An error occurred while fetching dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
        <p className="mt-2 text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }
  return (
    <div className="px-2 sm:px-4 lg:px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header - Reduced padding and made more compact */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-0">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-300 text-base">Welcome back, {user?.firstName || 'User'}</p>
        </div>
        <Button asChild size="sm" className="mt-2 sm:mt-0">
          <Link href="/projects/new">
            <Plus className="mr-1 h-3 w-3" />
            New Project
          </Link>
        </Button>
      </div>
      
      {/* Stats Cards - Kept the same but with reduced gap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard 
          title="Active Projects" 
          value={dashboardData.activeProjects} 
          description="Projects in progress" 
          icon={FileText}
          trend={{ value: 12, label: "from last month", positive: true }}
        />
        <StatsCard 
          title="Pending Tasks" 
          value={dashboardData.pendingTasks} 
          description="Tasks to be completed" 
          icon={Clock}
          trend={{ value: 8, label: "from last week", positive: false }}
        />
        <StatsCard 
          title="Budget Utilization" 
          value={`${dashboardData.budgetUtilization}%`} 
          description="Average across all projects" 
          icon={CreditCard}
          trend={{ value: 5, label: "under budget", positive: true }}
        />
        <StatsCard 
          title="Team Productivity" 
          value={`${dashboardData.teamProductivity}%`} 
          description="Based on task completion rate" 
          icon={TrendingUp}
          trend={{ value: 15, label: "increase", positive: true }}
        />
      </div>
      
      {/* Main Dashboard Content - Restructured for better layout */}
      <div className="grid grid-cols-12 gap-3">
        {/* Left Column - Charts */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Project Progress Chart */}
          <motion.div 
            variants={fadeVariants} 
            initial="hidden" 
            animate="visible" 
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-3"
          >
            <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Project Progress</h2>
            <div className="h-[220px]">
              <ProjectProgressChart data={projectProgressData} />
            </div>
          </motion.div>
          
          {/* Task Distribution Chart */}
          <motion.div 
            variants={fadeVariants} 
            initial="hidden" 
            animate="visible" 
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-3"
          >
            <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Task Distribution</h2>
            <div className="h-[220px]">
              <TaskDistributionChart data={taskDistributionData} />
            </div>
          </motion.div>
          
          {/* Epic/Story/Task Overview */}
          <motion.div 
            variants={fadeVariants} 
            initial="hidden" 
            animate="visible" 
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-3"
          >
            <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Epic/Story/Task Overview</h2>
            <div className="h-[220px]">
              <EpicStoryTaskChart data={epicStoryTaskData} />
            </div>
          </motion.div>
          
          {/* Budget vs. Expense Trend - Kept this chart but removed the Budget Trend chart */}
          <motion.div 
            variants={fadeVariants} 
            initial="hidden" 
            animate="visible" 
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-3"
          >
            <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Budget vs. Expense</h2>
            <div className="h-[220px]">
              <BudgetExpenseTrendChart data={budgetExpenseTrendData} />
            </div>
          </motion.div>
        </div>
        
        {/* Right Column - Projects */}
        <motion.div 
          variants={fadeVariants} 
          initial="hidden" 
          animate="visible" 
          transition={{ duration: 0.3, delay: 0.4 }}
          className="col-span-12 lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl shadow p-3"
        >
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Top Projects</h2>
          <div className="flex flex-col gap-3">
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {projects.map(project => (
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
                ))}
              </div>
            ) : (
              <div className="text-center p-4 border rounded-lg">
                <h3 className="text-base font-medium mb-2">No active projects</h3>
                <p className="text-muted-foreground mb-3 text-sm">Get started by creating your first project</p>
                <Button asChild size="sm">
                  <Link href="/projects/new">
                    <Plus className="mr-1 h-3 w-3" />
                    Create Project
                  </Link>
                </Button>
              </div>
            )}
            {projects.length > 0 && (
              <div className="flex justify-center mt-1">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/projects">View All Projects</Link>
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
