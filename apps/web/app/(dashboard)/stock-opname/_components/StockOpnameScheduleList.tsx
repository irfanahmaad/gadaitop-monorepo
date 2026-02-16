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
        <span className="text-destructive text-sm font-medium">
          {schedules.length} Jadwal
        </span>
      </div>

      {/* Schedule list */}
      <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto">
        {schedules.length === 0 ? (
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
            Tidak ada jadwal
          </div>
        ) : (
          schedules.map((schedule, index) => (
            <div
              key={schedule.id}
              className="bg-card flex items-start gap-2 rounded-lg border p-3 shadow-sm"
            >
              {/* Number indicator */}
              <div className="bg-muted flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-xs font-medium">
                  {schedule.toko}
                </span>
                <div className="flex items-center gap-1 text-[10px]">
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
