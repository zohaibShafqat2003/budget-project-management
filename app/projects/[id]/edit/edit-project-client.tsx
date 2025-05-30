"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2, ArrowLeft } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { getProjectById, updateProject, getClients, Project, Client } from "@/lib/db"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

type EditProjectClientProps = {
  id: string;
}

export function EditProjectClient({ id }: EditProjectClientProps) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    nameOfClient: "",
    type: "Scrum",
    status: "Not Started",
    priority: "Medium",
    totalBudget: "",
    approxValueOfServices: "",
    narrativeDescription: "",
    actualServicesDescription: "",
    country: "",
    city: "",
  })

  // Use the id prop directly
  const projectId = id

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch clients
        const clientsData = await getClients()
        setClients(clientsData)
        
        // Fetch project details
        const projectData = await getProjectById(projectId)
        setProject(projectData)
        
        // Initialize form data with project values
        setFormData({
          name: projectData.name || "",
          clientId: projectData.clientId || "",
          nameOfClient: projectData.nameOfClient || "",
          type: projectData.type || "Scrum",
          status: projectData.status || "Not Started",
          priority: projectData.priority || "Medium",
          totalBudget: projectData.totalBudget ? projectData.totalBudget.toString() : "",
          approxValueOfServices: projectData.approxValueOfServices ? projectData.approxValueOfServices.toString() : "",
          narrativeDescription: projectData.narrativeDescription || "",
          actualServicesDescription: projectData.actualServicesDescription || "",
          country: projectData.country || "",
          city: projectData.city || "",
        })
        
        // Set dates
        if (projectData.startDate) {
          setStartDate(new Date(projectData.startDate))
        }
        if (projectData.completionDate) {
          setEndDate(new Date(projectData.completionDate))
        }
        
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return
    
    try {
      setUpdating(true)
      setError(null)
      
      let projectDataToSend: Partial<Project> = {
        ...formData,
        totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : 0,
        approxValueOfServices: formData.approxValueOfServices 
          ? parseFloat(formData.approxValueOfServices) 
          : undefined,
      }

      if (startDate) {
        projectDataToSend.startDate = startDate
      }

      if (endDate) {
        projectDataToSend.completionDate = endDate
      }

      // If no clientId is selected but nameOfClient is provided, use that
      if (!formData.clientId && formData.nameOfClient) {
        projectDataToSend.nameOfClient = formData.nameOfClient
        delete projectDataToSend.clientId // Ensure we don't send an empty clientId
      }

      // Use project.id for the API call, but projectId for navigation
      const updatedProject = await updateProject(project.id, projectDataToSend)
      router.push(`/projects/${projectId}`)
    } catch (err: any) {
      console.error("Failed to update project:", err)
      setError(err.message || "Failed to update project. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !project) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 mt-6 text-center text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
        </Button>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground">Update project details</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Update the information about your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input 
                  id="name"
                  name="name"
                  placeholder="Enter project name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">Client</Label>
                <div className="space-y-4">
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => handleSelectChange("clientId", value)}
                  >
                    <SelectTrigger id="clientId">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Client</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formData.clientId === "" && (
                    <div className="pt-2">
                      <Label htmlFor="nameOfClient">Or enter client name manually</Label>
                      <Input
                        id="nameOfClient"
                        name="nameOfClient"
                        placeholder="Enter client name manually"
                        value={formData.nameOfClient}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="totalBudget">Total Budget ($)</Label>
                <Input 
                  id="totalBudget"
                  name="totalBudget"
                  type="number" 
                  placeholder="Enter budget amount" 
                  value={formData.totalBudget}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approxValueOfServices">Approximate Value of Services ($)</Label>
                <Input 
                  id="approxValueOfServices"
                  name="approxValueOfServices"
                  type="number" 
                  placeholder="Enter value amount" 
                  value={formData.approxValueOfServices}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type">Project Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scrum">Scrum</SelectItem>
                    <SelectItem value="Kanban">Kanban</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
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

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange("priority", value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country"
                  name="country"
                  placeholder="Enter country" 
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city"
                  name="city"
                  placeholder="Enter city" 
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="narrativeDescription">Narrative Description</Label>
              <Textarea 
                id="narrativeDescription"
                name="narrativeDescription"
                placeholder="Describe the project in detail" 
                className="min-h-[100px]" 
                value={formData.narrativeDescription}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualServicesDescription">Actual Services Description</Label>
              <Textarea 
                id="actualServicesDescription"
                name="actualServicesDescription"
                placeholder="Describe the services provided" 
                className="min-h-[100px]" 
                value={formData.actualServicesDescription}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => router.back()} disabled={updating}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
} 