"use client"

import * as React from "react"
import { Check, Copy, Package, Truck } from "lucide-react"
import { Button } from "../../components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/card"
import { Badge } from "../../components/badge"
import { Separator } from "../../components/separator"
import { cn } from "../../lib/utils"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  variant?: string
}

export interface OrderAddress {
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface OrderSummary01Props {
  orderId: string
  orderDate: string
  status: OrderStatus
  items: OrderItem[]
  shippingAddress: OrderAddress
  billingAddress?: OrderAddress
  subtotal: number
  tax: number
  shipping: number
  discount?: number
  total: number
  currency?: string
  trackingNumber?: string
  estimatedDelivery?: string
  onTrackOrder?: () => void
  onContactSupport?: () => void
  onReorder?: () => void
  className?: string
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500",
    icon: <Package className="h-4 w-4" />,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-500",
    icon: <Package className="h-4 w-4" />,
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-500",
    icon: <Truck className="h-4 w-4" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-500",
    icon: <Check className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500",
    icon: <Package className="h-4 w-4" />,
  },
}

export function OrderSummary01({
  orderId,
  orderDate,
  status,
  items,
  shippingAddress,
  billingAddress,
  subtotal,
  tax,
  shipping,
  discount,
  total,
  currency = "$",
  trackingNumber,
  estimatedDelivery,
  onTrackOrder,
  onContactSupport,
  onReorder,
  className,
}: OrderSummary01Props) {
  const [copied, setCopied] = React.useState(false)

  const formatPrice = (price: number) => `${currency}${price.toFixed(2)}`

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusInfo = statusConfig[status]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Order #{orderId}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={copyOrderId}
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </CardTitle>
              <CardDescription>Placed on {orderDate}</CardDescription>
            </div>
            <Badge
              className={cn(
                "flex items-center gap-1 text-white",
                statusInfo.color
              )}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        {(trackingNumber || estimatedDelivery) && (
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              {trackingNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tracking Number
                  </span>
                  <span className="text-sm font-medium">{trackingNumber}</span>
                </div>
              )}
              {estimatedDelivery && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">
                    Estimated Delivery
                  </span>
                  <span className="text-sm font-medium">
                    {estimatedDelivery}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        )}
        {onTrackOrder && status === "shipped" && (
          <CardFooter>
            <Button onClick={onTrackOrder} className="w-full sm:w-auto">
              <Truck className="mr-2 h-4 w-4" />
              Track Order
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              {item.image && (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.variant && (
                    <p className="text-sm text-muted-foreground">
                      {item.variant}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>
            {discount && discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Addresses */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <address className="text-sm not-italic text-muted-foreground">
              {shippingAddress.name}
              <br />
              {shippingAddress.street}
              <br />
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.zipCode}
              <br />
              {shippingAddress.country}
            </address>
          </CardContent>
        </Card>
        {billingAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <address className="text-sm not-italic text-muted-foreground">
                {billingAddress.name}
                <br />
                {billingAddress.street}
                <br />
                {billingAddress.city}, {billingAddress.state}{" "}
                {billingAddress.zipCode}
                <br />
                {billingAddress.country}
              </address>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      {(onContactSupport || onReorder) && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {onReorder && (
            <Button variant="outline" onClick={onReorder}>
              Reorder Items
            </Button>
          )}
          {onContactSupport && (
            <Button variant="outline" onClick={onContactSupport}>
              Contact Support
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
