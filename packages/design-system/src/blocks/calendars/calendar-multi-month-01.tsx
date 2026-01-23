"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "@/components/calendar"
import { cn } from "@/lib/utils"

export interface CalendarMultiMonth01Props {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  numberOfMonths?: number
  className?: string
}

export function CalendarMultiMonth01({
  value,
  onChange,
  numberOfMonths = 2,
  className,
}: CalendarMultiMonth01Props) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    value || {
      from: new Date(),
      to: undefined,
    }
  )

  React.useEffect(() => {
    if (value && value !== dateRange) {
      setDateRange(value)
    }
  }, [value])

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    onChange?.(range)
  }

  return (
    <Calendar
      mode="range"
      defaultMonth={dateRange?.from}
      selected={dateRange}
      onSelect={handleSelect}
      numberOfMonths={numberOfMonths}
      className={cn("rounded-lg border shadow-sm", className)}
    />
  )
}
