"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
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

export interface BarInteractiveDataPoint {
  date: string
  [key: string]: string | number
}

export interface BarChartInteractive01Props {
  data: BarInteractiveDataPoint[]
  config: ChartConfig
  dataKeys: string[]
  dateKey?: string
  title?: string
  description?: string
  defaultActiveKey?: string
  chartHeight?: number
  className?: string
}

export function BarChartInteractive01({
  data,
  config,
  dataKeys,
  dateKey = "date",
  title = "Interactive Bar Chart",
  description,
  defaultActiveKey,
  chartHeight = 250,
  className,
}: BarChartInteractive01Props) {
  const [activeChart, setActiveChart] = React.useState<string>(
    defaultActiveKey || dataKeys[0] || ""
  )

  const totals = React.useMemo(() => {
    const result: Record<string, number> = {}
    dataKeys.forEach((key) => {
      result[key] = data.reduce((acc, curr) => {
        const val = curr[key]
        return acc + (typeof val === "number" ? val : 0)
      }, 0)
    })
    return result
  }, [data, dataKeys])

  return (
    <Card className={cn("py-0", className)}>
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex">
          {dataKeys.map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-muted-foreground text-xs">
                {config[key]?.label || key}
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {(totals[key] || 0).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={config}
          className="aspect-auto w-full"
          style={{ height: chartHeight }}
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={dateKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
