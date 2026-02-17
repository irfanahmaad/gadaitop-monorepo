"use client"

import React, { useMemo, useState, useEffect } from "react"
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
import { Input } from "@workspace/ui/components/input"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  Card,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { SearchIcon, SlidersHorizontal, Plus } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import {
  useCustomers,
  useDeleteCustomer,
} from "@/lib/react-query/hooks/use-customers"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import type { Customer as ApiCustomer } from "@/lib/api/types"

type CustomerRow = {
  id: string
  foto: string
  namaLengkap: string
  email: string
  noTelp: string
  alamat: string
  status: "Aktif" | "Tidak Aktif"
}

const STATUS_MAP: Record<string, CustomerRow["status"]> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
  blacklisted: "Tidak Aktif",
}

function mapApiCustomerToRow(c: ApiCustomer): CustomerRow {
  const status =
    c.status ??
    (c.isBlacklisted ? "blacklisted" : "active")
  return {
    id: c.uuid,
    foto: c.ktpPhotoUrl ?? c.selfiePhotoUrl ?? "",
    namaLengkap: c.name ?? c.fullName ?? "",
    email: c.email ?? "",
    noTelp: c.phone ?? c.phoneNumber ?? "",
    alamat: [c.address, c.city].filter(Boolean).join(", ") ?? "",
    status: STATUS_MAP[status] ?? "Aktif",
  }
}

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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Column definitions for Customer
const customerColumns: ColumnDef<CustomerRow>[] = [
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
      const status = row.getValue("status") as CustomerRow["status"]
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
  const router = useRouter()
  const { user } = useAuth()
  const isCompanyAdmin =
    user?.roles?.some((r) => r.code === "company_admin") ?? false
  const isSuperAdmin = user?.roles?.some((r) => r.code === "owner") ?? false

  const effectiveCompanyId = isCompanyAdmin ? (user?.companyId ?? null) : null

  const { data: companiesData } = useCompanies(
    isSuperAdmin || isCompanyAdmin ? { pageSize: 100 } : undefined
  )

  const [selectedPT, setSelectedPT] = useState<string>("")
  const ptOptions = useMemo(() => {
    const list = companiesData?.data ?? []
    const mapped = list.map((c) => ({ value: c.uuid, label: c.companyName }))
    if (isCompanyAdmin && effectiveCompanyId) {
      return mapped.filter((o) => o.value === effectiveCompanyId)
    }
    return mapped
  }, [companiesData, isCompanyAdmin, effectiveCompanyId])

  useEffect(() => {
    if (isSuperAdmin && ptOptions.length > 0 && !selectedPT) {
      setSelectedPT(ptOptions[0]!.value)
    }
  }, [isSuperAdmin, ptOptions, selectedPT])

  useEffect(() => {
    if (isCompanyAdmin && effectiveCompanyId && !selectedPT) {
      setSelectedPT(effectiveCompanyId)
    }
  }, [isCompanyAdmin, effectiveCompanyId, selectedPT])

  const branchQueryCompanyId = isSuperAdmin ? selectedPT : effectiveCompanyId

  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<CustomerRow | null>(null)

  const listOptions = useMemo(() => {
    const filter: Record<string, string> = {}
    if (branchQueryCompanyId) filter.ptId = branchQueryCompanyId
    if (searchValue?.trim()) filter.search = searchValue.trim()
    return { page: 1, pageSize: 200, filter }
  }, [branchQueryCompanyId, searchValue])

  const { data, isLoading, isError } = useCustomers(listOptions)
  const deleteCustomerMutation = useDeleteCustomer()

  const rows = useMemo(
    () => (data?.data ?? []).map(mapApiCustomerToRow),
    [data]
  )

  const handleDetail = (row: CustomerRow) => {
    router.push(`/master-customer/${row.id}`)
  }

  const handleEdit = (row: CustomerRow) => {
    router.push(`/master-customer/${row.id}/edit`)
  }

  const handleDelete = (row: CustomerRow) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteCustomerMutation.mutateAsync(itemToDelete.id)
        setIsConfirmDialogOpen(false)
        setItemToDelete(null)
      } catch {
        // Error handled by mutation
      }
    }
  }

  const handleTambahData = () => {
    router.push("/master-customer/tambah")
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

        <div className="flex flex-wrap items-center gap-2">
          {!isCompanyAdmin && (
            <Button
              onClick={handleTambahData}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Gagal memuat data Customer</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={customerColumns}
          data={rows}
          headerLeft={
            <div className="flex flex-wrap items-center gap-4">
              {(isSuperAdmin || isCompanyAdmin) && ptOptions.length > 0 && (
                <Select value={selectedPT} onValueChange={setSelectedPT}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Pilih PT" />
                  </SelectTrigger>
                  <SelectContent>
                    {ptOptions.map((pt) => (
                      <SelectItem key={pt.value} value={pt.value}>
                        {pt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          }
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
      )}

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
