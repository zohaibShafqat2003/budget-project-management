"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Filter,
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
  Download,
  Search,
  Trash2,
  Pencil
} from "lucide-react"
import { Story, Task, Epic, User, updateTask, updateStory, assignTask } from "@/lib/db"
import { CreatableItemType } from "@/components/create-item-dialog"

interface ListViewProps {
  projectId: string
  items: (Epic | Story | Task)[]
  users: User[]
  onOpenCreateItemDialog: (type: CreatableItemType, defaults: { epicId?: string, projectId?: string, storyId?: string, sprintId?: string }) => void
  onDeleteItem?: (itemType: 'Epic' | 'Story' | 'Task', itemId: string) => Promise<void>
}

// Item type utility
type ItemType = 'Epic' | 'Story' | 'Task' | 'Bug'

// Filter options interface
interface FilterOptions {
  itemTypes: ItemType[]
  status: string[]
  priority: string[]
  assigneeIds: string[]
}

// Helper function for priority display
const getPriorityDisplay = (priority: Story['priority'] | Task['priority']) => {
  const colors: Record<string, string> = {
    Highest: "bg-red-600 text-white", 
    High: "bg-orange-500 text-white", 
    Medium: "bg-yellow-500 text-black", 
    Low: "bg-green-500 text-white", 
    Lowest: "bg-blue-400 text-white",
  }
  const icons: Record<string, React.ReactNode> = {
    Highest: <ArrowUp className="h-3 w-3" />, 
    High: <ArrowUp className="h-3 w-3" />,
    Medium: <ArrowRight className="h-3 w-3" />, 
    Low: <ArrowDown className="h-3 w-3" />,
    Lowest: <ArrowDown className="h-3 w-3" />,
  }
  return {
    color: colors[priority] || "bg-gray-500 text-white",
    icon: icons[priority] || <ArrowRight className="h-3 w-3" />,
    name: priority
  }
}

// Helper function for item type icons and determination
const getItemTypeInfo = (item: Epic | Story | Task) => {
  // Determine item type
  let itemType: ItemType = 'Task' // Default

  if ('name' in item && !('title' in item)) {
    itemType = 'Epic'
  } else if ('points' in item && 'isReady' in item) {
    itemType = 'Story'
  } else if ('type' in item) {
    itemType = item.type === 'Bug' ? 'Bug' : 'Task'
  }

  // Get the appropriate icon
  let icon: React.ReactNode
  let badgeColor: string

  switch (itemType) {
    case 'Epic':
      icon = <Layers className="h-4 w-4" />
      badgeColor = "bg-purple-500 text-white"
      break
    case 'Story':
      icon = <BookOpen className="h-4 w-4" />
      badgeColor = "bg-green-500 text-white"
      break
    case 'Bug':
      icon = <AlertCircle className="h-4 w-4" />
      badgeColor = "bg-red-500 text-white"
      break
    default:
      icon = <CheckCircle className="h-4 w-4" />
      badgeColor = "bg-blue-500 text-white"
  }

  return { itemType, icon, badgeColor }
}

// Function to get all possible statuses from items
const getAllStatuses = (items: (Epic | Story | Task)[]): string[] => {
  const statuses = new Set<string>()
  
  items.forEach(item => {
    if ('status' in item) {
      statuses.add(item.status)
    }
  })
  
  return Array.from(statuses)
}

// Function to get all possible priorities from items
const getAllPriorities = (items: (Epic | Story | Task)[]): string[] => {
  const priorities = new Set<string>()
  
  items.forEach(item => {
    if ('priority' in item) {
      priorities.add(item.priority)
    }
  })
  
  return Array.from(priorities)
}

