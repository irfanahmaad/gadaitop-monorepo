"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@/components/data-table"
import { PlusIcon, Loader2 } from "lucide-react"
import { useSuperAdmins, useDeleteSuperAdmin } from "@/lib/react-query/hooks"
import type { User } from "@/lib/api/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "sonner"

// Column definitions
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "fullName",
    header: "Nama",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "No. Telepon",
    cell: ({ row }) => row.getValue("phoneNumber") || "-",
  },
  {
    accessorKey: "activeStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("activeStatus") as string
      const isActive = status === "active"
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Dibuat",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string)
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    },
  },
]

export default function SuperAdminPage() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Fetch super admins
  const { data, isLoading, isError } = useSuperAdmins()
  const deleteMutation = useDeleteSuperAdmin()

  const handleDetail = (row: User) => {
    router.push(`/super-admin/${row.uuid}`)
  }

  const handleEdit = (row: User) => {
    router.push(`/super-admin/${row.uuid}/edit`)
  }

  const handleDelete = (row: User) => {
    setSelectedUser(row)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedUser) return

    try {
      await deleteMutation.mutateAsync(selectedUser.uuid)
      toast.success("Super Admin berhasil dihapus")
      setDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch {
      toast.error("Gagal menghapus Super Admin")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Gagal memuat data Super Admin</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Super Admin</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Master Super Admin" },
              ]}
            />
          </div>

          <div>
            <Button onClick={() => router.push("/super-admin/create")}>
              <PlusIcon className="h-4 w-4" />
              Tambah Data
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          title="Daftar Super Admin"
          searchPlaceholder="Cari Super Admin..."
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Super Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <strong>{selectedUser?.fullName}</strong>? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
