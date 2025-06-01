"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  PlusCircle,
  ChevronRight,
  Calendar,
  ChevronDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Story, Task, Epic, Sprint, User } from "@/lib/db"
import { CreatableItemType } from "@/components/create-item-dialog"
import { CreateSprintDialog } from "@/components/create-sprint-dialog"
import { getTasks } from "@/lib/db"

interface BacklogViewProps {
  projectId: string
  epics: Epic[]
  stories: Story[]
  sprints: Sprint[]
  selectedSprintId: string | null
  users: User[]
  onAssignStoryToSprint: (storyId: string, sprintId: string) => Promise<void>
  onUpdateStoryStatus: (storyId: string, status: Story['status']) => Promise<void>
  onOpenCreateItemDialog: (type: CreatableItemType, defaults: { epicId?: string, projectId?: string, storyId?: string }) => void
  onDeleteEpic?: (epicId: string) => Promise<void>
  onSprintCreated?: (sprint: Sprint) => void
  boardId?: string
}

// Define valid status and priority options
const VALID_STATUS_OPTIONS = ['To Do', 'In Progress', 'Review', 'Done'] as const;
const VALID_PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'] as const;

// Update priority mapping to match backend expectations
const priorityMap: Record<typeof VALID_PRIORITY_OPTIONS[number], number> = {
  'Low': 0,
  'Medium': 1,
  'High': 2,
  'Critical': 3
};

// Helper function for priority display
const getPriorityDisplay = (priority: typeof VALID_PRIORITY_OPTIONS[number]) => {
  const colors: Record<string, string> = {
    Critical: "bg-red-600", 
    High: "bg-orange-500", 
    Medium: "bg-yellow-500", 
    Low: "bg-green-500"
  }
  const icons: Record<string, React.ReactNode> = {
    Critical: <ArrowUp className="h-3 w-3" />, 
    High: <ArrowUp className="h-3 w-3" />,
    Medium: <ArrowRight className="h-3 w-3" />, 
    Low: <ArrowDown className="h-3 w-3" />
  }
  return {
    color: colors[priority] || "bg-gray-500",
    icon: icons[priority] || <ArrowRight className="h-3 w-3" />,
    name: priority
  }
}

// Helper function for item type icons
const getItemTypeIcon = (itemType: 'Epic' | 'Story' | 'Task' | 'Bug' | 'Subtask') => {
  switch (itemType) {
    case "Epic": return <Layers className="h-4 w-4 text-purple-500 mr-1" />
    case "Story": return <BookOpen className="h-4 w-4 text-green-500 mr-1" />
    case "Task": return <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
    case "Bug": return <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
    case "Subtask": return <ListIcon className="h-4 w-4 text-gray-500 mr-1" />
    default: return <BookOpen className="h-4 w-4 text-green-500 mr-1" />
  }
}

