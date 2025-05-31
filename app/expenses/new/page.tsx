"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { projectApi, budgetApi, expenseApi } from '@/lib/api'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Calendar as CalendarIcon, Loader2, ArrowLeft } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface BudgetItem {
  id: string
  name: string
  category: string
  amount: number
  usedAmount: number
  status: string
}

interface Project {
  id: string
  name: string
}

export default function NewExpensePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId')
  
  // Form state
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('Pending')
  const [budgetItemId, setBudgetItemId] = useState('')
  
  // Data state
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  
  // Load project and budget items
  useEffect(() => {
    async function loadData() {
      if (!projectId) {
        setLoading(false)
        return
      }
      
      try {
        // Get project details
        const projectResponse = await projectApi.getById(projectId)
        if (projectResponse.data) {
          setProject(projectResponse.data)
        }
        
        // Get budget items for the project
        const budgetItemsResponse = await budgetApi.getItems(projectId)
        if (budgetItemsResponse.data) {
          setBudgetItems(budgetItemsResponse.data)
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load project data. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [projectId])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectId) {
      setError("No project selected")
      return
    }
    
    if (!description || !amount || !date) {
      setError("Please fill in all required fields")
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      const expenseData: any = {
        description,
        amount: Number(amount),
        date: date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        category,
        paymentMethod,
        paymentStatus
      };
      
      // Only add budgetItemId if it exists and is not empty
      if (budgetItemId && budgetItemId.trim()) {
        expenseData.budgetItemId = budgetItemId;
      }
      
      await expenseApi.createExpense(projectId, expenseData);
      
      toast({
        title: "Success",
        description: "Expense added successfully",
      })
      
      // Redirect back to budget page
      router.push(`/budget?projectId=${projectId}`)
    } catch (err) {
      console.error("Error creating expense:", err)
      setError("Failed to create expense. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex flex-col p-6 h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading project data...</p>
      </div>
    )
  }

  if (!projectId) {
    return (
      <div className="container max-w-2xl py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No project ID provided. Please select a project first.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/budget">Go Back to Budget</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-12">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/budget">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Budget
        </Link>
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
          <CardDescription>
            {project ? `Adding expense to project: ${project.name}` : 'Create a new expense'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Server hosting fees"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Software"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetItem">Budget Item</Label>
                <Select value={budgetItemId} onValueChange={setBudgetItemId}>
                  <SelectTrigger id="budgetItem">
                    <SelectValue placeholder="Select budget item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General (No specific budget)</SelectItem>
                    {budgetItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - ${item.amount.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger id="paymentStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Expense"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 