"use client"

import React, { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
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
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ChevronRight, Package, ClipboardList, Box, BarChart3 } from "lucide-react"
import { useStockOpnameSession } from "@/lib/react-query/hooks/use-stock-opname"
import { usePublicUrl } from "@/lib/react-query/hooks/use-upload"
import type { StockOpnameItem as ApiStockOpnameItem } from "@/lib/api/types"

function DamagePhotoImage({ storageKey }: { storageKey: string }) {
  const { data } = usePublicUrl(storageKey)
  if (!data?.url)
    return (
      <div className="size-20 shrink-0 animate-pulse rounded-lg bg-muted" />
    )
  return (
    <div className="size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- resolved upload URL */}
      <img
        src={data.url}
        alt=""
        className="size-full object-cover"
      />
    </div>
  )
}

function DetailItemSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
          <div className="flex justify-center">
            <Skeleton className="size-48 rounded-full" />
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
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

export default function StockOpnameDetailItemPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const itemId = params.itemId as string

  const { data: session, isLoading, isError } = useStockOpnameSession(slug, {
    enabled: !!slug && !!itemId,
  })

  const apiItem = useMemo(() => {
    if (!session?.items?.length) return null
    return (session.items as ApiStockOpnameItem[]).find(
      (i) => i.uuid === itemId || (i as { id?: string }).id === itemId
    ) ?? null
  }, [session?.items, itemId])

  const storeName = useMemo(() => {
    if (!session?.stores?.length) return "—"
    const first = session.stores[0]
    return first?.shortName ?? first?.fullName ?? first?.uuid ?? "—"
  }, [session?.stores])

  const si = apiItem?.spkItem
  const itemTitle = si?.description ?? "Detail Item"
  const spkNumber = si?.spk?.spkNumber ?? "—"
  const typeName = si?.itemType?.typeName ?? "—"
  const conditionAfter = apiItem?.conditionAfter
  const conditionBefore = apiItem?.conditionBefore
  const conditionDisplay =
    conditionAfter ?? conditionBefore ?? (si as { condition?: string })?.condition ?? "—"
  const evidencePhotos = si?.evidencePhotos ?? apiItem?.photos ?? []
  const damagePhotos = apiItem?.damagePhotos ?? []
  const statusPengambilan =
    apiItem?.countedQuantity != null && apiItem.countedQuantity > 0
      ? "Terscan"
      : "Belum Terscan"

  const allEvidenceUrls = useMemo(() => {
    const urls: string[] = [...evidencePhotos]
    return urls
  }, [evidencePhotos])

  if (isError || (!isLoading && !apiItem)) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Detail Item</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Data item tidak ditemukan</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/stock-opname/auditor/${slug}`)}
            >
              Kembali ke Detail Batch
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header: title + breadcrumbs */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {isLoading ? (
            <Skeleton className="inline-block h-8 w-48" />
          ) : (
            itemTitle
          )}
        </h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/stock-opname/auditor">
                Stock Opname
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/stock-opname/auditor/${slug}`}>
                Detail Batch
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-destructive font-medium">
                Detail Item
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Data Card */}
      {isLoading ? (
        <DetailItemSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Detail Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              {/* Avatar column */}
              <div className="flex justify-center">
                <Avatar className="size-48">
                  <AvatarImage
                    src={allEvidenceUrls[0]}
                    alt={itemTitle}
                  />
                  <AvatarFallback className="bg-muted">
                    <Package className="text-muted-foreground size-24" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Content column */}
              <div className="space-y-8">
                {/* Detail Barang */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Box className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Barang
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 items-start">
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        No. SPK
                      </label>
                      <p className="text-base">{spkNumber}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Kondisi Barang
                      </label>
                      <p className="text-base capitalize">
                        {String(conditionDisplay)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Toko
                      </label>
                      <p className="text-base">{storeName}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Kelengkapan Barang
                      </label>
                      <p className="text-base">—</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Tipe Barang
                      </label>
                      <p className="text-base">{typeName}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        IMEI
                      </label>
                      <p className="text-base">—</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Tanggal Jatuh Tempo
                      </label>
                      <p className="text-base">—</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Status
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 items-start">
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Status Barang
                      </label>
                      <p className="text-base">—</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Status Pengambilan
                      </label>
                      <p className="text-base">{statusPengambilan}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Alasan
                      </label>
                      <p className="text-base">—</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Status Validasi Marketing
                      </label>
                      <p className="text-base">OK</p>
                    </div>
                  </div>
                </div>

                {/* Bukti */}
                {(allEvidenceUrls.length > 0 || damagePhotos.length > 0) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Bukti
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
                      {allEvidenceUrls.map((url, i) => (
                        <div
                          key={`ev-${i}`}
                          className="size-20 shrink-0 overflow-hidden rounded-lg border bg-muted"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt=""
                            className="size-full object-cover"
                          />
                        </div>
                      ))}
                      {damagePhotos.map((key, i) => (
                        <DamagePhotoImage
                          key={key || `dm-${i}`}
                          storageKey={key}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/stock-opname/auditor/${slug}`)}
        >
          Kembali ke Detail Batch
        </Button>
        {apiItem &&
          statusPengambilan === "Belum Terscan" && (
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                router.push(
                  `/stock-opname/auditor/${slug}/item/${itemId}/penilaian`
                )
              }
            >
              Penilaian
            </Button>
          )}
      </div>
    </div>
  )
}
