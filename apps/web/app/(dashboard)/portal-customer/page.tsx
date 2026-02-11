"use client"

import React, { useMemo, useState, useCallback, Suspense } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Wallet, HandCoins } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useFilterParams, FilterConfig } from "@/hooks/use-filter-params"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { BayarDialog } from "./_components/BayarDialog"

// Sample data type
type SPKPortal = {
  id: string
  nomorSPK: string
  namaItem: string
  namaPT: string
  namaToko: string
  nominal: number
  tanggalWaktuSPK: string
}

// Sample data
const sampleData: SPKPortal[] = [
  {
    id: "1",
    nomorSPK: "SPK/001/20112025",
    namaItem: "iPhone 15 Pro",
    namaPT: "PT Gadai Top Indonesia",
    namaToko: "GT Jakarta Satu",
    nominal: 10_000_000,
    tanggalWaktuSPK: "20 November 2025 18:33:45",
  },
  {
    id: "2",
    nomorSPK: "SPK/002/20112025",
    namaItem: "Yamaha Aerox 155cc",
    namaPT: "PT Gadai Top Indonesia",
    namaToko: "GT Jakarta Satu",
    nominal: 12_000_000,
    tanggalWaktuSPK: "20 November 2025 18:33:45",
  },
  {
    id: "3",
    nomorSPK: "SPK/001/20112025",
    namaItem: "iPhone 15 Pro",
    namaPT: "PT Gadai Top Indonesia",
    namaToko: "GT Jakarta Satu",
    nominal: 10_000_000,
    tanggalWaktuSPK: "20 November 2025 18:33:45",
  },
  {
    id: "4",
    nomorSPK: "SPK/002/20112025",
    namaItem: "Yamaha Aerox 155cc",
    namaPT: "PT Gadai Top Indonesia",
    namaToko: "GT Jakarta Satu",
    nominal: 12_000_000,
    tanggalWaktuSPK: "20 November 2025 18:33:45",
  },
]

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Filter configuration
const filterConfig: FilterConfig[] = [
  {
    key: "nominalRange",
    label: "Nominal",
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

// Column definitions
const columns: ColumnDef<SPKPortal>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return index + 1
    },
  },
  {
    accessorKey: "nomorSPK",
    header: "Nomor SPK",
  },
  {
    accessorKey: "namaItem",
    header: "Nama Item",
  },
  {
    accessorKey: "namaPT",
    header: "Nama PT",
  },
  {
    accessorKey: "namaToko",
    header: "Nama Toko",
  },
  {
    accessorKey: "nominal",
    header: "Nominal",
    cell: ({ row }) => {
      return `Rp ${formatCurrency(row.getValue("nominal"))}`
    },
  },
  {
    accessorKey: "tanggalWaktuSPK",
    header: "Tanggal & Waktu SPK",
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
              <Skeleton className="h-10 w-8" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PortalCustomerPageContent() {
  const router = useRouter()
  const [pageSize, setPageSize] = React.useState("100")
  const { filterValues, setFilters } = useFilterParams(filterConfig)

  // Bayar dialog state
  const [bayarDialogOpen, setBayarDialogOpen] = useState(false)
  const [bayarType, setBayarType] = useState<"cicil" | "lunas">("cicil")
  const [selectedRow, setSelectedRow] = useState<SPKPortal | null>(null)

  // Apply filters to data
  const filteredData = useMemo(() => {
    let filtered = [...sampleData]

    // Apply nominal range filter
    const nominalRange = filterValues.nominalRange as
      | { from?: number | string | null; to?: number | string | null }
      | undefined
    if (nominalRange) {
      if (nominalRange.from !== null && nominalRange.from !== undefined) {
        const fromValue =
          typeof nominalRange.from === "string"
            ? Number(nominalRange.from)
            : nominalRange.from
        if (!isNaN(fromValue)) {
          filtered = filtered.filter((item) => item.nominal >= fromValue)
        }
      }
      if (nominalRange.to !== null && nominalRange.to !== undefined) {
        const toValue =
          typeof nominalRange.to === "string"
            ? Number(nominalRange.to)
            : nominalRange.to
        if (!isNaN(toValue)) {
          filtered = filtered.filter((item) => item.nominal <= toValue)
        }
      }
    }

    return filtered
  }, [filterValues])

  const handleDetail = (row: SPKPortal) => {
    router.push(`/portal-customer/${row.id}`)
  }

  const handleBayarCicil = useCallback((row: SPKPortal) => {
    setSelectedRow(row)
    setBayarType("cicil")
    setBayarDialogOpen(true)
  }, [])

  const handleBayarLunas = useCallback((row: SPKPortal) => {
    setSelectedRow(row)
    setBayarType("lunas")
    setBayarDialogOpen(true)
  }, [])

  const handleBayarConfirm = useCallback(
    (data: {
      type: "cicil" | "lunas"
      metodePembayaran: string
      totalBayarPokok: number
      totalBunga: number
      totalDenda: number
      grandTotal: number
    }) => {
      // TODO: handle payment confirmation (API call, etc.)
      console.log("Payment confirmed:", { ...data, spk: selectedRow })
    },
    [selectedRow]
  )

  const handlePageSizeChange = (value: string) => {
    setPageSize(value)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Portal Customer</h1>
        <Breadcrumbs
          items={[
            { label: "Portal Customer", href: "/portal-customer" },
            { label: "Daftar SPK" },
          ]}
        />
      </div>

      {/* Data Table */}
      <DataTable
        title="Daftar SPK"
        columns={columns}
        data={filteredData}
        onDetail={handleDetail}
        customActions={[
          {
            label: "Bayar Cicil",
            icon: <Wallet className="mr-2 h-4 w-4" />,
            onClick: handleBayarCicil,
          },
          {
            label: "Bayar Lunas",
            icon: <HandCoins className="mr-2 h-4 w-4" />,
            onClick: handleBayarLunas,
          },
        ]}
        filterConfig={filterConfig}
        filterValues={filterValues}
        onFilterChange={setFilters}
        initialPageSize={parseInt(pageSize)}
        onPageSizeChange={(size) => setPageSize(String(size))}
        searchPlaceholder="Search"
      />

      {/* Bayar Dialog */}
      <BayarDialog
        open={bayarDialogOpen}
        onOpenChange={setBayarDialogOpen}
        type={bayarType}
        nominal={selectedRow?.nominal ?? 0}
        onConfirm={handleBayarConfirm}
      />
    </div>
  )
}

export default function PortalCustomerPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PortalCustomerPageContent />
    </Suspense>
  )
}

