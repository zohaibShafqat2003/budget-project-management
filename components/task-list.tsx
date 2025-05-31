"use client"

import { useState } from "react";
import { Epic, Story, Task, User } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Layers, // Epic icon
  BookOpen, // Story icon
  CheckSquare, // Task icon
  AlertCircle, // Bug icon
  ArrowUp,
  ArrowRight,
  ArrowDown,
  PlusCircle,
  List as ListIcon // Subtask icon (example)
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { CreatableItemType } from "./create-item-dialog";
import React from "react"; // Import React for React.ReactNode

interface TaskListProps {
  projectId: string;
  epics: Epic[];
  stories: Story[];
  tasks: Task[];
  users: User[];
  searchTerm: string;
  onOpenCreateItemDialog: (type: CreatableItemType, defaults: { projectId?: string, epicId?: string, storyId?: string }) => void;
}

// Helper for priority display
const getPriorityDisplay = (priority: Story['priority'] | Task['priority']) => {
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

// Helper for item type icon
const getItemTypeIcon = (itemType: CreatableItemType | 'Epic') => {
    switch (itemType) {
      case "Epic": return <Layers className="h-4 w-4 text-purple-500 mr-2" />;
      case "Story": return <BookOpen className="h-4 w-4 text-green-500 mr-2" />;
      case "Task": return <CheckSquare className="h-4 w-4 text-blue-500 mr-2" />;
      case "Bug": return <AlertCircle className="h-4 w-4 text-red-500 mr-2" />;
      case "Subtask": return <ListIcon className="h-4 w-4 text-sky-500 mr-2" />;
      default: return <CheckSquare className="h-4 w-4 text-gray-500 mr-2" />;
    }
  };


export function TaskList({ 
  projectId, 
  epics = [], 
  stories = [], 
  tasks = [], 
  users = [], 
  searchTerm = "",
  onOpenCreateItemDialog 
}: TaskListProps) {
  
  const [filterType, setFilterType] = useState<CreatableItemType | 'All' | 'Epic'>('All');

  const combinedItems = [
    ...epics.map(e => ({ ...e, itemType: 'Epic' as const, title: e.name })),
    ...stories.map(s => ({ ...s, itemType: 'Story' as const })),
    ...tasks.map(t => ({ ...t, itemType: t.type as 'Task' | 'Bug' | 'Subtask' })),
  ];

  const filteredItems = combinedItems.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (
      item.title.toLowerCase().includes(searchTermLower) ||
      (item.description && item.description.toLowerCase().includes(searchTermLower)) ||
      item.id.toLowerCase().includes(searchTermLower)
    );

    let typeMatchesFilter = false;
    if (filterType === 'All') {
      typeMatchesFilter = true;
    } else if (filterType === 'Epic' && item.itemType === 'Epic') {
      typeMatchesFilter = true;
    } else if (filterType === 'Story' && item.itemType === 'Story') {
      typeMatchesFilter = true;
    } else if (['Task', 'Bug', 'Subtask'].includes(filterType) && item.itemType === filterType) {
      typeMatchesFilter = true;
    } else if (filterType === 'Task' && (item.itemType === 'Task' || item.itemType === 'Bug' || item.itemType === 'Subtask')) {
      // Special case for 'Task' filter to include Task, Bug, Subtask
      typeMatchesFilter = true;
    }
    
    return matchesSearch && typeMatchesFilter;
  });

  const getAssignee = (assigneeId?: string) => users.find(u => u.id === assigneeId);

  const renderItemCard = (item: any) => {
    const assignee = item.assigneeId ? getAssignee(item.assigneeId) : null;
    const priorityInfo = item.priority ? getPriorityDisplay(item.priority) : null;
    const itemIcon = getItemTypeIcon(item.itemType);

    return (
      <Card key={item.id} className="mb-3 shadow-sm hover:shadow-md transition-shadow bg-card">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {itemIcon}
              <span className="text-xs text-muted-foreground font-semibold uppercase mr-2">{item.id.substring(0,8)}</span>
              <Badge variant="outline" className="text-xs font-medium">{item.itemType === 'Epic' ? 'Epic' : item.itemType}</Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => console.log('Edit item (not implemented)', item.id)}>Edit</DropdownMenuItem>
                {item.itemType === 'Epic' && (
                  <DropdownMenuItem onClick={() => onOpenCreateItemDialog('Story', { projectId, epicId: item.id })}>
                    Add Story to Epic
                  </DropdownMenuItem>
                )}
                {item.itemType === 'Story' && (
                  <DropdownMenuItem onClick={() => onOpenCreateItemDialog('Task', { projectId, storyId: item.id })}>
                    Add Task/Bug to Story
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log('Delete item (not implemented)', item.id)} className="text-destructive hover:!text-destructive/90">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-base font-medium mt-1 leading-tight">
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Status: <Badge variant={item.status === 'Done' || item.status === 'Closed' ? "success" : "secondary"} className="text-xs px-1.5 py-0.5">{item.status}</Badge></span>
            {item.itemType === 'Story' && item.points != null && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {item.points} SP
              </Badge>
            )}
            { (item.itemType === 'Task' || item.itemType === 'Bug' || item.itemType === 'Subtask') && item.estimatedHours != null && (
               <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {item.estimatedHours} hrs
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            {priorityInfo && (
              <Badge variant="outline" className={`px-1.5 py-0.5 text-white ${priorityInfo.color} border-transparent text-xs`}>
                <span className="flex items-center gap-1">
                    {priorityInfo.icon} {priorityInfo.name}
                </span>
              </Badge>
            )}
            {assignee && (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                        {`${assignee.firstName[0]}${assignee.lastName[0]}`}
                        </AvatarFallback>
                    </Avatar>
                    <span>{assignee.firstName} {assignee.lastName[0]}.</span>
                </div>
            )}
          </div>

          {(item.itemType === 'Story' && item.epicId) && (
            <div className="text-xs text-muted-foreground mt-1.5">
              Part of Epic: <span className="font-medium text-foreground">{epics.find(e => e.id === item.epicId)?.name || item.epicId.substring(0,8)}</span>
            </div>
          )}
           {( (item.itemType === 'Task' || item.itemType === 'Bug' || item.itemType === 'Subtask') && item.storyId) && (
            <div className="text-xs text-muted-foreground mt-1.5">
              Part of Story: <span className="font-medium text-foreground">{stories.find(s => s.id === item.storyId)?.title || item.storyId.substring(0,8)}</span>
            </div>
          )}
           {( (item.itemType === 'Task' || item.itemType === 'Bug' || item.itemType === 'Subtask') && !item.storyId && item.epicId) && (
            <div className="text-xs text-muted-foreground mt-1.5">
              Part of Epic: <span className="font-medium text-foreground">{epics.find(e => e.id === item.epicId)?.name || item.epicId.substring(0,8)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!projectId) {
    // This is already handled by the parent TasksPage, but as a safeguard:
    return <div className="text-center py-10"><p className="text-lg text-muted-foreground">Please select a project to view items.</p></div>;
  }

  return (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
            <div className="flex gap-1.5">
                {(['All', 'Epic', 'Story', 'Task'] as const).map(type => (
                    <Button 
                        key={type} 
                        variant={filterType === type ? "secondary" : "ghost"} 
                        size="sm" 
                        onClick={() => setFilterType(type)}
                        className="text-xs sm:text-sm px-2 sm:px-3 py-1 h-auto"
                    >
                        {type === 'Task' ? 'Tasks/Bugs' : type} 
                        ({type === 'All' ? combinedItems.length :
                          type === 'Epic' ? epics.length :
                          type === 'Story' ? stories.length :
                          tasks.length}
                        )
                    </Button>
                ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => onOpenCreateItemDialog('Task', { projectId }) } className="ml-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
        </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(renderItemCard)}
        </div>
      ) : (
        <Card className="mt-4 col-span-full">
          <CardContent className="pt-10 pb-10 text-center text-muted-foreground">
            <Layers className="mx-auto h-12 w-12 text-gray-400 mb-3" /> 
            <h3 className="text-lg font-semibold">No items found</h3>
            <p className="text-sm mt-1">
              {searchTerm ? "Try adjusting your search or filter." : (filterType !== 'All' ? `No ${filterType.toLowerCase()}s match your criteria.` : "This project has no items yet.")}
            </p>
            {!searchTerm && (
                 <Button className="mt-4" onClick={() => onOpenCreateItemDialog(filterType !== 'All' && filterType !=='Task' ? filterType : 'Task', { projectId }) }>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add {filterType !== 'All' && filterType !=='Task' ? filterType : 'Item'}
                </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
