"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "../../components/calendar"
import { cn } from "../../lib/utils"

export interface CalendarBounded01Props {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  startMonth: Date
  endMonth: Date
  numberOfMonths?: number
  disableNavigation?: boolean
  helpText?: string
  className?: string
}

export function CalendarBounded01({
  value,
  onChange,
  startMonth,
  endMonth,
  numberOfMonths = 2,
  disableNavigation = true,
  helpText,
  className,
}: CalendarBounded01Props) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(value)

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
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={handleSelect}
        numberOfMonths={numberOfMonths}
        startMonth={startMonth}
        endMonth={endMonth}
        disableNavigation={disableNavigation}
        className="rounded-lg border shadow-sm"
      />
      {helpText && (
        <div className="text-muted-foreground text-center text-xs">
          {helpText}
        </div>
      )}
    </div>
  )
}
