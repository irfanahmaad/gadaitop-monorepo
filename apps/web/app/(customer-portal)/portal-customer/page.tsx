"use client"

import React, { useMemo, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Wallet, HandCoins } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import { useFilterParams, FilterConfig } from "@/hooks/use-filter-params"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { BayarDialog } from "./_components/BayarDialog"
import { useCustomerAuth } from "@/lib/react-query/hooks/use-auth"
import { useSpkList } from "@/lib/react-query/hooks/use-spk"
import type { Spk } from "@/lib/api/types"

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

function getItemName(spk: Spk): string {
  const items = spk.items
  if (!items?.length) return "-"
  const first = items[0]
  return (first as { description?: string }).description ?? "-"
}

function getStoreName(spk: Spk): string {
  const store = spk.store as { shortName?: string; fullName?: string } | undefined
  return store?.shortName ?? store?.fullName ?? "-"
}

function getCompanyName(spk: Spk): string {
  const store = spk.store as { company?: { companyName?: string } } | undefined
  return store?.company?.companyName ?? "-"
}

const filterConfig: FilterConfig[] = [
  {
    key: "nominalRange",
    label: "Nominal",
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
    accessorKey: "spkNumber",
    header: "Nomor SPK",
  },
  {
    id: "namaItem",
    header: "Nama Item",
    cell: ({ row }) => getItemName(row.original),
  },
  {
    id: "namaPT",
    header: "Nama PT",
    cell: ({ row }) => getCompanyName(row.original),
  },
  {
    id: "namaToko",
    header: "Nama Toko",
    cell: ({ row }) => getStoreName(row.original),
  },
  {
    accessorKey: "totalAmount",
    header: "Nominal",
    cell: ({ row }) => {
      const amount = row.original.totalAmount ?? row.original.principalAmount
      return `Rp ${formatCurrency(Number(amount))}`
    },
  },
  {
    id: "tanggalWaktuSPK",
    header: "Tanggal & Waktu SPK",
    cell: ({ row }) => formatDate(row.original.createdAt ?? ""),
  },
]

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-8" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PortalCustomerPage() {
  const router = useRouter()
  const { customer } = useCustomerAuth()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const { filterValues, setFilters } = useFilterParams(filterConfig)

  const [bayarDialogOpen, setBayarDialogOpen] = useState(false)
  const [bayarType, setBayarType] = useState<"cicil" | "lunas">("cicil")
  const [selectedRow, setSelectedRow] = useState<Spk | null>(null)

  const listOptions = useMemo(() => {
    const filter: Record<string, string | number> = {}
    if (customer?.uuid) filter.customerId = customer.uuid
    const nominalRange = filterValues.nominalRange as
      | { from?: number | string | null; to?: number | string | null }
      | undefined
    if (nominalRange?.from != null && nominalRange.from !== "") {
      filter.principalAmountFrom = Number(nominalRange.from)
    }
    if (nominalRange?.to != null && nominalRange.to !== "") {
      filter.principalAmountTo = Number(nominalRange.to)
    }
    return {
      page,
      pageSize,
      query: searchValue || undefined,
      filter: Object.keys(filter).length ? filter : undefined,
    }
  }, [page, pageSize, searchValue, customer?.uuid, filterValues])

  const { data, isLoading, isError } = useSpkList(listOptions, {
    enabled: !!customer?.uuid,
  })

  const spkList = data?.data ?? []
  const meta = data?.meta
  const totalRowCount = meta?.count ?? 0

  const handleDetail = (row: Spk) => {
    router.push(`/portal-customer/${row.uuid}`)
  }

  const handleBayarCicil = useCallback((row: Spk) => {
    setSelectedRow(row)
    setBayarType("cicil")
    setBayarDialogOpen(true)
  }, [])

  const handleBayarLunas = useCallback((row: Spk) => {
    setSelectedRow(row)
    setBayarType("lunas")
    setBayarDialogOpen(true)
  }, [])

  const handleBayarConfirm = useCallback(
    (data: {
      type: "cicil" | "lunas"
      metodePembayaran: string
      totalBayarPokok: number
      totalBunga: number
      totalDenda: number
      grandTotal: number
    }) => {
      // TODO: handle payment confirmation (API call, etc.)
      console.log("Payment confirmed:", { ...data, spk: selectedRow })
    },
    [selectedRow]
  )

  if (!customer?.uuid) {
    return <TableSkeleton />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Portal Customer</h1>
        <Breadcrumbs
          items={[
            { label: "Portal Customer", href: "/portal-customer" },
            { label: "Daftar SPK" },
          ]}
        />
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Gagal memuat data</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable<Spk, unknown>
          title="Daftar SPK"
          columns={columns}
          data={spkList}
          onDetail={handleDetail}
          customActions={[
            {
              label: "Bayar Cicil",
              icon: <Wallet className="mr-2 h-4 w-4" />,
              onClick: handleBayarCicil,
            },
            {
              label: "Bayar Lunas",
              icon: <HandCoins className="mr-2 h-4 w-4" />,
              onClick: handleBayarLunas,
            },
          ]}
          filterConfig={filterConfig}
          filterValues={filterValues}
          onFilterChange={setFilters}
          initialPageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
          searchPlaceholder="Email"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          serverSidePagination={{
            totalRowCount,
            pageIndex: page - 1,
            onPageIndexChange: (idx) => setPage(idx + 1),
          }}
        />
      )}

      <BayarDialog
        open={bayarDialogOpen}
        onOpenChange={setBayarDialogOpen}
        type={bayarType}
        nominal={
          selectedRow
            ? Number(
                selectedRow.totalAmount ?? selectedRow.principalAmount ?? 0
              )
            : 0
        }
        onConfirm={handleBayarConfirm}
      />
    </div>
  )
}
