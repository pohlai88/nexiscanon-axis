"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList } from "recharts"
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

export interface NegativeBarDataPoint {
  label: string
  value: number
}

export interface NegativeBarChart01Props {
  data: NegativeBarDataPoint[]
  config?: ChartConfig
  valueKey?: string
  labelKey?: string
  title?: string
  description?: string
  trend?: {
    value: number
    direction: "up" | "down"
    label?: string
  }
  footerText?: string
  positiveColor?: string
  negativeColor?: string
  showLabels?: boolean
  className?: string
}

export function NegativeBarChart01({
  data,
  config = { value: { label: "Value" } },
  valueKey = "value",
  labelKey = "label",
  title = "Bar Chart",
  description,
  trend,
  footerText,
  positiveColor = "var(--chart-1)",
  negativeColor = "var(--chart-2)",
  showLabels = true,
  className,
}: NegativeBarChart01Props) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel hideIndicator />}
            />
            <Bar dataKey={valueKey}>
              {showLabels && (
                <LabelList position="top" dataKey={labelKey} fillOpacity={1} />
              )}
              {data.map((item, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={item.value > 0 ? positiveColor : negativeColor}
                />
              ))}
            </Bar>
          </BarChart>
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
