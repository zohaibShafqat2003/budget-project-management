"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Loader2, Plus, Trash2, UserPlus, UserMinus } from "lucide-react"
import Link from "next/link"
import { getProjectById, getUsers, addTeamMembers, removeTeamMembers, Project, User } from "@/lib/db"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ProjectTeamClientProps = {
  id: string;
}

export function ProjectTeamClient({ id }: ProjectTeamClientProps) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  // Use the id prop directly
  const projectId = id

  // Mock users for demonstration
  const mockUsers = [
    { id: "u1", firstName: "John", lastName: "Doe", email: "john@example.com" },
    { id: "u2", firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
    { id: "u3", firstName: "Mike", lastName: "Johnson", email: "mike@example.com" },
    { id: "u4", firstName: "Sarah", lastName: "Williams", email: "sarah@example.com" },
    { id: "u5", firstName: "Alex", lastName: "Brown", email: "alex@example.com" },
    { id: "u6", firstName: "Emily", lastName: "Davis", email: "emily@example.com" },
    { id: "u7", firstName: "David", lastName: "Wilson", email: "david@example.com" },
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch project details
        const projectData = await getProjectById(projectId)
        setProject(projectData)
        
        // Fetch all users from the backend API
        const usersData = await getUsers()
        setAllUsers(usersData)
        
        // Filter out users who are already team members
        const existingMemberIds = projectData.members?.map(m => m.id) || []
        setAvailableUsers(usersData.filter(user => !existingMemberIds.includes(user.id)))
        
        setError(null)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load project data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  const handleAddMembers = async () => {
    if (!project || selectedUsers.length === 0) return
    
    try {
      setUpdating(true)
      await addTeamMembers(project.id, selectedUsers)
      
      // Refresh project data
      const updatedProject = await getProjectById(projectId)
      setProject(updatedProject)
      
      // Update available users
      const existingMemberIds = updatedProject.members?.map(m => m.id) || []
      setAvailableUsers(allUsers.filter(user => !existingMemberIds.includes(user.id)))
      
      // Reset selection
      setSelectedUsers([])
      setShowAddDialog(false)
      
      setError(null)
    } catch (err) {
      console.error("Failed to add team members:", err)
      setError("Failed to add team members. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
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
      
      setError(null)
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
      <div className="p-6 max-w-4xl mx-auto">
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
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Link>
          </Button>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Team Members
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Team Members</DialogTitle>
              <DialogDescription>
                Select users to add to the project team.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
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
              
              {filteredAvailableUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  {searchTerm ? "No users match your search" : "No users available to add"}
                </p>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {filteredAvailableUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        value={user.id}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, user.id])
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id))
                          }
                        }}
                        checked={selectedUsers.includes(user.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor={`user-${user.id}`} className="flex items-center gap-2 flex-1 cursor-pointer">
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
              <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={updating}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddMembers} 
                disabled={updating || selectedUsers.length === 0}
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
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{project.name} - Team</h1>
        <p className="text-muted-foreground">Manage team members for this project</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {project.members?.length || 0} members assigned to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.members && project.members.length > 0 ? (
            <div className="space-y-4">
              {project.members.map((member, index) => (
                <div key={member.id || index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(`${member.firstName} ${member.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.firstName} {member.lastName}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No team members assigned to this project yet.</p>
              <p className="text-sm">Click the "Add Team Members" button to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 