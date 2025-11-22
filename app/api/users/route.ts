import { type NextRequest, NextResponse } from "next/server"

// In-memory database for demo purposes
const users: Array<{ id: number; username: string; password: string }> = []
const tokens: Map<string, { userId: number; createdAt: number }> = new Map()
let nextUserId = 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password required" }, { status: 400 })
    }

    // Check if user already exists
    if (users.some((u) => u.username === username)) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: nextUserId++,
      username,
      password, // In production, hash this!
    }

    users.push(newUser)

    return NextResponse.json(
      { id: newUser.id, username: newUser.username, message: "User created successfully" },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Return all users (without passwords)
  return NextResponse.json(
    users.map((u) => ({ id: u.id, username: u.username })),
    { status: 200 },
  )
}
