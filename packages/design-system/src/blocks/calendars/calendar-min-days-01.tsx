"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "../../components/calendar"
import { cn } from "../../lib/utils"

export interface CalendarMinDays01Props {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  minDays?: number
  numberOfMonths?: number
  helpText?: string
  className?: string
}

export function CalendarMinDays01({
  value,
  onChange,
  minDays = 5,
  numberOfMonths = 1,
  helpText,
  className,
}: CalendarMinDays01Props) {
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

  const displayHelpText = helpText || `A minimum of ${minDays} days is required`

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <Calendar
        mode="range"
        defaultMonth={dateRange?.from}
        selected={dateRange}
        onSelect={handleSelect}
        numberOfMonths={numberOfMonths}
        min={minDays}
        className="rounded-lg border shadow-sm"
      />
      <div className="text-muted-foreground text-center text-xs">
        {displayHelpText}
      </div>
    </div>
  )
}
