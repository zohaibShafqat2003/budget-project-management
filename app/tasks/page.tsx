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
import { projectApi, userApi } from "@/lib/api"
import { tasksApi } from "@/lib/api/tasks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

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

// Ensure we're using the correct status types
const STATUS_VALUES = {
  STORY: ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done', 'Blocked'] as const,
  TASK: ['Backlog', 'To Do', 'In Progress', 'In Review', 'Done', 'Blocked'] as const
}

type StoryStatus = typeof STATUS_VALUES.STORY[number];
type TaskStatus = typeof STATUS_VALUES.TASK[number];

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
        // Fetch projects 
        const projectsData = await projectApi.getAll();
        
        // Fetch users
        const usersData = await userApi.getAll();
        
        setProjects(Array.isArray(projectsData) ? projectsData : (projectsData?.data || []));
        setAllUsers(Array.isArray(usersData) ? usersData : (usersData?.data || []));

        if (projectsData && (Array.isArray(projectsData) ? projectsData.length > 0 : (projectsData?.data?.length > 0))) {
          const projectItems = Array.isArray(projectsData) ? projectsData : (projectsData?.data || []);
          const projectIdFromUrl = searchParams.get("projectId");
          const initialProjectId = projectIdFromUrl || (projectItems[0]?.id);
          setSelectedProjectId(initialProjectId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch initial data (projects/users):", err);
        setError("Failed to load projects and users. Please check your network connection and try again.");
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
        if (!boardsResponse.ok) {
          throw new Error(`Failed to fetch boards: ${boardsResponse.status}`);
        }
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
          if (!sprintsResponse.ok) {
            console.warn(`Failed to fetch sprints: ${sprintsResponse.status}`);
            // Continue without sprints
          } else {
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
          }
        } else {
          setSprints([]);
          setSelectedSprintId(null);
        }

        // Fetch epics for the project
        const epicsResponse = await fetch(`/api/projects/${selectedProjectId}/epics`);
        if (!epicsResponse.ok) {
          console.warn(`Failed to fetch epics: ${epicsResponse.status}`);
          setEpics([]);
        } else {
          const epicsData = await epicsResponse.json();
          setEpics(epicsData.data || []);
        }

        // Fetch stories for the project
        const storiesResponse = await fetch(`/api/projects/${selectedProjectId}/stories`);
        if (!storiesResponse.ok) {
          console.warn(`Failed to fetch stories: ${storiesResponse.status}`);
          setProjectStories([]);
        } else {
          const storiesData = await storiesResponse.json();
          setProjectStories(storiesData.data || []);
        }

        // Fetch tasks for the project using the tasksApi
        const tasksData = await tasksApi.getByProject(selectedProjectId);
        setProjectTasks(tasksData || []);
        
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
        if (!response.ok) {
          throw new Error(`Failed to fetch sprints: ${response.status}`);
        }
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
          if (!storiesResponse.ok) {
            throw new Error(`Failed to refresh stories: ${storiesResponse.status}`);
          }
          const storiesData = await storiesResponse.json();
          setProjectStories(storiesData.data || []);
        } else if ('storyId' in item) {
          // It's a task - use the tasksApi
          const tasksData = await tasksApi.getByProject(selectedProjectId);
          setProjectTasks(tasksData || []);
        } else {
          // It's an epic
          const epicsResponse = await fetch(`/api/projects/${selectedProjectId}/epics`);
          if (!epicsResponse.ok) {
            throw new Error(`Failed to refresh epics: ${epicsResponse.status}`);
          }
          const epicsData = await epicsResponse.json();
          setEpics(epicsData.data || []);
        }
      } catch (err) {
        console.error("Failed to refresh data after item creation:", err);
        setError("Failed to refresh data after creating the item.");
      } finally {
        setLoading(false);
      }
    }
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
    setCreateItemDefaults({ ...defaults, projectId: defaults.projectId || selectedProjectId });
    setShowCreateItemDialog(true);
  }

  const handleAssignStoryToSprint = async (storyId: string, sprintIdValue: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/sprint`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sprintId: sprintIdValue }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to assign story to sprint: ${response.status}`);
      }
      
      // Refresh the story list after assignment
      const storiesResponse = await fetch(`/api/projects/${selectedProjectId}/stories`);
      if (!storiesResponse.ok) {
        throw new Error(`Failed to refresh stories: ${storiesResponse.status}`);
      }
      const storiesData = await storiesResponse.json();
      setProjectStories(storiesData.data || []);
    } catch (err) {
      console.error("Failed to assign story to sprint:", err);
      setError("Failed to assign story to sprint.");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStoryStatus = async (storyId: string, status: StoryStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stories/${storyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update story status: ${response.status}`);
      }
      
      // Update the local state
      setProjectStories(prevStories => 
        prevStories.map(story => 
          story.id === storyId ? { ...story, status } : story
        )
      );
    } catch (err) {
      console.error("Failed to update story status:", err);
      setError("Failed to update story status.");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: TaskSimple['status']) => {
    setLoading(true);
    try {
      // Use tasksApi to update task status
      const updatedTask = await tasksApi.updateStatus(taskId, status);
      
      if (!updatedTask) {
        throw new Error('Failed to update task status: No response from API');
      }
      
      // Update the local state
      setProjectTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError("Failed to update task status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex-1 flex-col space-y-4 p-4 md:p-8 flex">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Task Management</h2>
          <p className="text-muted-foreground">
            Manage, track, and organize your project tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="hidden md:flex"
            onClick={() => handleOpenCreateItemDialog('Task')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
          <Button 
            variant="default" 
            className="md:hidden" 
            size="icon"
            onClick={() => handleOpenCreateItemDialog('Task')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex-1 space-y-1">
            <Label htmlFor="projectSelect">Project</Label>
            <Select
              value={selectedProjectId || ''}
              onValueChange={(value) => {
                setSelectedProjectId(value);
                router.push(`/tasks?view=${view}&projectId=${value}`, { scroll: false });
              }}
              disabled={loading}
            >
              <SelectTrigger id="projectSelect" className="w-full md:w-[200px]">
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
          
          {boards.length > 0 && (
            <div className="flex-1 space-y-1">
              <Label htmlFor="boardSelect">Board</Label>
              <Select
                value={selectedBoardId || ''}
                onValueChange={handleBoardChange}
                disabled={loading}
              >
                <SelectTrigger id="boardSelect" className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {sprints.length > 0 && (
            <div className="flex-1 space-y-1">
              <Label htmlFor="sprintSelect">Sprint</Label>
              <Select
                value={selectedSprintId || ''}
                onValueChange={handleSprintChange}
                disabled={loading}
              >
                <SelectTrigger id="sprintSelect" className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Tabs defaultValue={view} className="w-fit" onValueChange={handleViewChange}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="board">
                  <Kanban className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Board</span>
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">List</span>
                </TabsTrigger>
                <TabsTrigger value="backlog">
                  <Filter className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Backlog</span>
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <CalendarRange className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Timeline</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <Card className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </Card>
        ) : (
          <>
            {view === "board" && (
              <KanbanBoard
                projectId={selectedProjectId || ''}
                sprintId={selectedSprintId}
                epics={epics}
                stories={projectStories}
                tasks={projectTasks}
                users={allUsers}
                searchTerm={searchTerm}
                onOpenCreateItemDialog={handleOpenCreateItemDialog}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onUpdateStoryStatus={handleUpdateStoryStatus}
              />
            )}

            {view === "list" && (
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

            {view === "backlog" && (
              <TaskBacklog
                projectId={selectedProjectId || ''}
                epics={epics}
                stories={projectStories}
                users={allUsers}
                sprints={sprints}
                selectedSprintId={selectedSprintId}
                searchTerm={searchTerm}
                onOpenCreateItemDialog={handleOpenCreateItemDialog}
                onAssignStoryToSprint={handleAssignStoryToSprint}
                onUpdateStoryStatus={handleUpdateStoryStatus}
              />
            )}

            {view === "timeline" && (
              <TaskGantt />
            )}
          </>
        )}
      </div>

      <CreateItemDialog
        open={showCreateItemDialog}
        onOpenChange={setShowCreateItemDialog}
        onItemCreated={handleItemCreated}
        projectId={selectedProjectId}
        sprintId={selectedSprintId}
        projects={projects}
        epics={epics}
        projectStories={projectStories}
        users={allUsers}
        itemType={createItemType}
        initialDefaults={createItemDefaults}
      />
    </div>
  )
}
