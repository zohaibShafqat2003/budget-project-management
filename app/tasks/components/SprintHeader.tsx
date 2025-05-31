"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
  ArrowLeft,
  Calendar,
  Play,
  Check,
  HelpCircle
} from "lucide-react"
import { Sprint, Story } from "@/lib/db"

interface SprintHeaderProps {
  sprint: Sprint | null
  stories: Story[]
  onStartSprint?: () => Promise<void>
  onCompleteSprint?: () => Promise<void>
}

export function SprintHeader({ sprint, stories, onStartSprint, onCompleteSprint }: SprintHeaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (stories.length === 0) {
      setProgress(0)
      return
    }
    
    const doneStories = stories.filter(story => story.status === 'Done')
    const progressValue = Math.round((doneStories.length / stories.length) * 100)
    setProgress(progressValue)
  }, [stories])

  if (!sprint) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4 text-center">
          <HelpCircle className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No active sprint selected.</p>
          <Button variant="outline" size="sm" className="mt-2">
            <Play className="h-4 w-4 mr-2" />
            Create Sprint
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Format dates
  const startDate = new Date(sprint.startDate)
  const endDate = new Date(sprint.endDate)
  const formattedStartDate = format(startDate, 'MMM d, yyyy')
  const formattedEndDate = format(endDate, 'MMM d, yyyy')

  // Calculate remaining days
  const today = new Date()
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  
  // Calculate sprint timeline progress (as percentage)
  const timelineProgress = Math.min(100, Math.round((elapsedDays / totalDays) * 100))

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold">{sprint.name}</h2>
              <Badge variant={sprint.status === 'Active' ? 'default' : (sprint.status === 'Completed' ? 'success' : 'secondary')}>
                {sprint.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {sprint.goal || "No sprint goal set"}
            </p>
          </div>
          <div className="mt-3 md:mt-0 flex gap-2">
            {sprint.status === 'Planning' && onStartSprint && (
              <Button size="sm" onClick={onStartSprint}>
                <Play className="h-4 w-4 mr-2" />
                Start Sprint
              </Button>
            )}
            {sprint.status === 'Active' && onCompleteSprint && (
              <Button size="sm" variant="outline" onClick={onCompleteSprint}>
                <Check className="h-4 w-4 mr-2" />
                Complete Sprint
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Timeline</span>
              </div>
              <span className="text-sm">
                {formattedStartDate} - {formattedEndDate}
              </span>
            </div>
            <Progress value={timelineProgress} className="h-2" />
            <div className="flex justify-between text-xs mt-1">
              <span>{totalDays} days total</span>
              <span className="text-muted-foreground">{remainingDays} days remaining</span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Sprint Progress</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs mt-1">
              <span>{stories.filter(s => s.status === 'Done').length}/{stories.length} stories completed</span>
              <span className="text-muted-foreground">
                {stories.filter(s => s.status !== 'Done' && s.status !== 'Blocked').length} in progress
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 