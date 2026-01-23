"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/card"
import { Badge } from "../../components/badge"
import { cn } from "../../lib/utils"

export interface SectionStatCard {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label?: string
    direction: "up" | "down" | "neutral"
  }
  icon?: React.ComponentType<{ className?: string }>
}

export interface SectionCards01Props {
  cards: SectionStatCard[]
  columns?: 2 | 3 | 4
  className?: string
}

export function SectionCards01({
  cards,
  columns = 4,
  className,
}: SectionCards01Props) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-4 px-4 lg:px-6", gridCols[columns], className)}>
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon && <card.icon className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center gap-2">
              {card.trend && (
                <Badge
                  variant={card.trend.direction === "up" ? "default" : card.trend.direction === "down" ? "destructive" : "secondary"}
                  className="gap-1"
                >
                  {card.trend.direction === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : card.trend.direction === "down" ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  {card.trend.value > 0 ? "+" : ""}{card.trend.value}%
                </Badge>
              )}
              {card.description && (
                <CardDescription className="text-xs">
                  {card.description}
                </CardDescription>
              )}
              {card.trend?.label && (
                <span className="text-xs text-muted-foreground">
                  {card.trend.label}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
