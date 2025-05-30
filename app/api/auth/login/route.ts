import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // For demo purposes, accept demo credentials
    if (email === "demo@example.com" && password === "demo123") {
      const user = await db.findUserByEmail(email)
      if (user) {
        const token = generateToken({ userId: user.id, email: user.email })
        return NextResponse.json({
          user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
          token,
        })
      }
    }

    const user = await db.findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // In a real app, you'd verify the hashed password
    // const isValid = await verifyPassword(password, user.hashedPassword)
    // For demo, we'll accept any password for existing users

    const token = generateToken({ userId: user.id, email: user.email })

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
