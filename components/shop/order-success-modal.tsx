"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"

interface OrderSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  orderId?: number
}

export default function OrderSuccessModal({ isOpen, onClose, orderId }: OrderSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">Order Successful!</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Your order has been placed successfully</p>
            {orderId && (
              <p className="text-sm font-semibold">
                Order ID: <span className="text-primary">{orderId}</span>
              </p>
            )}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">What's next?</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ We've received your order</li>
              <li>✓ You'll receive a confirmation email</li>
              <li>✓ Track your order in Order History</li>
            </ul>
          </div>

          <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90">
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
