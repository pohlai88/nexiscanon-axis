"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "../../components/calendar"
import { cn } from "../../lib/utils"

export interface CalendarSimple01Props {
  mode?: "single" | "range" | "multiple"
  value?: Date | DateRange | Date[]
  onChange?: (value: Date | DateRange | Date[] | undefined) => void
  numberOfMonths?: number
  className?: string
}

export function CalendarSimple01({
  mode = "single",
  value,
  onChange,
  numberOfMonths = 1,
  className,
}: CalendarSimple01Props) {
  // Single mode
  if (mode === "single") {
    const singleValue = value as Date | undefined
    return (
      <Calendar
        mode="single"
        selected={singleValue}
        onSelect={onChange as (date: Date | undefined) => void}
        numberOfMonths={numberOfMonths}
        className={cn("rounded-lg border shadow-sm", className)}
      />
    )
  }

  // Range mode
  if (mode === "range") {
    const rangeValue = value as DateRange | undefined
    return (
      <Calendar
        mode="range"
        selected={rangeValue}
        onSelect={onChange as (range: DateRange | undefined) => void}
        numberOfMonths={numberOfMonths}
        className={cn("rounded-lg border shadow-sm", className)}
      />
    )
  }

  // Multiple mode
  const multiValue = value as Date[] | undefined
  return (
    <Calendar
      mode="multiple"
      selected={multiValue}
      onSelect={onChange as (dates: Date[] | undefined) => void}
      numberOfMonths={numberOfMonths}
      className={cn("rounded-lg border shadow-sm", className)}
    />
  )
}
