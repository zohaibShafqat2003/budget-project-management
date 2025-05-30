import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
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

    const budgetEntries = await db.getBudgetEntriesByProjectId(projectId)
    return NextResponse.json({ budgetEntries })
  } catch (error) {
    console.error("Get budget entries error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const entryData = await request.json()
    const entry = await db.createBudgetEntry(entryData)

    return NextResponse.json({ entry }, { status: 201 })
  } catch (error) {
    console.error("Create budget entry error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
