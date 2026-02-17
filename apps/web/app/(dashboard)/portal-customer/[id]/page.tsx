"use client"

import React, { useState, useMemo } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  SearchIcon,
  SlidersHorizontal,
  Package,
  Banknote,
  CreditCard,
} from "lucide-react"

// Detail item type
type ItemDetail = {
  id: string
  nomorSPK: string
  namaItem: string
  foto?: string
  spkTotal: number
  sisaPokokBulanIni: number
}

// NKB row type
type NKBRow = {
  id: string
  nomorNKB: string
  nomorSPK: string
  nominalDibayar: number
  jenis: string
  tanggalWaktuPengajuan: string
  status: "Lunas" | "Berjalan" | "Terlambat"
}

// Mock: fetch item detail by id
function getItemById(id: string): ItemDetail | null {
  const mock: ItemDetail = {
    id: "1",
    nomorSPK: "SPK/001/20112025",
    namaItem: "iPhone 15 Pro",
    spkTotal: 10_000_000,
    sisaPokokBulanIni: 9_000_000,
  }
  return mock
}

// Mock: NKB list for item
function getNKBByItemId(itemId: string): NKBRow[] {
  return [
    {
      id: "1",
      nomorNKB: "NKB/001/20112025",
      nomorSPK: "SPK/001/20112025",
      nominalDibayar: 10_000_000,
      jenis: "Perpanjangan",
      tanggalWaktuPengajuan: "20 November 2025 18:33:45",
      status: "Lunas",
    },
    {
      id: "2",
      nomorNKB: "NKB/001/20112025",
      nomorSPK: "SPK/001/20112025",
      nominalDibayar: 17_500_000,
      jenis: "Pelunasan",
      tanggalWaktuPengajuan: "20 November 2025 18:33:45",
      status: "Berjalan",
    },
    {
      id: "3",
      nomorNKB: "NKB/001/20112025",
      nomorSPK: "SPK/001/20112025",
      nominalDibayar: 10_000_000,
      jenis: "Perpanjangan",
      tanggalWaktuPengajuan: "20 November 2025 18:33:45",
      status: "Terlambat",
    },
  ]
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

// Columns for Daftar NKB table
const nkbColumns: ColumnDef<NKBRow>[] = [
  {
    id: "select",
    enableHiding: false,
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
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return index + 1
    },
  },
  { accessorKey: "nomorNKB", header: "Nomor NKB" },
  { accessorKey: "nomorSPK", header: "Nomor SPK" },
  {
    accessorKey: "nominalDibayar",
    header: "Nominal Dibayar",
    cell: ({ row }) =>
      `Rp ${formatCurrency(row.getValue("nominalDibayar") as number)}`,
  },
  { accessorKey: "jenis", header: "Jenis" },
  {
    accessorKey: "tanggalWaktuPengajuan",
    header: "Tanggal & Waktu Pengajuan",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as NKBRow["status"]
      const statusStyles = {
        Lunas:
          "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300",
        Berjalan:
          "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-300",
        Terlambat:
          "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300",
      }
      return (
        <Badge variant="secondary" className={statusStyles[status]}>
          {status}
        </Badge>
      )
    },
  },
]

// Loading skeleton for Detail Item card
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

// Loading skeleton for Daftar NKB table
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
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")

  // Simulate async fetch
  const [loading, setLoading] = useState(true)
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [id])

  const item = useMemo(() => (id ? getItemById(id) : null), [id])
  const nkbList = useMemo(() => (id ? getNKBByItemId(id) : []), [id])

  const filteredNKB = useMemo(() => {
    if (!searchValue.trim()) return nkbList
    const q = searchValue.toLowerCase()
    return nkbList.filter(
      (row) =>
        row.nomorNKB.toLowerCase().includes(q) ||
        row.nomorSPK.toLowerCase().includes(q)
    )
  }, [nkbList, searchValue])

  const handleDetail = (row: NKBRow) => {
    console.log("NKB Detail:", row)
  }

  const handleBayarCicil = () => {
    console.log("Bayar Cicil")
  }

  const handleBayarLunas = () => {
    console.log("Bayar Lunas")
  }

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
      {/* Header: title + breadcrumbs */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {loading ? (
            <Skeleton className="h-8 w-64" />
          ) : item ? (
            item.namaItem
          ) : (
            "—"
          )}
        </h1>
        <Breadcrumbs
          items={[
            { label: "Portal Customer", href: "/portal-customer" },
            { label: "Detail Item", className: "text-destructive" },
          ]}
        />
      </div>

      {/* Detail Item card */}
      {loading ? (
        <DetailItemSkeleton />
      ) : item ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-xl">Detail Item</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={handleBayarCicil}
                >
                  <CreditCard className="size-4" />
                  Bayar Cicil
                </Button>
                <Button
                  className="gap-2 bg-red-600 text-white hover:bg-red-700"
                  onClick={handleBayarLunas}
                >
                  <Banknote className="size-4" />
                  Bayar Lunas
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
              {/* Item Photo */}
              <div className="flex justify-center">
                <Avatar className="size-48 rounded-lg">
                  <AvatarImage
                    src={item.foto}
                    alt={item.namaItem}
                    className="rounded-lg object-cover"
                  />
                  <AvatarFallback className="rounded-lg bg-slate-200">
                    <Package className="text-muted-foreground size-16" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Detail Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="text-destructive size-5" />
                  <h2 className="text-destructive font-semibold">
                    Detail Barang
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-900">
                      No. SPK
                    </label>
                    <p className="text-sm text-slate-500">{item.nomorSPK}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-900">
                      SPK Total
                    </label>
                    <p className="text-sm text-slate-500">
                      Rp {formatCurrency(item.spkTotal)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-900">
                      Sisa Pokok Bulan Ini
                    </label>
                    <p className="text-sm text-slate-500">
                      Rp {formatCurrency(item.sisaPokokBulanIni)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
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
      )}

      {/* Daftar NKB card */}
      {loading ? (
        <DaftarNKBSkeleton />
      ) : item ? (
        <DataTable<NKBRow, unknown>
          columns={nkbColumns as ColumnDef<NKBRow, unknown>[]}
          data={filteredNKB}
          title="Daftar NKB"
          searchPlaceholder="Search"
          headerRight={
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => setPageSize(Number(v))}
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
                  placeholder="Search"
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
          onDetail={handleDetail}
        />
      ) : null}
    </div>
  )
}
