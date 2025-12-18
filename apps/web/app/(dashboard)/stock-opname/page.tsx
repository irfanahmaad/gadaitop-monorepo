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
import { Plus, SearchIcon, SlidersHorizontal } from "lucide-react"

// Sample data type
type StockOpname = {
  id: string
  idSO: string
  tanggal: string
  toko: string
  petugas: string
  lastUpdatedAt: string
  status: "Dijadwalkan" | "Berjalan" | "Selesai"
}

// Sample data
const sampleData: StockOpname[] = [
  {
    id: "SO001",
    idSO: "SO/001",
    tanggal: "25 November 2025",
    toko: "4 Toko",
    petugas: "2 Petugas",
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Dijadwalkan",
  },
  {
    id: "SO002",
    idSO: "SO/002",
    tanggal: "26 November 2025",
    toko: "3 Toko",
    petugas: "4 Petugas",
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Dijadwalkan",
  },
  {
    id: "SO003",
    idSO: "SO/003",
    tanggal: "27 November 2025",
    toko: "2 Toko",
    petugas: "3 Petugas",
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Berjalan",
  },
  {
    id: "SO004",
    idSO: "SO/004",
    tanggal: "28 November 2025",
    toko: "5 Toko",
    petugas: "2 Petugas",
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Selesai",
  },
  {
    id: "SO005",
    idSO: "SO/005",
    tanggal: "29 November 2025",
    toko: "3 Toko",
    petugas: "3 Petugas",
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Dijadwalkan",
  },
  {
    id: "SO006",
    idSO: "SO/006",
    tanggal: "30 November 2025",
    toko: "4 Toko",
    petugas: "2 Petugas",
    lastUpdatedAt: "20 November 2025 18:33:45",
    status: "Dijadwalkan",
  },
]

// Status badge component
const StatusBadge = ({ status }: { status: StockOpname["status"] }) => {
  const statusConfig = {
    Dijadwalkan: {
      label: "Dijadwalkan",
      className:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    Berjalan: {
      label: "Berjalan",
      className:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    Selesai: {
      label: "Selesai",
      className:
        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
  }

  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

// Column definitions
const columns: ColumnDef<StockOpname>[] = [
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
    accessorKey: "idSO",
    header: "ID SO",
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
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
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
]

export default function StockOpnamePage() {
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")

  const handleCreate = () => {
    // Implement create action
    console.log("Create new stock opname")
  }

  const handleDetail = (row: StockOpname) => {
    console.log("Detail:", row)
    // Implement detail action
  }

  const handleEdit = (row: StockOpname) => {
    console.log("Edit:", row)
    // Implement edit action
  }

  const handleDelete = (row: StockOpname) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      console.log("Delete:", row)
      // Implement delete action
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Stock Opname</h1>
          <Breadcrumbs
            items={[{ label: "Pages", href: "/" }, { label: "Stock Opname" }]}
          />
        </div>

        <div>
          <Button onClick={handleCreate} variant="destructive">
            <Plus className="size-5" />
            Tambah Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="list">Tampilan List</TabsTrigger>
          <TabsTrigger value="calendar">Tampilan Kalender</TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="mt-0">
          <DataTable
            columns={columns}
            data={sampleData}
            title="Daftar SO"
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

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-0">
          {/* Keep blank for now */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
