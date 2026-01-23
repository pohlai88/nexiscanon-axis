"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/chart"
import { cn } from "@/lib/utils"

export interface RadarDotsDataPoint {
  label: string
  value: number
}

export interface RadarChartDots01Props {
  data: RadarDotsDataPoint[]
  dataKey?: string
  labelKey?: string
  color?: string
  title?: string
  description?: string
  trend?: {
    value: number
    direction: "up" | "down"
    label?: string
  }
  footerText?: string
  dotRadius?: number
  fillOpacity?: number
  maxHeight?: number
  className?: string
}

export function RadarChartDots01({
  data,
  dataKey = "value",
  labelKey = "label",
  color = "var(--chart-1)",
  title = "Radar Chart",
  description,
  trend,
  footerText,
  dotRadius = 4,
  fillOpacity = 0.6,
  maxHeight = 250,
  className,
}: RadarChartDots01Props) {
  const chartConfig: ChartConfig = {
    [dataKey]: {
      label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
      color,
    },
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="items-center">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square"
          style={{ maxHeight }}
        >
          <RadarChart data={data}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey={labelKey} />
            <PolarGrid />
            <Radar
              dataKey={dataKey}
              fill={color}
              fillOpacity={fillOpacity}
              dot={{
                r: dotRadius,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      {(trend || footerText) && (
        <CardFooter className="flex-col gap-2 text-sm">
          {trend && (
            <div className="flex items-center gap-2 leading-none font-medium">
              {trend.direction === "up" ? "Trending up" : "Trending down"} by{" "}
              {trend.value}% {trend.label || "this month"}
              {trend.direction === "up" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          )}
          {footerText && (
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {footerText}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
