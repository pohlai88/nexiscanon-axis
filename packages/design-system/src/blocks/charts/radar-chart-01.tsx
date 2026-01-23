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

export interface RadarChartDataPoint {
  label: string
  [key: string]: string | number
}

export interface RadarChart01Props {
  data: RadarChartDataPoint[]
  config: ChartConfig
  dataKeys: string[]
  labelKey?: string
  title?: string
  description?: string
  trend?: {
    value: number
    direction: "up" | "down"
    label?: string
  }
  footerText?: string
  fillOpacity?: number
  showGrid?: boolean
  className?: string
}

export function RadarChart01({
  data,
  config,
  dataKeys,
  labelKey = "label",
  title = "Radar Chart",
  description,
  trend,
  footerText,
  fillOpacity = 0.6,
  showGrid = true,
  className,
}: RadarChart01Props) {
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

  return (
    <Card className={cn(className)}>
      <CardHeader className="items-center pb-4">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={data}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey={labelKey} />
            {showGrid && <PolarGrid />}
            {dataKeys.map((key, index) => (
              <Radar
                key={key}
                dataKey={key}
                fill={config[key]?.color || colors[index % colors.length]}
                fillOpacity={fillOpacity}
                stroke={config[key]?.color || colors[index % colors.length]}
              />
            ))}
          </RadarChart>
        </ChartContainer>
      </CardContent>
      {(trend || footerText) && (
        <CardFooter className="flex-col gap-2 text-sm">
          {trend && (
            <div className="flex items-center gap-2 leading-none font-medium">
              {trend.direction === "up" ? "Trending up" : "Trending down"} by {trend.value}%{" "}
              {trend.label || "this month"}
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
