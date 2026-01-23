"use client"

import * as React from "react"
import { addDays } from "date-fns"
import { Button } from "../../components/button"
import { Calendar } from "../../components/calendar"
import { Card, CardContent, CardFooter } from "../../components/card"
import { cn } from "../../lib/utils"

export interface CalendarPreset {
  label: string
  days: number
}

export interface CalendarPresets01Props {
  value?: Date
  onChange?: (date: Date | undefined) => void
  presets?: CalendarPreset[]
  className?: string
}

const defaultPresets: CalendarPreset[] = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "In a week", days: 7 },
  { label: "In 2 weeks", days: 14 },
]

export function CalendarPresets01({
  value,
  onChange,
  presets = defaultPresets,
  className,
}: CalendarPresets01Props) {
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

  const handlePresetClick = (days: number) => {
    const newDate = addDays(new Date(), days)
    setDate(newDate)
    onChange?.(newDate)
  }

  return (
    <Card className={cn("max-w-[300px] py-4", className)}>
      <CardContent className="px-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          defaultMonth={date}
          className="bg-transparent p-0"
        />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t px-4 pt-4">
        {presets.map((preset) => (
          <Button
            key={preset.days}
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handlePresetClick(preset.days)}
          >
            {preset.label}
          </Button>
        ))}
      </CardFooter>
    </Card>
  )
}
