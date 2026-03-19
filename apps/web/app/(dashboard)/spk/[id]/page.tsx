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
  SlidersHorizontal,
  User,
  ClipboardList,
  QrCode,
  Download,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { toast } from "sonner"
import { Badge } from "@workspace/ui/components/badge"
import { useSpk, useSpkNkb } from "@/lib/react-query/hooks/use-spk"
import type { Nkb } from "@/lib/api/types"
import { QRCodeDialog } from "../../_components/QRCodeDialog"
import { useAuth } from "../../../../lib/react-query/hooks/use-auth"
import { usePublicUrl } from "@/lib/react-query/hooks/use-upload"

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

const formatDateOnly = (dateStr: string | undefined | null): string => {
  if (!dateStr) return "-"
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

// NKB type label for display (backend: renewal, partial, full_redemption)
const NKB_TYPE_LABEL: Record<string, string> = {
  extension: "Perpanjangan",
  redemption: "Pelunasan",
  partial_payment: "Angsuran",
  renewal: "Perpanjangan",
  partial: "Angsuran",
  full_redemption: "Pelunasan",
}

// NKB status to display label (backend: pending, confirmed, rejected, failed)
const NKB_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  confirmed: "Lunas",
  rejected: "Ditolak",
  cancelled: "Dibatalkan",
  failed: "Gagal",
}

type NKBRow = {
  id: string
  nomorNKB: string
  nomorSPK: string
  nominalDibayar: number
  jenis: string
  tanggalWaktuPengajuan: string
  status: string
}

function mapNkbToRow(
  nkb: Nkb | Record<string, unknown>,
  spkNumber: string
): NKBRow {
  const type =
    (nkb as { type?: string }).type ??
    (nkb as { paymentType?: string }).paymentType ??
    ""
  const amount =
    (nkb as { amount?: number }).amount ??
    Number((nkb as { amountPaid?: string }).amountPaid ?? 0)
  const status = (nkb as { status?: string }).status ?? "pending"
  return {
    id: (nkb as { uuid?: string }).uuid ?? (nkb as { id?: string }).id ?? "",
    nomorNKB: (nkb as { nkbNumber?: string }).nkbNumber ?? "",
    nomorSPK:
      (nkb as { spk?: { spkNumber?: string } }).spk?.spkNumber ?? spkNumber,
    nominalDibayar: amount,
    jenis: NKB_TYPE_LABEL[type] ?? type,
    tanggalWaktuPengajuan: formatDate(
      ((nkb as { createdAt?: string }).createdAt ?? "") as string
    ),
    status: NKB_STATUS_LABEL[status] ?? status,
  }
}

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
      const status = row.getValue("status") as string
      const variant =
        status === "Lunas" || status === "confirmed"
          ? "secondary"
          : status === "Menunggu" || status === "pending"
            ? "default"
            : "destructive"
      return <Badge variant={variant}>{status}</Badge>
    },
  },
]

