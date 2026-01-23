"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts"
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

export interface BarActiveDataPoint {
  name: string
  value: number
  fill?: string
}

export interface BarChartActive01Props {
  data: BarActiveDataPoint[]
  config: ChartConfig
  nameKey?: string
  valueKey?: string
  title?: string
  description?: string
  trend?: {
    value: number
    direction: "up" | "down"
    label?: string
  }
  footerText?: string
  activeIndex?: number
  barRadius?: number
  showGrid?: boolean
  className?: string
}

export function BarChartActive01({
  data,
  config,
  nameKey = "name",
  valueKey = "value",
  title = "Bar Chart",
  description,
  trend,
  footerText,
  activeIndex = 2,
  barRadius = 8,
  showGrid = true,
  className,
}: BarChartActive01Props) {
  // Ensure each data point has a fill color
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      fill: item.fill || `var(--color-${item.name})`,
    }))
  }, [data])

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={chartData}>
            {showGrid && <CartesianGrid vertical={false} />}
            <XAxis
              dataKey={nameKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const configEntry = config[value as keyof typeof config]
                return configEntry?.label || value
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey={valueKey}
              strokeWidth={2}
              radius={barRadius}
              activeIndex={activeIndex}
              activeBar={({ ...props }) => {
                return (
                  <Rectangle
                    {...props}
                    fillOpacity={0.8}
                    stroke={props.payload.fill}
                    strokeDasharray={4}
                    strokeDashoffset={4}
                  />
                )
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {(trend || footerText) && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {trend && (
            <div className="flex gap-2 leading-none font-medium">
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
        </CardFooter>
      )}
    </Card>
  )
}
