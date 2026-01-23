"use client"

import * as React from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
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

export interface MixedBarDataPoint {
  name: string
  value: number
  fill?: string
}

export interface MixedBarChart01Props {
  data: MixedBarDataPoint[]
  config: ChartConfig
  valueKey?: string
  nameKey?: string
  title?: string
  description?: string
  trend?: {
    value: number
    direction: "up" | "down"
    label?: string
  }
  footerText?: string
  layout?: "horizontal" | "vertical"
  className?: string
}

export function MixedBarChart01({
  data,
  config,
  valueKey = "value",
  nameKey = "name",
  title = "Bar Chart",
  description,
  trend,
  footerText,
  layout = "vertical",
  className,
}: MixedBarChart01Props) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart
            accessibilityLayer
            data={data}
            layout={layout}
            margin={{ left: 0 }}
          >
            {layout === "vertical" ? (
              <>
                <YAxis
                  dataKey={nameKey}
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    config[value as keyof typeof config]?.label || value
                  }
                />
                <XAxis dataKey={valueKey} type="number" hide />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={nameKey}
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    config[value as keyof typeof config]?.label || value
                  }
                />
                <YAxis dataKey={valueKey} type="number" hide />
              </>
            )}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey={valueKey} layout={layout} radius={5} />
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
