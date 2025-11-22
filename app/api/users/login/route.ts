import { type NextRequest, NextResponse } from "next/server"

// Access the in-memory store
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password required" }, { status: 400 })
    }

    // Get users from global scope (this is a simplified approach for demo)
    // In production, use a real database
    const response = await fetch(new URL("/api/users", request.url).toString())
    const allUsers = await response.json()

    const user = allUsers.find((u: { id: number; username: string }) => u.username === username)

    if (!user) {
      return NextResponse.json({ message: "Invalid username/password" }, { status: 401 })
    }

    // In production, verify the password hash
    // For this demo, we'll accept the login
    const token = `token_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({ id: user.id, token, message: "Login successful" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
