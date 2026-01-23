"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select"
import { cn } from "../../lib/utils"

export interface PieChartDataPoint {
  name: string
  value: number
  fill?: string
}

export interface PieChart01Props {
  data: PieChartDataPoint[]
  config: ChartConfig
  title?: string
  description?: string
  innerRadius?: number
  showSelector?: boolean
  centerLabel?: string
  className?: string
}

export function PieChart01({
  data,
  config,
  title = "Pie Chart",
  description,
  innerRadius = 60,
  showSelector = true,
  centerLabel = "Total",
  className,
}: PieChart01Props) {
  const id = React.useId()
  const [activeItem, setActiveItem] = React.useState(data[0]?.name || "")

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item.name === activeItem),
    [data, activeItem]
  )

  const items = React.useMemo(() => data.map((item) => item.name), [data])

  const total = React.useMemo(
    () => data.reduce((acc, curr) => acc + (curr.value || 0), 0),
    [data]
  )

  // Generate fills if not provided
  const chartData = React.useMemo(() => {
    const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
    return data.map((item, index) => ({
      ...item,
      fill: item.fill || colors[index % colors.length],
    }))
  }, [data])

  return (
    <Card data-chart={id} className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {showSelector && items.length > 1 && (
          <Select value={activeItem} onValueChange={(value) => value && setActiveItem(value)}>
            <SelectTrigger
              className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
              aria-label="Select item"
            >
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {items.map((name, index) => {
                const itemConfig = config[name]
                return (
                  <SelectItem
                    key={name}
                    value={name}
                    className="rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="flex h-3 w-3 shrink-0 rounded-sm"
                        style={{
                          backgroundColor: chartData[index]?.fill,
                        }}
                      />
                      {itemConfig?.label || name}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={config}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={innerRadius}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const activeValue = chartData[activeIndex]?.value || total
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {activeValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
