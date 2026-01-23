"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/chart"
import { cn } from "@/lib/utils"

export interface PieLegendDataPoint {
  name: string
  value: number
  fill?: string
}

export interface PieChartLegend01Props {
  data: PieLegendDataPoint[]
  config: ChartConfig
  nameKey?: string
  valueKey?: string
  title?: string
  description?: string
  legendPosition?: "top" | "bottom" | "left" | "right"
  maxHeight?: number
  className?: string
}

export function PieChartLegend01({
  data,
  config,
  nameKey = "name",
  valueKey = "value",
  title = "Pie Chart",
  description,
  maxHeight = 300,
  className,
}: PieChartLegend01Props) {
  // Ensure each data point has a fill color
  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      fill: item.fill || `var(--color-${item.name})`,
    }))
  }, [data])

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square"
          style={{ maxHeight }}
        >
          <PieChart>
            <Pie data={chartData} dataKey={valueKey} nameKey={nameKey} />
            <ChartLegend
              content={<ChartLegendContent nameKey={nameKey} />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
