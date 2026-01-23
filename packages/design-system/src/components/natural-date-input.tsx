"use client"

import * as React from "react"
import * as chrono from "chrono-node"
import { format } from "date-fns"
import { Calendar } from "@/components/calendar"
import { Input } from "@/components/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover"
import { cn } from "@/lib/utils"

export interface NaturalDateInputProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function NaturalDateInput({
  value,
  onChange,
  placeholder = "Type a date like 'next friday' or 'in 2 weeks'",
  className,
}: NaturalDateInputProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setInputValue(text)

    // Parse natural language
    const parsed = chrono.parseDate(text)
    if (parsed) {
      onChange?.(parsed)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full">
        <Input
          value={inputValue || (value ? format(value, "PPP") : "")}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(!value && "text-muted-foreground", className)}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
