"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Project, Epic, Story, Task, User, Sprint, createEpic, createStory, createTask } from "@/lib/db"
import { ensureString } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export type CreatableItemType = 'Epic' | 'Story' | 'Task'

type CommonProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemCreated: (item: Epic | Story | Task) => void
  projectId: string | null
  sprintId: string | null
  projects: Project[]
  epics: Epic[]
  projectStories: Story[]
  users: User[]
  initialDefaults?: { [key: string]: any }
}

interface CreateItemDialogProps extends CommonProps {
  itemType: CreatableItemType
}

export function CreateItemDialog({ 
  open, 
  onOpenChange, 
  onItemCreated,
  projectId,
  sprintId,
  projects,
  epics,
  projectStories,
  users,
  itemType = 'Story',
  initialDefaults = {}
}: CreateItemDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeType, setActiveType] = useState<CreatableItemType>(itemType)
  
  // Epic form state
  const [epicName, setEpicName] = useState("")
  const [epicDescription, setEpicDescription] = useState("")
  const [epicStatus, setEpicStatus] = useState<Epic['status']>("To Do")
  const [epicProjectId, setEpicProjectId] = useState<string | null>(projectId)
  
  // Story form state
  const [storyTitle, setStoryTitle] = useState("")
  const [storyDescription, setStoryDescription] = useState("")
  const [storyPoints, setStoryPoints] = useState<number | undefined>(undefined)
  const [storyStatus, setStoryStatus] = useState<Story['status']>("Backlog")
  const [storyPriority, setStoryPriority] = useState<Story['priority']>("Medium")
  const [storyProjectId, setStoryProjectId] = useState<string | null>(projectId)
  const [storyEpicId, setStoryEpicId] = useState<string | null>(null)
  const [storySprintId, setStorySprintId] = useState<string | null>(sprintId)
  const [storyIsReady, setStoryIsReady] = useState(false)
  const [storyAssigneeId, setStoryAssigneeId] = useState<string | null>(null)
  
  // Task form state
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskStatus, setTaskStatus] = useState<Task['status']>("To Do")
  const [taskPriority, setTaskPriority] = useState<Task['priority']>("Medium")
  const [taskType, setTaskType] = useState<Task['type']>("Task")
  const [taskEstimatedHours, setTaskEstimatedHours] = useState<number | undefined>(undefined)
  const [taskProjectId, setTaskProjectId] = useState<string | null>(projectId)
  const [taskStoryId, setTaskStoryId] = useState<string | null>(null)
  const [taskAssigneeId, setTaskAssigneeId] = useState<string | null>(null)

  // Reset form values when dialog opens/closes
  useEffect(() => {
    if (open) {
      setActiveType(itemType)
      
      // Set defaults from props
      if (initialDefaults) {
        // Epic defaults
        if (initialDefaults.epicId) {
          setStoryEpicId(initialDefaults.epicId)
        }
        
        // Project defaults
        if (initialDefaults.projectId) {
          setEpicProjectId(initialDefaults.projectId)
          setStoryProjectId(initialDefaults.projectId)
          setTaskProjectId(initialDefaults.projectId)
        } else if (projectId) {
          setEpicProjectId(projectId)
          setStoryProjectId(projectId)
          setTaskProjectId(projectId)
        }
        
        // Story defaults
        if (initialDefaults.storyId) {
          setTaskStoryId(initialDefaults.storyId)
        }
        
        // Sprint defaults
        if (initialDefaults.sprintId) {
          setStorySprintId(initialDefaults.sprintId)
          setStoryStatus("To Do") // When adding to sprint, set status to To Do instead of Backlog
        } else if (sprintId) {
          setStorySprintId(sprintId)
          setStoryStatus("To Do")
        }
      }
    } else {
      // Reset all form values when dialog closes
      resetForms()
    }
  }, [open, itemType, projectId, sprintId, initialDefaults])

  const resetForms = () => {
    // Reset Epic form
    setEpicName("")
    setEpicDescription("")
    setEpicStatus("To Do")
    
    // Reset Story form
    setStoryTitle("")
    setStoryDescription("")
    setStoryPoints(undefined)
    setStoryStatus("Backlog")
    setStoryPriority("Medium")
    setStoryEpicId(null)
    setStoryIsReady(false)
    setStoryAssigneeId(null)
    
    // Reset Task form
    setTaskTitle("")
    setTaskDescription("")
    setTaskStatus("To Do")
    setTaskPriority("Medium")
    setTaskType("Task")
    setTaskEstimatedHours(undefined)
    setTaskStoryId(null)
    setTaskAssigneeId(null)
    
    // Reset submission state
    setIsSubmitting(false)
  }

  const handleCreateEpic = async () => {
    if (!epicProjectId) {
      toast({
        title: "Project ID Missing",
        description: "Cannot create epic without a project ID.",
        variant: "destructive"
      })
      setIsSubmitting(false)
      return
    }
    
    if (!epicName.trim()) {
      toast({
        title: "Missing Name",
        description: "Please provide a name for the epic.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const newEpic = await createEpic(epicProjectId, {
        name: epicName,
        description: epicDescription,
        status: epicStatus,
      })
      
      onItemCreated(newEpic)
      toast({
        title: "Epic Created",
        description: `Epic "${newEpic.name}" has been created successfully.`
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create epic:", error)
      toast({
        title: "Failed to Create Epic",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateStory = async () => {
    if (!storyProjectId) {
      toast({
        title: "Project ID Missing",
        description: "Cannot create story without a project ID.",
        variant: "destructive"
      })
      setIsSubmitting(false)
      return
    }
    
    if (!storyTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for the story.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const newStory = await createStory(storyProjectId, {
        title: storyTitle,
        description: storyDescription,
        points: storyPoints,
        status: storyStatus,
        priority: storyPriority,
        isReady: storyIsReady,
        assigneeId: storyAssigneeId || undefined,
        projectId: storyProjectId
      })
      
      onItemCreated(newStory)
      toast({
        title: "Story Created",
        description: `Story "${newStory.title}" has been created successfully.`
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create story:", error)
      toast({
        title: "Failed to Create Story",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateTask = async () => {
    if (!taskProjectId) {
      toast({
        title: "Missing Project",
        description: "Please select a project for this task.",
        variant: "destructive"
      })
      return
    }
    
    if (!taskTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for the task.",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const newTask = await createTask({
        title: taskTitle,
        description: taskDescription,
            status: taskStatus,
        priority: taskPriority,
        type: taskType,
        estimatedHours: taskEstimatedHours,
        projectId: taskProjectId,
        storyId: taskStoryId || undefined,
        assigneeId: taskAssigneeId || undefined
      })
      
      onItemCreated(newTask)
      toast({
        title: "Task Created",
        description: `${taskType} "${newTask.title}" has been created successfully.`
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create task:", error)
      toast({
        title: "Failed to Create Task",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    switch (activeType) {
      case "Epic":
        await handleCreateEpic()
        break
      case "Story":
        await handleCreateStory()
        break
      case "Task":
        await handleCreateTask()
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your project. Fill in the required information and click Create when done.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeType} onValueChange={(value) => setActiveType(value as CreatableItemType)} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="Epic">Epic</TabsTrigger>
            <TabsTrigger value="Story">Story</TabsTrigger>
            <TabsTrigger value="Task">Task</TabsTrigger>
          </TabsList>
          
          {/* Epic Form */}
          <TabsContent value="Epic" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="epic-project">Project *</Label>
                <Select 
                  value={epicProjectId || ""} 
                  onValueChange={setEpicProjectId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="epic-project">
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

              <div className="space-y-2">
                <Label htmlFor="epic-name">Epic Name *</Label>
                <Input
                  id="epic-name"
                  value={epicName}
                  onChange={(e) => setEpicName(e.target.value)}
                  placeholder="e.g., User Authentication"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="epic-description">Description</Label>
                <Textarea
                  id="epic-description"
                  value={epicDescription}
                  onChange={(e) => setEpicDescription(e.target.value)}
                  placeholder="Describe this epic..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="epic-status">Status</Label>
                <Select 
                  value={epicStatus} 
                  onValueChange={(value) => setEpicStatus(value as Epic['status'])}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="epic-status">
                    <SelectValue />
                  </SelectTrigger>
              <SelectContent>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
            </div>
          </TabsContent>
          
          {/* Story Form */}
          <TabsContent value="Story" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="story-project">Project *</Label>
                <Select 
                  value={storyProjectId || ""} 
                  onValueChange={setStoryProjectId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="story-project">
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

              <div className="space-y-2">
                <Label htmlFor="story-epic">Epic</Label>
                <Select 
                  value={storyEpicId || ""} 
                  onValueChange={setStoryEpicId}
                  disabled={isSubmitting || !storyProjectId}
                >
                  <SelectTrigger id="story-epic">
                    <SelectValue placeholder="Select an epic (optional)" />
                  </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">None (Standalone Story)</SelectItem>
                    {epics
                      .filter(epic => epic.projectId === storyProjectId)
                      .map(epic => (
                        <SelectItem key={epic.id} value={epic.id}>
                          {epic.name}
                        </SelectItem>
                      ))
                    }
                </SelectContent>
              </Select>
            </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="story-title">Story Title *</Label>
              <Input 
                  id="story-title"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="e.g., As a user, I want to reset my password"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="story-description">Description</Label>
                <Textarea
                  id="story-description"
                  value={storyDescription}
                  onChange={(e) => setStoryDescription(e.target.value)}
                  placeholder="Describe this user story..."
                  rows={3}
                  disabled={isSubmitting}
              />
            </div>

              <div className="space-y-2">
                <Label htmlFor="story-points">Story Points</Label>
                <Select
                  value={storyPoints?.toString() || ""}
                  onValueChange={(value) => setStoryPoints(value ? parseInt(value) : undefined)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="story-points">
                    <SelectValue placeholder="Select points (optional)" />
                  </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="">Not estimated</SelectItem>
                    <SelectItem value="1">1 (XS)</SelectItem>
                    <SelectItem value="2">2 (S)</SelectItem>
                    <SelectItem value="3">3 (M)</SelectItem>
                    <SelectItem value="5">5 (L)</SelectItem>
                    <SelectItem value="8">8 (XL)</SelectItem>
                    <SelectItem value="13">13 (XXL)</SelectItem>
                    </SelectContent>
                </Select>
                </div>

              <div className="space-y-2">
                <Label htmlFor="story-priority">Priority</Label>
                <Select 
                  value={storyPriority} 
                  onValueChange={(value) => setStoryPriority(value as Story['priority'])}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="story-priority">
                    <SelectValue />
                  </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Highest">Highest</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium (Default)</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Lowest">Lowest</SelectItem>
                    </SelectContent>
                </Select>
                </div>

              <div className="space-y-2">
                <Label htmlFor="story-status">Status</Label>
                <Select 
                  value={storyStatus} 
                  onValueChange={(value) => setStoryStatus(value as Story['status'])}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="story-status">
                    <SelectValue />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

              <div className="space-y-2">
                <Label htmlFor="story-sprint">Sprint</Label>
                <Select 
                  value={storySprintId || ""} 
                  onValueChange={setStorySprintId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="story-sprint">
                    <SelectValue placeholder="Select a sprint (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not assigned to sprint</SelectItem>
                    {/* In a real app, you would fetch sprints based on the selected project */}
                    {sprintId && (
                      <SelectItem value={sprintId}>Current Sprint</SelectItem>
                    )}
                  </SelectContent>
                </Select>
            </div>

              <div className="space-y-2">
                <Label htmlFor="story-assignee">Assignee</Label>
                <Select 
                  value={storyAssigneeId || ""} 
                  onValueChange={setStoryAssigneeId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="story-assignee">
                    <SelectValue placeholder="Assign to (optional)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
              <div className="space-y-2 flex items-center pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="story-ready" 
                    checked={storyIsReady}
                    onCheckedChange={(checked) => setStoryIsReady(checked === true)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="story-ready">
                    Ready for development
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Task Form */}
          <TabsContent value="Task" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-project">Project *</Label>
                <Select 
                  value={taskProjectId || ""} 
                  onValueChange={setTaskProjectId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="task-project">
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

              <div className="space-y-2">
                <Label htmlFor="task-story">Story</Label>
                <Select 
                  value={taskStoryId || ""} 
                  onValueChange={setTaskStoryId}
                  disabled={isSubmitting || !taskProjectId}
                >
                  <SelectTrigger id="task-story">
                    <SelectValue placeholder="Select a story (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Standalone Task)</SelectItem>
                    {projectStories
                      .filter(story => story.projectId === taskProjectId)
                      .map(story => (
                        <SelectItem key={story.id} value={story.id}>
                          {story.title}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="task-title">Task Title *</Label>
              <Input
                  id="task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g., Create password reset endpoint"
                  disabled={isSubmitting}
                required
              />
            </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="task-description">Description</Label>
              <Textarea
                  id="task-description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Describe this task..."
                  rows={3}
                  disabled={isSubmitting}
              />
            </div>

              <div className="space-y-2">
                <Label htmlFor="task-type">Task Type</Label>
                <RadioGroup
                  value={taskType}
                  onValueChange={(value) => setTaskType(value as Task['type'])}
                  className="flex space-x-4 pt-1"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="Task" id="task-type-task" />
                    <Label htmlFor="task-type-task">Task</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="Bug" id="task-type-bug" />
                    <Label htmlFor="task-type-bug">Bug</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="Subtask" id="task-type-subtask" />
                    <Label htmlFor="task-type-subtask">Subtask</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-hours">Estimated Hours</Label>
                <Select
                  value={taskEstimatedHours?.toString() || ""}
                  onValueChange={(value) => setTaskEstimatedHours(value ? parseFloat(value) : undefined)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="task-hours">
                    <SelectValue placeholder="Estimated hours (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not estimated</SelectItem>
                    <SelectItem value="0.5">0.5 hrs</SelectItem>
                    <SelectItem value="1">1 hr</SelectItem>
                    <SelectItem value="2">2 hrs</SelectItem>
                    <SelectItem value="4">4 hrs</SelectItem>
                    <SelectItem value="6">6 hrs</SelectItem>
                    <SelectItem value="8">8 hrs (1 day)</SelectItem>
                    <SelectItem value="16">16 hrs (2 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select 
                  value={taskPriority} 
                  onValueChange={(value) => setTaskPriority(value as Task['priority'])}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Highest">Highest</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium (Default)</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Lowest">Lowest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-status">Status</Label>
                <Select 
                  value={taskStatus} 
                  onValueChange={(value) => setTaskStatus(value as Task['status'])}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select 
                  value={taskAssigneeId || ""} 
                  onValueChange={setTaskAssigneeId}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="task-assignee">
                    <SelectValue placeholder="Assign to (optional)" />
                  </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 