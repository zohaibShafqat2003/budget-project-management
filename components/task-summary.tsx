"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { taskApi } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"

interface Task {
  id: string;
  title?: string;
  name?: string;
  status: string;
  priority: string;
  dueDate: string | null;
  projectName?: string;
  assignee?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export function TaskSummary() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        // Fetch upcoming/active tasks
        const response = await taskApi.getAll({
          status: 'To Do,In Progress,Review',
          limit: 5,
          sort: 'dueDate'
        })
        
        const tasksData = response.data || []
        setTasks(tasksData)
      } catch (error) {
        console.error("Error fetching tasks:", error)
        setTasks([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchTasks()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
      case "Critical":
        return "bg-red-500"
      case "Medium":
        return "bg-yellow-500"
      case "Low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "To Do":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "Review":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "Done":
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    
    const dueDate = new Date(dateString)
    const now = new Date()
    
    // If the date is in the past
    if (dueDate < now) {
      return 'Overdue'
    }
    
    // Check if due today
    const isToday = dueDate.toDateString() === now.toDateString()
    if (isToday) return 'Today'
    
    // Check if due tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(now.getDate() + 1)
    const isTomorrow = dueDate.toDateString() === tomorrow.toDateString()
    if (isTomorrow) return 'Tomorrow'
    
    // Otherwise return relative time
    return formatDistanceToNow(dueDate, { addSuffix: true })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <div className="font-medium">{task.title || task.name}</div>
                      <div className="text-sm text-muted-foreground">{task.projectName || 'Project'}</div>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDueDate(task.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                  {task.assignee && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={task.assignee.avatar || ''} />
                      <AvatarFallback>
                        {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-8 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">No upcoming tasks</h3>
                <p className="text-muted-foreground mb-4">Your task list is clear</p>
              </div>
            )}
          </div>
        )}
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/tasks">View All Tasks</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
