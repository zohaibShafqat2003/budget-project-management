import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, BrainCircuit, TrendingDown, TrendingUp } from "lucide-react"
import Link from "next/link"

export function AIInsights() {
  const insights = [
    {
      id: 1,
      type: "Budget Alert",
      message: "Marketing Campaign is projected to exceed budget by 15% based on current spending patterns.",
      severity: "high",
      icon: <AlertTriangle className="h-5 w-5" />,
      action: "Review Budget",
    },
    {
      id: 2,
      type: "Resource Optimization",
      message:
        "Team utilization for Website Redesign project is at 65%. Consider reallocating resources to Mobile App Development.",
      severity: "medium",
      icon: <TrendingUp className="h-5 w-5" />,
      action: "View Resources",
    },
    {
      id: 3,
      type: "Task Prediction",
      message: "Based on historical data, the current sprint is likely to complete 3 days behind schedule.",
      severity: "medium",
      icon: <TrendingDown className="h-5 w-5" />,
      action: "Adjust Timeline",
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
          AI-Generated Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`${getSeverityColor(insight.severity)} p-2 rounded-full text-white mr-3`}>
                    {insight.icon}
                  </div>
                  <span className="font-medium">{insight.type}</span>
                </div>
                <Badge variant="outline" className={`${getSeverityColor(insight.severity)} text-white`}>
                  {insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{insight.message}</p>
              <Button size="sm" variant="outline">
                {insight.action}
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/reports">View All Insights</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
