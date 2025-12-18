"use client"

import React, { useState } from "react"
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

// Types for SPK Jatuh Tempo
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
  status: "Menunggu" | "Diambil" | "Tervalidasi" | "Berjalan"
}

// Sample data for SPK Jatuh Tempo
const sampleItemLelang: ItemLelang[] = [
  {
    id: "1",
    foto: "/placeholder-avatar.jpg",
    noSPK: "SPK/002/20112025",
    namaBarang: "iPhone 15 Pro",
    tipeBarang: "Handphone",
    toko: "GT Jakarta Satu",
    petugas: "Ben Affleck",
    lastUpdatedAt: "Belum Terscan",
  },
  {
    id: "2",
    foto: "/placeholder-avatar.jpg",
    noSPK: "SPK/003/20112025",
    namaBarang: "Google Smarthome",
    tipeBarang: "IoT",
    toko: "GT Jakarta Empat",
    petugas: "Ben Affleck",
    lastUpdatedAt: "Belum Terscan",
  },
  {
    id: "3",
    foto: "/placeholder-avatar.jpg",
    noSPK: "SPK/004/20112025",
    namaBarang: "iPhone 15 Pro",
    tipeBarang: "Handphone",
    toko: "GT Jakarta Dua",
    petugas: "Ben Affleck",
    lastUpdatedAt: "Belum Terscan",
  },
  {
    id: "4",
    foto: "/placeholder-avatar.jpg",
    noSPK: "SPK/005/20112025",
    namaBarang: "MacBook Pro M1",
    tipeBarang: "Laptop",
    toko: "GT Jakarta Satu",
    petugas: "Ben Affleck",
    lastUpdatedAt: "Terscan",
  },
  {
    id: "5",
    foto: "/placeholder-avatar.jpg",
    noSPK: "SPK/006/20112025",
    namaBarang: "DJI Drone",
    tipeBarang: "Drone",
    toko: "GT Jakarta Empat",
    petugas: "Ben Affleck",
    lastUpdatedAt: "Terscan",
  },
  {
    id: "6",
    foto: "/placeholder-avatar.jpg",
    noSPK: "SPK/007/20112025",
    namaBarang: "Apple Watch Ultra",
    tipeBarang: "Smartwatch",
    toko: "GT Jakarta Dua",
    petugas: "Ben Affleck",
    lastUpdatedAt: "Terscan",
  },
  {
    id: "7",
    foto: "/placeholder-avatar.jpg",
    noSPK: "SPK/008/20112025",
    namaBarang: "Samsung Galaxy S24",
    tipeBarang: "Handphone",
    toko: "GT Jakarta Satu",
    petugas: "Ben Affleck",
    lastUpdatedAt: "Terscan",
  },
]

// Sample data for Batch Lelang SPK
const sampleBatchLelang: BatchLelang[] = [
  {
    id: "1",
    idBatch: "BTC/001",
    namaBatch: "Batch Handphone",
    jumlahItem: 10,
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Menunggu",
  },
  {
    id: "2",
    idBatch: "BTC/002",
    namaBatch: "Batch Otomotif",
    jumlahItem: 7,
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Diambil",
  },
  {
    id: "3",
    idBatch: "BTC/001",
    namaBatch: "Batch Handphone",
    jumlahItem: 10,
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Tervalidasi",
  },
  {
    id: "4",
    idBatch: "BTC/002",
    namaBatch: "Batch Otomotif",
    jumlahItem: 7,
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Berjalan",
  },
  {
    id: "5",
    idBatch: "BTC/001",
    namaBatch: "Batch Handphone",
    jumlahItem: 10,
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Menunggu",
  },
  {
    id: "6",
    idBatch: "BTC/002",
    namaBatch: "Batch Otomotif",
    jumlahItem: 7,
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Diambil",
  },
  {
    id: "7",
    idBatch: "BTC/001",
    namaBatch: "Batch Handphone",
    jumlahItem: 10,
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Tervalidasi",
  },
  {
    id: "8",
    idBatch: "BTC/002",
    namaBatch: "Batch Otomotif",
    jumlahItem: 7,
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Berjalan",
  },
  {
    id: "9",
    idBatch: "BTC/001",
    namaBatch: "Batch Handphone",
    jumlahItem: 10,
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Menunggu",
  },
  {
    id: "10",
    idBatch: "BTC/002",
    namaBatch: "Batch Otomotif",
    jumlahItem: 7,
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Diambil",
  },
]

// Status badge component for Batch Lelang
const BatchStatusBadge = ({ status }: { status: BatchLelang["status"] }) => {
  const statusConfig = {
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
  }

  const config = statusConfig[status]

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
        <Eye className="h-3 w-3 text-gray-400" />
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

export default function LelangPage() {
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [selectedToko, setSelectedToko] = useState("gt-jakarta-satu")
  const [activeTab, setActiveTab] = useState("spk-jatuh-tempo")

  const handleDetail = (row: ItemLelang | BatchLelang) => {
    console.log("Detail:", row)
    // Implement detail action
  }

  const handleEdit = (row: ItemLelang | BatchLelang) => {
    console.log("Edit:", row)
    // Implement edit action
  }

  const handleDelete = (row: ItemLelang | BatchLelang) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      console.log("Delete:", row)
      // Implement delete action
    }
  }

  // Filter data based on selected toko
  const filteredItemLelang = sampleItemLelang.filter(
    (item) =>
      selectedToko === "all" || item.toko.toLowerCase().includes(selectedToko)
  )

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

        {/* Toko Select */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Toko :</span>
          <Select value={selectedToko} onValueChange={setSelectedToko}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Toko" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Toko</SelectItem>
              <SelectItem value="gt-jakarta-satu">GT Jakarta Satu</SelectItem>
              <SelectItem value="gt-jakarta-dua">GT Jakarta Dua</SelectItem>
              <SelectItem value="gt-jakarta-tiga">GT Jakarta Tiga</SelectItem>
              <SelectItem value="gt-jakarta-empat">GT Jakarta Empat</SelectItem>
            </SelectContent>
          </Select>
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

        {/* SPK Jatuh Tempo Tab */}
        <TabsContent value="spk-jatuh-tempo" className="mt-0">
          <DataTable
            columns={itemLelangColumns}
            data={filteredItemLelang}
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
            getRowClassName={(row) =>
              row.lastUpdatedAt === "Belum Terscan"
                ? "bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800"
                : ""
            }
          />
        </TabsContent>

        {/* Batch Lelang SPK Tab */}
        <TabsContent value="batch-lelang-spk" className="mt-0">
          <DataTable
            columns={batchLelangColumns}
            data={sampleBatchLelang}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
