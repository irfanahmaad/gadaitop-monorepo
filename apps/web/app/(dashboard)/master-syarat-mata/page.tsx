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
import { SearchIcon, SlidersHorizontal, Plus } from "lucide-react"
import { formatCurrencyDisplay } from "@/lib/format-currency"

// Type for Syarat Mata
type SyaratMata = {
  id: string
  namaAturan: string
  tipeBarang: string
  hargaDari: number
  hargaSampai: number
  kondisiBarang: string
  lastUpdatedAt: Date
}

// Sample data for Syarat Mata
const sampleSyaratMata: SyaratMata[] = [
  {
    id: "1",
    namaAturan: "Barang Mahal",
    tipeBarang: "Handphone",
    hargaDari: 10000000,
    hargaSampai: 30000000,
    kondisiBarang: "Ada & Kondisi Sesuai",
    lastUpdatedAt: new Date("2025-11-20T18:33:45"),
  },
  {
    id: "2",
    namaAturan: "Barang Penting",
    tipeBarang: "Sepeda Motor",
    hargaDari: 20000000,
    hargaSampai: 200000000,
    kondisiBarang: "Ada & Kondisi Sesuai",
    lastUpdatedAt: new Date("2025-11-20T18:33:45"),
  },
  {
    id: "3",
    namaAturan: "Barang Mahal",
    tipeBarang: "Handphone",
    hargaDari: 10000000,
    hargaSampai: 30000000,
    kondisiBarang: "Ada & Kondisi Sesuai",
    lastUpdatedAt: new Date("2025-11-20T18:33:45"),
  },
  {
    id: "4",
    namaAturan: "Barang Standar",
    tipeBarang: "Laptop",
    hargaDari: 5000000,
    hargaSampai: 15000000,
    kondisiBarang: "Ada & Kondisi Sesuai",
    lastUpdatedAt: new Date("2025-11-19T14:20:30"),
  },
  {
    id: "5",
    namaAturan: "Barang Mewah",
    tipeBarang: "Mobil",
    hargaDari: 50000000,
    hargaSampai: 500000000,
    kondisiBarang: "Ada & Kondisi Sesuai",
    lastUpdatedAt: new Date("2025-11-18T10:15:20"),
  },
  {
    id: "6",
    namaAturan: "Barang Elektronik",
    tipeBarang: "TV",
    hargaDari: 2000000,
    hargaSampai: 10000000,
    kondisiBarang: "Ada & Kondisi Sesuai",
    lastUpdatedAt: new Date("2025-11-17T16:45:10"),
  },
  {
    id: "7",
    namaAturan: "Barang Antik",
    tipeBarang: "Perhiasan",
    hargaDari: 1000000,
    hargaSampai: 50000000,
    kondisiBarang: "Ada & Kondisi Sesuai",
    lastUpdatedAt: new Date("2025-11-16T09:30:00"),
  },
  {
    id: "8",
    namaAturan: "Barang Koleksi",
    tipeBarang: "Jam Tangan",
    hargaDari: 5000000,
    hargaSampai: 100000000,
    kondisiBarang: "Ada & Kondisi Sesuai",
    lastUpdatedAt: new Date("2025-11-15T12:00:00"),
  },
  {
    id: "9",
    namaAturan: "Barang Umum",
    tipeBarang: "Sepeda",
    hargaDari: 1000000,
    hargaSampai: 5000000,
    kondisiBarang: "Ada & Kondisi Sesuai",
    lastUpdatedAt: new Date("2025-11-14T08:15:45"),
  },
  {
    id: "10",
    namaAturan: "Barang Berharga",
    tipeBarang: "Emas",
    hargaDari: 500000,
    hargaSampai: 50000000,
    kondisiBarang: "Ada & Kondisi Sesuai",
    lastUpdatedAt: new Date("2025-11-13T15:22:30"),
  },
]

// Format date to Indonesian format
function formatDate(date: Date): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const seconds = date.getSeconds().toString().padStart(2, "0")

  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`
}

// Column definitions for Syarat Mata
const syaratMataColumns: ColumnDef<SyaratMata>[] = [
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
    accessorKey: "kondisiBarang",
    header: "Kondisi Barang",
  },
  {
    accessorKey: "lastUpdatedAt",
    header: "Last Updated At",
    cell: ({ row }) => {
      const date = row.getValue("lastUpdatedAt") as Date
      return <span>{formatDate(date)}</span>
    },
  },
]

export default function MasterSyaratMataPage() {
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")

  const handleDetail = (row: SyaratMata) => {
    console.log("Detail:", row)
    // Implement detail action
  }

  const handleEdit = (row: SyaratMata) => {
    console.log("Edit:", row)
    // Implement edit action
  }

  const handleDelete = (row: SyaratMata) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      console.log("Delete:", row)
      // Implement delete action
    }
  }

  const handleTambahData = () => {
    console.log("Tambah Data")
    // Implement add data action
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Master Syarat &quot;Mata&quot;</h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: 'Master Syarat "Mata"' },
            ]}
          />
        </div>

        {/* Tambah Data Button */}
        <Button
          onClick={handleTambahData}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Data
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={syaratMataColumns}
        data={sampleSyaratMata}
        title="Daftar Katalog"
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
        onDetail={handleDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
