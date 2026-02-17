"use client"

import React, { useMemo, Suspense, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ColumnDef } from "@tanstack/react-table"
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
import { X, Hand, Check } from "lucide-react"

// Sample data type
type NKB = {
  id: string
  nomorNKB: string
  jenisPembayaran: string
  tanggalWaktu: string
  totalPembayaran: number
  status?: "Disetujui" | "Ditolak" // Only for History NKB
}

// Sample data for "NKB Baru"
const sampleNKBBaru: NKB[] = Array.from({ length: 1 }, (_, i) => ({
  id: `NKB${String(i + 1).padStart(3, "0")}`,
  nomorNKB: `iPhone 15 Pro`,
  jenisPembayaran: "Cash",
  tanggalWaktu: new Date(2025, 10, 20, 18, 33, 45).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
  totalPembayaran: 650000,
}))

// Sample data for "History NKB"
const sampleHistoryNKB: NKB[] = Array.from({ length: 4 }, (_, i) => ({
  id: `NKB${String(i + 1).padStart(3, "0")}`,
  nomorNKB: `NKB/001/20112025`,
  jenisPembayaran: i % 2 === 0 ? "Cash" : "Transfer",
  tanggalWaktu: new Date(2025, 10, 20, 18, 33, 45).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
  totalPembayaran: 650000,
  status: i % 2 === 0 ? "Disetujui" : "Ditolak",
}))

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Filter configuration for NKB
const filterConfig: FilterConfig[] = [
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

// Base column definitions (shared columns)
const baseColumns: ColumnDef<NKB>[] = [
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
    accessorKey: "nomorNKB",
    header: "Nomor NKB",
  },
  {
    accessorKey: "jenisPembayaran",
    header: "Jenis Pembayaran",
  },
  {
    accessorKey: "tanggalWaktu",
    header: "Tanggal & Waktu",
  },
  {
    accessorKey: "totalPembayaran",
    header: "Total Pembayaran",
    cell: ({ row }) => {
      return `Rp ${formatCurrency(row.getValue("totalPembayaran"))},-`
    },
  },
]

// Column definitions for NKB Baru (without Status)
const columnsNKBBaru: ColumnDef<NKB>[] = [...baseColumns]

// Column definitions for History NKB (with Status)
const columnsHistoryNKB: ColumnDef<NKB>[] = [
  ...baseColumns,
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as
        | "Disetujui"
        | "Ditolak"
        | undefined
      if (!status) return null

      return (
        <Badge
          variant={status === "Disetujui" ? "secondary" : "destructive"}
          className={
            status === "Disetujui"
              ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300"
          }
        >
          {status}
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

// NKB Information Dialog Component
function NKBInfoDialog({
  open,
  onOpenChange,
  nkb,
  onApprove,
  onReject,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  nkb: NKB | null
  onApprove: () => void
  onReject: () => void
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
              <p className="text-base">{nkb.nomorNKB}</p>
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Tanggal & Waktu
              </label>
              <p className="text-base">{nkb.tanggalWaktu}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Jenis Pembayaran
              </label>
              <p className="text-base">{nkb.jenisPembayaran}</p>
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Total Pembayaran
              </label>
              <p className="text-base">
                Rp {formatCurrency(nkb.totalPembayaran)},-
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
            onClick={() => {
              onReject()
              onOpenChange(false)
            }}
            className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Hand className="size-4" />
            Tolak
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onApprove()
              onOpenChange(false)
            }}
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

function NKBPageContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("nkb-baru")
  const [pageSize, setPageSize] = useState("100")
  const { filterValues, setFilters } = useFilterParams(filterConfig)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<NKB | null>(null)
  const [isNKBInfoDialogOpen, setIsNKBInfoDialogOpen] = useState(false)
  const [selectedNKB, setSelectedNKB] = useState<NKB | null>(null)

  const isCompanyAdmin =
    session?.user?.roles?.some((r) => r.code === "company_admin") ?? false

  // NKB is not allowed for Admin PT (company_admin) — redirect to dashboard
  useEffect(() => {
    if (status === "authenticated" && isCompanyAdmin) {
      router.replace("/")
    }
  }, [status, isCompanyAdmin, router])

  if (status === "authenticated" && isCompanyAdmin) {
    return <TableSkeleton />
  }

  // Get data based on active tab
  const currentData = useMemo(() => {
    return activeTab === "nkb-baru" ? sampleNKBBaru : sampleHistoryNKB
  }, [activeTab])

  // Count new NKB items
  const nkbBaruCount = sampleNKBBaru.length

  // Apply filters to data
  const filteredData = useMemo(() => {
    let filtered = [...currentData]

    // Apply pembayaran range filter
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
            (item) => item.totalPembayaran >= fromValue
          )
        }
      }
      if (pembayaranRange.to !== null && pembayaranRange.to !== undefined) {
        const toValue =
          typeof pembayaranRange.to === "string"
            ? Number(pembayaranRange.to)
            : pembayaranRange.to
        if (!isNaN(toValue)) {
          filtered = filtered.filter((item) => item.totalPembayaran <= toValue)
        }
      }
    }

    return filtered
  }, [filterValues, currentData])

  const handleDetailNKBBaru = (row: NKB) => {
    setSelectedNKB(row)
    setIsNKBInfoDialogOpen(true)
  }

  const handleDetailHistoryNKB = (row: NKB) => {
    router.push(`/nkb/${row.id}`)
  }

  const handleDelete = (row: NKB) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      console.log("Delete:", itemToDelete)
      // Implement delete action
    }
  }

  const handleApprove = () => {
    if (selectedNKB) {
      console.log("Approve:", selectedNKB)
      // Implement approve action
    }
  }

  const handleReject = () => {
    if (selectedNKB) {
      console.log("Reject:", selectedNKB)
      // Implement reject action
    }
  }

  const handlePageSizeChange = (value: string) => {
    setPageSize(value)
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
          <DataTable
            columns={columnsNKBBaru}
            data={filteredData}
            title="Daftar NKB"
            onDetail={handleDetailNKBBaru}
            onDelete={handleDelete}
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
            searchplaceholder="Search"
          />
        </TabsContent>

        {/* History NKB Tab Content */}
        <TabsContent value="history-nkb">
          <DataTable
            columns={columnsHistoryNKB}
            data={filteredData}
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
            searchplaceholder="Search"
          />
        </TabsContent>
      </Tabs>

      {/* NKB Information Dialog */}
      <NKBInfoDialog
        open={isNKBInfoDialogOpen}
        onOpenChange={setIsNKBInfoDialogOpen}
        nkb={selectedNKB}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        description="Anda akan menghapus data NKB dari dalam sistem."
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
