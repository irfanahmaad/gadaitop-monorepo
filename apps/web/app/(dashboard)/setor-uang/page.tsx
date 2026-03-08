"use client"

import React, { useMemo, useState, useEffect, useCallback } from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  Plus,
  SearchIcon,
  SlidersHorizontal,
  Check,
  Ban,
  MoreHorizontal,
  Eye,
  Printer,
  XCircle,
  Pencil,
} from "lucide-react"
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { CreateSetorUangDialog } from "./_components/create-setor-uang-dialog"
import { DetailSetorUangDialog } from "./_components/detail-setor-uang-dialog"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import {
  useCashDeposits,
  useCreateCashDeposit,
} from "@/lib/react-query/hooks/use-cash-deposits"
import { useBranch, useBranches } from "@/lib/react-query/hooks/use-branches"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import type { CashDeposit } from "@/lib/api/types"
import type { FilterConfig } from "@/hooks/use-filter-params"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"
import type { SetorUang } from "./types"

function mapCashDepositStatus(
  status: CashDeposit["status"],
  rejectionReason?: string
): SetorUang["status"] {
  if (status === "pending") return "Pending"
  if (status === "approved" || status === "confirmed") return "Lunas"
  if (status === "expired") return "Expired"
  if (status === "rejected") {
    const reason = rejectionReason?.trim() ?? ""
    return reason.startsWith("[system:") ? "Expired" : "Failed"
  }
  return "Pending"
}

function mapCashDepositToSetorUang(c: CashDeposit): SetorUang {
  const store = c.store as
    | { shortName?: string; branchCode?: string; fullName?: string }
    | undefined
  const createdBy = c.createdBy as
    | { fullName?: string; name?: string; email?: string; imageUrl?: string }
    | undefined
  const name =
    createdBy?.fullName ?? createdBy?.name ?? createdBy?.email ?? "-"
  return {
    id: c.uuid,
    uuid: c.uuid,
    tanggal: c.createdAt,
    dilakukanOleh: {
      name,
      avatar: createdBy?.imageUrl,
    },
    namaToko:
      store?.fullName ?? store?.shortName ?? store?.branchCode ?? c.storeId,
    nominal: c.amount,
    vaNumber: c.vaNumber ?? "-",
    batasWaktu: c.expiresAt ?? "-",
    status: mapCashDepositStatus(c.status, c.rejectionReason),
    proofUrl: c.proofUrl,
    rejectionReason: c.rejectionReason,
  }
}

const StatusBadge = ({ status }: { status: SetorUang["status"] }) => {
  const statusConfig = {
    Pending: {
      label: "Pending",
      className:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    Lunas: {
      label: "Lunas",
      className:
        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    Failed: {
      label: "Failed",
      className:
        "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-0",
    },
    Expired: {
      label: "Expired",
      className:
        "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0",
    },
  }

  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={cn(config?.className)}>
      {config?.label ?? ""}
    </Badge>
  )
}

const getBaseColumns = (): {
  id: string
  header: string
  accessorKey?: string
  cell?: (props: {
    row: {
      getValue: (key: string) => unknown
      index: number
      original: SetorUang
    }
  }) => React.ReactNode
  enableSorting?: boolean
}[] => [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>,
    enableSorting: false,
  },
  {
    id: "tanggal",
    accessorKey: "tanggal",
    header: "Tanggal",
  },
  {
    id: "dilakukanOleh",
    accessorKey: "dilakukanOleh",
    header: "Dilakukan Oleh",
    cell: ({ row }) => {
      const user = row.getValue("dilakukanOleh") as SetorUang["dilakukanOleh"] | undefined
      const name = user?.name ?? "-"
      const initials = name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "-"
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{name}</span>
        </div>
      )
    },
  },
  {
    id: "namaToko",
    accessorKey: "namaToko",
    header: "Toko",
  },
  {
    id: "nominal",
    accessorKey: "nominal",
    header: "Nominal",
    cell: ({ row }) => {
      const nominal = row.getValue("nominal") as number
      return <span className="text-sm">Rp{formatCurrencyDisplay(nominal)}</span>
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.getValue("status") as SetorUang["status"]} />
    ),
  },
]

