"use client"

import React, { useMemo, useState, useEffect } from "react"
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Plus,
  SearchIcon,
  SlidersHorizontal,
  Check,
  Ban,
  MoreHorizontal,
} from "lucide-react"
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { TolakSetorUangDialog } from "./_components/tolak-setor-uang-dialog"
import { CreateSetorUangDialog } from "./_components/create-setor-uang-dialog"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import {
  useCashDeposits,
  useApproveCashDeposit,
  useRejectCashDeposit,
  useCreateCashDeposit,
} from "@/lib/react-query/hooks/use-cash-deposits"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import type { CashDeposit } from "@/lib/api/types"
import { toast } from "sonner"

type SetorUang = {
  id: string
  uuid: string
  tanggalRequest: string
  dilakukanOleh: {
    name: string
    avatar?: string
  }
  namaToko: string
  alias: string
  nominal: number
  status: "Pending" | "Transaksi Berhasil" | "Failed" | "Disetujui"
}

const STATUS_MAP: Record<CashDeposit["status"], SetorUang["status"]> = {
  pending: "Pending",
  approved: "Disetujui",
  rejected: "Failed",
}

function mapCashDepositToSetorUang(c: CashDeposit): SetorUang {
  const createdBy = c.createdBy as { fullName?: string } | undefined
  const store = c.store as
    | { shortName?: string; branchCode?: string; fullName?: string }
    | undefined
  return {
    id: c.uuid,
    uuid: c.uuid,
    tanggalRequest: c.createdAt,
    dilakukanOleh: {
      name: createdBy?.fullName ?? "-",
      avatar: undefined,
    },
    namaToko:
      store?.fullName ?? store?.shortName ?? store?.branchCode ?? c.storeId,
    alias: store?.shortName ?? store?.branchCode ?? "",
    nominal: c.amount,
    status: STATUS_MAP[c.status],
  }
}

