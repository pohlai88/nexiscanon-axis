"use client"

import * as React from "react"
import { Minus, Plus, X } from "lucide-react"
import { Button } from "@/components/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card"
import { Separator } from "@/components/separator"
import { cn } from "@/lib/utils"

export interface CartItem {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  image?: string
  variant?: string
  maxQuantity?: number
}

export interface ShoppingCart01Props {
  items: CartItem[]
  currency?: string
  onUpdateQuantity?: (id: string, quantity: number) => void
  onRemoveItem?: (id: string) => void
  onCheckout?: () => void
  onContinueShopping?: () => void
  showTax?: boolean
  taxRate?: number
  shippingCost?: number
  freeShippingThreshold?: number
  className?: string
}

export function ShoppingCart01({
  items,
  currency = "$",
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  showTax = true,
  taxRate = 0.1,
  shippingCost = 0,
  freeShippingThreshold,
  className,
}: ShoppingCart01Props) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const tax = showTax ? subtotal * taxRate : 0
  const shipping =
    freeShippingThreshold && subtotal >= freeShippingThreshold
      ? 0
      : shippingCost
  const total = subtotal + tax + shipping

  const formatPrice = (price: number) => {
    return `${currency}${price.toFixed(2)}`
  }

  if (items.length === 0) {
    return (
      <Card className={cn("w-full max-w-2xl", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-muted-foreground mb-4">
            <svg
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add items to get started
          </p>
          {onContinueShopping && (
            <Button onClick={onContinueShopping}>Continue Shopping</Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Shopping Cart</span>
          <span className="text-sm font-normal text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            {item.image && (
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  {item.variant && (
                    <p className="text-sm text-muted-foreground">
                      {item.variant}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveItem?.(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onUpdateQuantity?.(item.id, Math.max(1, item.quantity - 1))
                    }
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      onUpdateQuantity?.(item.id, item.quantity + 1)
                    }
                    disabled={
                      item.maxQuantity !== undefined &&
                      item.quantity >= item.maxQuantity
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <span className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}

        <Separator />

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {showTax && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Tax ({(taxRate * 100).toFixed(0)}%)
              </span>
              <span>{formatPrice(tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {shipping === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>
          {freeShippingThreshold && subtotal < freeShippingThreshold && (
            <p className="text-xs text-muted-foreground">
              Add {formatPrice(freeShippingThreshold - subtotal)} more for free
              shipping
            </p>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" onClick={onCheckout}>
          Proceed to Checkout
        </Button>
        {onContinueShopping && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onContinueShopping}
          >
            Continue Shopping
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
