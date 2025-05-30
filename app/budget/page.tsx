import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowDown, ArrowUp, BarChart3, DollarSign, Download, Filter, Plus, Search } from "lucide-react"

export default function BudgetPage() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget & Expenses</h1>
          <p className="text-muted-foreground">Manage your project budgets and expenses</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$103,000</div>
            <p className="text-xs text-muted-foreground">Across all active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$31,600</div>
            <p className="text-xs text-muted-foreground">30.7% of total budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$71,400</div>
            <p className="text-xs text-muted-foreground">69.3% of total budget</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview by Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Website Redesign</span>
                    <span>$8,400 / $12,000</span>
                  </div>
                  <Progress value={70} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>70% spent</span>
                    <span>$3,600 remaining</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mobile App Development</span>
                    <span>$15,000 / $45,000</span>
                  </div>
                  <Progress value={33} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>33% spent</span>
                    <span>$30,000 remaining</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Marketing Campaign</span>
                    <span>$8,200 / $8,500</span>
                  </div>
                  <Progress value={96} className="h-2 bg-red-200" />
                  <div className="flex justify-between text-xs">
                    <span className="text-red-500">96% spent</span>
                    <span className="text-red-500">$300 remaining</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>E-commerce Platform</span>
                    <span>$0 / $32,000</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0% spent</span>
                    <span>$32,000 remaining</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Brand Identity Redesign</span>
                    <span>$0 / $7,500</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0% spent</span>
                    <span>$7,500 remaining</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expenses" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search expenses..." className="pl-8 w-full" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Design software licenses</TableCell>
                  <TableCell>Website Redesign</TableCell>
                  <TableCell>Software</TableCell>
                  <TableCell className="text-right">$2,400</TableCell>
                  <TableCell>Mar 15, 2025</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 text-white">Approved</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Server hosting (Q1)</TableCell>
                  <TableCell>Mobile App Development</TableCell>
                  <TableCell>Infrastructure</TableCell>
                  <TableCell className="text-right">$3,600</TableCell>
                  <TableCell>Mar 1, 2025</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 text-white">Approved</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Social media ads</TableCell>
                  <TableCell>Marketing Campaign</TableCell>
                  <TableCell>Advertising</TableCell>
                  <TableCell className="text-right">$4,500</TableCell>
                  <TableCell>Mar 10, 2025</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 text-white">Approved</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Content creation</TableCell>
                  <TableCell>Marketing Campaign</TableCell>
                  <TableCell>Services</TableCell>
                  <TableCell className="text-right">$3,700</TableCell>
                  <TableCell>Mar 20, 2025</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 text-white">Approved</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Development team (March)</TableCell>
                  <TableCell>Website Redesign</TableCell>
                  <TableCell>Personnel</TableCell>
                  <TableCell className="text-right">$6,000</TableCell>
                  <TableCell>Mar 31, 2025</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-500 text-white">Pending</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">API integration services</TableCell>
                  <TableCell>Mobile App Development</TableCell>
                  <TableCell>Services</TableCell>
                  <TableCell className="text-right">$11,400</TableCell>
                  <TableCell>Mar 25, 2025</TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-500 text-white">Pending</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                AI Budget Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center">
                    <div className="bg-red-500 p-2 rounded-full text-white mr-3">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Budget Alert: Marketing Campaign</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on current spending patterns, this project is projected to exceed its budget by $1,275 (15%)
                    by completion.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Projected Final Cost</span>
                      <span>$9,775 / $8,500</span>
                    </div>
                    <Progress value={115} className="h-2 bg-red-200" />
                  </div>
                  <Button size="sm" variant="outline">
                    View Recommendations
                  </Button>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center">
                    <div className="bg-yellow-500 p-2 rounded-full text-white mr-3">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Spending Pattern: Website Redesign</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current spending rate is 15% faster than planned. At this rate, budget will be depleted 10 days
                    before project completion.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Projected Completion</span>
                      <span>Apr 5, 2025 (10 days early)</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <Button size="sm" variant="outline">
                    Adjust Budget Plan
                  </Button>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center">
                    <div className="bg-green-500 p-2 rounded-full text-white mr-3">
                      <ArrowDown className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Cost Optimization: Mobile App Development</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI analysis suggests potential savings of $4,200 by optimizing cloud resources and development
                    workflows.
                  </p>
                  <Button size="sm" variant="outline">
                    View Optimization Plan
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
