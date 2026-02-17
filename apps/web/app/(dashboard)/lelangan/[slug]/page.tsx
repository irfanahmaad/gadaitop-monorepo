"use client"

import React, { useState } from "react"
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
import { useAuctionBatch } from "@/lib/react-query/hooks/use-auction-batches"
import type { AuctionItemDetail, SpkItem } from "@/lib/api/types"
import { Box, Pencil, QrCode } from "lucide-react"
import Image from "next/image"
import { QRCodeDialog } from "../../_components/QRCodeDialog"

// Batch item may come from API as AuctionItemDetail (with spk) or as DTO (spkItemId, pickupStatus, validationVerdict only)
type BatchItemShape = AuctionItemDetail & {
  pickedUp?: boolean
  validated?: boolean
  validationVerdict?: string
  pickupStatus?: string
}

// Derive display data from first batch item (SPK + first SPK item when available)
function getDetailFromItem(
  item: BatchItemShape,
  storeName?: string,
  batchCode?: string
): {
  noSPK: string
  namaBarang: string
  tipeBarang: string
  kondisiBarang: string
  kelengkapanBarang: string
  statusBarang: string
  imei: string
  toko: string
  statusPengambilan: string
  statusValidasiMarketing: string
  photoUrl?: string
} {
  const spk = item.spk
  const firstSpkItem: SpkItem | undefined = spk?.items?.[0]
  const spkNumber = spk?.spkNumber ?? "-"
  const itemTypeName = firstSpkItem?.itemType?.typeName ?? "-"
  const description = firstSpkItem?.description ?? "-"
  const photoUrl = firstSpkItem?.photoUrl

  const pickedUp =
    item.pickedUp ??
    (item.pickupStatus === "picked_up" || item.pickupStatus === "completed")
  const validated = item.validated ?? !!item.validationVerdict
  const validationVerdict = item.validationVerdict ?? null

  return {
    noSPK: spkNumber,
    namaBarang: description !== "-" ? description : itemTypeName !== "-" ? itemTypeName : batchCode ?? "-",
    tipeBarang: itemTypeName,
    kondisiBarang: "-",
    kelengkapanBarang: "-",
    statusBarang: "-",
    imei: "-",
    toko: storeName ?? "-",
    statusPengambilan: pickedUp ? "Diambil" : "-",
    statusValidasiMarketing: validated
      ? "OK"
      : validationVerdict
        ? String(validationVerdict)
        : "-",
    photoUrl,
  }
}

function DetailItemSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
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
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
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

export default function LelanganDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = typeof params.slug === "string" ? params.slug : ""

  const { data: batch, isLoading, isError } = useAuctionBatch(slug)
  const firstItem = batch?.items?.[0]
  const storeName = batch?.store?.shortName
  const detail =
    firstItem && getDetailFromItem(firstItem, storeName, batch?.batchCode)
  const pageTitle = detail?.namaBarang ?? batch?.batchCode ?? "Detail Item"
  const [qrDialogOpen, setQrDialogOpen] = useState(false)

  if (!slug) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Lelangan", href: "/lelangan" },
            { label: "Detail Item", className: "text-destructive" },
          ]}
        />
        <p className="text-muted-foreground">Batch tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header: title, breadcrumbs, Edit */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            Lelangan / Detail Item
          </p>
          <h1 className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              pageTitle
            )}
          </h1>
          <Breadcrumbs
            items={[
              { label: "Lelangan", href: "/lelangan" },
              { label: "Detail", className: "text-destructive" },
            ]}
          />
        </div>
        {!isLoading && batch && (
          <Button
            variant="outline"
            className="shrink-0 gap-2"
            onClick={() => router.push(`/validasi-lelangan/${slug}`)}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
        )}
      </div>

      {/* Detail Item card */}
      {isLoading ? (
        <DetailItemSkeleton />
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
      ) : !firstItem ? (
        <Card>
          <CardHeader>
            <CardTitle>Detail Item</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground py-6 text-center">
              Batch ini belum memiliki item.
            </p>
          </CardContent>
        </Card>
      ) : detail ? (
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <CardTitle>Detail Item</CardTitle>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setQrDialogOpen(true)}
              >
                <QrCode className="size-4" />
                QR Code SPK
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              {/* Item image */}
              <div className="flex justify-center">
                {detail.photoUrl ? (
                  <div className="relative size-48 overflow-hidden rounded-full border-2 border-muted">
                    <Image
                      src={detail.photoUrl}
                      alt={detail.namaBarang}
                      fill
                      className="object-cover"
                      sizes="192px"
                    />
                  </div>
                ) : (
                  <div className="flex size-48 items-center justify-center rounded-full border-2 border-dashed border-muted bg-muted/30">
                    <Box className="text-muted-foreground size-24" />
                  </div>
                )}
              </div>

              {/* Detail Barang section */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Box className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Barang
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        No. SPK
                      </label>
                      <p className="text-base">{detail.noSPK}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Nama Barang
                      </label>
                      <p className="text-base">{detail.namaBarang}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Tipe Barang
                      </label>
                      <p className="text-base">{detail.tipeBarang}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Kondisi Barang
                      </label>
                      <p className="text-base">{detail.kondisiBarang}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Kelengkapan Barang
                      </label>
                      <p className="text-base">
                        {detail.kelengkapanBarang}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Status Barang
                      </label>
                      <p className="text-base">{detail.statusBarang}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        IMEI
                      </label>
                      <p className="text-base">{detail.imei}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Toko
                      </label>
                      <p className="text-base">{detail.toko}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Status Pengambilan
                      </label>
                      <p className="text-base">
                        {detail.statusPengambilan}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Status Validasi Marketing
                      </label>
                      <p className="text-base">
                        {detail.statusValidasiMarketing}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {detail && (
        <QRCodeDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          value={detail.noSPK}
          title="QR Code SPK"
        />
      )}
    </div>
  )
}
