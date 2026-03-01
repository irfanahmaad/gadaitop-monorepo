"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Plus, SearchIcon, SlidersHorizontal, Trash2 } from "lucide-react"
import type { FilterConfig } from "@/hooks/use-filter-params"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { StockOpnameFormDialog } from "./_components/StockOpnameFormDialog"
import { CalendarView } from "./_components/CalendarView"
import type { ScheduleItem } from "./_components/StockOpnameScheduleList"
import {
  useStockOpnameSessions,
  stockOpnameKeys,
} from "@/lib/react-query/hooks/use-stock-opname"
import { useQueryClient } from "@tanstack/react-query"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import type { StockOpnameSessionListItem } from "@/lib/api/types"
import { format } from "date-fns"
import { id } from "date-fns/locale"

// Row type for table and calendar (mapped from API)
export type StockOpnameRow = {
  id: string
  idSO: string
  tanggal: string
  toko: string
  petugas: string
  lastUpdatedAt: string
  status: "Dijadwalkan" | "Berjalan" | "Menunggu Approval" | "Tervalidasi"
}

const STATUS_DISPLAY: Record<
  StockOpnameSessionListItem["status"],
  StockOpnameRow["status"]
> = {
  draft: "Dijadwalkan",
  in_progress: "Berjalan",
  completed: "Menunggu Approval",
  approved: "Tervalidasi",
}

function formatTanggal(isoDate: string): string {
  try {
    return format(new Date(isoDate), "d MMMM yyyy", { locale: id })
  } catch {
    return isoDate
  }
}

function formatLastUpdated(isoDate: string): string {
  try {
    return format(new Date(isoDate), "d MMMM yyyy HH:mm:ss", { locale: id })
  } catch {
    return isoDate
  }
}

function mapSessionToRow(
  session: StockOpnameSessionListItem,
  storeNameById: Map<string, string>
): StockOpnameRow {
  return {
    id: session.uuid,
    idSO: session.sessionCode,
    tanggal: formatTanggal(session.startDate),
    toko: storeNameById.get(session.storeId) ?? session.storeId,
    petugas: "—",
    lastUpdatedAt: formatLastUpdated(session.createdAt),
    status: STATUS_DISPLAY[session.status],
  }
}

