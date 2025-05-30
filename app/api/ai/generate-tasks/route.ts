import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { generateTaskSuggestions } from "@/lib/ai"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, description } = await request.json()

    if (!projectId || !description) {
      return NextResponse.json({ error: "Project ID and description are required" }, { status: 400 })
    }

    // Get project and existing tasks
    const project = await db.getProjectById(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const existingTasks = await db.getTasksByProjectId(projectId)
    const existingTaskTitles = existingTasks.map((task) => task.title)

    const suggestions = await generateTaskSuggestions(description, existingTaskTitles, project.budget - project.spent)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("AI task generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
