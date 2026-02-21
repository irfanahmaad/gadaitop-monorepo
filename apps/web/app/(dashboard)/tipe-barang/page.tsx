"use client"

import React, { useState, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@/components/data-table"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card"
import { Plus } from "lucide-react"
import { TipeBarangFormDialog } from "./_components/TipeBarangFormDialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useItemTypes, useDeleteItemType } from "@/lib/react-query/hooks"
import type { ItemType } from "@/lib/api/types"

// Format date helper
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// Column definitions
const columns: ColumnDef<ItemType>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return index + 1
    },
  },
  {
    id: "typeCode",
    accessorKey: "typeCode",
    header: "Kode Tipe Barang",
  },
  {
    accessorKey: "typeName",
    header: "Nama Tipe Barang",
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
]

// Loading skeleton component
function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-64" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function TipeBarangListPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ItemType | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ItemType | null>(null)

  // Fetch item types from API
  const { data: itemTypesResponse, isLoading, isError } = useItemTypes()
  const deleteItemType = useDeleteItemType()

  const itemTypes = itemTypesResponse?.data ?? []

  const handleEdit = useCallback((row: ItemType) => {
    setEditingItem(row)
    setIsDialogOpen(true)
  }, [])

  const handleDelete = useCallback((row: ItemType) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (itemToDelete) {
      deleteItemType.mutate(itemToDelete.uuid, {
        onSuccess: () => {
          toast.success("Tipe Barang berhasil dihapus")
          setIsConfirmDialogOpen(false)
          setItemToDelete(null)
        },
        onError: (error) => {
          toast.error(error.message || "Gagal menghapus Tipe Barang")
        },
      })
    }
  }, [itemToDelete, deleteItemType])

  const handleCreate = useCallback(() => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }, [])

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false)
    setEditingItem(null)
  }, [])

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

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-destructive">Gagal memuat data Tipe Barang</p>
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={itemTypes}
            title="Daftar Tipe Barang"
            searchPlaceholder="Search"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Dialog for both Add and Edit */}
      <TipeBarangFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={handleDialogClose}
        initialData={editingItem}
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        description="Anda akan menghapus data Tipe Barang dari dalam sistem."
      />
    </>
  )
}