// Status badge component
const StatusBadge = ({ status }: { status: StockOpnameRow["status"] }) => {
  const statusConfig: Record<
    StockOpnameRow["status"],
    { label: string; className: string }
  > = {
    Dijadwalkan: {
      label: "Dijadwalkan",
      className:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    Berjalan: {
      label: "Berjalan",
      className:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    "Menunggu Approval": {
      label: "Menunggu Approval",
      className:
        "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    },
    Tervalidasi: {
      label: "Tervalidasi",
      className:
        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
  }
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

// Table skeleton for loading state
function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-64" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Column definitions
const columns: ColumnDef<StockOpnameRow>[] = [
  {
    id: "select",
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
      <div className="flex items-center gap-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
        <span className="text-sm">{row.index + 1}</span>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "idSO",
    header: "ID SO",
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
  },
  {
    accessorKey: "toko",
    header: "Toko",
  },
  {
    accessorKey: "petugas",
    header: "Petugas",
  },
  {
    accessorKey: "lastUpdatedAt",
    header: "Last Updated At",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
]

export default function StockOpnamePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isCompanyAdmin = useMemo(
    () => user?.roles?.some((role) => role.code === "company_admin") ?? false,
    [user]
  )

  const [pageSize, setPageSize] = useState(10)
  const [page] = useState(1)
  const [searchValue, setSearchValue] = useState("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<
    StockOpnameRow | ScheduleItem | null
  >(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("list")
  const [selectedRows, setSelectedRows] = useState<StockOpnameRow[]>([])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [resetSelectionKey, setResetSelectionKey] = useState(0)

  // Branch lookup for store names
  const { data: branchesData } = useBranches({ pageSize: 500 })
  const storeNameById = useMemo(() => {
    const map = new Map<string, string>()
    branchesData?.data?.forEach((b) =>
      map.set(b.uuid, b.shortName ?? b.fullName ?? b.uuid)
    )
    return map
  }, [branchesData?.data])

  // Filter config for Stock Opname
  const filterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "dateRange",
        label: "",
        type: "daterange",
        labelFrom: "Mulai Dari",
        labelTo: "Sampai Dengan",
      },
      {
        key: "tipeBarang",
        label: "Tipe Barang",
        type: "multiselect",
        placeholder: "Pilih tipe barang...",
        options: [
          { label: "Handphone", value: "Handphone" },
          { label: "IoT", value: "IoT" },
          { label: "Laptop", value: "Laptop" },
          { label: "Drone", value: "Drone" },
          { label: "Smartwatch", value: "Smartwatch" },
          { label: "Tablet", value: "Tablet" },
        ],
      },
      {
        key: "toko",
        label: "Toko",
        type: "multiselect",
        placeholder: "Pilih toko...",
        options: (branchesData?.data ?? []).map((b) => ({
          label: b.shortName ?? b.fullName ?? b.branchCode,
          value: b.shortName ?? b.fullName ?? b.branchCode,
        })),
      },
      {
        key: "segmentasi",
        label: "Segmentasi",
        type: "radio",
        radioOptions: [
          { label: "< 1 Bulan", value: "lt_1_bulan" },
          { label: "> 1 Bulan", value: "gt_1_bulan" },
        ],
      },
    ],
    [branchesData?.data]
  )

  const defaultFilterValues: Record<string, unknown> = useMemo(
    () => ({
      dateRange: { from: null, to: null },
      tipeBarang: [],
      toko: [],
      segmentasi: null,
    }),
    []
  )

  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [filterValues, setFilterValues] =
    useState<Record<string, unknown>>(defaultFilterValues)

  // List options by tab: list/calendar = all; other tabs = filter by status
  const listOptions = useMemo(
    () => ({
      page,
      pageSize,
      sortBy: "createdAt" as const,
      order: "DESC" as const,
      ...(activeTab === "dijadwalkan" && { filter: { status: "draft" } }),
      ...(activeTab === "waiting-for-approval" && {
        filter: { status: "completed" },
      }),
      ...(activeTab === "tervalidasi" && { filter: { status: "approved" } }),
    }),
    [activeTab, page, pageSize]
  )

  const {
    data: listResponse,
    isLoading,
    isError,
  } = useStockOpnameSessions(listOptions)

  // Counts for status tabs (minimal query to get meta.count)
  const { data: countDraft } = useStockOpnameSessions({
    filter: { status: "draft" },
    page: 1,
    pageSize: 1,
  })
  const { data: countCompleted } = useStockOpnameSessions({
    filter: { status: "completed" },
    page: 1,
    pageSize: 1,
  })
  const { data: countApproved } = useStockOpnameSessions({
    filter: { status: "approved" },
    page: 1,
    pageSize: 1,
  })

  const dijadwalkanCount = countDraft?.meta?.count ?? 0
  const waitingForApprovalCount = countCompleted?.meta?.count ?? 0
  const tervalidasiCount = countApproved?.meta?.count ?? 0

  // Apply filters client-side, then map to rows
  const rows = useMemo(() => {
    const sessions = listResponse?.data ?? []
    const dateRange = (filterValues.dateRange as {
      from: string | null
      to: string | null
    }) ?? { from: null, to: null }
    // tipeBarang filter: session list has no item types; reserved for future API support
    const toko = (filterValues.toko as string[] | undefined) ?? []
    const segmentasi = filterValues.segmentasi as string | null | undefined

    let filtered = sessions

    // Date range filter (on startDate)
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((s) => {
        const d = new Date(s.startDate)
        if (dateRange.from && d < new Date(dateRange.from)) return false
        if (dateRange.to && d > new Date(dateRange.to)) return false
        return true
      })
    }

    // Toko filter (store name)
    if (toko.length) {
      filtered = filtered.filter((s) => {
        const storeName = storeNameById.get(s.storeId) ?? s.storeId
        return toko.includes(storeName)
      })
    }

    // Segmentasi filter (< 1 Bulan vs > 1 Bulan based on startDate)
    if (segmentasi) {
      const now = new Date()
      const oneMonthAgo = new Date(now)
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      filtered = filtered.filter((s) => {
        const d = new Date(s.startDate)
        if (segmentasi === "lt_1_bulan") return d >= oneMonthAgo
        if (segmentasi === "gt_1_bulan") return d < oneMonthAgo
        return true
      })
    }

    // tipeBarang: session list doesn't include item types; no client-side filter
    return filtered.map((s) => mapSessionToRow(s, storeNameById))
  }, [
    listResponse?.data,
    storeNameById,
    filterValues.dateRange,
    filterValues.toko,
    filterValues.segmentasi,
  ])

  // For company_admin, only "list" and "calendar" are available — ensure activeTab is valid
  useEffect(() => {
    if (isCompanyAdmin && !["list", "calendar"].includes(activeTab)) {
      setActiveTab("list")
    }
  }, [isCompanyAdmin, activeTab])

  const handleCreate = () => {
    setIsFormDialogOpen(true)
  }

  const handleFormDialogClose = () => {
    setIsFormDialogOpen(false)
  }

  const handleDetail = (row: StockOpnameRow) => {
    router.push(`/stock-opname/${row.id}`)
  }

  const handleEdit = (row: StockOpnameRow) => {
    // router.push(`/stock-opname/${row.id}`)
  }

  const handleDelete = (row: StockOpnameRow) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      // Backend has no delete endpoint for stock opname sessions; placeholder for future
      setItemToDelete(null)
      setIsConfirmDialogOpen(false)
    }
  }

  const handleBulkDelete = () => {
    setIsBulkDeleteDialogOpen(true)
  }

  const handleConfirmBulkDelete = () => {
    // TODO: Wire to delete API when available
    console.log("Bulk delete Stock Opname:", selectedRows)
    setIsBulkDeleteDialogOpen(false)
    setSelectedRows([])
    setResetSelectionKey((k) => k + 1)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Stock Opname</h1>
          <Breadcrumbs
            items={[{ label: "Pages", href: "/" }, { label: "Stock Opname" }]}
          />
        </div>

        <div>
          <Button onClick={handleCreate} variant="destructive">
            <Plus className="size-5" />
            Tambah Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-4"
      >
        <TabsList className="w-fit">
          <TabsTrigger value="list">Tampilan List</TabsTrigger>
          <TabsTrigger value="calendar">Tampilan Kalender</TabsTrigger>
          {!isCompanyAdmin && (
            <>
              <TabsTrigger
                value="dijadwalkan"
                className="flex items-center gap-2"
              >
                Dijadwalkan
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    activeTab === "dijadwalkan"
                      ? "bg-[#DD3333] text-white"
                      : "bg-red-50 text-[#DD3333]"
                  }`}
                >
                  {dijadwalkanCount}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="waiting-for-approval"
                className="flex items-center gap-2"
              >
                Waiting for Approval
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    activeTab === "waiting-for-approval"
                      ? "bg-[#DD3333] text-white"
                      : "bg-red-50 text-[#DD3333]"
                  }`}
                >
                  {waitingForApprovalCount}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="tervalidasi"
                className="flex items-center gap-2"
              >
                Tervalidasi
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                    activeTab === "tervalidasi"
                      ? "bg-[#DD3333] text-white"
                      : "bg-red-50 text-[#DD3333]"
                  }`}
                >
                  {tervalidasiCount}
                </span>
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="mt-0">
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">Gagal memuat data</p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              searchPlaceholder="Cari..."
              headerLeft={
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Daftar SO</CardTitle>
                  {selectedRows.length > 0 && (
                    <span className="text-destructive font-semibold">
                      &middot; {selectedRows.length} Selected
                    </span>
                  )}
                </div>
              }
              headerRight={
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(Number(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="w-full sm:w-auto sm:max-w-sm">
                    <Input
                      placeholder="Cari..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      icon={<SearchIcon className="size-4" />}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setFilterDialogOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                  {selectedRows.length > 0 && (
                    <Button
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="size-4" />
                      Hapus
                    </Button>
                  )}
                </div>
              }
              filterConfig={filterConfig}
              filterValues={filterValues}
              onFilterChange={setFilterValues}
              filterDialogOpen={filterDialogOpen}
              onFilterDialogOpenChange={setFilterDialogOpen}
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelectionChange={setSelectedRows}
              resetSelectionKey={resetSelectionKey}
            />
          )}
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-0">
          <CalendarView
            data={rows}
            isLoading={isLoading}
            onDetail={(item) => router.push(`/stock-opname/${item.id}`)}
            onEdit={(item) => router.push(`/stock-opname/${item.id}`)}
            onDelete={(item) => {
              setItemToDelete(item)
              setIsConfirmDialogOpen(true)
            }}
          />
        </TabsContent>

        {/* Dijadwalkan View */}
        <TabsContent value="dijadwalkan" className="mt-0">
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">Gagal memuat data</p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              searchPlaceholder="Cari..."
              headerLeft={
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    Daftar SO Dijadwalkan
                  </CardTitle>
                  {selectedRows.length > 0 && (
                    <span className="text-destructive font-semibold">
                      &middot; {selectedRows.length} Selected
                    </span>
                  )}
                </div>
              }
              headerRight={
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(Number(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="w-full sm:w-auto sm:max-w-sm">
                    <Input
                      placeholder="Cari..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      icon={<SearchIcon className="size-4" />}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setFilterDialogOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                  {selectedRows.length > 0 && (
                    <Button
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="size-4" />
                      Hapus
                    </Button>
                  )}
                </div>
              }
              filterConfig={filterConfig}
              filterValues={filterValues}
              onFilterChange={setFilterValues}
              filterDialogOpen={filterDialogOpen}
              onFilterDialogOpenChange={setFilterDialogOpen}
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelectionChange={setSelectedRows}
              resetSelectionKey={resetSelectionKey}
            />
          )}
        </TabsContent>

        {/* Waiting for Approval View */}
        <TabsContent value="waiting-for-approval" className="mt-0">
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">Gagal memuat data</p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              searchPlaceholder="Cari..."
              headerLeft={
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    Daftar SO Waiting for Approval
                  </CardTitle>
                  {selectedRows.length > 0 && (
                    <span className="text-destructive font-semibold">
                      &middot; {selectedRows.length} Selected
                    </span>
                  )}
                </div>
              }
              headerRight={
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(Number(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="w-full sm:w-auto sm:max-w-sm">
                    <Input
                      placeholder="Cari..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      icon={<SearchIcon className="size-4" />}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setFilterDialogOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                  {selectedRows.length > 0 && (
                    <Button
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="size-4" />
                      Hapus
                    </Button>
                  )}
                </div>
              }
              filterConfig={filterConfig}
              filterValues={filterValues}
              onFilterChange={setFilterValues}
              filterDialogOpen={filterDialogOpen}
              onFilterDialogOpenChange={setFilterDialogOpen}
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelectionChange={setSelectedRows}
              resetSelectionKey={resetSelectionKey}
            />
          )}
        </TabsContent>

        {/* Tervalidasi View */}
        <TabsContent value="tervalidasi" className="mt-0">
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">Gagal memuat data</p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              searchPlaceholder="Cari..."
              headerLeft={
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    Daftar SO Tervalidasi
                  </CardTitle>
                  {selectedRows.length > 0 && (
                    <span className="text-destructive font-semibold">
                      &middot; {selectedRows.length} Selected
                    </span>
                  )}
                </div>
              }
              headerRight={
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(Number(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="w-full sm:w-auto sm:max-w-sm">
                    <Input
                      placeholder="Cari..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      icon={<SearchIcon className="size-4" />}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setFilterDialogOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                  {selectedRows.length > 0 && (
                    <Button
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="size-4" />
                      Hapus
                    </Button>
                  )}
                </div>
              }
              filterConfig={filterConfig}
              filterValues={filterValues}
              onFilterChange={setFilterValues}
              filterDialogOpen={filterDialogOpen}
              onFilterDialogOpenChange={setFilterDialogOpen}
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelectionChange={setSelectedRows}
              resetSelectionKey={resetSelectionKey}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog for Create */}
      <StockOpnameFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onClose={handleFormDialogClose}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() })
        }
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        description="Anda akan menghapus data Stock Opname dari dalam sistem."
      />

      {/* Confirmation Dialog for Bulk Delete */}
      <ConfirmationDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Stock Opname"
        description={`Anda akan menghapus ${selectedRows.length} data Stock Opname dari dalam sistem.`}
        confirmLabel="Hapus"
        variant="destructive"
      />
    </div>
  )
}
