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
import { Input } from "@workspace/ui/components/input"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { SearchIcon, SlidersHorizontal, Plus } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

// Type for Customer
type Customer = {
  id: string
  foto: string
  namaLengkap: string
  email: string
  noTelp: string
  alamat: string
  status: "Aktif" | "Tidak Aktif"
}

// Sample data for Customer
const sampleCustomers: Customer[] = [
  {
    id: "1",
    foto: "/placeholder-avatar.jpg",
    namaLengkap: "Andi Pratama Nugroho",
    email: "andi.pratama@mail.com",
    noTelp: "081234567891012",
    alamat: "Jl. Sudirman No. 123, Jakarta Pusat",
    status: "Aktif",
  },
  {
    id: "2",
    foto: "/placeholder-avatar.jpg",
    namaLengkap: "Siti Rahmawati Putri",
    email: "siti.rahmawati@mail.com",
    noTelp: "081234567891013",
    alamat: "Jl. Thamrin No. 456, Jakarta Selatan",
    status: "Aktif",
  },
  {
    id: "3",
    foto: "/placeholder-avatar.jpg",
    namaLengkap: "Budi Santoso",
    email: "budi.santoso@mail.com",
    noTelp: "081234567891014",
    alamat: "Jl. Gatot Subroto No. 789, Jakarta Selatan",
    status: "Aktif",
  },
  {
    id: "4",
    foto: "/placeholder-avatar.jpg",
    namaLengkap: "Dewi Lestari",
    email: "dewi.lestari@mail.com",
    noTelp: "081234567891015",
    alamat: "Jl. Kebon Jeruk No. 321, Jakarta Barat",
    status: "Tidak Aktif",
  },
  {
    id: "5",
    foto: "/placeholder-avatar.jpg",
    namaLengkap: "Eko Wijaya",
    email: "eko.wijaya@mail.com",
    noTelp: "081234567891016",
    alamat: "Jl. Cikini Raya No. 654, Jakarta Pusat",
    status: "Aktif",
  },
  {
    id: "6",
    foto: "/placeholder-avatar.jpg",
    namaLengkap: "Fitri Handayani",
    email: "fitri.handayani@mail.com",
    noTelp: "081234567891017",
    alamat: "Jl. Kemang Raya No. 987, Jakarta Selatan",
    status: "Aktif",
  },
  {
    id: "7",
    foto: "/placeholder-avatar.jpg",
    namaLengkap: "Gunawan Setiawan",
    email: "gunawan.setiawan@mail.com",
    noTelp: "081234567891018",
    alamat: "Jl. Senopati No. 147, Jakarta Selatan",
    status: "Aktif",
  },
  {
    id: "8",
    foto: "/placeholder-avatar.jpg",
    namaLengkap: "Hani Permata",
    email: "hani.permata@mail.com",
    noTelp: "081234567891019",
    alamat: "Jl. Kuningan No. 258, Jakarta Selatan",
    status: "Tidak Aktif",
  },
  {
    id: "9",
    foto: "/placeholder-avatar.jpg",
    namaLengkap: "Indra Kurniawan",
    email: "indra.kurniawan@mail.com",
    noTelp: "081234567891020",
    alamat: "Jl. Rasuna Said No. 369, Jakarta Selatan",
    status: "Aktif",
  },
]

// Column definitions for Customer
const customerColumns: ColumnDef<Customer>[] = [
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
        <AvatarImage src={row.getValue("foto")} alt="Customer photo" />
        <AvatarFallback>IMG</AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "namaLengkap",
    header: "Nama Lengkap",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "noTelp",
    header: "No. Telp",
  },
  {
    accessorKey: "alamat",
    header: "Alamat",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Customer["status"]
      const isAktif = status === "Aktif"
      return (
        <Badge
          variant="outline"
          className={
            isAktif
              ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
              : "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
          }
        >
          {status}
        </Badge>
      )
    },
  },
]

export default function MasterCustomerPage() {
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Customer | null>(null)

  const handleDetail = (row: Customer) => {
    console.log("Detail:", row)
    // Implement detail action
  }

  const handleEdit = (row: Customer) => {
    console.log("Edit:", row)
    // Implement edit action
  }

  const handleDelete = (row: Customer) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      console.log("Delete:", itemToDelete)
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
          <h1 className="text-2xl font-bold">Master Customer</h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: "Master Customer" },
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
        columns={customerColumns}
        data={sampleCustomers}
        title="Daftar Customer"
        searchPlaceholder="Email"
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
                placeholder="Email"
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

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        description="Anda akan menghapus data Customer dari dalam sistem."
      />
    </div>
  )
}