export function ListView({ projectId, items, users, onOpenCreateItemDialog, onDeleteItem }: ListViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemType[]>(['Epic', 'Story', 'Task', 'Bug'])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [priorityFilter, setPriorityFilter] = useState<string[]>([])
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: ItemType, id: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get all possible statuses and priorities for filters
  const allStatuses = getAllStatuses(items)
  const allPriorities = getAllPriorities(items)
  
  // Apply filters to the items
  const filteredItems = items.filter(item => {
    // Check item type
    const { itemType } = getItemTypeInfo(item)
    if (!itemTypeFilter.includes(itemType)) return false
    
    // Search term
    const searchableText = 
      ('name' in item ? item.name : '') + 
      ('title' in item ? item.title : '') + 
      ('description' in item ? item.description : '')
    
    if (searchTerm && !searchableText.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Status filter
    if (statusFilter.length > 0 && 'status' in item) {
      if (!statusFilter.includes(item.status)) return false
    }
    
    // Priority filter
    if (priorityFilter.length > 0 && 'priority' in item) {
      if (!priorityFilter.includes(item.priority)) return false
    }
    
    // Assignee filter
    if (assigneeFilter.length > 0 && 'assigneeId' in item) {
      if (!item.assigneeId || !assigneeFilter.includes(item.assigneeId)) return false
    }
    
    return true
  })

  // Handle item deletion
  const handleDelete = async () => {
    if (!itemToDelete || !onDeleteItem) return
    
    try {
      setLoading(true)
      setError(null)
      await onDeleteItem(itemToDelete.type === 'Bug' ? 'Task' : itemToDelete.type, itemToDelete.id)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Failed to delete item:", error)
      setError(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle task status change
  const handleStatusChange = async (item: Epic | Story | Task, newStatus: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { itemType } = getItemTypeInfo(item)
      
      if (itemType === 'Task' && 'id' in item) {
        await updateTask(item.id, { status: newStatus as Task['status'] })
      } else if (itemType === 'Story' && 'id' in item && projectId) {
        await updateStory(projectId, item.id, { status: newStatus as Story['status'] })
      } else if (itemType === 'Epic') {
        // Handle Epic status update if needed
      }
    } catch (error) {
      console.error("Failed to update status:", error)
      setError(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle task priority change
  const handlePriorityChange = async (item: Epic | Story | Task, newPriority: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { itemType } = getItemTypeInfo(item)
      
      if (itemType === 'Task' && 'id' in item) {
        await updateTask(item.id, { priority: newPriority as Task['priority'] })
      } else if (itemType === 'Story' && 'id' in item && projectId) {
        await updateStory(projectId, item.id, { priority: newPriority as Story['priority'] })
      }
    } catch (error) {
      console.error("Failed to update priority:", error)
      setError(`Failed to update priority: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle assigning a task
  const handleAssignItem = async (item: Epic | Story | Task, userId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { itemType } = getItemTypeInfo(item)
      
      if (itemType === 'Task' && 'id' in item) {
        await assignTask(item.id, userId)
      } else if (itemType === 'Story' && 'id' in item && projectId) {
        await updateStory(projectId, item.id, { assigneeId: userId })
      }
    } catch (error) {
      console.error("Failed to assign item:", error)
      setError(`Failed to assign item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Add context menu for rows with status and priority change options
  const renderRowActions = (item: Epic | Story | Task) => {
    const { itemType } = getItemTypeInfo(item)
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={() => onOpenCreateItemDialog(
            itemType === 'Epic' ? 'Story' : 'Task', 
            { 
              projectId, 
              epicId: itemType === 'Epic' && 'id' in item ? item.id : undefined,
              storyId: itemType === 'Story' && 'id' in item ? item.id : undefined 
            }
          )}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add {itemType === 'Epic' ? 'Story' : 'Task'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {(itemType === 'Task' || itemType === 'Story') && (
            <>
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              {['Backlog', 'To Do', 'In Progress', 'In Review', 'Done'].map(status => (
                <DropdownMenuItem 
                  key={status} 
                  disabled={'status' in item && item.status === status}
                  onClick={() => 'status' in item && handleStatusChange(item, status)}
                >
                  {status}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
              {['Highest', 'High', 'Medium', 'Low', 'Lowest'].map(priority => (
                <DropdownMenuItem 
                  key={priority} 
                  disabled={'priority' in item && item.priority === priority}
                  onClick={() => 'priority' in item && handlePriorityChange(item, priority)}
                >
                  {getPriorityDisplay(priority as any).icon}
                  <span className="ml-2">{priority}</span>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Assign To</DropdownMenuLabel>
              {users.map(user => (
                <DropdownMenuItem 
                  key={user.id} 
                  disabled={'assigneeId' in item && item.assigneeId === user.id}
                  onClick={() => 'assigneeId' in item && handleAssignItem(item, user.id)}
                >
                  {user.firstName} {user.lastName}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem 
                onClick={() => 'assigneeId' in item && handleAssignItem(item, '')}
              >
                Unassign
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => {
              setItemToDelete({ type: itemType, id: 'id' in item ? item.id : '' })
              setDeleteConfirmOpen(true)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Item Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={itemTypeFilter.includes('Epic')}
                onCheckedChange={(checked) => {
                  setItemTypeFilter(prev => 
                    checked 
                      ? [...prev, 'Epic']
                      : prev.filter(t => t !== 'Epic')
                  )
                }}
              >
                <Layers className="h-4 w-4 mr-2 text-purple-500" />
                Epics
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={itemTypeFilter.includes('Story')}
                onCheckedChange={(checked) => {
                  setItemTypeFilter(prev => 
                    checked 
                      ? [...prev, 'Story']
                      : prev.filter(t => t !== 'Story')
                  )
                }}
              >
                <BookOpen className="h-4 w-4 mr-2 text-green-500" />
                Stories
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={itemTypeFilter.includes('Task')}
                onCheckedChange={(checked) => {
                  setItemTypeFilter(prev => 
                    checked 
                      ? [...prev, 'Task']
                      : prev.filter(t => t !== 'Task')
                  )
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                Tasks
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={itemTypeFilter.includes('Bug')}
                onCheckedChange={(checked) => {
                  setItemTypeFilter(prev => 
                    checked 
                      ? [...prev, 'Bug']
                      : prev.filter(t => t !== 'Bug')
                  )
                }}
              >
                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                Bugs
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allStatuses.map(status => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => {
                    setStatusFilter(prev => 
                      checked 
                        ? [...prev, status]
                        : prev.filter(s => s !== status)
                    )
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allPriorities.map(priority => {
                const priorityInfo = getPriorityDisplay(priority as any)
                return (
                  <DropdownMenuCheckboxItem
                    key={priority}
                    checked={priorityFilter.includes(priority)}
                    onCheckedChange={(checked) => {
                      setPriorityFilter(prev => 
                        checked 
                          ? [...prev, priority]
                          : prev.filter(p => p !== priority)
                      )
                    }}
                  >
                    <span className="flex items-center">
                      {priorityInfo.icon}
                      <span className="ml-2">{priority}</span>
                    </span>
                  </DropdownMenuCheckboxItem>
                )
              })}
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Assignee</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {users.map(user => (
                <DropdownMenuCheckboxItem
                  key={user.id}
                  checked={assigneeFilter.includes(user.id)}
                  onCheckedChange={(checked) => {
                    setAssigneeFilter(prev => 
                      checked 
                        ? [...prev, user.id]
                        : prev.filter(id => id !== user.id)
                    )
                  }}
                >
                  {user.firstName} {user.lastName}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={() => {
            setItemTypeFilter(['Epic', 'Story', 'Task', 'Bug'])
            setStatusFilter([])
            setPriorityFilter([])
            setAssigneeFilter([])
            setSearchTerm("")
          }}>
            Clear Filters
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button size="sm" onClick={() => onOpenCreateItemDialog('Task', { projectId })}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Item
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Points/Hours</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No items found matching the current filters
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map(item => {
                const { itemType, icon, badgeColor } = getItemTypeInfo(item)
                
                // Get appropriate item properties
                const id = item.id.substring(0, 8)
                const title = 'name' in item ? item.name : ('title' in item ? item.title : 'Untitled')
                const status = 'status' in item ? item.status : '—'
                const priority = 'priority' in item ? getPriorityDisplay(item.priority as any) : null
                
                // Points or hours
                let pointsOrHours = null
                if ('points' in item && item.points !== undefined) {
                  pointsOrHours = `${item.points} SP`
                } else if ('estimatedHours' in item && item.estimatedHours !== undefined) {
                  pointsOrHours = `${item.estimatedHours} hrs`
                }
                
                // Assignee
                const assigneeId = 'assigneeId' in item ? item.assigneeId : null
                const assignee = assigneeId ? users.find(u => u.id === assigneeId) : null
                const assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : '—'
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {icon}
                        <span className="ml-2">{title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${badgeColor}`}>
                        {itemType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {status && (
                        <Badge variant="outline">
                          {status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {priority && (
                        <Badge className={priority.color}>
                          <span className="flex items-center gap-1">
                            {priority.icon} {priority.name}
                          </span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{pointsOrHours || '—'}</TableCell>
                    <TableCell>{assigneeName}</TableCell>
                    <TableCell className="text-right">
                      {renderRowActions(item)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              {error || `Are you sure you want to delete this ${itemToDelete?.type.toLowerCase()}? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 