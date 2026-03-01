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
import { Progress } from "@workspace/ui/components/progress"
import {
  useAuctionBatch,
  useFinalizeAuctionBatch,
  useCancelAuctionBatch,
  auctionBatchKeys,
} from "@/lib/react-query/hooks/use-auction-batches"
import { useQueryClient } from "@tanstack/react-query"
import type { AuctionBatch } from "@/lib/api/types"
import { Box, Pencil, QrCode, Trash2, Printer, CheckCircle } from "lucide-react"
import { QRCodeDialog } from "../../_components/QRCodeDialog"
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
import { toast } from "sonner"

type BatchItemRow = {
  id: string
  no: number
  foto?: string
  noSPK: string
  tipeBarang: string
  lokasi: string
  statusPengambilan: string
  statusValidasi: string
  isMata?: boolean
}

function mapBatchToItemRows(batch: AuctionBatch): BatchItemRow[] {
  const items = batch.items ?? []
  const storeName = batch.store?.shortName ?? "-"
  return items.map((item, idx) => {
    const spk = (item as { spk?: { spkNumber: string } }).spk
    const spkItem = (
      item as {
        spkItem?: {
          itemType?: { typeName: string }
          description: string
          photoUrl?: string
        }
      }
    ).spkItem
    const noSPK = spk?.spkNumber ?? "-"
    const tipeBarang = spkItem?.itemType?.typeName ?? "-"
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
    return {
      id: item.uuid,
      no: idx + 1,
      foto: spkItem?.photoUrl,
      noSPK,
      tipeBarang,
      lokasi: storeName,
      statusPengambilan: pickedUp ? "Terscan" : "Belum Terscan",
      statusValidasi,
      isMata: false,
    }
  })
}

function BatchHeaderSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-4 h-2 w-full" />
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

  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrValue, setQrValue] = useState("")
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const itemRows = useMemo(
    () => (batch ? mapBatchToItemRows(batch) : []),
    [batch]
  )

  const totalItems = batch?.items?.length ?? 0
  const pickedUpCount = (batch?.items ?? []).filter(
    (i) =>
      (i as { pickedUp?: boolean }).pickedUp === true ||
      (i as { pickupStatus?: string }).pickupStatus === "picked_up" ||
      (i as { pickupStatus?: string }).pickupStatus === "completed"
  ).length
  const validatedCount = (batch?.items ?? []).filter(
    (i) => !!(i as { validationVerdict?: string }).validationVerdict
  ).length
  const progressPct = totalItems > 0 ? (validatedCount / totalItems) * 100 : 0
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

  if (!slug) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Pages", href: "/" },
            { label: "Lelang", href: "/lelangan" },
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
              <Skeleton className="h-8 w-48" />
            ) : (
              `Detail Batch ${batch?.batchCode ?? slug}`
            )}
          </h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: "Lelang", href: "/lelangan" },
              {
                label: "Detail Batch",
                className: "text-destructive",
              },
            ]}
          />
        </div>
      </div>

      {/* Batch header card */}
      {isLoading ? (
        <BatchHeaderSkeleton />
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
                <CardTitle>Data Batch</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => router.push(`/validasi-lelangan/${slug}`)}
                  >
                    <Pencil className="size-4" />
                    Edit Batch
                  </Button>
                  {/* <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.print()}
                  >
                    <Printer className="size-4" />
                    Cetak Daftar
                  </Button> */}
                  {batch.status !== "cancelled" &&
                    batch.status !== "ready_for_auction" && (
                      <Button
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10 gap-2"
                        onClick={() => setIsDeleteDialogOpen(true)}
                      >
                        <Trash2 className="size-4" />
                        Hapus Batch
                      </Button>
                    )}
                  {canApprove && (
                    <Button
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                      onClick={() => setIsApproveDialogOpen(true)}
                      disabled={finalizeMutation.isPending}
                    >
                      <CheckCircle className="size-4" />
                      Approve Batch
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">ID Batch</p>
                  <p className="font-medium">{batch.batchCode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Toko</p>
                  <p className="font-medium">{batch.store?.shortName ?? "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    Penanggung Jawab
                  </p>
                  <p className="font-medium">
                    {(
                      batch as {
                        assignee?: { fullName?: string; name?: string }
                      }
                    ).assignee?.fullName ??
                      (
                        batch as {
                          assignee?: { fullName?: string; name?: string }
                        }
                      ).assignee?.name ??
                      "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Status</p>
                  <Badge variant="outline">{batch.status}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Jumlah Item</p>
                  <p className="font-medium">{totalItems}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Progress</p>
                  <p className="text-sm">
                    Diambil {pickedUpCount}/{totalItems}, Validasi{" "}
                    {validatedCount}/{totalItems}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Progress Validasi
                </p>
                <Progress value={progressPct} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Item list table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Item Lelang</CardTitle>
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
                      <TableHead>No. SPK</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Status Pengambilan</TableHead>
                      <TableHead>Status Validasi</TableHead>
                      <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemRows.map((row) => (
                      <TableRow
                        key={row.id}
                        className={
                          row.isMata ? "bg-red-50 dark:bg-red-950/30" : ""
                        }
                      >
                        <TableCell>{row.no}</TableCell>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={row.foto} alt="" />
                            <AvatarFallback>
                              <Box className="text-muted-foreground size-5" />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          {row.noSPK}
                        </TableCell>
                        <TableCell>{row.tipeBarang}</TableCell>
                        <TableCell>{row.lokasi}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              row.statusPengambilan === "Terscan"
                                ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
                                : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            }
                          >
                            {row.statusPengambilan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              row.statusValidasi === "OK"
                                ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
                                : row.statusValidasi === "Reject"
                                  ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
                                  : "border-gray-500/20 bg-gray-500/10 text-gray-700 dark:text-gray-400"
                            }
                          >
                            {row.statusValidasi}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => {
                              setQrValue(row.noSPK)
                              setQrDialogOpen(true)
                            }}
                          >
                            <QrCode className="size-4" />
                          </Button>
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
    </div>
  )
}
