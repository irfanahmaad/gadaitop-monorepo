"use client"

import React, { useState, Suspense, useEffect } from "react"
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
  SearchIcon,
  SlidersHorizontal,
  Plus,
  Trash2,
  UserIcon,
} from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { toast } from "sonner"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { User } from "@/lib/api/types"
import { useFilterParams } from "@/hooks/use-filter-params"
import type { FilterConfig } from "@/hooks/use-filter-params"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { useUsers, useDeleteUser } from "@/lib/react-query/hooks/use-users"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useRoles } from "@/lib/react-query/hooks/use-roles"
import { usePublicUrl } from "@/lib/react-query/hooks/use-upload"

function UserImageCell({ imageKey, fullName }: { imageKey: string; fullName: string }) {
  const { data: publicUrlData } = usePublicUrl(imageKey)
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src={imageKey ? publicUrlData?.url : undefined} alt={fullName} />
      <AvatarFallback>
        {fullName ? getInitials(fullName) : <UserIcon className="size-5" />}
      </AvatarFallback>
    </Avatar>
  )
}

// Filter configuration
const filterConfig: FilterConfig[] = [
  {
    key: "role",
    label: "Role",
    type: "multiselect",
    placeholder: "Pilih Role...",
  },
]

// Role badge configuration (matches API role codes from role.seed)
const getRoleBadgeConfig = (role: { code: string; name: string }) => {
  const configs: Record<string, { label: string; className: string }> = {
    owner: {
      label: "Super Admin",
      className:
        "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
    },
    company_admin: {
      label: "Admin PT",
      className:
        "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
    },
    branch_staff: {
      label: "Staf Cabang",
      className:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    },
    stock_auditor: {
      label: "Stock Opname",
      className:
        "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400",
    },
    auction_staff: {
      label: "Lelang",
      className:
        "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400",
    },
    marketing: {
      label: "Marketing",
      className:
        "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    },
  }

  return (
    configs[role.code] || {
      label: role.name,
      className:
        "border-gray-500/20 bg-gray-500/10 text-gray-700 dark:text-gray-400",
    }
  )
}

// Column definitions
const columns: ColumnDef<User>[] = [
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
    id: "foto",
    header: "Foto",
    cell: ({ row }) => {
      const user = row.original
      return (
        <UserImageCell
          imageKey={user.imageUrl ?? ""}
          fullName={user.fullName ?? ""}
        />
      )
    },
  },
  {
    accessorKey: "fullName",
    header: "Nama Lengkap",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "phoneNumber",
    header: "No. Telp",
    cell: ({ row }) => row.getValue("phoneNumber") || "-",
  },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original
      const roles = user.roles || []

      if (roles.length === 0) {
        return <span className="text-muted-foreground text-sm">-</span>
      }

      // Display all roles
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => {
            const config = getRoleBadgeConfig(role)
            return (
              <Badge
                key={role.uuid}
                variant="outline"
                className={config.className}
              >
                {config.label}
              </Badge>
            )
          })}
        </div>
      )
    },
  },
]

