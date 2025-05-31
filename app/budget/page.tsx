"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  DollarSign, 
  Download, 
  Edit,
  Filter, 
  Loader2, 
  Plus, 
  Search,
  CheckCircle,
  XCircle 
} from "lucide-react"
import { projectApi, budgetApi, expenseApi } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from 'next/navigation'

// Types for the data we'll fetch from the API
interface Project {
  id: string
  name: string
  totalBudget: number
  usedBudget: number
}

interface BudgetItem {
  id: string
  projectId: string
  name: string
  category: string
  amount: number
  usedAmount: number
  status: string
}

interface Expense {
  id: string
  projectId: string
  budgetItemId: string | null
  amount: number
  description: string
  date: string
  category: string
  paymentMethod: string
  paymentStatus: string
}

interface ProjectWithBudget extends Project {
  percentSpent: number
  remaining: number
}

export default function BudgetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialProjectId = searchParams.get('projectId')
  
  // State for data
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<ProjectWithBudget[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [totalRemaining, setTotalRemaining] = useState(0)
  
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false)
  
  // State for new budget form
  const [budgetName, setBudgetName] = useState("")
  const [budgetCategory, setBudgetCategory] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")

  // State for updating expenses
  const [updatingExpense, setUpdatingExpense] = useState<string | null>(null)

  // Handle project change with null check
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId)
    // We know projectId is a string here (not null) because it comes from the Select
    router.push(`/budget?projectId=${projectId}`)
  }
  
  // Fetch all projects on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        // Fetch all active projects
        const projectsResponse = await projectApi.getAllProjects()
        const projectsData = projectsResponse.data || []
        
        // Process project data to calculate percentages
        const processedProjects = projectsData.map((project: any) => {
          // Ensure budget values are numbers
          const totalBudget = Number(project.totalBudget) || 0
          const usedBudget = Number(project.usedBudget) || 0
          const remaining = totalBudget - usedBudget
          const percentSpent = totalBudget > 0 
            ? Math.round((usedBudget / totalBudget) * 100) 
            : 0
          
          return {
            ...project,
            totalBudget,
            usedBudget,
            percentSpent,
            remaining
          }
        })
        
        // Sort projects by name
        processedProjects.sort((a: ProjectWithBudget, b: ProjectWithBudget) => 
          a.name.localeCompare(b.name)
        )
        
        setProjects(processedProjects)
        
        // If there's an initialProjectId from URL, use it
        if (initialProjectId) {
          setSelectedProjectId(initialProjectId)
        } 
        // Otherwise select the first project if we have any
        else if (processedProjects.length > 0 && !selectedProjectId) {
          const firstProject = processedProjects[0];
          setSelectedProjectId(firstProject.id)
          // Update URL with the first project
          const url = new URL(window.location.href);
          url.searchParams.set('projectId', firstProject.id);
          router.replace(url.toString());
        }
      } catch (error) {
        console.error("Error fetching projects:", error)
        setError("Failed to load projects. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  // Only run this effect on initial render and when initialProjectId changes
  }, [initialProjectId, router, selectedProjectId])
  
  // Fetch project details when a project is selected
  useEffect(() => {
    if (!selectedProjectId) return
    
    async function fetchProjectDetails() {
      setLoading(true)
      try {
        // Fetch budget items for the selected project
        const budgetItemsResponse = await budgetApi.getItems(selectedProjectId!)
        const budgetItemsData = budgetItemsResponse.data || []
        
        // Ensure all numeric values are properly parsed
        const processedBudgetItems = budgetItemsData.map((item: any) => ({
          ...item,
          amount: Number(item.amount) || 0,
          usedAmount: Number(item.usedAmount) || 0
        }))
        
        setBudgetItems(processedBudgetItems)
        
        // Fetch expenses for the selected project
        const expensesResponse = await expenseApi.getProjectExpenses(selectedProjectId!)
        const expensesData = expensesResponse.data || []
        
        // Process expenses
        const processedExpenses = expensesData.map((expense: any) => ({
          ...expense,
          amount: Number(expense.amount) || 0,
          // Find the associated budget item name if it exists
          budgetItemName: processedBudgetItems.find(
            (item: BudgetItem) => item.id === expense.budgetItemId
          )?.name || 'General'
        }))
        
        // Sort expenses by date (newest first)
        processedExpenses.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        
        setExpenses(processedExpenses)
        
        // Calculate totals for the selected project
        const selectedProject = projects.find((p) => p.id === selectedProjectId)
        if (selectedProject) {
          setTotalBudget(selectedProject.totalBudget)
          setTotalSpent(selectedProject.usedBudget)
          setTotalRemaining(selectedProject.remaining)
        }
        
      } catch (error) {
        console.error("Error fetching project details:", error)
        toast({
          title: "Error",
          description: "Failed to load budget data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjectDetails()
  }, [selectedProjectId, projects])
  
  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.budgetItemName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle adding a new budget item
  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProjectId) {
      toast({
        title: "Error",
        description: "Please select a project first",
        variant: "destructive"
      })
      return
    }
    
    if (!budgetName || !budgetCategory || !budgetAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }
    
    try {
      await budgetApi.createItem(selectedProjectId, {
        name: budgetName,
        category: budgetCategory,
        amount: Number(budgetAmount)
      })
      
      // Reset form
      setBudgetName("")
      setBudgetCategory("")
      setBudgetAmount("")
      setShowNewBudgetModal(false)
      
      // Refresh data
      toast({
        title: "Success",
        description: "Budget item added successfully",
      })
      
      // Refetch project details
      const projectsResponse = await projectApi.getAllProjects()
      const projectsData = projectsResponse.data || []
      const processedProjects = projectsData.map((project: any) => {
        const totalBudget = Number(project.totalBudget) || 0
        const usedBudget = Number(project.usedBudget) || 0
        return {
          ...project,
          totalBudget,
          usedBudget,
          percentSpent: totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0,
          remaining: totalBudget - usedBudget
        }
      })
      setProjects(processedProjects)
      
      // Refetch budget items
      const budgetItemsResponse = await budgetApi.getItems(selectedProjectId)
      setBudgetItems(budgetItemsResponse.data || [])
      
    } catch (error) {
      console.error("Error adding budget item:", error)
      toast({
        title: "Error",
        description: "Failed to add budget item. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Handle exporting project data
  const handleExport = () => {
    if (!selectedProjectId) {
      toast({
        title: "Error",
        description: "Please select a project first",
        variant: "destructive"
      })
      return
    }
    
    // Generate CSV data
    const csvData = [
      // Header row
      ["Category", "Budget Item", "Allocated", "Used", "Remaining"],
      // Data rows
      ...budgetItems.map(item => [
        item.category,
        item.name,
        item.amount.toFixed(2),
        item.usedAmount.toFixed(2),
        (item.amount - item.usedAmount).toFixed(2)
      ])
    ]
    
    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(",")).join("\n")
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `project_budget_${selectedProjectId}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Handle approving an expense
  const handleApproveExpense = async (expenseId: string) => {
    if (!expenseId) return
    
    setUpdatingExpense(expenseId)
    try {
      await expenseApi.approve(expenseId)
      
      // Update the expense in the local state
      setExpenses(expenses.map(expense => 
        expense.id === expenseId 
          ? { ...expense, paymentStatus: 'Approved' } 
          : expense
      ))
      
      toast({
        title: "Success",
        description: "Expense approved successfully",
      })
    } catch (error) {
      console.error("Error approving expense:", error)
      toast({
        title: "Error",
        description: "Failed to approve expense. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdatingExpense(null)
    }
  }
  
  // Handle rejecting an expense
  const handleRejectExpense = async (expenseId: string) => {
    if (!expenseId) return
    
    setUpdatingExpense(expenseId)
    try {
      await expenseApi.reject(expenseId)
      
      // Update the expense in the local state
      setExpenses(expenses.map(expense => 
        expense.id === expenseId 
          ? { ...expense, paymentStatus: 'Rejected' } 
          : expense
      ))
      
      toast({
        title: "Success",
        description: "Expense rejected successfully",
      })
    } catch (error) {
      console.error("Error rejecting expense:", error)
      toast({
        title: "Error",
        description: "Failed to reject expense. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdatingExpense(null)
    }
  }
  
  if (loading && projects.length === 0) {
    return (
      <div className="flex flex-col p-6 h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading budget data...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Budget & Expenses</h1>
          <p className="text-muted-foreground">Manage your project budgets and expenses</p>
        </div>
        
        {/* Project Selector */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Select
            value={selectedProjectId || ""}
            onValueChange={handleProjectChange}
          >
            <SelectTrigger className="w-[250px]">
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
          
        <div className="flex space-x-2">
            <Button onClick={() => setShowNewBudgetModal(true)} disabled={!selectedProjectId}>
              <DollarSign className="mr-2 h-4 w-4" />
              Add Budget Item
            </Button>
            <Button asChild disabled={!selectedProjectId}>
              <Link href={selectedProjectId ? `/expenses/new?projectId=${selectedProjectId}` : "#"}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
              </Link>
          </Button>
            <Button variant="outline" onClick={handleExport} disabled={!selectedProjectId}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
          <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold">
                ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedProjectId ? 'Project total budget' : 'Across all active projects'}
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
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalBudget > 0 
                  ? `${Math.round((totalSpent / totalBudget) * 100)}% of total budget` 
                  : '0% of total budget'}
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
                ${totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalBudget > 0 
                  ? `${Math.round((totalRemaining / totalBudget) * 100)}% of total budget` 
                  : '100% of total budget'}
              </p>
          </CardContent>
        </Card>
      </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Budget Items</CardTitle>
              {selectedProjectId && (
                <Button size="sm" variant="outline" onClick={() => setShowNewBudgetModal(true)}>
                  <Plus className="mr-2 h-3 w-3" />
                  Add Budget Item
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
                  <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
                  <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
                </div>
              ) : (
                <>
                  {!selectedProjectId ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">Please select a project to view budget items.</p>
                    </div>
                  ) : budgetItems.length > 0 ? (
                    <div className="space-y-6">
                      {budgetItems.map(item => {
                        const percentSpent = item.amount > 0 
                          ? Math.round((item.usedAmount / item.amount) * 100) 
                          : 0
                        const isAtRisk = percentSpent > 90
                        
                        return (
                          <div key={item.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">({item.category})</span>
                  </div>
                              <span>
                                ${item.usedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} / 
                                ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                  </div>
                            <Progress 
                              value={percentSpent} 
                              className={`h-2 ${
                                percentSpent >= 100 
                                  ? "bg-red-200" 
                                  : percentSpent >= 90 
                                    ? "bg-yellow-200" 
                                    : ""
                              }`} 
                            />
                  <div className="flex justify-between text-xs">
                              <span 
                                className={isAtRisk ? "text-red-500" : "text-muted-foreground"}
                              >
                                {percentSpent}% spent
                              </span>
                              <span 
                                className={isAtRisk ? "text-red-500" : "text-muted-foreground"}
                              >
                                ${(item.amount - item.usedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} remaining
                              </span>
                  </div>
                </div>
                        )
                      })}
                  </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No budget items found for this project.</p>
                      <Button className="mt-4" onClick={() => setShowNewBudgetModal(true)}>
                        Add Budget Item
                      </Button>
                  </div>
                  )}
                </>
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
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Budget Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
                ) : !selectedProjectId ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Please select a project to view expenses.
                  </TableCell>
                </TableRow>
                ) : filteredExpenses.length > 0 ? (
                  filteredExpenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>{expense.budgetItemName}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="text-right">
                        ${parseFloat(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                        <Badge 
                          className={`
                            ${expense.paymentStatus === 'Approved' ? 'bg-green-500' : 
                              expense.paymentStatus === 'Rejected' ? 'bg-red-500' : 
                              'bg-yellow-500'} 
                            text-white
                          `}
                        >
                          {expense.paymentStatus}
                        </Badge>
                  </TableCell>
                      <TableCell className="text-right">
                        {expense.paymentStatus === 'Pending' && (
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-green-600"
                              onClick={() => handleApproveExpense(expense.id)}
                              disabled={updatingExpense === expense.id}
                            >
                              {updatingExpense === expense.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-600"
                              onClick={() => handleRejectExpense(expense.id)}
                              disabled={updatingExpense === expense.id}
                            >
                              {updatingExpense === expense.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No expenses found.
                  </TableCell>
                </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Budget Item Modal */}
      <Dialog open={showNewBudgetModal} onOpenChange={setShowNewBudgetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Budget Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBudget} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="budgetName">Name</Label>
              <Input
                id="budgetName"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                placeholder="e.g. Development Resources"
                required
              />
                  </div>
                  <div className="space-y-2">
              <Label htmlFor="budgetCategory">Category</Label>
              <Input
                id="budgetCategory"
                value={budgetCategory}
                onChange={(e) => setBudgetCategory(e.target.value)}
                placeholder="e.g. Personnel"
                required
              />
                  </div>
                  <div className="space-y-2">
              <Label htmlFor="budgetAmount">Amount</Label>
              <Input
                id="budgetAmount"
                type="number"
                min="0"
                step="0.01"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="e.g. 10000.00"
                required
              />
                    </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewBudgetModal(false)}
              >
                Cancel
                  </Button>
              <Button type="submit">Save Budget Item</Button>
                </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
