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

export interface AreaStepDataPoint {
  label: string
  value: number
}

export interface AreaChartStep01Props {
  data: AreaStepDataPoint[]
  title?: string
  description?: string
  dataKey?: string
  labelKey?: string
  color?: string
  fillOpacity?: number
  trend?: {
    value: number
    direction: "up" | "down"
    label?: string
  }
  footerText?: string
  showGrid?: boolean
  className?: string
}

export function AreaChartStep01({
  data,
  title = "Step Area Chart",
  description,
  dataKey = "value",
  labelKey = "label",
  color = "var(--chart-1)",
  fillOpacity = 0.4,
  trend,
  footerText,
  showGrid = true,
  className,
}: AreaChartStep01Props) {
  const chartConfig: ChartConfig = {
    [dataKey]: {
      label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
      color,
    },
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
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
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              dataKey={dataKey}
              type="step"
              fill={color}
              fillOpacity={fillOpacity}
              stroke={color}
            />
          </AreaChart>
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
