"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { projectApi, budgetApi } from "@/lib/api"

export function BudgetOverview() {
  const [budgetData, setBudgetData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBudgetData = async () => {
      setLoading(true)
      try {
        // Fetch active projects with budget info
        const projectsResponse = await projectApi.getAll({
          status: 'Active,In Progress',
          limit: 3
        })
        
        const projectsData = projectsResponse.data || []
        
        // Create budget overview data from projects
        const budgetOverview = projectsData.map(project => {
          const allocated = parseFloat(project.totalBudget || 0)
          const spent = parseFloat(project.usedBudget || 0)
          const remaining = allocated - spent
          
          // Determine if budget is at risk (less than 10% remaining or over budget)
          const percentRemaining = allocated > 0 ? (remaining / allocated) * 100 : 100
          const isAtRisk = percentRemaining < 10 || remaining < 0
          
          return {
            id: project.id,
            project: project.name,
            allocated,
            spent,
            remaining,
            status: isAtRisk ? "At Risk" : "On Track"
          }
        })
        
        setBudgetData(budgetOverview)
      } catch (error) {
        console.error("Error fetching budget data:", error)
        setBudgetData([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchBudgetData()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {budgetData.length > 0 ? (
              budgetData.map((budget) => {
                const percentSpent = budget.allocated > 0 
                  ? Math.round((budget.spent / budget.allocated) * 100)
                  : 0
                const isAtRisk = budget.status === "At Risk"

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{budget.project}</div>
                      {isAtRisk && (
                        <div className="flex items-center text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Budget at risk
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget Utilization</span>
                        <span>{percentSpent}%</span>
                      </div>
                      <Progress value={percentSpent} className={`h-2 ${isAtRisk ? "bg-red-200" : ""}`} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Allocated</span>
                        <span className="font-medium">${budget.allocated.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="font-medium">${budget.spent.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className={`font-medium ${isAtRisk ? "text-red-500" : ""}`}>
                          ${budget.remaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center p-8 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">No budget data available</h3>
                <p className="text-muted-foreground mb-4">Add budget information to your projects</p>
                <Button asChild>
                  <Link href="/projects">Go to Projects</Link>
                </Button>
              </div>
            )}
          </div>
        )}
        {budgetData.length > 0 && (
          <div className="mt-6">
            <Button variant="outline" asChild>
              <Link href="/budget">View Full Budget Report</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
