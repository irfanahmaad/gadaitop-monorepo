"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import { Badge } from "@workspace/ui/components/badge"
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
import { SearchIcon } from "lucide-react"
import {
  useStockOpnameSessions,
} from "@/lib/react-query/hooks/use-stock-opname"
import {
  type StockOpnameRow,
  mapSessionToRow,
} from "../_lib/row-utils"

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

function getStockAuditorColumns(
  showStatus: boolean
): ColumnDef<StockOpnameRow>[] {
  const base: ColumnDef<StockOpnameRow>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>,
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: "idSO", header: "ID SO" },
    { accessorKey: "tanggal", header: "Tanggal" },
    {
      accessorKey: "tokoNumber",
      header: "Toko",
      cell: ({ row }) => row.original.tokoNumber ?? "—",
    },
    {
      accessorKey: "petugasNumber",
      header: "Petugas",
      cell: ({ row }) => row.original.petugasNumber ?? "—",
    },
    {
      accessorKey: "syaratMataNumber",
      header: 'Syarat "Mata"',
      cell: ({ row }) => row.original.syaratMataNumber ?? "—",
    },
    {
      accessorKey: "itemCount",
      header: "Jumlah Item",
      cell: ({ row }) => row.original.itemCount ?? "—",
    },
    { accessorKey: "lastUpdatedAt", header: "Last Updated At" },
  ]
  if (showStatus) {
    base.push({
      accessorKey: "status",
      header: "Status",
      cell: () => (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
        >
          Tervalidasi
        </Badge>
      ),
    })
  }
  return base
}

export default function StockOpnameAuditorPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const isStockAuditor = useMemo(
    () => user?.roles?.some((role) => role.code === "stock_auditor") ?? false,
    [user]
  )

  const [pageSize, setPageSize] = useState(10)
  const [page] = useState(1)
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("dijadwalkan")

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

  const shouldFetchList = !!user && isStockAuditor

  const {
    data: listResponse,
    isLoading,
    isError,
  } = useStockOpnameSessions(listOptions, { enabled: shouldFetchList })

  const isContentLoading = isAuthLoading || (shouldFetchList && isLoading)
  const isContentError = shouldFetchList && isError

  const { data: countDraft } = useStockOpnameSessions(
    { filter: { status: "draft" }, page: 1, pageSize: 1 },
    { enabled: isStockAuditor }
  )
  const { data: countCompleted } = useStockOpnameSessions(
    { filter: { status: "completed" }, page: 1, pageSize: 1 },
    { enabled: isStockAuditor }
  )
  const { data: countApproved } = useStockOpnameSessions(
    { filter: { status: "approved" }, page: 1, pageSize: 1 },
    { enabled: isStockAuditor }
  )

  const dijadwalkanCount = countDraft?.meta?.count ?? 0
  const waitingForApprovalCount = countCompleted?.meta?.count ?? 0
  const tervalidasiCount = countApproved?.meta?.count ?? 0

  const rows = useMemo(() => {
    const sessions = listResponse?.data ?? []
    return sessions.map((s) => mapSessionToRow(s))
  }, [listResponse?.data])

  useEffect(() => {
    if (user != null && !isStockAuditor) {
      router.replace("/stock-opname")
    }
  }, [user, isStockAuditor, router])

  const handleDetail = (row: StockOpnameRow) => {
    router.push(`/stock-opname/auditor/${row.id}`)
  }

  if (user != null && !isStockAuditor) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Stock Opname</h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: "Stock Opname", href: "/stock-opname/auditor" },
            ]}
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
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
          <TabsTrigger value="tervalidasi" className="flex items-center gap-2">
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
        </TabsList>

        <TabsContent value="dijadwalkan" className="mt-0">
          {isContentLoading ? (
            <TableSkeleton />
          ) : isContentError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">Gagal memuat data</p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={getStockAuditorColumns(false)}
              data={rows}
              searchPlaceholder="Cari..."
              headerLeft={
                <CardTitle className="text-xl">Daftar SO Dijadwalkan</CardTitle>
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
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
            />
          )}
        </TabsContent>

        <TabsContent value="waiting-for-approval" className="mt-0">
          {isContentLoading ? (
            <TableSkeleton />
          ) : isContentError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">Gagal memuat data</p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={getStockAuditorColumns(false)}
              data={rows}
              searchPlaceholder="Cari..."
              headerLeft={
                <CardTitle className="text-xl">
                  Daftar SO Waiting for Approval
                </CardTitle>
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
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
            />
          )}
        </TabsContent>

        <TabsContent value="tervalidasi" className="mt-0">
          {isContentLoading ? (
            <TableSkeleton />
          ) : isContentError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">Gagal memuat data</p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={getStockAuditorColumns(true)}
              data={rows}
              searchPlaceholder="Cari..."
              headerLeft={
                <CardTitle className="text-xl">
                  Daftar SO Tervalidasi
                </CardTitle>
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
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
