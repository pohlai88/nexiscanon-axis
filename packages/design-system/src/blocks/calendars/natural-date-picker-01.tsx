"use client"

import * as React from "react"
import { parseDate } from "chrono-node"
import { CalendarIcon } from "lucide-react"
import { Button } from "../../components/button"
import { Calendar } from "../../components/calendar"
import { Input } from "../../components/input"
import { Label } from "../../components/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/popover"
import { cn } from "../../lib/utils"

function formatDate(date: Date | undefined) {
  if (!date) return ""
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export interface NaturalDatePicker01Props {
  value?: Date
  onChange?: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  defaultText?: string
  helperText?: string
  className?: string
}

export function NaturalDatePicker01({
  value,
  onChange,
  label = "Schedule Date",
  placeholder = "Tomorrow or next week",
  defaultText = "",
  helperText,
  className,
}: NaturalDatePicker01Props) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(defaultText)
  const [date, setDate] = React.useState<Date | undefined>(
    value || (defaultText ? parseDate(defaultText) || undefined : undefined)
  )
  const [month, setMonth] = React.useState<Date | undefined>(date)

  React.useEffect(() => {
    if (value && value !== date) {
      setDate(value)
      setMonth(value)
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setInputValue(text)
    const parsed = parseDate(text)
    if (parsed) {
      setDate(parsed)
      setMonth(parsed)
      onChange?.(parsed)
    }
  }

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setInputValue(formatDate(selectedDate))
    setOpen(false)
    onChange?.(selectedDate)
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <Label htmlFor="natural-date" className="px-1">
          {label}
        </Label>
      )}
      <div className="relative flex gap-2">
        <Input
          id="natural-date"
          value={inputValue}
          placeholder={placeholder}
          className="bg-background pr-10"
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2"
              type="button"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleCalendarSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      {helperText && date && (
        <div className="text-muted-foreground px-1 text-sm">
          {helperText.replace("{date}", formatDate(date))}
        </div>
      )}
    </div>
  )
}
