"use client"

import Link from "next/link"
import { Calendar as CalendarIcon } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
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

interface DashboardHeaderProps {
  selectedPT: string
  selectedToko: string
  date: Date
  onPTChange: (value: string) => void
  onTokoChange: (value: string) => void
  onDateChange: (date: Date) => void
}

export function DashboardHeader({
  selectedPT,
  selectedToko,
  date,
  onPTChange,
  onTokoChange,
  onDateChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-bold">Dashboard</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Pages</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedPT} onValueChange={onPTChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pilih PT" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pt-gadai-top">PT Gadai Top Indonesia</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedToko} onValueChange={onTokoChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Toko" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gt-jakarta-satu">GT Jakarta Satu</SelectItem>
          </SelectContent>
        </Select>

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
