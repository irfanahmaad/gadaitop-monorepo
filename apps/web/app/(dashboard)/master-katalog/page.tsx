"use client"

import React, { useState, Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  SearchIcon,
  SlidersHorizontal,
  Plus,
  Upload,
  CalendarIcon,
  Trash2,
} from "lucide-react"
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { FilterDialog } from "@/components/filter-dialog"
import { useFilterParams } from "@/hooks/use-filter-params"
import type { FilterConfig } from "@/hooks/use-filter-params"
import type { CatalogItem } from "@/lib/api/types"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import {
  useCatalogs,
  useDeleteCatalog,
} from "@/lib/react-query/hooks/use-catalogs"
import { usePublicUrl } from "@/lib/react-query/hooks/use-upload"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useItemTypes } from "@/lib/react-query/hooks/use-item-types"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { toast } from "sonner"

// Map CatalogItem to table row
type KatalogRow = {
  id: string
  imageKey: string
  idKatalog: string
  namaKatalog: string
  tipeBarang: string
  harga: number
  lastUpdatedAt: string
}

function mapCatalogToRow(catalog: CatalogItem): KatalogRow {
  const name = catalog.name ?? catalog.itemName ?? "-"
  const typeName = catalog.itemType?.typeName ?? "-"
  return {
    id: catalog.uuid,
    imageKey: catalog.imageUrl ?? "",
    idKatalog: catalog?.code ?? catalog?.uuid?.slice(0, 8),
    namaKatalog: name,
    tipeBarang: typeName,
    harga: catalog.basePrice,
    lastUpdatedAt: catalog.updatedAt
      ? format(new Date(catalog.updatedAt), "d MMMM yyyy HH:mm:ss", {
          locale: id,
        })
      : "-",
  }
}

function CatalogImageCell({ imageKey }: { imageKey: string }) {
  const { data: publicUrlData } = usePublicUrl(imageKey)
  const url = imageKey ? publicUrlData?.url : undefined
  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src={url} alt="Katalog photo" />
      <AvatarFallback>IMG</AvatarFallback>
    </Avatar>
  )
}

