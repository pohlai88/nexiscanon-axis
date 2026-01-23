"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
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

export interface ActivityDataPoint {
  date: string
  [key: string]: string | number
}

export interface ActivityChartConfig {
  [key: string]: {
    label: string
    color: string
    icon?: LucideIcon
  }
}

export interface ActivityChart01Props {
  data: ActivityDataPoint[]
  config: ActivityChartConfig
  dataKeys: string[]
  title?: string
  description?: string
  dateKey?: string
  stacked?: boolean
  className?: string
}

export function ActivityChart01({
  data,
  config,
  dataKeys,
  title = "Activity Chart",
  description,
  dateKey = "date",
  stacked = true,
  className,
}: ActivityChart01Props) {
  const chartConfig: ChartConfig = React.useMemo(() => {
    const result: ChartConfig = {}
    Object.entries(config).forEach(([key, value]) => {
      result[key] = {
        label: value.label,
        color: value.color,
        icon: value.icon,
      }
    })
    return result
  }, [config])

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <XAxis
              dataKey={dateKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  weekday: "short",
                })
              }}
            />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId={stacked ? "a" : undefined}
                fill={`var(--color-${key})`}
                radius={
                  stacked
                    ? index === 0
                      ? [0, 0, 4, 4]
                      : index === dataKeys.length - 1
                        ? [4, 4, 0, 0]
                        : [0, 0, 0, 0]
                    : 4
                }
              />
            ))}
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
