"use client"

import * as React from "react"
import { Bar, BarChart, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
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

export interface StackedBarDataPoint {
  label: string
  [key: string]: string | number
}

export interface StackedBarChart01Props {
  data: StackedBarDataPoint[]
  config: ChartConfig
  dataKeys: string[]
  labelKey?: string
  title?: string
  description?: string
  className?: string
}

export function StackedBarChart01({
  data,
  config,
  dataKeys,
  labelKey = "label",
  title = "Stacked Bar Chart",
  description,
  className,
}: StackedBarChart01Props) {
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={data}>
            <XAxis
              dataKey={labelKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                if (typeof value === "string" && value.includes("-")) {
                  return new Date(value).toLocaleDateString("en-US", {
                    weekday: "short",
                  })
                }
                return value
              }}
            />
            {dataKeys.map((key, index) => {
              const isFirst = index === 0
              const isLast = index === dataKeys.length - 1
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={config[key]?.color || colors[index % colors.length]}
                  radius={
                    isFirst
                      ? [0, 0, 4, 4]
                      : isLast
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                />
              )
            })}
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
