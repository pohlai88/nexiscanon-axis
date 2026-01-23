"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "../../components/calendar"
import { cn } from "../../lib/utils"

export interface CalendarDisabledWeekends01Props {
  mode?: "single" | "range"
  value?: Date | DateRange
  onChange?: (value: Date | DateRange | undefined) => void
  numberOfMonths?: number
  className?: string
}

export function CalendarDisabledWeekends01({
  mode = "range",
  value,
  onChange,
  numberOfMonths = 2,
  className,
}: CalendarDisabledWeekends01Props) {
  const [singleDate, setSingleDate] = React.useState<Date | undefined>(
    mode === "single" && value instanceof Date ? value : undefined
  )
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    mode === "range" && value && !(value instanceof Date)
      ? (value as DateRange)
      : {
          from: new Date(),
          to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
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

  // Disable weekends (Saturday = 6, Sunday = 0)
  const disabledDays = { dayOfWeek: [0, 6] }

  if (mode === "single") {
    return (
      <Calendar
        mode="single"
        defaultMonth={singleDate}
        selected={singleDate}
        onSelect={handleSingleSelect}
        disabled={disabledDays}
        className={cn("rounded-lg border shadow-sm", className)}
      />
    )
  }

  return (
    <Calendar
      mode="range"
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={handleRangeSelect}
      numberOfMonths={numberOfMonths}
      disabled={disabledDays}
      className={cn("rounded-lg border shadow-sm", className)}
    />
  )
}
