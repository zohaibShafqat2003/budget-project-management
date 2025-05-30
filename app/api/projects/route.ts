import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projects = await db.getProjectsByUserId(authUser.userId)
    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, budget, startDate, endDate } = await request.json()

    if (!name || !description || !budget) {
      return NextResponse.json({ error: "Name, description, and budget are required" }, { status: 400 })
    }

    const project = await db.createProject({
      name,
      description,
      budget: Number.parseFloat(budget),
      spent: 0,
      status: "planning",
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      ownerId: authUser.userId,
      teamMembers: [authUser.userId],
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Create project error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
