"use client"

import React, { useMemo, Suspense, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useFilterParams, FilterConfig } from "@/hooks/use-filter-params"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { X, Hand, Check, Trash2 } from "lucide-react"
import {
  useNkbList,
  useConfirmNkb,
  useRejectNkb,
} from "@/lib/react-query/hooks/use-nkb"
import type { Nkb } from "@/lib/api/types"
import { TolakNkbDialog } from "./_components/tolak-nkb-dialog"

// Payment type labels for NKB
const NKB_PAYMENT_TYPE_LABELS: Record<string, string> = {
  renewal: "Perpanjangan",
  full_redemption: "Pelunasan",
  partial: "Cicilan",
}

// Status label for History NKB (API status -> display)
const NKB_HISTORY_STATUS_LABELS: Record<string, string> = {
  confirmed: "Disetujui",
  rejected: "Ditolak",
}

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date for NKB
const formatNkbDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return dateStr
  }
}

// Filter configuration for NKB
const filterConfig: FilterConfig[] = [
  {
    key: "dateRange",
    label: "Tanggal",
    type: "daterange",
    labelFrom: "Mulai Dari",
    labelTo: "Sampai Dengan",
  },
  {
    key: "pembayaranRange",
    label: "Total Pembayaran",
    type: "currencyrange",
    currency: "Rp",
  },
]

// Page size options
const pageSizeOptions = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
]

// Base column definitions for NKB Baru (API Nkb type)
const baseColumnsNkb: ColumnDef<Nkb>[] = [
  {
    id: "select",
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return index + 1
    },
  },
  {
    accessorKey: "nkbNumber",
    header: "Nomor NKB",
  },
  {
    accessorKey: "paymentType",
    header: "Jenis Pembayaran",
    cell: ({ row }) =>
      NKB_PAYMENT_TYPE_LABELS[row.getValue("paymentType") as string] ??
      (row.getValue("paymentType") as string),
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal & Waktu",
    cell: ({ row }) => formatNkbDate(row.getValue("createdAt") as string),
  },
  {
    accessorKey: "amountPaid",
    header: "Total Pembayaran",
    cell: ({ row }) =>
      `Rp ${formatCurrency(Number(row.getValue("amountPaid")))},-`,
  },
]

const columnsNKBBaru: ColumnDef<Nkb>[] = [...baseColumnsNkb]

// Column definitions for History NKB (API Nkb type, read-only, no row selection)
const columnsHistoryNKB: ColumnDef<Nkb>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return index + 1
    },
  },
  {
    accessorKey: "nkbNumber",
    header: "Nomor NKB",
  },
  {
    accessorKey: "paymentType",
    header: "Jenis Pembayaran",
    cell: ({ row }) =>
      NKB_PAYMENT_TYPE_LABELS[row.getValue("paymentType") as string] ??
      (row.getValue("paymentType") as string),
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal & Waktu",
    cell: ({ row }) => formatNkbDate(row.getValue("createdAt") as string),
  },
  {
    accessorKey: "amountPaid",
    header: "Total Pembayaran",
    cell: ({ row }) =>
      `Rp ${formatCurrency(Number(row.getValue("amountPaid")))},-`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string | undefined
      if (!status) return null
      const label = NKB_HISTORY_STATUS_LABELS[status] ?? status
      const isApproved = status === "confirmed"

      return (
        <Badge
          variant={isApproved ? "secondary" : "destructive"}
          className={
            isApproved
              ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300"
          }
        >
          {label}
        </Badge>
      )
    },
  },
]

