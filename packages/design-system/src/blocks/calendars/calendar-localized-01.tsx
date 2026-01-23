"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import type { Locale } from "react-day-picker"
import { Calendar } from "@/components/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select"
import { cn } from "@/lib/utils"

export interface LocaleOption {
  code: string
  label: string
  locale: Locale
  strings: {
    title: string
    description: string
  }
}

export interface CalendarLocalized01Props {
  locales: LocaleOption[]
  defaultLocale?: string
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  numberOfMonths?: number
  className?: string
}

export function CalendarLocalized01({
  locales,
  defaultLocale,
  value,
  onChange,
  numberOfMonths = 2,
  className,
}: CalendarLocalized01Props) {
  const [currentLocale, setCurrentLocale] = React.useState(
    defaultLocale || locales[0]?.code || "en"
  )
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(value)

  const activeLocale = locales.find((l) => l.code === currentLocale) || locales[0]

  React.useEffect(() => {
    if (value && value !== dateRange) {
      setDateRange(value)
    }
  }, [value])

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    onChange?.(range)
  }

  const handleLocaleChange = (code: string | null) => {
    if (code) {
      setCurrentLocale(code)
    }
  }

  if (!activeLocale) {
    return null
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{activeLocale.strings.title}</CardTitle>
            <CardDescription>{activeLocale.strings.description}</CardDescription>
          </div>
          <Select value={currentLocale} onValueChange={handleLocaleChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent align="end">
              {locales.map((locale) => (
                <SelectItem key={locale.code} value={locale.code}>
                  {locale.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleSelect}
          defaultMonth={dateRange?.from}
          numberOfMonths={numberOfMonths}
          locale={activeLocale.locale}
          className="bg-transparent p-0"
        />
      </CardContent>
    </Card>
  )
}
