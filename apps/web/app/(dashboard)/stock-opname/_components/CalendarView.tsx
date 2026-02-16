"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  StockOpnameCalendar,
  type CalendarSchedule,
} from "./StockOpnameCalendar"
import {
  StockOpnameScheduleList,
  type ScheduleItem,
} from "./StockOpnameScheduleList"

// Types - accept any row with id, idSO, tanggal, toko, petugas (e.g. StockOpnameRow from page)
type StockOpnameCalendarItem = {
  id: string
  idSO: string
  tanggal: string
  toko: string
  petugas: string
  lastUpdatedAt?: string
  status?: string
}

type CalendarViewProps = {
  data: StockOpnameCalendarItem[]
  isLoading?: boolean
  onDetail?: (item: ScheduleItem) => void
  onEdit?: (item: ScheduleItem) => void
  onDelete?: (item: ScheduleItem) => void
}

// Helper function to parse date string like "25 November 2025"
function parseDate(dateStr: string): Date | null {
  const months: Record<string, number> = {
    Januari: 0,
    Februari: 1,
    Maret: 2,
    April: 3,
    Mei: 4,
    Juni: 5,
    Juli: 6,
    Agustus: 7,
    September: 8,
    Oktober: 9,
    November: 10,
    Desember: 11,
  }

  const parts = dateStr.split(" ")
  if (parts.length !== 3) return null

  const day = parseInt(parts[0] ?? "", 10)
  const month = months[parts[1] ?? ""]
  const year = parseInt(parts[2] ?? "", 10)

  if (isNaN(day) || month === undefined || isNaN(year)) return null

  return new Date(year, month, day)
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// Skeleton components
function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8" />
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="size-8" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Calendar grid skeleton */}
      <div className="overflow-hidden rounded-lg border">
        {/* Days header */}
        <div className="bg-muted/30 grid grid-cols-7 border-b">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border-r p-2 last:border-r-0">
              <Skeleton className="mx-auto h-4 w-12" />
            </div>
          ))}
        </div>

        {/* Calendar body - 6 rows */}
        <div className="grid grid-cols-7">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="flex min-h-[100px] flex-col border-r border-b p-2 last:border-r-0"
            >
              <Skeleton className="size-7 rounded-full" />
              {i % 5 === 0 && <Skeleton className="mt-auto h-5 w-16" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScheduleListSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-5 w-16" />
      </div>

      {/* List items */}
      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-card flex items-start gap-3 rounded-lg border p-3"
          >
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="size-8" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CalendarView({
  data,
  isLoading = false,
  onDetail,
  onEdit,
  onDelete,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Calculate schedules per date for calendar badges
  const calendarSchedules: CalendarSchedule[] = useMemo(() => {
    const scheduleMap = new Map<string, number>()

    data.forEach((item) => {
      const date = parseDate(item.tanggal)
      if (date) {
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        scheduleMap.set(key, (scheduleMap.get(key) ?? 0) + 1)
      }
    })

    return Array.from(scheduleMap.entries()).map(([key, count]) => {
      const [year, month, day] = key.split("-").map(Number)
      return {
        date: new Date(year!, month!, day!),
        count,
      }
    })
  }, [data])

  // Get schedules for selected date
  const selectedDateSchedules: ScheduleItem[] = useMemo(() => {
    return data
      .filter((item) => {
        const date = parseDate(item.tanggal)
        return date && isSameDay(date, selectedDate)
      })
      .map((item) => ({
        id: item.id,
        idSO: item.idSO,
        toko: item.toko,
        petugas: item.petugas,
      }))
  }, [data, selectedDate])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Calendar skeleton - 10 columns */}
            <div className="col-span-9">
              <CalendarSkeleton />
            </div>

            {/* Schedule list skeleton - 2 columns */}
            <div className="col-span-3 border-l pl-6">
              <ScheduleListSkeleton />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-12 gap-6">
          {/* Calendar - 10 columns */}
          <div className="col-span-9">
            <StockOpnameCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              schedules={calendarSchedules}
            />
          </div>

          {/* Schedule list - 2 columns */}
          <div className="col-span-3 border-l pl-6">
            <StockOpnameScheduleList
              selectedDate={selectedDate}
              schedules={selectedDateSchedules}
              onDetail={onDetail}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
