"use client"

import React, { useState } from "react"
import { Calendar as CalendarIcon, Download, RotateCcw } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
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
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"

export default function LaporanPage() {
  const [selectedReport, setSelectedReport] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const handleReset = () => {
    setSelectedReport("")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download report:", {
      report: selectedReport,
      startDate,
      endDate,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Laporan Transaksi</h1>
        <Breadcrumbs
          items={[{ label: "Pages", href: "/" }, { label: "Laporan" }]}
        />
      </div>

      {/* Report Form Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Laporan</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* Report Type Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="report-type">Laporan</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger id="report-type" className="w-full">
                  <SelectValue placeholder="Pilih Laporan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transaksi">Laporan Transaksi</SelectItem>
                  <SelectItem value="penjualan">Laporan Penjualan</SelectItem>
                  <SelectItem value="pembelian">Laporan Pembelian</SelectItem>
                  <SelectItem value="stok">Laporan Stok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Selection */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Start Date */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="start-date">Mulai Dari</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        startDate.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="end-date">Sampai Dengan</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        endDate.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button variant="destructive" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
