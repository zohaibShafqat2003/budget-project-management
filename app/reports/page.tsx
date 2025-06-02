"use client"

import { useState, useEffect, useMemo, MouseEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, Download, FileText, PieChart, TrendingUp, Calendar, Users, BrainCircuit, ClipboardList, RefreshCw, FileDown } from "lucide-react"
import { reportApi } from "@/lib/api"
import { projectApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import ErrorBoundary from "@/components/ui/error-boundary"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { exportReport, getReportFileName, supportedExportFormats } from "@/lib/reports"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define types for the report data
type Project = {
  id: string;
  name: string;
  // Add other project properties as needed
}

type ProjectDetails = {
  id: string;
  name: string;
  startDate: string;
  completionDate: string;
  status: string;
  totalBudget: number;
  narrativeDescription: string;
  description?: string;
  progress?: number;
  projectManager?: string;
  clientName?: string;
  client?: {
    id: string;
    name: string;
  };
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string;
    assignee?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  expenses?: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    paymentStatus: string;
    date: string;
  }>;
}

type TaskStats = {
  total: number;
  totalTasks?: number; // Alternative field name
  completed: number;
  completedTasks?: number; // Alternative field name
  inProgress: number;
  inProgressTasks?: number; // Alternative field name
  notStarted: number;
  pendingTasks?: number; // Alternative field name
  overdue: number;
  overdueTasks?: number; // Alternative field name
  completionRate: number;
  averageCompletionTime: number;
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
}

type ExpenseStats = {
  total: number;
  paid: number;
  pending: number;
  rejected: number;
  byCategory: Array<{name: string; value: number}>;
  largestExpense: number;
  averageExpense: number;
  recentExpenses: Array<{id: string; amount: number; description: string; date: string; paymentStatus: string}>;
  totalExpenses: number;
  approvedExpenses: number;
  pendingExpenses: number;
  remainingBudget: number;
  budgetUtilizationPercentage: number;
  categoryDistribution: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

type TimelineStats = {
  startDate: string;
  completionDate: string;
  duration: number;
  daysRemaining: number;
  daysElapsed: number;
  percentageComplete: number;
  isOnTrack: boolean;
  milestones: Array<{name: string; date: string; completed: boolean}>;
  delayRisk: string;
  timelineStatus: string;
  message: string;
  totalDuration: number;
  elapsedDuration: number;
  remainingDuration: number;
  timeElapsedPercentage: number;
  progressPercentage: number;
}

type TeamPerformance = Array<{
  name: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  performanceRating: string;
}>

type AIInsight = {
  id: string;
  type: string;
  title: string;
  message: string;
  recommendation: string;
  severity: string;
  date: string;
}

type SummaryData = {
  projectStatusData: Array<{name: string; value: number; status?: string; count?: number}>;
  projectTimelineData: Array<{name: string; value: number; status?: string; count?: number}>;
  budgetUtilizationData: Array<{name: string; value: number; category?: string; amount?: number}>;
  expenseDistributionData: Array<{name: string; value: number; category?: string; amount?: number}>;
  teamUtilizationData: Array<{name: string; value: number; role?: string; count?: number}>;
  productivityData: Array<{name: string; value: number; metric?: string}>;
  projectSummaries: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    budget: number;
    spent: number;
    team: string[];
    summary?: string;
  }>;
}

type BudgetData = {
  budgetAnalysis: {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    projectedOverrun: number;
    spendingRate: number;
    costVariance: number;
    budgetEfficiency: number;
    costSavingOpportunities: number;
    recommendations: Array<{
      title: string;
      description: string;
    }>;
    byCategory: Array<{name: string; budget: number; spent: number}>;
  };
  budgetUtilizationData: Array<{
    month: string;
    planned: number;
    actual: number;
  }>;
  expenseDistributionData: Array<{
    category: string;
    amount: number;
  }>;
}

type TeamData = {
  teamAnalysis: {
    resourceAllocation: {
      overallocatedMembers: string[];
      underutilizedMembers: string[];
      recommendation: string;
    };
    skillGapAnalysis: {
      identifiedGaps: string[];
      impactAreas: string[];
      trainingRecommendations: string[];
    };
    performanceMetrics: {
      averageTaskCompletion: number;
      onTimeDeliveryRate: number;
      qualityScore: number;
    };
    teamComposition: Array<{role: string; count: number; adequacy: string}>;
  };
  teamUtilizationData?: Array<{
    name: string;
    utilization: number;
  }>;
  productivityData?: Array<{
    name: string;
    tasks: number;
    hours: number;
    productivity: number;
  }>;
}

type AIInsightsData = {
  aiInsights: Array<AIInsight>;
  projectRiskAssessment?: {
    riskLevel: string;
    factors: string[];
    mitigationSteps: string[];
  };
  performancePrediction?: {
    predictedCompletion: string;
    confidenceLevel: string;
    factors: string[];
    deadlineMeetingProjects?: number;
    totalActiveProjects?: number;
    projectedBudgetVariance?: number;
    productivityIncrease?: number;
  };
  strategicRecommendations?: {
    recommendations: Array<{
      title: string;
      description: string;
      impact: string;
      recommendation?: string;
      benefit?: string;
      priority?: string;
    }>;
  };
}

