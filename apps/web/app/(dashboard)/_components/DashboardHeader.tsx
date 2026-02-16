"use client"

import { Calendar as CalendarIcon } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import { cn } from "@workspace/ui/lib/utils"

export interface PTOption {
  value: string
  label: string
}

export interface TokoOption {
  value: string
  label: string
}

interface DashboardHeaderProps {
  selectedPT: string
  selectedToko: string
  date: Date
  onPTChange: (value: string) => void
  onTokoChange: (value: string) => void
  onDateChange: (date: Date) => void
  /** Whether the PT (company) select should be shown (Super Admin only) */
  showPTFilter?: boolean
  /** Whether the Toko (branch) select should be shown (Super Admin or Admin PT) */
  showTokoFilter?: boolean
  /** List of PT options fetched from API */
  ptOptions: PTOption[]
  /** List of Toko options fetched from API */
  tokoOptions: TokoOption[]
  /** Loading state for PT dropdown */
  isLoadingPT?: boolean
  /** Loading state for Toko dropdown */
  isLoadingToko?: boolean
}

export function DashboardHeader({
  selectedPT,
  selectedToko,
  date,
  onPTChange,
  onTokoChange,
  onDateChange,
  showPTFilter = false,
  showTokoFilter = false,
  ptOptions,
  tokoOptions,
  isLoadingPT,
  isLoadingToko,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-bold">Dashboard</h1>
        <Breadcrumbs
          items={[{ label: "Pages", href: "/" }, { label: "Dashboard" }]}
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {showPTFilter && (
          <Select
            value={selectedPT}
            onValueChange={onPTChange}
            disabled={isLoadingPT}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue
                placeholder={isLoadingPT ? "Memuat..." : "Pilih PT"}
              />
            </SelectTrigger>
            <SelectContent>
              {ptOptions.map((pt) => (
                <SelectItem key={pt.value} value={pt.value}>
                  {pt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showTokoFilter && (
          <Select
            value={selectedToko}
            onValueChange={onTokoChange}
            disabled={isLoadingToko}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={isLoadingToko ? "Memuat..." : "Pilih Toko"}
              />
            </SelectTrigger>
            <SelectContent>
              {tokoOptions.map((toko) => (
                <SelectItem key={toko.value} value={toko.value}>
                  {toko.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[220px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? (
                date.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              ) : (
                <span>Pilih tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) =>
                selectedDate && onDateChange(selectedDate)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
