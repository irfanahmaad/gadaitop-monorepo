"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@/components/data-table"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
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
import { Building2, Plus, Loader2 } from "lucide-react"
import { useCompanies, useDeleteCompany } from "@/lib/react-query/hooks"
import type { Company } from "@/lib/api/types"

// Column definitions
const columns: ColumnDef<Company>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return index + 1
    },
  },
  {
    id: "foto",
    header: "Foto",
    cell: ({ row }) => {
      const company = row.original
      return (
        <Avatar className="size-10">
          <AvatarImage src="" alt={company.companyName} />
          <AvatarFallback>
            <Building2 className="size-5" />
          </AvatarFallback>
        </Avatar>
      )
    },
  },
  {
    id: "code",
    accessorKey: "companyCode",
    header: "Kode PT",
  },
  {
    id: "name",
    accessorKey: "companyName",
    header: "Nama PT",
  },
  {
    id: "phone",
    accessorKey: "phoneNumber",
    header: "No. Telp PT",
    cell: ({ row }) => row.original.phoneNumber || "-",
  },
  {
    id: "adminPrimary",
    header: "Admin Primary",
    cell: ({ row }) => row.original.owner?.fullName || "-",
  },
]

export default function PTListPage() {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // Fetch companies
  const { data, isLoading, isError } = useCompanies()
  const deleteMutation = useDeleteCompany()

  const handleDetail = (row: Company) => {
    router.push(`/pt/${row.uuid}`)
  }

  const handleEdit = (row: Company) => {
    router.push(`/pt/${row.uuid}/edit`)
  }

  const handleDelete = (row: Company) => {
    setSelectedCompany(row)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedCompany) return

    try {
      await deleteMutation.mutateAsync(selectedCompany.uuid)
      toast.success("PT berhasil dihapus")
      setDeleteDialogOpen(false)
      setSelectedCompany(null)
    } catch {
      toast.error("Gagal menghapus PT")
    }
  }

  const handleCreate = () => {
    router.push("/pt/create")
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
        <p className="text-muted-foreground">Gagal memuat data PT</p>
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
            <h1 className="text-2xl font-bold">Master PT</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Master PT" },
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
          data={data?.data ?? []}
          title="Daftar PT"
          searchPlaceholder="Search"
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus PT</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <strong>{selectedCompany?.companyName}</strong>? Tindakan ini tidak
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
