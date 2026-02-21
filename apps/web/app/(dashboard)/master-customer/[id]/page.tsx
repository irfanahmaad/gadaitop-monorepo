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
  Briefcase,
  User,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import {
  useChangeCustomerPin,
  customerKeys,
} from "@/lib/react-query/hooks/use-customers"
import { GantiPinDialog } from "./_components/ganti-pin-dialog"

// Customer detail type (matches image layout)
type CustomerDetail = {
  id: string
  foto: string
  namaLengkap: string
  nik: string
  tanggalLahir: string
  jenisKelamin: string
  tempatLahir: string
  kota: string
  kelurahan: string
  kecamatan: string
  alamat: string
  telepon1: string
  telepon2: string
  email: string
}

// SPK row type for Daftar SPK table
type SPKRow = {
  id: string
  nomorSPK: string
  namaCustomer: string
  jumlahSPK: number
  sisaSPK: number
  tanggalWaktuSPK: string
}

// Mock: fetch customer by id (replace with API later)
function getCustomerById(id: string): CustomerDetail | null {
  const mock: CustomerDetail = {
    id: "1",
    foto: "/placeholder-avatar.jpg",
    namaLengkap: "Andi Pratama Nugroho",
    nik: "9999011501010001",
    tanggalLahir: "20 November 1990",
    jenisKelamin: "Laki-laki",
    tempatLahir: "Jakarta",
    kota: "Jakarta Timur",
    kelurahan: "Batu Ampar",
    kecamatan: "Kramatjati",
    alamat: "Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta",
    telepon1: "0812345678910",
    telepon2: "-",
    email: "andi.pra@mail.com",
  }
  if (id === "1") return mock
  // Second customer for id 2
  if (id === "2") {
    return {
      ...mock,
      id: "2",
      namaLengkap: "Siti Rahmawati Putri",
      nik: "9999011501010002",
      email: "siti.rahmawati@mail.com",
      telepon1: "0812345678911",
    }
  }
  return mock
}

// Mock: SPK list for customer (replace with API later)
function getSPKByCustomerId(customerId: string): SPKRow[] {
  return [
    {
      id: "1",
      nomorSPK: "SPK/001/20112025",
      namaCustomer: "Andi Pratama Nugroho",
      jumlahSPK: 10_000_000,
      sisaSPK: 10,
      tanggalWaktuSPK: "20 November 2025\n18:33:45",
    },
    {
      id: "2",
      nomorSPK: "SPK/002/20112025",
      namaCustomer: "Siti Rahmawati Putri",
      jumlahSPK: 17_500_000,
      sisaSPK: 10,
      tanggalWaktuSPK: "20 November 2025\n18:33:45",
    },
  ].filter(
    (spk) =>
      spk.namaCustomer === getCustomerById(customerId)?.namaLengkap || true
  )
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

// Columns for Daftar SPK table
const spkColumns: ColumnDef<SPKRow>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      return index + 1
    },
  },
  { accessorKey: "nomorSPK", header: "Nomor SPK" },
  { accessorKey: "namaCustomer", header: "Nama Customer" },
  {
    accessorKey: "jumlahSPK",
    header: "Jumlah SPK",
    cell: ({ row }) =>
      `Rp ${formatCurrency(row.getValue("jumlahSPK") as number)}`,
  },
  { accessorKey: "sisaSPK", header: "Sisa SPK" },
  {
    accessorKey: "tanggalWaktuSPK",
    header: "Tanggal & Waktu SPK",
    cell: ({ row }) => (
      <span className="whitespace-pre-line">
        {String(row.getValue("tanggalWaktuSPK"))}
      </span>
    ),
  },
]

