"use client"
import React from "react"
import { useParams, useRouter } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { CheckCheck, ChevronDown, Hand } from "lucide-react"
import { DetailSO, type StockOpnameDetail } from "../_components/DetailSO"
import {
  StockOpnameItemTable,
  type StockOpnameItem,
} from "../_components/StockOpnameItemTable"

// Sample detail data - will be replaced with API fetch
const getStockOpnameDetail = (slug: string): StockOpnameDetail | null => {
  const sampleDetail: StockOpnameDetail = {
    idSO: "SO/001",
    tanggal: "25 November 2025 01:00 WIB",
    toko: ["GT Jakarta Satu", "GT Jakarta Dua", "GT Jakarta Tiga"],
    syaratMata: ["Barang Mahal", "Barang Penting"],
    lastUpdatedAt: "20 November 2025 18:33:45",
    petugasSO: ["Ben Affleck", "Rocks D Xebec", "Edward Newgate"],
    uangDiToko: 50_000_000,
    totalUangDiMutasi: 0,
    catatan:
      "Pastikan untuk melakukan SO dengan sangat teliti sehingga tidak ada barang yang terlwat.",
    status: "Dijadwalkan",
  }
  return sampleDetail
}

// Sample items data - will be replaced with API fetch
const getStockOpnameItems = (slug: string): StockOpnameItem[] => {
  return [
    {
      id: "1",
      noSPK: "SPK/002/20112025",
      namaBarang: "iPhone 15 Pro",
      tipeBarang: "Handphone",
      toko: "GT Jakarta Satu",
      petugas: "Ben Affleck",
      statusScan: "Belum Terscan",
    },
    {
      id: "2",
      noSPK: "SPK/003/20112025",
      namaBarang: "Google Smarthome",
      tipeBarang: "IoT",
      toko: "GT Jakarta Dua",
      petugas: "Ben Affleck",
      statusScan: "Belum Terscan",
    },
    {
      id: "3",
      noSPK: "SPK/004/20112025",
      namaBarang: "iPhone 13",
      tipeBarang: "Handphone",
      toko: "GT Jakarta Tiga",
      petugas: "Ben Affleck",
      statusScan: "Belum Terscan",
    },
    {
      id: "4",
      noSPK: "SPK/005/20112025",
      namaBarang: "MacBook Pro M1",
      tipeBarang: "Laptop",
      toko: "GT Jakarta Dua",
      petugas: "Ben Affleck",
      statusScan: "Terscan",
    },
    ...Array.from({ length: 96 }, (_, i) => ({
      id: String(i + 5),
      noSPK: `SPK/${String(i + 6).padStart(3, "0")}/20112025`,
      namaBarang: ["iPhone 15 Pro", "Google Smarthome", "MacBook Pro"][i % 3]!,
      tipeBarang: ["Handphone", "IoT", "Laptop"][i % 3]!,
      toko: ["GT Jakarta Satu", "GT Jakarta Dua", "GT Jakarta Tiga"][i % 3]!,
      petugas: "Ben Affleck",
      statusScan:
        i % 3 === 0 ? ("Terscan" as const) : ("Belum Terscan" as const),
    })),
  ]
}

// Skeleton components
function DetailSOSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="mb-6 flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-dashed pb-3">
            <Skeleton className="h-1 w-8 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-dashed pt-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-full" />
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
        <div className="flex flex-row items-center justify-between">
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
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-8" />
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-48" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function StockOpnameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  // Simulate loading - in real app, use useQuery/useSWR
  const [isLoading] = React.useState(false)
  const detail = getStockOpnameDetail(slug)
  const items = getStockOpnameItems(slug)

  const handleItemDetail = (item: StockOpnameItem) => {
    // Navigate to item/SPK detail when implemented
    console.log("Item detail:", item)
  }

  if (!detail && !isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Stock Opname / Detail</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Data tidak ditemukan</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/stock-opname")}
            >
              Kembali ke Stock Opname
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Stock Opname / Detail</h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: "Stock Opname", href: "/stock-opname" },
              { label: "Detail" },
            ]}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="destructive" className="gap-2">
              Approval
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <CheckCheck className="size-4" />
              Setujui
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Hand className="size-4" />
              Tolak / Retur
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Detail SO Section */}
      {isLoading ? (
        <DetailSOSkeleton />
      ) : detail ? (
        <DetailSO data={detail} />
      ) : null}

      {/* Daftar Item Section */}
      {isLoading ? (
        <ItemTableSkeleton />
      ) : (
        <StockOpnameItemTable data={items} onDetailAction={handleItemDetail} />
      )}
    </div>
  )
}
