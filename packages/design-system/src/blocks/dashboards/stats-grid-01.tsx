"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/card"
import { cn } from "../../lib/utils"

export interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    trend: "up" | "down"
  }
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p
            className={cn(
              "text-xs",
              change.trend === "up" ? "text-green-600" : "text-red-600"
            )}
          >
            {change.trend === "up" ? "+" : ""}
            {change.value}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export interface StatsGrid01Props {
  stats: StatCardProps[]
  className?: string
}

export function StatsGrid01({ stats, className }: StatsGrid01Props) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  )
}
