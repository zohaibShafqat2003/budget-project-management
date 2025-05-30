"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  ArrowDown, 
  ArrowUp, 
  BarChart3, 
  DollarSign, 
  Download, 
  Filter, 
  Plus, 
  Search 
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { projectApi } from "@/lib/api"
import { budgetApi, expenseApi } from "@/lib/api/budget"
import { format } from "date-fns"
import { CreateExpenseDialog } from "@/components/create-expense-dialog"
import { API_ROUTES } from "@/lib/api-config"

// Types
interface BudgetSummary {
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

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
}

interface BudgetItem {
  id: string;
  projectId: string;
  name: string;
  category: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface Expense {
  id: string;
  projectId: string;
  budgetItemId: string;
  amount: number;
  description: string;
  category: string;
  paymentMethod?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Rejected';
  date: string;
  createdAt: string;
  updatedAt: string;
}

export default function BudgetPage() {
  // State variables
  const [activeTab, setActiveTab] = useState('overview')
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateExpenseDialog, setShowCreateExpenseDialog] = useState(false)

  // Fetch projects on initial load
  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        const projectsData = await projectApi.getAll()
        
        const projectList = Array.isArray(projectsData) 
          ? projectsData 
          : (projectsData?.data || [])
        
        setProjects(projectList)
        
        if (projectList.length > 0) {
          setSelectedProjectId(projectList[0].id)
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err)
        setError('Failed to load projects. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [])

  // Fetch budget data when a project is selected
  useEffect(() => {
    if (!selectedProjectId) return
    
    async function fetchBudgetData() {
      setLoading(true)
      setError(null)
      
      try {
        console.log('Fetching budget data for project:', selectedProjectId);
        
        // Fetch budget summary and items in parallel
        const projectId = selectedProjectId as string; // Type assertion to fix TypeScript errors
        const [summaryResponse, itemsResponse, expensesResponse] = await Promise.all([
          fetch(API_ROUTES.BUDGET.SUMMARY(projectId)),
          fetch(API_ROUTES.BUDGET.LIST(projectId)),
          fetch(API_ROUTES.EXPENSE.LIST(projectId))
        ])
        
        console.log('Summary API response status:', summaryResponse.status);
        console.log('Budget items API response status:', itemsResponse.status);
        console.log('Expenses API response status:', expensesResponse.status);
        
        if (!summaryResponse.ok) {
          console.error(`Failed to fetch budget summary: ${summaryResponse.status}`);
          // Continue with default empty summary instead of throwing
          setBudgetSummary({
            totalBudget: 0,
            totalSpent: 0,
            remainingBudget: 0,
            items: []
          });
        } else {
          const summaryData = await summaryResponse.json();
          setBudgetSummary(summaryData.data || {
            totalBudget: 0,
            totalSpent: 0,
            remainingBudget: 0,
            items: []
          });
        }
        
        if (!itemsResponse.ok) {
          console.error(`Failed to fetch budget items: ${itemsResponse.status}`);
          setBudgetItems([]);
        } else {
          const itemsData = await itemsResponse.json();
          setBudgetItems(itemsData.data || []);
        }
        
        if (!expensesResponse.ok) {
          console.error(`Failed to fetch expenses: ${expensesResponse.status}`);
          setExpenses([]);
        } else {
          const expensesData = await expensesResponse.json();
          setExpenses(expensesData.data || []);
        }
      } catch (err) {
        console.error(`Failed to fetch budget data for project ${selectedProjectId}:`, err)
        setError('Failed to load budget data. Please try again.')
        // Set default empty values for all data
        setBudgetSummary({
          totalBudget: 0,
          totalSpent: 0,
          remainingBudget: 0,
          items: []
        });
        setBudgetItems([]);
        setExpenses([]);
      } finally {
        setLoading(false)
      }
    }
    
    fetchBudgetData()
  }, [selectedProjectId])

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return '0%'
    return `${Math.round((value / total) * 100)}%`
  }

  const getProgressColor = (spent: number, total: number) => {
    if (total === 0) return ''
    const percentage = (spent / total) * 100
    if (percentage > 90) return 'bg-red-200'
    if (percentage > 75) return 'bg-yellow-200'
    return ''
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500 text-white'
      case 'Pending':
        return 'bg-yellow-500 text-white'
      case 'Rejected':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    if (!searchTerm) return true
    
    return (
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleExpenseCreated = () => {
    // Refresh expenses when a new one is created
    if (selectedProjectId) {
      fetchProjectExpenses(selectedProjectId);
    }
  };

  const fetchProjectExpenses = async (projectId: string) => {
    try {
      const response = await fetch(API_ROUTES.EXPENSE.LIST(projectId));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch expenses: ${response.status}`);
      }
      
      const expensesData = await response.json();
      setExpenses(expensesData.data || []);
    } catch (err) {
      console.error(`Failed to fetch expenses for project ${projectId}:`, err);
      setError('Failed to refresh expense data.');
    }
  };

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget & Expenses</h1>
          <p className="text-muted-foreground">Manage your project budgets and expenses</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCreateExpenseDialog(true)} disabled={!selectedProjectId || loading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex gap-4 items-center">
          <div className="w-64">
            <Select 
              value={selectedProjectId || ''} 
              onValueChange={handleProjectChange}
              disabled={loading || projects.length === 0}
            >
              <SelectTrigger>
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
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(budgetSummary?.totalBudget || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedProjectId ? 'Current project budget' : 'No project selected'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <ArrowDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(budgetSummary?.totalSpent || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {budgetSummary?.totalBudget ? 
                    formatPercent(budgetSummary.totalSpent, budgetSummary.totalBudget) + ' of total budget' : 
                    '0% of total budget'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(budgetSummary?.remainingBudget || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {budgetSummary?.totalBudget ? 
                    formatPercent(budgetSummary.remainingBudget, budgetSummary.totalBudget) + ' of total budget' : 
                    '0% of total budget'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Overview by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {budgetSummary && budgetSummary.items.length > 0 ? (
                    <div className="space-y-6">
                      {budgetSummary.items.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{item.category}</span>
                            <span>
                              {formatCurrency(item.spent)} / {formatCurrency(item.budgeted)}
                            </span>
                          </div>
                          <Progress 
                            value={item.budgeted > 0 ? (item.spent / item.budgeted) * 100 : 0} 
                            className={`h-2 ${getProgressColor(item.spent, item.budgeted)}`} 
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {item.budgeted > 0 ? formatPercent(item.spent, item.budgeted) : '0%'} spent
                            </span>
                            <span>{formatCurrency(item.remaining)} remaining</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No budget data available for this project.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="expenses" className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search expenses..." 
                    className="pl-8 w-full" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map(expense => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.description}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                          <TableCell>
                            {expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(expense.paymentStatus)}>
                              {expense.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No expenses found.
                        </TableCell>
                      </TableRow>
                    )}
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
                    {budgetSummary && budgetSummary.items.some(item => item.spent / item.budgeted > 0.85) ? (
                      <div className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center">
                          <div className="bg-red-500 p-2 rounded-full text-white mr-3">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <span className="font-medium">Budget Alert</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Some categories are approaching their budget limits. Consider reallocating funds
                          or adjusting spending to avoid overruns.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg space-y-3">
                        <p className="text-sm text-muted-foreground">
                          No budget alerts detected. Your spending appears to be within planned limits.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <CreateExpenseDialog
        open={showCreateExpenseDialog}
        onOpenChange={setShowCreateExpenseDialog}
        onExpenseCreated={handleExpenseCreated}
        projectId={selectedProjectId}
        projects={projects}
        budgetItems={budgetItems}
      />
    </div>
  )
}
