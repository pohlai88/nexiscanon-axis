"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, Share2, ShoppingCart, Star } from "lucide-react"
import { Button } from "../../components/button"
import { Badge } from "../../components/badge"
import { Separator } from "../../components/separator"
import { cn } from "../../lib/utils"

export interface ProductImage {
  id: string
  src: string
  alt: string
}

export interface ProductVariant {
  id: string
  name: string
  values: Array<{
    id: string
    label: string
    available?: boolean
  }>
}

export interface ProductOverview01Props {
  name: string
  description?: string
  price: number
  originalPrice?: number
  currency?: string
  images: ProductImage[]
  rating?: number
  reviewCount?: number
  badge?: string
  variants?: ProductVariant[]
  features?: string[]
  inStock?: boolean
  onAddToCart?: (quantity: number, selectedVariants: Record<string, string>) => void
  onWishlist?: () => void
  onShare?: () => void
  className?: string
}

export function ProductOverview01({
  name,
  description,
  price,
  originalPrice,
  currency = "$",
  images,
  rating,
  reviewCount,
  badge,
  variants = [],
  features = [],
  inStock = true,
  onAddToCart,
  onWishlist,
  onShare,
  className,
}: ProductOverview01Props) {
  const [selectedImage, setSelectedImage] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)
  const [selectedVariants, setSelectedVariants] = React.useState<
    Record<string, string>
  >({})

  const formatPrice = (p: number) => `${currency}${p.toFixed(2)}`

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  const handleVariantChange = (variantName: string, valueId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: valueId }))
  }

  const handleAddToCart = () => {
    onAddToCart?.(quantity, selectedVariants)
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className={cn("grid gap-8 lg:grid-cols-2", className)}>
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {images[selectedImage] && (
            <img
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              className="h-full w-full object-cover"
            />
          )}
          {badge && (
            <Badge className="absolute top-4 left-4">{badge}</Badge>
          )}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors duration-200",
                  selectedImage === index
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground/30"
                )}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          {rating !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{rating}</span>
              {reviewCount !== undefined && (
                <span className="text-sm text-muted-foreground">
                  ({reviewCount} reviews)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">{formatPrice(price)}</span>
          {originalPrice && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
              <Badge variant="secondary">-{discount}%</Badge>
            </>
          )}
        </div>

        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}

        <Separator />

        {/* Variants */}
        {variants.map((variant) => (
          <div key={variant.id} className="space-y-3">
            <label className="text-sm font-medium">{variant.name}</label>
            <div className="flex flex-wrap gap-2">
              {variant.values.map((value) => (
                <button
                  key={value.id}
                  onClick={() => handleVariantChange(variant.name, value.id)}
                  disabled={value.available === false}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-200",
                    selectedVariants[variant.name] === value.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:border-primary",
                    value.available === false &&
                      "opacity-50 cursor-not-allowed line-through"
                  )}
                >
                  {value.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Quantity */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Quantity</label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1"
            size="lg"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
          {onWishlist && (
            <Button variant="outline" size="lg" onClick={onWishlist}>
              <Heart className="h-4 w-4" />
            </Button>
          )}
          {onShare && (
            <Button variant="outline" size="lg" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Features */}
        {features.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold">Features</h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
