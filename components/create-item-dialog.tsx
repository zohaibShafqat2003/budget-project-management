"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Project, 
  Epic, 
  Story, 
  Task, 
  User,
  createEpic, 
  createStory, 
  createTask 
} from "@/lib/db"

// Define the types of items that can be created
export type CreatableItemType = 'Epic' | 'Story' | 'Task' | 'Bug' | 'Subtask';
// Define specific status types for Epic if they differ, e.g.:
export type EpicStatus = 'To Do' | 'In Progress' | 'Done'; // from Epic interface
export type StoryStatus = 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked'; // from Story interface
export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done' | 'Blocked'; // from Task interface

// Define simplified interfaces that don't require createdAt and updatedAt
export interface ProjectSimple {
  id: string;
  name: string;
  projectIdStr: string;
  status: string;
}

export interface EpicSimple {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  status: string;
  startDate?: string;
  endDate?: string;
  priority?: string;
}

export interface StorySimple {
  id: string;
  title: string;
  description?: string;
  epicId?: string;
  projectId: string;
  sprintId?: string;
  assigneeId?: string;
  reporterId?: string;
  status: string;
  priority: string;
  points?: number;
  isReady: boolean;
  labels?: string[];
}

export interface TaskSimple {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  storyId?: string;
  epicId?: string;
  assigneeId?: string;
  reporterId?: string;
  status: string;
  priority: string;
  type: 'Task' | 'Bug' | 'Subtask';
  estimatedHours?: number;
  dueDate?: Date;
  labels?: string[];
}

export interface UserSimple {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface CreateItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemCreated: (item: EpicSimple | StorySimple | TaskSimple) => void
  
  // Contextual data passed from the parent page
  projectId: string | null
  sprintId?: string | null // Optional, relevant for Stories/Tasks
  
  // Lists for populating dropdowns
  projects: ProjectSimple[] // All projects for selection if no specific projectId is set
  epics: EpicSimple[]       // Epics for the selected project (for linking stories/tasks)
  projectStories: StorySimple[] // Stories for the selected project (for linking tasks)
  users: UserSimple[]       // Users for assignment
  reporterId?: string  // Optional: if creating on behalf of someone, or prefill current user

  // New props for initial type and default values
  itemType?: CreatableItemType;      // Optional initial item type
  initialDefaults?: { [key: string]: any }; // Optional initial default values
}

