"use client"

import * as React from "react"
import { Skeleton } from "../../components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table"
import { cn } from "../../lib/utils"

export interface SkeletonTable01Props {
  columns?: number
  rows?: number
  showHeader?: boolean
  className?: string
}

export function SkeletonTable01({
  columns = 4,
  rows = 5,
  showHeader = true,
  className,
}: SkeletonTable01Props) {
  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-md border">
        <Table>
          {showHeader && (
            <TableHeader>
              <TableRow>
                {Array.from({ length: columns }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton
                      className="h-4"
                      style={{ width: colIndex === 0 ? 120 : 80 }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
