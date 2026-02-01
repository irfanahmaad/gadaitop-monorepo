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
import {
  SearchIcon,
  SlidersHorizontal,
  User,
  ClipboardList,
  QrCode,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"

// SPK detail type
type SPKDetail = {
  id: string
  nomorSPK: string
  fotoCustomer: string
  namaCustomer: string
  nik: string
  tanggalLahir: string
  jumlahSPK: number
  sisaSPK: number
  sisaPokokBulanIni: number
  tanggalWaktuSPK: string
}

// NKB row type for Daftar NKB table
type NKBRow = {
  id: string
  nomorNKB: string
  nomorSPK: string
  nominalDibayar: number
  jenis: string
  tanggalWaktuPengajuan: string
  status: "Lunas" | "Berjalan" | "Terlambat"
}

// Mock: fetch SPK by id (replace with API later)
function getSPKById(id: string): SPKDetail | null {
  const mock: SPKDetail = {
    id: "1",
    nomorSPK: "SPK/001/20112025",
    fotoCustomer: "/placeholder-avatar.jpg",
    namaCustomer: "Firman Suryo Pranoto",
    nik: "12345678910",
    tanggalLahir: "20 November 1990",
    jumlahSPK: 17_500_000,
    sisaSPK: 10,
    sisaPokokBulanIni: 9_000_000,
    tanggalWaktuSPK: "20 November 2025 18:33:45",
  }
  if (id === "1") return mock
  return mock
}

// Mock: NKB list for SPK (replace with API later)
function getNKBBySPKId(spkId: string): NKBRow[] {
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
      nomorNKB: "NKB/002/20112025",
      nomorSPK: "SPK/001/20112025",
      nominalDibayar: 17_500_000,
      jenis: "Pelunasan",
      tanggalWaktuPengajuan: "20 November 2025 18:33:45",
      status: "Berjalan",
    },
    {
      id: "3",
      nomorNKB: "NKB/003/20112025",
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
      return (
        <Badge
          variant={
            status === "Lunas"
              ? "secondary"
              : status === "Berjalan"
                ? "default"
                : "destructive"
          }
        >
          {status}
        </Badge>
      )
    },
  },
]

// Loading skeleton for Detail SPK card
function DetailSPKSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
          <div className="flex justify-center">
            <Skeleton className="size-48 rounded-full" />
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="h-6 w-36" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
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
              <Skeleton className="h-10 w-8" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function SPKDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : ""
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")

  // Simulate async fetch (replace with useQuery + API)
  const [loading, setLoading] = useState(true)
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [id])

  const spk = useMemo(() => (id ? getSPKById(id) : null), [id])
  const nkbList = useMemo(() => (id ? getNKBBySPKId(id) : []), [id])

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
    // Navigate to NKB detail if needed
  }

  const handleEdit = (row: NKBRow) => {
    console.log("NKB Edit:", row)
  }

  const handleDelete = (row: NKBRow) => {
    console.log("NKB Delete:", row)
  }

  const handlePrintQR = () => {
    // TODO: Implement print QR functionality
    console.log("Print QR for SPK:", spk?.nomorSPK)
  }

  if (!id) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "SPK", href: "/spk" },
            { label: "Detail", className: "text-destructive" },
          ]}
        />
        <p className="text-muted-foreground">SPK tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header: title + breadcrumbs + Print QR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">
            {loading ? (
              <Skeleton className="h-8 w-96" />
            ) : spk ? (
              `${spk.nomorSPK} - ${spk.namaCustomer}`
            ) : (
              "—"
            )}
          </h1>
          <Breadcrumbs
            items={[
              { label: "SPK", href: "/spk" },
              { label: "Detail", className: "text-destructive" },
            ]}
          />
        </div>
        {!loading && spk && (
          <Button
            variant="outline"
            className="shrink-0 gap-2"
            onClick={handlePrintQR}
          >
            <QrCode className="size-4" />
            Print QR
          </Button>
        )}
      </div>

      {/* Detail SPK card */}
      {loading ? (
        <DetailSPKSkeleton />
      ) : spk ? (
        <Card>
          <CardHeader>
            <CardTitle>Detail SPK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <Avatar className="size-48">
                  <AvatarImage src={spk.fotoCustomer} alt={spk.namaCustomer} />
                  <AvatarFallback>
                    <User className="text-muted-foreground size-24" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Detail Information */}
              <div className="space-y-8">
                {/* Detail Customer */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Customer
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        NIK
                      </label>
                      <p className="text-base">{spk.nik}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Nama Customer
                      </label>
                      <p className="text-base">{spk.namaCustomer}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Tanggal Lahir
                      </label>
                      <p className="text-base">{spk.tanggalLahir}</p>
                    </div>
                  </div>
                </div>

                {/* Detail SPK */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail SPK
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        No. SPK
                      </label>
                      <p className="text-base">{spk.nomorSPK}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Sisa SPK
                      </label>
                      <p className="text-base">{spk.sisaSPK}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Jumlah SPK
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-base">
                          Rp {formatCurrency(spk.jumlahSPK)}
                        </p>
                        <ExternalLink className="text-muted-foreground size-4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Sisa Pokok Bulan Ini
                      </label>
                      <p className="text-base">
                        Rp {formatCurrency(spk.sisaPokokBulanIni)}
                      </p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Tanggal & Waktu SPK
                      </label>
                      <p className="text-base">{spk.tanggalWaktuSPK}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">SPK tidak ditemukan.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/spk")}
            >
              Kembali ke SPK
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Daftar NKB card */}
      {loading ? (
        <DaftarNKBSkeleton />
      ) : spk ? (
        <DataTable<NKBRow, unknown>
          columns={nkbColumns as ColumnDef<NKBRow, unknown>[]}
          data={filteredNKB}
          title="Daftar NKB"
          searchPlaceholder="Email"
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
                  placeholder="Email"
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : null}
    </div>
  )
}
