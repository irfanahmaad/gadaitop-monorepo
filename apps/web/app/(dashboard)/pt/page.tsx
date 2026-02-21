"use client"

import React, { useState, useCallback } from "react"
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
import { Building2, Plus } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useCompanies, useDeleteCompany } from "@/lib/react-query/hooks"
import type { Company } from "@/lib/api/types"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card"

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
    cell: ({ row }) => row.original?.phoneNumber || "-",
  },
  {
    id: "adminPrimary",
    header: "Admin Primary",
    cell: ({ row }) => row.original.owner?.fullName || "-",
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
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PTListPage() {
  const router = useRouter()
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // Fetch companies
  const { data, isLoading, isError } = useCompanies()
  const deleteMutation = useDeleteCompany()

  const handleDetail = useCallback(
    (row: Company) => {
      router.push(`/pt/${row.uuid}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (row: Company) => {
      router.push(`/pt/${row.uuid}/edit`)
    },
    [router]
  )

  const handleDelete = useCallback((row: Company) => {
    setSelectedCompany(row)
    setIsConfirmDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (selectedCompany) {
      deleteMutation.mutate(selectedCompany.uuid, {
        onSuccess: () => {
          toast.success("PT berhasil dihapus")
          setIsConfirmDialogOpen(false)
          setSelectedCompany(null)
        },
        onError: (error) => {
          toast.error(error.message || "Gagal menghapus PT")
        },
      })
    }
  }, [selectedCompany, deleteMutation])

  const handleCreate = useCallback(() => {
    router.push("/pt/create")
  }, [router])

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

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-destructive">Gagal memuat data PT</p>
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            title="Daftar PT"
            searchPlaceholder="Search"
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
        description="Anda akan menghapus data PT dari dalam sistem."
      />
    </>
  )
}
