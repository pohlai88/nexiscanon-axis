"use client"

import * as React from "react"
import { Button } from "../../components/button"
import { Calendar } from "../../components/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/card"
import { cn } from "../../lib/utils"

export interface CalendarWithToday01Props {
  value?: Date
  onChange?: (date: Date | undefined) => void
  title?: string
  description?: string
  todayButtonText?: string
  className?: string
}

export function CalendarWithToday01({
  value,
  onChange,
  title = "Appointment",
  description = "Find a date",
  todayButtonText = "Today",
  className,
}: CalendarWithToday01Props) {
  const [date, setDate] = React.useState<Date | undefined>(value || new Date())
  const [month, setMonth] = React.useState<Date | undefined>(new Date())

  React.useEffect(() => {
    if (value && value !== date) {
      setDate(value)
    }
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onChange?.(selectedDate)
  }

  const handleTodayClick = () => {
    const today = new Date()
    setMonth(today)
    setDate(today)
    onChange?.(today)
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button size="sm" variant="outline" onClick={handleTodayClick}>
            {todayButtonText}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={date}
          onSelect={handleSelect}
          className="bg-transparent p-0"
        />
      </CardContent>
    </Card>
  )
}
