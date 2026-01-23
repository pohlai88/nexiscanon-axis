"use client"

import * as React from "react"
import { Calendar } from "../../components/calendar"
import {
  SidebarGroup,
  SidebarGroupContent,
} from "../../components/sidebar"
import { cn } from "../../lib/utils"

export interface DatePickerSidebarProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  className?: string
}

export function DatePickerSidebar({
  value,
  onChange,
  className,
}: DatePickerSidebarProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)

  React.useEffect(() => {
    if (value && value !== date) {
      setDate(value)
    }
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onChange?.(selectedDate)
  }

  return (
    <SidebarGroup className={cn("px-0", className)}>
      <SidebarGroupContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px]"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
