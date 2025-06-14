"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowRight, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { taskApi } from "@/lib/api"

// Types
type Task = {
  id: number
  title: string
  type: "epic" | "story" | "task"
  status: "To Do" | "In Progress" | "Review" | "Done"
  startDate: string
  endDate: string
  progress: number
  color?: string
  assignee?: {
    name: string
    avatar: string
    initials: string
  }
  dependencies?: number[]
  parentId?: number
}

export function TaskGantt() {
  const [view, setView] = useState<"day" | "week" | "month">("week")
  const [filter, setFilter] = useState("all")
  const [zoomLevel, setZoomLevel] = useState(100)
  const [currentDate, setCurrentDate] = useState(new Date("2025-03-15"))
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        const response = await taskApi.getAll()
        // Map API data to local Task type if needed
        const apiTasks = (response.data || response) as any[]
        const mappedTasks: Task[] = apiTasks.map((t) => ({
          id: typeof t.id === 'string' ? parseInt(t.id) : t.id,
          title: t.title,
          type: (t.type || 'task').toLowerCase(),
          status: t.status,
          startDate: t.startDate ? (typeof t.startDate === 'string' ? t.startDate : new Date(t.startDate).toISOString().slice(0,10)) : '',
          endDate: t.endDate ? (typeof t.endDate === 'string' ? t.endDate : new Date(t.endDate).toISOString().slice(0,10)) : '',
          progress: t.progress || 0,
          color: t.color,
          assignee: t.assignee ? {
            name: t.assignee.name || `${t.assignee.firstName || ''} ${t.assignee.lastName || ''}`.trim(),
            avatar: t.assignee.avatar || "/placeholder.svg?height=32&width=32",
            initials: t.assignee.initials || ((t.assignee.firstName?.[0] || '') + (t.assignee.lastName?.[0] || '')).toUpperCase(),
          } : undefined,
          dependencies: t.dependencies,
          parentId: t.parentId ? (typeof t.parentId === 'string' ? parseInt(t.parentId) : t.parentId) : undefined,
        }))
        setTasks(mappedTasks)
      } catch (error) {
        console.error("Error fetching tasks for Gantt:", error)
        setTasks([])
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  // Filter tasks based on the selected filter
  const filteredTasks = filter === "all" ? tasks : tasks.filter((task) => task.type === filter)

  // Calculate timeframe based on the view
  const getTimeFrameDates = () => {
    const dates: Date[] = []
    const startDate = new Date(currentDate)

    // Adjust the start date to the beginning of the week/month
    if (view === "week") {
      const day = startDate.getDay()
      startDate.setDate(startDate.getDate() - day)
    } else if (view === "month") {
      startDate.setDate(1)
    }

    // Determine the number of days to display
    const daysToShow = view === "day" ? 14 : view === "week" ? 28 : 31

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }

    return dates
  }

  const timeFrameDates = getTimeFrameDates()

  // Format date for display
  const formatDate = (date: Date) => {
    if (view === "day") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } else if (view === "week") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short" })
    }
  }

  // Calculate the position and width of a task bar on the timeline
  const calculateTaskPosition = (task: Task) => {
    const startDate = new Date(task.startDate)
    const endDate = new Date(task.endDate)

    // Find the position of the task in the timeframe
    const startIdx = timeFrameDates.findIndex(
      (date) =>
        date.getFullYear() === startDate.getFullYear() &&
        date.getMonth() === startDate.getMonth() &&
        date.getDate() === startDate.getDate(),
    )

    const endIdx = timeFrameDates.findIndex(
      (date) =>
        date.getFullYear() === endDate.getFullYear() &&
        date.getMonth() === endDate.getMonth() &&
        date.getDate() === endDate.getDate(),
    )

    // If the task is not in the visible timeframe, return null
    if (startIdx === -1 && endIdx === -1) {
      return null
    }

    // Calculate the actual position
    const visibleStartIdx = Math.max(0, startIdx)
    const visibleEndIdx = endIdx === -1 ? timeFrameDates.length - 1 : endIdx

    const left = `${(visibleStartIdx / timeFrameDates.length) * 100}%`
    const width = `${((visibleEndIdx - visibleStartIdx + 1) / timeFrameDates.length) * 100}%`

    return { left, width }
  }

  // Get color based on task type or status
  const getTaskColor = (task: Task) => {
    if (task.color) return task.color

    if (task.type === "epic") return "purple"
    if (task.type === "story") return "blue"

    switch (task.status) {
      case "To Do":
        return "gray"
      case "In Progress":
        return "blue"
      case "Review":
        return "yellow"
      case "Done":
        return "green"
      default:
        return "gray"
    }
  }

  // Navigate the timeline
  const navigateTimeline = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (view === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 14 : -14))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Timeline View</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateTimeline("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateTimeline("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              disabled={zoomLevel <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{zoomLevel}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              disabled={zoomLevel >= 150}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week" | "month")}>
            <TabsList>
              <TabsTrigger value="day">Daily</TabsTrigger>
              <TabsTrigger value="week">Weekly</TabsTrigger>
              <TabsTrigger value="month">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="epic">Epics</SelectItem>
              <SelectItem value="story">Stories</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="relative overflow-x-auto" style={{ minHeight: "500px" }}>
            <div className="gantt-container" style={{ zoom: `${zoomLevel}%` }}>
              {/* Timeline Header */}
              <div className="gantt-header flex border-b sticky top-0 bg-background z-10">
                <div className="gantt-task-info w-64 min-w-64 shrink-0 p-2 border-r">
                  <span className="text-sm font-medium">Task</span>
                </div>
                <div className="gantt-timeline flex-1 flex">
                  {timeFrameDates.map((date, index) => (
                    <div
                      key={index}
                      className={`text-center p-2 text-xs border-r last:border-r-0 ${
                        date.getDay() === 0 || date.getDay() === 6 ? "bg-muted/50" : ""
                      }`}
                      style={{ width: `${100 / timeFrameDates.length}%` }}
                    >
                      {formatDate(date)}
                      {view !== "month" && (
                        <div className="text-muted-foreground">
                          {date.toLocaleDateString("en-US", { weekday: "short" })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks and Timeline */}
              <div className="gantt-body">
                {filteredTasks.map((task) => {
                  const position = calculateTaskPosition(task)
                  if (!position) return null // Skip tasks not in the visible timeframe

                  return (
                    <div key={task.id} className="gantt-row flex border-b hover:bg-muted/30">
                      <div className="gantt-task-info w-64 min-w-64 shrink-0 p-2 border-r flex items-center">
                        <div className={`w-3 h-3 rounded-sm mr-2 bg-${getTaskColor(task)}-500`}></div>
                        <div className="truncate flex-1">
                          <div className="font-medium text-sm truncate">{task.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {task.type}
                            </Badge>
                            {task.assignee && (
                              <Avatar className="h-5 w-5 ml-1">
                                <AvatarImage src={task.assignee.avatar} />
                                <AvatarFallback className="text-[10px]">{task.assignee.initials}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="gantt-timeline flex-1 relative">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute top-1 rounded-sm h-8 bg-${getTaskColor(task)}-500 hover:bg-${getTaskColor(task)}-600 cursor-pointer border border-${getTaskColor(task)}-700`}
                                style={{
                                  left: position.left,
                                  width: position.width,
                                }}
                              >
                                <div className="h-full bg-primary/20" style={{ width: `${task.progress}%` }}></div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <div className="font-medium">{task.title}</div>
                                <div className="text-xs">
                                  {new Date(task.startDate).toLocaleDateString()} -{" "}
                                  {new Date(task.endDate).toLocaleDateString()}
                                </div>
                                <div className="text-xs">Progress: {task.progress}%</div>
                                <div className="text-xs">Status: {task.status}</div>
                                {task.assignee && (
                                  <div className="text-xs flex items-center">
                                    Assignee:
                                    <Avatar className="h-4 w-4 ml-1 mr-1">
                                      <AvatarImage src={task.assignee.avatar} />
                                      <AvatarFallback className="text-[8px]">{task.assignee.initials}</AvatarFallback>
                                    </Avatar>
                                    {task.assignee.name}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Dependency arrows */}
                        {task.dependencies?.map((depId) => {
                          const depTask = tasks.find((t) => t.id === depId)
                          if (!depTask) return null

                          const depPosition = calculateTaskPosition(depTask)
                          if (!depPosition) return null

                          // Simple right-to-left arrow, in a real implementation this would be more sophisticated
                          return (
                            <div
                              key={`${task.id}-${depId}`}
                              className="absolute top-5 border-t-2 border-dashed border-gray-400 flex items-center justify-center"
                              style={{
                                left: depPosition.left,
                                width: `calc(${position.left} - ${depPosition.left})`,
                                transform: "translateX(100%)",
                              }}
                            >
                              <ArrowRight className="absolute right-0 h-3 w-3 text-gray-400 -translate-y-1.5" />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {filteredTasks.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">No tasks found for the selected filter.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
