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
import { SearchIcon, SlidersHorizontal, Plus } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

// Types for Toko Utama and Toko Pinjaman
type Toko = {
  id: string
  foto: string
  kodeLokasi: string
  namaPT: string
  namaToko: string
  alias: string
  noTelpToko: string
  kota: string
}

// Type for Request
type RequestToko = {
  id: string
  foto: string
  kodeLokasi: string
  namaPT: string
  adminPrimary: string
  namaToko: string
  alias: string
  noTelpToko: string
  kota: string
  tipe: "Pindah Kepemilikan" | "Pinjam PT"
}

// Sample data for Toko Utama
const sampleTokoUtama: Toko[] = [
  {
    id: "1",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK01",
    namaPT: "PT Gadai Top Indonesia",
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    noTelpToko: "081234567891012",
    kota: "Jakarta Timur",
  },
  {
    id: "2",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK02",
    namaPT: "PT Gadai Top Premium",
    namaToko: "GT Jakarta Dua",
    alias: "GT Dua",
    noTelpToko: "081234567891012",
    kota: "Jakarta Selatan",
  },
  {
    id: "3",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK03",
    namaPT: "PT Gadai Top Sukses Jaya",
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    noTelpToko: "081234567891012",
    kota: "Jakarta Timur",
  },
  {
    id: "4",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK04",
    namaPT: "PT Gadai Top Makmur",
    namaToko: "GT Jakarta Dua",
    alias: "GT Dua",
    noTelpToko: "081234567891012",
    kota: "Jakarta Selatan",
  },
  {
    id: "5",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK05",
    namaPT: "PT Gadai Top Nusantara",
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    noTelpToko: "081234567891012",
    kota: "Jakarta Timur",
  },
  {
    id: "6",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK06",
    namaPT: "PT Gadai Top Finansia",
    namaToko: "GT Jakarta Dua",
    alias: "GT Dua",
    noTelpToko: "081234567891012",
    kota: "Jakarta Selatan",
  },
]

// Sample data for Toko Pinjaman
const sampleTokoPinjaman: Toko[] = [
  {
    id: "1",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK01",
    namaPT: "PT Gadai Top Indonesia",
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    noTelpToko: "081234567891012",
    kota: "Jakarta Timur",
  },
  {
    id: "2",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK02",
    namaPT: "PT Gadai Top Premium",
    namaToko: "GT Jakarta Dua",
    alias: "GT Dua",
    noTelpToko: "081234567891012",
    kota: "Jakarta Selatan",
  },
  {
    id: "3",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK03",
    namaPT: "PT Gadai Top Sukses Jaya",
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    noTelpToko: "081234567891012",
    kota: "Jakarta Timur",
  },
  {
    id: "4",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK04",
    namaPT: "PT Gadai Top Makmur",
    namaToko: "GT Jakarta Dua",
    alias: "GT Dua",
    noTelpToko: "081234567891012",
    kota: "Jakarta Selatan",
  },
  {
    id: "5",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK05",
    namaPT: "PT Gadai Top Nusantara",
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    noTelpToko: "081234567891012",
    kota: "Jakarta Timur",
  },
  {
    id: "6",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK06",
    namaPT: "PT Gadai Top Finansia",
    namaToko: "GT Jakarta Dua",
    alias: "GT Dua",
    noTelpToko: "081234567891012",
    kota: "Jakarta Selatan",
  },
]

// Sample data for Request
const sampleRequest: RequestToko[] = [
  {
    id: "1",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK01",
    namaPT: "PT Gadai Top Indonesia",
    adminPrimary: "Ben Affleck",
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    noTelpToko: "081234567891012",
    kota: "Jakarta Timur",
    tipe: "Pindah Kepemilikan",
  },
  {
    id: "2",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK02",
    namaPT: "PT Gadai Top Premium",
    adminPrimary: "Agung Prasetyo",
    namaToko: "GT Jakarta Dua",
    alias: "GT Dua",
    noTelpToko: "081234567891012",
    kota: "Jakarta Selatan",
    tipe: "Pinjam PT",
  },
]

// Column definitions for Toko Utama and Toko Pinjaman
const tokoColumns: ColumnDef<Toko>[] = [
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
        <AvatarImage src={row.getValue("foto")} alt="Toko photo" />
        <AvatarFallback>IMG</AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "kodeLokasi",
    header: "Kode Lokasi",
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
    accessorKey: "alias",
    header: "Alias",
  },
  {
    accessorKey: "noTelpToko",
    header: "No. Telp Toko",
  },
  {
    accessorKey: "kota",
    header: "Kota",
  },
]

// Column definitions for Request
const requestColumns: ColumnDef<RequestToko>[] = [
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
        <AvatarImage src={row.getValue("foto")} alt="Toko photo" />
        <AvatarFallback>IMG</AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "kodeLokasi",
    header: "Kode Lokasi",
  },
  {
    accessorKey: "namaPT",
    header: "Nama PT",
  },
  {
    accessorKey: "adminPrimary",
    header: "Admin Primary",
  },
  {
    accessorKey: "alias",
    header: "Alias",
  },
  {
    accessorKey: "noTelpToko",
    header: "No. Telp Toko",
  },
  {
    accessorKey: "kota",
    header: "Kota",
  },
  {
    accessorKey: "tipe",
    header: "Tipe",
    cell: ({ row }) => {
      const tipe = row.getValue("tipe") as RequestToko["tipe"]
      return (
        <Badge
          variant="outline"
          className="border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400"
        >
          {tipe}
        </Badge>
      )
    },
  },
]

export default function MasterTokoPage() {
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("toko-utama")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Toko | RequestToko | null>(null)
  const requestCount = sampleRequest.length

  const handleDetail = (row: Toko | RequestToko) => {
    console.log("Detail:", row)
    // Implement detail action
  }

  const handleEdit = (row: Toko | RequestToko) => {
    console.log("Edit:", row)
    // Implement edit action
  }

  const handleDelete = (row: Toko | RequestToko) => {
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
          <h1 className="text-2xl font-bold">Master Toko</h1>
          <Breadcrumbs
            items={[{ label: "Pages", href: "/" }, { label: "Master Toko" }]}
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

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-4"
      >
        <TabsList className="w-fit">
          <TabsTrigger value="toko-utama">Toko Utama</TabsTrigger>
          <TabsTrigger value="toko-pinjaman">Toko Pinjaman</TabsTrigger>
          <TabsTrigger value="request" className="relative">
            Request
            {requestCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
              >
                {requestCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Toko Utama Tab */}
        <TabsContent value="toko-utama" className="mt-0">
          <DataTable
            columns={tokoColumns}
            data={sampleTokoUtama}
            title="Daftar Toko Utama"
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
        </TabsContent>

        {/* Toko Pinjaman Tab */}
        <TabsContent value="toko-pinjaman" className="mt-0">
          <DataTable
            columns={tokoColumns}
            data={sampleTokoPinjaman}
            title="Daftar Toko Pinjaman"
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
        </TabsContent>

        {/* Request Tab */}
        <TabsContent value="request" className="mt-0">
          <DataTable
            columns={requestColumns}
            data={sampleRequest}
            title="Daftar Request"
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
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        description="Anda akan menghapus data Toko dari dalam sistem."
      />
    </div>
  )
}
