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
import { SearchIcon, SlidersHorizontal, Plus, UserIcon } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { toast } from "sonner"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import type { User } from "@/lib/api/types"
import { useFilterParams } from "@/hooks/use-filter-params"
import type { FilterConfig } from "@/hooks/use-filter-params"
import {
  dummyRoles,
  getUsers,
  deleteUser as deleteUserFromStore,
} from "./dummy-data"

// Filter configuration
const filterConfig: FilterConfig[] = [
  {
    key: "role",
    label: "Role",
    type: "multiselect",
    placeholder: "Pilih Role...",
  },
]

// Role badge configuration
const getRoleBadgeConfig = (role: { code: string; name: string }) => {
  const configs: Record<string, { label: string; className: string }> = {
    owner: {
      label: "Admin PT",
      className:
        "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
    },
    "staf-toko": {
      label: "Staf Toko",
      className:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    },
    "stock-opname": {
      label: "Stock Opname",
      className:
        "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400",
    },
    lelang: {
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
      // Get initials from full name
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
          <AvatarImage src="" alt={user.fullName} />
          <AvatarFallback>
            {user.fullName ? (
              getInitials(user.fullName)
            ) : (
              <UserIcon className="size-5" />
            )}
          </AvatarFallback>
        </Avatar>
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
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [users, setUsers] = useState<User[]>(getUsers())
  const [isLoading] = useState(false)

  // Refresh users when component mounts or when navigating back
  useEffect(() => {
    setUsers(getUsers())
  }, [])

  // Role options for filter
  const roleOptions = React.useMemo(() => {
    return dummyRoles.map((role) => ({
      label: getRoleBadgeConfig(role).label,
      value: role.code,
    }))
  }, [])

  // Update filter config with role options
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

  // Filter state management via URL params
  const { filterValues, setFilters } = useFilterParams(filterConfigWithOptions)

  // Get selected roles from filter values
  const selectedRoles = React.useMemo(() => {
    const roleValue = filterValues.role
    return Array.isArray(roleValue) ? roleValue : []
  }, [filterValues.role])

  // Filter users by search and role
  const filteredUsers = React.useMemo(() => {
    let result = [...users]

    // Filter by search (email)
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      result = result.filter((user) =>
        user.email.toLowerCase().includes(searchLower)
      )
    }

    // Filter by role
    if (selectedRoles.length > 0) {
      result = result.filter((user) => {
        const userRoleCodes = user.roles?.map((r) => r.code) || []
        return selectedRoles.some((roleCode) =>
          userRoleCodes.includes(roleCode)
        )
      })
    }

    return result
  }, [users, searchValue, selectedRoles])

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

  const handleConfirmDelete = () => {
    if (selectedUser) {
      // Remove user from dummy store
      deleteUserFromStore(selectedUser.uuid)
      // Update local state
      setUsers(getUsers())
      toast.success("Pengguna berhasil dihapus")
      setIsConfirmDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleTambahData = () => {
    router.push("/master-pengguna/tambah")
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

          {/* Tambah Data Button */}
          <Button
            onClick={handleTambahData}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Data
          </Button>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers}
            title="Daftar Pengguna"
            searchPlaceholder="Search"
            filterConfig={filterConfigWithOptions}
            filterValues={filterValues}
            onFilterChange={setFilters}
            filterDialogOpen={filterDialogOpen}
            onFilterDialogOpenChange={setFilterDialogOpen}
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
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setFilterDialogOpen(true)}
                >
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
      </div>

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        description="Anda akan menghapus data Pengguna dari dalam sistem."
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
