"use client"

import React, { useState, Suspense, useEffect } from "react"
import { format } from "date-fns"
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
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { downloadReportCsv } from "@/lib/react-query/hooks/use-reports"
import type { ReportFilters } from "@/lib/api/types"
import { toast } from "sonner"

const REPORT_OPTIONS = [
  { value: "mutation-by-branch", label: "Laporan Mutasi per Toko" },
  { value: "mutation-by-pt", label: "Laporan Mutasi per PT" },
  { value: "spk", label: "Laporan SPK" },
  { value: "nkb-payments", label: "Laporan Pembayaran NKB" },
  { value: "stock-opname", label: "Laporan Stock Opname" },
] as const

function LaporanPageContent() {
  const { user } = useAuth()
  const isCompanyAdmin =
    user?.roles?.some((r) => r.code === "company_admin") ?? false
  const isSuperAdmin = user?.roles?.some((r) => r.code === "owner") ?? false

  const effectiveCompanyId = isCompanyAdmin ? user?.companyId ?? null : null

  const { data: companiesData } = useCompanies(
    isSuperAdmin ? { pageSize: 100 } : undefined
  )

  const [selectedPT, setSelectedPT] = useState<string>("")
  const ptOptions = React.useMemo(() => {
    const list = companiesData?.data ?? []
    return list.map((c) => ({ value: c.uuid, label: c.companyName }))
  }, [companiesData])

  useEffect(() => {
    if (isSuperAdmin && ptOptions.length > 0 && !selectedPT) {
      setSelectedPT(ptOptions[0]!.value)
    }
  }, [isSuperAdmin, ptOptions, selectedPT])

  const companyFilterId = isSuperAdmin ? selectedPT : effectiveCompanyId

  const { data: branchesData } = useBranches(
    companyFilterId
      ? { companyId: companyFilterId, pageSize: 100 }
      : undefined,
    { enabled: !!companyFilterId }
  )

  const branchOptions = React.useMemo(() => {
    const list = branchesData?.data ?? []
    const filtered = companyFilterId
      ? list.filter((b) => b.companyId === companyFilterId)
      : list
    return filtered.map((b) => ({ value: b.uuid, label: b.shortName }))
  }, [branchesData, companyFilterId])

  const [selectedReport, setSelectedReport] = useState<string>("")
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isDownloading, setIsDownloading] = useState(false)

  const reportFilters: ReportFilters = React.useMemo(() => {
    const dateFrom = startDate ? format(startDate, "yyyy-MM-dd") : undefined
    const dateTo = endDate ? format(endDate, "yyyy-MM-dd") : undefined
    return {
      dateFrom,
      dateTo,
      companyId: companyFilterId ?? undefined,
      ptId: companyFilterId ?? undefined,
      branchId: selectedBranch && selectedBranch !== "all" ? selectedBranch : undefined,
      storeId: selectedBranch && selectedBranch !== "all" ? selectedBranch : undefined,
    }
  }, [startDate, endDate, companyFilterId, selectedBranch])

  const handleReset = () => {
    setSelectedReport("")
    setSelectedBranch("all")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  const handleDownload = async () => {
    if (!selectedReport) {
      toast.error("Pilih jenis laporan terlebih dahulu")
      return
    }
    setIsDownloading(true)
    try {
      await downloadReportCsv(selectedReport, reportFilters)
      toast.success("Laporan berhasil diunduh")
    } catch {
      toast.error("Gagal mengunduh laporan")
    } finally {
      setIsDownloading(false)
    }
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
                  {REPORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* PT Filter (Super Admin only) */}
            {isSuperAdmin && ptOptions.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="pt-filter">PT</Label>
                <Select value={selectedPT} onValueChange={setSelectedPT}>
                  <SelectTrigger id="pt-filter" className="w-full">
                    <SelectValue placeholder="Pilih PT" />
                  </SelectTrigger>
                  <SelectContent>
                    {ptOptions.map((pt) => (
                      <SelectItem key={pt.value} value={pt.value}>
                        {pt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Branch Filter */}
            {branchOptions.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="branch-filter">Toko</Label>
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger id="branch-filter" className="w-full">
                    <SelectValue placeholder="Semua Toko" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Toko</SelectItem>
                    {branchOptions.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range Selection */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

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
                      onSelect={setEndDate}
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
              <Button
                variant="destructive"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? "Mengunduh..." : "Download"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LaporanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      }
    >
      <LaporanPageContent />
    </Suspense>
  )
}
