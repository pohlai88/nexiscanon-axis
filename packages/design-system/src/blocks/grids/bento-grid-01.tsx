"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BentoGridItem {
  id: string
  title?: string
  description?: string
  content?: React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
  className?: string
  colSpan?: 1 | 2 | 3 | 4
  rowSpan?: 1 | 2 | 3
}

export interface BentoGrid01Props {
  items: BentoGridItem[]
  columns?: 2 | 3 | 4
  gap?: "sm" | "md" | "lg"
  className?: string
}

const gapClasses = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
}

const columnClasses = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
}

const colSpanClasses = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
}

const rowSpanClasses = {
  1: "md:row-span-1",
  2: "md:row-span-2",
  3: "md:row-span-3",
}

export function BentoGrid01({
  items,
  columns = 3,
  gap = "md",
  className,
}: BentoGrid01Props) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 auto-rows-[minmax(180px,auto)]",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {items.map((item) => (
        <BentoGridCard key={item.id} {...item} />
      ))}
    </div>
  )
}

function BentoGridCard({
  title,
  description,
  content,
  header,
  icon,
  className,
  colSpan = 1,
  rowSpan = 1,
}: BentoGridItem) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md",
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        className
      )}
    >
      {header && (
        <div className="mb-4 overflow-hidden rounded-lg">{header}</div>
      )}

      <div className="flex flex-1 flex-col">
        {icon && (
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}

        {title && (
          <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
        )}

        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {content && <div className="mt-auto pt-4">{content}</div>}
      </div>
    </div>
  )
}

// Export a skeleton variant for loading states
export function BentoGridSkeleton({
  count = 6,
  columns = 3,
  gap = "md",
  className,
}: {
  count?: number
  columns?: 2 | 3 | 4
  gap?: "sm" | "md" | "lg"
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 auto-rows-[minmax(180px,auto)]",
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border bg-muted/50 p-6"
        >
          <div className="mb-4 h-10 w-10 rounded-lg bg-muted" />
          <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
