import { type NextRequest, NextResponse } from "next/server"

interface Order {
  id: number
  user_id: number
  cart_id: number
  items: Array<{ item_id: number; quantity: number }>
  total: number
  created_at: string
}

const orders: Order[] = []
let nextOrderId = 1

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Token required" }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, cart_id, items, total } = body

    if (!user_id || !cart_id || !items) {
      return NextResponse.json({ message: "user_id, cart_id, and items required" }, { status: 400 })
    }

    const newOrder: Order = {
      id: nextOrderId++,
      user_id,
      cart_id,
      items,
      total,
      created_at: new Date().toISOString(),
    }

    orders.push(newOrder)

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "")
  if (!token) {
    return NextResponse.json({ message: "Token required" }, { status: 401 })
  }

  return NextResponse.json(orders, { status: 200 })
}
