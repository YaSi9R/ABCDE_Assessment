"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import ItemCard from "@/components/shop/item-card"
import CartModal from "@/components/shop/cart-modal"
import OrderHistoryModal from "@/components/shop/order-history-modal"

const API_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

interface Item {
  id: number
  name: string
  description: string
  price: number
}

interface CartItem {
  id: number
  item_id: number
  item_name: string
  price: number
  quantity: number
}

export default function ShopPage() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showCartModal, setShowCartModal] = useState(false)
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    const storedUserId = localStorage.getItem("userId")

    if (!storedToken || !storedUserId) {
      router.push("/auth/login")
      return
    }

    setToken(storedToken)
    setUserId(Number.parseInt(storedUserId))
    fetchItems(storedToken)
  }, [router])

  const fetchItems = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/items`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      const data = await response.json()
      setItems(data || [])
      setError("")
    } catch (err) {
      setError("Failed to load items")
      console.error("Error fetching items:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCart = async () => {
    if (!token) return
    try {
      const response = await fetch(`${API_URL}/api/carts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (Array.isArray(data)) {
        const userCart = data.find((cart: any) => cart.user_id === userId)
        if (userCart) {
          const cartItems = userCart.items.map((item: any) => ({
            id: userCart.id,
            item_id: item.item_id,
            item_name: items.find((i) => i.id === item.item_id)?.name || `Item ${item.item_id}`,
            price: items.find((i) => i.id === item.item_id)?.price || 0,
            quantity: item.quantity,
          }))
          setCartItems(cartItems)
        }
      }
    } catch (err) {
      console.error("Error fetching cart:", err)
    }
  }

  const handleAddToCart = async (itemId: number, itemName: string, price: number) => {
    if (!token || userId === null) return

    try {
      const response = await fetch(`${API_URL}/api/carts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, item_id: itemId, quantity: 1 }),
      })

      if (response.ok) {
        toast({
          title: "Added to cart",
          description: `${itemName} has been added to your cart`,
        })
        await fetchCart()
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    }
  }

  const handleShowCart = async () => {
    await fetchCart()
    setShowCartModal(true)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      window.alert("Your cart is empty")
      return
    }

    if (!token || userId === null) return

    setCheckoutLoading(true)
    try {
      const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          cart_id: cartItems[0]?.id,
          items: cartItems.map((item) => ({ item_id: item.item_id, quantity: item.quantity })),
          total: totalPrice,
        }),
      })

      if (response.ok) {
        const orderData = await response.json()

        await fetch(`${API_URL}/api/carts?userId=${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setCartItems([])
        setShowCartModal(false)

        // Redirect to success page with order ID
        router.push(`/shop/order-success?orderId=${orderData.id}`)
      } else {
        toast({
          title: "Error",
          description: "Failed to place order",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      })
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userId")
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ShopCart</h1>
          <div className="flex gap-3">
            <Button onClick={handleShowCart} variant="secondary" className="text-sm">
              Cart ({cartItems.length})
            </Button>
            <Button onClick={() => setShowOrderHistory(true)} variant="secondary" className="text-sm">
              Order History
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || checkoutLoading}
              className="text-sm bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {checkoutLoading ? "Processing..." : "Checkout"}
            </Button>
            <Button onClick={handleLogout} variant="destructive" className="text-sm">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-foreground">Available Items</h2>
          <p className="text-muted-foreground">Browse and add items to your cart</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onAddToCart={() => handleAddToCart(item.id, item.name, item.price)} />
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No items available</p>
          </div>
        )}
      </div>

      <CartModal isOpen={showCartModal} onClose={() => setShowCartModal(false)} cartItems={cartItems} />
      <OrderHistoryModal
        isOpen={showOrderHistory}
        onClose={() => setShowOrderHistory(false)}
        token={token!}
        userId={userId!}
      />
    </div>
  )
}