// Column definitions
const columns: ColumnDef<KatalogRow>[] = [
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
    accessorKey: "imageKey",
    header: "Foto",
    cell: ({ row }) => <CatalogImageCell imageKey={row.getValue("imageKey")} />,
  },
  {
    accessorKey: "idKatalog",
    header: "ID Katalog",
  },
  {
    accessorKey: "namaKatalog",
    header: "Nama Katalog",
  },
  {
    accessorKey: "tipeBarang",
    header: "Tipe Barang",
  },
  {
    accessorKey: "harga",
    header: "Harga",
    cell: ({ row }) => {
      const harga = row.getValue("harga") as number
      return `Rp ${formatCurrencyDisplay(harga)},-`
    },
  },
  {
    accessorKey: "lastUpdatedAt",
    header: "Last Updated At",
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
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MasterKatalogPageContent() {
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

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchValue(searchValue), 500)
    return () => clearTimeout(t)
  }, [searchValue])

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<KatalogRow | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<KatalogRow[]>([])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [resetSelectionKey, setResetSelectionKey] = useState(0)

  const { data: itemTypesData } = useItemTypes({ pageSize: 100 })
  const itemTypeOptions = React.useMemo(() => {
    const list = itemTypesData?.data ?? []
    return list.map((t) => ({
      label: t.typeName,
      value: t.uuid,
    }))
  }, [itemTypesData])

  const filterConfigWithOptions: FilterConfig[] = React.useMemo(
    () => [
      {
        key: "harga",
        label: "",
        type: "currencyrange",
        currency: "Rp",
      },
      {
        key: "itemTypeId",
        label: "Tipe Barang",
        type: "multiselect",
        placeholder: "Pilih Tipe Barang...",
        options: itemTypeOptions,
      },
    ],
    [itemTypeOptions]
  )

  const { filterValues, setFilters } = useFilterParams(filterConfigWithOptions)

  const priceDateStr = React.useMemo(
    () => (selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined),
    [selectedDate]
  )

  const listOptions = React.useMemo(() => {
    const filter: Record<string, string | number> = {}
    if (companyFilterId) filter.ptId = companyFilterId
    if (debouncedSearchValue.trim()) filter.search = debouncedSearchValue.trim()
    const itemTypeIds = (filterValues.itemTypeId as string[] | undefined) ?? []
    if (itemTypeIds.length > 0) filter.itemTypeId = itemTypeIds[0] as string
    const hargaRange = (filterValues.harga as { from: number | null; to: number | null }) ?? { from: null, to: null }
    if (hargaRange.from != null) filter.basePriceMin = hargaRange.from
    if (hargaRange.to != null) filter.basePriceMax = hargaRange.to
    if (priceDateStr) filter.priceDate = priceDateStr
    return { page, pageSize, filter }
  }, [
    page,
    pageSize,
    companyFilterId,
    debouncedSearchValue,
    filterValues.itemTypeId,
    filterValues.harga,
    priceDateStr,
  ])

  const { data, isLoading, isError } = useCatalogs(listOptions)
  const deleteCatalogMutation = useDeleteCatalog()

  const rows = React.useMemo(
    () => (data?.data ?? []).map(mapCatalogToRow),
    [data?.data]
  )

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchValue, companyFilterId, filterValues.itemTypeId, filterValues.harga, priceDateStr])

  const handleDetail = (row: KatalogRow) => {
    router.push(`/master-katalog/${row.id}`)
  }

  const handleEdit = (row: KatalogRow) => {
    router.push(`/master-katalog/${row.id}/edit`)
  }

  const handleDelete = (row: KatalogRow) => {
    setSelectedRow(row)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedRow) {
      try {
        await deleteCatalogMutation.mutateAsync(selectedRow.id)
        toast.success("Katalog berhasil dihapus")
        setIsConfirmDialogOpen(false)
        setSelectedRow(null)
      } catch {
        toast.error("Gagal menghapus katalog")
      }
    }
  }

  const handleTambahData = () => {
    router.push("/master-katalog/tambah")
  }

  const handleBulkDelete = () => {
    setIsBulkDeleteDialogOpen(true)
  }

  const handleConfirmBulkDelete = async () => {
    try {
      await Promise.all(
        selectedRows.map((row) => deleteCatalogMutation.mutateAsync(row.id))
      )
      toast.success(`${selectedRows.length} Katalog berhasil dihapus`)
      setIsBulkDeleteDialogOpen(false)
      setSelectedRows([])
      setResetSelectionKey((k) => k + 1)
    } catch {
      toast.error("Gagal menghapus Katalog")
    }
  }

  const handleImportData = () => {
    toast.info("Fitur import katalog akan segera tersedia")
  }

  const formatDateDisplay = (date: Date | undefined): string => {
    if (!date) return ""
    return format(date, "d MMMM yyyy", { locale: id })
  }

  const lastUpdatedDisplay = React.useMemo(() => {
    if (rows.length === 0) return "-"
    const dates = rows
      .map((r) => new Date(r.lastUpdatedAt).getTime())
      .filter((t) => !Number.isNaN(t))
    if (dates.length === 0) return "-"
    const latest = new Date(Math.max(...dates))
    return format(latest, "d MMMM yyyy HH:mm:ss", { locale: id })
  }, [rows])

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-row flex-wrap justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Master Katalog</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Master Katalog" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            {isSuperAdmin && ptOptions.length > 0 && (
              <Select value={selectedPT} onValueChange={setSelectedPT}>
                <SelectTrigger className="w-[200px]">
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
              <label className="text-sm font-medium whitespace-nowrap">
                Tanggal Katalog :
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal sm:w-[250px]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      formatDateDisplay(selectedDate)
                    ) : (
                      <span>Tanggal Katalog</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleImportData}
                className="border border-green-600 bg-white text-green-600 hover:bg-green-700 hover:text-white"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
              <Button
                onClick={handleTambahData}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Data
              </Button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-destructive">Gagal memuat data Katalog</p>
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            searchPlaceholder="Cari..."
            headerLeft={
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Daftar Katalog</CardTitle>
                  {selectedRows.length > 0 && (
                    <span className="text-destructive font-semibold">
                      &middot; {selectedRows.length} Selected
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground flex items-center gap-1 text-sm font-normal">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Last Updated At: {lastUpdatedDisplay}
                </span>
              </div>
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
                  <SlidersHorizontal className="size-4" />
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
            initialPageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelectionChange={setSelectedRows}
            resetSelectionKey={resetSelectionKey}
            serverSidePagination={{
              totalRowCount: data?.meta?.count ?? 0,
              pageIndex: page - 1,
              onPageIndexChange: (idx) => setPage(idx + 1),
            }}
          />
        )}
      </div>

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filterConfig={filterConfigWithOptions}
        filterValues={filterValues}
        onFilterChange={setFilters}
      />

      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Katalog"
        description="Apakah Anda yakin ingin menghapus katalog ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
      />

      <ConfirmationDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Katalog"
        description={`Anda akan menghapus ${selectedRows.length} data Katalog dari dalam sistem.`}
        confirmLabel="Hapus"
        variant="destructive"
      />
    </>
  )
}

export default function MasterKatalogPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <MasterKatalogPageContent />
    </Suspense>
  )
}
