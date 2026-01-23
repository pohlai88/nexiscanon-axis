"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
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

export interface StackedAreaDataPoint {
  label: string
  [key: string]: string | number
}

export interface StackedAreaChart01Props {
  data: StackedAreaDataPoint[]
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
  stackOffset?: "none" | "expand" | "wiggle" | "silhouette"
  curveType?: "natural" | "linear" | "step" | "monotone"
  showGrid?: boolean
  className?: string
}

export function StackedAreaChart01({
  data,
  config,
  dataKeys,
  labelKey = "label",
  title = "Stacked Area Chart",
  description,
  trend,
  footerText,
  stackOffset = "none",
  curveType = "natural",
  showGrid = true,
  className,
}: StackedAreaChart01Props) {
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12, top: 12 }}
            stackOffset={stackOffset}
          >
            {showGrid && <CartesianGrid vertical={false} />}
            <XAxis
              dataKey={labelKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                typeof value === "string" && value.length > 3
                  ? value.slice(0, 3)
                  : value
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                dataKey={key}
                type={curveType}
                fill={config[key]?.color || colors[index % colors.length]}
                fillOpacity={0.4}
                stroke={config[key]?.color || colors[index % colors.length]}
                stackId="a"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {(trend || footerText) && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
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
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
