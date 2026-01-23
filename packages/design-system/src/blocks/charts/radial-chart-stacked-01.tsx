"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
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

export interface RadialStackedDataPoint {
  [key: string]: string | number
}

export interface RadialChartStacked01Props {
  data: RadialStackedDataPoint[]
  dataKeys: string[]
  config: ChartConfig
  title?: string
  description?: string
  centerLabel?: string
  trend?: {
    value: number
    direction: "up" | "down"
    label?: string
  }
  footerText?: string
  innerRadius?: number
  outerRadius?: number
  endAngle?: number
  className?: string
}

export function RadialChartStacked01({
  data,
  dataKeys,
  config,
  title = "Radial Chart",
  description,
  centerLabel = "Total",
  trend,
  footerText,
  innerRadius = 80,
  outerRadius = 130,
  endAngle = 180,
  className,
}: RadialChartStacked01Props) {
  const total = React.useMemo(() => {
    if (!data.length || !data[0]) return 0
    const firstItem = data[0]
    return dataKeys.reduce((sum, key) => {
      const value = firstItem[key]
      return sum + (typeof value === "number" ? value : 0)
    }, 0)
  }, [data, dataKeys])

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={data}
            endAngle={endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            {dataKeys.map((key) => (
              <RadialBar
                key={key}
                dataKey={key}
                stackId="a"
                cornerRadius={5}
                fill={`var(--color-${key})`}
                className="stroke-transparent stroke-2"
              />
            ))}
          </RadialBarChart>
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
