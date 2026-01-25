"use client"

import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

// Types
export type CalendarSchedule = {
  date: Date
  count: number
}

type StockOpnameCalendarProps = {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  currentMonth: Date
  onMonthChange: (date: Date) => void
  schedules?: CalendarSchedule[]
}

const DAYS = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"]

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Get the day of week for first day (0 = Sunday, 1 = Monday, ...)
  // Convert to Monday-based (0 = Monday, 6 = Sunday)
  let startDayOfWeek = firstDay.getDay() - 1
  if (startDayOfWeek < 0) startDayOfWeek = 6

  const daysInMonth = lastDay.getDate()
  const days: (Date | null)[] = []

  // Add empty slots for days before the first day of month
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevMonthDate = new Date(year, month, -startDayOfWeek + i + 1)
    days.push(prevMonthDate)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  // Add days from next month to complete the grid (6 rows * 7 days = 42)
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function isSameMonth(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  )
}

function isToday(date: Date) {
  return isSameDay(date, new Date())
}

export function StockOpnameCalendar({
  selectedDate,
  onSelectDate,
  currentMonth,
  onMonthChange,
  schedules = [],
}: StockOpnameCalendarProps) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const calendarDays = getCalendarDays(year, month)

  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    const today = new Date()
    onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1))
    onSelectDate(today)
  }

  const getScheduleCount = (date: Date) => {
    const schedule = schedules.find((s) => isSameDay(s.date, date))
    return schedule?.count ?? 0
  }

  // Split days into weeks
  const weeks: Date[][] = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7) as Date[])
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="size-8"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[150px] text-center font-medium">
            {MONTHS[month]} {year}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="size-8"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleToday}>
          Hari Ini
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-lg border">
        {/* Days header */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {DAYS.map((day) => (
            <div
              key={day}
              className="border-r p-2 text-center text-xs font-medium text-muted-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar body */}
        <div className="grid grid-cols-7">
          {weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => {
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isSelected = isSameDay(date, selectedDate)
              const isTodayDate = isToday(date)
              const scheduleCount = getScheduleCount(date)

              return (
                <button
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => onSelectDate(date)}
                  className={cn(
                    "group relative flex min-h-[100px] flex-col border-b border-r p-2 text-left transition-colors hover:bg-muted/50",
                    dayIndex === 6 && "border-r-0",
                    weekIndex === weeks.length - 1 && "border-b-0",
                    !isCurrentMonth && "bg-muted/20",
                    isSelected && "bg-primary/5"
                  )}
                >
                  {/* Date number */}
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-sm",
                      !isCurrentMonth && "text-muted-foreground",
                      isTodayDate &&
                        "bg-destructive font-semibold text-destructive-foreground",
                      isSelected && !isTodayDate && "font-semibold"
                    )}
                  >
                    {date.getDate()}
                  </span>

                  {/* Schedule badge */}
                  {scheduleCount > 0 && (
                    <div className="mt-auto">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          isCurrentMonth
                            ? "bg-muted text-muted-foreground"
                            : "bg-muted/50 text-muted-foreground/70"
                        )}
                      >
                        {scheduleCount} Jadwal
                      </span>
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