export function BacklogView({
  projectId,
  epics,
  stories,
  sprints,
  selectedSprintId,
  users,
  onAssignStoryToSprint,
  onUpdateStoryStatus,
  onOpenCreateItemDialog,
  onDeleteEpic,
  onSprintCreated,
  boardId
}: BacklogViewProps) {
  const [sortBy, setSortBy] = useState<"priority" | "id">("priority")
  const [expandedEpics, setExpandedEpics] = useState<string[]>([])
  const [isCreateSprintDialogOpen, setIsCreateSprintDialogOpen] = useState(false)
  
  // Filter stories without epic and sprint
  const storiesWithoutEpic = stories.filter((story) => !story.epicId && !story.sprintId);
  
  // Get active sprints for assignment
  const activeSprints = sprints.filter(s => s.status === 'Active' || s.status === 'Planning')

  // Sort stories by priority or ID
  const sortStories = (storiesToSort: Story[], sortKey: "priority" | "id") => {
    return [...storiesToSort].sort((a, b) => {
      if (sortKey === "priority") {
        return (priorityMap[a.priority] ?? 99) - (priorityMap[b.priority] ?? 99)
      }
      return a.id.localeCompare(b.id)
    })
  }

  // Helper to get story count and progress by epic
  const getEpicProgress = (epicId: string) => {
    const epicStories = stories.filter(s => s.epicId === epicId)
    const doneStories = epicStories.filter(s => s.status === 'Done')
    
    return {
      total: epicStories.length,
      done: doneStories.length,
      progress: epicStories.length ? Math.round((doneStories.length / epicStories.length) * 100) : 0
    }
  }

  // Add state for expanded tasks and tasks data
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [storyTasks, setStoryTasks] = useState<Record<string, Task[]>>({})
  const [isLoadingTasks, setIsLoadingTasks] = useState<Record<string, boolean>>({})

  // Load tasks for a story when expanded
  const loadTasksForStory = async (storyId: string) => {
    if (storyTasks[storyId]) return; // Already loaded
    
    setIsLoadingTasks(prev => ({ ...prev, [storyId]: true }))
    
    try {
      const tasks = await getTasks({ projectId, storyId })
      setStoryTasks(prev => ({ ...prev, [storyId]: tasks }))
    } catch (error) {
      console.error("Failed to load tasks for story:", error)
    } finally {
      setIsLoadingTasks(prev => ({ ...prev, [storyId]: false }))
    }
  }
  
  // Toggle task expansion
  const toggleTasks = (storyId: string) => {
    const newState = !expandedTasks[storyId]
    setExpandedTasks(prev => ({ ...prev, [storyId]: newState }))
    
    if (newState) {
      loadTasksForStory(storyId)
    }
  }

  // Render a story card
  const renderStoryCard = (story: Story) => {
    const priorityInfo = getPriorityDisplay(story.priority)
    const assignee = story.assigneeId ? users.find(u => u.id === story.assigneeId) : null
    const hasExpandedTasks = expandedTasks[story.id] || false

    return (
      <Card key={story.id} className="mb-2 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getItemTypeIcon('Story')}
              <span className="text-xs text-muted-foreground font-semibold ml-1">
                {story.id.substring(0, 8)}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={story.status === 'Review'}
                  onSelect={async () => {
                    try {
                      await onUpdateStoryStatus(story.id, 'To Do');
                    } catch (e: any) {
                      alert(e.message || 'Cannot move to To Do');
                    }
                  }}
                >
                  Move to To Do
                </DropdownMenuItem>
                {story.status === 'Review' && (
                  <Badge variant="destructive" className="ml-auto">
                    In Review
                  </Badge>
                )}
                {activeSprints.length > 0 ? (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Assign to Sprint</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {activeSprints.map(sprint => (
                          <DropdownMenuItem 
                            key={sprint.id} 
                            onClick={() => onAssignStoryToSprint(story.id, sprint.id)}
                            disabled={story.sprintId === sprint.id}
                          >
                            {sprint.name} ({sprint.status})
                          </DropdownMenuItem>
                        ))}
                        {boardId && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsCreateSprintDialogOpen(true)}>
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Create New Sprint
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ) : (
                  boardId && (
                    <DropdownMenuItem onClick={() => setIsCreateSprintDialogOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Sprint & Assign
                    </DropdownMenuItem>
                  )
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onOpenCreateItemDialog('Task', { projectId, storyId: story.id })}>
                  Add Task to Story
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-sm font-medium mt-1 leading-tight">{story.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {story.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{story.description}</p>
          )}
          <div className="flex items-center justify-between text-xs">
            <Badge 
              variant="outline" 
              className={`px-1.5 py-0.5 text-white ${priorityInfo.color} border-transparent`}
            >
              <span className="flex items-center gap-1">
                {priorityInfo.icon} {priorityInfo.name}
              </span>
            </Badge>
            {/* Story points */}
            <div className="text-sm text-muted-foreground">
              {story.points || 0} points
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                toggleTasks(story.id)
              }}
            >
              <span className="flex items-center">
                {hasExpandedTasks ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                Tasks
              </span>
            </Button>
            
            {assignee && (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {`${assignee.firstName[0]}${assignee.lastName[0]}`}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          
          {/* Task list (when expanded) */}
          {renderTaskList(story.id)}
        </CardContent>
      </Card>
    )
  }

  // Add task rendering
  const renderTaskList = (storyId: string) => {
    if (!expandedTasks[storyId]) return null;
    
    const tasks = storyTasks[storyId] || []
    const isLoading = isLoadingTasks[storyId]
    
    if (isLoading) {
      return (
        <div className="py-2 px-1">
          <div className="animate-pulse h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="animate-pulse h-4 bg-muted rounded w-1/2"></div>
        </div>
      )
    }
    
    if (tasks.length === 0) {
      return (
        <div className="py-2 px-1 text-xs text-muted-foreground">
          No tasks yet
        </div>
      )
    }
    
    return (
      <div className="mt-2 border-t pt-2 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium">Tasks ({tasks.length})</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 rounded-full" 
            onClick={(e) => {
              e.stopPropagation()
              onOpenCreateItemDialog('Task', { projectId, storyId })
            }}
          >
            <PlusCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
        {tasks.map(task => {
          const taskPriority = getPriorityDisplay(task.priority as any)
          const assignee = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null
          
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
          )
        })}
      </div>
    )
  }

  if (!projectId) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">Select a project to see its backlog.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Project Backlog</h2>
          <p className="text-sm text-muted-foreground">Organize stories and prepare them for sprints</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSortBy(sortBy === "priority" ? "id" : "priority")}
          >
            Sort by: {sortBy === "priority" ? "Priority" : "ID"}
          </Button>
          {boardId && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsCreateSprintDialogOpen(true)}
            >
              <Calendar className="mr-2 h-4 w-4" /> Create Sprint
            </Button>
          )}
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onOpenCreateItemDialog('Epic', { projectId })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Epic
          </Button>
        </div>
      </div>

      {/* Un-Epiced Backlog Stories */}
      {storiesWithoutEpic.length > 0 && (
        <div className="bg-muted/30 rounded-lg border p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-medium">Un-Epiced Backlog ({storiesWithoutEpic.length} Stories)</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onOpenCreateItemDialog('Story', { projectId })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Story
            </Button>
          </div>
          <div className="space-y-2">
            {sortStories(storiesWithoutEpic, sortBy).map(story => renderStoryCard(story))}
          </div>
        </div>
      )}

      {/* Epics Accordion */}
      <div className="space-y-3">
        <h3 className="text-md font-medium">Epics ({epics.length})</h3>
        
        {epics.length === 0 ? (
          <div className="bg-muted/30 rounded-lg border p-8 text-center">
            <h4 className="text-md font-medium mb-2">No Epics Found</h4>
            <p className="text-sm text-muted-foreground mb-4">Create an epic to organize your stories into larger chunks of work</p>
            <Button onClick={() => onOpenCreateItemDialog('Epic', { projectId })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Epic
            </Button>
          </div>
        ) : (
          <Accordion 
            type="multiple" 
            value={expandedEpics}
            onValueChange={setExpandedEpics}
            className="w-full space-y-3"
          >
            {epics.map(epic => {
              const epicProgress = getEpicProgress(epic.id)
              const epicStories = stories.filter(s => s.epicId === epic.id && !s.sprintId)
              
              return (
                <AccordionItem 
                  value={epic.id} 
                  key={epic.id} 
                  className="bg-muted/30 rounded-lg border px-1"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {getItemTypeIcon('Epic')}
                        <span className="ml-2 font-medium">{epic.name}</span>
                        <Badge variant="outline" className="ml-3 text-xs">
                          {epicProgress.total} {epicProgress.total === 1 ? 'Story' : 'Stories'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={epic.status === 'Done' ? 'default' : 'secondary'} className="mr-2">
                          {epic.status}
                        </Badge>
                        <div className="w-24 hidden sm:block">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{epicProgress.progress}%</span>
                          </div>
                          <Progress value={epicProgress.progress} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm text-muted-foreground">
                        {epic.description || "No description provided."}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onOpenCreateItemDialog('Story', { projectId, epicId: epic.id })}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Story to Epic
                      </Button>
                    </div>
                    
                    {epicStories.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        {sortStories(epicStories, sortBy).map(story => renderStoryCard(story))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed rounded-md">
                        <p className="text-sm text-muted-foreground mb-2">Epic is empty. Add stories to this epic.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onOpenCreateItemDialog('Story', { projectId, epicId: epic.id })}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Story
                        </Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
        
        {/* Create Epic button (if no un-epiced stories) */}
        {storiesWithoutEpic.length === 0 && epics.length === 0 && (
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => onOpenCreateItemDialog('Story', { projectId })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Story to Backlog
          </Button>
        )}
      </div>

      {/* Epic actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onDeleteEpic?.(epics[0].id)}>
            Delete Epic
          </DropdownMenuItem>
          {/* ... other menu items ... */}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sprint Creation Dialog */}
      {boardId && projectId && (
        <CreateSprintDialog
          open={isCreateSprintDialogOpen}
          onOpenChange={setIsCreateSprintDialogOpen}
          onSprintCreated={(sprint) => {
            if (onSprintCreated) onSprintCreated(sprint);
            // Close the dialog
            setIsCreateSprintDialogOpen(false);
          }}
          projectId={projectId}
          boardId={boardId}
        />
      )}
    </div>
  )
} 