const StatusBadge = ({ status }: { status: SetorUang["status"] }) => {
  const statusConfig = {
    Pending: {
      label: "Pending",
      className:
        "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    },
    "Transaksi Berhasil": {
      label: "Transaksi Berhasil",
      className:
        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    Failed: {
      label: "Failed",
      className:
        "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
    Disetujui: {
      label: "Disetujui",
      className:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
  }

  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
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
    id: "tanggalRequest",
    accessorKey: "tanggalRequest",
    header: "Tanggal Request",
  },
  {
    id: "dilakukanOleh",
    accessorKey: "dilakukanOleh",
    header: "Dilakukan Oleh",
    cell: ({ row }) => {
      const person = row.getValue("dilakukanOleh") as SetorUang["dilakukanOleh"]
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={person.avatar} alt={person.name} />
            <AvatarFallback>
              {person.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{person.name}</span>
        </div>
      )
    },
  },
  {
    id: "namaToko",
    accessorKey: "namaToko",
    header: "Nama Toko",
  },
  {
    id: "alias",
    accessorKey: "alias",
    header: "Alias",
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
  onBayar: (row: SetorUang) => void,
  onTolak: (row: SetorUang) => void
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
        <DropdownMenuItem
          onClick={() => onBayar(row.original)}
          disabled={row.original.status !== "Pending"}
        >
          <Check className="mr-2 h-4 w-4" />
          Bayar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onTolak(row.original)}
          className="text-destructive focus:text-destructive"
          disabled={row.original.status !== "Pending"}
        >
          <Ban className="mr-2 h-4 w-4" />
          Tolak
        </DropdownMenuItem>
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

  useEffect(() => {
    if (isSuperAdmin && ptOptions.length > 0 && !selectedPT) {
      setSelectedPT(ptOptions[0]!.value)
    }
  }, [isSuperAdmin, ptOptions, selectedPT])

  const branchQueryCompanyId = isSuperAdmin ? selectedPT : effectiveCompanyId
  const { data: branchesData } = useBranches(
    branchQueryCompanyId
      ? { companyId: branchQueryCompanyId, pageSize: 100 }
      : undefined
  )

  const branchOptions = useMemo(() => {
    const list = branchesData?.data ?? []
    return list.map((b) => ({
      value: b.uuid,
      label: b.shortName ?? b.branchCode ?? b.uuid,
    }))
  }, [branchesData])

  const [selectedBranch, setSelectedBranch] = useState<string>("")
  useEffect(() => {
    if (branchOptions.length > 0) {
      setSelectedBranch((prev) => {
        const first = branchOptions[0]!.value
        if (!prev || !branchOptions.some((b) => b.value === prev)) return first
        return prev
      })
    }
  }, [branchOptions])

  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [isTolakDialogOpen, setIsTolakDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<SetorUang | null>(null)
  const [isBayarConfirmOpen, setIsBayarConfirmOpen] = useState(false)
  const [rowToBayar, setRowToBayar] = useState<SetorUang | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const listOptions = useMemo(() => {
    const filter: Record<string, string> = {}
    if (selectedBranch) filter.storeId = selectedBranch
    return { page: 1, pageSize: 200, filter }
  }, [selectedBranch])

  const { data, isLoading, isError } = useCashDeposits(listOptions)
  const approveMutation = useApproveCashDeposit()
  const rejectMutation = useRejectCashDeposit()
  const createMutation = useCreateCashDeposit()

  const rows = useMemo(
    () => (data?.data ?? []).map(mapCashDepositToSetorUang),
    [data]
  )

  const handleCreate = () => {
    setCreateDialogOpen(true)
  }

  const handleCreateConfirm = async (data: {
    storeId: string
    amount: number
  }) => {
    try {
      await createMutation.mutateAsync({
        storeId: data.storeId,
        amount: data.amount,
      })
      toast.success("Request setor uang berhasil dibuat")
      setCreateDialogOpen(false)
    } catch {
      toast.error("Gagal membuat request")
      throw new Error("Create failed")
    }
  }

  const handleBayar = (row: SetorUang) => {
    setRowToBayar(row)
    setIsBayarConfirmOpen(true)
  }

  const handleConfirmBayar = async () => {
    if (rowToBayar) {
      try {
        await approveMutation.mutateAsync(rowToBayar.uuid)
        toast.success("Setor uang berhasil disetujui")
        setIsBayarConfirmOpen(false)
        setRowToBayar(null)
      } catch {
        toast.error("Gagal menyetujui setor uang")
        throw new Error("Approve failed")
      }
    }
  }

  const handleTolak = (row: SetorUang) => {
    setSelectedRow(row)
    setIsTolakDialogOpen(true)
  }

  const handleConfirmTolak = async (
    row: SetorUang,
    data: { alasan: string }
  ) => {
    try {
      await rejectMutation.mutateAsync({
        id: row.uuid,
        data: { reason: data.alasan || "Ditolak" },
      })
      toast.success("Setor uang berhasil ditolak")
      setIsTolakDialogOpen(false)
      setSelectedRow(null)
    } catch {
      toast.error("Gagal menolak setor uang")
      throw new Error("Reject failed")
    }
  }

  const columns = [
    ...getBaseColumns(),
    getActionColumn(handleBayar, handleTolak),
  ]

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
          {isSuperAdmin && branchOptions.length > 0 && (
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Toko" />
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
          title="Daftar Request Setor Uang"
          searchPlaceholder="Cari..."
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
        />
      )}

      <TolakSetorUangDialog
        open={isTolakDialogOpen}
        onOpenChange={setIsTolakDialogOpen}
        row={selectedRow}
        onConfirm={handleConfirmTolak}
        isSubmitting={rejectMutation.isPending}
      />

      <ConfirmationDialog
        open={isBayarConfirmOpen}
        onOpenChange={setIsBayarConfirmOpen}
        onConfirm={handleConfirmBayar}
        title="Apakah Anda Yakin?"
        description="Anda akan melakukan pembayaran untuk Setor Uang ini."
        note="Pastikan kembali sebelum melakukan pembayaran."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />

      <CreateSetorUangDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onConfirm={handleCreateConfirm}
        isSubmitting={createMutation.isPending}
        branchOptions={branchOptions}
        selectedBranch={selectedBranch}
      />
    </div>
  )
}
