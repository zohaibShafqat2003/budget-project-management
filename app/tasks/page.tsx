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
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Project,
  Board,
  Sprint,
  Epic,
  Story,
  Task,
  User,
  getProjects,
  getBoardsByProject,
  getSprintsByBoard,
  getEpicsByProject,
  getStoriesByProject,
  getTasks,
  getUsers,
  assignStoryToSprint,
  updateStory,
} from "@/lib/db"
import { Label } from "@/components/ui/label"
import { CreateItemDialog, CreatableItemType } from "@/components/create-item-dialog"

export default function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewParam = searchParams.get("view")
  
  const [showCreateItemDialog, setShowCreateItemDialog] = useState(false)
  const [createItemType, setCreateItemType] = useState<CreatableItemType>('Task')
  const [createItemDefaults, setCreateItemDefaults] = useState<{[key: string]: any}>({})

  const [view, setView] = useState(viewParam || "board")
  const [searchTerm, setSearchTerm] = useState("")
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
  
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)

  const [epics, setEpics] = useState<Epic[]>([])
  const [projectStories, setProjectStories] = useState<Story[]>([])
  const [projectTasks, setProjectTasks] = useState<Task[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true)
      setError(null)
      try {
        const [projectsData, usersData] = await Promise.all([
          getProjects(),
          getUsers()
        ]);

        setProjects(projectsData);
        setAllUsers(usersData);

        if (projectsData.length > 0) {
          const currentProjectId = projectsData[0].id;
          setSelectedProjectId(currentProjectId)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error("Failed to fetch initial data (projects/users):", err)
        setError("Failed to load initial data.")
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!selectedProjectId) {
      setBoards([])
      setEpics([])
      setProjectStories([])
      setProjectTasks([])
      setSelectedBoardId(null)
      setSprints([])
      setSelectedSprintId(null)
      setLoading(false)
      return;
    }

    async function fetchProjectData() {
      setLoading(true)
      setError(null)
      try {
        const boardsData = await getBoardsByProject(selectedProjectId!)
        setBoards(boardsData)
        if (boardsData.length > 0) {
          const currentBoardId = boardsData[0].id;
          setSelectedBoardId(currentBoardId) 
          const sprintsData = await getSprintsByBoard(selectedProjectId!, currentBoardId)
          setSprints(sprintsData)
          if(sprintsData.length > 0) setSelectedSprintId(sprintsData[0].id); else setSelectedSprintId(null);
        } else {
          setSelectedBoardId(null)
          setSprints([])
          setSelectedSprintId(null)
        }

        const epicsData = await getEpicsByProject(selectedProjectId!)
        setEpics(epicsData)

        const storiesData = await getStoriesByProject(selectedProjectId!)
        setProjectStories(storiesData)

        const tasksData = await getTasks({ projectId: selectedProjectId! })
        setProjectTasks(tasksData)
        
      } catch (err) {
        console.error(`Failed to fetch data for project ${selectedProjectId}:`, err)
        setError(`Failed to load data for project. ${err instanceof Error ? err.message : ''}`)
      } finally {
        setLoading(false)
      }
    }
    fetchProjectData()
  }, [selectedProjectId])

  useEffect(() => {
    if (!selectedBoardId || !selectedProjectId) {
      setSprints([])
      setSelectedSprintId(null)
      return;
    }
    async function fetchSprintsForBoard() {
      try {
        setLoading(true);
        const sprintsData = await getSprintsByBoard(selectedProjectId!, selectedBoardId!)
        setSprints(sprintsData)
        if(sprintsData.length > 0 && !sprints.find(s => s.id === selectedSprintId)) {
            setSelectedSprintId(sprintsData[0].id);
        } else if (sprintsData.length === 0) {
            setSelectedSprintId(null);
        }
      } catch (err) {
        console.error("Failed to fetch sprints:", err)
        setError("Failed to load sprints for the board.")
      } finally {
        setLoading(false);
      }
    }
    fetchSprintsForBoard()
  }, [selectedBoardId, selectedProjectId]);

  const handleViewChange = (newView: string) => {
    setView(newView)
    router.push(`/tasks?view=${newView}&projectId=${selectedProjectId || ''}&boardId=${selectedBoardId || ''}`, { scroll: false })
  }

  const handleItemCreated = (item: Task | Story | Epic) => {
    if (item.hasOwnProperty('epicId') && item.hasOwnProperty('points')) {
      setProjectStories(prev => [...prev, item as Story]);
    } else if (item.hasOwnProperty('type') && ['Task', 'Bug', 'Subtask'].includes((item as Task).type)) {
      setProjectTasks(prev => [...prev, item as Task]);
    } else if (!item.hasOwnProperty('epicId') && !item.hasOwnProperty('storyId')) {
        if (item.hasOwnProperty('name')) {
            setEpics(prev => [...prev, item as Epic]);
        }
    } else {
        if (selectedProjectId) {
            console.warn("Unknown item type created, re-fetching project data for consistency", item);
             async function fetchProjectData() {
                setLoading(true);
                setError(null);
                try {
                    const [boardsData, epicsData, storiesData, tasksData] = await Promise.all([
                        getBoardsByProject(selectedProjectId!),
                        getEpicsByProject(selectedProjectId!),
                        getStoriesByProject(selectedProjectId!),
                        getTasks({ projectId: selectedProjectId! })
                    ]);
            
                    setBoards(boardsData);
                    if (boardsData.length > 0 && !selectedBoardId) {
                        const currentBoardId = boardsData[0].id;
                        setSelectedBoardId(currentBoardId);
                        const sprintsData = await getSprintsByBoard(selectedProjectId!, currentBoardId);
                        setSprints(sprintsData);
                        if(sprintsData.length > 0 && !selectedSprintId) setSelectedSprintId(sprintsData[0].id);
                    } else if (boardsData.length === 0) {
                        setSelectedBoardId(null);
                        setSprints([]);
                        setSelectedSprintId(null);
                    }
                    setEpics(epicsData);
                    setProjectStories(storiesData);
                    setProjectTasks(tasksData);
                } catch (err) {
                    console.error(`Failed to re-fetch data for project ${selectedProjectId}:`, err);
                    setError(`Failed to reload data for project after item creation. ${err instanceof Error ? err.message : ''}`);
                } finally {
                    setLoading(false);
                }
            }
            fetchProjectData();
        }
    }
  }
  
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedBoardId(null);
    setSelectedSprintId(null);
    router.push(`/tasks?view=${view}&projectId=${projectId}`, { scroll: false });
  };

  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    setSelectedSprintId(null);
    router.push(`/tasks?view=${view}&projectId=${selectedProjectId}&boardId=${boardId}`, { scroll: false });
  };

  const handleSprintChange = (sprintId: string) => {
    setSelectedSprintId(sprintId);
  };

  const handleOpenCreateItemDialog = (type: CreatableItemType, defaults: { epicId?: string, projectId?: string, storyId?: string }) => {
    setCreateItemType(type);
    setCreateItemDefaults(defaults);
    setShowCreateItemDialog(true);
  };

  const handleAssignStoryToSprint = async (storyId: string, sprintIdValue: string) => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      await assignStoryToSprint(storyId, sprintIdValue);
      const updatedStories = await getStoriesByProject(selectedProjectId);
      setProjectStories(updatedStories);
    } catch (err) {
      console.error("Failed to assign story to sprint:", err);
      setError("Failed to assign story. " + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStoryStatus = async (storyId: string, status: Story['status']) => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      await updateStory(selectedProjectId, storyId, { status });
      const updatedStories = await getStoriesByProject(selectedProjectId);
      setProjectStories(updatedStories);
    } catch (err) {
      console.error("Failed to update story status:", err);
      setError("Failed to update story status. " + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !projects.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error && !projects.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Projects</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-6 space-y-6 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and track all your project items.</p>
        </div>
        <Button onClick={() => setShowCreateItemDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <div className="flex-1 min-w-[200px]">
            <Label htmlFor="project-select">Project</Label>
            <Select value={selectedProjectId || ""} onValueChange={handleProjectChange} disabled={!projects.length}>
                <SelectTrigger id="project-select">
                    <SelectValue placeholder={projects.length ? "Select a project" : "No projects available"} />
                </SelectTrigger>
                <SelectContent>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
            <Label htmlFor="board-select">Board</Label>
            <Select value={selectedBoardId || ""} onValueChange={handleBoardChange} disabled={!selectedProjectId || !boards.length}>
                <SelectTrigger id="board-select">
                    <SelectValue placeholder={boards.length ? "Select a board" : (selectedProjectId ? "No boards in project" : "Select project first")} />
                </SelectTrigger>
                <SelectContent>
                    {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
         {view === 'board' && selectedBoardId && sprints.length > 0 && (
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="sprint-select">Sprint (for Board View)</Label>
            <Select value={selectedSprintId || ""} onValueChange={handleSprintChange} disabled={!sprints.length}>
              <SelectTrigger id="sprint-select">
                <SelectValue placeholder={sprints.length ? "Select a sprint" : "No sprints on board"} />
              </SelectTrigger>
              <SelectContent>
                {sprints.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.status})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Tabs value={view} onValueChange={handleViewChange} className="w-full">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search items..." 
              className="pl-8 w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!selectedProjectId}
            />
          </div>
          <div className="flex gap-2">
            <TabsList>
              <TabsTrigger value="board" disabled={!selectedBoardId || !selectedSprintId}>
                <Kanban className="h-4 w-4 mr-2" />
                Board
              </TabsTrigger>
              <TabsTrigger value="backlog" disabled={!selectedProjectId}>
                <CalendarRange className="h-4 w-4 mr-2" />
                Backlog
              </TabsTrigger>
              <TabsTrigger value="list" disabled={!selectedProjectId}>
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" size="icon" disabled={!selectedProjectId}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading && (selectedProjectId || selectedBoardId) ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error && selectedProjectId ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Error loading project data:</p>
                <p>{error}</p>
            </div>
        ) : !selectedProjectId ? (
             <div className="text-center py-10">
                <p className="text-lg text-muted-foreground">Please select a project to view tasks.</p>
            </div>
        ) : (
          <>
        <TabsContent value="board" className="mt-0">
              {selectedBoardId && selectedSprintId ? (
                <KanbanBoard 
                  projectId={selectedProjectId!} 
                  boardId={selectedBoardId!}
                  sprintId={selectedSprintId!}
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-lg text-muted-foreground">Please select a board and a sprint to view the Kanban board.</p>
                </div>
              )}
        </TabsContent>

        <TabsContent value="backlog" className="mt-0">
              {selectedProjectId ? (
                <TaskBacklog 
                  projectId={selectedProjectId!} 
                  epics={epics} 
                  stories={projectStories.filter(s => !s.sprintId || s.status === 'Backlog')}
                  sprints={sprints} 
                  selectedSprintId={selectedSprintId}
                  users={allUsers}
                  onAssignStoryToSprint={handleAssignStoryToSprint}
                  onUpdateStoryStatus={handleUpdateStoryStatus}
                  onOpenCreateItemDialog={handleOpenCreateItemDialog}
                />
              ) : (
                 <div className="text-center py-10"><p className="text-lg text-muted-foreground">Select a project to see its backlog.</p></div>
              )}
        </TabsContent>

        <TabsContent value="list" className="mt-0">
              {selectedProjectId ? (
                <TaskList 
                  projectId={selectedProjectId!} 
                  items={[...epics, ...projectStories, ...projectTasks]}
                />
              ) : (
                 <div className="text-center py-10"><p className="text-lg text-muted-foreground">Select a project to see its items list.</p></div>
              )}
        </TabsContent>
          </>
        )}
      </Tabs>

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
