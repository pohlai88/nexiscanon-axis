"use client"

import * as React from "react"
import { Grid, List, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/button"
import { Badge } from "@/components/badge"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/card"
import { cn } from "@/lib/utils"

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  image: string
  rating?: number
  reviewCount?: number
  badge?: string
  inStock?: boolean
  category?: string
}

export interface ProductList01Props {
  products: Product[]
  currency?: string
  columns?: 2 | 3 | 4
  viewMode?: "grid" | "list"
  showViewToggle?: boolean
  onAddToCart?: (product: Product) => void
  onProductClick?: (product: Product) => void
  className?: string
}

const columnClasses = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
}

export function ProductList01({
  products,
  currency = "$",
  columns = 4,
  viewMode: initialViewMode = "grid",
  showViewToggle = true,
  onAddToCart,
  onProductClick,
  className,
}: ProductList01Props) {
  const [viewMode, setViewMode] = React.useState(initialViewMode)

  const formatPrice = (price: number) => `${currency}${price.toFixed(2)}`

  const calculateDiscount = (price: number, originalPrice: number) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100)
  }

  const ViewToggle = () => (
    <div className="flex justify-end gap-2">
      <Button
        variant={viewMode === "grid" ? "default" : "outline"}
        size="icon"
        onClick={() => setViewMode("grid")}
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="icon"
        onClick={() => setViewMode("list")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )

  if (viewMode === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {showViewToggle && <ViewToggle />}
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex">
              <div
                className="relative h-40 w-40 shrink-0 cursor-pointer overflow-hidden bg-muted"
                onClick={() => onProductClick?.(product)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {product.badge && (
                  <Badge className="absolute top-2 left-2">{product.badge}</Badge>
                )}
              </div>
              <CardContent className="flex flex-1 flex-col p-4">
                <div className="flex-1">
                  <h3
                    className="font-semibold cursor-pointer hover:text-primary transition-colors duration-200"
                    onClick={() => onProductClick?.(product)}
                  >
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  {product.rating !== undefined && (
                    <div className="mt-2 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      {product.reviewCount !== undefined && (
                        <span className="text-sm text-muted-foreground">
                          ({product.reviewCount})
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <Badge variant="secondary">
                          -{calculateDiscount(product.price, product.originalPrice)}%
                        </Badge>
                      </>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddToCart?.(product)}
                    disabled={product.inStock === false}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {product.inStock === false ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showViewToggle && <ViewToggle />}
      <div className={cn("grid gap-4", columnClasses[columns])}>
        {products.map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div
              className="relative aspect-square cursor-pointer overflow-hidden bg-muted"
              onClick={() => onProductClick?.(product)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {product.badge && (
                <Badge className="absolute top-2 left-2">{product.badge}</Badge>
              )}
              {product.inStock === false && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <span className="text-sm font-medium text-muted-foreground">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3
                className="font-semibold truncate cursor-pointer hover:text-primary transition-colors duration-200"
                onClick={() => onProductClick?.(product)}
              >
                {product.name}
              </h3>
              {product.rating !== undefined && (
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{product.rating}</span>
                  {product.reviewCount !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({product.reviewCount})
                    </span>
                  )}
                </div>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="font-bold">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                className="w-full"
                size="sm"
                onClick={() => onAddToCart?.(product)}
                disabled={product.inStock === false}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
