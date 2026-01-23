"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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

export interface LineChartDataPoint {
  date: string
  [key: string]: string | number
}

export interface LineChart01Props {
  data: LineChartDataPoint[]
  config: ChartConfig
  title?: string
  description?: string
  dataKeys: string[]
  showTabs?: boolean
  showGrid?: boolean
  className?: string
}

export function LineChart01({
  data,
  config,
  title = "Line Chart",
  description,
  dataKeys,
  showTabs = true,
  showGrid = true,
  className,
}: LineChart01Props) {
  const [activeKey, setActiveKey] = React.useState(dataKeys[0] || "")

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

  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

  return (
    <Card className={cn("py-4 sm:py-0", className)}>
      <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {showTabs && dataKeys.length > 1 && (
          <div className="flex">
            {dataKeys.map((key, index) => (
              <button
                key={key}
                data-active={activeKey === key}
                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveKey(key)}
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
        )}
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
          <LineChart
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            {showGrid && <CartesianGrid vertical={false} />}
            <XAxis
              dataKey="date"
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
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            {showTabs ? (
              <Line
                dataKey={activeKey}
                type="monotone"
                stroke={config[activeKey]?.color || colors[dataKeys.indexOf(activeKey) % colors.length] || "var(--chart-1)"}
                strokeWidth={2}
                dot={false}
              />
            ) : (
              dataKeys.map((key, index) => (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={config[key]?.color || colors[index % colors.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