type ComprehensiveData = {
  projectDetails: ProjectDetails;
  taskStats: TaskStats;
  expenseStats: ExpenseStats;
  timelineStats: TimelineStats;
  teamPerformance: TeamPerformance;
  aiInsights: Array<AIInsight>;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('summary')
  const [loading, setLoading] = useState({
    summary: true,
    budget: true,
    team: true,
    aiInsights: true,
    comprehensive: true
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [data, setData] = useState<{
    summary: SummaryData | null,
    budget: BudgetData | null,
    team: TeamData | null,
    aiInsights: AIInsightsData | null,
    comprehensive: ComprehensiveData | null
  }>({
    summary: null,
    budget: null,
    team: null,
    aiInsights: null,
    comprehensive: null
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [taskPage, setTaskPage] = useState(1)
  const [expensePage, setExpensePage] = useState(1)
  const ITEMS_PER_PAGE = 5
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [buttonFeedback, setButtonFeedback] = useState<string>('')

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // Fetch projects for the dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectApi.getAllProjects()
        if (response && response.success) {
          setProjects(response.data)
          if (response.data.length > 0) {
            setSelectedProjectId(response.data[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
        toast.error('Failed to load projects')
      }
    }

    fetchProjects()
  }, [])

  // Fetch data based on the active tab
  useEffect(() => {
    const fetchReportData = async (tabName: string, forceRefresh: boolean = false) => {
      if (loading[tabName as keyof typeof loading] || forceRefresh) {
        setLoading(prev => ({ ...prev, [tabName]: true }))
        
        try {
          let response
          
          switch (tabName) {
            case 'summary':
              response = await reportApi.getProjectSummary(forceRefresh)
              break
            case 'budget':
              response = await reportApi.getBudgetAnalysis(forceRefresh)
              break
            case 'team':
              response = await reportApi.getTeamPerformance(forceRefresh)
              break
            case 'aiInsights':
              response = await reportApi.getAIInsights(forceRefresh)
              break
            case 'comprehensive':
              if (selectedProjectId) {
                response = await reportApi.getProjectComprehensiveReport(selectedProjectId, forceRefresh)
              }
              break
            default:
              break
          }
          
          if (response && response.success) {
            setData(prev => ({ ...prev, [tabName]: response.data }))
            if (forceRefresh) {
              toast.success(`${tabName.charAt(0).toUpperCase() + tabName.slice(1)} data refreshed`)
            }
          } else {
            toast.error(`Failed to load ${tabName} data`)
          }
        } catch (error) {
          console.error(`Error fetching ${tabName} data:`, error)
          toast.error(`Error loading ${tabName} data. Please try again.`)
        } finally {
          setLoading(prev => ({ ...prev, [tabName]: false }))
          if (forceRefresh) {
            setIsRefreshing(false)
          }
        }
      }
    }
    
    fetchReportData(activeTab)
  }, [activeTab, selectedProjectId])

  // Fetch comprehensive report when project selection changes
  useEffect(() => {
    if (activeTab === 'comprehensive' && selectedProjectId) {
      const fetchComprehensiveReport = async () => {
        setLoading(prev => ({ ...prev, comprehensive: true }))
        
        try {
          const response = await reportApi.getProjectComprehensiveReport(selectedProjectId)
          
          if (response && response.success) {
            setData(prev => ({ ...prev, comprehensive: response.data }))
          } else {
            toast.error('Failed to load comprehensive report')
          }
        } catch (error) {
          console.error('Error fetching comprehensive report:', error)
          toast.error('Error loading comprehensive report. Please try again.')
        } finally {
          setLoading(prev => ({ ...prev, comprehensive: false }))
        }
      }
      
      fetchComprehensiveReport()
    }
  }, [selectedProjectId, activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Refresh data for active tab
    const fetchReportData = async (tabName: string) => {
      try {
        let response
        
        switch (tabName) {
          case 'summary':
            response = await reportApi.getProjectSummary(true)
            break
          case 'budget':
            response = await reportApi.getBudgetAnalysis(true)
            break
          case 'team':
            response = await reportApi.getTeamPerformance(true)
            break
          case 'aiInsights':
            response = await reportApi.getAIInsights(true)
            break
          case 'comprehensive':
            if (selectedProjectId) {
              response = await reportApi.getProjectComprehensiveReport(selectedProjectId, true)
            }
            break
          default:
            break
        }
        
        if (response && response.success) {
          setData(prev => ({ ...prev, [tabName]: response.data }))
          toast.success(`${tabName.charAt(0).toUpperCase() + tabName.slice(1)} data refreshed`)
        }
      } catch (error) {
        console.error(`Error refreshing ${tabName} data:`, error)
        toast.error(`Error refreshing ${tabName} data. Please try again.`)
      } finally {
        setIsRefreshing(false)
      }
    }
    
    await fetchReportData(activeTab)
  }

  const handleExportReport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      setIsExporting(true);
      setIsGeneratingReport(true);
      setExportProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 99 ? 99 : newProgress; // Stop at 99% until actual completion
        });
      }, 500);
      
      let projectName = '';
      if (activeTab === 'comprehensive' && selectedProjectId) {
        const selectedProject = projects.find(p => p.id === selectedProjectId);
        if (selectedProject) {
          projectName = selectedProject.name;
        }
      }
      
      const fileName = getReportFileName(activeTab as any, projectName);
      
      // Export the report
      const success = await exportReport({
        reportType: activeTab as any,
        format,
        projectId: activeTab === 'comprehensive' ? selectedProjectId : undefined,
        fileName
      });
      
      // Clear interval after export completes
      clearInterval(progressInterval);
      setExportProgress(100);
      
      if (success) {
        toast.success(`Report exported as ${format.toUpperCase()} successfully`);
      } else {
        toast.error(`Failed to export report as ${format.toUpperCase()}`);
      }
      
      // Keep 100% progress visible briefly before clearing
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error(`Error exporting report as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(false);
      setIsGeneratingReport(false);
      setExportProgress(0);
    }
  }

  // Helper function to render loading skeleton
  const renderSkeleton = (height: number = 80) => (
    <div className="flex items-center justify-center h-full">
      <Skeleton className={`w-full h-${height}`} />
    </div>
  )

  // Helper component for wrapped sections with error boundary
  const ReportSection = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <ErrorBoundary 
      section={title} 
      onReset={() => handleRefresh()}
    >
      {children}
    </ErrorBoundary>
  );

  const getPaginatedData = <T extends any>(data: T[], page: number, itemsPerPage: number) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return {
      items: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / itemsPerPage)
    }
  }

  const ExportProgressDialog = () => {
    if (!isGeneratingReport) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-w-full">
          <h3 className="text-lg font-medium mb-4">Generating Report</h3>
          <div className="space-y-4">
            <Progress value={exportProgress} className="w-full" />
            <p className="text-sm text-center">{Math.round(exportProgress)}% complete</p>
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsExporting(false);
                  setIsGeneratingReport(false);
                  setExportProgress(0);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    return {
      // Project status data for pie chart
      projectStatusData: data.summary?.projectStatusData?.map((item: any) => ({
        name: item.status,
        value: parseInt(item.count)
      })) || [],
      
      // Timeline data for bar chart
      projectTimelineData: data.summary?.projectTimelineData?.map((project: any) => ({
        name: project.name,
        progress: project.progress
      })) || [],
      
      // Budget utilization data for line chart
      budgetUtilizationData: data.budget?.budgetUtilizationData?.map((item: any) => ({
        month: item.month,
        planned: item.planned,
        actual: item.actual
      })) || [],
      
      // Expense distribution data for pie chart
      expenseDistributionData: data.budget?.expenseDistributionData?.map((item: any) => ({
        name: item.category,
        value: item.amount
      })) || [],
      
      // Team utilization data for bar chart
      teamUtilizationData: data.team?.teamUtilizationData?.map((item: any) => ({
        name: item.name,
        utilization: item.utilization
      })) || [],
      
      // Productivity metrics data for bar chart
      productivityData: data.team?.productivityData?.map((item: any) => ({
        name: item.name,
        tasks: item.tasks,
        hours: item.hours
      })) || []
    };
  }, [data.summary, data.budget, data.team]);

  return (
    <div className="flex flex-col p-6 space-y-6">
      <ExportProgressDialog />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Insights</h1>
          <p className="text-muted-foreground">AI-generated reports and analytics</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                {isExporting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export Report
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExportReport('pdf')}>PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport('csv')}>CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport('excel')}>Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="summary">Project Summary</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="aiInsights">AI Insights</TabsTrigger>
          <TabsTrigger value="comprehensive">Comprehensive Report</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReportSection title="Project Status Overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    Project Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {loading.summary || !data.summary ? (
                    renderSkeleton(80)
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={chartData.projectStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.projectStatusData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </ReportSection>

            <ReportSection title="Timeline Analysis">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-primary" />
                    Timeline Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {loading.summary || !data.summary ? (
                    renderSkeleton(80)
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.projectTimelineData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                        <YAxis label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="progress" fill="#8884d8" name="Progress %" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </ReportSection>
          </div>

          <ReportSection title="AI-Generated Project Summary">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                  AI-Generated Project Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading.summary || !data.summary ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="w-full h-24" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.summary.projectSummaries.map((project: any) => (
                      <div key={project.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium mb-2">{project.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {project.summary}
                        </p>
                        <Button size="sm" variant="outline" onClick={(e: MouseEvent<HTMLButtonElement>) => handleExportReport('pdf')}>
                          <Download className="mr-2 h-4 w-4" />
                          Download Full Report
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </ReportSection>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReportSection title="Budget Utilization Trends">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    Budget Utilization Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {loading.budget || !data.budget ? (
                    renderSkeleton(80)
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.budgetUtilizationData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                        <YAxis label={{ value: 'Budget (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="actual" fill="#8884d8" name="Actual %" />
                        <Bar dataKey="planned" fill="#82ca9d" name="Planned %" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </ReportSection>

            <ReportSection title="Expense Distribution">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="mr-2 h-5 w-5 text-primary" />
                    Expense Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {loading.budget || !data.budget ? (
                    renderSkeleton(80)
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={chartData.expenseDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.expenseDistributionData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </ReportSection>
          </div>

          <ReportSection title="AI Budget Analysis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                  AI Budget Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading.budget || !data.budget ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="w-full h-24" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Budget Efficiency Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Based on analysis of your current projects, the overall budget efficiency is at {data?.budget?.budgetAnalysis?.budgetEfficiency ?? 'N/A'}%. 
                        {data?.budget?.budgetAnalysis?.recommendations?.map((rec: any, index: number) => (
                          <span key={index}> {rec.project === 'All Projects' ? 'All projects' : rec.project} could {rec.description?.toLowerCase() ?? 'improve efficiency'} (saving ${(rec.potentialSavings || 0).toLocaleString()}).</span>
                        )) ?? 'No specific recommendations available at this time.'}
                      </p>
                      <Button size="sm" variant="outline">
                        View Detailed Analysis
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Cost Optimization Opportunities</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        AI analysis has identified potential cost savings of approximately ${(data?.budget?.budgetAnalysis?.costSavingOpportunities || 0).toLocaleString()} across all projects. 
                        Major opportunities include: {data?.budget?.budgetAnalysis?.recommendations?.length ? data.budget.budgetAnalysis.recommendations.map((rec: any, index: number) => (
                          <span key={index}>{index > 0 && ', '}{rec.description || 'optimization'} for {rec.project || 'projects'} (${(rec.potentialSavings || 0).toLocaleString()})</span>
                        )) : 'No specific opportunities identified at this time.'}
                      </p>
                      <Button size="sm" variant="outline">
                        View Optimization Plan
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </ReportSection>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReportSection title="Team Utilization">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    Team Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {loading.team || !data.team ? (
                    renderSkeleton(80)
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.teamUtilizationData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="utilization" fill="#8884d8" name="Utilization %" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </ReportSection>

            <ReportSection title="Productivity Metrics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    Productivity Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {loading.team || !data.team ? (
                    renderSkeleton(80)
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.productivityData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                        <YAxis domain={[0, 100]} label={{ value: 'Productivity (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="productivity" fill="#8884d8" name="Productivity" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </ReportSection>
          </div>

          <ReportSection title="AI Team Performance Analysis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                  AI Team Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading.team || !data.team ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="w-full h-24" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Resource Allocation Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Current team allocation shows some inefficiencies. 
                        {data.team.teamAnalysis.resourceAllocation.overallocatedMembers.length > 0 && (
                          <span> {data.team.teamAnalysis.resourceAllocation.overallocatedMembers.join(', ')} {data.team.teamAnalysis.resourceAllocation.overallocatedMembers.length === 1 ? 'is' : 'are'} assigned to too many tasks/projects. </span>
                        )}
                        {data.team.teamAnalysis.resourceAllocation.underutilizedMembers.length > 0 && (
                          <span> {data.team.teamAnalysis.resourceAllocation.underutilizedMembers.join(', ')} could be better utilized. </span>
                        )}
                        {data.team.teamAnalysis.resourceAllocation.recommendation}
                      </p>
                      <Button size="sm" variant="outline">
                        View Reallocation Plan
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Skill Gap Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Based on current project requirements, there are potential skill gaps in {data.team.teamAnalysis.skillGapAnalysis.identifiedGaps.join(', ')}. 
                        {data.team?.teamAnalysis?.skillGapAnalysis?.identifiedGaps?.length ?? 0} gaps
                      </p>
                      <Button size="sm" variant="outline">
                        View Skill Development Plan
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </ReportSection>
        </TabsContent>

        <TabsContent value="aiInsights" className="space-y-4">
          <ReportSection title="AI Strategic Insights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                  AI Strategic Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading.aiInsights || !data.aiInsights ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="w-full h-24" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Project Risk Assessment</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        AI analysis has identified the following risk levels:
                        {Array.isArray(data?.aiInsights?.aiInsights) && data?.aiInsights?.aiInsights.filter(insight => insight.type === 'risk').length > 0 ? 
                          data?.aiInsights?.aiInsights
                            .filter(insight => insight.type === 'risk')
                            .map((project: any, index: number) => (
                              <span key={index}> {project.title} ({project.severity} risk){index < (data?.aiInsights?.aiInsights?.filter(i => i.type === 'risk').length || 0) - 1 ? ',' : '.'} </span>
                            ))
                          : 'No risk assessment available.'}
                        {Array.isArray(data?.aiInsights?.aiInsights) && data?.aiInsights?.aiInsights.filter(insight => insight.type === 'risk').length > 0 && 
                          ` Recommendation: ${data?.aiInsights?.aiInsights?.find(i => i.type === 'risk')?.recommendation || 'None provided.'}`}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setButtonFeedback('Viewing risk mitigation plan - Feature coming soon!');
                          toast.info('Risk mitigation plan functionality will be available in the next update.');
                          // Add a visible alert that doesn't rely on toast
                          alert('Risk mitigation plan functionality will be available in the next update.');
                        }}
                      >
                        View Risk Mitigation Plan
                      </Button>
                      {buttonFeedback.includes('risk mitigation') && (
                        <p className="text-xs text-blue-500 mt-2">{buttonFeedback}</p>
                      )}
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Performance Prediction</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {Array.isArray(data?.aiInsights?.aiInsights) && data?.aiInsights?.aiInsights.some(insight => insight.type === 'performancePrediction') ?
                          data.aiInsights.aiInsights
                            .filter(insight => insight.type === 'performancePrediction')
                            .map((prediction, index) => (
                              <span key={index}>{prediction.message}</span>
                            ))
                          : 'No performance prediction available.'}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setButtonFeedback('Viewing detailed predictions - Feature coming soon!');
                          toast.info('Detailed predictions will be available in the next update.');
                          // Add a visible alert that doesn't rely on toast
                          alert('Detailed predictions will be available in the next update.');
                        }}
                      >
                        View Detailed Predictions
                      </Button>
                      {buttonFeedback.includes('detailed predictions') && (
                        <p className="text-xs text-blue-500 mt-2">{buttonFeedback}</p>
                      )}
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Strategic Recommendations</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        To optimize overall portfolio performance, the AI recommends:
                      </p>
                      <ol className="list-decimal pl-5 mb-4 text-sm text-muted-foreground">
                        {Array.isArray(data?.aiInsights?.aiInsights) && data?.aiInsights?.aiInsights
                          .filter(insight => insight.type === 'strategicRecommendation')
                          .map((rec: any, index: number) => (
                            <li key={index}>{rec.recommendation || rec.message} {rec.title ? `- ${rec.title}` : ''}</li>
                          )) || <li>No strategic recommendations available.</li>}
                      </ol>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setButtonFeedback('Generating implementation plan - Feature coming soon!');
                          toast.info('Implementation plan generation will be available in the next update.');
                          // Add a visible alert that doesn't rely on toast
                          alert('Implementation plan generation will be available in the next update.');
                        }}
                      >
                        Generate Implementation Plan
                      </Button>
                      {buttonFeedback.includes('implementation plan') && (
                        <p className="text-xs text-blue-500 mt-2">{buttonFeedback}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </ReportSection>
        </TabsContent>

        <TabsContent value="comprehensive" className="space-y-4">
          <div className="mb-4">
            <Select 
              value={selectedProjectId} 
              onValueChange={setSelectedProjectId}
              disabled={projects.length === 0}
            >
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading.comprehensive || !data.comprehensive ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="w-full h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReportSection title="Project Overview">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-primary" />
                      Project Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">{data?.comprehensive?.projectDetails?.name || 'Project Name'}</h3>
                        <p className="text-sm text-muted-foreground">{data?.comprehensive?.projectDetails?.narrativeDescription || data?.comprehensive?.projectDetails?.description || 'No description provided'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-sm">{data?.comprehensive?.projectDetails?.status || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Client</p>
                          <p className="text-sm">{data?.comprehensive?.projectDetails?.clientName || (data?.comprehensive?.projectDetails?.client ? data.comprehensive.projectDetails.client.name : 'Not assigned')}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Start Date</p>
                          <p className="text-sm">
                            {data.comprehensive.projectDetails.startDate 
                              ? new Date(data.comprehensive.projectDetails.startDate).toLocaleDateString() 
                              : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Completion Date</p>
                          <p className="text-sm">
                            {data.comprehensive.projectDetails.completionDate 
                              ? new Date(data.comprehensive.projectDetails.completionDate).toLocaleDateString() 
                              : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Budget</p>
                          <p className="text-xl">${(data?.comprehensive?.projectDetails?.totalBudget || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Project Manager</p>
                          <p className="text-sm">{data?.comprehensive?.projectDetails?.projectManager || (data?.comprehensive?.projectDetails?.owner ? `${data.comprehensive.projectDetails.owner.firstName} ${data.comprehensive.projectDetails.owner.lastName}` : 'Not assigned')}</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-medium">{data?.comprehensive?.projectDetails?.progress || 0}%</span>
                        </div>
                        <Progress value={data?.comprehensive?.projectDetails?.progress || 0} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ReportSection>

              <ReportSection title="Task Statistics">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ClipboardList className="mr-2 h-5 w-5 text-primary" />
                      Task Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Total Tasks</p>
                          <p className="text-2xl font-bold">{data?.comprehensive?.taskStats?.totalTasks || data?.comprehensive?.taskStats?.total || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Completion Rate</p>
                          <p className="text-2xl font-bold">{data?.comprehensive?.taskStats?.completionRate || 0}%</p>
                        </div>
                        <div>
                          <div className="text-sm"><strong>Total Tasks:</strong> {data?.comprehensive?.taskStats?.totalTasks || data?.comprehensive?.taskStats?.total || 0}</div>
                          <div className="text-sm"><strong>Completed:</strong> {data?.comprehensive?.taskStats?.completedTasks || data?.comprehensive?.taskStats?.completed || 0}</div>
                          <div className="text-sm"><strong>In Progress:</strong> {data?.comprehensive?.taskStats?.inProgressTasks || data?.comprehensive?.taskStats?.inProgress || 0}</div>
                          <div className="text-sm"><strong>Not Started:</strong> {data?.comprehensive?.taskStats?.pendingTasks || data?.comprehensive?.taskStats?.notStarted || 0}</div>
                          <div className="text-sm"><strong>Overdue:</strong> {data?.comprehensive?.taskStats?.overdueTasks || data?.comprehensive?.taskStats?.overdue || 0}</div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Pending</p>
                          <p className="text-xl">{data?.comprehensive?.taskStats?.pendingTasks || 0}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Priority Distribution</p>
                        <div className="flex space-x-2">
                          <div className="flex-1 bg-red-100 p-2 rounded text-center">
                            <p className="text-xs text-red-800">High</p>
                            <p className="font-medium">{data?.comprehensive?.taskStats?.priorityDistribution?.high || 0}</p>
                          </div>
                          <div className="flex-1 bg-yellow-100 p-2 rounded text-center">
                            <p className="text-xs text-yellow-800">Medium</p>
                            <p className="font-medium">{data?.comprehensive?.taskStats?.priorityDistribution?.medium || 0}</p>
                          </div>
                          <div className="flex-1 bg-green-100 p-2 rounded text-center">
                            <p className="text-xs text-green-800">Low</p>
                            <p className="font-medium">{data?.comprehensive?.taskStats?.priorityDistribution?.low || 0}</p>
                          </div>
                        </div>
                      </div>

                      {data?.comprehensive?.projectDetails?.tasks && data?.comprehensive?.projectDetails?.tasks.length > 0 && (
                        <>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Task List</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="px-2 py-1 text-left">Task</th>
                                    <th className="px-2 py-1 text-center">Status</th>
                                    <th className="px-2 py-1 text-center">Priority</th>
                                    <th className="px-2 py-1 text-center">Due Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {getPaginatedData(data.comprehensive.projectDetails.tasks, taskPage, ITEMS_PER_PAGE).items.map((task: any) => (
                                    <tr key={task.id} className="border-b">
                                      <td className="px-2 py-1">{task.title}</td>
                                      <td className="px-2 py-1 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                          task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {task.status}
                                        </span>
                                      </td>
                                      <td className="px-2 py-1 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                          task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-green-100 text-green-800'
                                        }`}>
                                          {task.priority}
                                        </span>
                                      </td>
                                      <td className="px-2 py-1 text-center">
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            
                            {data.comprehensive.projectDetails.tasks.length > ITEMS_PER_PAGE && (
                              <Pagination className="mt-2">
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious 
                                      onClick={() => setTaskPage(prev => Math.max(prev - 1, 1))}
                                      className={taskPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                  </PaginationItem>
                                  
                                  {Array.from({ length: Math.min(3, getPaginatedData(data.comprehensive.projectDetails.tasks, taskPage, ITEMS_PER_PAGE).totalPages) }).map((_, i) => (
                                    <PaginationItem key={i}>
                                      <PaginationLink 
                                        onClick={() => setTaskPage(i + 1)}
                                        isActive={taskPage === i + 1}
                                      >
                                        {i + 1}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}
                                  
                                  {getPaginatedData(data.comprehensive.projectDetails.tasks, taskPage, ITEMS_PER_PAGE).totalPages > 3 && (
                                    <>
                                      <PaginationItem>
                                        <PaginationEllipsis />
                                      </PaginationItem>
                                      <PaginationItem>
                                        <PaginationLink 
                                          onClick={() => data.comprehensive && setTaskPage(getPaginatedData(data.comprehensive.projectDetails.tasks || [], taskPage, ITEMS_PER_PAGE).totalPages)}
                                          isActive={data.comprehensive && taskPage === getPaginatedData(data.comprehensive.projectDetails.tasks || [], taskPage, ITEMS_PER_PAGE).totalPages}
                                        >
                                          {data.comprehensive ? getPaginatedData(data.comprehensive.projectDetails.tasks || [], taskPage, ITEMS_PER_PAGE).totalPages : 1}
                                        </PaginationLink>
                                      </PaginationItem>
                                    </>
                                  )}
                                  
                                  <PaginationItem>
                                    <PaginationNext 
                                      onClick={() => setTaskPage(prev => Math.min(prev + 1, getPaginatedData(data?.comprehensive?.projectDetails?.tasks || [], taskPage, ITEMS_PER_PAGE).totalPages))}
                                      className={taskPage === getPaginatedData(data?.comprehensive?.projectDetails?.tasks || [], taskPage, ITEMS_PER_PAGE).totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </ReportSection>

              <ReportSection title="Budget Analysis">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                      Budget Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Total Budget</p>
                          <p className="text-2xl font-bold">${data.comprehensive.projectDetails.totalBudget.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Expenses</p>
                          <p className="text-2xl font-bold">${data.comprehensive?.expenseStats?.totalExpenses?.toLocaleString() ?? '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Approved Expenses</p>
                          <p className="text-xl">${data.comprehensive?.expenseStats?.approvedExpenses?.toLocaleString() ?? '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Pending Expenses</p>
                          <p className="text-xl">${data.comprehensive?.expenseStats?.pendingExpenses?.toLocaleString() ?? '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Remaining Budget</p>
                          <p className="text-xl">${data.comprehensive?.expenseStats?.remainingBudget?.toLocaleString() ?? '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Budget Utilization</p>
                          <p className="text-xl">{data.comprehensive?.expenseStats?.budgetUtilizationPercentage ?? 0}%</p>
                        </div>
                      </div>
                      
                      {data.comprehensive?.expenseStats?.categoryDistribution?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Expense Categories</p>
                          <div className="space-y-2">
                            {data.comprehensive?.expenseStats?.categoryDistribution?.map((category, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-sm">{category.category}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">${category.amount.toLocaleString()}</span>
                                  <span className="text-xs text-muted-foreground">({category.percentage}%)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {data.comprehensive.projectDetails?.expenses && data.comprehensive.projectDetails.expenses.length > 0 && (
                        <>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Expense List</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="px-2 py-1 text-left">Description</th>
                                    <th className="px-2 py-1 text-center">Amount</th>
                                    <th className="px-2 py-1 text-center">Category</th>
                                    <th className="px-2 py-1 text-center">Status</th>
                                    <th className="px-2 py-1 text-center">Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {getPaginatedData(data.comprehensive.projectDetails.expenses, expensePage, ITEMS_PER_PAGE).items.map((expense: any) => (
                                    <tr key={expense.id} className="border-b">
                                      <td className="px-2 py-1">{expense.description}</td>
                                      <td className="px-2 py-1 text-center">${expense.amount.toLocaleString()}</td>
                                      <td className="px-2 py-1 text-center">{expense.category}</td>
                                      <td className="px-2 py-1 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                          expense.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                          expense.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {expense.status}
                                        </span>
                                      </td>
                                      <td className="px-2 py-1 text-center">
                                        {expense.date ? new Date(expense.date).toLocaleDateString() : 'Not set'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            
                            {data?.comprehensive?.projectDetails?.expenses && data.comprehensive.projectDetails.expenses.length > ITEMS_PER_PAGE && (
                              <Pagination className="mt-2">
                                <PaginationContent>
                                  <PaginationItem>
                                    <PaginationPrevious 
                                      onClick={() => setExpensePage(prev => Math.max(prev - 1, 1))}
                                      className={expensePage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                  </PaginationItem>
                                  
                                  {Array.from({ length: Math.min(3, getPaginatedData(data?.comprehensive?.projectDetails?.expenses || [], expensePage, ITEMS_PER_PAGE).totalPages) }).map((_, i) => (
                                    <PaginationItem key={i}>
                                      <PaginationLink 
                                        onClick={() => setExpensePage(i + 1)}
                                        isActive={expensePage === i + 1}
                                      >
                                        {i + 1}
                                      </PaginationLink>
                                    </PaginationItem>
                                  ))}
                                  
                                  {getPaginatedData(data.comprehensive.projectDetails.expenses, expensePage, ITEMS_PER_PAGE).totalPages > 3 && (
                                    <>
                                      <PaginationItem>
                                        <PaginationEllipsis />
                                      </PaginationItem>
                                      <PaginationItem>
                                        <PaginationLink 
                                          onClick={() => setExpensePage(getPaginatedData(data?.comprehensive?.projectDetails?.expenses || [], expensePage, ITEMS_PER_PAGE).totalPages)}
                                          isActive={expensePage === getPaginatedData(data?.comprehensive?.projectDetails?.expenses || [], expensePage, ITEMS_PER_PAGE).totalPages}
                                        >
                                          {getPaginatedData(data?.comprehensive?.projectDetails?.expenses || [], expensePage, ITEMS_PER_PAGE).totalPages}
                                        </PaginationLink>
                                      </PaginationItem>
                                    </>
                                  )}
                                  
                                  <PaginationItem>
                                    <PaginationNext 
                                      onClick={() => setExpensePage(prev => Math.min(prev + 1, getPaginatedData(data?.comprehensive?.projectDetails?.expenses || [], expensePage, ITEMS_PER_PAGE).totalPages))}
                                      className={expensePage === getPaginatedData(data?.comprehensive?.projectDetails?.expenses || [], expensePage, ITEMS_PER_PAGE).totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                  </PaginationItem>
                                </PaginationContent>
                              </Pagination>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </ReportSection>

              <ReportSection title="Timeline Analysis">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-primary" />
                      Timeline Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.comprehensive?.timelineStats?.timelineStatus === 'Incomplete dates' ? (
                      <p className="text-sm text-muted-foreground">{data.comprehensive.timelineStats.message}</p>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Timeline Status</p>
                            <p className="text-xl font-semibold">{data.comprehensive?.timelineStats?.timelineStatus || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Message</p>
                            <p className="text-sm">{data.comprehensive.timelineStats.message}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Total Duration</p>
                            <p className="text-xl">{data.comprehensive?.timelineStats?.totalDuration || 0} days</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Elapsed</p>
                            <p className="text-xl">{data.comprehensive?.timelineStats?.elapsedDuration || 0} days</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Remaining</p>
                            <p className="text-xl">{data.comprehensive?.timelineStats?.remainingDuration || 0} days</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Time Elapsed</p>
                            <p className="text-xl">{data.comprehensive?.timelineStats?.timeElapsedPercentage || 0}%</p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Progress vs. Timeline</span>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs">Time Elapsed</span>
                                <span className="text-xs">{data.comprehensive?.timelineStats?.timeElapsedPercentage || 0}%</span>
                              </div>
                              <Progress value={data.comprehensive?.timelineStats?.timeElapsedPercentage || 0} className="h-2 bg-blue-100" />
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs">Progress</span>
                                <span className="text-xs">{data.comprehensive?.timelineStats?.progressPercentage || 0}%</span>
                              </div>
                              <Progress value={data.comprehensive?.timelineStats?.progressPercentage || 0} className="h-2 bg-green-100" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ReportSection>

              <ReportSection title="AI Insights">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                      AI Insights & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.comprehensive.aiInsights.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No insights available for this project.</p>
                      ) : (
                        data.comprehensive.aiInsights.map((insight: any, index: number) => {
                          let bgColor = 'bg-gray-100';
                          let textColor = 'text-gray-800';
                          
                          switch (insight.type) {
                            case 'Warning':
                              bgColor = 'bg-yellow-100';
                              textColor = 'text-yellow-800';
                              break;
                            case 'Critical':
                              bgColor = 'bg-red-100';
                              textColor = 'text-red-800';
                              break;
                            case 'Positive':
                              bgColor = 'bg-green-100';
                              textColor = 'text-green-800';
                              break;
                            case 'Informational':
                              bgColor = 'bg-blue-100';
                              textColor = 'text-blue-800';
                              break;
                          }
                          
                          return (
                            <div key={index} className={`p-4 rounded-lg ${bgColor}`}>
                              <div className="flex justify-between mb-2">
                                <h3 className={`font-medium ${textColor}`}>{insight.type}: {insight.category}</h3>
                                <span className="text-xs font-medium px-2 py-1 rounded bg-white">{insight.category}</span>
                              </div>
                              <p className="text-sm mb-2">{insight.message}</p>
                              <p className="text-sm font-medium">Recommendation: {insight.recommendation}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </ReportSection>

              {data.comprehensive.teamPerformance && data.comprehensive.teamPerformance.length > 0 && (
                <ReportSection title="Team Performance">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        Team Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-2 text-left">Team Member</th>
                              <th className="px-4 py-2 text-center">Tasks</th>
                              <th className="px-4 py-2 text-center">Completed</th>
                              <th className="px-4 py-2 text-center">Overdue</th>
                              <th className="px-4 py-2 text-center">Completion Rate</th>
                              <th className="px-4 py-2 text-center">Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.comprehensive.teamPerformance.map((member: any, index: number) => {
                              let ratingColor = 'text-gray-600';
                              switch (member.performanceRating) {
                                case 'Excellent':
                                  ratingColor = 'text-green-600';
                                  break;
                                case 'Good':
                                  ratingColor = 'text-blue-600';
                                  break;
                                case 'Satisfactory':
                                  ratingColor = 'text-yellow-600';
                                  break;
                                case 'Needs Improvement':
                                  ratingColor = 'text-orange-600';
                                  break;
                                case 'Unsatisfactory':
                                  ratingColor = 'text-red-600';
                                  break;
                              }
                              
                              return (
                                <tr key={index} className="border-b">
                                  <td className="px-4 py-2">{member.name}</td>
                                  <td className="px-4 py-2 text-center">{member.totalTasks}</td>
                                  <td className="px-4 py-2 text-center">{member.completedTasks}</td>
                                  <td className="px-4 py-2 text-center">{member.overdueTasks}</td>
                                  <td className="px-4 py-2 text-center">{member.completionRate}%</td>
                                  <td className={`px-4 py-2 text-center font-medium ${ratingColor}`}>
                                    {member.performanceRating}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </ReportSection>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
