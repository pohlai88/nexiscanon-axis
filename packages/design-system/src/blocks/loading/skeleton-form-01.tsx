"use client"

import * as React from "react"
import { Skeleton } from "../../components/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "../../components/card"
import { cn } from "../../lib/utils"

export interface SkeletonForm01Props {
  fields?: number
  showTitle?: boolean
  showDescription?: boolean
  showSubmit?: boolean
  className?: string
}

export function SkeletonForm01({
  fields = 3,
  showTitle = true,
  showDescription = true,
  showSubmit = true,
  className,
}: SkeletonForm01Props) {
  return (
    <Card className={cn("w-[400px]", className)}>
      <CardHeader>
        {showTitle && <Skeleton className="h-6 w-[200px]" />}
        {showDescription && <Skeleton className="h-4 w-[280px] mt-2" />}
      </CardHeader>
      <CardContent className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
      {showSubmit && (
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      )}
    </Card>
  )
}
