"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  MoreHorizontal,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  BookOpen,
  List as ListIcon,
  Layers,
  ChevronDown,
  ChevronRight,
  PlusCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable"
import { Story, Task, User, Epic, Sprint, updateStory, getStoriesByProject, getTasks, updateTask, assignTask } from "@/lib/db"
import { CreatableItemType } from "@/components/create-item-dialog"
import { SortableItem } from "./SortableItem"
import { DroppableContainer } from "./DroppableContainer"

interface BoardViewProps {
  projectId: string
  boardId: string
  sprintId: string
  users: User[]
  onOpenCreateItemDialog: (type: CreatableItemType, defaults: { epicId?: string, projectId?: string, storyId?: string, sprintId?: string }) => void
}

// Define BoardStory interface
interface BoardStory extends Story {
  tasks: Task[];
}

// Column type definition for Kanban board
type Column = {
  id: Story['status']
  title: string
  stories: BoardStory[]
}

// Status columns for Jira-style workflow
const BOARD_STATUS_COLUMNS: Story['status'][] = ['To Do', 'In Progress', 'Review', 'Done']

// Define valid status transitions
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  'To Do': ['In Progress'],
  'In Progress': ['Review'],
  'Review': ['Done'],
  'Done': ['To Do'] // Allow moving back to To Do if needed
};

// Helper functions for displaying priority and item type icons
const getPriorityDisplay = (priority: Story['priority'] | Task['priority']) => {
  const colors: Record<string, string> = {
    Highest: "bg-red-600", 
    High: "bg-orange-500", 
    Medium: "bg-yellow-500", 
    Low: "bg-green-500", 
    Lowest: "bg-blue-400",
  }
  const icons: Record<string, React.ReactNode> = {
    Highest: <ArrowUp className="h-3 w-3" />, 
    High: <ArrowUp className="h-3 w-3" />,
    Medium: <ArrowRight className="h-3 w-3" />, 
    Low: <ArrowDown className="h-3 w-3" />,
    Lowest: <ArrowDown className="h-3 w-3" />,
  }
  return {
    color: colors[priority] || "bg-gray-500",
    icon: icons[priority] || <ArrowRight className="h-3 w-3" />,
    name: priority
  }
}

const getItemTypeIcon = (item: Story | Task | Epic) => {
  if ('points' in item && 'isReady' in item) {
    return <BookOpen className="h-4 w-4 text-green-500 mr-1" />
  }
  if ('type' in item) {
    const taskItem = item as Task
    switch (taskItem.type) {
      case "Task": return <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
      case "Bug": return <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
      case "Subtask": return <ListIcon className="h-4 w-4 text-gray-500 mr-1" />
      default: return <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
    }
  }
  if ('name' in item) {
    return <Layers className="h-4 w-4 text-purple-500 mr-1" />
  }
  return <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
}

