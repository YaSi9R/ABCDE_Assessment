"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CartItem {
  id: number
  item_id: number
  item_name: string
  price: number
  quantity: number
}

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
}

export default function CartModal({ isOpen, onClose, cartItems }: CartModalProps) {
  if (!isOpen) return null

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleShowCart = () => {
    const cartSummary = cartItems.map((item) => `Cart ID: ${item.id}, Item ID: ${item.item_id}`).join("\n")
    window.alert(`Cart Items:\n${cartSummary}\n\nTotal: $${total.toFixed(2)}`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Shopping Cart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <div className="p-4 border-t flex gap-2">
          {cartItems.length > 0 && (
            <Button onClick={handleShowCart} variant="outline" className="flex-1 bg-transparent">
              View Details
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}
