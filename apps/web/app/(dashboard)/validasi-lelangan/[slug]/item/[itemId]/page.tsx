"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import { Package, FileImage, QrCode, ChevronRight } from "lucide-react"

// Detail item shape (extends list item with extra fields for detail view)
interface DetailItemLelang {
  id: string
  namaBarang: string
  foto?: string
  noSpk: string
  tipeBarang: string
  kondisiBarang: string
  toko: string
  kelengkapanBarang: string
  imei: string
  tanggalJatuhTempo: string
  statusBarang: string
  statusValidasiMarketing: string
  statusPengambilan: string
  alasan: string
}

// Dummy detail data keyed by itemId (in real app, fetch by slug + itemId)
const detailItemsById: Record<string, DetailItemLelang> = {
  "1": {
    id: "1",
    namaBarang: "iPhone 15 Pro",
    noSpk: "SPK/001/20112025",
    tipeBarang: "Handphone",
    kondisiBarang: "-",
    toko: "GT Jakarta Satu",
    kelengkapanBarang: "Barang lengkap dengan box, dan kabel charger",
    imei: "1122334455665",
    tanggalJatuhTempo: "20 November 2025 18:33:45",
    statusBarang: "-",
    statusValidasiMarketing: "OK",
    statusPengambilan: "Belum Terscan",
    alasan: "-",
  },
  "2": {
    id: "2",
    namaBarang: "Google Smarthome",
    noSpk: "SPK/003/20112025",
    tipeBarang: "IoT",
    kondisiBarang: "-",
    toko: "GT Jakarta Dua",
    kelengkapanBarang: "-",
    imei: "-",
    tanggalJatuhTempo: "-",
    statusBarang: "-",
    statusValidasiMarketing: "-",
    statusPengambilan: "-",
    alasan: "-",
  },
  "3": {
    id: "3",
    namaBarang: "MacBook Pro M1",
    noSpk: "SPK/005/20112025",
    tipeBarang: "Laptop",
    kondisiBarang: "-",
    toko: "GT Jakarta Dua",
    kelengkapanBarang: "-",
    imei: "-",
    tanggalJatuhTempo: "-",
    statusBarang: "-",
    statusValidasiMarketing: "-",
    statusPengambilan: "-",
    alasan: "-",
  },
  "4": {
    id: "4",
    namaBarang: "MacBook Pro M2",
    noSpk: "SPK/006/20112025",
    tipeBarang: "Laptop",
    kondisiBarang: "-",
    toko: "GT Jakarta Tiga",
    kelengkapanBarang: "-",
    imei: "-",
    tanggalJatuhTempo: "-",
    statusBarang: "-",
    statusValidasiMarketing: "-",
    statusPengambilan: "-",
    alasan: "-",
  },
}

function getDetailItem(slug: string, itemId: string): DetailItemLelang | null {
  return detailItemsById[itemId] ?? null
}

export default function DetailItemLelangPage() {
  const params = useParams()
  const slug = params.slug as string
  const itemId = params.itemId as string
  const item = React.useMemo(
    () => getDetailItem(slug, itemId),
    [slug, itemId]
  )

  if (!item) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-muted-foreground">Item tidak ditemukan.</p>
        <Button variant="outline" asChild>
          <Link href={`/validasi-lelangan/${slug}`}>Kembali ke Detail</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header: title + breadcrumbs */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{item.namaBarang}</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/validasi-lelangan">
                Validasi Lelang
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/validasi-lelangan/${slug}`}>
                Detail
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-destructive font-medium">
                Detail Item Lelang
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Data Card: Detail Item (Scan QR in card header per design) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Detail Item</CardTitle>
          <Button
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            asChild
          >
            <Link href={`/validasi-lelangan/${slug}`}>
              <QrCode className="size-4" />
              Scan QR
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
            {/* Left: item image */}
            <div className="flex justify-center">
              <Avatar className="size-48 rounded-lg">
                <AvatarImage src={item.foto} alt={item.namaBarang} />
                <AvatarFallback className="rounded-lg bg-muted">
                  <Package className="text-muted-foreground size-24" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Right: sections */}
            <div className="space-y-8">
              {/* Section: Detail Barang */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package className="text-destructive size-6" />
                  <h2 className="text-destructive text-lg font-semibold">
                    Detail Barang
                  </h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 items-start">
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      No. SPK
                    </label>
                    <p className="text-base">{item.noSpk}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Tipe Barang
                    </label>
                    <p className="text-base">{item.tipeBarang}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Kondisi Barang
                    </label>
                    <p className="text-base">{item.kondisiBarang}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      IMEI
                    </label>
                    <p className="text-base">{item.imei}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Toko
                    </label>
                    <p className="text-base">{item.toko}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Tanggal Jatuh Tempo
                    </label>
                    <p className="text-base">{item.tanggalJatuhTempo}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Kelengkapan Barang
                    </label>
                    <p className="text-base">{item.kelengkapanBarang}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Status Barang
                    </label>
                    <p className="text-base">{item.statusBarang}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Status Validasi Marketing
                    </label>
                    <p className="text-base">{item.statusValidasiMarketing}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Status Pengambilan
                    </label>
                    <p className="text-base">{item.statusPengambilan}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Alasan
                    </label>
                    <p className="text-base">{item.alasan}</p>
                  </div>
                </div>
              </div>

              {/* Section: Bukti */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileImage className="text-destructive size-6" />
                  <h2 className="text-destructive text-lg font-semibold">
                    Bukti
                  </h2>
                </div>
                <div
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-12 min-h-[200px]"
                  aria-label="Area bukti barang"
                >
                  <FileImage className="text-muted-foreground size-12" />
                  <p className="text-muted-foreground text-sm font-medium">
                    Gambar Kosong
                  </p>
                  <p className="text-muted-foreground text-center text-sm">
                    Silakan Scan QR untuk pengisian Bukti Barang
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
