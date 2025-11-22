import { type NextRequest, NextResponse } from "next/server"

// Mock items database
const items = [
  { id: 1, name: "Laptop", price: 999.99, description: "High-performance laptop" },
  { id: 2, name: "Wireless Mouse", price: 29.99, description: "Ergonomic wireless mouse" },
  { id: 3, name: "USB-C Cable", price: 14.99, description: "Durable USB-C charging cable" },
  { id: 4, name: "Mechanical Keyboard", price: 129.99, description: "RGB mechanical keyboard" },
  { id: 5, name: "4K Monitor", price: 399.99, description: "Ultra HD 4K display" },
  { id: 6, name: "Headphones", price: 199.99, description: "Noise-cancelling headphones" },
  { id: 7, name: "Phone Stand", price: 19.99, description: "Adjustable phone stand" },
  { id: 8, name: "Webcam", price: 79.99, description: "1080p HD webcam" },
]

export async function GET(request: NextRequest) {
  return NextResponse.json(items, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, description } = body

    if (!name || price === undefined) {
      return NextResponse.json({ message: "Name and price required" }, { status: 400 })
    }

    const newItem = {
      id: Math.max(...items.map((i) => i.id)) + 1,
      name,
      price,
      description: description || "",
    }

    items.push(newItem)

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
