"use client"

import React, { useMemo, useState } from "react"
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
  useCustomer,
  useChangeCustomerPin,
  customerKeys,
} from "@/lib/react-query/hooks/use-customers"
import { useSpkList } from "@/lib/react-query/hooks/use-spk"
import { useFilterParams, type FilterConfig } from "@/hooks/use-filter-params"
import type { Customer, Spk } from "@/lib/api/types"
import { GantiPinDialog } from "./_components/ganti-pin-dialog"

const daftarSPKFilterConfig: FilterConfig[] = [
  {
    key: "spkRange",
    label: "",
    type: "currencyrange",
    currency: "Rp",
  },
  {
    key: "tanggalRange",
    label: "",
    type: "daterange",
    labelFrom: "Mulai Dari",
    labelTo: "Sampai Dengan",
  },
]

// Display shape for Data Customer card (mapped from API Customer)
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

function mapCustomerToDetail(c: Customer | null | undefined): CustomerDetail | null {
  if (!c) return null
  const id = String(c.id ?? c.uuid ?? "")
  const namaLengkap = c.fullName ?? c.name ?? "—"
  const foto = c.ktpPhotoUrl ?? c.selfiePhotoUrl ?? ""
  const rawDob = c.dateOfBirth ?? c.dob
  const tanggalLahir = rawDob
    ? new Date(rawDob).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—"
  return {
    id,
    foto,
    namaLengkap,
    nik: c.nik ?? "—",
    tanggalLahir,
    jenisKelamin: c.gender ?? "—",
    tempatLahir: "—",
    kota: c.city ?? "—",
    kelurahan: "—",
    kecamatan: "—",
    alamat: c.address ?? "—",
    telepon1: c.phone ?? c.phoneNumber ?? "—",
    telepon2: "—",
    email: c.email ?? "—",
  }
}

// SPK row type for Daftar SPK table (mapped from API Spk)
type SPKRow = {
  id: string
  nomorSPK: string
  namaCustomer: string
  jumlahSPK: number
  sisaSPK: number
  tanggalWaktuSPK: string
}

function formatSpkDateTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "—"
  const date = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  return `${date}\n${time}`
}

function mapSpkToRow(spk: Spk): SPKRow {
  const namaCustomer =
    spk.customer?.fullName ?? spk.customer?.name ?? "—"
  return {
    id: String(spk.id ?? spk.uuid),
    nomorSPK: spk.spkNumber ?? "—",
    namaCustomer,
    jumlahSPK: spk.principalAmount ?? spk.totalAmount ?? 0,
    sisaSPK: spk.tenor ?? 0,
    tanggalWaktuSPK: formatSpkDateTime(spk.createdAt ?? spk.dueDate ?? ""),
  }
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
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  const { filterValues, setFilters } = useFilterParams(daftarSPKFilterConfig)
  const changePinMutation = useChangeCustomerPin()

  const {
    data: customerData,
    isLoading: customerLoading,
    isError: customerError,
  } = useCustomer(id)
  const customerUuid = customerData?.uuid
  const { data: spkData } = useSpkList(
    customerUuid ? { filter: { customerId: customerUuid } } : undefined,
    { enabled: !!customerUuid }
  )

  const customer = useMemo(
    () => mapCustomerToDetail(customerData),
    [customerData]
  )
  const spkList = useMemo(() => {
    const list = spkData?.data ?? []
    return list.map(mapSpkToRow)
  }, [spkData])

  const filteredSPK = useMemo(() => {
    let result = spkList

    // Search filter
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase()
      result = result.filter(
        (row) =>
          row.nomorSPK.toLowerCase().includes(q) ||
          row.namaCustomer.toLowerCase().includes(q)
      )
    }

    // SPK amount range filter
    const spkRange = filterValues.spkRange as
      | { from?: number | string | null; to?: number | string | null }
      | undefined
    if (spkRange?.from != null && spkRange.from !== "") {
      const fromVal = Number(spkRange.from)
      if (!isNaN(fromVal)) {
        result = result.filter((row) => row.jumlahSPK >= fromVal)
      }
    }
    if (spkRange?.to != null && spkRange.to !== "") {
      const toVal = Number(spkRange.to)
      if (!isNaN(toVal)) {
        result = result.filter((row) => row.jumlahSPK <= toVal)
      }
    }

    // Date range filter (tanggalWaktuSPK format: "20 November 2025\n18:33:45")
    const tanggalRange = filterValues.tanggalRange as
      | { from?: string | null; to?: string | null }
      | undefined
    if (tanggalRange?.from || tanggalRange?.to) {
      result = result.filter((row) => {
        const dateStr = row.tanggalWaktuSPK.split("\n")[0]?.trim() ?? ""
        if (!dateStr) return false
        const rowDate = new Date(dateStr)
        if (isNaN(rowDate.getTime())) return false
        const rowYmd = rowDate.toISOString().slice(0, 10)
        if (tanggalRange.from && rowYmd < tanggalRange.from) return false
        if (tanggalRange.to && rowYmd > tanggalRange.to) return false
        return true
      })
    }

    return result
  }, [spkList, searchValue, filterValues])

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
            {customerLoading ? (
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
        {!customerLoading && customer && (
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
      {customerLoading ? (
        <DataCustomerSkeleton />
      ) : customerError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Gagal memuat data customer.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/master-customer")}
            >
              Kembali ke Master Customer
            </Button>
          </CardContent>
        </Card>
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
      {customerLoading ? (
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
          filterConfig={daftarSPKFilterConfig}
          filterValues={filterValues}
          onFilterChange={setFilters}
          filterDialogOpen={filterDialogOpen}
          onFilterDialogOpenChange={setFilterDialogOpen}
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
