"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { User } from "lucide-react"
import { useFilterParams, FilterConfig } from "@/hooks/use-filter-params"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { useSpkList } from "@/lib/react-query/hooks/use-spk"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import type { Spk } from "@/lib/api/types"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Plus } from "lucide-react"

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return dateStr
  }
}

// Customer name: API may return customer.name (backend Dto) or customer.fullName
function getCustomerName(spk: Spk): string {
  const c = spk.customer as { fullName?: string; name?: string } | undefined
  return c?.fullName ?? c?.name ?? "-"
}

function getCustomerPhotoUrl(spk: Spk): string | undefined {
  const c = spk.customer as { ktpPhotoUrl?: string } | undefined
  return c?.ktpPhotoUrl
}

const filterConfig: FilterConfig[] = [
  {
    key: "spkRange",
    label: "SPK",
    type: "currencyrange",
    currency: "Rp",
  },
]

const columns: ColumnDef<Spk>[] = [
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
      const spk = row.original
      const photoUrl = getCustomerPhotoUrl(spk)
      const name = getCustomerName(spk)
      return (
        <Avatar className="size-10">
          <AvatarImage src={photoUrl} alt={name} />
          <AvatarFallback>
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>
      )
    },
  },
  {
    accessorKey: "spkNumber",
    header: "Nomor SPK",
  },
  {
    id: "namaCustomer",
    header: "Nama Customer",
    cell: ({ row }) => getCustomerName(row.original),
  },
  {
    accessorKey: "totalAmount",
    header: "Jumlah SPK",
    cell: ({ row }) => {
      const amount = row.original.totalAmount ?? row.original.principalAmount
      return `Rp ${formatCurrency(Number(amount))}`
    },
  },
  {
    accessorKey: "tenor",
    header: "Sisa SPK",
    cell: ({ row }) => String(row.original.tenor ?? "-"),
  },
  {
    id: "tanggalWaktuSPK",
    header: "Tanggal & Waktu SPK",
    cell: ({ row }) => formatDate(row.original.createdAt),
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

export default function SPKPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { filterValues, setFilters } = useFilterParams(filterConfig)
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const isAdminPT = useMemo(
    () => user?.roles?.some((r) => r.code === "company_admin") ?? false,
    [user]
  )

  const listOptions = useMemo(() => {
    const filter: Record<string, string | number> = {}
    if (selectedBranch) filter.branchId = selectedBranch
    const spkRange = filterValues.spkRange as
      | { from?: number | string | null; to?: number | string | null }
      | undefined
    if (spkRange?.from != null && spkRange.from !== "") {
      filter.principalAmountFrom = Number(spkRange.from)
    }
    if (spkRange?.to != null && spkRange.to !== "") {
      filter.principalAmountTo = Number(spkRange.to)
    }
    return {
      page,
      pageSize,
      filter: Object.keys(filter).length ? filter : undefined,
    }
  }, [page, pageSize, selectedBranch, filterValues])

  const { data, isLoading, isError } = useSpkList(listOptions)
  const { data: branchesData } = useBranches()

  const branchOptions = useMemo(() => {
    const list = branchesData?.data ?? []
    return list.map((b) => ({ value: b.uuid, label: b.shortName ?? b.branchCode ?? b.uuid }))
  }, [branchesData])

  const filteredByAmount = useMemo(() => {
    const list = data?.data ?? []
    const spkRange = filterValues.spkRange as
      | { from?: number | string | null; to?: number | string | null }
      | undefined
    if (!spkRange?.from && !spkRange?.to) return list
    let result = list
    if (spkRange.from != null && spkRange.from !== "") {
      const fromVal = Number(spkRange.from)
      if (!isNaN(fromVal)) {
        result = result.filter((s) => Number(s.principalAmount ?? s.totalAmount) >= fromVal)
      }
    }
    if (spkRange.to != null && spkRange.to !== "") {
      const toVal = Number(spkRange.to)
      if (!isNaN(toVal)) {
        result = result.filter((s) => Number(s.principalAmount ?? s.totalAmount) <= toVal)
      }
    }
    return result
  }, [data?.data, filterValues])

  const handleDetail = (row: Spk) => {
    router.push(`/spk/${row.uuid}`)
  }

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">SPK</h1>
          <Breadcrumbs
            items={[{ label: "Pages", href: "/" }, { label: "SPK" }]}
          />
        </div>
        {!isAdminPT && (
          <Button onClick={() => router.push("/spk/tambah")}>
            <Plus className="size-5" />
            Tambah SPK
          </Button>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Gagal memuat data SPK</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable<Spk, unknown>
          columns={columns}
          data={filteredByAmount}
          onDetail={handleDetail}
          headerLeft={
            <Select value={selectedBranch} onValueChange={handleBranchChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Cabang" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((branch) => (
                  <SelectItem key={branch.value} value={branch.value}>
                    {branch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
          filterConfig={filterConfig}
          filterValues={filterValues}
          onFilterChange={setFilters}
        />
      )}
    </div>
  )
}
