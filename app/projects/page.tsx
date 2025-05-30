"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Filter, MoreHorizontal, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getProjects, getClients, Project, Client } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import * as React from "react"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    client: "all",
    country: "",
    city: "",
    priority: "all",
    type: "all",
  })
  
  // Get unique countries and cities from projects for filter options
  const countries = [...new Set(projects.filter(p => p.country).map(p => p.country))].filter(Boolean) as string[]
  const cities = [...new Set(projects.filter(p => p.city).map(p => p.city))].filter(Boolean) as string[]

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // Fetch clients for the client filter
        const clientsData = await getClients()
        setClients(clientsData)
        
        // Build API filters
        const apiFilters: Record<string, string> = {}
        
        // Only add filters that are not set to "all" or empty
        if (filters.status !== "all") {
          apiFilters.status = filters.status
        }
        
        if (filters.search) {
          apiFilters.name = filters.search
        }
        
        if (filters.client !== "all") {
          apiFilters.clientId = filters.client
        }
        
        if (filters.country) {
          apiFilters.country = filters.country
        }
        
        if (filters.city) {
          apiFilters.city = filters.city
        }
        
        if (filters.priority !== "all") {
          apiFilters.priority = filters.priority
        }
        
        if (filters.type !== "all") {
          apiFilters.type = filters.type
        }
        
        const data = await getProjects(apiFilters)
        setProjects(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch projects:", err)
        setError("Failed to load projects. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      status: "all",
      search: "",
      client: "all",
      country: "",
      city: "",
      priority: "all",
      type: "all",
    })
  }

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

  // Count how many active filters we have
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return !!value
    if (key === 'country' || key === 'city') return !!value
    return value !== 'all'
  }).length

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage and track all your projects</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            name="search"
            placeholder="Search projects..." 
            className="pl-8 w-full" 
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex gap-2">
          <Select 
            value={filters.status} 
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Review">Review</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Projects</SheetTitle>
                <SheetDescription>
                  Refine your project list with these filters
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Client</h3>
                  <Select 
                    value={filters.client} 
                    onValueChange={(value) => handleFilterChange("client", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Country</h3>
                  <Select 
                    value={filters.country} 
                    onValueChange={(value) => handleFilterChange("country", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Countries</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">City</h3>
                  <Select 
                    value={filters.city} 
                    onValueChange={(value) => handleFilterChange("city", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Priority</h3>
                  <Select 
                    value={filters.priority} 
                    onValueChange={(value) => handleFilterChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Type</h3>
                  <Select 
                    value={filters.type} 
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Scrum">Scrum</SelectItem>
                      <SelectItem value="Kanban">Kanban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter className="flex flex-row justify-between sm:justify-between gap-2">
                <Button variant="outline" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
                <SheetClose asChild>
                  <Button>Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-700">
          {error}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Timeline</TableHead>
                <TableHead className="hidden md:table-cell">Budget</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <Link href={`/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{project.projectIdStr}</div>
                    </TableCell>
                    <TableCell>{project.client?.name || project.nameOfClient || "N/A"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {project.startDate ? formatDate(new Date(project.startDate)) : "N/A"} - {" "}
                      {project.completionDate ? formatDate(new Date(project.completionDate)) : "Ongoing"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      ${project.totalBudget ? project.totalBudget.toLocaleString() : "0"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {project.city && project.country ? 
                        `${project.city}, ${project.country}` : 
                        (project.city || project.country || "N/A")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(project.status)} text-white`}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {project.members && project.members.length > 0 ? (
                        <div className="flex -space-x-2">
                          {project.members.slice(0, 3).map((member, index) => (
                            <Avatar key={index} className="h-8 w-8 border-2 border-background">
                              <AvatarFallback>
                                {getInitials(`${member.firstName} ${member.lastName}`)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {project.members.length > 3 && (
                            <Avatar className="h-8 w-8 border-2 border-background">
                              <AvatarFallback>+{project.members.length - 3}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No team members</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}/edit`}>Edit Project</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${project.id}/team`}>Manage Team</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
