"use client"

import React, { useState, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Package, Banknote, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { BayarDialog } from "../_components/BayarDialog"
import {
  useSpk,
  useSpkNkb,
  useExtendSpk,
  useRedeemSpk,
} from "@/lib/react-query/hooks/use-spk"
import type { Nkb } from "@/lib/api/types"

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

function getNkbStatusLabel(status: string): string {
  const map: Record<string, string> = {
    confirmed: "Lunas",
    pending: "Berjalan",
    rejected: "Terlambat",
    failed: "Gagal",
  }
  return map[status] ?? status
}

const SPK_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Aktif",
  extended: "Diperpanjang",
  redeemed: "Ditebus",
  overdue: "Jatuh Tempo",
  auctioned: "Dilelang",
  closed: "Ditutup",
}

const SPK_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  active: "default",
  extended: "secondary",
  redeemed: "secondary",
  overdue: "destructive",
  auctioned: "destructive",
  closed: "outline",
}

function getNkbTypeLabel(type: string): string {
  const map: Record<string, string> = {
    full_redemption: "Pelunasan",
    renewal: "Perpanjangan",
    partial: "Cicilan",
  }
  return map[type] ?? type
}

const nkbColumns: ColumnDef<Nkb>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return index + 1
    },
  },
  {
    accessorKey: "nkbNumber",
    header: "Nomor NKB",
  },
  {
    id: "nomorSPK",
    header: "Nomor SPK",
    cell: ({ row }) => (row.original as { spk?: { spkNumber?: string } }).spk?.spkNumber ?? "-",
  },
  {
    accessorKey: "amountPaid",
    header: "Nominal Dibayar",
    cell: ({ row }) =>
      `Rp ${formatCurrency(Number((row.original as Nkb).amountPaid ?? 0))}`,
  },
  {
    accessorKey: "paymentType",
    header: "Jenis",
    cell: ({ row }) => getNkbTypeLabel((row.original as Nkb).paymentType ?? ""),
  },
  {
    id: "tanggal",
    header: "Tanggal & Waktu Pengajuan",
    cell: ({ row }) => formatDate((row.original as Nkb).createdAt ?? ""),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.original as Nkb).status ?? ""
      const label = getNkbStatusLabel(status)
      const statusStyles: Record<string, string> = {
        Lunas: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        Berjalan: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        Terlambat: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      }
      return (
        <Badge variant="secondary" className={statusStyles[label] ?? ""}>
          {label}
        </Badge>
      )
    },
  },
]

function DetailItemSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
          <Skeleton className="size-48 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DaftarNKBSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-8" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PortalCustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : ""

  const { data: spk, isLoading: spkLoading, isError: spkError } = useSpk(id)
  const { data: nkbList = [], isLoading: nkbLoading } = useSpkNkb(id)

  const [bayarDialogOpen, setBayarDialogOpen] = useState(false)
  const [bayarType, setBayarType] = useState<"cicil" | "lunas">("cicil")

  const extendSpk = useExtendSpk()
  const redeemSpk = useRedeemSpk()
  const isPaymentSubmitting = extendSpk.isPending || redeemSpk.isPending

  const canPay =
    spk?.status !== "redeemed" && spk?.status !== "closed"

  const firstItem = useMemo(() => {
    const items = spk?.items
    if (!items?.length) return null
    return items[0] as { description?: string; photoUrl?: string }
  }, [spk?.items])

  const itemName = firstItem?.description ?? spk?.spkNumber ?? "-"
  const photoUrl = firstItem?.photoUrl

  const handleBayarCicil = useCallback(() => {
    setBayarType("cicil")
    setBayarDialogOpen(true)
  }, [])

  const handleBayarLunas = useCallback(() => {
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
    [extendSpk, redeemSpk, router]
  )

  if (!id) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Portal Customer", href: "/portal-customer" },
            { label: "Detail Item", className: "text-destructive" },
          ]}
        />
        <p className="text-muted-foreground">Item tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {spkLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            itemName
          )}
        </h1>
        <Breadcrumbs
          items={[
            { label: "Portal Customer", href: "/portal-customer" },
            { label: "Daftar SPK", href: "/portal-customer" },
            { label: "Detail Item", className: "text-destructive" },
          ]}
        />
      </div>

      {spkLoading ? (
        <DetailItemSkeleton />
      ) : spkError || !spk ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Item tidak ditemukan.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/portal-customer")}
            >
              Kembali ke Portal Customer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-xl">Detail Item</CardTitle>
              {canPay && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={handleBayarCicil}
                  >
                    <CreditCard className="size-4" />
                    Bayar Cicil
                  </Button>
                  <Button
                    className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleBayarLunas}
                  >
                    <Banknote className="size-4" />
                    Bayar Lunas
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
              <div className="flex justify-center">
                <Avatar className="size-48 rounded-lg">
                  <AvatarImage
                    src={photoUrl}
                    alt={itemName}
                    className="rounded-lg object-cover"
                  />
                  <AvatarFallback className="rounded-lg bg-slate-200">
                    <Package className="text-muted-foreground size-16" />
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="text-destructive size-5" />
                  <h2 className="text-destructive font-semibold">
                    Detail Barang
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 items-start">
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-sm font-medium">
                      No. SPK
                    </label>
                    <p className="text-base">{spk.spkNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-sm font-medium">
                      SPK Total
                    </label>
                    <p className="text-base">
                      Rp {formatCurrency(Number(spk.totalAmount ?? spk.principalAmount))}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-sm font-medium">
                      Jatuh Tempo
                    </label>
                    <p className="text-base">{formatDate(spk.dueDate ?? "")}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-sm font-medium">
                      Status
                    </label>
                    <p className="text-base">
                      <Badge
                        variant={
                          SPK_STATUS_VARIANT[spk.status ?? ""] ?? "outline"
                        }
                      >
                        {SPK_STATUS_LABELS[spk.status ?? ""] ?? spk.status ?? "-"}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {spk && (
        nkbLoading ? (
          <DaftarNKBSkeleton />
        ) : (
          <DataTable<Nkb, unknown>
            columns={nkbColumns}
            data={nkbList}
            title="Daftar NKB"
            searchPlaceholder="Search"
            initialPageSize={10}
          />
        )
      )}

      {spk && (
        <BayarDialog
          open={bayarDialogOpen}
          onOpenChange={setBayarDialogOpen}
          type={bayarType}
          spkId={spk.uuid}
          remainingBalance={Number(
            (spk as { remainingBalance?: number }).remainingBalance ??
              spk.totalAmount ??
              spk.principalAmount ??
              0
          )}
          onConfirm={handleBayarConfirm}
          isSubmitting={isPaymentSubmitting}
        />
      )}
    </div>
  )
}
