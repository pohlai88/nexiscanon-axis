"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Button } from "@/components/button"
import { Calendar } from "@/components/calendar"
import { Label } from "@/components/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover"
import { cn } from "@/lib/utils"

export interface DateRangePicker01Props {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  label?: string
  placeholder?: string
  numberOfMonths?: number
  className?: string
}

export function DateRangePicker01({
  value,
  onChange,
  label = "Select dates",
  placeholder = "Select date range",
  numberOfMonths = 2,
  className,
}: DateRangePicker01Props) {
  const [open, setOpen] = React.useState(false)

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder
    if (!range.to) return format(range.from, "MMM d, yyyy")
    return `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <Label htmlFor="date-range" className="px-1">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button
            variant="outline"
            id="date-range"
            className={cn(
              "w-full justify-between font-normal",
              !value?.from && "text-muted-foreground"
            )}
          >
            {formatDateRange(value)}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={(range) => {
              onChange?.(range)
              if (range?.from && range?.to) {
                setOpen(false)
              }
            }}
            numberOfMonths={numberOfMonths}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