export function BoardView({ projectId, boardId, sprintId, users, onOpenCreateItemDialog }: BoardViewProps) {
  const [columns, setColumns] = useState<Column[]>([])
  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<BoardStory | null>(null)
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})

  // Set up drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Toggle task expansion
  const toggleTasks = (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks(prev => ({
      ...prev,
      [storyId]: !prev[storyId]
    }));
  }

  // Helper function to refresh board data
  const refreshBoardData = async () => {
    if (!projectId || !sprintId) return;
    
    try {
      // Fetch stories in the sprint
      const storiesInSprint = await getStoriesByProject(projectId, { sprintId })
      const storiesWithTasks: BoardStory[] = []

      // Fetch tasks for each story
      for (const story of storiesInSprint) {
        const tasksForStory = await getTasks({ projectId, storyId: story.id })
        storiesWithTasks.push({ ...story, tasks: tasksForStory })
      }

      // Group stories by status
      const storiesByStatus = storiesWithTasks.reduce((acc, story) => {
        const status = story.status
        if (!acc[status]) {
          acc[status] = []
        }
        acc[status].push(story)
        return acc
      }, {} as Record<Story['status'], BoardStory[]>)

      // Create columns for the board
      const newColumns: Column[] = BOARD_STATUS_COLUMNS.map(statusKey => ({
        id: statusKey,
        title: statusKey.replace(/([A-Z])/g, ' $1').trim(),
        stories: storiesByStatus[statusKey] || [],
      }))
      
      setColumns(newColumns)
    } catch (err) {
      console.error("Failed to refresh board data:", err)
      setError(`Failed to refresh board. ${err instanceof Error ? err.message : ''}`)
    }
  }

  // Helper function to clean up drag state
  const cleanupDrag = () => {
    setActiveId(null)
    setActiveItem(null)
  }

  // Fetch stories and tasks for the sprint
  useEffect(() => {
    if (!projectId || !sprintId) {
      setLoading(false)
      setColumns([])
      return
    }

    async function fetchSprintStoriesAndTasks() {
      setLoading(true)
      setError(null)
      try {
        // Fetch stories in the sprint
        const storiesInSprint = await getStoriesByProject(projectId, { sprintId })
        const storiesWithTasks: BoardStory[] = []

        // Fetch tasks for each story
        for (const story of storiesInSprint) {
          const tasksForStory = await getTasks({ projectId, storyId: story.id })
          storiesWithTasks.push({ ...story, tasks: tasksForStory })
        }

        // Group stories by status
        const storiesByStatus = storiesWithTasks.reduce((acc, story) => {
          const status = story.status
          if (!acc[status]) {
            acc[status] = []
          }
          acc[status].push(story)
          return acc
        }, {} as Record<Story['status'], BoardStory[]>)

        // Create columns for the board
        const newColumns: Column[] = BOARD_STATUS_COLUMNS.map(statusKey => ({
          id: statusKey,
          title: statusKey.replace(/([A-Z])/g, ' $1').trim(),
          stories: storiesByStatus[statusKey] || [],
        }))
        
        setColumns(newColumns)
      } catch (err) {
        console.error("Failed to fetch stories/tasks for sprint:", err)
        setError(`Failed to load sprint items. ${err instanceof Error ? err.message : ''}`)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSprintStoriesAndTasks()
  }, [projectId, sprintId])

  // Handle drag start event
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)

    // Find the active item
    for (const column of columns) {
      const foundItem = column.stories.find(item => item.id === active.id)
      if (foundItem) {
        setActiveItem(foundItem)
        break
      }
    }
  }

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return cleanupDrag();

    // If dropped onto a column:
    if (BOARD_STATUS_COLUMNS.includes(over.id as Story['status'])) {
      const newStatus = over.id as Story['status'];
      let storyToMove: BoardStory | undefined;
      
      // Find the story being moved
      for (const col of columns) {
        const found = col.stories.find((s) => s.id === active.id);
        if (found) { 
          storyToMove = found; 
          break; 
        }
      }

      if (storyToMove) {
        // Check if the status transition is valid
        const allowedTransitions = VALID_STATUS_TRANSITIONS[storyToMove.status] || [];
        if (!allowedTransitions.includes(newStatus)) {
          alert(`Invalid transition: ${storyToMove.status} → ${newStatus}`);
          return cleanupDrag();
        }

        try {
          await updateStory(projectId, storyToMove.id, { status: newStatus })
          await refreshBoardData();
        } catch (e: any) {
          alert(e.message || 'Unable to change status. Reverting.');
          return cleanupDrag();
        }
      }
    }

    // If dropped onto another story (move a task between stories):
    if (over.data.current?.type === 'story' && active.data.current?.type === 'task') {
      const newStoryId = over.id as string;
      const taskIdToMove = active.id as string;
      try {
        await updateTask(projectId, taskIdToMove, { storyId: newStoryId });
        await refreshBoardData();
      } catch (e: any) {
        alert(e.message || 'Unable to move task. Reverting.');
        return cleanupDrag();
      }
    }

    cleanupDrag();
  };

  // Handle task status change
  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    // Find the task and its current status
    let taskToUpdate: Task | null = null
    let currentColumnId: Story['status'] | null = null

    for (const column of columns) {
      for (const story of column.stories) {
        const task = story.tasks.find(t => t.id === taskId)
        if (task) {
          taskToUpdate = task
          currentColumnId = column.id
          break
        }
      }
      if (taskToUpdate) break
    }

    if (!taskToUpdate || !currentColumnId) return

    // Create a backup of columns for rollback
    const originalColumns = JSON.parse(JSON.stringify(columns))

    // Update the columns optimistically
    setColumns(prevColumns => {
      return prevColumns.map(column => ({
        ...column,
        stories: column.stories.map(story => ({
          ...story,
          tasks: story.tasks.map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        }))
      }))
    })

    try {
      // Update the task status in the backend
      await updateTask(projectId, taskId, { status: newStatus })
    } catch (err) {
      console.error(`Failed to update task status to ${newStatus}:`, err)
      // Revert to original state on error
      setColumns(originalColumns)
      // Show error toast or notification to user
      alert(`Failed to update task status: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Handle task assignment - new function
  const handleTaskAssignment = async (taskId: string, assigneeId: string | undefined) => {
    try {
      await assignTask(taskId, assigneeId)
      
      // Update the local state optimistically
      setColumns(prevColumns => {
        return prevColumns.map(column => ({
          ...column,
          stories: column.stories.map(story => ({
            ...story,
            tasks: story.tasks.map(task => 
              task.id === taskId 
                ? { 
                    ...task, 
                    assigneeId, 
                    assignee: assigneeId 
                      ? users.find((u: User) => u.id === assigneeId) 
                      : undefined 
                  } 
                : task
            )
          }))
        }))
      })
    } catch (err) {
      console.error(`Failed to assign task:`, err)
      // Show error toast or notification to user
      alert(`Failed to assign task: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Render a story card
  const renderStoryCard = (story: BoardStory) => {
    const priorityInfo = getPriorityDisplay(story.priority)
    const storyAssignee = story.assigneeId ? users.find(u => u.id === story.assigneeId) : null
    const showTasks = expandedTasks[story.id] || false

    return (
      <Card className="mb-3 shadow-sm">
        <CardHeader className="p-3 pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getItemTypeIcon(story)}
              <span className="text-xs text-muted-foreground ml-1">
                {story.id.substring(0, 8)}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpenCreateItemDialog('Task', { projectId, storyId: story.id, sprintId })}>
                  Add Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit Story</DropdownMenuItem>
                <DropdownMenuItem>Remove from Sprint</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-sm font-medium mt-1">{story.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`px-1.5 py-0.5 text-white ${priorityInfo.color} border-transparent`}>
              <span className="flex items-center gap-1">
                {priorityInfo.icon} {priorityInfo.name}
              </span>
            </Badge>
            {story.points != null && (
              <Badge variant="secondary" className="px-1.5 py-0.5">
                {story.points} SP
              </Badge>
            )}
          </div>
          
          {story.tasks && story.tasks.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 text-xs"
                  onClick={(e) => toggleTasks(story.id, e)}
                >
                  <span className="flex items-center">
                    {showTasks ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                    Tasks: {story.tasks.filter(t => t.status === 'Done').length}/{story.tasks.length}
                  </span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 rounded-full" 
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenCreateItemDialog('Task', { projectId, storyId: story.id, sprintId })
                  }}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Progress 
                value={(story.tasks.filter(t => t.status === 'Done').length / story.tasks.length) * 100} 
                className="h-1.5 mt-1" 
              />
              
              {/* Task list */}
              {showTasks && (
                <div className="mt-2 border-t pt-2 space-y-1.5">
                  {story.tasks.map(task => {
                    const taskPriority = getPriorityDisplay(task.priority as any);
                    const assignee = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null;
                    
                    return (
                      <div key={task.id} className="flex items-center justify-between bg-muted/30 rounded px-2 py-1.5 text-xs">
                        <div className="flex items-center">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            task.status === 'Done' ? 'bg-green-500' : 
                            task.status === 'In Progress' ? 'bg-blue-500' : 
                            task.status === 'To Do' ? 'bg-gray-400' :
                            'bg-purple-500'
                          } mr-2`}></div>
                          <span className="truncate max-w-[150px]">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge 
                            variant="outline" 
                            className={`h-4 px-1 py-0 text-[10px] text-white ${taskPriority.color} border-transparent`}
                          >
                            {taskPriority.name}
                          </Badge>
                          {assignee && (
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-[8px]">
                                {`${assignee.firstName[0]}${assignee.lastName[0]}`}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        {error}
      </div>
    )
  }

  if (!sprintId) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">Please select a sprint to view its board.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/30 rounded-lg border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Sprint Board</h3>
            <p className="text-sm text-muted-foreground">Drag and drop stories between columns to update their status</p>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((column) => (
              <DroppableContainer
                key={column.id}
                id={column.id}
                title={column.title}
                itemCount={column.stories.length}
              >
                <div className="space-y-2">
                  <SortableContext items={column.stories.map(story => story.id)} strategy={verticalListSortingStrategy}>
                    {column.stories.map((story) => (
                      <SortableItem key={story.id} id={story.id}>
                        {renderStoryCard(story)}
                      </SortableItem>
                    ))}
                  </SortableContext>
                  
                  {column.stories.length === 0 && (
                    <div className="h-24 flex items-center justify-center border border-dashed rounded-lg p-4 text-sm text-muted-foreground">
                      No stories in {column.title}
                    </div>
                  )}
                </div>
              </DroppableContainer>
            ))}
          </div>

          <DragOverlay>
            {activeId && activeItem ? (
              <div className="w-[calc(100%-16px)] md:w-[calc(50%-16px)] lg:w-[calc(25%-16px)] transform scale-105 opacity-90">
                {renderStoryCard(activeItem)}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
} 