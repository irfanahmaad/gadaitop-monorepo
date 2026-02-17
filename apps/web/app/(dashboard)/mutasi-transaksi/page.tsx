"use client"

import React, { useMemo, useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import { Button } from "@workspace/ui/components/button"
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
import { SearchIcon, SlidersHorizontal, ArrowUpDown, Plus } from "lucide-react"
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { TambahDataMutasiDialog } from "./_components/tambah-data-mutasi-dialog"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import {
  useCashMutations,
  useCreateCashMutation,
} from "@/lib/react-query/hooks/use-cash-mutations"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import type { CashMutation } from "@/lib/api/types"
import { toast } from "sonner"

type MutasiTransaksi = {
  id: string
  tanggal: string
  toko: {
    name: string
    avatar?: string
  }
  tipeMutasi: "SPK1" | "SPK2" | "Operasional" | "Tambah Modal"
  debit: number | null
  kredit: number | null
  sisaSaldo: number
}

const CATEGORY_DISPLAY: Record<string, MutasiTransaksi["tipeMutasi"]> = {
  spk_disbursement: "SPK1",
  nkb_payment: "SPK2",
  deposit: "Operasional",
  topup: "Tambah Modal",
  expense: "Operasional",
  other: "Operasional",
}

function mapCashMutationToMutasi(
  m: CashMutation,
  storeName: string
): MutasiTransaksi {
  const mutationType = m.mutationType ?? (m.type === "out" ? "debit" : "credit")
  const amount = typeof m.amount === "string" ? parseFloat(m.amount) : m.amount
  const balanceAfter =
    m.balanceAfter ??
    (typeof m.balanceAfter === "string" ? parseFloat(m.balanceAfter) : 0)
  const category = m.category ?? "other"

  const isDebit = mutationType === "debit"
  return {
    id: m.uuid,
    tanggal: m.createdAt,
    toko: {
      name: storeName,
      avatar: undefined,
    },
    tipeMutasi: CATEGORY_DISPLAY[category] ?? "Operasional",
    debit: isDebit ? amount : null,
    kredit: !isDebit ? amount : null,
    sisaSaldo: balanceAfter,
  }
}

const columns: ColumnDef<MutasiTransaksi>[] = [
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
    accessorKey: "tanggal",
    header: "Tanggal",
  },
  {
    accessorKey: "toko",
    header: "Toko",
    cell: ({ row }) => {
      const toko = row.getValue("toko") as MutasiTransaksi["toko"]
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={toko.avatar} alt={toko.name} />
            <AvatarFallback>
              {toko.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{toko.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "tipeMutasi",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 px-2 hover:bg-transparent"
      >
        Tipe Mutasi
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
    accessorKey: "sisaSaldo",
    header: "Sisa Saldo",
    cell: ({ row }) => {
      const sisaSaldo = row.getValue("sisaSaldo") as number
      return (
        <span className="text-sm">Rp{formatCurrencyDisplay(sisaSaldo)},-</span>
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
      : undefined
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

  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [tambahDataDialogOpen, setTambahDataDialogOpen] = useState(false)

  const listOptions = useMemo(() => {
    const filter: Record<string, string> = {}
    if (selectedToko) filter.storeId = selectedToko
    return { page: 1, pageSize: 200, filter }
  }, [selectedToko])

  const { data, isLoading, isError } = useCashMutations(listOptions)
  const createMutation = useCreateCashMutation()

  const storeNameById = useMemo(() => {
    const map = new Map<string, string>()
    branchOptions.forEach((b) => map.set(b.value, b.label))
    return map
  }, [branchOptions])

  const rows = useMemo(() => {
    const list = data?.data ?? []
    return list.map((m) =>
      mapCashMutationToMutasi(m, storeNameById.get(m.storeId) ?? m.storeId)
    )
  }, [data, storeNameById])

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
            <h1 className="text-2xl font-bold">Mutasi / Transaksi</h1>
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

      <TambahDataMutasiDialog
        open={tambahDataDialogOpen}
        onOpenChange={setTambahDataDialogOpen}
        onConfirm={handleTambahDataConfirm}
        isSubmitting={createMutation.isPending}
        branchOptions={branchOptions}
        selectedBranch={selectedToko}
      />
    </div>
  )
}
