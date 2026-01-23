"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/chart"
import { cn } from "../../lib/utils"

export interface BarChartDataPoint {
  label: string
  [key: string]: string | number
}

export interface BarChart01Props {
  data: BarChartDataPoint[]
  config: ChartConfig
  title?: string
  description?: string
  dataKeys: string[]
  horizontal?: boolean
  showLegend?: boolean
  showGrid?: boolean
  stacked?: boolean
  className?: string
}

export function BarChart01({
  data,
  config,
  title = "Bar Chart",
  description,
  dataKeys,
  horizontal = false,
  showLegend = true,
  showGrid = true,
  stacked = false,
  className,
}: BarChart01Props) {
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
          <BarChart
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
          >
            {showGrid && <CartesianGrid vertical={!horizontal} horizontal={horizontal} />}
            {horizontal ? (
              <>
                <YAxis
                  dataKey="label"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={100}
                />
                <XAxis type="number" tickLine={false} axisLine={false} />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              </>
            )}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={4}
                stackId={stacked ? "a" : undefined}
              />
            ))}
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
