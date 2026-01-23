"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "../../components/calendar"
import { cn } from "../../lib/utils"

export interface CalendarWeekNumbers01Props {
  mode?: "single" | "range"
  value?: Date | DateRange
  onChange?: (value: Date | DateRange | undefined) => void
  className?: string
}

export function CalendarWeekNumbers01({
  mode = "range",
  value,
  onChange,
  className,
}: CalendarWeekNumbers01Props) {
  const [singleDate, setSingleDate] = React.useState<Date | undefined>(
    mode === "single" && value instanceof Date ? value : undefined
  )
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    mode === "range" && value && !(value instanceof Date)
      ? (value as DateRange)
      : {
          from: new Date(),
          to: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        }
  )

  const handleSingleSelect = (date: Date | undefined) => {
    setSingleDate(date)
    onChange?.(date)
  }

  const handleRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    onChange?.(range)
  }

  if (mode === "single") {
    return (
      <Calendar
        mode="single"
        defaultMonth={singleDate}
        selected={singleDate}
        onSelect={handleSingleSelect}
        className={cn("rounded-lg border shadow-sm", className)}
        showWeekNumber
      />
    )
  }

  return (
    <Calendar
      mode="range"
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={handleRangeSelect}
      className={cn("rounded-lg border shadow-sm", className)}
      showWeekNumber
    />
  )
}
