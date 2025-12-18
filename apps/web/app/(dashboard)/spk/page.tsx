"use client"

import React, { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { User } from "lucide-react"
import { useFilterParams, FilterConfig } from "@/hooks/use-filter-params"

// Sample data type
type SPK = {
  id: string
  nomorSPK: string
  namaCustomer: string
  fotoCustomer?: string
  jumlahSPK: number
  sisaSPK: number
  tanggalWaktuSPK: string
}

// Sample data
const sampleData: SPK[] = Array.from({ length: 100 }, (_, i) => ({
  id: `SPK${String(i + 1).padStart(3, "0")}`,
  nomorSPK: `SPK/001/${String(i + 1).padStart(2, "0")}112025`,
  namaCustomer: `Customer ${i + 1}`,
  fotoCustomer: undefined,
  jumlahSPK: 10000000 + i * 1000000,
  sisaSPK: 10 - (i % 10),
  tanggalWaktuSPK: new Date(2025, 10, 20 - (i % 30), 18, 33, 45).toLocaleString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  ),
}))

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Filter configuration for SPK
const filterConfig: FilterConfig[] = [
  {
    key: "spkRange",
    label: "SPK",
    type: "currencyrange",
    currency: "Rp",
  },
]

// Branch options for Select
const branchOptions = [
  { value: "gt-jakarta-satu", label: "GT Jakarta Satu" },
  { value: "gt-jakarta-dua", label: "GT Jakarta Dua" },
  { value: "gt-bandung", label: "GT Bandung" },
  { value: "gt-surabaya", label: "GT Surabaya" },
]

// Column definitions
const columns: ColumnDef<SPK>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return index + 1
    },
  },
  {
    id: "foto",
    accessorKey: "fotoCustomer",
    header: "Foto",
    cell: ({ row }) => {
      const spk = row.original
      return (
        <Avatar className="size-10">
          <AvatarImage src={spk.fotoCustomer} alt={spk.namaCustomer} />
          <AvatarFallback>
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>
      )
    },
  },
  {
    accessorKey: "nomorSPK",
    header: "Nomor SPK",
  },
  {
    accessorKey: "namaCustomer",
    header: "Nama Customer",
  },
  {
    accessorKey: "jumlahSPK",
    header: "Jumlah SPK",
    cell: ({ row }) => {
      return `Rp ${formatCurrency(row.getValue("jumlahSPK"))}`
    },
  },
  {
    accessorKey: "sisaSPK",
    header: "Sisa SPK",
  },
  {
    accessorKey: "tanggalWaktuSPK",
    header: "Tanggal & Waktu SPK",
  },
]

export default function SPKPage() {
  // Filter state management via URL params
  const { filterValues, setFilters } = useFilterParams(filterConfig)
  const [selectedBranch, setSelectedBranch] = React.useState<string>("")

  // Apply filters to data
  const filteredData = useMemo(() => {
    let filtered = [...sampleData]

    // Apply branch filter (if selected)
    if (selectedBranch) {
      // In a real app, this would filter by branch
      // For now, we'll just use the sample data
    }

    // Apply SPK range filter
    const spkRange = filterValues.spkRange as
      | { from?: number | string | null; to?: number | string | null }
      | undefined
    if (spkRange) {
      if (spkRange.from !== null && spkRange.from !== undefined) {
        const fromValue =
          typeof spkRange.from === "string"
            ? Number(spkRange.from)
            : spkRange.from
        if (!isNaN(fromValue)) {
          filtered = filtered.filter((item) => item.jumlahSPK >= fromValue)
        }
      }
      if (spkRange.to !== null && spkRange.to !== undefined) {
        const toValue =
          typeof spkRange.to === "string" ? Number(spkRange.to) : spkRange.to
        if (!isNaN(toValue)) {
          filtered = filtered.filter((item) => item.jumlahSPK <= toValue)
        }
      }
    }

    return filtered
  }, [filterValues, selectedBranch])

  const handleDetail = (row: SPK) => {
    console.log("Detail:", row)
    // Implement detail action
  }

  const handleEdit = (row: SPK) => {
    console.log("Edit:", row)
    // Implement edit action
  }

  const handleDelete = (row: SPK) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      console.log("Delete:", row)
      // Implement delete action
    }
  }

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value)
    // In a real app, you might want to add branch to URL params too
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">SPK</h1>
        <Breadcrumbs
          items={[{ label: "Pages", href: "/" }, { label: "SPK" }]}
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        onDetail={handleDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        headerLeft={
          <Select value={selectedBranch} onValueChange={handleBranchChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih Cabang" />
            </SelectTrigger>
            <SelectContent>
              {branchOptions.map((branch) => (
                <SelectItem key={branch.value} value={branch.value}>
                  {branch.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        filterConfig={filterConfig}
        filterValues={filterValues}
        onFilterChange={setFilters}
      />
    </div>
  )
}