// Read-only NKB info dialog (popup on Detail action in Daftar NKB table)
function NKBInfoDialog({
  open,
  onOpenChange,
  nkb,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  nkb: Nkb | (Record<string, unknown> & { id?: string; uuid?: string }) | null
}) {
  if (!nkb) return null

  const n = nkb as Record<string, unknown>
  const paymentType = (n.paymentType as string) ?? (n.type as string) ?? ""
  const amount =
    typeof n.amount === "number" ? n.amount : Number(n.amountPaid ?? 0)
  const status = (n.status as string) ?? "pending"
  const statusLabel = NKB_STATUS_LABEL[status] ?? status
  const isApproved = status === "confirmed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-xl font-bold">
              Informasi NKB
            </DialogTitle>
            <Badge
              className={
                isApproved
                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300"
              }
            >
              {statusLabel}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Nomor NKB
              </label>
              <p className="text-base">{(n.nkbNumber as string) ?? ""}</p>
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Jenis Pembayaran
              </label>
              <p className="text-base">
                {NKB_TYPE_LABEL[paymentType] ?? paymentType}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Total Pembayaran
              </label>
              <p className="text-base">Rp {formatCurrency(amount)},-</p>
            </div>
          </div>
          <div className="space-y-4">
            {(n.spk as { spkNumber?: string })?.spkNumber != null &&
              (n.spk as { spkNumber?: string }).spkNumber !== "" && (
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Nomor SPK
                  </label>
                  <p className="text-base">
                    {(n.spk as { spkNumber?: string }).spkNumber}
                  </p>
                </div>
              )}
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Tanggal & Waktu
              </label>
              <p className="text-base">
                {formatDate((n.createdAt as string) ?? "")}
              </p>
            </div>
            {status === "rejected" && n.rejectionReason != null ? (
              <div className="space-y-2 md:col-span-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Alasan Ditolak
                </label>
                <p className="text-base">{String(n.rejectionReason)}</p>
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            <X className="size-4" />
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
              <div className="grid items-start gap-6 md:grid-cols-2">
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
              <div className="grid items-start gap-6 md:grid-cols-2">
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
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [isNkbDetailDialogOpen, setIsNkbDetailDialogOpen] = useState(false)
  const [selectedNkbForDetail, setSelectedNkbForDetail] = useState<
    Nkb | (Record<string, unknown> & { id?: string; uuid?: string }) | null
  >(null)
  const { user } = useAuth()
  const isCompanyAdmin =
    user?.roles?.some((r) => r.code === "company_admin") ?? false

  const { data: spkData, isLoading: spkLoading, isError: spkError } = useSpk(id)
  const { data: nkbData } = useSpkNkb(id)

  const spk = spkData
  const nkbList = useMemo(() => {
    const raw = nkbData
    return Array.isArray(raw)
      ? raw
      : ((raw as unknown as { data?: Nkb[] })?.data ?? [])
  }, [nkbData])

  const nkbRows = useMemo(() => {
    return nkbList.map((n) => mapNkbToRow(n, spk?.spkNumber ?? ""))
  }, [nkbList, spk?.spkNumber])

  const filteredNKB = useMemo(() => {
    if (!searchValue.trim()) return nkbRows
    const q = searchValue.toLowerCase()
    return nkbRows.filter(
      (row) =>
        row.nomorNKB.toLowerCase().includes(q) ||
        row.nomorSPK.toLowerCase().includes(q)
    )
  }, [nkbRows, searchValue])

  const handleDetail = (row: NKBRow) => {
    const nkb = nkbList.find(
      (n) =>
        (n as { uuid?: string }).uuid === row.id ||
        (n as { id?: string }).id === row.id
    )
    if (!nkb) {
      toast.error("Data NKB tidak ditemukan")
      return
    }
    setSelectedNkbForDetail(nkb)
    setIsNkbDetailDialogOpen(true)
  }

  const handleDownloadFile = () => {
    // TODO: Download File
    toast.info("TODO: Download File")
  }

  const handlePrintQR = () => {
    if (!spk?.spkNumber) {
      toast.error("Nomor SPK tidak tersedia")
      return
    }
    setQrDialogOpen(true)
  }

  const customerName = spk?.customer
    ? ((spk.customer as { name?: string }).name ?? "-")
    : "-"
  const customerPhotoKey = spk?.customer
    ? (spk.customer as { selfiePhotoUrl?: string }).selfiePhotoUrl
    : undefined
  const { data: customerPhotoData } = usePublicUrl(customerPhotoKey ?? "")
  const customerNik = spk?.customer
    ? ((spk.customer as { nik?: string }).nik ?? "-")
    : "-"
  const customerDob = spk?.customer
    ? ((spk.customer as { dob?: string }).dob ?? "-")
    : "-"
  const totalAmount = Number(spk?.totalAmount ?? spk?.principalAmount ?? 0)
  const remainingBalance = (spk as { remainingBalance?: string | number })
    ?.remainingBalance
  const remainingBalanceNum =
    remainingBalance != null ? Number(remainingBalance) : totalAmount

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

  const loading = spkLoading
  const notFound = !spkLoading && (spkError || !spk)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">
            {loading ? (
              <Skeleton className="h-8 w-96" />
            ) : spk ? (
              `${spk.spkNumber} - ${customerName}`
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
        {!loading && spk && !isCompanyAdmin && (
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

      {loading ? (
        <DetailSPKSkeleton />
      ) : notFound ? (
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
      ) : spk ? (
        <Card>
          <CardHeader>
            <CardTitle>Detail SPK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              <div className="flex justify-center">
                <Avatar className="size-48">
                  <AvatarImage
                    src={customerPhotoKey ? customerPhotoData?.url : undefined}
                    alt={customerName}
                  />
                  <AvatarFallback>
                    <User className="text-muted-foreground size-24" />
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Customer
                    </h2>
                  </div>
                  <div className="grid items-start gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        NIK
                      </label>
                      <p className="text-base">{customerNik}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Nama Customer
                      </label>
                      <p className="text-base">{customerName}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Tanggal Lahir
                      </label>
                      <p className="text-base">{formatDateOnly(customerDob)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail SPK
                    </h2>
                  </div>
                  <div className="grid items-start gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        No. SPK
                      </label>
                      <p className="text-base">{spk.spkNumber}</p>
                    </div>
                    {/* <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Sisa SPK
                      </label>
                      <p className="text-base">{spk.tenor}</p>
                    </div> */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Jumlah SPK
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-destructive text-base underline">
                          Rp {formatCurrency(totalAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Sisa Pokok Bulan Ini
                      </label>
                      <p className="text-base">
                        Rp {formatCurrency(remainingBalanceNum)}
                      </p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Tanggal & Waktu SPK
                      </label>
                      <p className="text-base">{formatDate(spk.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <DaftarNKBSkeleton />
      ) : (
        spk && (
          <DataTable<NKBRow, unknown>
            columns={nkbColumns as ColumnDef<NKBRow, unknown>[]}
            data={filteredNKB}
            title="Daftar NKB"
            searchPlaceholder="Cari Nomor NKB / SPK"
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
                    placeholder="Cari Nomor NKB / SPK"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="w-full"
                  />
                </div>
                {/* <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button> */}
              </div>
            }
            initialPageSize={pageSize}
            onPageSizeChange={setPageSize}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onDetail={handleDetail}
            customActions={[
              {
                label: "Download File",
                icon: <Download className="mr-2 h-4 w-4" />,
                onClick: handleDownloadFile,
              },
            ]}
          />
        )
      )}
      {spk?.spkNumber ? (
        <QRCodeDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          value={spk.spkNumber}
          title="QR Code SPK"
          itemId={spk.items?.[0]?.uuid}
          alreadyPrinted={
            typeof spk.items?.[0]?.qrCodePrintCount === "number"
              ? spk.items[0].qrCodePrintCount > 0
              : false
          }
          printCount={
            typeof spk.items?.[0]?.qrCodePrintCount === "number"
              ? spk.items[0].qrCodePrintCount
              : 0
          }
        />
      ) : null}
      <NKBInfoDialog
        open={isNkbDetailDialogOpen}
        onOpenChange={(open) => {
          setIsNkbDetailDialogOpen(open)
          if (!open) setSelectedNkbForDetail(null)
        }}
        nkb={selectedNkbForDetail}
      />
    </div>
  )
}
