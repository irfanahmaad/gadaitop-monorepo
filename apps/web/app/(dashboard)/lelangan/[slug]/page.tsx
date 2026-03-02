"use client"

import React, { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  useAuctionBatch,
  useFinalizeAuctionBatch,
  useCancelAuctionBatch,
  auctionBatchKeys,
} from "@/lib/react-query/hooks/use-auction-batches"
import { usePawnTerms } from "@/lib/react-query/hooks/use-pawn-terms"
import { matchSpkItemToMataRules } from "@/lib/utils/mata-rule-matcher"
import { useQueryClient } from "@tanstack/react-query"
import type { AuctionBatch, PawnTerm, SpkItem } from "@/lib/api/types"
import {
  Box,
  Pencil,
  QrCode,
  Trash2,
  CheckCircle,
  ChevronDown,
  SearchIcon,
  SlidersHorizontal,
  User,
  MoreVertical,
  Eye,
  Info,
  Hand,
} from "lucide-react"
import { QRCodeDialog } from "../../_components/QRCodeDialog"
import { EditBatchDialog } from "../_components/EditBatchDialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@workspace/ui/lib/utils"

type BatchItemRow = {
  id: string
  spkId: string
  no: number
  foto?: string
  noSPK: string
  namaBarang: string
  tipeBarang: string
  toko: string
  petugas: string
  statusPengambilan: string
  statusValidasi: string
  isMata?: boolean
}

function batchStatusToLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Draft",
    assigned: "Didistribusikan",
    pickup_in_progress: "Diambil",
    validation_pending: "Menunggu",
    ready_for_auction: "Siap Lelang",
    finalized: "OK by Admin",
    cancelled: "Dibatalkan",
    in_progress: "Dalam Proses",
  }
  return map[status] ?? status
}

function getAssigneeName(
  assignedTo: string | { fullName?: string; name?: string } | undefined
): string {
  if (!assignedTo) return "-"
  if (typeof assignedTo === "string") return "Staff"
  return (
    (assignedTo as { fullName?: string }).fullName ??
    (assignedTo as { name?: string }).name ??
    "Staff"
  )
}

function mapBatchToItemRows(
  batch: AuctionBatch,
  pawnTerms: PawnTerm[] | undefined,
  ptId: string | undefined
): BatchItemRow[] {
  const items = batch.items ?? []
  const storeName = batch.store?.shortName ?? "-"
  return items.map((item, idx) => {
    const spk = (item as { spk?: { spkNumber: string; uuid?: string } }).spk
    const spkItem = (
      item as {
        spkItem?: {
          itemType?: { typeName: string }
          description: string
          photoUrl?: string
          [key: string]: unknown
        }
      }
    ).spkItem
    const itemWithAssignee = item as {
      assignee?: { fullName?: string; name?: string }
    }
    const noSPK = spk?.spkNumber ?? "-"
    const spkId = spk?.uuid ?? (item as { spkId?: string }).spkId ?? ""
    const namaBarang = spkItem?.description ?? "-"
    const tipeBarang = spkItem?.itemType?.typeName ?? "-"
    const petugas =
      itemWithAssignee.assignee?.fullName ??
      itemWithAssignee.assignee?.name ??
      "-"
    const pickedUp =
      (item as { pickedUp?: boolean }).pickedUp ??
      ((item as { pickupStatus?: string }).pickupStatus === "picked_up" ||
        (item as { pickupStatus?: string }).pickupStatus === "completed")
    const validationVerdict = (item as { validationVerdict?: string })
      .validationVerdict
    const statusValidasi = validationVerdict
      ? validationVerdict === "ok"
        ? "OK"
        : validationVerdict === "return"
          ? "Return"
          : validationVerdict === "reject"
            ? "Reject"
            : String(validationVerdict)
      : "-"
    const mataResult =
      pawnTerms?.length && ptId && spkItem
        ? matchSpkItemToMataRules(
            spkItem as unknown as SpkItem,
            pawnTerms,
            ptId
          )
        : { isMata: false }
    return {
      id: item.uuid,
      spkId,
      no: idx + 1,
      foto: spkItem?.photoUrl,
      noSPK,
      namaBarang,
      tipeBarang,
      toko: storeName,
      petugas,
      statusPengambilan: pickedUp ? "Terscan" : "Belum Terscan",
      statusValidasi,
      isMata: mataResult.isMata,
    }
  })
}

function BatchHeaderSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-6 rounded" />
            <Skeleton className="h-6 w-36" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ItemTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-40" />
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
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function LelanganDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const slug = typeof params.slug === "string" ? params.slug : ""

  const { data: batch, isLoading, isError } = useAuctionBatch(slug)
  const finalizeMutation = useFinalizeAuctionBatch()
  const cancelMutation = useCancelAuctionBatch()

  const ptId =
    (batch as { ptId?: string } | undefined)?.ptId ??
    batch?.store?.companyId ??
    ""
  const { data: pawnTermsData } = usePawnTerms(undefined)
  const pawnTerms = useMemo(
    () => pawnTermsData?.data ?? [],
    [pawnTermsData?.data]
  )

  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrValue, setQrValue] = useState("")
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isTolakDialogOpen, setIsTolakDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRemoveItemDialogOpen, setIsRemoveItemDialogOpen] = useState(false)
  const [removeItemRow, setRemoveItemRow] = useState<BatchItemRow | null>(null)
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")

  const itemRows = useMemo(
    () =>
      batch ? mapBatchToItemRows(batch, pawnTerms, ptId || undefined) : [],
    [batch, pawnTerms, ptId]
  )

  const filteredItemRows = useMemo(() => {
    if (!searchValue.trim()) return itemRows
    const q = searchValue.toLowerCase()
    return itemRows.filter(
      (row) =>
        row.noSPK.toLowerCase().includes(q) ||
        row.namaBarang.toLowerCase().includes(q) ||
        row.tipeBarang.toLowerCase().includes(q) ||
        row.toko.toLowerCase().includes(q) ||
        row.petugas.toLowerCase().includes(q)
    )
  }, [itemRows, searchValue])

  const assigneeName = batch
    ? getAssigneeName(
        (
          batch as {
            assignedTo?: string | { fullName?: string; name?: string }
          }
        ).assignedTo
      )
    : "-"
  const batchNotes = (batch as { notes?: string } | undefined)?.notes ?? "-"
  const lastUpdatedAt = batch?.updatedAt
    ? format(new Date(batch.updatedAt), "d MMMM yyyy HH:mm:ss", { locale: id })
    : "-"

  const totalItems = batch?.items?.length ?? 0
  const validatedCount = (batch?.items ?? []).filter(
    (i) => !!(i as { validationVerdict?: string }).validationVerdict
  ).length
  const allValidated = totalItems > 0 && validatedCount === totalItems
  const canApprove = batch?.status === "validation_pending" && allValidated

  const handleApprove = async () => {
    if (!slug) return
    try {
      await finalizeMutation.mutateAsync(slug)
      toast.success("Batch disetujui untuk lelang")
      setIsApproveDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.detail(slug) })
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal menyetujui batch"
      )
    }
  }

  const handleDelete = () => {
    if (!slug) return
    cancelMutation.mutate(slug, {
      onSuccess: () => {
        toast.success("Batch berhasil dibatalkan")
        setIsDeleteDialogOpen(false)
        router.push("/lelangan")
      },
      onError: (err) => {
        toast.error(err?.message ?? "Gagal membatalkan batch")
      },
    })
  }

  const handleTolakRetur = () => {
    if (!slug) return
    cancelMutation.mutate(slug, {
      onSuccess: () => {
        toast.success("Batch ditolak / dikembalikan")
        setIsTolakDialogOpen(false)
        router.push("/lelangan")
      },
      onError: (err) => {
        toast.error(err?.message ?? "Gagal menolak batch")
      },
    })
  }

  const handleRemoveFromBatch = () => {
    if (!removeItemRow) return
    // API for removing item from batch not yet available
    toast.info(
      "Fitur hapus item dari batch akan tersedia setelah dukungan API tersedia."
    )
    setIsRemoveItemDialogOpen(false)
    setRemoveItemRow(null)
  }

  const handleClickBatchLelang = () => {
    if (!slug) return
    setIsEditDialogOpen(true)
  }

  if (!slug) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Lelangan", href: "/lelangan" },
            { label: "Detail Batch", className: "text-destructive" },
          ]}
        />
        <p className="text-muted-foreground">Batch tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              (batch?.batchCode ?? slug)
            )}
          </h1>
          <Breadcrumbs
            items={[
              { label: "Lelangan", href: "/lelangan" },
              {
                label: "Detail Batch",
                className: "text-destructive",
              },
            ]}
          />
        </div>
        {!isLoading && batch && (
          <div className="flex flex-wrap items-center gap-2">
            {batch.status !== "cancelled" &&
              batch.status !== "ready_for_auction" && (
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Hapus
                </Button>
              )}
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleClickBatchLelang}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            {batch?.status === "validation_pending" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Approval
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsApproveDialogOpen(true)}
                    disabled={!canApprove || finalizeMutation.isPending}
                  >
                    <CheckCircle className="mr-2 size-4" />
                    Setujui
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsTolakDialogOpen(true)}
                    disabled={cancelMutation.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <Hand className="mr-2 size-4" />
                    Tolak / Retur
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        )}
      </div>

      {/* Detail Batch card */}
      {isLoading ? (
        <>
          <BatchHeaderSkeleton />
          <ItemTableSkeleton />
        </>
      ) : isError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Gagal memuat data</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/lelangan")}
            >
              Kembali ke Lelangan
            </Button>
          </CardContent>
        </Card>
      ) : !batch ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Data tidak ditemukan</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/lelangan")}
            >
              Kembali ke Lelangan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Detail Batch</CardTitle>
                <Badge
                  variant="secondary"
                  className="text-muted-foreground shrink-0 font-normal"
                >
                  {batchStatusToLabel(batch.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Box className="text-destructive size-6" />
                  <h2 className="text-destructive text-lg font-semibold">
                    Detail Katalog
                  </h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      ID Batch
                    </label>
                    <p className="text-base">{batch.batchCode}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Nama Batch
                    </label>
                    <p className="text-base">
                      {(batch as { name?: string }).name ??
                        `Batch ${batch.batchCode}`}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Marketing Staf
                    </label>
                    <p className="flex items-center gap-2 text-base">
                      <User className="text-muted-foreground size-4" />
                      {assigneeName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Staf Lelang
                    </label>
                    <p className="flex items-center gap-2 text-base">
                      <User className="text-muted-foreground size-4" />
                      {assigneeName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Toko
                    </label>
                    <p className="text-base">{batch.store?.shortName ?? "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Jumlah Item
                    </label>
                    <p className="text-base">{totalItems}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Last Updated At
                    </label>
                    <p className="text-base">{lastUpdatedAt}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Catatan
                    </label>
                    <p className="text-base">{batchNotes}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item Batch Lelang table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Item Batch Lelang</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => setPageSize(Number(v))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-full sm:w-64">
                    <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      placeholder="Cari..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {itemRows.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  Batch ini belum memiliki item.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Foto</TableHead>
                      <TableHead>No.SPK</TableHead>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Tipe Barang</TableHead>
                      <TableHead>Toko</TableHead>
                      <TableHead>Petugas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItemRows.slice(0, pageSize).map((row) => (
                      <TableRow
                        key={row.id}
                        className={
                          row.isMata ? "bg-red-50 dark:bg-red-950/30" : ""
                        }
                      >
                        <TableCell>{row.no}</TableCell>
                        <TableCell>
                          <Avatar className="size-10">
                            <AvatarImage src={row.foto} alt="" />
                            <AvatarFallback>
                              <Box className="text-muted-foreground size-5" />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{row.noSPK}</span>
                            {!row.isMata && (
                              <span
                                title="Item tidak sesuai syarat Mata"
                                className="inline-flex shrink-0"
                              >
                                <Eye className="text-destructive size-4" />
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{row.namaBarang}</TableCell>
                        <TableCell>{row.tipeBarang}</TableCell>
                        <TableCell>{row.toko}</TableCell>
                        <TableCell>{row.petugas}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex rounded px-2 py-1 text-xs font-medium",
                              row.statusPengambilan === "Terscan"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : "bg-destructive/10 text-destructive"
                            )}
                          >
                            {row.statusPengambilan}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  row.spkId && router.push(`/spk/${row.spkId}`)
                                }
                                disabled={!row.spkId}
                              >
                                <Info className="mr-2 size-4" />
                                Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setQrValue(row.noSPK)
                                  setQrDialogOpen(true)
                                }}
                              >
                                <QrCode className="mr-2 size-4" />
                                QR SPK
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setRemoveItemRow(row)
                                  setIsRemoveItemDialogOpen(true)
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 size-4" />
                                Hapus dari Batch
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        value={qrValue}
        title="QR Code SPK"
      />

      <EditBatchDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        batch={batch ?? null}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: auctionBatchKeys.detail(slug) })
        }}
      />

      <ConfirmationDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        onConfirm={handleApprove}
        title="Approve Batch"
        description="Semua item telah tervalidasi OK. Approve batch untuk lelang?"
        confirmLabel="Ya"
        variant="info"
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Hapus Batch"
        description="Anda akan membatalkan batch ini. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="destructive"
      />

      <ConfirmationDialog
        open={isTolakDialogOpen}
        onOpenChange={setIsTolakDialogOpen}
        onConfirm={handleTolakRetur}
        title="Tolak / Retur Batch"
        description="Batch akan ditolak dan dikembalikan. Anda yakin?"
        confirmLabel="Tolak / Retur"
        variant="destructive"
      />

      <ConfirmationDialog
        open={isRemoveItemDialogOpen}
        onOpenChange={(open) => {
          setIsRemoveItemDialogOpen(open)
          if (!open) setRemoveItemRow(null)
        }}
        onConfirm={handleRemoveFromBatch}
        title="Hapus dari Batch"
        description={
          removeItemRow
            ? `Hapus item "${removeItemRow.namaBarang}" (${removeItemRow.noSPK}) dari batch?`
            : "Hapus item dari batch?"
        }
        confirmLabel="Hapus"
        variant="destructive"
      />
    </div>
  )
}
