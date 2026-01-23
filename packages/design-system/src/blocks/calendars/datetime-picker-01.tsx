"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Calendar } from "../../components/calendar"
import {
  Card,
  CardContent,
  CardFooter,
} from "../../components/card"
import { Input } from "../../components/input"
import { Label } from "../../components/label"
import { cn } from "../../lib/utils"

export interface DateTimePicker01Props {
  value?: Date
  onChange?: (date: Date | undefined) => void
  startTime?: string
  endTime?: string
  onStartTimeChange?: (time: string) => void
  onEndTimeChange?: (time: string) => void
  showTimeRange?: boolean
  className?: string
}

export function DateTimePicker01({
  value,
  onChange,
  startTime = "09:00",
  endTime = "17:00",
  onStartTimeChange,
  onEndTimeChange,
  showTimeRange = true,
  className,
}: DateTimePicker01Props) {
  return (
    <Card className={cn("w-fit py-4", className)}>
      <CardContent className="px-4">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          className="bg-transparent p-0"
        />
      </CardContent>
      {showTimeRange && (
        <CardFooter className="flex flex-col gap-6 border-t px-4 pt-4">
          <div className="flex w-full flex-col gap-3">
            <Label htmlFor="time-from">Start Time</Label>
            <div className="relative flex w-full items-center gap-2">
              <Clock className="text-muted-foreground pointer-events-none absolute left-2.5 h-4 w-4 select-none" />
              <Input
                id="time-from"
                type="time"
                step="60"
                value={startTime}
                onChange={(e) => onStartTimeChange?.(e.target.value)}
                className="appearance-none pl-8"
              />
            </div>
          </div>
          <div className="flex w-full flex-col gap-3">
            <Label htmlFor="time-to">End Time</Label>
            <div className="relative flex w-full items-center gap-2">
              <Clock className="text-muted-foreground pointer-events-none absolute left-2.5 h-4 w-4 select-none" />
              <Input
                id="time-to"
                type="time"
                step="60"
                value={endTime}
                onChange={(e) => onEndTimeChange?.(e.target.value)}
                className="appearance-none pl-8"
              />
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
