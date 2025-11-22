"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Item {
  id: number
  name: string
  description: string
  price: number
}

interface ItemCardProps {
  item: Item
  onAddToCart: () => void
}

export default function ItemCard({ item, onAddToCart }: ItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
        <p className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={onAddToCart} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
