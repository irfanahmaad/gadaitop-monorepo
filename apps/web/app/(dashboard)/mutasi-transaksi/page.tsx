"use client"

import React, { useMemo, useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import { Button } from "@workspace/ui/components/button"
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
import { SearchIcon, SlidersHorizontal, Plus } from "lucide-react"
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { TambahDataMutasiDialog } from "./_components/tambah-data-mutasi-dialog"
import { DetailMutasiDialog } from "./_components/detail-mutasi-dialog"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import {
  useCashMutations,
  useCreateCashMutation,
} from "@/lib/react-query/hooks/use-cash-mutations"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import type { CashMutation } from "@/lib/api/types"
import type { FilterConfig } from "@/hooks/use-filter-params"
import { toast } from "sonner"

type MutasiTransaksi = {
  id: string
  tanggal: string
  user: {
    name: string
    avatar?: string
  }
  jenis: string
  noSpkNkb: string
  deskripsi: string
  debit: number | null
  kredit: number | null
  saldo: number
}

const CATEGORY_DISPLAY: Record<string, string> = {
  spk_disbursement: "SPK",
  nkb_payment: "Pembayaran",
  deposit: "Setor Modal",
  topup: "Tambah Modal",
  expense: "Operasional",
  other: "Operasional",
}

function mapCashMutationToMutasi(m: CashMutation): MutasiTransaksi {
  const mutationType = m.mutationType ?? (m.type === "out" ? "debit" : "credit")
  const amount = typeof m.amount === "string" ? parseFloat(m.amount) : m.amount
  const balanceAfter =
    m.balanceAfter ??
    (typeof m.balanceAfter === "string" ? parseFloat(m.balanceAfter) : 0)
  const category = m.category ?? "other"
  const createdBy = m.createdBy as { fullName?: string; imageUrl?: string } | undefined
  const constructed =
    m.referenceId ? `${m.referenceType ?? ""}-${m.referenceId}`.trim() : ""
  const noSpkNkb = (m.referenceNumber ?? constructed) || "-"

  const isDebit = mutationType === "debit"
  return {
    id: m.uuid,
    tanggal: m.createdAt,
    user: {
      name: createdBy?.fullName ?? "-",
      avatar: createdBy?.imageUrl,
    },
    jenis: CATEGORY_DISPLAY[category] ?? "Operasional",
    noSpkNkb,
    deskripsi: m.description ?? "-",
    debit: isDebit ? amount : null,
    kredit: !isDebit ? amount : null,
    saldo: balanceAfter,
  }
}

const columns: ColumnDef<MutasiTransaksi>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "tanggal",
    header: "Tanggal",
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.getValue("user") as MutasiTransaksi["user"]
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{user.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "jenis",
    header: "Jenis",
  },
  {
    accessorKey: "noSpkNkb",
    header: "No SPK/NKB",
  },
  {
    accessorKey: "deskripsi",
    header: "Deskripsi",
  },
  {
    accessorKey: "debit",
    header: "Debit",
    cell: ({ row }) => {
      const debit = row.getValue("debit") as number | null
      return (
        <span className="text-sm">
          {debit ? `Rp${formatCurrencyDisplay(debit)},-` : "-"}
        </span>
      )
    },
  },
  {
    accessorKey: "kredit",
    header: "Kredit",
    cell: ({ row }) => {
      const kredit = row.getValue("kredit") as number | null
      return (
        <span className="text-sm">
          {kredit ? `Rp${formatCurrencyDisplay(kredit)},-` : "-"}
        </span>
      )
    },
  },
  {
    accessorKey: "saldo",
    header: "Saldo",
    cell: ({ row }) => {
      const saldo = row.getValue("saldo") as number
      return (
        <span className="text-sm">Rp{formatCurrencyDisplay(saldo)},-</span>
      )
    },
  },
]

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