// Table Skeleton Component
function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// NKB Information Dialog Component (receives API Nkb for approve/reject)
function NKBInfoDialog({
  open,
  onOpenChange,
  nkb,
  onApproveClick,
  onRejectClick,
  isApprovePending,
  isRejectPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  nkb: Nkb | null
  onApproveClick: () => void
  onRejectClick: () => void
  isApprovePending: boolean
  isRejectPending: boolean
}) {
  if (!nkb) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Informasi NKB</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Nomor NKB
              </label>
              <p className="text-base">{nkb.nkbNumber}</p>
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Tanggal & Waktu
              </label>
              <p className="text-base">{formatNkbDate(nkb.createdAt)}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Jenis Pembayaran
              </label>
              <p className="text-base">
                {NKB_PAYMENT_TYPE_LABELS[nkb.paymentType] ?? nkb.paymentType}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Total Pembayaran
              </label>
              <p className="text-base">
                Rp {formatCurrency(Number(nkb.amountPaid))},-
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            <X className="size-4" />
            Tutup
          </Button>
          <Button
            variant="outline"
            onClick={onRejectClick}
            disabled={isRejectPending}
            className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Hand className="size-4" />
            Tolak
          </Button>
          <Button
            variant="destructive"
            onClick={onApproveClick}
            disabled={isApprovePending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
          >
            <Check className="size-4" />
            Setujui
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// History NKB read-only info dialog (popup on Detail action)
function HistoryNKBInfoDialog({
  open,
  onOpenChange,
  nkb,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  nkb: Nkb | null
}) {
  if (!nkb) return null

  const statusLabel = NKB_HISTORY_STATUS_LABELS[nkb.status] ?? nkb.status
  const isApproved = nkb.status === "confirmed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-xl font-bold">
              Informasi NKB
            </DialogTitle>
            <Badge
              className={
                isApproved
                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300"
              }
            >
              {statusLabel}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Nomor NKB
              </label>
              <p className="text-base">{nkb.nkbNumber}</p>
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Jenis Pembayaran
              </label>
              <p className="text-base">
                {NKB_PAYMENT_TYPE_LABELS[nkb.paymentType] ?? nkb.paymentType}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Total Pembayaran
              </label>
              <p className="text-base">
                Rp {formatCurrency(Number(nkb.amountPaid))},-
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {nkb.spk?.spkNumber != null && nkb.spk.spkNumber !== "" && (
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Nomor SPK
                </label>
                <p className="text-base">{nkb.spk.spkNumber}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Tanggal & Waktu
              </label>
              <p className="text-base">{formatNkbDate(nkb.createdAt)}</p>
            </div>
            {nkb.status === "rejected" && nkb.rejectionReason && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Alasan Ditolak
                </label>
                <p className="text-base">{nkb.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            <X className="size-4" />
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NKBPageContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("nkb-baru")
  const [pageSize, setPageSize] = useState("10")
  const { filterValues, setFilters } = useFilterParams(filterConfig)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Nkb | null>(null)
  const [isNKBInfoDialogOpen, setIsNKBInfoDialogOpen] = useState(false)
  const [selectedNKB, setSelectedNKB] = useState<Nkb | null>(null)
  const [isHistoryNKBInfoDialogOpen, setIsHistoryNKBInfoDialogOpen] =
    useState(false)
  const [selectedHistoryNKB, setSelectedHistoryNKB] = useState<Nkb | null>(
    null
  )
  const [selectedNKBRows, setSelectedNKBRows] = useState<Nkb[]>([])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [resetSelectionKey, setResetSelectionKey] = useState(0)
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  const isCompanyAdmin =
    session?.user?.roles?.some((r) => r.code === "company_admin") ?? false

  // NKB Baru: fetch pending NKB from API
  const nkbBaruListOptions = useMemo(() => {
    const dateRange = filterValues.dateRange as
      | { from?: string; to?: string }
      | undefined
    const filter: Record<string, string> = {
      status: "pending",
    }
    if (dateRange?.from) filter.dateFrom = dateRange.from
    if (dateRange?.to) filter.dateTo = dateRange.to
    return {
      page: 1,
      pageSize: 100,
      filter,
    }
  }, [filterValues.dateRange])
  const { data: nkbBaruResponse, isLoading: isLoadingNkbBaru } =
    useNkbList(nkbBaruListOptions)
  const nkbBaruData = useMemo(
    () => nkbBaruResponse?.data ?? [],
    [nkbBaruResponse?.data]
  )

  // History NKB: fetch confirmed + rejected from API
  const nkbHistoryListOptions = useMemo(() => {
    const dateRange = filterValues.dateRange as
      | { from?: string; to?: string }
      | undefined
    const filter: Record<string, string> = {
      statusIn: "confirmed,rejected",
    }
    if (dateRange?.from) filter.dateFrom = dateRange.from
    if (dateRange?.to) filter.dateTo = dateRange.to
    return {
      page: 1,
      pageSize: 100,
      sortBy: "createdAt",
      order: "DESC" as const,
      filter,
    }
  }, [filterValues.dateRange])
  const {
    data: nkbHistoryResponse,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
  } = useNkbList(nkbHistoryListOptions)
  const nkbHistoryData = useMemo(
    () => nkbHistoryResponse?.data ?? [],
    [nkbHistoryResponse?.data]
  )

  const confirmNkbMutation = useConfirmNkb()
  const rejectNkbMutation = useRejectNkb()

  // NKB Baru: apply client-side filters (e.g. pembayaran range) to API data
  const filteredNkbBaruData = useMemo(() => {
    let filtered = [...nkbBaruData]
    const pembayaranRange = filterValues.pembayaranRange as
      | { from?: number | string | null; to?: number | string | null }
      | undefined
    if (pembayaranRange) {
      if (pembayaranRange.from !== null && pembayaranRange.from !== undefined) {
        const fromValue =
          typeof pembayaranRange.from === "string"
            ? Number(pembayaranRange.from)
            : pembayaranRange.from
        if (!isNaN(fromValue)) {
          filtered = filtered.filter(
            (item) => Number(item.amountPaid) >= fromValue
          )
        }
      }
      if (pembayaranRange.to !== null && pembayaranRange.to !== undefined) {
        const toValue =
          typeof pembayaranRange.to === "string"
            ? Number(pembayaranRange.to)
            : pembayaranRange.to
        if (!isNaN(toValue)) {
          filtered = filtered.filter(
            (item) => Number(item.amountPaid) <= toValue
          )
        }
      }
    }
    return filtered
  }, [filterValues, nkbBaruData])

  // History: apply client-side amount filter to API data
  const filteredHistoryData = useMemo(() => {
    let filtered = [...nkbHistoryData]
    const pembayaranRange = filterValues.pembayaranRange as
      | { from?: number | string | null; to?: number | string | null }
      | undefined
    if (pembayaranRange) {
      if (pembayaranRange.from !== null && pembayaranRange.from !== undefined) {
        const fromValue =
          typeof pembayaranRange.from === "string"
            ? Number(pembayaranRange.from)
            : pembayaranRange.from
        if (!isNaN(fromValue)) {
          filtered = filtered.filter(
            (item) => Number(item.amountPaid) >= fromValue
          )
        }
      }
      if (pembayaranRange.to !== null && pembayaranRange.to !== undefined) {
        const toValue =
          typeof pembayaranRange.to === "string"
            ? Number(pembayaranRange.to)
            : pembayaranRange.to
        if (!isNaN(toValue)) {
          filtered = filtered.filter(
            (item) => Number(item.amountPaid) <= toValue
          )
        }
      }
    }
    return filtered
  }, [filterValues, nkbHistoryData])

  const nkbBaruCount = nkbBaruData.length

  // NKB is not allowed for Admin PT (company_admin) — redirect to dashboard
  useEffect(() => {
    if (status === "authenticated" && isCompanyAdmin) {
      router.replace("/")
    }
  }, [status, isCompanyAdmin, router])

  if (status === "authenticated" && isCompanyAdmin) {
    return <TableSkeleton />
  }

  const handleDetailNKBBaru = (row: Nkb) => {
    setSelectedNKB(row)
    setIsNKBInfoDialogOpen(true)
  }

  const handleDetailHistoryNKB = (row: Nkb) => {
    setSelectedHistoryNKB(row)
    setIsHistoryNKBInfoDialogOpen(true)
  }

  const handleDelete = (row: Nkb) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      console.log("Delete:", itemToDelete)
      // Implement delete action when API available
    }
  }

  const handleApproveClick = () => {
    if (selectedNKB) setIsApproveConfirmOpen(true)
  }

  const handleConfirmApprove = async () => {
    if (!selectedNKB) return
    try {
      await confirmNkbMutation.mutateAsync({ id: selectedNKB.uuid })
      toast.success("NKB berhasil disetujui")
      setIsApproveConfirmOpen(false)
      setIsNKBInfoDialogOpen(false)
      setSelectedNKB(null)
    } catch {
      toast.error("Gagal menyetujui NKB")
    }
  }

  const handleRejectClick = () => {
    if (selectedNKB) setIsRejectDialogOpen(true)
  }

  const handleRejectConfirm = async (nkb: Nkb, data: { reason: string }) => {
    try {
      await rejectNkbMutation.mutateAsync({
        id: nkb.uuid,
        data: { reason: data.reason },
      })
      toast.success("NKB berhasil ditolak")
      setIsRejectDialogOpen(false)
      setIsNKBInfoDialogOpen(false)
      setSelectedNKB(null)
    } catch {
      toast.error("Gagal menolak NKB")
      throw new Error("Reject failed")
    }
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(value)
  }

  const handleBulkDelete = () => {
    setIsBulkDeleteDialogOpen(true)
  }

  const handleConfirmBulkDelete = () => {
    // TODO: Wire to delete API when available
    console.log("Bulk delete NKB:", selectedNKBRows)
    setIsBulkDeleteDialogOpen(false)
    setSelectedNKBRows([])
    setResetSelectionKey((k) => k + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">NKB</h1>
        <Breadcrumbs
          items={[{ label: "Pages", href: "/" }, { label: "NKB" }]}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="nkb-baru">
            NKB Baru
            {nkbBaruCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 size-5 items-center justify-center p-0 text-xs"
              >
                {nkbBaruCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history-nkb">History NKB</TabsTrigger>
        </TabsList>

        {/* NKB Baru Tab Content */}
        <TabsContent value="nkb-baru">
          {isLoadingNkbBaru ? (
            <TableSkeleton />
          ) : (
            <DataTable
              columns={columnsNKBBaru}
              data={filteredNkbBaruData}
              title="Daftar NKB"
              onDetail={handleDetailNKBBaru}
              onDelete={handleDelete}
              headerLeft={
                <div className="flex items-center gap-2">
                  <Select value={pageSize} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageSizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedNKBRows.length > 0 && (
                    <span className="text-destructive font-semibold">
                      &middot; {selectedNKBRows.length} Selected
                    </span>
                  )}
                </div>
              }
              headerRight={
                selectedNKBRows.length > 0 ? (
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <Button
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="size-4" />
                      Hapus
                    </Button>
                  </div>
                ) : undefined
              }
              filterConfig={filterConfig}
              filterValues={filterValues}
              onFilterChange={setFilters}
              initialPageSize={parseInt(pageSize)}
              onPageSizeChange={(size) => setPageSize(String(size))}
              searchPlaceholder="Search"
              onSelectionChange={setSelectedNKBRows}
              resetSelectionKey={resetSelectionKey}
            />
          )}
        </TabsContent>

        {/* History NKB Tab Content */}
        <TabsContent value="history-nkb">
          {isLoadingHistory ? (
            <TableSkeleton />
          ) : isErrorHistory ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">Gagal memuat data</p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={columnsHistoryNKB}
              data={filteredHistoryData}
              title="Daftar NKB"
              onDetail={handleDetailHistoryNKB}
              headerLeft={
                <Select value={pageSize} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
              filterConfig={filterConfig}
              filterValues={filterValues}
              onFilterChange={setFilters}
              initialPageSize={parseInt(pageSize)}
              onPageSizeChange={(size) => setPageSize(String(size))}
              searchPlaceholder="Search"
            />
          )}
        </TabsContent>
      </Tabs>

      {/* NKB Information Dialog */}
      <NKBInfoDialog
        open={isNKBInfoDialogOpen}
        onOpenChange={setIsNKBInfoDialogOpen}
        nkb={selectedNKB}
        onApproveClick={handleApproveClick}
        onRejectClick={handleRejectClick}
        isApprovePending={confirmNkbMutation.isPending}
        isRejectPending={rejectNkbMutation.isPending}
      />

      {/* History NKB Information Dialog (read-only popup) */}
      <HistoryNKBInfoDialog
        open={isHistoryNKBInfoDialogOpen}
        onOpenChange={setIsHistoryNKBInfoDialogOpen}
        nkb={selectedHistoryNKB}
      />

      {/* Confirmation Dialog for Approve */}
      <ConfirmationDialog
        open={isApproveConfirmOpen}
        onOpenChange={setIsApproveConfirmOpen}
        onConfirm={handleConfirmApprove}
        title="Setujui NKB"
        description="Anda akan menyetujui NKB ini."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />

      {/* Tolak NKB Dialog (with optional reason + confirm) */}
      <TolakNkbDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        nkb={selectedNKB}
        onConfirm={handleRejectConfirm}
        isSubmitting={rejectNkbMutation.isPending}
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        description="Anda akan menghapus data NKB dari dalam sistem."
      />

      {/* Confirmation Dialog for Bulk Delete */}
      <ConfirmationDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus NKB"
        description={`Anda akan menghapus ${selectedNKBRows.length} data NKB dari dalam sistem.`}
        confirmLabel="Hapus"
        variant="destructive"
      />
    </div>
  )
}

export default function NKBPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <NKBPageContent />
    </Suspense>
  )
}
