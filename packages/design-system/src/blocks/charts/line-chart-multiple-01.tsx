"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
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

export interface LineMultipleDataPoint {
  label: string
  [key: string]: string | number
}

export interface LineChartMultiple01Props {
  data: LineMultipleDataPoint[]
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
  curveType?: "monotone" | "linear" | "natural" | "step"
  showDots?: boolean
  showGrid?: boolean
  className?: string
}

export function LineChartMultiple01({
  data,
  config,
  dataKeys,
  labelKey = "label",
  title = "Line Chart",
  description,
  trend,
  footerText,
  curveType = "monotone",
  showDots = false,
  showGrid = true,
  className,
}: LineChartMultiple01Props) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
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
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {dataKeys.map((key) => (
              <Line
                key={key}
                dataKey={key}
                type={curveType}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={showDots}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      {(trend || footerText) && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
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
                <div className="text-muted-foreground leading-none">
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
