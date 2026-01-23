"use client"

import * as React from "react"
import { Calendar } from "../../components/calendar"
import { Card, CardContent, CardFooter } from "../../components/card"
import { Input } from "../../components/input"
import { Label } from "../../components/label"
import { cn } from "../../lib/utils"

export interface CalendarTimeRange01Props {
  value?: Date
  onChange?: (date: Date | undefined) => void
  startTime?: string
  endTime?: string
  onStartTimeChange?: (time: string) => void
  onEndTimeChange?: (time: string) => void
  className?: string
}

export function CalendarTimeRange01({
  value,
  onChange,
  startTime = "10:30:00",
  endTime = "12:30:00",
  onStartTimeChange,
  onEndTimeChange,
  className,
}: CalendarTimeRange01Props) {
  const [date, setDate] = React.useState<Date | undefined>(value || new Date())
  const [start, setStart] = React.useState(startTime)
  const [end, setEnd] = React.useState(endTime)

  React.useEffect(() => {
    if (value && value !== date) {
      setDate(value)
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onChange?.(selectedDate)
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStart(e.target.value)
    onStartTimeChange?.(e.target.value)
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnd(e.target.value)
    onEndTimeChange?.(e.target.value)
  }

  return (
    <Card className={cn("w-fit py-4", className)}>
      <CardContent className="px-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="bg-transparent p-0"
        />
      </CardContent>
      <CardFooter className="flex gap-2 border-t px-4 pt-4">
        <div className="w-full">
          <Label htmlFor="time-from" className="sr-only">
            Start Time
          </Label>
          <Input
            id="time-from"
            type="time"
            step="1"
            value={start}
            onChange={handleStartTimeChange}
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
        <span className="flex items-center">-</span>
        <div className="w-full">
          <Label htmlFor="time-to" className="sr-only">
            End Time
          </Label>
          <Input
            id="time-to"
            type="time"
            step="1"
            value={end}
            onChange={handleEndTimeChange}
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </CardFooter>
    </Card>
  )
}
