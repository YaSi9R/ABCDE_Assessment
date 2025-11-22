import { type NextRequest, NextResponse } from "next/server"

// In-memory carts store
interface CartItem {
  item_id: number
  quantity: number
}

interface Cart {
  id: number
  user_id: number
  items: CartItem[]
  created_at: string
}

const carts: Cart[] = []
let nextCartId = 1

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Token required" }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, item_id, quantity = 1 } = body

    if (!user_id || !item_id) {
      return NextResponse.json({ message: "user_id and item_id required" }, { status: 400 })
    }

    // Find or create cart for user
    let cart = carts.find((c) => c.user_id === user_id)

    if (!cart) {
      cart = {
        id: nextCartId++,
        user_id,
        items: [],
        created_at: new Date().toISOString(),
      }
      carts.push(cart)
    }

    // Add or update item in cart
    const existingItem = cart.items.find((i) => i.item_id === item_id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({ item_id, quantity })
    }

    return NextResponse.json(cart, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "")
  if (!token) {
    return NextResponse.json({ message: "Token required" }, { status: 401 })
  }

  return NextResponse.json(carts, { status: 200 })
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ message: "Token required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ message: "userId required" }, { status: 400 })
    }

    const cartIndex = carts.findIndex((c) => c.user_id === Number.parseInt(userId))
    if (cartIndex !== -1) {
      carts[cartIndex].items = []
      return NextResponse.json({ message: "Cart cleared" }, { status: 200 })
    }

    return NextResponse.json({ message: "Cart not found" }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
