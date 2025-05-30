"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, List, Kanban, CalendarRange, ChevronDown } from "lucide-react"
import { KanbanBoard } from "@/components/kanban-board"
import { TaskList } from "@/components/task-list"
import { TaskBacklog } from "@/components/task-backlog"
import { TaskGantt } from "@/components/task-gantt"
import { CreateItemDialog, CreatableItemType, ProjectSimple, EpicSimple, StorySimple, TaskSimple, UserSimple } from "@/components/create-item-dialog"
import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { projectApi, taskApi } from "@/lib/api"
import { userApi } from "@/lib/api"

// Define types based on our backend models
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

interface Board {
  id: string;
  name: string;
  projectId: string;
  filterJQL?: string;
}

export default function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewParam = searchParams.get("view")
  
  const [showCreateItemDialog, setShowCreateItemDialog] = useState(false)
  const [createItemType, setCreateItemType] = useState<CreatableItemType>('Task')
  const [createItemDefaults, setCreateItemDefaults] = useState<{[key: string]: any}>({})

  const [view, setView] = useState(viewParam || "board")
  const [searchTerm, setSearchTerm] = useState("")
  
  const [projects, setProjects] = useState<ProjectSimple[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
  
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)

  const [epics, setEpics] = useState<EpicSimple[]>([])
  const [projectStories, setProjectStories] = useState<StorySimple[]>([])
  const [projectTasks, setProjectTasks] = useState<TaskSimple[]>([])
  const [allUsers, setAllUsers] = useState<UserSimple[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true)
      setError(null)
      try {
        // Fetch projects and users in parallel
        const [projectsResponse, usersResponse] = await Promise.all([
          projectApi.getAll(),
          userApi.getAll()
        ]);

        const projectsData = projectsResponse.data || [];
        const usersData = usersResponse.data || [];

        setProjects(projectsData);
        setAllUsers(usersData);

        if (projectsData.length > 0) {
          const projectIdFromUrl = searchParams.get("projectId");
          const initialProjectId = projectIdFromUrl || projectsData[0].id;
          setSelectedProjectId(initialProjectId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch initial data (projects/users):", err);
        setError("Failed to load initial data.");
        setLoading(false);
      }
    }
    fetchInitialData()
  }, [searchParams])

  useEffect(() => {
    if (!selectedProjectId) {
      setBoards([]);
      setEpics([]);
      setProjectStories([]);
      setProjectTasks([]);
      setSelectedBoardId(null);
      setSprints([]);
      setSelectedSprintId(null);
      setLoading(false);
      return;
    }

    async function fetchProjectData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch boards for selected project
        const boardsResponse = await fetch(`/api/projects/${selectedProjectId}/boards`);
        const boardsData = await boardsResponse.json();
        setBoards(boardsData.data || []);

        // Get board ID from URL or use first board
        const boardIdFromUrl = searchParams.get("boardId");
        let currentBoardId = null;
        
        if (boardIdFromUrl && boardsData.data.some((b: Board) => b.id === boardIdFromUrl)) {
          currentBoardId = boardIdFromUrl;
        } else if (boardsData.data && boardsData.data.length > 0) {
          currentBoardId = boardsData.data[0].id;
        }
        
        setSelectedBoardId(currentBoardId);
        
        // Fetch sprints if we have a board
        if (currentBoardId) {
          const sprintsResponse = await fetch(`/api/boards/${currentBoardId}/sprints`);
          const sprintsData = await sprintsResponse.json();
          setSprints(sprintsData.data || []);
          
          // Set selected sprint
          if (sprintsData.data && sprintsData.data.length > 0) {
            // Find active sprint or use first one
            const activeSprintIndex = sprintsData.data.findIndex((s: Sprint) => s.status === 'Active');
            const initialSprintId = activeSprintIndex >= 0 ? sprintsData.data[activeSprintIndex].id : sprintsData.data[0].id;
            setSelectedSprintId(initialSprintId);
          } else {
            setSelectedSprintId(null);
          }
        } else {
          setSprints([]);
          setSelectedSprintId(null);
        }

        // Fetch epics for the project
        const epicsResponse = await fetch(`/api/projects/${selectedProjectId}/epics`);
        const epicsData = await epicsResponse.json();
        setEpics(epicsData.data || []);

        // Fetch stories for the project
        const storiesResponse = await fetch(`/api/projects/${selectedProjectId}/stories`);
        const storiesData = await storiesResponse.json();
        setProjectStories(storiesData.data || []);

        // Fetch tasks for the project
        const tasksResponse = await fetch(`/api/tasks?projectId=${selectedProjectId}`);
        const tasksData = await tasksResponse.json();
        setProjectTasks(tasksData.data || []);
        
      } catch (err) {
        console.error(`Failed to fetch data for project ${selectedProjectId}:`, err);
        setError(`Failed to load project data. Please try again.`);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectData();
  }, [selectedProjectId, searchParams]);

  // Fetch sprints when board changes
  useEffect(() => {
    if (!selectedBoardId) {
      setSprints([]);
      setSelectedSprintId(null);
      return;
    }
    
    async function fetchSprintsForBoard() {
      try {
        setLoading(true);
        const response = await fetch(`/api/boards/${selectedBoardId}/sprints`);
        const data = await response.json();
        const sprintsData = data.data || [];
        setSprints(sprintsData);
        
        if (sprintsData.length > 0) {
          // If current selected sprint is not in this board, select the first one
          if (!sprintsData.find((s: Sprint) => s.id === selectedSprintId)) {
            setSelectedSprintId(sprintsData[0].id);
          }
        } else {
            setSelectedSprintId(null);
        }
      } catch (err) {
        console.error("Failed to fetch sprints:", err);
        setError("Failed to load sprints for the board.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchSprintsForBoard();
  }, [selectedBoardId, selectedSprintId]);

  const handleViewChange = (newView: string) => {
    setView(newView);
    // Update URL with view parameter
    router.push(`/tasks?view=${newView}&projectId=${selectedProjectId || ''}&boardId=${selectedBoardId || ''}`, { scroll: false });
  }

  const handleItemCreated = async (item: TaskSimple | StorySimple | EpicSimple) => {
    // Refresh data after item creation
        if (selectedProjectId) {
                setLoading(true);
      
      try {
        if ('epicId' in item) {
          // It's a story
          const storiesResponse = await fetch(`/api/projects/${selectedProjectId}/stories`);
          const storiesData = await storiesResponse.json();
          setProjectStories(storiesData.data || []);
        } else if ('storyId' in item) {
          // It's a task
          const tasksResponse = await fetch(`/api/tasks?projectId=${selectedProjectId}`);
          const tasksData = await tasksResponse.json();
          setProjectTasks(tasksData.data || []);
        } else {
          // It's an epic
          const epicsResponse = await fetch(`/api/projects/${selectedProjectId}/epics`);
          const epicsData = await epicsResponse.json();
          setEpics(epicsData.data || []);
        }
                } catch (err) {
        console.error("Failed to refresh data after item creation:", err);
                } finally {
                    setLoading(false);
        }
    }
  }
  
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    router.push(`/tasks?view=${view}&projectId=${projectId}`, { scroll: false });
  }

  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    router.push(`/tasks?view=${view}&projectId=${selectedProjectId || ''}&boardId=${boardId}`, { scroll: false });
  }

  const handleSprintChange = (sprintId: string) => {
    setSelectedSprintId(sprintId);
  }

  const handleOpenCreateItemDialog = (type: CreatableItemType, defaults: { epicId?: string, projectId?: string, storyId?: string } = {}) => {
    setCreateItemType(type);
    setCreateItemDefaults({
      ...defaults,
      projectId: defaults.projectId || selectedProjectId || undefined
    });
    setShowCreateItemDialog(true);
  }

  const handleAssignStoryToSprint = async (storyId: string, sprintIdValue: string) => {
    try {
      setLoading(true);
      await fetch(`/api/stories/${storyId}/sprint`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sprintId: sprintIdValue })
      });
      
      // Refresh stories
      const storiesResponse = await fetch(`/api/projects/${selectedProjectId}/stories`);
      const storiesData = await storiesResponse.json();
      setProjectStories(storiesData.data || []);
    } catch (err) {
      console.error("Failed to assign story to sprint:", err);
      setError("Failed to assign story to sprint.");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStoryStatus = async (storyId: string, status: StorySimple['status']) => {
    try {
      setLoading(true);
      await fetch(`/api/stories/${storyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      // Refresh stories
      const storiesResponse = await fetch(`/api/projects/${selectedProjectId}/stories`);
      const storiesData = await storiesResponse.json();
      setProjectStories(storiesData.data || []);
    } catch (err) {
      console.error("Failed to update story status:", err);
      setError("Failed to update story status.");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: TaskSimple['status']) => {
    try {
      setLoading(true);
      await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      // Refresh tasks
      const tasksResponse = await fetch(`/api/tasks?projectId=${selectedProjectId}`);
      const tasksData = await tasksResponse.json();
      setProjectTasks(tasksData.data || []);
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError("Failed to update task status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tasks</h1>
        <Button onClick={() => handleOpenCreateItemDialog('Task')}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200 p-3 text-red-800">
          <p>{error}</p>
        </Card>
      )}

      <div className="flex flex-col lg:flex-row gap-4 bg-muted p-4 rounded-lg">
        <div className="w-full lg:w-1/4">
          <Label htmlFor="project-select" className="text-sm font-medium mb-1.5 block">Project</Label>
          <Select value={selectedProjectId || ''} onValueChange={handleProjectChange}>
            <SelectTrigger id="project-select" className="w-full">
              <SelectValue placeholder="Select project" />
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

        <div className="w-full lg:w-1/4">
          <Label htmlFor="board-select" className="text-sm font-medium mb-1.5 block">Board</Label>
          <Select value={selectedBoardId || ''} onValueChange={handleBoardChange} disabled={!selectedProjectId || boards.length === 0}>
            <SelectTrigger id="board-select" className="w-full">
              <SelectValue placeholder={boards.length === 0 ? "No boards available" : "Select board"} />
                </SelectTrigger>
                <SelectContent>
              {boards.map(board => (
                <SelectItem key={board.id} value={board.id}>
                  {board.name}
                </SelectItem>
              ))}
                </SelectContent>
            </Select>
        </div>

        <div className="w-full lg:w-1/4">
          <Label htmlFor="sprint-select" className="text-sm font-medium mb-1.5 block">Sprint</Label>
          <Select value={selectedSprintId || ''} onValueChange={handleSprintChange} disabled={!selectedBoardId || sprints.length === 0}>
            <SelectTrigger id="sprint-select" className="w-full">
              <SelectValue placeholder={sprints.length === 0 ? "No sprints available" : "Select sprint"} />
              </SelectTrigger>
              <SelectContent>
              {sprints.map(sprint => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  {sprint.name} ({sprint.status})
                </SelectItem>
              ))}
              <SelectItem value="backlog">Backlog</SelectItem>
              </SelectContent>
            </Select>
      </div>

        <div className="w-full lg:w-1/4">
          <Label htmlFor="search-input" className="text-sm font-medium mb-1.5 block">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              id="search-input"
              placeholder="Search tasks..."
              className="w-full pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue={view} value={view} onValueChange={handleViewChange} className="w-full">
        <div className="flex justify-between items-center mb-4">
            <TabsList>
            <TabsTrigger value="board" className="flex items-center gap-1">
              <Kanban className="h-4 w-4" /> Board
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="h-4 w-4" /> List
              </TabsTrigger>
            <TabsTrigger value="backlog" className="flex items-center gap-1">
              <ChevronDown className="h-4 w-4" /> Backlog
              </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-1">
              <CalendarRange className="h-4 w-4" /> Timeline
              </TabsTrigger>
            </TabsList>
          
          <Button variant="outline" size="sm" onClick={() => handleOpenCreateItemDialog('Epic')}>
            <Plus className="h-4 w-4 mr-1" /> New Epic
            </Button>
        </div>

        <TabsContent value="board" className="mt-0">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-lg text-muted-foreground">Board view is being updated to work with the new API. Please check back soon.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
        ) : (
            <TaskList
              projectId={selectedProjectId || ''}
              epics={epics}
              stories={projectStories}
              tasks={projectTasks}
              users={allUsers}
              searchTerm={searchTerm}
              onOpenCreateItemDialog={handleOpenCreateItemDialog}
            />
              )}
        </TabsContent>

        <TabsContent value="backlog" className="mt-0">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
                <TaskBacklog 
              projectId={selectedProjectId || ''}
              selectedSprintId={selectedSprintId}
              sprints={sprints}
                  epics={epics} 
              stories={projectStories}
                  users={allUsers}
              searchTerm={searchTerm}
              onOpenCreateItemDialog={handleOpenCreateItemDialog}
                  onAssignStoryToSprint={handleAssignStoryToSprint}
                  onUpdateStoryStatus={handleUpdateStoryStatus}
                />
              )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-lg text-muted-foreground">Timeline view coming soon</p>
            </div>
              )}
        </TabsContent>
      </Tabs>

      <CreateItemDialog 
        open={showCreateItemDialog} 
        onOpenChange={setShowCreateItemDialog} 
        itemType={createItemType}
        projects={projects}
        epics={epics}
        projectStories={projectStories}
        users={allUsers}
        projectId={selectedProjectId || ""}
        initialDefaults={createItemDefaults}
        onItemCreated={handleItemCreated}
      />
    </div>
  )
}
