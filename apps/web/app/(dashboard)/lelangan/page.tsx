"use client"

import React, { useState, Suspense, useEffect } from "react"
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { SearchIcon, SlidersHorizontal, Eye } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import type { AuctionBatch } from "@/lib/api/types"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { useAuctionBatches } from "@/lib/react-query/hooks/use-auction-batches"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { useRouter } from "next/navigation"

// Types for SPK Jatuh Tempo (items - from batch detail, list doesn't include items)
type ItemLelang = {
  id: string
  foto: string
  noSPK: string
  namaBarang: string
  tipeBarang: string
  toko: string
  petugas: string
  lastUpdatedAt: "Belum Terscan" | "Terscan"
}

// Types for Batch Lelang SPK
type BatchLelang = {
  id: string
  idBatch: string
  namaBatch: string
  jumlahItem: number
  lastUpdatedAt: string
  status: BatchStatus
}

type BatchStatus =
  | "Menunggu"
  | "Diambil"
  | "Tervalidasi"
  | "Berjalan"
  | "Dibatalkan"

function mapBatchStatus(status: string): BatchStatus {
  const map: Record<string, BatchStatus> = {
    draft: "Menunggu",
    pickup_in_progress: "Diambil",
    validation_pending: "Tervalidasi",
    ready_for_auction: "Berjalan",
    cancelled: "Dibatalkan",
  }
  return map[status] ?? "Menunggu"
}

function mapAuctionBatchToBatchLelang(batch: AuctionBatch): BatchLelang {
  const itemCount = batch.items?.length ?? 0
  return {
    id: batch.uuid,
    idBatch: batch.batchCode,
    namaBatch: batch.batchCode,
    jumlahItem: itemCount,
    lastUpdatedAt: batch.updatedAt
      ? format(new Date(batch.updatedAt), "d MMMM yyyy HH:mm:ss", {
          locale: id,
        })
      : batch.createdAt
        ? format(new Date(batch.createdAt), "d MMMM yyyy HH:mm:ss", {
            locale: id,
          })
        : "-",
    status: mapBatchStatus(batch.status),
  }
}