const getActionColumn = (
  onDetail: (row: SetorUang) => void,
  onEdit: (row: SetorUang) => void,
  showEdit: boolean
) => ({
  id: "actions",
  enableHiding: false as const,
  cell: ({ row }: { row: { original: SetorUang } }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Action</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDetail(row.original)}>
          <Eye className="mr-2 h-4 w-4" />
          Detail
        </DropdownMenuItem>
        {showEdit && (
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  ),
})

export default function SetorUangPage() {
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

  const isBranchStaff =
    user?.roles?.some((r) => r.code === "branch_staff") ?? false
  const { data: branchStaffBranch } = useBranch(
    isBranchStaff && user?.branchId ? user.branchId : ""
  )

  const defaultPT =
    (isSuperAdmin && ptOptions[0]?.value) ||
    effectiveCompanyId ||
    (branchStaffBranch?.companyId ?? "") ||
    ""
  const effectivePT = selectedPT || defaultPT

  const branchQueryCompanyId = isSuperAdmin ? effectivePT : effectiveCompanyId
  const { data: branchesData } = useBranches(
    branchQueryCompanyId
      ? { companyId: branchQueryCompanyId, pageSize: 100 }
      : undefined,
    { enabled: !!branchQueryCompanyId }
  )

  const branchOptions = useMemo(() => {
    if (isBranchStaff && branchStaffBranch) {
      return [
        {
          value: branchStaffBranch.uuid,
          label:
            branchStaffBranch.shortName ??
            branchStaffBranch.branchCode ??
            branchStaffBranch.uuid,
        },
      ]
    }
    const list = branchesData?.data ?? []
    return list.map((b) => ({
      value: b.uuid,
      label: b.shortName ?? b.branchCode ?? b.uuid,
    }))
  }, [branchesData, isBranchStaff, branchStaffBranch])

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailRow, setDetailRow] = useState<SetorUang | null>(null)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({})

  const setorUangFilterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "dateRange",
        label: "Tanggal",
        type: "daterange",
        labelFrom: "Tanggal Mulai",
        labelTo: "Sampai Dengan",
      },
      {
        key: "storeId",
        label: "Toko",
        type: "multiselect",
        placeholder: "Pilih toko...",
        options: branchOptions.map((b) => ({ label: b.label, value: b.value })),
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        placeholder: "Semua",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Lunas", value: "approved" },
          { label: "Failed", value: "rejected" },
          { label: "Expired", value: "expired" },
        ],
      },
    ],
    [branchOptions]
  )

  const listOptions = useMemo(() => {
    const filter: Record<string, string | number> = {}
    const fv = filterValues
    const storeIds = fv.storeId as string[] | undefined
    const firstStoreId = storeIds?.[0]
    if (typeof firstStoreId === "string") {
      filter.storeId = firstStoreId
    }
    const status = fv.status as string | undefined
    if (status) filter.status = status
    const dateRange = fv.dateRange as { from?: string; to?: string } | undefined
    const dateFrom = dateRange?.from
    const dateTo = dateRange?.to
    if (dateFrom) filter.dateFrom = dateFrom
    if (dateTo) filter.dateTo = dateTo
    return { page: 1, pageSize, filter }
  }, [pageSize, filterValues])

  const { data, isLoading, isError } = useCashDeposits(listOptions)
  const createMutation = useCreateCashDeposit()

  const rows = useMemo(
    () => (data?.data ?? []).map(mapCashDepositToSetorUang),
    [data]
  )

  const handleCreate = useCallback(() => {
    setCreateDialogOpen(true)
  }, [])

  const handleCreateConfirm = useCallback(
    async (data: { storeId: string; amount: number; notes?: string }) => {
      try {
        await createMutation.mutateAsync({
          storeId: data.storeId,
          ptId: effectivePT || undefined,
          amount: data.amount,
          paymentMethod: "bank_transfer",
          notes: data.notes,
        })
        toast.success("Permintaan setoran berhasil dibuat")
        setCreateDialogOpen(false)
      } catch {
        toast.error("Gagal membuat request")
        throw new Error("Create failed")
      }
    },
    [createMutation, effectivePT]
  )

  const handleDetail = useCallback((row: SetorUang) => {
    setDetailRow(row)
    setDetailDialogOpen(true)
  }, [])

  const handleEdit = useCallback((row: SetorUang) => {
    // For now, open detail dialog - can be extended to a proper edit dialog
    setDetailRow(row)
    setDetailDialogOpen(true)
  }, [])

  const columns = useMemo(() => {
    const showEdit = !isCompanyAdmin
    const actionColumn = getActionColumn(handleDetail, handleEdit, showEdit)
    return [...getBaseColumns(), actionColumn]
  }, [handleDetail, handleEdit, isCompanyAdmin])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Setor Uang</h1>
          <Breadcrumbs
            items={[{ label: "Pages", href: "/" }, { label: "Setor Uang" }]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <Button onClick={handleCreate} variant="destructive">
            <Plus className="size-5" />
            Tambah Data
          </Button>
        </div>
      </div>

      {isLoading ? (
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
      ) : isError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Gagal memuat data Setor Uang</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          title="Daftar Permintaan Setor Uang"
          searchPlaceholder="Cari berdasarkan toko, VA, atau nominal"
          filterConfig={setorUangFilterConfig}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
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
            </div>
          }
          initialPageSize={pageSize}
          onPageSizeChange={setPageSize}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />
      )}

      <CreateSetorUangDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onConfirm={handleCreateConfirm}
        isSubmitting={createMutation.isPending}
        branchOptions={branchOptions}
        selectedBranch={effectiveBranch}
      />

      <DetailSetorUangDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        row={detailRow}
      />
    </div>
  )
}
