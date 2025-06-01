"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, Download, FileText, PieChart, TrendingUp, Calendar, Users, BrainCircuit } from "lucide-react"
import { reportApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { toast } from "sonner"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('summary')
  const [loading, setLoading] = useState({
    summary: true,
    budget: true,
    team: true,
    aiInsights: true
  })
  const [data, setData] = useState({
    summary: null,
    budget: null,
    team: null,
    aiInsights: null
  })

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // Fetch data based on the active tab
  useEffect(() => {
    const fetchReportData = async (tabName: string) => {
      if (loading[tabName as keyof typeof loading]) {
        setLoading(prev => ({ ...prev, [tabName]: true }))
        
        try {
          let response
          
          switch (tabName) {
            case 'summary':
              response = await reportApi.getProjectSummary()
              break
            case 'budget':
              response = await reportApi.getBudgetAnalysis()
              break
            case 'team':
              response = await reportApi.getTeamPerformance()
              break
            case 'aiInsights':
              response = await reportApi.getAIInsights()
              break
            default:
              break
          }
          
          if (response && response.success) {
            setData(prev => ({ ...prev, [tabName]: response.data }))
          } else {
            toast.error(`Failed to load ${tabName} data`)
          }
        } catch (error) {
          console.error(`Error fetching ${tabName} data:`, error)
          toast.error(`Error loading ${tabName} data. Please try again.`)
        } finally {
          setLoading(prev => ({ ...prev, [tabName]: false }))
        }
      }
    }
    
    fetchReportData(activeTab)
  }, [activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleExportReport = async () => {
    try {
      const response = await reportApi.exportReport({
        reportType: activeTab,
        format: 'pdf'
      })
      
      if (response && response.success) {
        toast.success('Report exported successfully')
        // In a real app, you might download the file here
      } else {
        toast.error('Failed to export report')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Error exporting report. Please try again.')
    }
  }

  // Helper function to render loading skeleton
  const renderSkeleton = (height: number = 80) => (
    <div className="flex items-center justify-center h-full">
      <Skeleton className={`w-full h-${height}`} />
    </div>
  )

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Insights</h1>
          <p className="text-muted-foreground">AI-generated reports and analytics</p>
        </div>
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </div>

      <Tabs defaultValue="summary" className="w-full" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="summary">Project Summary</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="aiInsights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        data={data.summary.projectStatusData.map((item: any) => ({
                          name: item.status,
                          value: parseInt(item.count)
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.summary.projectStatusData.map((entry: any, index: number) => (
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
                      data={data.summary.projectTimelineData.map((project: any) => ({
                        name: project.name,
                        progress: project.progress
                      }))}
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
          </div>

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
                      <Button size="sm" variant="outline" onClick={handleExportReport}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Full Report
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      data={data.budget.budgetUtilizationData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis label={{ value: 'Budget (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="utilizationPercentage" fill="#8884d8" name="Utilization %" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

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
                        data={data.budget.expenseDistribution.map((item: any) => ({
                          name: item.category,
                          value: parseFloat(item.totalAmount)
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.budget.expenseDistribution.map((entry: any, index: number) => (
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
          </div>

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
                      Based on analysis of your current projects, the overall budget efficiency is at {data.budget.budgetAnalysis.budgetEfficiency}%. 
                      {data.budget.budgetAnalysis.recommendations.map((rec: any, index: number) => (
                        <span key={index}> {rec.project === 'All Projects' ? 'All projects' : rec.project} could {rec.description.toLowerCase()} (saving ${rec.potentialSavings.toLocaleString()}).</span>
                      ))}
                    </p>
                    <Button size="sm" variant="outline">
                      View Detailed Analysis
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Cost Optimization Opportunities</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI analysis has identified potential cost savings of approximately ${data.budget.budgetAnalysis.costSavingOpportunities.toLocaleString()} across all projects. 
                      Major opportunities include: {data.budget.budgetAnalysis.recommendations.map((rec: any, index: number) => (
                        <span key={index}>{index > 0 && ', '}{rec.description} for {rec.project} (${rec.potentialSavings.toLocaleString()})</span>
                      ))}.
                    </p>
                    <Button size="sm" variant="outline">
                      View Optimization Plan
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      data={data.team.teamUtilization}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="assignedTasksCount" fill="#8884d8" name="Assigned Tasks" />
                      <Bar dataKey="projectsCount" fill="#82ca9d" name="Projects" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

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
                      data={data.team.productivityMetrics.teamMembers}
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
          </div>

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
                      {data.team.teamAnalysis.skillGapAnalysis.recommendation}
                    </p>
                    <Button size="sm" variant="outline">
                      View Skill Development Plan
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aiInsights" className="space-y-4">
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
                      {data.aiInsights.aiInsights.projectRiskAssessment.map((project: any, index: number) => (
                        <span key={index}> {project.projectName} ({project.riskLevel} risk - {project.budgetOverrunProbability}% budget overrun probability, {project.timelineSlippageProbability}% timeline slip probability){index < data.aiInsights.aiInsights.projectRiskAssessment.length - 1 ? ',' : '.'} </span>
                      ))}
                      Recommendation: {data.aiInsights.aiInsights.projectRiskAssessment[0].recommendation}
                    </p>
                    <Button size="sm" variant="outline">
                      View Risk Mitigation Plan
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Performance Prediction</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Based on current performance metrics and historical data, the AI predicts that {data.aiInsights.aiInsights.performancePrediction.deadlineMeetingProjects} out of {data.aiInsights.aiInsights.performancePrediction.totalActiveProjects} active projects will meet their deadlines. 
                      {data.aiInsights.aiInsights.performancePrediction.projectedBudgetVariance > 0 ? 'Budget performance is predicted to exceed by ' + data.aiInsights.aiInsights.performancePrediction.projectedBudgetVariance + '%.' : 'Budget performance is predicted to be within planned parameters.'}
                      Team productivity is expected to increase by {data.aiInsights.aiInsights.performancePrediction.productivityIncrease}% in the coming month.
                    </p>
                    <Button size="sm" variant="outline">
                      View Detailed Predictions
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Strategic Recommendations</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      To optimize overall portfolio performance, the AI recommends:
                      <ol className="list-decimal pl-5 mt-2">
                        {data.aiInsights.aiInsights.strategicRecommendations.map((rec: any, index: number) => (
                          <li key={index}>{rec.recommendation} - {rec.benefit} (Priority: {rec.priority})</li>
                        ))}
                      </ol>
                    </p>
                    <Button size="sm" variant="outline">
                      Generate Implementation Plan
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
