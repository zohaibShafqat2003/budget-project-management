import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { generateProjectInsights } from "@/lib/ai"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    const project = await db.getProjectById(projectId)
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const tasks = await db.getTasksByProjectId(projectId)
    const budgetEntries = await db.getBudgetEntriesByProjectId(projectId)

    const insights = await generateProjectInsights(project, tasks, budgetEntries)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("AI insights generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
