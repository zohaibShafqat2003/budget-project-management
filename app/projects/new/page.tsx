"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2, Plus, Upload, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createProject, getClients, createClient, Project, Client } from "@/lib/db"
import { uploadAttachment } from "@/lib/api/attachments"
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

export default function NewProjectPage() {
  const router = useRouter()
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [loading, setLoading] = useState(false)
  const [clientLoading, setClientLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
    contactPerson: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    nameOfClient: "",
    type: "Scrum" as "Scrum" | "Kanban",
    status: "Not Started" as "Not Started" | "Active" | "In Progress" | "Review" | "Completed" | "Archived" | "On Hold",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    totalBudget: "",
    approxValueOfServices: "",
    narrativeDescription: "",
    actualServicesDescription: "",
    country: "",
    city: "",
  })

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setClientLoading(true)
      const data = await getClients()
      setClients(data)
    } catch (err) {
      console.error("Failed to fetch clients:", err)
    } finally {
      setClientLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNewClientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewClientData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateClient = async () => {
    if (!newClientData.name) {
      return
    }

    try {
      setClientLoading(true)
      const client = await createClient(newClientData)
      setClients(prev => [...prev, client])
      setFormData(prev => ({ ...prev, clientId: client.id }))
      setNewClientData({ name: "", email: "", phone: "", contactPerson: "" })
      setIsNewClientDialogOpen(false)
    } catch (err: any) {
      console.error("Failed to create client:", err)
      setError(err.message || "Failed to create client. Please try again.")
    } finally {
      setClientLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert form data to appropriate types
      const projectData: any = {
        ...formData,
        totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : 0,
        approxValueOfServices: formData.approxValueOfServices 
          ? parseFloat(formData.approxValueOfServices) 
          : undefined,
      }

      if (startDate) {
        projectData.startDate = startDate
      }

      if (endDate) {
        projectData.completionDate = endDate
      }

      // If no clientId is selected but nameOfClient is provided, use that
      if (!formData.clientId && formData.nameOfClient) {
        projectData.nameOfClient = formData.nameOfClient
        delete projectData.clientId // Since we're using any type, we can use delete
      }

      const project = await createProject(projectData)
      
      // Upload any attachments
      if (attachments.length > 0) {
        setUploadingFiles(true)
        try {
          for (let i = 0; i < attachments.length; i++) {
            await uploadAttachment(
              'projects',
              project.id,
              attachments[i],
              fileDescriptions[i] || '',
              false
            );
          }
        } catch (err: any) {
          console.error("Error uploading attachments:", err);
          // Continue with navigation even if attachments fail
        } finally {
          setUploadingFiles(false);
        }
      }
      
      router.push('/projects')
    } catch (err: any) {
      console.error("Failed to create project:", err)
      setError(err.message || "Failed to create project. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
      setFileDescriptions(prev => [
        ...prev,
        ...newFiles.map(() => '')
      ]);
    }
  };

  const handleFileDescriptionChange = (index: number, description: string) => {
    const newDescriptions = [...fileDescriptions];
    newDescriptions[index] = description;
    setFileDescriptions(newDescriptions);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setFileDescriptions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground">Add a new project to your portfolio</p>
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
            <CardDescription>Enter the basic information about your project</CardDescription>
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="clientId">Client</Label>
                  <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" type="button">
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Client
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogDescription>
                          Enter the client details below to create a new client.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="client-name">Name</Label>
                          <Input
                            id="client-name"
                            name="name"
                            placeholder="Enter client name"
                            value={newClientData.name}
                            onChange={handleNewClientInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="client-email">Email</Label>
                          <Input
                            id="client-email"
                            name="email"
                            type="email"
                            placeholder="Enter client email"
                            value={newClientData.email}
                            onChange={handleNewClientInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="client-phone">Phone</Label>
                          <Input
                            id="client-phone"
                            name="phone"
                            placeholder="Enter client phone"
                            value={newClientData.phone}
                            onChange={handleNewClientInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="client-contact">Contact Person</Label>
                          <Input
                            id="client-contact"
                            name="contactPerson"
                            placeholder="Enter contact person"
                            value={newClientData.contactPerson}
                            onChange={handleNewClientInputChange}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsNewClientDialogOpen(false)}
                          disabled={clientLoading}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateClient} 
                          disabled={!newClientData.name || clientLoading}
                        >
                          {clientLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : "Create Client"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
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
          </CardContent>
        </Card>

        {/* Attachments Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
            <CardDescription>Add files and documents to this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Project Files</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add Files
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {attachments.length === 0 ? (
                <div className="text-center py-8 border rounded-md border-dashed">
                  <p className="text-muted-foreground">No files attached</p>
                  <p className="text-sm text-muted-foreground">
                    Click "Add Files" to attach documents to this project
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex flex-col space-y-2 border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                            <Upload className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor={`file-desc-${index}`} className="text-xs">Description</Label>
                        <Input
                          id={`file-desc-${index}`}
                          placeholder="Add a description for this file"
                          value={fileDescriptions[index]}
                          onChange={(e) => handleFileDescriptionChange(index, e.target.value)}
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6 space-x-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploadingFiles}>
            {(loading || uploadingFiles) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loading ? "Creating..." : "Uploading Files..."}
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
