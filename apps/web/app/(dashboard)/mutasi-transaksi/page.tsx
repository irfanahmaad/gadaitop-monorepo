"use client"

import React, { useState } from "react"
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
import { SearchIcon, SlidersHorizontal, ArrowUpDown, Plus } from "lucide-react"
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { TambahDataMutasiDialog } from "./_components/tambah-data-mutasi-dialog"

// Type for Mutasi Transaksi
type MutasiTransaksi = {
  id: string
  tanggal: string
  toko: {
    name: string
    avatar?: string
  }
  tipeMutasi: "SPK1" | "SPK2" | "Operasional" | "Tambah Modal"
  debit: number | null
  kredit: number | null
  sisaSaldo: number
}

// Sample data
const sampleData: MutasiTransaksi[] = [
  {
    id: "1",
    tanggal: "20 November 2025 18:33:45",
    toko: {
      name: "GT Jakarta Satu",
      avatar: "/placeholder-avatar.jpg",
    },
    tipeMutasi: "SPK2",
    debit: null,
    kredit: 1000000,
    sisaSaldo: 13800000,
  },
  {
    id: "2",
    tanggal: "20 November 2025 18:33:45",
    toko: {
      name: "GT Jakarta 2",
      avatar: "/placeholder-avatar.jpg",
    },
    tipeMutasi: "Operasional",
    debit: null,
    kredit: 200000,
    sisaSaldo: 14800000,
  },
  {
    id: "3",
    tanggal: "20 November 2025 18:33:45",
    toko: {
      name: "GT Jakarta Satu",
      avatar: "/placeholder-avatar.jpg",
    },
    tipeMutasi: "SPK1",
    debit: null,
    kredit: 5000000,
    sisaSaldo: 15000000,
  },
  {
    id: "4",
    tanggal: "20 November 2025 18:33:45",
    toko: {
      name: "GT Jakarta 2",
      avatar: "/placeholder-avatar.jpg",
    },
    tipeMutasi: "Tambah Modal",
    debit: 20000000,
    kredit: null,
    sisaSaldo: 20000000,
  },
]

// Column definitions
const columns: ColumnDef<MutasiTransaksi>[] = [
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
    accessorKey: "tanggal",
    header: "Tanggal",
  },
  {
    accessorKey: "toko",
    header: "Toko",
    cell: ({ row }) => {
      const toko = row.getValue("toko") as MutasiTransaksi["toko"]
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={toko.avatar} alt={toko.name} />
            <AvatarFallback>
              {toko.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{toko.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "tipeMutasi",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 hover:bg-transparent"
        >
          Tipe Mutasi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "debit",
    header: "Debit",
    cell: ({ row }) => {
      const debit = row.getValue("debit") as number | null
      return (
        <span className="text-sm">
          {debit ? `Rp${formatCurrencyDisplay(debit)},-` : "-"}
        </span>
      )
    },
  },
  {
    accessorKey: "kredit",
    header: "Kredit",
    cell: ({ row }) => {
      const kredit = row.getValue("kredit") as number | null
      return (
        <span className="text-sm">
          {kredit ? `Rp${formatCurrencyDisplay(kredit)},-` : "-"}
        </span>
      )
    },
  },
  {
    accessorKey: "sisaSaldo",
    header: "Sisa Saldo",
    cell: ({ row }) => {
      const sisaSaldo = row.getValue("sisaSaldo") as number
      return (
        <span className="text-sm">Rp{formatCurrencyDisplay(sisaSaldo)},-</span>
      )
    },
  },
]

export default function MutasiTransaksiPage() {
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [selectedToko, setSelectedToko] = useState("all")
  const [tambahDataDialogOpen, setTambahDataDialogOpen] = useState(false)
  const [isTambahDataSubmitting, setIsTambahDataSubmitting] = useState(false)

  // Filter data based on selected toko
  const filteredData = sampleData.filter((item) => {
    if (selectedToko === "all") return true
    return item.toko.name.toLowerCase().includes(selectedToko.toLowerCase())
  })

  const handleTambahData = () => {
    setTambahDataDialogOpen(true)
  }

  const handleTambahDataConfirm = async (data: {
    nominal: number
    tipe: "SPK1" | "SPK2" | "Operasional" | "Tambah Modal"
    keterangan?: string
  }) => {
    setIsTambahDataSubmitting(true)
    try {
      console.log("Tambah Data Mutasi:", data)
      // TODO: wire to API, e.g. await createMutasi(data)
    } finally {
      setIsTambahDataSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Mutasi / Transaksi</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Mutasi/Transaksi" },
              ]}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Toko Select */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Pilih Toko :</span>
              <Select value={selectedToko} onValueChange={setSelectedToko}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih Toko" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Toko</SelectItem>
                  <SelectItem value="gt-jakarta-satu">
                    GT Jakarta Satu
                  </SelectItem>
                  <SelectItem value="gt-jakarta-dua">GT Jakarta Dua</SelectItem>
                  <SelectItem value="gt-jakarta-tiga">
                    GT Jakarta Tiga
                  </SelectItem>
                  <SelectItem value="gt-jakarta-empat">
                    GT Jakarta Empat
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tambah Data Button */}
            <Button
              onClick={handleTambahData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Data
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        title="Daftar Mutasi"
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
      />

      <TambahDataMutasiDialog
        open={tambahDataDialogOpen}
        onOpenChange={setTambahDataDialogOpen}
        onConfirm={handleTambahDataConfirm}
        isSubmitting={isTambahDataSubmitting}
      />
    </div>
  )
}
