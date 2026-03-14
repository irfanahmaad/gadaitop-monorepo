"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
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
import { SlidersHorizontal } from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useAuctionBatches } from "@/lib/react-query/hooks/use-auction-batches"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import type { AuctionBatch } from "@/lib/api/types"

type ValidasiLelanganRole = "auction_staff" | "marketing_staff"

type ValidasiLelanganRow = {
  id: string
  idBatch: string
  namaBatch: string
  jumlahItem: number
  toko: string
  petugas: string
  status?: "Tervalidasi" | "Dijadwalkan" | "Waiting for Approval"
  lastUpdatedAt: string
}

const TAB_VALUES = {
  dijadwalkan: "dijadwalkan",
  waiting_for_approval: "waiting_for_approval",
  tervalidasi: "tervalidasi",
} as const

function mapBatchToRow(batch: AuctionBatch, tab: string): ValidasiLelanganRow {
  const items = batch.items ?? []
  const countAssignees =
    (batch.marketingStaff?.length ?? 0) + (batch.auctionStaff?.length ?? 0)
  const updatedAt = batch.updatedAt ?? batch.createdAt
  return {
    id: batch.uuid,
    idBatch: batch.batchCode,
    namaBatch: batch.name ?? batch.batchCode ?? "-",
    jumlahItem: items.length,
    toko: (batch.store as { shortName?: string })?.shortName ?? "-",
    petugas: String(countAssignees),
    lastUpdatedAt: updatedAt
      ? format(new Date(updatedAt), "d MMMM yyyy HH:mm:ss", { locale: id })
      : "-",
    ...(tab === TAB_VALUES.tervalidasi && { status: "Tervalidasi" as const }),
  }
}

const baseColumns: ColumnDef<ValidasiLelanganRow>[] = [
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
  { accessorKey: "idBatch", header: "ID Batch" },
  { accessorKey: "namaBatch", header: "Nama Batch" },
  {
    accessorKey: "jumlahItem",
    header: "Jumlah Item",
    cell: ({ row }) => <span>{row.getValue("jumlahItem")}</span>,
  },
  {
    accessorKey: "toko",
    header: "Toko",
    cell: ({ row }) => <span>{row.getValue("toko")}</span>,
  },
  {
    accessorKey: "petugas",
    header: "Petugas",
    cell: ({ row }) => <span>{row.getValue("petugas")}</span>,
  },
  { accessorKey: "lastUpdatedAt", header: "Last Updated At" },
]

const columnsWithStatus: ColumnDef<ValidasiLelanganRow>[] = [
  ...baseColumns.slice(0, -1),
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ValidasiLelanganRow["status"]
      if (!status) return null
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
        >
          {status}
        </Badge>
      )
    },
  },
  { accessorKey: "lastUpdatedAt", header: "Last Updated At" },
]

const baseColumnsNoSelect = baseColumns.filter((c) => c.id !== "select")
const columnsWithStatusNoSelect: ColumnDef<ValidasiLelanganRow>[] = [
  ...baseColumnsNoSelect.slice(0, -1),
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ValidasiLelanganRow["status"]
      if (!status) return null
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
        >
          {status}
        </Badge>
      )
    },
  },
  { accessorKey: "lastUpdatedAt", header: "Last Updated At" },
]

function TableSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ValidasiLelanganPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

  const assigneeRole: ValidasiLelanganRole | null = useMemo(() => {
    const roles = user?.roles ?? []
    if (roles.some((r) => r.code === "auction_staff")) return "auction_staff"
    if (roles.some((r) => r.code === "marketing")) return "marketing_staff"
    return null
  }, [user?.roles])

  const isAuctionStaff = assigneeRole === "auction_staff"
  const pageTitle =
    assigneeRole === "auction_staff"
      ? "Validasi Lelang – Staf Lelang"
      : assigneeRole === "marketing_staff"
        ? "Validasi Lelang – Staf Marketing"
        : "Validasi Lelang"

  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState<
    "dijadwalkan" | "waiting_for_approval" | "tervalidasi"
  >("dijadwalkan")
  const [selectedRows, setSelectedRows] = useState<ValidasiLelanganRow[]>([])
  const [resetSelectionKey] = useState(0)

  const listOptions = useMemo(() => {
    if (!user?.uuid || !assigneeRole) return undefined
    return {
      page,
      pageSize,
      query: searchValue || undefined,
      filter: {
        assignedTo: user.uuid,
        assigneeRole,
        tab: activeTab,
      } as Record<string, string>,
    }
  }, [user?.uuid, assigneeRole, activeTab, page, pageSize, searchValue])

  const {
    data: batchData,
    isLoading: isListLoading,
    isError: isListError,
  } = useAuctionBatches(listOptions)

  const countOptionsDijadwalkan = useMemo(
    () =>
      user?.uuid && assigneeRole
        ? {
            page: 1,
            pageSize: 1,
            filter: {
              assignedTo: user.uuid,
              assigneeRole,
              tab: "dijadwalkan",
            } as Record<string, string>,
          }
        : undefined,
    [user?.uuid, assigneeRole]
  )
  const countOptionsWaiting = useMemo(
    () =>
      user?.uuid && assigneeRole
        ? {
            page: 1,
            pageSize: 1,
            filter: {
              assignedTo: user.uuid,
              assigneeRole,
              tab: "waiting_for_approval",
            } as Record<string, string>,
          }
        : undefined,
    [user?.uuid, assigneeRole]
  )
  const countOptionsTervalidasi = useMemo(
    () =>
      user?.uuid && assigneeRole
        ? {
            page: 1,
            pageSize: 1,
            filter: {
              assignedTo: user.uuid,
              assigneeRole,
              tab: "tervalidasi",
            } as Record<string, string>,
          }
        : undefined,
    [user?.uuid, assigneeRole]
  )
  const { data: countDijadwalkan } = useAuctionBatches(countOptionsDijadwalkan)
  const { data: countWaiting } = useAuctionBatches(countOptionsWaiting)
  const { data: countTervalidasi } = useAuctionBatches(countOptionsTervalidasi)

  const dijadwalkanCount = countDijadwalkan?.meta?.count ?? 0
  const waitingCount = countWaiting?.meta?.count ?? 0
  const tervalidasiCount = countTervalidasi?.meta?.count ?? 0

  const rows = useMemo(() => {
    const batches = batchData?.data ?? []
    return batches.map((b) => mapBatchToRow(b, activeTab))
  }, [batchData?.data, activeTab])

  const totalCount = batchData?.meta?.count ?? 0
  const listColumns = isAuctionStaff ? baseColumnsNoSelect : baseColumns
  const tabCounts = {
    dijadwalkan: dijadwalkanCount,
    waiting_for_approval: waitingCount,
    tervalidasi: tervalidasiCount,
  }
  const tervalidasiColumns = isAuctionStaff
    ? columnsWithStatusNoSelect
    : columnsWithStatus

  const handleDetail = (row: ValidasiLelanganRow) => {
    router.push(`/lelangan/${row.id}`)
  }

  const handleEdit = () => {
    // No-op for validasi; edit is on batch detail
  }

  const handleDelete = () => {
    // No-op; use batch detail to cancel
  }

  if (isAuthLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <TableSkeleton />
      </div>
    )
  }

  if (!user || !assigneeRole) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Validasi Lelang</h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: "Validasi Lelang" },
            ]}
          />
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">
              Anda tidak memiliki akses ke halaman ini. Hanya Staf Lelang dan Staf
              Marketing yang dapat mengakses Validasi Lelang.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <Breadcrumbs
          items={[
            { label: "Pages", href: "/" },
            { label: "Validasi Lelang" },
          ]}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as typeof activeTab)
          setPage(1)
        }}
        className="flex flex-col gap-4"
      >
        <TabsList className="w-fit">
          <TabsTrigger value="dijadwalkan" className="flex items-center gap-2">
            Dijadwalkan
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                activeTab === "dijadwalkan"
                  ? "bg-[#DD3333] text-white"
                  : "bg-red-50 text-[#DD3333]"
              }`}
            >
              {tabCounts.dijadwalkan}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="waiting_for_approval"
            className="flex items-center gap-2"
          >
            Waiting for Approval
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                activeTab === "waiting_for_approval"
                  ? "bg-[#DD3333] text-white"
                  : "bg-red-50 text-[#DD3333]"
              }`}
            >
              {tabCounts.waiting_for_approval}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tervalidasi" className="flex items-center gap-2">
            Tervalidasi
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                activeTab === "tervalidasi"
                  ? "bg-[#DD3333] text-white"
                  : "bg-red-50 text-[#DD3333]"
              }`}
            >
              {tabCounts.tervalidasi}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dijadwalkan" className="mt-0">
          {isListLoading ? (
            <TableSkeleton />
          ) : isListError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">Gagal memuat data</p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={listColumns}
              data={rows}
              searchPlaceholder="Cari..."
              headerLeft={
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    Daftar Validasi Lelang Dijadwalkan
                  </CardTitle>
                  {!isAuctionStaff && selectedRows.length > 0 && (
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
                    onValueChange={(v) => {
                      setPageSize(Number(v))
                      setPage(1)
                    }}
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
                      onChange={(e) => {
                        setSearchValue(e.target.value)
                        setPage(1)
                      }}
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
              onEdit={isAuctionStaff ? undefined : handleEdit}
              onDelete={isAuctionStaff ? undefined : handleDelete}
              onSelectionChange={isAuctionStaff ? undefined : setSelectedRows}
              resetSelectionKey={isAuctionStaff ? undefined : resetSelectionKey}
              serverSidePagination={{
                totalRowCount: totalCount,
                pageIndex: page - 1,
                onPageIndexChange: (idx) => setPage(idx + 1),
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="waiting_for_approval" className="mt-0">
          {isListLoading ? (
            <TableSkeleton />
          ) : isListError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">Gagal memuat data</p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={listColumns}
              data={rows}
              searchPlaceholder="Cari..."
              headerLeft={
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    Daftar Waiting for Approval
                  </CardTitle>
                  {!isAuctionStaff && selectedRows.length > 0 && (
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
                    onValueChange={(v) => {
                      setPageSize(Number(v))
                      setPage(1)
                    }}
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
                      onChange={(e) => {
                        setSearchValue(e.target.value)
                        setPage(1)
                      }}
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
              onEdit={isAuctionStaff ? undefined : handleEdit}
              onDelete={isAuctionStaff ? undefined : handleDelete}
              onSelectionChange={isAuctionStaff ? undefined : setSelectedRows}
              resetSelectionKey={isAuctionStaff ? undefined : resetSelectionKey}
              serverSidePagination={{
                totalRowCount: totalCount,
                pageIndex: page - 1,
                onPageIndexChange: (idx) => setPage(idx + 1),
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="tervalidasi" className="mt-0">
          {isListLoading ? (
            <TableSkeleton />
          ) : isListError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">Gagal memuat data</p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={tervalidasiColumns}
              data={rows}
              searchPlaceholder="Cari..."
              headerLeft={
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    Daftar Batch Lelang Tervalidasi
                  </CardTitle>
                  {!isAuctionStaff && selectedRows.length > 0 && (
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
                    onValueChange={(v) => {
                      setPageSize(Number(v))
                      setPage(1)
                    }}
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
                      onChange={(e) => {
                        setSearchValue(e.target.value)
                        setPage(1)
                      }}
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
              onEdit={isAuctionStaff ? undefined : handleEdit}
              onDelete={isAuctionStaff ? undefined : handleDelete}
              onSelectionChange={isAuctionStaff ? undefined : setSelectedRows}
              resetSelectionKey={isAuctionStaff ? undefined : resetSelectionKey}
              serverSidePagination={{
                totalRowCount: totalCount,
                pageIndex: page - 1,
                onPageIndexChange: (idx) => setPage(idx + 1),
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