export function CreateItemDialog({ 
  open, 
  onOpenChange, 
  onItemCreated,
  projectId: currentProjectId,
  sprintId,
  projects,
  epics,
  projectStories,
  users,
  reporterId: defaultReporterId,
  itemType: initialItemType,     // Destructure new prop
  initialDefaults             // Destructure new prop
}: CreateItemDialogProps) {
  
  const [itemType, setItemType] = useState<CreatableItemType>(initialItemType || "Task")
  
  // Common fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null) // Will be set by useEffect or prop
  const [assigneeId, setAssigneeId] = useState<string>("")
  const [reporterId, setReporterId] = useState<string>(defaultReporterId || "") 
  const [priority, setPriority] = useState<Task['priority'] | Story['priority']>("Medium") 
  
  // Item-specific status states
  const [epicStatus, setEpicStatus] = useState<EpicStatus>('To Do');
  const [storyStatus, setStoryStatus] = useState<StoryStatus>('Backlog');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('To Do');

  // Item-specific linking and data fields
  const [selectedEpicId, setSelectedEpicId] = useState<string>("") // For Story, Task, Bug, Subtask if linking to Epic
  const [selectedStoryId, setSelectedStoryId] = useState<string>("") // For Task, Bug, Subtask if child of story
  const [storyPoints, setStoryPoints] = useState<string>("") // For Story
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [labels, setLabels] = useState<string>("")
  const [estimatedHours, setEstimatedHours] = useState<string>("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentProjectId) {
      setSelectedProjectId(currentProjectId);
    } else if (projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    } else {
      setSelectedProjectId(null); // Explicitly null if no project context
    }
  }, [currentProjectId, projects]);

  useEffect(() => {
    if (open) {
      // When dialog opens, set projectId from props first
      if (currentProjectId) {
        setSelectedProjectId(currentProjectId);
      } else if (projects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projects[0].id);
      }
      // Set initial item type if provided
      if (initialItemType) {
        setItemType(initialItemType);
      }
      resetFormFields(); // This will now also apply initialDefaults
    }
  }, [open, currentProjectId, projects, initialItemType]); // initialItemType added

  useEffect(() => {
    // When itemType or initialDefaults change (e.g. dialog re-opened for different item from backlog)
    // reset form fields and apply new defaults.
    resetFormFields(); 
    if(currentProjectId) setSelectedProjectId(currentProjectId);
    
    // Apply initialDefaults when the dialog opens or these defaults change
    if (initialDefaults) {
      if (initialDefaults.projectId) setSelectedProjectId(initialDefaults.projectId as string);
      if (initialDefaults.epicId) setSelectedEpicId(initialDefaults.epicId as string);
      if (initialDefaults.storyId) setSelectedStoryId(initialDefaults.storyId as string);
      // Add other defaults as needed, e.g., pre-filling title if applicable
      // setTitle(initialDefaults.title || ""); 
    }

  }, [itemType, currentProjectId, initialDefaults]); // initialDefaults added


  const resetFormFields = () => {
    setTitle(initialDefaults?.title || ""); // Apply default title if present
    setDescription(initialDefaults?.description || "");
    setAssigneeId(initialDefaults?.assigneeId || "");
    setReporterId(initialDefaults?.reporterId || defaultReporterId || "");
    setPriority(initialDefaults?.priority || "Medium");
    setLabels(initialDefaults?.labels ? (initialDefaults.labels as string[]).join(", ") : "");
    setDueDate(initialDefaults?.dueDate ? new Date(initialDefaults.dueDate) : undefined);
    
    setSelectedEpicId(initialDefaults?.epicId || "");
    setSelectedStoryId(initialDefaults?.storyId || "");
    setStoryPoints(initialDefaults?.points?.toString() || "");
    setEstimatedHours(initialDefaults?.estimatedHours?.toString() || "");

    // Set default statuses based on item type, potentially overridden by initialDefaults
    switch(itemType) {
      case 'Epic':
        setEpicStatus(initialDefaults?.status || 'To Do');
        break;
      case 'Story':
        setStoryStatus(initialDefaults?.status || 'Backlog');
        // If a sprintId is in defaults (e.g. creating story for specific sprint from backlog)
        // it's handled by the sprintId prop directly in handleSubmit for createStory
        break;
      default: // Task, Bug, Subtask
        setTaskStatus(initialDefaults?.status || 'To Do');
        break;
    }
    setError(null);
    // Clear defaults after applying them once, so they don't persist if form is manually changed
    // This might be too aggressive, consider if defaults should persist until dialog close.
    // For now, they reset if itemType changes or dialog re-opens with new defaults.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!selectedProjectId) {
      setError("Project selection is required.");
      return;
    }

    setSubmitting(true)
    setError(null)

    try {
      let newItem: Epic | Story | Task;
      const parsedLabels = labels ? labels.split(',').map(label => label.trim()) : [];

      switch (itemType) {
        case 'Epic':
          newItem = await createEpic(selectedProjectId, { 
            name: title, 
            description, 
            status: epicStatus,
            // startDate, endDate if we add them to form
          });
          break;
        case 'Story':
          if (!selectedEpicId) {
             setError("An Epic is required to create a Story.");
             setSubmitting(false);
             return;
          }
          newItem = await createStory(selectedEpicId, { 
            projectId: selectedProjectId,
            title, 
            description, 
            status: storyStatus, 
            priority, 
            points: storyPoints ? parseInt(storyPoints) : undefined, 
            assigneeId: assigneeId || undefined,
            reporterId: reporterId || undefined,
            isReady: false, // Default value for isReady
          });
          break;
        case 'Task':
        case 'Bug':
        case 'Subtask':
          if (!selectedStoryId && !selectedEpicId) {
            setError("A parent Story or Epic is required for this item type.");
            setSubmitting(false);
            return;
          }
          newItem = await createTask({ 
            projectId: selectedProjectId,
            title,
            description,
            type: itemType,
            status: taskStatus,
            priority,
            assigneeId: assigneeId || undefined,
            reporterId: reporterId || undefined,
            epicId: selectedEpicId || undefined,
            storyId: selectedStoryId || undefined, // Link to story if selected, otherwise epic
            dueDate,
            estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
          });
          break;
        default:
          // Should not happen with CreatableItemType
          const exhaustiveCheck: never = itemType;
          throw new Error(`Invalid item type: ${exhaustiveCheck}`);
      }
      
      onItemCreated(newItem as unknown as EpicSimple | StorySimple | TaskSimple);
      onOpenChange(false);

    } catch (err) {
      console.error("Failed to create item:", err)
      setError(`Failed to create item. ${err instanceof Error ? err.message : 'Please try again.'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const showProjectSelector = !currentProjectId || projects.length > 1;

  // Filter epics based on selected project
  const availableEpics = selectedProjectId ? epics.filter(e => e.projectId === selectedProjectId) : [];
  // Filter stories based on selected project (and optionally selected epic if implementing cascading dropdowns)
  const availableStories = selectedProjectId ? projectStories.filter(s => {
    // First make sure the story belongs to the selected project
    if (s.projectId !== selectedProjectId) {
      return false;
    }
    
    // If an epic is selected, only include stories from that epic
    if (selectedEpicId) {
      return s.epicId === selectedEpicId;
    }
    
    // If no epic selected, include all stories from the project
    return true;
  }) : [];


  const renderItemSpecificFields = () => {
    switch (itemType) {
      case 'Epic':
        return (
          <div className="grid gap-3">
            <Label htmlFor="item-status-epic">Status</Label>
            <Select value={epicStatus} onValueChange={(value) => setEpicStatus(value as EpicStatus)}>
              <SelectTrigger id="item-status-epic"><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 'Story':
        return (
          <>
            <div className="grid gap-3">
              <Label htmlFor="item-epic">Parent Epic</Label>
              <Select value={selectedEpicId} onValueChange={setSelectedEpicId} required>
                <SelectTrigger id="item-epic"><SelectValue placeholder="Select parent epic" /></SelectTrigger>
                <SelectContent>
                  {availableEpics.length === 0 && <SelectItem value="" disabled>No epics in project</SelectItem>}
                  {availableEpics.map(epic => (
                    <SelectItem key={epic.id} value={epic.id}>{epic.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="item-status-story">Status</Label>
              <Select value={storyStatus} onValueChange={(value) => setStoryStatus(value as StoryStatus)}>
                <SelectTrigger id="item-status-story"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="item-story-points">Story Points</Label>
              <Input 
                id="item-story-points"
                type="number"
                placeholder="Enter story points"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
              />
            </div>
          </>
        );
      case 'Task':
      case 'Bug':
      case 'Subtask':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                <Label htmlFor="item-parent-epic">Parent Epic (Optional)</Label>
                <Select value={selectedEpicId} onValueChange={setSelectedEpicId}>
                    <SelectTrigger id="item-parent-epic"><SelectValue placeholder="Select parent epic" /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {availableEpics.map(epic => (
                        <SelectItem key={epic.id} value={epic.id}>{epic.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                <div className="grid gap-3">
                <Label htmlFor="item-parent-story">Parent Story (Optional)</Label>
                <Select value={selectedStoryId} onValueChange={setSelectedStoryId} disabled={!selectedEpicId && availableStories.filter(s => !s.epicId).length === 0} >
                    <SelectTrigger id="item-parent-story"><SelectValue placeholder="Select parent story" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {/* Show stories from selected epic, or project-level stories if no epic selected */}
                        {availableStories
                          .filter(story => {
                            if (selectedEpicId) {
                              return story.epicId === selectedEpicId;
                            }
                            return true; // If no epic selected, show all stories
                          })
                          .map(story => (
                            <SelectItem key={story.id} value={story.id}>{story.title}</SelectItem>
                        ))}
                         {availableStories.filter(story => {
                           if (selectedEpicId) {
                             return story.epicId === selectedEpicId;
                           }
                           return true;
                         }).length === 0 && <SelectItem value="" disabled>No stories available</SelectItem>}
                    </SelectContent>
                </Select>
                </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="item-status-task">Status</Label>
              <Select value={taskStatus} onValueChange={(value) => setTaskStatus(value as TaskStatus)}>
                <SelectTrigger id="item-status-task"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                    <Label htmlFor="item-estimated-hours">Estimated Hours</Label>
                    <Input 
                    id="item-estimated-hours"
                    type="number"
                    placeholder="e.g., 4"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                <Label htmlFor="item-due-date">Due Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) resetFormFields();
    }}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>Add a new Epic, Story, Task, Bug, or Subtask to your project.</DialogDescription>
          </DialogHeader>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              {error}
            </div>
          )}

          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Item Type Selector */}
            <div className="grid gap-3">
              <Label htmlFor="item-type">Item Type</Label>
              <Select value={itemType} onValueChange={(value) => setItemType(value as CreatableItemType)}>
                <SelectTrigger id="item-type">
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Epic">Epic</SelectItem>
                  <SelectItem value="Story">Story</SelectItem>
                  <SelectItem value="Task">Task</SelectItem>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Subtask">Subtask</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Project Selector - show if no specific project context or multiple projects */}
            {showProjectSelector && (
              <div className="grid gap-3">
                <Label htmlFor="project">Project</Label>
                <Select 
                  value={selectedProjectId || ""} 
                  onValueChange={setSelectedProjectId}
                  disabled={projects.length === 0 || (projects.length === 1 && !!currentProjectId)} >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Common Fields: Title, Description */}
            <div className="grid gap-3">
              <Label htmlFor="item-title">Title</Label>
              <Input
                id="item-title"
                placeholder={`Enter ${itemType} title`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                placeholder={`Enter ${itemType} description`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Render dynamic fields based on itemType */}
            {renderItemSpecificFields()}
            
            {/* Common fields like Priority, Assignee, Reporter, Labels below item-specific ones */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="item-priority">Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as Task['priority'])}>
                  <SelectTrigger id="item-priority"><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Highest">Highest</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Lowest">Lowest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="item-assignee">Assignee</Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger id="item-assignee"><SelectValue placeholder="Select assignee" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                    <Label htmlFor="item-reporter">Reporter</Label>
                    <Select value={reporterId} onValueChange={setReporterId}>
                        <SelectTrigger id="item-reporter"><SelectValue placeholder="Select reporter" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">None</SelectItem> {/* Or default to current user and make read-only? */}
                            {users.map(user => (
                                <SelectItem key={user.id} value={user.id}>{user.firstName} {user.lastName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="item-labels">Labels <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
                    <Input 
                        id="item-labels"
                        placeholder="e.g., frontend, bug, urgent"
                        value={labels}
                        onChange={(e) => setLabels(e.target.value)}
                    />
                </div>
            </div>

          </div>

          <DialogFooter className="pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !selectedProjectId || !title.trim()}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
              Create {itemType}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 