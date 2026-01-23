"use client"

import * as React from "react"
import { Skeleton } from "@/components/skeleton"
import { cn } from "@/lib/utils"

export interface SkeletonCard01Props {
  imageHeight?: number
  lines?: number
  showImage?: boolean
  showAvatar?: boolean
  className?: string
}

export function SkeletonCard01({
  imageHeight = 125,
  lines = 2,
  showImage = true,
  showAvatar = false,
  className,
}: SkeletonCard01Props) {
  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      {showImage && (
        <Skeleton
          className="rounded-xl"
          style={{ height: imageHeight, width: 250 }}
        />
      )}
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[160px]" />
          </div>
        </div>
      )}
      {!showAvatar && (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4"
              style={{ width: 250 - i * 50 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