// Loading skeleton for Data Customer card (matches Data Customer layout)
function DataCustomerSkeleton() {
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
                {Array.from({ length: 5 }).map((_, i) => (
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
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
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

// Loading skeleton for Daftar SPK table
function DaftarSPKSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-28" />
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
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function MasterCustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = typeof params.id === "string" ? params.id : ""
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [gantiPinOpen, setGantiPinOpen] = useState(false)

  const changePinMutation = useChangeCustomerPin()

  // Simulate async fetch (replace with useQuery + API)
  const [loading, setLoading] = useState(true)
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [id])

  const customer = useMemo(() => (id ? getCustomerById(id) : null), [id])
  const spkList = useMemo(() => (id ? getSPKByCustomerId(id) : []), [id])

  const filteredSPK = useMemo(() => {
    if (!searchValue.trim()) return spkList
    const q = searchValue.toLowerCase()
    return spkList.filter(
      (row) =>
        row.nomorSPK.toLowerCase().includes(q) ||
        row.namaCustomer.toLowerCase().includes(q)
    )
  }, [spkList, searchValue])

  const handleDetail = (row: SPKRow) => {
    console.log("SPK Detail:", row)
    // Navigate to SPK detail if needed
  }

  const handleEdit = (row: SPKRow) => {
    console.log("SPK Edit:", row)
  }

  const handleDelete = (row: SPKRow) => {
    console.log("SPK Delete:", row)
  }

  const handleGantiPinConfirm = async (pinBaru: string) => {
    if (!id) return
    try {
      await changePinMutation.mutateAsync({
        id,
        data: { newPin: pinBaru },
      })
      toast.success("PIN berhasil diubah")
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) })
      setGantiPinOpen(false)
    } catch {
      toast.error("Gagal mengubah PIN. Periksa kembali data dan coba lagi.")
    }
  }

  if (!id) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Master Customer", href: "/master-customer" },
            { label: "Detail", className: "text-red-600" },
          ]}
        />
        <p className="text-muted-foreground">Customer tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header: title + breadcrumbs + Ganti PIN */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">
            {loading ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              (customer?.namaLengkap ?? "—")
            )}
          </h1>
          <Breadcrumbs
            items={[
              { label: "Master Customer", href: "/master-customer" },
              { label: "Detail", className: "text-red-600" },
            ]}
          />
        </div>
        {!loading && customer && (
          <Button
            variant="outline"
            className="shrink-0 gap-2"
            onClick={() => setGantiPinOpen(true)}
          >
            <Pencil className="size-4" />
            Ganti PIN
          </Button>
        )}
      </div>

      <GantiPinDialog
        open={gantiPinOpen}
        onOpenChange={setGantiPinOpen}
        onConfirm={handleGantiPinConfirm}
        isSubmitting={changePinMutation.isPending}
      />

      {/* Data Customer card */}
      {loading ? (
        <DataCustomerSkeleton />
      ) : customer ? (
        <Card>
          <CardHeader>
            <CardTitle>Data Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <Avatar className="size-48">
                  <AvatarImage src={customer.foto} alt={customer.namaLengkap} />
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
                    <Briefcase className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Customer
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Nama Customer
                      </label>
                      <p className="text-base">{customer.namaLengkap}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        NIK
                      </label>
                      <p className="text-base">{customer.nik}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Tanggal Lahir
                      </label>
                      <p className="text-base">{customer.tanggalLahir}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Jenis Kelamin
                      </label>
                      <p className="text-base">{customer.jenisKelamin}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Tempat Lahir
                      </label>
                      <p className="text-base">{customer.tempatLahir}</p>
                    </div>
                  </div>
                </div>

                {/* Detail Kontak */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Kontak
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Kota
                      </label>
                      <p className="text-base">{customer.kota}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Kelurahan
                      </label>
                      <p className="text-base">{customer.kelurahan}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Alamat
                      </label>
                      <p className="text-base">{customer.alamat}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Telepon 1
                      </label>
                      <p className="text-base">{customer.telepon1}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        E-mail
                      </label>
                      <p className="text-base">{customer.email}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Kecamatan
                      </label>
                      <p className="text-base">{customer.kecamatan}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Telepon 2
                      </label>
                      <p className="text-base">{customer.telepon2}</p>
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
            <p className="text-destructive">Customer tidak ditemukan.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/master-customer")}
            >
              Kembali ke Master Customer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Daftar SPK card */}
      {loading ? (
        <DaftarSPKSkeleton />
      ) : customer ? (
        <DataTable<SPKRow, unknown>
          columns={spkColumns as ColumnDef<SPKRow, unknown>[]}
          data={filteredSPK}
          title="Daftar SPK"
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : null}
    </div>
  )
}
