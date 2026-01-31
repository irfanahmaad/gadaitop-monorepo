"use client"

import React, { useState } from "react"
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
} from "lucide-react"
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { FilterDialog } from "@/components/filter-dialog"
import { useFilterParams } from "@/hooks/use-filter-params"
import type { FilterConfig } from "@/hooks/use-filter-params"

// Type for Katalog
type Katalog = {
  id: string
  foto: string
  idKatalog: string
  namaKatalog: string
  tipeBarang: string
  harga: number
  lastUpdatedAt: string
}

// Sample data for Katalog
const sampleKatalog: Katalog[] = [
  {
    id: "1",
    foto: "/placeholder-avatar.jpg",
    idKatalog: "KT01",
    namaKatalog: "iPhone 15 Pro",
    tipeBarang: "Handphone",
    harga: 17500000,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "2",
    foto: "/placeholder-avatar.jpg",
    idKatalog: "KT02",
    namaKatalog: "Yamaha XSR 155",
    tipeBarang: "Sepeda Motor",
    harga: 30000000,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "3",
    foto: "/placeholder-avatar.jpg",
    idKatalog: "KT03",
    namaKatalog: "Logitech Controller",
    tipeBarang: "Aksesoris Komputer",
    harga: 500000,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "4",
    foto: "/placeholder-avatar.jpg",
    idKatalog: "KT04",
    namaKatalog: "MacBook Pro M1",
    tipeBarang: "Laptop",
    harga: 14000000,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "5",
    foto: "/placeholder-avatar.jpg",
    idKatalog: "KT05",
    namaKatalog: "DJI Drone",
    tipeBarang: "Drone",
    harga: 8500000,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "6",
    foto: "/placeholder-avatar.jpg",
    idKatalog: "KT06",
    namaKatalog: "iPhone 6",
    tipeBarang: "Handphone",
    harga: 2000000,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "7",
    foto: "/placeholder-avatar.jpg",
    idKatalog: "KT07",
    namaKatalog: "Google Smarthome",
    tipeBarang: "Handphone",
    harga: 1500000,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "8",
    foto: "/placeholder-avatar.jpg",
    idKatalog: "KT08",
    namaKatalog: "iPhone XR",
    tipeBarang: "Sepeda Motor",
    harga: 4000000,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "9",
    foto: "/placeholder-avatar.jpg",
    idKatalog: "KT09",
    namaKatalog: "GoPro Hero 6",
    tipeBarang: "Handphone",
    harga: 3500000,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "10",
    foto: "/placeholder-avatar.jpg",
    idKatalog: "KT10",
    namaKatalog: "Kulkas Antik",
    tipeBarang: "Elektronik",
    harga: 10000000,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
]

// Column definitions
const columns: ColumnDef<Katalog>[] = [
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
        <AvatarImage src={row.getValue("foto")} alt="Katalog photo" />
        <AvatarFallback>IMG</AvatarFallback>
      </Avatar>
    ),
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

// Tipe Barang options
const tipeBarangOptions = [
  { label: "Handphone", value: "Handphone" },
  { label: "Sepeda Motor", value: "Sepeda Motor" },
  { label: "Aksesoris Komputer", value: "Aksesoris Komputer" },
  { label: "Laptop", value: "Laptop" },
  { label: "Drone", value: "Drone" },
  { label: "Elektronik", value: "Elektronik" },
]

// Filter configuration
const filterConfig: FilterConfig[] = [
  {
    key: "lastUpdate",
    label: "",
    type: "daterange",
    labelFrom: "Mulai Dari",
    labelTo: "Sampai Dengan",
  },
  {
    key: "harga",
    label: "Harga",
    type: "currencyrange",
    currency: "Rp",
  },
  {
    key: "tipeBarang",
    label: "Tipe Barang",
    type: "multiselect",
    placeholder: "Pilih Tipe Barang...",
    options: tipeBarangOptions,
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

export default function MasterKatalogPage() {
  const router = useRouter()
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(2025, 10, 20) // November 20, 2025
  )
  const [isLoading] = useState(false) // Set to true when fetching data
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  // Filter state management via URL params
  const { filterValues, setFilters } = useFilterParams(filterConfig)

  // Filter data based on filter values
  const filteredKatalog = React.useMemo(() => {
    let result = [...sampleKatalog]

    // Get filter values
    const lastUpdateRange = (filterValues.lastUpdate as {
      from: string | null
      to: string | null
    }) || { from: null, to: null }

    const hargaRange = (filterValues.harga as {
      from: number | null
      to: number | null
    }) || { from: null, to: null }

    const selectedTipeBarang =
      (filterValues.tipeBarang as string[] | undefined) || []

    // Filter by search (namaKatalog or idKatalog)
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      result = result.filter(
        (item) =>
          item.namaKatalog.toLowerCase().includes(searchLower) ||
          item.idKatalog.toLowerCase().includes(searchLower)
      )
    }

    // Filter by last update date range
    if (lastUpdateRange.from || lastUpdateRange.to) {
      result = result.filter((item) => {
        // Parse the lastUpdatedAt string (format: "20 November 2025 18:33:45")
        const dateStr = item.lastUpdatedAt.split(" ").slice(0, 3).join(" ")
        const itemDate = new Date(dateStr)

        if (lastUpdateRange.from && itemDate < new Date(lastUpdateRange.from)) {
          return false
        }
        if (lastUpdateRange.to && itemDate > new Date(lastUpdateRange.to)) {
          return false
        }
        return true
      })
    }

    // Filter by price range
    if (hargaRange.from !== null || hargaRange.to !== null) {
      result = result.filter((item) => {
        if (hargaRange.from !== null && item.harga < hargaRange.from) {
          return false
        }
        if (hargaRange.to !== null && item.harga > hargaRange.to) {
          return false
        }
        return true
      })
    }

    // Filter by tipe barang
    if (selectedTipeBarang.length > 0) {
      result = result.filter((item) =>
        selectedTipeBarang.includes(item.tipeBarang)
      )
    }

    return result
  }, [searchValue, filterValues])

  const handleDetail = (row: Katalog) => {
    router.push(`/master-katalog/${row.id}`)
  }

  const handleEdit = (row: Katalog) => {
    router.push(`/master-katalog/${row.id}/edit`)
  }

  const handleDelete = (row: Katalog) => {
    console.log("Delete:", row)
    // Implement delete action
  }

  const handleTambahData = () => {
    router.push("/master-katalog/tambah")
  }

  const handleImportData = () => {
    console.log("Import data")
    // Implement import action
  }

  const formatDateDisplay = (date: Date | undefined): string => {
    if (!date) return ""
    return format(date, "d MMMM yyyy", { locale: id })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-row justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Master Katalog</h1>
          <Breadcrumbs
            items={[{ label: "Pages", href: "/" }, { label: "Master Katalog" }]}
          />
        </div>

        {/* Action Buttons and Date Filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          {/* Date Filter */}
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

          {/* Action Buttons */}
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
      ) : (
        <DataTable
          columns={columns}
          data={filteredKatalog}
          headerLeft={
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">Daftar Katalog</span>
              <span className="text-muted-foreground flex items-center gap-1 text-sm font-normal">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Last Updated At: 24 November 2025 22:46:22
              </span>
            </div>
          }
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
          onPageSizeChange={setPageSize}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Filter Dialog */}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filterConfig={filterConfig}
        filterValues={filterValues}
        onFilterChange={setFilters}
      />
    </div>
  )
}
