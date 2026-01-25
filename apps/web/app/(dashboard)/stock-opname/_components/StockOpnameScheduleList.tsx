"use client"

import React from "react"
import { MoreVertical } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

// Types
export type ScheduleItem = {
  id: string
  idSO: string
  toko: string
  petugas: string
}

type StockOpnameScheduleListProps = {
  selectedDate: Date
  schedules: ScheduleItem[]
  onDetail?: (item: ScheduleItem) => void
  onEdit?: (item: ScheduleItem) => void
  onDelete?: (item: ScheduleItem) => void
}

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

function formatDate(date: Date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function StockOpnameScheduleList({
  selectedDate,
  schedules,
  onDetail,
  onEdit,
  onDelete,
}: StockOpnameScheduleListProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="font-semibold">{formatDate(selectedDate)}</h3>
        <span className="text-sm font-medium text-destructive">
          {schedules.length} Jadwal
        </span>
      </div>

      {/* Schedule list */}
      <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto">
        {schedules.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Tidak ada jadwal
          </div>
        ) : (
          schedules.map((schedule, index) => (
            <div
              key={schedule.id}
              className="flex items-start gap-3 rounded-lg border bg-card p-3 shadow-sm"
            >
              {/* Number indicator */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-medium">
                  {schedule.toko}
                </span>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-destructive">{schedule.idSO}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {schedule.petugas}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onDetail?.(schedule)}>
                    Detail
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(schedule)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(schedule)}
                    className="text-destructive focus:text-destructive"
                  >
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
