"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
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
import { SearchIcon, SlidersHorizontal } from "lucide-react"

// Sample data type
type ValidasiLelangan = {
  id: string
  idBatch: string
  namaBatch: string
  jumlahItem: number
  toko: number
  petugas: number
  status?: "Tervalidasi" | "Dijadwalkan" | "Waiting for Approval"
  lastUpdatedAt: string
}

// Dummy data for Dijadwalkan tab
const dijadwalkanData: ValidasiLelangan[] = [
  {
    id: "VL001",
    idBatch: "BTC001",
    namaBatch: "Batch Handphone",
    jumlahItem: 10,
    toko: 3,
    petugas: 4,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "VL002",
    idBatch: "BTC002",
    namaBatch: "Batch Otomotif",
    jumlahItem: 7,
    toko: 3,
    petugas: 4,
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "VL003",
    idBatch: "BTC003",
    namaBatch: "Batch Elektronik",
    jumlahItem: 15,
    toko: 2,
    petugas: 3,
    lastUpdatedAt: "21 November 2025 10:20:30",
  },
  {
    id: "VL004",
    idBatch: "BTC004",
    namaBatch: "Batch Perhiasan",
    jumlahItem: 12,
    toko: 4,
    petugas: 5,
    lastUpdatedAt: "21 November 2025 14:15:20",
  },
]

// Dummy data for Waiting for Approval tab
const waitingForApprovalData: ValidasiLelangan[] = [
  {
    id: "VL005",
    idBatch: "BTC005",
    namaBatch: "Batch Gadget",
    jumlahItem: 8,
    toko: 2,
    petugas: 2,
    lastUpdatedAt: "22 November 2025 09:10:25",
  },
  {
    id: "VL006",
    idBatch: "BTC006",
    namaBatch: "Batch Kendaraan",
    jumlahItem: 5,
    toko: 1,
    petugas: 1,
    lastUpdatedAt: "22 November 2025 11:30:40",
  },
  {
    id: "VL007",
    idBatch: "BTC007",
    namaBatch: "Batch Emas",
    jumlahItem: 20,
    toko: 5,
    petugas: 6,
    lastUpdatedAt: "23 November 2025 08:15:20",
  },
  {
    id: "VL008",
    idBatch: "BTC008",
    namaBatch: "Batch Laptop",
    jumlahItem: 6,
    toko: 2,
    petugas: 3,
    lastUpdatedAt: "23 November 2025 10:30:45",
  },
  {
    id: "VL009",
    idBatch: "BTC009",
    namaBatch: "Batch Sepeda Motor",
    jumlahItem: 9,
    toko: 3,
    petugas: 4,
    lastUpdatedAt: "24 November 2025 12:45:10",
  },
  {
    id: "VL010",
    idBatch: "BTC010",
    namaBatch: "Batch Smartphone",
    jumlahItem: 11,
    toko: 4,
    petugas: 5,
    lastUpdatedAt: "24 November 2025 14:20:30",
  },
]

// Dummy data for Tervalidasi tab
const tervalidasiData: ValidasiLelangan[] = [
  {
    id: "VL001",
    idBatch: "BTC/001",
    namaBatch: "Batch Handphone",
    jumlahItem: 10,
    toko: 3,
    petugas: 4,
    status: "Tervalidasi",
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "VL002",
    idBatch: "BTC/002",
    namaBatch: "Batch Otomotif",
    jumlahItem: 7,
    toko: 3,
    petugas: 4,
    status: "Tervalidasi",
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "VL003",
    idBatch: "BTC/001",
    namaBatch: "Batch Handphone",
    jumlahItem: 10,
    toko: 3,
    petugas: 4,
    status: "Tervalidasi",
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
  {
    id: "VL004",
    idBatch: "BTC/002",
    namaBatch: "Batch Otomotif",
    jumlahItem: 7,
    toko: 3,
    petugas: 4,
    status: "Tervalidasi",
    lastUpdatedAt: "20 November 2025 18:33:45",
  },
]

// Base column definitions (without Status)
const baseColumns: ColumnDef<ValidasiLelangan>[] = [
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
    cell: ({ row }) => {
      return <span>{row.getValue("jumlahItem")}</span>
    },
  },
  {
    accessorKey: "toko",
    header: "Toko",
    cell: ({ row }) => {
      return <span>{row.getValue("toko")}</span>
    },
  },
  {
    accessorKey: "petugas",
    header: "Petugas",
    cell: ({ row }) => {
      return <span>{row.getValue("petugas")}</span>
    },
  },
  {
    accessorKey: "lastUpdatedAt",
    header: "Last Updated At",
  },
]

// Column definitions with Status (for Tervalidasi tab)
const columnsWithStatus: ColumnDef<ValidasiLelangan>[] = [
  ...baseColumns.slice(0, -1), // All columns except lastUpdatedAt
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as ValidasiLelangan["status"]
      if (!status) return null
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "lastUpdatedAt",
    header: "Last Updated At",
  },
]

export default function ValidasiLelanganPage() {
  const router = useRouter()
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("dijadwalkan")

  // Counts for each tab
  const dijadwalkanCount = dijadwalkanData.length
  const waitingForApprovalCount = waitingForApprovalData.length
  const tervalidasiCount = tervalidasiData.length

  const handleDetail = (row: ValidasiLelangan) => {
    router.push(`/validasi-lelangan/${row.id}`)
  }

  const handleEdit = (row: ValidasiLelangan) => {
    console.log("Edit:", row)
    // Implement edit action
  }

  const handleDelete = (row: ValidasiLelangan) => {
    console.log("Delete:", row)
    // Implement delete action
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Validasi Lelang</h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: "Validasi Lelang" },
            ]}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-4"
      >
        <TabsList className="w-fit">
          <TabsTrigger
            value="dijadwalkan"
            className="flex items-center gap-2"
          >
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
          <TabsTrigger
            value="tervalidasi"
            className="flex items-center gap-2"
          >
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

        {/* Dijadwalkan View */}
        <TabsContent value="dijadwalkan" className="mt-0">
          <DataTable
            columns={baseColumns}
            data={dijadwalkanData}
            title="Daftar Validasi Lelang"
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

        {/* Waiting for Approval View */}
        <TabsContent value="waiting-for-approval" className="mt-0">
          <DataTable
            columns={baseColumns}
            data={waitingForApprovalData}
            title="Daftar Validasi Lelang"
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

        {/* Tervalidasi View */}
        <TabsContent value="tervalidasi" className="mt-0">
          <DataTable
            columns={columnsWithStatus}
            data={tervalidasiData}
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
