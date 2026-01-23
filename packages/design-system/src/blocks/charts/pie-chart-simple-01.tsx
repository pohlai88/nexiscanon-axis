"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/chart"
import { cn } from "../../lib/utils"

export interface PieSimpleDataPoint {
  name: string
  value: number
  fill?: string
}

export interface PieChartSimple01Props {
  data: PieSimpleDataPoint[]
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
  maxHeight?: number
  className?: string
}

export function PieChartSimple01({
  data,
  config,
  nameKey = "name",
  valueKey = "value",
  title = "Pie Chart",
  description,
  trend,
  footerText,
  maxHeight = 250,
  className,
}: PieChartSimple01Props) {
  // Ensure each data point has a fill color
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      fill: item.fill || `var(--color-${item.name})`,
    }))
  }, [data])

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square"
          style={{ maxHeight }}
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey={valueKey} nameKey={nameKey} />
          </PieChart>
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
            <div className="text-muted-foreground leading-none">
              {footerText}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