// Loading skeleton component
function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MasterPenggunaPageContent() {
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
  const ptOptions = React.useMemo(() => {
    const list = companiesData?.data ?? []
    return list.map((c) => ({ value: c.uuid, label: c.companyName }))
  }, [companiesData])

  useEffect(() => {
    if (isSuperAdmin && ptOptions.length > 0 && !selectedPT) {
      setSelectedPT(ptOptions[0]!.value)
    }
  }, [isSuperAdmin, ptOptions, selectedPT])

  const companyFilterId = isSuperAdmin ? selectedPT : effectiveCompanyId

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchValue(searchValue), 500)
    return () => clearTimeout(t)
  }, [searchValue])

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<User[]>([])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [resetSelectionKey, setResetSelectionKey] = useState(0)

  const { data: rolesData } = useRoles({ pageSize: 100 })
  const roleOptions = React.useMemo(() => {
    const list = rolesData?.data ?? []
    return list.map((role) => ({
      label: getRoleBadgeConfig(role).label,
      value: role.code,
    }))
  }, [rolesData])

  const filterConfigWithOptions: FilterConfig[] = React.useMemo(() => {
    const baseConfig = filterConfig[0]
    if (!baseConfig) return []
    return [
      {
        key: baseConfig.key,
        label: baseConfig.label,
        type: baseConfig.type,
        placeholder: baseConfig.placeholder,
        options: roleOptions,
      },
    ]
  }, [roleOptions])

  const { filterValues, setFilters } = useFilterParams(filterConfigWithOptions)

  const selectedRoles = React.useMemo(() => {
    const roleValue = filterValues.role
    return Array.isArray(roleValue) ? roleValue : []
  }, [filterValues.role])

  const listOptions = React.useMemo(() => {
    const filter: Record<string, string> = {}
    if (companyFilterId) filter.companyId = companyFilterId
    if (selectedRoles.length > 0) filter.roleCode = selectedRoles[0] as string
    if (debouncedSearchValue.trim()) filter.search = debouncedSearchValue.trim()
    return { page, pageSize, filter }
  }, [page, pageSize, companyFilterId, selectedRoles, debouncedSearchValue])

  const { data, isLoading, isError } = useUsers(listOptions)
  const deleteUserMutation = useDeleteUser()

  const usersFromApi = data?.data ?? []

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearchValue, companyFilterId, selectedRoles])

  const handleDetail = (row: User) => {
    router.push(`/master-pengguna/${row.uuid}`)
  }

  const handleEdit = (row: User) => {
    router.push(`/master-pengguna/${row.uuid}/edit`)
  }

  const handleDelete = (row: User) => {
    setSelectedUser(row)
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUserMutation.mutateAsync(selectedUser.uuid)
        toast.success("Pengguna berhasil dihapus")
        setIsConfirmDialogOpen(false)
        setSelectedUser(null)
      } catch {
        toast.error("Gagal menghapus pengguna")
      }
    }
  }

  const handleTambahData = () => {
    router.push("/master-pengguna/tambah")
  }

  const handleBulkDelete = () => {
    setIsBulkDeleteDialogOpen(true)
  }

  const handleConfirmBulkDelete = async () => {
    try {
      await Promise.all(
        selectedRows.map((row) => deleteUserMutation.mutateAsync(row.uuid))
      )
      toast.success(`${selectedRows.length} Pengguna berhasil dihapus`)
      setIsBulkDeleteDialogOpen(false)
      setSelectedRows([])
      setResetSelectionKey((k) => k + 1)
    } catch {
      toast.error("Gagal menghapus Pengguna")
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Master Pengguna</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Master Pengguna" },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isSuperAdmin && ptOptions.length > 0 && (
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

            <Button
              onClick={handleTambahData}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-destructive">Gagal memuat data Pengguna</p>
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={usersFromApi}
            searchPlaceholder="Cari..."
            filterConfig={filterConfigWithOptions}
            filterValues={filterValues}
            onFilterChange={setFilters}
            filterDialogOpen={filterDialogOpen}
            onFilterDialogOpenChange={setFilterDialogOpen}
            headerLeft={
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">Daftar Pengguna</CardTitle>
                {selectedRows.length > 0 && (
                  <span className="text-destructive font-semibold">
                    &middot; {selectedRows.length} Selected
                  </span>
                )}
              </div>
            }
            headerRight={
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value))
                    setPage(1)
                  }}
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
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setFilterDialogOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </Button>
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
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelectionChange={setSelectedRows}
            resetSelectionKey={resetSelectionKey}
            serverSidePagination={{
              totalRowCount: data?.meta?.count ?? 0,
              pageIndex: page - 1,
              onPageIndexChange: (idx) => setPage(idx + 1),
            }}
          />
        )}
      </div>

      {/* Confirmation Dialog for Single Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Pengguna"
        description="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
      />

      {/* Confirmation Dialog for Bulk Delete */}
      <ConfirmationDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Pengguna"
        description={`Anda akan menghapus ${selectedRows.length} data Pengguna dari dalam sistem.`}
        confirmLabel="Hapus"
        variant="destructive"
      />
    </>
  )
}

export default function MasterPenggunaPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <MasterPenggunaPageContent />
    </Suspense>
  )
}
