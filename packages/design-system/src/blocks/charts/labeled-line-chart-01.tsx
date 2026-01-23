"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"
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

export interface LabeledLineDataPoint {
  label: string
  [key: string]: string | number
}

export interface LabeledLineChart01Props {
  data: LabeledLineDataPoint[]
  config: ChartConfig
  dataKey: string
  labelKey?: string
  title?: string
  description?: string
  trend?: {
    value: number
    direction: "up" | "down"
    label?: string
  }
  footerText?: string
  showGrid?: boolean
  curveType?: "natural" | "linear" | "step" | "monotone"
  showLabels?: boolean
  labelPosition?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function LabeledLineChart01({
  data,
  config,
  dataKey,
  labelKey = "label",
  title = "Line Chart",
  description,
  trend,
  footerText,
  showGrid = true,
  curveType = "natural",
  showLabels = true,
  labelPosition = "top",
  className,
}: LabeledLineChart01Props) {
  const color = config[dataKey]?.color || "var(--chart-1)"

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
            margin={{ top: 20, left: 12, right: 12 }}
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
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey={dataKey}
              type={curveType}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color }}
              activeDot={{ r: 6 }}
            >
              {showLabels && (
                <LabelList
                  position={labelPosition}
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              )}
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      {(trend || footerText) && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {trend && (
            <div className="flex gap-2 leading-none font-medium">
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
            <div className="text-muted-foreground leading-none">
              {footerText}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