export default function MutasiTransaksiPage() {
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

  const [selectedToko, setSelectedToko] = useState<string>("")
  useEffect(() => {
    if (branchOptions.length > 0) {
      setSelectedToko((prev) => {
        const first = branchOptions[0]!.value
        if (!prev || !branchOptions.some((b) => b.value === prev)) return first
        return prev
      })
    }
  }, [branchOptions])

  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [tambahDataDialogOpen, setTambahDataDialogOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({})
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailRow, setDetailRow] = useState<MutasiTransaksi | null>(null)

  const mutasiFilterConfig: FilterConfig[] = useMemo(
    () => [
      {
        key: "category",
        label: "Jenis",
        type: "select",
        placeholder: "Semua",
        options: [
          { label: "Tambah Modal", value: "topup" },
          { label: "Setor Modal", value: "deposit" },
          { label: "SPK", value: "spk_disbursement" },
          { label: "Pembayaran", value: "nkb_payment" },
          { label: "Operasional", value: "expense" },
        ],
      },
      {
        key: "dateRange",
        label: "Tanggal",
        type: "daterange",
        labelFrom: "Tanggal Mulai",
        labelTo: "Tanggal Sampai",
      },
      {
        key: "storeId",
        label: "Toko",
        type: "select",
        placeholder: "Semua",
        options: branchOptions.map((b) => ({ label: b.label, value: b.value })),
      },
    ],
    [branchOptions]
  )

  const listOptions = useMemo(() => {
    const filter: Record<string, string | number> = {}
    const fv = filterValues
    const storeIdFromFilter = fv.storeId as string | undefined
    if (storeIdFromFilter) {
      filter.storeId = storeIdFromFilter
    } else if (selectedToko) {
      filter.storeId = selectedToko
    }
    const category = fv.category as string | undefined
    if (category) filter.category = category
    const dateRange = fv.dateRange as { from?: string; to?: string } | undefined
    if (dateRange?.from) filter.dateFrom = dateRange.from
    if (dateRange?.to) filter.dateTo = dateRange.to
    if (branchQueryCompanyId) filter.ptId = branchQueryCompanyId
    return { page: 1, pageSize, filter }
  }, [selectedToko, pageSize, filterValues, branchQueryCompanyId])

  const { data, isLoading, isError } = useCashMutations(listOptions)
  const createMutation = useCreateCashMutation()

  const rows = useMemo(() => {
    const list = data?.data ?? []
    return list.map((m) => mapCashMutationToMutasi(m))
  }, [data])

  const handleTambahData = () => {
    setTambahDataDialogOpen(true)
  }

  const handleTambahDataConfirm = async (data: {
    nominal: number
    tipe: "SPK1" | "SPK2" | "Operasional" | "Tambah Modal"
    keterangan?: string
    storeId?: string
  }) => {
    const storeId = data.storeId ?? selectedToko ?? branchOptions[0]?.value
    if (!storeId) {
      toast.error("Pilih toko terlebih dahulu")
      return
    }
    if (!branchQueryCompanyId) {
      toast.error("Pilih PT terlebih dahulu")
      return
    }

    const mapping: Record<
      string,
      {
        mutationType: "debit" | "credit"
        category:
          | "spk_disbursement"
          | "nkb_payment"
          | "expense"
          | "topup"
          | "deposit"
          | "other"
      }
    > = {
      SPK1: { mutationType: "debit", category: "spk_disbursement" },
      SPK2: { mutationType: "debit", category: "nkb_payment" },
      Operasional: { mutationType: "debit", category: "expense" },
      "Tambah Modal": { mutationType: "credit", category: "topup" },
    }

    const { mutationType, category } = mapping[data.tipe] ?? {
      mutationType: "debit" as const,
      category: "other" as const,
    }

    try {
      await createMutation.mutateAsync({
        ptId: branchQueryCompanyId,
        storeId,
        mutationType,
        category,
        amount: data.nominal,
        description: data.keterangan,
      })
      toast.success("Mutasi berhasil ditambahkan")
      setTambahDataDialogOpen(false)
    } catch {
      toast.error("Gagal menambahkan mutasi")
      throw new Error("Create failed")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">GADAI TOP Mutasi/Transaksi</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Mutasi/Transaksi" },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
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

            {(isSuperAdmin || isCompanyAdmin) && branchOptions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Pilih Toko :</span>
                <Select value={selectedToko} onValueChange={setSelectedToko}>
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
              </div>
            )}

            {!isCompanyAdmin && (
              <Button
                onClick={handleTambahData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Data
              </Button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Gagal memuat data Mutasi</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          title="Daftar Mutasi"
          searchPlaceholder="Cari berdasarkan SPK atau deskripsi"
          filterConfig={mutasiFilterConfig}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
          filterDialogOpen={filterDialogOpen}
          onFilterDialogOpenChange={setFilterDialogOpen}
          onRowClick={(row) => {
            setDetailRow(row)
            setDetailDialogOpen(true)
          }}
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

      <TambahDataMutasiDialog
        open={tambahDataDialogOpen}
        onOpenChange={setTambahDataDialogOpen}
        onConfirm={handleTambahDataConfirm}
        isSubmitting={createMutation.isPending}
        branchOptions={branchOptions}
        selectedBranch={selectedToko}
      />

      <DetailMutasiDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        row={detailRow}
      />
    </div>
  )
}
