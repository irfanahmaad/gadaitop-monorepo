"use client"

import React, { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@/components/data-table"
import { Plus } from "lucide-react"
import { TipeBarangFormDialog } from "./_components/TipeBarangFormDialog"

// Sample data type
type TipeBarang = {
  id: string
  code: string
  name: string
  createdAt: string
}

// Helper function to generate sample data
const generateSampleData = (): TipeBarang[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `B${String(i + 1).padStart(3, "0")}`,
    code: `B${String(i + 1).padStart(3, "0")}`,
    name:
      [
        "Handphone",
        "Sepeda Motor",
        "Drone",
        "Komputer",
        "Kamera",
        "Aksesoris Motor",
        "Handphone Apple",
        "Aksesoris Komputer",
        "TV",
        "Speaker",
      ][i] ?? `Tipe Barang ${i + 1}`,
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleString(
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
}

// Column definitions
const columns: ColumnDef<TipeBarang>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return index + 1
    },
  },
  {
    id: "code",
    accessorKey: "code",
    header: "Kode Tipe Barang",
  },
  {
    accessorKey: "name",
    header: "Nama Tipe Barang",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
]

export default function TipeBarangListPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TipeBarang | null>(null)
  const [sampleData, setSampleData] = useState<TipeBarang[]>([])

  // Generate sample data only on client to avoid hydration mismatch
  useEffect(() => {
    setSampleData(generateSampleData())
  }, [])

  const handleEdit = (row: TipeBarang) => {
    setEditingItem(row)
    setIsDialogOpen(true)
  }

  const handleDelete = (row: TipeBarang) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      console.log("Delete:", row)
      // Implement delete action
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Master Tipe Barang</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Master Tipe Barang" },
              ]}
            />
          </div>

          <div>
            <Button onClick={handleCreate}>
              <Plus className="size-5" />
              Tambah Data
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={sampleData}
          title="Daftar Tipe Barang"
          searchPlaceholder="Search"
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Dialog for both Add and Edit */}
      <TipeBarangFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={handleDialogClose}
        initialData={editingItem}
      />
    </>
  )
}
