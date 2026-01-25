"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@/components/data-table"
import { PlusIcon } from "lucide-react"
import { useSuperAdmins, useDeleteSuperAdmin } from "@/lib/react-query/hooks"
import type { User } from "@/lib/api/types"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { toast } from "sonner"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card"

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
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function SuperAdminPage() {
  const router = useRouter()
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
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
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.uuid, {
        onSuccess: () => {
          toast.success("Super Admin berhasil dihapus")
          setIsConfirmDialogOpen(false)
          setSelectedUser(null)
        },
        onError: (error) => {
          toast.error(error.message || "Gagal menghapus Super Admin")
        },
      })
    }
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

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-destructive">Gagal memuat data Super Admin</p>
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            title="Daftar Super Admin"
            searchPlaceholder="Cari Super Admin..."
            onDetail={handleDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        description="Anda akan menghapus data Super Admin dari dalam sistem."
      />
    </>
  )
}
