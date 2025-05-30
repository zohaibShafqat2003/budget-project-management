"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MoreHorizontal,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  AlertCircle,
  Layers, // Epic icon
  BookOpen, 
  CheckCircle, 
  List as ListIcon, 
  PlusCircle
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
import { CreatableItemType, EpicSimple, StorySimple, TaskSimple, UserSimple } from "./create-item-dialog" 

interface Sprint {
  id: string;
  name: string;
  goal: string;
  boardId: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface TaskBacklogProps {
  projectId: string;
  epics: EpicSimple[];
  stories: StorySimple[]; // These are pre-filtered backlog stories by TasksPage
  sprints: Sprint[];
  selectedSprintId: string | null;
  users: UserSimple[];
  searchTerm?: string; // Make it optional to not break existing uses
  onAssignStoryToSprint: (storyId: string, sprintId: string) => Promise<void>;
  onUpdateStoryStatus: (storyId: string, status: StorySimple['status']) => Promise<void>;
  onOpenCreateItemDialog: (type: CreatableItemType, defaults: { epicId?: string, projectId?: string, storyId?: string }) => void;
}

// Helper for priority display (similar to KanbanBoard, consider moving to utils)
const getPriorityDisplay = (priority: StorySimple['priority'] | TaskSimple['priority']) => {
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

const getItemTypeIcon = (itemType: 'Epic' | 'Story' | 'Task' | 'Bug' | 'Subtask') => {
    switch (itemType) {
      case "Epic": return <Layers className="h-4 w-4 text-purple-500 mr-1" />;
      case "Story": return <BookOpen className="h-4 w-4 text-green-500 mr-1" />;
      // Add other types if we display them directly here in future
      default: return <BookOpen className="h-4 w-4 text-green-500 mr-1" />;
    }
  };

export function TaskBacklog({
  projectId,
  epics,
  stories,
  sprints,
  selectedSprintId,
  users,
  searchTerm,
  onAssignStoryToSprint,
  onUpdateStoryStatus,
  onOpenCreateItemDialog
}: TaskBacklogProps) {
  
  const [sortBy, setSortBy] = useState<"priority" | "id">("priority"); // Default sort

  const storiesWithoutEpic = stories.filter(story => !story.epicId);
  const activeSprints = sprints.filter(s => s.status === 'Active' || s.status === 'Planning');

  const sortStories = (storiesToSort: StorySimple[], sortKey: "priority" | "id") => {
    return [...storiesToSort].sort((a, b) => {
      if (sortKey === "priority") {
        const priorityOrder: Record<StorySimple['priority'], number> = { "Highest": 0, "High": 1, "Medium": 2, "Low": 3, "Lowest": 4 };
        return (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
      }
      return a.id.localeCompare(b.id); // Default sort by ID or title
    });
  };

  const renderStoryCard = (story: StorySimple) => {
    const priorityInfo = getPriorityDisplay(story.priority);
    const assignee = story.assigneeId ? users.find(u => u.id === story.assigneeId) : null;

  return (
      <Card key={story.id} className="mb-2 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
                {getItemTypeIcon('Story')}
                <span className="text-xs text-muted-foreground font-semibold uppercase">{story.id.substring(0,8)}</span>
        </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUpdateStoryStatus(story.id, 'To Do')}>
                  Move to To Do
                </DropdownMenuItem>
                {activeSprints.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Assign to Sprint</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {activeSprints.map(sprint => (
                          <DropdownMenuItem 
                            key={sprint.id} 
                            onClick={() => onAssignStoryToSprint(story.id, sprint.id)}
                            disabled={story.sprintId === sprint.id} // Disable if already in this sprint
                          >
                            {sprint.name} ({sprint.status})
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onOpenCreateItemDialog('Task', { projectId, storyId: story.id }) }>
                    Add Task/Bug to Story
                </DropdownMenuItem>
                {/* TODO: Edit Story, Delete Story */}
              </DropdownMenuContent>
            </DropdownMenu>
                                </div>
          <CardTitle className="text-sm font-medium mt-1 leading-tight">{story.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {story.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{story.description}</p>}
          <div className="flex items-center justify-between text-xs">
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
          <div className="flex items-center justify-end mt-2">
            {assignee && (
                                      <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                    {`${assignee.firstName[0]}${assignee.lastName[0]}`}
                    </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
        </CardContent>
      </Card>
    );
  };

  if (!projectId) {
    return <div className="text-center py-10"><p className="text-lg text-muted-foreground">Select a project to see its backlog.</p></div>;
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Project Backlog</h2>
            <Button variant="outline" size="sm" onClick={() => onOpenCreateItemDialog('Story', { projectId }) }>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Story to Project
          </Button>
        </div>

      {epics.length > 0 && (
        <Accordion type="multiple" className="w-full space-y-3">
          {epics.map(epic => {
            const storiesInEpic = sortStories(stories.filter(story => story.epicId === epic.id), sortBy);
            return (
              <AccordionItem value={epic.id} key={epic.id} className="bg-muted/30 rounded-lg border px-1">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                        {getItemTypeIcon('Epic')}
                        <span className="font-medium text-base mr-2">{epic.name}</span>
                        <Badge variant={epic.status === 'Done' ? "secondary" : "outline"}>{epic.status}</Badge>
                  </div>
                    <span className="text-sm text-muted-foreground mr-4">{storiesInEpic.length} storie{storiesInEpic.length !== 1 ? 's' : ''}</span>
                </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                    className="mb-3 w-full" 
                    onClick={() => onOpenCreateItemDialog('Story', { epicId: epic.id, projectId })}
                        >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Story to Epic: {epic.name}
                        </Button>
                  {storiesInEpic.length > 0 ? (
                    storiesInEpic.map(renderStoryCard)
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No backlog stories in this epic.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
      
      {storiesWithoutEpic.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Other Backlog Stories</h3>
          {sortStories(storiesWithoutEpic, sortBy).map(renderStoryCard)}
                    </div>
                  )}

      {epics.length === 0 && storiesWithoutEpic.length === 0 && (
         <Card className="mt-4">
            <CardContent className="pt-6 text-center text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-semibold">The Backlog is Empty</h3>
                <p className="text-sm mt-1">Create Epics or add Stories to start planning your project.</p>
                <Button className="mt-4" onClick={() => onOpenCreateItemDialog('Epic', { projectId }) }>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Epic
                </Button>
              </CardContent>
            </Card>
      )}
            </div>
  );
}
