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
import { SearchIcon, SlidersHorizontal, Plus, Trash2 } from "lucide-react"
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { FilterDialog } from "@/components/filter-dialog"
import { useFilterParams, FilterConfig } from "@/hooks/use-filter-params"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { PawnTerm } from "@/lib/api/types"
import { getItemConditionLabel } from "@/lib/constants/item-condition"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import {
  usePawnTerms,
  useDeletePawnTerm,
} from "@/lib/react-query/hooks/use-pawn-terms"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useItemTypes } from "@/lib/react-query/hooks/use-item-types"
import { toast } from "sonner"

// Map PawnTerm to table row
type SyaratMataRow = {
  id: string
  namaAturan: string
  tipeBarang: string
  hargaDari: number
  hargaSampai: number
  itemCondition: string
  lastUpdatedAt: string
}

function mapPawnTermToRow(term: PawnTerm): SyaratMataRow {
  const typeName = term.itemType?.typeName ?? "-"
  const ruleName = term.ruleName?.trim() || typeName
  return {
    id: term.uuid,
    namaAturan: ruleName,
    tipeBarang: typeName,
    hargaDari: Number(term.loanLimitMin),
    hargaSampai: Number(term.loanLimitMax),
    itemCondition: getItemConditionLabel(term.itemCondition),
    lastUpdatedAt: term.updatedAt
      ? format(new Date(term.updatedAt), "d MMMM yyyy HH:mm:ss", {
          locale: id,
        })
      : "-",
  }
}

// Column definitions for Syarat Mata
const syaratMataColumns: ColumnDef<SyaratMataRow>[] = [
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
    accessorKey: "namaAturan",
    header: "Nama Aturan",
  },
  {
    accessorKey: "tipeBarang",
    header: "Tipe Barang",
  },
  {
    accessorKey: "hargaDari",
    header: "Harga Dari",
    cell: ({ row }) => {
      const value = row.getValue("hargaDari") as number
      return <span>Rp {formatCurrencyDisplay(value)}</span>
    },
  },
  {
    accessorKey: "hargaSampai",
    header: "Harga Sampai",
    cell: ({ row }) => {
      const value = row.getValue("hargaSampai") as number
      return <span>Rp {formatCurrencyDisplay(value)}</span>
    },
  },
  {
    accessorKey: "itemCondition",
    header: "Kondisi Barang",
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
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MasterSyaratMataPageContent() {
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

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<SyaratMataRow | null>(null)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<SyaratMataRow[]>([])
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
        key: "lastUpdate",
        label: "",
        type: "daterange",
        labelFrom: "Last Update Mulai Dari",
        labelTo: "Sampai Dengan",
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

  const listOptions = React.useMemo(() => {
    const filter: Record<string, string> = {}
    if (companyFilterId) filter.ptId = companyFilterId
    const itemTypeIds = (filterValues.itemTypeId as string[] | undefined) ?? []
    if (itemTypeIds.length > 0) filter.itemTypeId = itemTypeIds[0] as string
    if (debouncedSearchValue.trim()) filter.search = debouncedSearchValue.trim()
    return { page, pageSize, filter }
  }, [
    page,
    pageSize,
    companyFilterId,
    filterValues.itemTypeId,
    debouncedSearchValue,
  ])

  const { data, isLoading, isError } = usePawnTerms(listOptions)
  const deletePawnTermMutation = useDeletePawnTerm()

  const rows = React.useMemo(
    () => (data?.data ?? []).map(mapPawnTermToRow),
    [data?.data]
  )

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearchValue, companyFilterId, filterValues.itemTypeId])

  // Last-update filter applied client-side on current page only
  const tableData = React.useMemo(() => {
    const lastUpdateRange = (filterValues.lastUpdate as {
      from: string | null
      to: string | null
    }) || { from: null, to: null }
    if (!lastUpdateRange.from && !lastUpdateRange.to) return rows
    return rows.filter((item) => {
      const itemDate = new Date(item.lastUpdatedAt)
      if (Number.isNaN(itemDate.getTime())) return true
      itemDate.setHours(0, 0, 0, 0)
      if (lastUpdateRange.from) {
        const fromDate = new Date(lastUpdateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        if (itemDate < fromDate) return false
      }
      if (lastUpdateRange.to) {
        const toDate = new Date(lastUpdateRange.to)
        toDate.setHours(23, 59, 59, 999)
        if (itemDate > toDate) return false
      }
      return true
    })
  }, [rows, filterValues.lastUpdate])

  const handleDetail = (row: SyaratMataRow) => {
    router.push(`/master-syarat-mata/${row.id}`)
  }

  const handleEdit = (row: SyaratMataRow) => {
    router.push(`/master-syarat-mata/${row.id}/edit`)
  }

  const handleDelete = (row: SyaratMataRow) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deletePawnTermMutation.mutateAsync(itemToDelete.id)
        toast.success("Syarat Mata berhasil dihapus")
        setIsConfirmDialogOpen(false)
        setItemToDelete(null)
      } catch {
        toast.error("Gagal menghapus Syarat Mata")
      }
    }
  }

  const handleTambahData = () => {
    router.push("/master-syarat-mata/tambah")
  }

  const handleBulkDelete = () => {
    setIsBulkDeleteDialogOpen(true)
  }

  const handleConfirmBulkDelete = async () => {
    try {
      await Promise.all(
        selectedRows.map((row) => deletePawnTermMutation.mutateAsync(row.id))
      )
      toast.success(`${selectedRows.length} Syarat Mata berhasil dihapus`)
      setIsBulkDeleteDialogOpen(false)
      setSelectedRows([])
      setResetSelectionKey((k) => k + 1)
    } catch {
      toast.error("Gagal menghapus Syarat Mata")
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">
              Master Syarat &quot;Mata&quot;
            </h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: 'Master Syarat "Mata"' },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
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

            <Button
              onClick={handleTambahData}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-destructive">Gagal memuat data Syarat Mata</p>
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={syaratMataColumns}
            data={tableData}
            searchPlaceholder="Cari..."
            headerLeft={
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Daftar Syarat Mata</CardTitle>
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
        title="Hapus Syarat Mata"
        description="Anda akan menghapus data Syarat Mata dari dalam sistem."
        confirmLabel="Hapus"
        variant="destructive"
      />

      <ConfirmationDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Syarat Mata"
        description={`Anda akan menghapus ${selectedRows.length} data Syarat Mata dari dalam sistem.`}
        confirmLabel="Hapus"
        variant="destructive"
      />
    </>
  )
}

export default function MasterSyaratMataPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <MasterSyaratMataPageContent />
    </Suspense>
  )
}