// Status badge component for Batch Lelang
const BatchStatusBadge = ({ status }: { status: BatchStatus }) => {
  const statusConfig: Record<
    BatchStatus,
    { label: string; className: string }
  > = {
    Menunggu: {
      label: "Menunggu",
      className:
        "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    },
    Diambil: {
      label: "Diambil",
      className:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    Tervalidasi: {
      label: "Tervalidasi",
      className:
        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    Berjalan: {
      label: "Berjalan",
      className:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    Dibatalkan: {
      label: "Dibatalkan",
      className:
        "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
  }

  const config = statusConfig[status] ?? statusConfig.Menunggu

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

// Column definitions for SPK Jatuh Tempo
const itemLelangColumns: ColumnDef<ItemLelang>[] = [
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
    accessorKey: "foto",
    header: "Foto",
    cell: ({ row }) => (
      <Avatar className="h-10 w-10">
        <AvatarImage src={row.getValue("foto")} alt="Item photo" />
        <AvatarFallback>IMG</AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "noSPK",
    header: "No.SPK",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="cursor-pointer text-blue-600 hover:underline">
          {row.getValue("noSPK")}
        </span>
        <Eye className="size-3 text-gray-400" />
      </div>
    ),
  },
  {
    accessorKey: "namaBarang",
    header: "Nama Barang",
  },
  {
    accessorKey: "tipeBarang",
    header: "Tipe Barang",
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
    cell: ({ row }) => {
      const status = row.getValue("lastUpdatedAt") as string
      const isBelumTerscan = status === "Belum Terscan"
      return (
        <Badge
          variant="outline"
          className={
            isBelumTerscan
              ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
              : "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
          }
        >
          {status}
        </Badge>
      )
    },
  },
]

// Column definitions for Batch Lelang SPK
const batchLelangColumns: ColumnDef<BatchLelang>[] = [
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
    accessorKey: "idBatch",
    header: "ID Batch",
  },
  {
    accessorKey: "namaBatch",
    header: "Nama Batch",
  },
  {
    accessorKey: "jumlahItem",
    header: "Jumlah Item",
  },
  {
    accessorKey: "lastUpdatedAt",
    header: "Last Updated At",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <BatchStatusBadge status={row.getValue("status")} />,
  },
]

// Placeholder for SPK Jatuh Tempo (list API doesn't include items)
const placeholderItemLelang: ItemLelang[] = []

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LelangPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const isCompanyAdmin =
    user?.roles?.some((r) => r.code === "company_admin") ?? false
  const isSuperAdmin = user?.roles?.some((r) => r.code === "owner") ?? false

  const effectiveCompanyId = isCompanyAdmin ? (user?.companyId ?? null) : null

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
    companyFilterId ? { pageSize: 200 } : undefined
  )

  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const branchOptions = React.useMemo(() => {
    const list = branchesData?.data ?? []
    const filtered = companyFilterId
      ? list.filter((b) => b.companyId === companyFilterId)
      : list
    return [
      { value: "all", label: "Semua Toko" },
      ...filtered.map((b) => ({ value: b.uuid, label: b.shortName })),
    ]
  }, [branchesData, companyFilterId])

  useEffect(() => {
    if (branchOptions.length > 1 && selectedBranch === "all") {
      setSelectedBranch(branchOptions[1]?.value ?? "all")
    }
  }, [branchOptions, selectedBranch])

  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("spk-jatuh-tempo")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<
    ItemLelang | BatchLelang | null
  >(null)

  const listOptions = React.useMemo(() => {
    const filter: Record<string, string> = {}
    if (companyFilterId) filter.ptId = companyFilterId
    if (selectedBranch && selectedBranch !== "all")
      filter.storeId = selectedBranch
    return { page: 1, pageSize: 200, filter }
  }, [companyFilterId, selectedBranch])

  const { data, isLoading, isError } = useAuctionBatches(listOptions)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const batchesFromApi = data?.data ?? []
  const batchRows = React.useMemo(
    () => batchesFromApi.map(mapAuctionBatchToBatchLelang),
    [batchesFromApi]
  )

  const filteredBatchLelang = React.useMemo(() => {
    let result = [...batchRows]
    if (searchValue) {
      const s = searchValue.toLowerCase()
      result = result.filter(
        (b) =>
          b.idBatch.toLowerCase().includes(s) ||
          b.namaBatch.toLowerCase().includes(s)
      )
    }
    return result
  }, [batchRows, searchValue])

  const handleDetail = (row: ItemLelang | BatchLelang) => {
    if ("idBatch" in row) {
      router.push(`/lelangan/${row.id}`)
    }
  }

  const handleEdit = (_row: ItemLelang | BatchLelang) => {
    // Implement edit if needed
  }

  const handleDelete = (row: ItemLelang | BatchLelang) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      // TODO: wire to useCancelAuctionBatch or delete API when available
      setIsConfirmDialogOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Lelangan</h1>
          <Breadcrumbs
            items={[{ label: "Pages", href: "/" }, { label: "Lelangan" }]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isSuperAdmin && ptOptions.length > 0 && (
            <Select value={selectedPT} onValueChange={setSelectedPT}>
              <SelectTrigger className="w-[180px]">
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
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Toko :</span>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Toko" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-4"
      >
        <TabsList className="w-fit">
          <TabsTrigger value="spk-jatuh-tempo">SPK Jatuh Tempo</TabsTrigger>
          <TabsTrigger value="batch-lelang-spk">Batch Lelang SPK</TabsTrigger>
        </TabsList>

        {/* SPK Jatuh Tempo Tab - Items from batches (list API doesn't include items) */}
        <TabsContent value="spk-jatuh-tempo" className="mt-0">
          <DataTable
            columns={itemLelangColumns}
            data={placeholderItemLelang}
            title="Item Lelang"
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
                  <SlidersHorizontal className="size-4" />
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
          {placeholderItemLelang.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              Buka tab Batch Lelang SPK dan pilih batch untuk melihat item.
            </p>
          )}
        </TabsContent>

        {/* Batch Lelang SPK Tab */}
        <TabsContent value="batch-lelang-spk" className="mt-0">
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">
                  Gagal memuat data Batch Lelang
                </p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={batchLelangColumns}
              data={filteredBatchLelang}
              title="Daftar Batch Lelang"
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
                    <SlidersHorizontal className="size-4" />
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

      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Batch Lelang"
        description="Anda akan menghapus data Lelang dari dalam sistem."
        confirmLabel="Hapus"
        variant="destructive"
      />
    </div>
  )
}

export default function LelangPage() {
  return (
    <Suspense
      fallback={<div className="bg-muted h-64 animate-pulse rounded-lg" />}
    >
      <LelangPageContent />
    </Suspense>
  )
}
