"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDown } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/button"
import { Calendar } from "@/components/calendar"
import { Label } from "@/components/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover"
import { cn } from "@/lib/utils"

export interface CalendarDropdown01Props {
  mode?: "single" | "range"
  value?: Date | DateRange
  onChange?: (value: Date | DateRange | undefined) => void
  label?: string
  placeholder?: string
  align?: "start" | "center" | "end"
  className?: string
}

function formatDateRange(from: Date, to: Date): string {
  const sameMonth = from.getMonth() === to.getMonth()
  const sameYear = from.getFullYear() === to.getFullYear()

  if (sameMonth && sameYear) {
    return `${format(from, "MMM d")} - ${format(to, "d, yyyy")}`
  } else if (sameYear) {
    return `${format(from, "MMM d")} - ${format(to, "MMM d, yyyy")}`
  }
  return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`
}

export function CalendarDropdown01({
  mode = "range",
  value,
  onChange,
  label,
  placeholder = "Select date",
  align = "start",
  className,
}: CalendarDropdown01Props) {
  const [internalValue, setInternalValue] = React.useState<Date | DateRange | undefined>(value)

  React.useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value)
    }
  }, [value])

  const handleSelect = (selected: Date | DateRange | undefined) => {
    setInternalValue(selected)
    onChange?.(selected)
  }

  const displayText = React.useMemo(() => {
    if (!internalValue) return placeholder

    if (mode === "single" && internalValue instanceof Date) {
      return format(internalValue, "PPP")
    }

    if (mode === "range" && typeof internalValue === "object" && "from" in internalValue) {
      const range = internalValue as DateRange
      if (range.from && range.to) {
        return formatDateRange(range.from, range.to)
      }
      if (range.from) {
        return format(range.from, "PPP")
      }
    }

    return placeholder
  }, [internalValue, mode, placeholder])

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <Label htmlFor="calendar-dropdown" className="px-1">
          {label}
        </Label>
      )}
      <Popover>
        <PopoverTrigger>
          <Button
            variant="outline"
            id="calendar-dropdown"
            className="w-56 justify-between font-normal"
          >
            {displayText}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align={align}>
          {mode === "single" ? (
            <Calendar
              mode="single"
              selected={internalValue as Date | undefined}
              onSelect={handleSelect as (date: Date | undefined) => void}
              captionLayout="dropdown"
            />
          ) : (
            <Calendar
              mode="range"
              selected={internalValue as DateRange | undefined}
              onSelect={handleSelect as (range: DateRange | undefined) => void}
              captionLayout="dropdown"
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
