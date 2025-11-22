"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const handleContinueShopping = () => {
    router.push("/shop")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
          </div>
          <CardTitle className="text-3xl font-bold text-center">Order Successful!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
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

          <Button onClick={handleContinueShopping} className="w-full bg-primary hover:bg-primary/90">
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
