"use client"

import * as React from "react"
import { Calendar } from "../../components/calendar"
import { cn } from "../../lib/utils"

export interface CalendarDisabledDates01Props {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabledDates?: Date[]
  modifiersClassName?: string
  showStrikethrough?: boolean
  className?: string
}

export function CalendarDisabledDates01({
  value,
  onChange,
  disabledDates = [],
  modifiersClassName,
  showStrikethrough = true,
  className,
}: CalendarDisabledDates01Props) {
  const [date, setDate] = React.useState<Date | undefined>(value || new Date())

  React.useEffect(() => {
    if (value && value !== date) {
      setDate(value)
    }
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onChange?.(selectedDate)
  }

  const defaultModifierClassName = showStrikethrough
    ? "[&>button]:line-through opacity-100"
    : "opacity-50"

  return (
    <Calendar
      mode="single"
      defaultMonth={date}
      selected={date}
      onSelect={handleSelect}
      disabled={disabledDates}
      modifiers={{
        booked: disabledDates,
      }}
      modifiersClassNames={{
        booked: modifiersClassName || defaultModifierClassName,
      }}
      className={cn("rounded-lg border shadow-sm", className)}
    />
  )
}
