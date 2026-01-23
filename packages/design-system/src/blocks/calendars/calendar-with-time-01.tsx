"use client"

import * as React from "react"
import { Clock2Icon } from "lucide-react"
import { Calendar } from "../../components/calendar"
import { Card, CardContent, CardFooter } from "../../components/card"
import { Input } from "../../components/input"
import { Label } from "../../components/label"
import { cn } from "../../lib/utils"

export interface CalendarWithTime01Props {
  value?: Date
  onChange?: (date: Date | undefined) => void
  startTime?: string
  endTime?: string
  onStartTimeChange?: (time: string) => void
  onEndTimeChange?: (time: string) => void
  startTimeLabel?: string
  endTimeLabel?: string
  showSeconds?: boolean
  className?: string
}

export function CalendarWithTime01({
  value,
  onChange,
  startTime = "10:30:00",
  endTime = "12:30:00",
  onStartTimeChange,
  onEndTimeChange,
  startTimeLabel = "Start Time",
  endTimeLabel = "End Time",
  showSeconds = true,
  className,
}: CalendarWithTime01Props) {
  const [date, setDate] = React.useState<Date | undefined>(value || new Date())
  const [internalStartTime, setInternalStartTime] = React.useState(startTime)
  const [internalEndTime, setInternalEndTime] = React.useState(endTime)

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
    const time = e.target.value
    setInternalStartTime(time)
    onStartTimeChange?.(time)
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    setInternalEndTime(time)
    onEndTimeChange?.(time)
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
      <CardFooter className="flex flex-col gap-6 border-t px-4 pt-4!">
        <div className="flex w-full flex-col gap-3">
          <Label htmlFor="time-from">{startTimeLabel}</Label>
          <div className="relative flex w-full items-center gap-2">
            <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none" />
            <Input
              id="time-from"
              type="time"
              step={showSeconds ? "1" : undefined}
              value={internalStartTime}
              onChange={handleStartTimeChange}
              className="appearance-none pl-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
        <div className="flex w-full flex-col gap-3">
          <Label htmlFor="time-to">{endTimeLabel}</Label>
          <div className="relative flex w-full items-center gap-2">
            <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none" />
            <Input
              id="time-to"
              type="time"
              step={showSeconds ? "1" : undefined}
              value={internalEndTime}
              onChange={handleEndTimeChange}
              className="appearance-none pl-8 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
