import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart3, Download, FileText, PieChart, TrendingUp, Calendar, Users, BrainCircuit } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Insights</h1>
          <p className="text-muted-foreground">AI-generated reports and analytics</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Project Summary</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
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
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Project Status Distribution</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Visual representation of project statuses across your portfolio.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Timeline Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Project Timeline Comparison</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Compare planned vs. actual timelines for your projects.
                  </p>
                </div>
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
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Website Redesign</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The Website Redesign project is currently 70% complete and on track to meet its April 15 deadline.
                    The team has completed the design phase and is now in the development stage. Budget utilization is
                    at 70%, which aligns with the project progress. Key achievements include finalizing the homepage
                    design and implementing the new content management system. Potential risks include the integration
                    with third-party APIs, which may require additional time.
                  </p>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Full Report
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Mobile App Development</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The Mobile App Development project is 30% complete, which is slightly behind the planned 35% at this
                    stage. The team has completed the initial design phase and has begun development of core features.
                    Budget utilization is at 33%, which is in line with progress. Key achievements include finalizing
                    the app architecture and completing user authentication flows. The main challenge is resource
                    allocation, as two team members are currently split between this project and others.
                  </p>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Full Report
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Marketing Campaign</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The Marketing Campaign project is 90% complete and is in the final review stage before launch.
                    Budget utilization is at 96%, which is concerning as there are still deliverables remaining. The
                    team has successfully created all campaign assets and implemented the social media strategy. The
                    main risk is budget overrun, with a projected 15% excess by completion. Recommendation: Review
                    remaining tasks and consider scope reduction or budget reallocation.
                  </p>
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Full Report
                  </Button>
                </div>
              </div>
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
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Budget Utilization Over Time</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Track how project budgets are being utilized over time.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-primary" />
                  Expense Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Expense Category Breakdown</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Visualize how expenses are distributed across categories.
                  </p>
                </div>
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
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Budget Efficiency Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on analysis of your current projects, the overall budget efficiency is at 85%. The Website
                    Redesign and Mobile App Development projects show good alignment between budget utilization and
                    project progress. However, the Marketing Campaign is showing signs of budget inefficiency with 96%
                    of budget used for 90% completion. Recommendation: Implement stricter budget controls for marketing
                    projects and consider reallocating resources from E-commerce Platform (which hasn't started yet) to
                    cover potential overruns.
                  </p>
                  <Button size="sm" variant="outline">
                    View Detailed Analysis
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Cost Optimization Opportunities</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI analysis has identified potential cost savings of approximately $7,800 across all projects. Major
                    opportunities include optimizing cloud infrastructure for the Mobile App Development project
                    ($4,200), consolidating software licenses across projects ($2,100), and streamlining content
                    creation workflows for the Marketing Campaign ($1,500). Implementing these recommendations could
                    improve overall budget efficiency by 7.5%.
                  </p>
                  <Button size="sm" variant="outline">
                    View Optimization Plan
                  </Button>
                </div>
              </div>
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
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Team Member Allocation</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Visualize how team members are allocated across projects.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Productivity Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Team Productivity Trends</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Track productivity metrics over time for your team.
                  </p>
                </div>
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
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Resource Allocation Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Current team allocation shows some inefficiencies. Sarah Miller and John Doe are assigned to 3
                    projects each, which may be affecting their productivity. Alex Johnson shows high efficiency on the
                    Website Redesign project but could be better utilized on the E-commerce Platform as well. Mike Chen
                    and Lisa Wong have balanced workloads. Recommendation: Redistribute some of Sarah's tasks to Alex to
                    improve overall team efficiency.
                  </p>
                  <Button size="sm" variant="outline">
                    View Reallocation Plan
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Skill Gap Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on current project requirements, there is a potential skill gap in backend development for the
                    Mobile App Development project. The team would benefit from additional expertise in API integration
                    and database optimization. Options include upskilling Mike Chen, who has shown interest in backend
                    development, or bringing in a specialized contractor for the critical integration phase in April.
                  </p>
                  <Button size="sm" variant="outline">
                    View Skill Development Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
                AI Strategic Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Project Risk Assessment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI analysis has identified the Marketing Campaign as the highest risk project with a 75% probability
                    of budget overrun and a 40% probability of timeline slippage. The Website Redesign has a moderate
                    risk profile with a 30% probability of minor delays. The Mobile App Development project has a low
                    risk profile currently but may face increased risks during the integration phase in May.
                    Recommendation: Implement weekly budget reviews for the Marketing Campaign and allocate additional
                    QA resources to the Website Redesign to mitigate potential delays.
                  </p>
                  <Button size="sm" variant="outline">
                    View Risk Mitigation Plan
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Performance Prediction</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on current performance metrics and historical data, the AI predicts that 4 out of 5 active
                    projects will meet their deadlines. The Marketing Campaign is likely to require a 1-week extension.
                    Budget performance is predicted to be within 5% of planned for all projects except the Marketing
                    Campaign, which may exceed by 15%. Team productivity is expected to increase by 8% in April as the
                    E-commerce Platform project ramps up and workloads become more balanced.
                  </p>
                  <Button size="sm" variant="outline">
                    View Detailed Predictions
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Strategic Recommendations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    To optimize overall portfolio performance, the AI recommends: 1) Accelerate the start of the
                    E-commerce Platform to better distribute team resources, 2) Consider merging some aspects of the
                    Brand Identity Redesign with the Website Redesign to create synergies, 3) Implement a more agile
                    approach to the Marketing Campaign with weekly budget checkpoints, and 4) Invest in upskilling the
                    team in backend development to address the identified skill gap.
                  </p>
                  <Button size="sm" variant="outline">
                    Generate Implementation Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
