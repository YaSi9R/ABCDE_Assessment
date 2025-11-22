"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Order {
  id: number
  created_at: string
}

interface OrderHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  token: string
  userId: number
}

const API_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

export default function OrderHistoryModal({ isOpen, onClose, token, userId }: OrderHistoryModalProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchOrders()
    }
  }, [isOpen])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      const userOrders = Array.isArray(data) ? data.filter((order: any) => order.user_id === userId) : []
      setOrders(userOrders)
    } catch (err) {
      console.error("Error fetching orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleShowOrders = () => {
    if (orders.length === 0) {
      window.alert("No orders found")
      return
    }
    const orderSummary = orders.map((order) => `Order ID: ${order.id}`).join("\n")
    window.alert(`Your Orders:\n${orderSummary}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {orders.map((order) => (
                <div key={order.id} className="p-2 border rounded">
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t flex gap-2">
          <Button onClick={handleShowOrders} variant="outline" className="flex-1 bg-transparent">
            View All Orders
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}
