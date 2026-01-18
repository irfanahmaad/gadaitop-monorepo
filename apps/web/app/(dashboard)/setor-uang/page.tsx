"use client"

import React, { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
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
import { Plus, SearchIcon, SlidersHorizontal } from "lucide-react"
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

// Type for Setor Uang (Capital Addition Request)
type SetorUang = {
  id: string
  tanggalRequest: string
  dilakukanOleh: {
    name: string
    avatar?: string
  }
  namaToko: string
  alias: string
  nominal: number
  status: "Pending" | "Transaksi Berhasil" | "Failed" | "Disetujui"
}

// Sample data
const sampleData: SetorUang[] = [
  {
    id: "1",
    tanggalRequest: "20 November 2025 18:33:45",
    dilakukanOleh: {
      name: "Ben Affleck",
      avatar: "/placeholder-avatar.jpg",
    },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 2000000,
    status: "Pending",
  },
  {
    id: "2",
    tanggalRequest: "19 November 2025 18:33:45",
    dilakukanOleh: {
      name: "Ben Affleck",
      avatar: "/placeholder-avatar.jpg",
    },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 2000000,
    status: "Transaksi Berhasil",
  },
  {
    id: "3",
    tanggalRequest: "18 November 2025 18:33:45",
    dilakukanOleh: {
      name: "Ben Affleck",
      avatar: "/placeholder-avatar.jpg",
    },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 2000000,
    status: "Failed",
  },
  {
    id: "4",
    tanggalRequest: "17 November 2025 18:33:45",
    dilakukanOleh: {
      name: "Ben Affleck",
      avatar: "/placeholder-avatar.jpg",
    },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 2000000,
    status: "Disetujui",
  },
  {
    id: "5",
    tanggalRequest: "16 November 2025 18:33:45",
    dilakukanOleh: {
      name: "Ben Affleck",
      avatar: "/placeholder-avatar.jpg",
    },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 2000000,
    status: "Disetujui",
  },
  {
    id: "6",
    tanggalRequest: "15 November 2025 18:33:45",
    dilakukanOleh: {
      name: "Ben Affleck",
      avatar: "/placeholder-avatar.jpg",
    },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 2000000,
    status: "Disetujui",
  },
  {
    id: "7",
    tanggalRequest: "14 November 2025 18:33:45",
    dilakukanOleh: {
      name: "Ben Affleck",
      avatar: "/placeholder-avatar.jpg",
    },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 2000000,
    status: "Disetujui",
  },
]

// Status badge component
const StatusBadge = ({ status }: { status: SetorUang["status"] }) => {
  const statusConfig = {
    Pending: {
      label: "Pending",
      className:
        "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    },
    "Transaksi Berhasil": {
      label: "Transaksi Berhasil",
      className:
        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    Failed: {
      label: "Failed",
      className:
        "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
    Disetujui: {
      label: "Disetujui",
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

// Column definitions
const columns: ColumnDef<SetorUang>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "tanggalRequest",
    header: "Tanggal Request",
  },
  {
    accessorKey: "dilakukanOleh",
    header: "Dilakukan Oleh",
    cell: ({ row }) => {
      const person = row.getValue("dilakukanOleh") as SetorUang["dilakukanOleh"]
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={person.avatar} alt={person.name} />
            <AvatarFallback>
              {person.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{person.name}</span>
        </div>
      )
    },
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
    accessorKey: "nominal",
    header: "Nominal",
    cell: ({ row }) => {
      const nominal = row.getValue("nominal") as number
      return <span className="text-sm">Rp{formatCurrencyDisplay(nominal)}</span>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
]

export default function SetorUangPage() {
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<SetorUang | null>(null)

  const handleCreate = () => {
    // Implement create action
    console.log("Create new setor uang")
  }

  const handleDetail = (row: SetorUang) => {
    console.log("Detail:", row)
    // Implement detail action
  }

  const handleEdit = (row: SetorUang) => {
    console.log("Edit:", row)
    // Implement edit action
  }

  const handleDelete = (row: SetorUang) => {
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
          <h1 className="text-2xl font-bold">Setor Uang</h1>
          <Breadcrumbs
            items={[{ label: "Pages", href: "/" }, { label: "Tambah Modal" }]}
          />
        </div>

        <div>
          <Button onClick={handleCreate} variant="destructive">
            <Plus className="size-5" />
            Tambah Data
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={sampleData}
        title="Daftar Request Tambah Modal"
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

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        description="Anda akan menghapus data Setor Uang dari dalam sistem."
      />
    </div>
  )
}
