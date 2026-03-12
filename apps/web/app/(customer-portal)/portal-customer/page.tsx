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
import { toast } from "sonner"
import { BayarDialog } from "./_components/BayarDialog"
import { useCustomerAuth } from "@/lib/react-query/hooks/use-auth"
import {
  useSpkList,
  useExtendSpk,
  useRedeemSpk,
} from "@/lib/react-query/hooks/use-spk"
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
  const pt = spk.pt as { companyName?: string } | undefined
  return pt?.companyName ?? "-"
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

  const extendSpk = useExtendSpk()
  const redeemSpk = useRedeemSpk()
  const isPaymentSubmitting = extendSpk.isPending || redeemSpk.isPending

  const listOptions = useMemo(() => {
    const filter: Record<string, string | number> = {}
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
  }, [page, pageSize, searchValue, filterValues])

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
    async (data: {
      type: "cicil" | "lunas"
      spkId: string
      paymentMethod: string
      amountPaid: number
      totalBunga: number
      totalDenda: number
      grandTotal: number
    }) => {
      if (!selectedRow) return
      const paymentMethod = data.paymentMethod as "cash" | "transfer"
      try {
        if (data.type === "cicil") {
          const result = await extendSpk.mutateAsync({
            id: data.spkId,
            data: { amountPaid: data.amountPaid, paymentMethod },
          })
          router.push(
            `/portal-customer/payment-process?nkbId=${result.nkbId}&spkId=${data.spkId}&method=${paymentMethod}`
          )
        } else {
          const result = await redeemSpk.mutateAsync({
            id: data.spkId,
            data: { amountPaid: data.amountPaid, paymentMethod },
          })
          router.push(
            `/portal-customer/payment-process?nkbId=${result.nkbId}&spkId=${data.spkId}&method=${paymentMethod}`
          )
        }
      } catch {
        toast.error("Gagal mengajukan pembayaran")
      }
    },
    [selectedRow, extendSpk, redeemSpk, router]
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

      {selectedRow && (
        <BayarDialog
          open={bayarDialogOpen}
          onOpenChange={setBayarDialogOpen}
          type={bayarType}
          spkId={selectedRow.uuid}
          remainingBalance={Number(
            (selectedRow as { remainingBalance?: number }).remainingBalance ??
              selectedRow.totalAmount ??
              selectedRow.principalAmount ??
              0
          )}
          onConfirm={handleBayarConfirm}
          isSubmitting={isPaymentSubmitting}
        />
      )}
    </div>
  )
}
