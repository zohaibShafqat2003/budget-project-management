"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  ClipboardList,
  DollarSign,
  MapPin,
  Users,
  Building,
  ArrowLeft,
  Loader2,
  Plus,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react"
import { getProjectById, getUsers, Project, User, addTeamMembers, updateProject, removeTeamMembers } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ProjectDetailClientProps = {
  id: string;
}

export function ProjectDetailClient({ id }: ProjectDetailClientProps) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [newTeamMembers, setNewTeamMembers] = useState<string[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [editStatus, setEditStatus] = useState<string | null>(null)
  const [showTeamDialog, setShowTeamDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Use the id prop directly
  const projectId = id

  useEffect(() => {
    async function fetchProjectData() {
      try {
        setLoading(true)
        // Fetch project details
        const data = await getProjectById(projectId)
        setProject(data)
        setProgress(data.progress || 0)
        
        // Fetch all users
        const usersData = await getUsers()
        setAllUsers(usersData)
        
        // Set available users who are not already team members
        const existingMemberIds = data.members?.map(m => m.id) || []
        setAvailableUsers(usersData.filter(user => !existingMemberIds.includes(user.id)))
        
        setError(null)
      } catch (err) {
        console.error("Failed to fetch project:", err)
        setError("Failed to load project details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId])

  const handleUpdateProgress = async () => {
    if (!project) return
    
    try {
      setUpdating(true)
      const updatedProject = await updateProject(project.id, { progress })
      setProject(updatedProject)
    } catch (err) {
      console.error("Failed to update progress:", err)
      setError("Failed to update progress. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const handleStatusChange = async () => {
    if (!project || !editStatus) return
    
    try {
      setUpdating(true)
      const updatedProject = await updateProject(project.id, { status: editStatus })
      setProject(updatedProject)
      setEditStatus(null)
    } catch (err) {
      console.error("Failed to update status:", err)
      setError("Failed to update status. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const handleAddTeamMembers = async () => {
    if (!project || newTeamMembers.length === 0) return
    
    try {
      setUpdating(true)
      await addTeamMembers(project.id, newTeamMembers)
      
      // Refresh project data
      const updatedProject = await getProjectById(projectId)
      setProject(updatedProject)
      
      // Update available users
      const existingMemberIds = updatedProject.members?.map(m => m.id) || []
      setAvailableUsers(allUsers.filter(user => !existingMemberIds.includes(user.id)))
      
      // Reset selection
      setNewTeamMembers([])
      setShowTeamDialog(false)
    } catch (err) {
      console.error("Failed to add team members:", err)
      setError("Failed to add team members. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveTeamMember = async (userId: string) => {
    if (!project) return
    
    try {
      setUpdating(true)
      await removeTeamMembers(project.id, [userId])
      
      // Refresh project data
      const updatedProject = await getProjectById(projectId)
      setProject(updatedProject)
      
      // Update available users
      const existingMemberIds = updatedProject.members?.map(m => m.id) || []
      setAvailableUsers(allUsers.filter(user => !existingMemberIds.includes(user.id)))
    } catch (err) {
      console.error("Failed to remove team member:", err)
      setError("Failed to remove team member. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const filteredAvailableUsers = searchTerm 
    ? availableUsers.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableUsers

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-500"
      case "Active":
        return "bg-blue-500"  
      case "In Progress":
        return "bg-blue-500"
      case "Review":
        return "bg-yellow-500"
      case "Completed":
        return "bg-green-500"
      case "Archived":
        return "bg-purple-500"
      case "On Hold":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 mt-6 text-center text-red-700">
          {error || "Project not found"}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/team`}>
              <Users className="mr-2 h-4 w-4" />
              Manage Team
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl">{project.name}</CardTitle>
                <CardDescription>{project.projectIdStr}</CardDescription>
              </div>
              <Badge variant="outline" className={`${getStatusColor(project.status)} text-white`}>
                {project.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Client:</span>
                    <span className="ml-1 text-sm font-medium">
                      {project.client?.name || project.nameOfClient || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Timeline:</span>
                    <span className="ml-1 text-sm font-medium">
                      {project.startDate ? formatDate(new Date(project.startDate)) : "N/A"} - {" "}
                      {project.completionDate ? formatDate(new Date(project.completionDate)) : "Ongoing"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Budget:</span>
                    <span className="ml-1 text-sm font-medium">
                      ${project.totalBudget ? project.totalBudget.toLocaleString() : "0"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="ml-1 text-sm font-medium">
                      {project.city && project.country ? 
                        `${project.city}, ${project.country}` : 
                        (project.city || project.country || "N/A")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">Progress</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Project Progress</DialogTitle>
                          <DialogDescription>
                            Adjust the slider to update the project completion percentage.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Progress</Label>
                              <span className="text-sm">{progress}%</span>
                            </div>
                            <Slider
                              value={[progress]}
                              min={0}
                              max={100}
                              step={5}
                              onValueChange={(value) => setProgress(value[0])}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleUpdateProgress} disabled={updating}>
                            {updating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : "Save Changes"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">Status</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Change
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Project Status</DialogTitle>
                          <DialogDescription>
                            Select a new status for this project.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-6">
                          <Select
                            value={editStatus || project.status}
                            onValueChange={setEditStatus}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not Started">Not Started</SelectItem>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Review">Review</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Archived">Archived</SelectItem>
                              <SelectItem value="On Hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleStatusChange} disabled={updating}>
                            {updating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : "Save Changes"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Badge variant="outline" className={`${getStatusColor(project.status)} text-white`}>
                    {project.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Narrative Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.narrativeDescription || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4">
                    <h3 className="text-sm font-medium">Services Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.actualServicesDescription || "No services description provided."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tasks" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Tasks</CardTitle>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 text-muted-foreground">
                    No tasks have been created for this project.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="budget" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Budget</CardTitle>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Entry
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4 text-muted-foreground">
                    No budget entries have been created for this project.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:w-1/3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  {project.members?.length || 0} members assigned
                </CardDescription>
              </div>
              <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Members
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Members</DialogTitle>
                    <DialogDescription>
                      Select team members to add to this project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6">
                    <div className="mb-4">
                      <Label htmlFor="search" className="sr-only">Search</Label>
                      <Input
                        id="search"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                      />
                    </div>
                    {availableUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No more users available to add.</p>
                    ) : (
                      <div className="space-y-4 max-h-[250px] overflow-y-auto">
                        {filteredAvailableUsers.map(user => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`user-${user.id}`}
                              value={user.id}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewTeamMembers(prev => [...prev, user.id])
                                } else {
                                  setNewTeamMembers(prev => prev.filter(id => id !== user.id))
                                }
                              }}
                              checked={newTeamMembers.includes(user.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor={`user-${user.id}`} className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {getInitials(`${user.firstName} ${user.lastName}`)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleAddTeamMembers} 
                      disabled={updating || newTeamMembers.length === 0}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : "Add Selected Members"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {project.members && project.members.length > 0 ? (
                <div className="space-y-4">
                  {project.members.map((member, index) => (
                    <div key={member.id || index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {getInitials(`${member.firstName} ${member.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{member.firstName} {member.lastName}</div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveTeamMember(member.id)}
                        disabled={updating}
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No team members assigned to this project.</p>
                  <p className="text-sm">Click "Add Members" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <span className="ml-1 text-sm font-medium">{project.type}</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <span className="ml-1 text-sm font-medium">{project.priority}</span>
                </div>
                {project.duration && (
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="ml-1 text-sm font-medium">{project.duration}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 