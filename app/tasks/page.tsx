"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, List, Kanban, CalendarRange } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { CreatableItemType } from "@/components/create-item-dialog"
import { CreateItemDialog } from "@/components/create-item-dialog"
import { CreateSprintDialog } from "@/components/create-sprint-dialog"

// Import the new components
import { BoardView } from "./components/BoardView"
import { BacklogView } from "./components/BacklogView"
import { ListView } from "./components/ListView"
import { SprintHeader } from "./components/SprintHeader"

// Import types and API functions
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
  updateTask,
  deleteStory,
  deleteTask,
  startSprint,
  completeSprint
} from "@/lib/db"

// Mock deleteEpic function since it's not exported from db.ts
const deleteEpic = async (projectId: string, epicId: string): Promise<void> => {
  console.log(`Deleting epic ${epicId} from project ${projectId}`)
  // This is a mock function - in a real implementation, you would call the backend API
  // In a production app, this should be implemented in lib/db.ts
  throw new Error("deleteEpic not implemented")
}

export default function TasksPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewParam = searchParams.get("view")
  
  // State for create item dialog
  const [showCreateItemDialog, setShowCreateItemDialog] = useState(false)
  const [createItemType, setCreateItemType] = useState<CreatableItemType>('Task')
  const [createItemDefaults, setCreateItemDefaults] = useState<{[key: string]: any}>({})

  // Main view state
  const [view, setView] = useState(viewParam || "board")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Project and board state
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null)
  
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)

  // Data state
  const [epics, setEpics] = useState<Epic[]>([])
  const [projectStories, setProjectStories] = useState<Story[]>([])
  const [projectTasks, setProjectTasks] = useState<Task[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Additional state for sprint creation
  const [isCreateSprintDialogOpen, setIsCreateSprintDialogOpen] = useState(false)

  // Initial data loading
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true)
      setError(null)
      try {
        const [projectsData, usersData] = await Promise.all([
          getProjects(),
          getUsers()
        ])

        setProjects(projectsData)
        setAllUsers(usersData)

        if (projectsData.length > 0) {
          // Check if there's a project ID in the URL
          const projectIdParam = searchParams.get("projectId")
          const initialProjectId = projectIdParam || projectsData[0].id
          setSelectedProjectId(initialProjectId)
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
  }, [searchParams])

  // Load project data when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setBoards([])
      setEpics([])
      setProjectStories([])
      setProjectTasks([])
      setSelectedBoardId(null)
      setSprints([])
      setSelectedSprintId(null)
      setActiveSprint(null)
      setLoading(false)
      return
    }

    async function fetchProjectData() {
      setLoading(true)
      setError(null)
      try {
        // Get boards for the project
        if (selectedProjectId) {
          const boardsData = await getBoardsByProject(selectedProjectId)
          setBoards(boardsData)
        
          // Check if there's a board ID in the URL
          const boardIdParam = searchParams.get("boardId")
          const initialBoardId = boardIdParam || (boardsData.length > 0 ? boardsData[0].id : null)
        
          if (initialBoardId && boardsData.some(b => b.id === initialBoardId)) {
            setSelectedBoardId(initialBoardId) 
          
            // Get sprints for the board
            if (selectedProjectId && initialBoardId) {
              const sprintsData = await getSprintsByBoard(selectedProjectId, initialBoardId)
              setSprints(sprintsData)
            
              // Set active sprint if any
              const activeSprintData = sprintsData.find(s => s.status === 'Active')
              const sprintIdParam = searchParams.get("sprintId")
              
              if (sprintIdParam && sprintsData.some(s => s.id === sprintIdParam)) {
                setSelectedSprintId(sprintIdParam)
                setActiveSprint(sprintsData.find(s => s.id === sprintIdParam) || null)
              } else if (activeSprintData) {
                setSelectedSprintId(activeSprintData.id)
                setActiveSprint(activeSprintData)
              } else if (sprintsData.length > 0) {
                setSelectedSprintId(sprintsData[0].id)
                setActiveSprint(sprintsData[0])
              } else {
                setSelectedSprintId(null)
                setActiveSprint(null)
              }
            }
          } else {
            setSelectedBoardId(null)
            setSprints([])
            setSelectedSprintId(null)
            setActiveSprint(null)
          }
        }

        // Get epics for the project
        if (selectedProjectId) {
          const epicsData = await getEpicsByProject(selectedProjectId)
          setEpics(epicsData)
        }

        // Get stories for the project
        if (selectedProjectId) {
          const storiesData = await getStoriesByProject(selectedProjectId)
          setProjectStories(storiesData)
        }

        // Get tasks for the project
        if (selectedProjectId) {
          const tasksData = await getTasks({ projectId: selectedProjectId })
          setProjectTasks(tasksData)
        }
        
      } catch (err) {
        console.error(`Failed to fetch data for project ${selectedProjectId}:`, err)
        setError(`Failed to load data for project. ${err instanceof Error ? err.message : ''}`)
      } finally {
        setLoading(false)
      }
    }
    fetchProjectData()
  }, [selectedProjectId, searchParams])

  // Load sprints when board changes
  useEffect(() => {
    if (!selectedBoardId || !selectedProjectId) {
      setSprints([])
      setSelectedSprintId(null)
      setActiveSprint(null)
      return
    }
    
    async function fetchSprintsForBoard() {
      try {
        setLoading(true)
        
        // Get sprints for the board
        if (selectedProjectId && selectedBoardId) {
          const sprintsData = await getSprintsByBoard(selectedProjectId, selectedBoardId)
          setSprints(sprintsData)
        
          // Set active sprint if any
          const activeSprintData = sprintsData.find(s => s.status === 'Active')
          
          if (activeSprintData) {
            setSelectedSprintId(activeSprintData.id)
            setActiveSprint(activeSprintData)
          } else if (sprintsData.length > 0) {
            setSelectedSprintId(sprintsData[0].id)
            setActiveSprint(sprintsData[0])
          } else {
            setSelectedSprintId(null)
            setActiveSprint(null)
          }
        }
      } catch (err) {
        console.error("Failed to fetch sprints:", err)
        setError("Failed to load sprints for the board.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchSprintsForBoard()
  }, [selectedBoardId, selectedProjectId])

  // Update URL when view or filters change
  const handleViewChange = (newView: string) => {
    setView(newView)
    router.push(
      `/tasks?view=${newView}${selectedProjectId ? `&projectId=${selectedProjectId}` : ''}${selectedBoardId ? `&boardId=${selectedBoardId}` : ''}${selectedSprintId ? `&sprintId=${selectedSprintId}` : ''}`, 
      { scroll: false }
    )
  }

  // Handle item creation
  const handleItemCreated = (item: Task | Story | Epic) => {
    setShowCreateItemDialog(false)
    
    if ('name' in item && !('title' in item)) {
      // Epic created
      setEpics(prev => [item as Epic, ...prev])
    } else if ('isReady' in item || 'points' in item) {
      // Story created
      setProjectStories(prev => [item as Story, ...prev])
      if (selectedSprintId && (item as Story).sprintId === selectedSprintId) {
        // If the story was assigned to the current sprint, refresh sprint data
        refreshProjectData()
      }
    } else {
      // Task created
      setProjectTasks(prev => [item as Task, ...prev])
      if (selectedSprintId && (item as Task).sprintId === selectedSprintId) {
        // If the task was assigned to the current sprint, refresh sprint data
        refreshProjectData()
      }
    }
  }
  
  // Refresh all project data
  const refreshProjectData = async () => {
    if (!selectedProjectId) return
    
    try {
      setLoading(true)
      
      // Fetch updated epics, stories, and tasks
      const [epicsData, storiesData, tasksData] = await Promise.all([
        getEpicsByProject(selectedProjectId),
        getStoriesByProject(selectedProjectId),
        getTasks({ projectId: selectedProjectId })
      ])
      
      setEpics(epicsData)
      setProjectStories(storiesData)
      setProjectTasks(tasksData)
      
      // If a sprint is selected, refresh sprint data
      if (selectedSprintId && selectedBoardId) {
        const sprintsData = await getSprintsByBoard(selectedProjectId, selectedBoardId)
        setSprints(sprintsData)
        
        const currentSprint = sprintsData.find(s => s.id === selectedSprintId)
        if (currentSprint) {
          setActiveSprint(currentSprint)
        }
      }
      
    } catch (error) {
      console.error("Failed to refresh project data:", error)
      setError("Failed to refresh project data. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  // Handle project change
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId)
    setSelectedBoardId(null)
    setSelectedSprintId(null)
    setActiveSprint(null)
    router.push(`/tasks?view=${view}&projectId=${projectId}`, { scroll: false })
  }

  // Handle board change
  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId)
    setSelectedSprintId(null)
    setActiveSprint(null)
    router.push(
      `/tasks?view=${view}${selectedProjectId ? `&projectId=${selectedProjectId}` : ''}&boardId=${boardId}`, 
      { scroll: false }
    )
  }

  // Handle sprint change
  const handleSprintChange = (sprintId: string) => {
    setSelectedSprintId(sprintId)
    setActiveSprint(sprints.find(s => s.id === sprintId) || null)
    router.push(
      `/tasks?view=${view}${selectedProjectId ? `&projectId=${selectedProjectId}` : ''}${selectedBoardId ? `&boardId=${selectedBoardId}` : ''}&sprintId=${sprintId}`, 
      { scroll: false }
    )
  }

  // Handle opening the create item dialog
  const handleOpenCreateItemDialog = (type: CreatableItemType, defaults: { 
    epicId?: string, 
    projectId?: string, 
    storyId?: string,
    sprintId?: string
  }) => {
    setCreateItemType(type)
    setCreateItemDefaults(defaults)
    setShowCreateItemDialog(true)
  }

  // Handle assigning a story to a sprint
  const handleAssignStoryToSprint = async (storyId: string, sprintIdValue: string) => {
    if (!selectedProjectId) return
    
    setLoading(true)
    try {
      await assignStoryToSprint(storyId, sprintIdValue)
      
      // Update stories data after assignment
      const updatedStories = await getStoriesByProject(selectedProjectId)
      setProjectStories(updatedStories)
    } catch (err) {
      console.error("Failed to assign story to sprint:", err)
      setError("Failed to assign story. " + (err instanceof Error ? err.message : ''))
    } finally {
      setLoading(false)
    }
  }

  // Handle updating a story's status
  const handleUpdateStoryStatus = async (storyId: string, status: Story['status']) => {
    if (!selectedProjectId) return
    
    setLoading(true)
    try {
      await updateStory(selectedProjectId, storyId, { status })
      
      // Update stories data after status change
      const updatedStories = await getStoriesByProject(selectedProjectId)
      setProjectStories(updatedStories)
    } catch (err) {
      console.error("Failed to update story status:", err)
      setError("Failed to update story status. " + (err instanceof Error ? err.message : ''))
    } finally {
      setLoading(false)
    }
  }

  // Handle deleting an item
  const handleDeleteItem = async (itemType: 'Epic' | 'Story' | 'Task', itemId: string) => {
    try {
      setLoading(true)
      
      if (itemType === 'Epic' && selectedProjectId) {
            await deleteEpic(selectedProjectId, itemId)
            setEpics(prev => prev.filter(epic => epic.id !== itemId))
      } else if (itemType === 'Story' && selectedProjectId) {
          await deleteStory(selectedProjectId, itemId)
          setProjectStories(prev => prev.filter(story => story.id !== itemId))
      } else if (itemType === 'Task') {
          await deleteTask(itemId)
          setProjectTasks(prev => prev.filter(task => task.id !== itemId))
      }
      
      // Refresh data after deletion to ensure consistency
      await refreshProjectData()
    } catch (error) {
      console.error(`Failed to delete ${itemType.toLowerCase()}:`, error)
      setError(`Failed to delete ${itemType.toLowerCase()}. ${error instanceof Error ? error.message : ''}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle sprint creation
  const handleSprintCreated = async (sprint: Sprint) => {
    setSprints(prev => [sprint, ...prev])
    setSelectedSprintId(sprint.id)
    setActiveSprint(sprint)
    router.push(
      `/tasks?view=${view}${selectedProjectId ? `&projectId=${selectedProjectId}` : ''}${selectedBoardId ? `&boardId=${selectedBoardId}` : ''}&sprintId=${sprint.id}`, 
      { scroll: false }
    )
  }

  // Loading state
  if (loading && !projects.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Error state
  if (error && !projects.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Projects</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  // Filter stories for the active sprint
  const sprintStories = selectedSprintId
    ? projectStories.filter(story => story.sprintId === selectedSprintId)
    : []

  return (
    <div className="flex flex-col p-6 space-y-6 min-h-screen">
      {/* Header */}
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

      {/* Project/Board/Sprint Selectors */}
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
        {(view === 'board' || view === 'backlog') && selectedBoardId && (
          <>
            {sprints.length > 0 ? (
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="sprint-select">Sprint</Label>
            <Select value={selectedSprintId || ""} onValueChange={handleSprintChange} disabled={!sprints.length}>
              <SelectTrigger id="sprint-select">
                <SelectValue placeholder={sprints.length ? "Select a sprint" : "No sprints on board"} />
              </SelectTrigger>
              <SelectContent>
                {sprints.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.status})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
            ) : (
              <div className="flex-1 min-w-[200px]">
                <Label>Sprint</Label>
                <div className="flex items-center h-10 mt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsCreateSprintDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Sprint
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sprint Header (Only shown in Board view) */}
      {view === 'board' && selectedBoardId && (
        <SprintHeader 
          sprint={activeSprint} 
          stories={sprintStories}
          projectId={selectedProjectId || ''}
          boardId={selectedBoardId}
          onStartSprint={async () => {
            if (!activeSprint) return
            try {
              const updatedSprint = await startSprint(activeSprint.id, {
                goal: activeSprint.goal || 'Complete sprint goals',
                endDate: activeSprint.endDate
              })
              
              setActiveSprint(updatedSprint)
              setSprints(prev => prev.map(s => s.id === updatedSprint.id ? updatedSprint : s))
            } catch (error) {
              console.error('Failed to start sprint:', error)
              setError('Failed to start sprint. Please try again.')
            }
          }}
          onCompleteSprint={async () => {
            if (!activeSprint) return
            try {
              const updatedSprint = await completeSprint(activeSprint.id, {
                moveUnfinishedToBacklog: true
              })
              
              setActiveSprint(updatedSprint)
              setSprints(prev => prev.map(s => s.id === updatedSprint.id ? updatedSprint : s))
              
              // Refresh project data to update backlog with moved stories
              if (selectedProjectId) {
                await refreshProjectData()
              }
            } catch (error) {
              console.error('Failed to complete sprint:', error)
              setError('Failed to complete sprint. Please try again.')
            }
          }}
          onSprintCreated={handleSprintCreated}
        />
      )}

      {/* Tabs and Views */}
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
            {/* Board View */}
            <TabsContent value="board" className="mt-0">
              {selectedBoardId && selectedSprintId ? (
                <BoardView 
                  projectId={selectedProjectId} 
                  boardId={selectedBoardId}
                  sprintId={selectedSprintId}
                  users={allUsers}
                  onOpenCreateItemDialog={handleOpenCreateItemDialog}
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-lg text-muted-foreground">Please select a board and a sprint to view the Kanban board.</p>
                </div>
              )}
            </TabsContent>

            {/* Backlog View */}
            <TabsContent value="backlog" className="mt-0">
              {selectedProjectId ? (
                <BacklogView 
                  projectId={selectedProjectId} 
                  epics={epics} 
                  stories={projectStories.filter(s => !s.sprintId)}
                  sprints={sprints} 
                  selectedSprintId={selectedSprintId}
                  users={allUsers}
                  onAssignStoryToSprint={handleAssignStoryToSprint}
                  onUpdateStoryStatus={handleUpdateStoryStatus}
                  onOpenCreateItemDialog={handleOpenCreateItemDialog}
                  onSprintCreated={handleSprintCreated}
                  boardId={selectedBoardId || undefined}
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-lg text-muted-foreground">Select a project to see its backlog.</p>
                </div>
              )}
            </TabsContent>

            {/* List View */}
            <TabsContent value="list" className="mt-0">
              {selectedProjectId ? (
                <ListView 
                  projectId={selectedProjectId || ""} 
                  items={[...epics, ...projectStories, ...projectTasks].filter(item => {
                    if (searchTerm) {
                      const itemTitle = 'title' in item ? item.title : ('name' in item ? item.name : '')
                      const itemDesc = 'description' in item ? item.description : ''
                      return (
                        itemTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        itemDesc?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    }
                    return true
                  })}
                  users={allUsers}
                  onOpenCreateItemDialog={handleOpenCreateItemDialog}
                  onDeleteItem={handleDeleteItem}
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-lg text-muted-foreground">Select a project to see its items list.</p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Create Item Dialog */}
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

      {/* Create Sprint Dialog */}
      {selectedProjectId && selectedBoardId && (
        <CreateSprintDialog
          open={isCreateSprintDialogOpen}
          onOpenChange={setIsCreateSprintDialogOpen}
          onSprintCreated={handleSprintCreated}
          projectId={selectedProjectId}
          boardId={selectedBoardId}
        />
      )}
    </div>
  )
}
