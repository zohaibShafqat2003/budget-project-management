"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Edit,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Trash2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  BarChart2,
  BookOpen,
  List as ListIcon,
  Layers
} from "lucide-react"
import {
  Story, 
  Task, 
  User, 
  Epic,
  getStoriesByProject, 
  getTasks, 
  updateStory,
  deleteStory,
} from "@/lib/db"
import React from "react"
import { CreatableItemType, EpicSimple, StorySimple, TaskSimple, UserSimple } from "./create-item-dialog"

interface KanbanBoardProps {
  projectId: string;
  sprintId: string;
  epics: EpicSimple[];
  stories: StorySimple[];
  tasks: TaskSimple[];
  users: UserSimple[];
  onCreateItem: (type: CreatableItemType, defaults?: { epicId?: string, projectId?: string, storyId?: string }) => void;
  onUpdateStoryStatus: (storyId: string, status: string) => Promise<void>;
  onUpdateTaskStatus: (taskId: string, status: string) => Promise<void>;
}

// Enhance the StorySimple and TaskSimple interfaces with assignee information
interface EnhancedStory extends StorySimple {
  tasks: EnhancedTask[];
  assignee?: UserSimple;
}

interface EnhancedTask extends TaskSimple {
  assignee?: UserSimple;
}

// Column type definition
type Column = {
  id: string; // Columns are based on Story statuses
  title: string;
  stories: EnhancedStory[];
}

const JIRA_STATUS_ORDER = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done', 'Blocked'];

