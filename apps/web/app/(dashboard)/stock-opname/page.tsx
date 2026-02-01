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
import { Plus, SearchIcon, SlidersHorizontal } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { StockOpnameFormDialog } from "./_components/StockOpnameFormDialog"
import { CalendarView } from "./_components/CalendarView"

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

// Dummy data for Dijadwalkan tab
const dijadwalkanData: StockOpname[] = [
  {
    id: "SO007",
    idSO: "SO/007",
    tanggal: "1 Desember 2025",
    toko: "6 Toko",
    petugas: "5 Petugas",
    lastUpdatedAt: "21 November 2025 14:20:30",
    status: "Dijadwalkan",
  },
  {
    id: "SO008",
    idSO: "SO/008",
    tanggal: "2 Desember 2025",
    toko: "7 Toko",
    petugas: "6 Petugas",
    lastUpdatedAt: "21 November 2025 15:45:12",
    status: "Dijadwalkan",
  },
  {
    id: "SO009",
    idSO: "SO/009",
    tanggal: "3 Desember 2025",
    toko: "8 Toko",
    petugas: "7 Petugas",
    lastUpdatedAt: "22 November 2025 09:10:25",
    status: "Dijadwalkan",
  },
  {
    id: "SO010",
    idSO: "SO/010",
    tanggal: "4 Desember 2025",
    toko: "9 Toko",
    petugas: "8 Petugas",
    lastUpdatedAt: "22 November 2025 11:30:40",
    status: "Dijadwalkan",
  },
]

// Dummy data for Waiting for Approval tab
const waitingForApprovalData: StockOpname[] = [
  {
    id: "SO013",
    idSO: "SO/013",
    tanggal: "7 Desember 2025",
    toko: "12 Toko",
    petugas: "11 Petugas",
    lastUpdatedAt: "24 November 2025 08:15:20",
    status: "Dijadwalkan",
  },
  {
    id: "SO014",
    idSO: "SO/014",
    tanggal: "8 Desember 2025",
    toko: "13 Toko",
    petugas: "12 Petugas",
    lastUpdatedAt: "24 November 2025 10:30:45",
    status: "Dijadwalkan",
  },
  {
    id: "SO015",
    idSO: "SO/015",
    tanggal: "9 Desember 2025",
    toko: "14 Toko",
    petugas: "13 Petugas",
    lastUpdatedAt: "25 November 2025 12:45:10",
    status: "Dijadwalkan",
  },
  {
    id: "SO016",
    idSO: "SO/016",
    tanggal: "10 Desember 2025",
    toko: "15 Toko",
    petugas: "14 Petugas",
    lastUpdatedAt: "25 November 2025 14:20:30",
    status: "Dijadwalkan",
  },
  {
    id: "SO017",
    idSO: "SO/017",
    tanggal: "11 Desember 2025",
    toko: "16 Toko",
    petugas: "15 Petugas",
    lastUpdatedAt: "26 November 2025 09:10:25",
    status: "Dijadwalkan",
  },
  {
    id: "SO018",
    idSO: "SO/018",
    tanggal: "12 Desember 2025",
    toko: "17 Toko",
    petugas: "16 Petugas",
    lastUpdatedAt: "26 November 2025 11:35:50",
    status: "Dijadwalkan",
  },
]

// Dummy data for Tervalidasi tab
const tervalidasiData: StockOpname[] = [
  {
    id: "SO019",
    idSO: "SO/019",
    tanggal: "13 Desember 2025",
    toko: "18 Toko",
    petugas: "17 Petugas",
    lastUpdatedAt: "27 November 2025 13:20:15",
    status: "Selesai",
  },
  {
    id: "SO020",
    idSO: "SO/020",
    tanggal: "14 Desember 2025",
    toko: "19 Toko",
    petugas: "18 Petugas",
    lastUpdatedAt: "27 November 2025 15:45:30",
    status: "Selesai",
  },
  {
    id: "SO021",
    idSO: "SO/021",
    tanggal: "15 Desember 2025",
    toko: "20 Toko",
    petugas: "19 Petugas",
    lastUpdatedAt: "28 November 2025 10:15:45",
    status: "Selesai",
  },
  {
    id: "SO022",
    idSO: "SO/022",
    tanggal: "16 Desember 2025",
    toko: "21 Toko",
    petugas: "20 Petugas",
    lastUpdatedAt: "28 November 2025 12:30:20",
    status: "Selesai",
  },
  {
    id: "SO023",
    idSO: "SO/023",
    tanggal: "17 Desember 2025",
    toko: "22 Toko",
    petugas: "21 Petugas",
    lastUpdatedAt: "29 November 2025 14:25:10",
    status: "Selesai",
  },
  {
    id: "SO024",
    idSO: "SO/024",
    tanggal: "18 Desember 2025",
    toko: "23 Toko",
    petugas: "22 Petugas",
    lastUpdatedAt: "29 November 2025 16:40:35",
    status: "Selesai",
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
  const router = useRouter()
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<StockOpname | null>(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dijadwalkan")

  // Counts for each tab
  const dijadwalkanCount = dijadwalkanData.length
  const waitingForApprovalCount = waitingForApprovalData.length
  const tervalidasiCount = tervalidasiData.length

  const handleCreate = () => {
    setIsFormDialogOpen(true)
  }

  const handleFormDialogClose = () => {
    setIsFormDialogOpen(false)
  }

  const handleDetail = (row: StockOpname) => {
    router.push(`/stock-opname/${row.id}`)
  }

  const handleEdit = (row: StockOpname) => {
    console.log("Edit:", row)
    // Implement edit action
  }

  const handleDelete = (row: StockOpname) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      console.log("Delete:", itemToDelete)
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
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-4"
      >
        <TabsList className="w-fit">
          <TabsTrigger value="list">Tampilan List</TabsTrigger>
          <TabsTrigger value="calendar">Tampilan Kalender</TabsTrigger>
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
          <CalendarView
            data={sampleData}
            isLoading={false}
            onDetail={(item) => router.push(`/stock-opname/${item.id}`)}
            onEdit={(item) => console.log("Edit:", item)}
            onDelete={(item) => console.log("Delete:", item)}
          />
        </TabsContent>

        {/* Dijadwalkan View */}
        <TabsContent value="dijadwalkan" className="mt-0">
          <DataTable
            columns={columns}
            data={dijadwalkanData}
            title="Daftar SO Dijadwalkan"
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
            columns={columns}
            data={waitingForApprovalData}
            title="Daftar SO Waiting for Approval"
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
            columns={columns}
            data={tervalidasiData}
            title="Daftar SO Tervalidasi"
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

      {/* Form Dialog for Create */}
      <StockOpnameFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onClose={handleFormDialogClose}
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        description="Anda akan menghapus data Stock Opname dari dalam sistem."
      />
    </div>
  )
}
