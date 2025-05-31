"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

export function ProjectCard({ 
  project, 
  title, 
  client, 
  progress: progressProp, 
  budget: budgetProp, 
  dueDate: dueDateProp, 
  status: statusProp,
  projectId: projectIdProp
}) {
  // Component can accept either a full project object or individual props
  const isProjectObject = !!project
  
  const getStatusColor = (status) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-500"
      case "Active":
        return "bg-blue-500"
      case "In Progress":
        return "bg-blue-500"
      case "Review":
        return "bg-yellow-500"
      case "Completed":
        return "bg-green-500"
      case "Archived":
        return "bg-purple-500"
      case "On Hold":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  // Use either the project object or individual props
  const projectName = isProjectObject ? project.name : title
  const projectId = isProjectObject ? project.id : projectIdProp
  const projectIdStr = isProjectObject ? project.projectIdStr : null
  const clientName = isProjectObject 
    ? (project.client?.name || project.nameOfClient || "No Client") 
    : client
  const budget = isProjectObject 
    ? (project.totalBudget ? `$${parseFloat(project.totalBudget).toLocaleString()}` : "N/A") 
    : budgetProp
  const progress = isProjectObject 
    ? (project.progress || 0) 
    : (progressProp || 0)
  const status = isProjectObject ? project.status : statusProp
  
  // Format the due date
  const dueDate = isProjectObject
    ? (project.completionDate ? formatDate(new Date(project.completionDate)) : "No due date")
    : dueDateProp

  return (
    <Link href={`/projects/${projectId}`} className="block">
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
              <CardTitle className="text-lg font-bold">{projectName}</CardTitle>
              {projectIdStr && <div className="text-xs text-muted-foreground">{projectIdStr}</div>}
          </div>
            <Badge variant="outline" className={`${getStatusColor(status)} text-white`}>
              {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            <span>{clientName}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>{budget}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>{dueDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}