export function KanbanBoard({ projectId, sprintId, epics, stories, tasks, users, onCreateItem, onUpdateStoryStatus, onUpdateTaskStatus }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([])
  const [selectedStory, setSelectedStory] = useState<EnhancedStory | null>(null)
  const [storyDetailOpen, setStoryDetailOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId || !sprintId) {
      setLoading(false);
      setColumns([]);
      return;
    }

    // Function to organize stories and tasks into columns
    function organizeData() {
      setLoading(true);
      setError(null);
      
      try {
        // Filter stories by sprint if sprintId is provided
        const sprintStories = sprintId === 'backlog' 
          ? stories.filter(s => !s.sprintId) 
          : stories.filter(s => s.sprintId === sprintId);
        
        // Enhance stories with assignee info and their tasks
        const enhancedStories: EnhancedStory[] = sprintStories.map(story => {
          // Find tasks for this story
          const storyTasks = tasks
            .filter(t => t.storyId === story.id)
            .map(task => {
              // Add assignee info to tasks
              const assignee = task.assigneeId ? users.find(u => u.id === task.assigneeId) : undefined;
              return { ...task, assignee };
            });
          
          // Add assignee info to story
          const assignee = story.assigneeId ? users.find(u => u.id === story.assigneeId) : undefined;
          
          return {
            ...story,
            tasks: storyTasks,
            assignee
          };
        });

        // Group stories by status
        const storiesByStatus = enhancedStories.reduce((acc, story) => {
          const status = story.status;
          if (!acc[status]) {
            acc[status] = [];
          }
          acc[status].push(story);
          return acc;
        }, {} as Record<string, EnhancedStory[]>);

        // Create columns for each status
        const newColumns: Column[] = JIRA_STATUS_ORDER.map(statusKey => ({
          id: statusKey,
          title: statusKey.replace(/([A-Z])/g, ' $1').trim(), // Add space before caps for title
          stories: storiesByStatus[statusKey] || [],
        }));
        
        setColumns(newColumns);
      } catch (err) {
        console.error("Error organizing board data:", err);
        setError(`Failed to organize board data. ${err instanceof Error ? err.message : ''}`);
      } finally {
        setLoading(false);
      }
    }
    
    organizeData();
  }, [projectId, sprintId, stories, tasks, users]);

  const handleOpenStoryDetail = (story: EnhancedStory) => {
    setSelectedStory(story);
    setStoryDetailOpen(true);
  };
  
  const handleMoveStory = async (storyId: string, newStatus: string) => {
    let originalColumns: Column[] = []; // Define originalColumns here for potential rollback
    try {
      // Find the story across all columns
      let storyToMove: EnhancedStory | undefined;
      for (const col of columns) {
        storyToMove = col.stories.find(s => s.id === storyId);
        if (storyToMove) break;
      }

      if (!storyToMove) return;
      
      originalColumns = JSON.parse(JSON.stringify(columns)); // Deep copy for rollback
      
      setColumns(prevColumns => {
        const updatedColumns = prevColumns.map(col => ({
          ...col,
          stories: col.stories.filter(s => s.id !== storyId)
        }));
        
        const targetColumn = updatedColumns.find(col => col.id === newStatus);
        if (targetColumn) {
          targetColumn.stories.push({ ...storyToMove, status: newStatus });
          targetColumn.stories.sort((a,b) => (a.priority || 'Z').localeCompare(b.priority || 'Z')); 
        }
        return updatedColumns;
      });

      // Call the provided onUpdateStoryStatus function
      await onUpdateStoryStatus(storyId, newStatus);

    } catch (error) {
      console.error("Failed to move story:", error);
      setError("Failed to move story. Changes may not have been saved.");
      // Rollback if API call fails
      if(originalColumns.length > 0) setColumns(originalColumns);
      else alert("Failed to move story and rollback failed. Please refresh.");
    }
  };
  
  const handleDeleteStory = async (storyId: string) => {
    // Would need a deleteStory method from props
    alert("Delete functionality not implemented yet");
  };

  // Icon and color utility functions
  const getPriorityDisplay = (priority: string) => {
    const colors: Record<string, string> = {
      Highest: "bg-red-600", High: "bg-orange-500", Medium: "bg-yellow-500", Low: "bg-green-500", Lowest: "bg-blue-400",
    };
    const icons: Record<string, React.ReactNode> = {
      Highest: <ArrowUp className="h-3 w-3" />, High: <ArrowUp className="h-3 w-3" />,
      Medium: <ArrowRight className="h-3 w-3" />, Low: <ArrowDown className="h-3 w-3" />,
      Lowest: <ArrowDown className="h-3 w-3" />,
    };
    return {
      color: colors[priority] || "bg-gray-500",
      icon: icons[priority] || <ArrowRight className="h-3 w-3" />,
      name: priority
    };
  };
  
  const getItemTypeIcon = (itemType: string) => {
    switch(itemType) {
      case "Epic":
        return <Layers className="h-4 w-4 text-purple-500 mr-1" />;
      case "Story":
        return <BookOpen className="h-4 w-4 text-green-500 mr-1" />;
      case "Task":
        return <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />;
      case "Bug":
        return <AlertCircle className="h-4 w-4 text-red-500 mr-1" />;
      case "Subtask":
        return <ListIcon className="h-4 w-4 text-gray-500 mr-1" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>;
  }
  
  if (!sprintId) {
    return <div className="text-center py-10"><p className="text-lg text-muted-foreground">Please select a sprint to view its board.</p></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
          <div className="flex items-center justify-between mb-2 p-1 bg-muted rounded-t-lg">
            <h3 className="font-medium text-sm px-2">
              {column.title}{column.stories.length > 0 ? ` (${column.stories.length})` : ''}
              </h3>
            {/* Add button for creating new stories in this status */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onCreateItem('Story', { projectId })}
              >
                <Plus className="h-4 w-4" />
              <span className="sr-only">Add item</span>
              </Button>
            </div>
          <div className="flex-1 bg-muted/20 rounded-b-lg p-2 space-y-2 min-h-[300px]">
            {column.stories.map((story) => {
              const priorityInfo = getPriorityDisplay(story.priority);
              return (
                <Card
                  key={story.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow bg-card"
                  onClick={() => handleOpenStoryDetail(story)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {getItemTypeIcon("Story")}
                            <span className="text-xs text-muted-foreground font-semibold">{story.id.substring(0,8)}</span>
                        </div>
                        {story.assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {`${story.assignee.firstName[0]}${story.assignee.lastName[0]}`}
                            </AvatarFallback>
                          </Avatar>
                        )}
                    </div>
                    <h4 className="font-semibold text-sm line-clamp-2 leading-tight">{story.title}</h4>
                    
                    <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className={`px-1.5 py-0.5 text-white ${priorityInfo.color} border-transparent`}>
                            <span className="flex items-center gap-1">
                                {priorityInfo.icon} {priorityInfo.name}
                            </span>
                        </Badge>
                        {story.points && (
                          <Badge variant="secondary" className="px-1.5 py-0.5">
                            {story.points} SP
                          </Badge>
                        )}
                    </div>

                    {story.tasks && story.tasks.length > 0 && (
                        <div className="text-xs text-muted-foreground pt-1">
                           {story.tasks.length} task{story.tasks.length > 1 ? 's' : ''}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-end pt-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-3 w-3" />
                            <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Story Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Edit action */ handleOpenStoryDetail(story); }}>
                            <Edit className="mr-2 h-4 w-4" /> View/Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          <DropdownMenuLabel>Move Story To</DropdownMenuLabel>
                          {JIRA_STATUS_ORDER.filter(status => status !== column.id).map((status) => (
                            <DropdownMenuItem key={status} onClick={(e) => { e.stopPropagation(); handleMoveStory(story.id, status); }}>
                              {status.replace(/([A-Z])/g, ' $1').trim()}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Story
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {column.stories.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-4">
                    No stories in {column.title.toLowerCase()}.
                </div>
              )}
            </div>
          </div>
        ))}

      {/* Story Detail Dialog */}
      {selectedStory && (
        <Dialog open={storyDetailOpen} onOpenChange={setStoryDetailOpen}>
          <DialogContent className="max-w-3xl">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                {getItemTypeIcon("Story")}
                <span className="text-sm text-muted-foreground">
                  {selectedStory.id.substring(0,8)}
                </span>
                </div>
              <DialogTitle className="text-xl">{selectedStory.title}</DialogTitle>
              </DialogHeader>
            <div className="grid grid-cols-3 gap-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className="col-span-2 space-y-4">
                    <div>
                  <h4 className="text-sm font-medium mb-1 text-muted-foreground">Description</h4>
                  <p className="text-sm min-h-[40px]">
                    {selectedStory.description || "No description provided."}
                      </p>
                    </div>

                    <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Tasks ({selectedStory.tasks.length})</h4>
                  {selectedStory.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStory.tasks.map(task => {
                        const taskPriority = getPriorityDisplay(task.priority);
                        return (
                          <Card key={task.id} className="bg-muted/50">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                  {getItemTypeIcon(task.type)}
                                  <span className="font-medium text-sm">{task.title}</span>
                                </div>
                                <Badge variant="outline" className={`ml-2 ${taskPriority.color} text-white border-transparent`}>
                                  {taskPriority.icon} {taskPriority.name}
                                </Badge>
                              </div>
                              {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                              <div className="flex items-center justify-between mt-2 text-xs">
                                <span className="text-muted-foreground">{task.status}</span>
                                {task.assignee && (
                                   <div className="flex items-center gap-1">
                                    <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-xs">{`${task.assignee.firstName[0]}${task.assignee.lastName[0]}`}</AvatarFallback>
                            </Avatar>
                                    <span>{`${task.assignee.firstName} ${task.assignee.lastName}`}</span>
                                </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tasks for this story.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline">{selectedStory.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority</span>
                      <Badge variant="outline" className={`flex items-center gap-1 ${getPriorityDisplay(selectedStory.priority).color} text-white border-transparent`}>
                        {getPriorityDisplay(selectedStory.priority).icon} {selectedStory.priority}
                      </Badge>
                    </div>
                    {selectedStory.assignee && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assignee</span>
                        <span>{selectedStory.assignee.firstName} {selectedStory.assignee.lastName}</span>
                      </div>
                    )}
                    {selectedStory.points && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Story Points</span>
                        <span>{selectedStory.points}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}