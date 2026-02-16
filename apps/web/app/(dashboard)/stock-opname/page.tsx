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
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Plus, SearchIcon, SlidersHorizontal } from "lucide-react"
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
  status:
    | "Dijadwalkan"
    | "Berjalan"
    | "Menunggu Approval"
    | "Tervalidasi"
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

  const [pageSize, setPageSize] = useState(100)
  const [page] = useState(1)
  const [searchValue, setSearchValue] = useState("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<StockOpnameRow | ScheduleItem | null>(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  // Branch lookup for store names
  const { data: branchesData } = useBranches({ pageSize: 500 })
  const storeNameById = useMemo(() => {
    const map = new Map<string, string>()
    branchesData?.data?.forEach((b) =>
      map.set(b.uuid, b.shortName ?? b.fullName ?? b.uuid)
    )
    return map
  }, [branchesData?.data])

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

  const { data: listResponse, isLoading, isError } =
    useStockOpnameSessions(listOptions)

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

  const rows = useMemo(
    () =>
      (listResponse?.data ?? []).map((s) => mapSessionToRow(s, storeNameById)),
    [listResponse?.data, storeNameById]
  )

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
    router.push(`/stock-opname/${row.id}`)
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
              title="Daftar SO"
              searchPlaceholder="Cari..."
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
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
              title="Daftar SO Dijadwalkan"
              searchPlaceholder="Cari..."
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
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
              title="Daftar SO Waiting for Approval"
              searchPlaceholder="Cari..."
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
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
              title="Daftar SO Tervalidasi"
              searchPlaceholder="Cari..."
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
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
    </div>
  )
}
