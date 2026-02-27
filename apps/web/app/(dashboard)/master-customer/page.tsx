"use client"

import React, { useMemo, useState, useEffect, useCallback } from "react"
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
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { SearchIcon, Plus, Lock, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import {
  useCustomers,
  useChangeCustomerPin,
  useDeleteCustomer,
  customerKeys,
} from "@/lib/react-query/hooks/use-customers"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { GantiPinDialog } from "./[id]/_components/ganti-pin-dialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
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
  const status = c.status ?? (c.isBlacklisted ? "blacklisted" : "active")
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
    isSuperAdmin ? { pageSize: 100 } : undefined
  )

  const [selectedPT, setSelectedPT] = useState<string>("")
  const ptOptions = useMemo(() => {
    const list = companiesData?.data ?? []
    return list.map((c) => ({ value: c.uuid, label: c.companyName }))
  }, [companiesData])

  const defaultPT =
    (isSuperAdmin && ptOptions[0]?.value) ||
    (isCompanyAdmin ? effectiveCompanyId ?? null : null) ||
    ""
  const effectivePT = selectedPT || defaultPT

  const branchQueryCompanyId = isSuperAdmin ? effectivePT : effectiveCompanyId
  const needsBranchFilter = isSuperAdmin || isCompanyAdmin
  const { data: branchesData, isFetched: branchesFetched } = useBranches(
    branchQueryCompanyId
      ? { companyId: branchQueryCompanyId, pageSize: 100, status: "active" }
      : undefined,
    { enabled: !!branchQueryCompanyId }
  )

  const branchOptions = useMemo(() => {
    const list = branchesData?.data ?? []
    return list.map((b) => ({
      value: b.uuid,
      label: b.shortName ?? b.branchCode ?? b.uuid,
    }))
  }, [branchesData])

  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const validBranch =
    selectedBranch && branchOptions.some((b) => b.value === selectedBranch)
  const effectiveBranch =
    (validBranch ? selectedBranch : null) ?? branchOptions[0]?.value ?? ""

  useEffect(() => {
    setSelectedBranch("")
  }, [branchQueryCompanyId])

  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [gantiPinOpen, setGantiPinOpen] = useState(false)
  const [gantiPinCustomerId, setGantiPinCustomerId] = useState<string | null>(
    null
  )
  const [selectedRows, setSelectedRows] = useState<CustomerRow[]>([])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [resetSelectionKey, setResetSelectionKey] = useState(0)
  const queryClient = useQueryClient()

  const listOptions = useMemo(() => {
    const filter: Record<string, string> = {}
    if (branchQueryCompanyId) filter.ptId = branchQueryCompanyId
    if (effectiveBranch) filter.branchId = effectiveBranch
    if (searchValue?.trim()) filter.search = searchValue.trim()
    return { page: 1, pageSize, filter }
  }, [branchQueryCompanyId, effectiveBranch, searchValue, pageSize])

  const customersReady =
    !needsBranchFilter || (!!branchQueryCompanyId && branchesFetched)
  const { data, isLoading, isError } = useCustomers(listOptions, {
    enabled: customersReady,
  })
  const changePinMutation = useChangeCustomerPin()
  const deleteCustomerMutation = useDeleteCustomer()

  const rows = useMemo(
    () => (data?.data ?? []).map(mapApiCustomerToRow),
    [data]
  )

  const handleDetail = useCallback(
    (row: CustomerRow) => {
      router.push(`/master-customer/${row.id}`)
    },
    [router]
  )

  const handleGantiPin = useCallback((row: CustomerRow) => {
    setGantiPinCustomerId(row.id)
    setGantiPinOpen(true)
  }, [])

  const handleGantiPinConfirm = useCallback(
    async (pinBaru: string) => {
      if (!gantiPinCustomerId) return
      try {
        await changePinMutation.mutateAsync({
          id: gantiPinCustomerId,
          data: { newPin: pinBaru },
        })
        toast.success("PIN berhasil diubah")
        queryClient.invalidateQueries({
          queryKey: customerKeys.detail(gantiPinCustomerId),
        })
        queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
        setGantiPinOpen(false)
        setGantiPinCustomerId(null)
      } catch {
        toast.error("Gagal mengubah PIN. Periksa kembali data dan coba lagi.")
      }
    },
    [
      gantiPinCustomerId,
      changePinMutation,
      queryClient,
    ]
  )

  const handleTambahData = useCallback(() => {
    router.push("/master-customer/tambah")
  }, [router])

  const handleGantiPinOpenChange = useCallback((open: boolean) => {
    setGantiPinOpen(open)
    if (!open) setGantiPinCustomerId(null)
  }, [])

  const handleBulkDelete = useCallback(() => {
    setIsBulkDeleteDialogOpen(true)
  }, [])

  const handleConfirmBulkDelete = useCallback(async () => {
    try {
      await Promise.all(
        selectedRows.map((row) => deleteCustomerMutation.mutateAsync(row.id))
      )
      toast.success(`${selectedRows.length} Customer berhasil dihapus`)
      setIsBulkDeleteDialogOpen(false)
      setSelectedRows([])
      setResetSelectionKey((k) => k + 1)
    } catch {
      toast.error("Gagal menghapus Customer")
    }
  }, [selectedRows, deleteCustomerMutation])

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

      {!customersReady || isLoading ? (
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
              {isSuperAdmin && ptOptions.length > 0 && (
                <Select value={effectivePT} onValueChange={setSelectedPT}>
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
              {(isSuperAdmin || isCompanyAdmin) && branchOptions.length > 0 && (
                <Select
                  value={effectiveBranch}
                  onValueChange={setSelectedBranch}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Pilih Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchOptions.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedRows.length > 0 && (
                <span className="text-destructive font-semibold">
                  &middot; {selectedRows.length} Selected
                </span>
              )}
            </div>
          }
          searchPlaceholder="Search"
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
                  placeholder="Search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  icon={<SearchIcon className="size-4" />}
                  className="w-full"
                />
              </div>
              {selectedRows.length > 0 && (
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="size-4" />
                  Hapus
                </Button>
              )}
            </div>
          }
          initialPageSize={pageSize}
          onPageSizeChange={setPageSize}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onDetail={handleDetail}
          customActions={[
            {
              label: "Ganti PIN",
              icon: <Lock className="mr-2 size-4" />,
              onClick: handleGantiPin,
            },
          ]}
          onSelectionChange={setSelectedRows}
          resetSelectionKey={resetSelectionKey}
        />
      )}

      <GantiPinDialog
        open={gantiPinOpen}
        onOpenChange={handleGantiPinOpenChange}
        onConfirm={handleGantiPinConfirm}
        isSubmitting={changePinMutation.isPending}
      />

      {/* Confirmation Dialog for Bulk Delete */}
      <ConfirmationDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Customer"
        description={`Anda akan menghapus ${selectedRows.length} data Customer dari dalam sistem.`}
        confirmLabel="Hapus"
        variant="destructive"
      />
    </div>
  )
}
