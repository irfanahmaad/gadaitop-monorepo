"use client"

import React, { useState, Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@/components/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import { SearchIcon, SlidersHorizontal, ArrowLeft } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { useFilterParams } from "@/hooks/use-filter-params"
import type { FilterConfig } from "@/hooks/use-filter-params"
import type { Notification } from "@/lib/api/types"
import { useNotifications } from "@/lib/react-query/hooks/use-notifications"

// Format date helper
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// Filter configuration
const filterConfig: FilterConfig[] = [
  {
    key: "read",
    label: "Status",
    type: "radio",
    radioOptions: [
      { label: "Semua", value: "" },
      { label: "Belum Dibaca", value: "unread" },
      { label: "Sudah Dibaca", value: "read" },
    ],
  },
]

// Column definitions
const columns: ColumnDef<Notification>[] = [
  {
    id: "no",
    header: "No",
    size: 60,
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      const currentPage = table.getState().pagination.pageIndex
      const pageSize = table.getState().pagination.pageSize
      return currentPage * pageSize + index + 1
    },
  },
  {
    accessorKey: "title",
    header: "Nama Notifikasi",
    size: 200,
    cell: ({ row }) => {
      const value = row.getValue("title") as string
      const isRead = row.original.readAt != null
      return (
        <div
          className={`max-w-[200px] truncate ${!isRead ? "font-semibold" : ""}`}
          title={value}
        >
          {value}
        </div>
      )
    },
  },
  {
    id: "body",
    accessorFn: (row) => row.body ?? row.description ?? "",
    header: "Keterangan",
    size: 300,
    cell: ({ row }) => {
      const value = (row.original.body ?? row.original.description ?? "") as string
      return (
        <div
          className="max-w-[300px] truncate text-muted-foreground"
          title={value}
        >
          {value}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal & Waktu",
    size: 180,
    cell: ({ row }) => formatDateTime(row.original.createdAt),
  },
]

// Loading skeleton component
function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-10 w-20" />
          </div>
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function NotifikasiPageContent() {
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("")
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchValue(searchValue), 500)
    return () => clearTimeout(t)
  }, [searchValue])

  const { filterValues, setFilters } = useFilterParams(filterConfig)

  const readFilter = (filterValues.read as string) ?? ""

  const listOptions = React.useMemo(() => {
    const filter: Record<string, string | number> = {}
    if (debouncedSearchValue.trim()) filter.search = debouncedSearchValue.trim()
    if (readFilter === "read" || readFilter === "unread") filter.read = readFilter
    return { page, pageSize, filter }
  }, [page, pageSize, debouncedSearchValue, readFilter])

  const { data, isLoading, isError } = useNotifications(listOptions)
  const notifications = data?.data ?? []

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearchValue, readFilter])

  const handleBack = () => {
    router.back()
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Notifikasi</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Notifikasi", className: "text-destructive" },
              ]}
            />
          </div>

          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 size-4" />
            Kembali
          </Button>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-destructive">Gagal memuat data Notifikasi</p>
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={notifications}
            searchPlaceholder="Cari notifikasi..."
            filterConfig={filterConfig}
            filterValues={filterValues}
            onFilterChange={setFilters}
            filterDialogOpen={filterDialogOpen}
            onFilterDialogOpenChange={setFilterDialogOpen}
            headerLeft={
              <CardTitle className="text-xl">Daftar Notifikasi</CardTitle>
            }
            headerRight={
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value))
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
                    placeholder="Cari notifikasi..."
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
              </div>
            }
            initialPageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            serverSidePagination={{
              totalRowCount: data?.meta?.count ?? 0,
              pageIndex: page - 1,
              onPageIndexChange: (idx) => setPage(idx + 1),
            }}
          />
        )}
      </div>
    </>
  )
}

export default function NotifikasiPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <NotifikasiPageContent />
    </Suspense>
  )
}
