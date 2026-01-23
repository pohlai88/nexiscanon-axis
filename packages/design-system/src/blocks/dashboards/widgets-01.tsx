"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card"
import { Button } from "@/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu"
import { cn } from "@/lib/utils"

// === Stat Widget ===
export interface StatWidgetProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    direction: "up" | "down"
  }
  icon?: React.ReactNode
  className?: string
}

export function StatWidget({
  title,
  value,
  description,
  trend,
  icon,
  className,
}: StatWidgetProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  "flex items-center font-medium",
                  trend.direction === "up"
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                {trend.direction === "up" ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {trend.value}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// === Quick Actions Widget ===
export interface QuickAction {
  id: string
  label: string
  icon?: React.ReactNode
  onClick?: () => void
}

export interface QuickActionsWidgetProps {
  title?: string
  actions: QuickAction[]
  columns?: 2 | 3 | 4
  className?: string
}

export function QuickActionsWidget({
  title = "Quick Actions",
  actions,
  columns = 2,
  className,
}: QuickActionsWidgetProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-2", gridCols[columns])}>
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={action.onClick}
            >
              {action.icon && <div className="text-primary">{action.icon}</div>}
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// === Activity Widget ===
export interface ActivityItem {
  id: string
  title: string
  description?: string
  time: string
  icon?: React.ReactNode
  status?: "success" | "warning" | "error" | "info"
}

export interface ActivityWidgetProps {
  title?: string
  activities: ActivityItem[]
  maxItems?: number
  onViewAll?: () => void
  className?: string
}

export function ActivityWidget({
  title = "Recent Activity",
  activities,
  maxItems = 5,
  onViewAll,
  className,
}: ActivityWidgetProps) {
  const statusColors = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, maxItems).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              {activity.icon ? (
                <div className="text-muted-foreground">{activity.icon}</div>
              ) : (
                <div
                  className={cn(
                    "mt-1.5 h-2 w-2 rounded-full",
                    activity.status
                      ? statusColors[activity.status]
                      : "bg-primary"
                  )}
                />
              )}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// === List Widget ===
export interface ListWidgetItem {
  id: string
  title: string
  subtitle?: string
  value?: string | number
  icon?: React.ReactNode
  actions?: Array<{
    label: string
    onClick: () => void
  }>
}

export interface ListWidgetProps {
  title: string
  description?: string
  items: ListWidgetItem[]
  maxItems?: number
  onViewAll?: () => void
  className?: string
}

export function ListWidget({
  title,
  description,
  items,
  maxItems = 5,
  onViewAll,
  className,
}: ListWidgetProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.slice(0, maxItems).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {item.icon}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium leading-none">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-sm font-medium">{item.value}</span>
                )}
                {item.actions && item.actions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.actions.map((action, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={action.onClick}
                        >
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
