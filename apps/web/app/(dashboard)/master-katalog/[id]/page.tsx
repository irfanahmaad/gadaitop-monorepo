"use client"

import React, { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2, Package, Clock } from "lucide-react"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/breadcrumbs"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { useCatalog, useDeleteCatalog } from "@/lib/react-query/hooks/use-catalogs"
import { usePublicUrl } from "@/lib/react-query/hooks/use-upload"

// Katalog detail type for view model
type KatalogDetail = {
  id: string
  foto: string
  idKatalog: string
  namaKatalog: string
  tipeBarang: string
  harga: number
  namaPotongan: string
  jumlahPotongan: number
  keterangan: string
}

// Loading skeleton for Data Katalog card
function DataKatalogSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
          <div className="flex justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
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
                <Skeleton className="h-6 w-32" />
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MasterKatalogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : ""
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: catalogData, isLoading: loading, isError } = useCatalog(id)
  const { mutateAsync: deleteCatalog, isPending: isDeleting } = useDeleteCatalog()
  const imageKey = catalogData?.imageUrl ?? ""
  const { data: publicUrlData } = usePublicUrl(imageKey)
  const imageUrl = imageKey && publicUrlData?.url ? publicUrlData.url : ""
  const katalog = useMemo<KatalogDetail | null>(() => {
    if (!catalogData) return null
    return {
      id: catalogData.uuid,
      foto: imageUrl,
      idKatalog: catalogData.code ?? catalogData.uuid.slice(0, 8),
      namaKatalog: catalogData.name ?? catalogData.itemName ?? "-",
      tipeBarang: catalogData.itemType?.typeName ?? "-",
      harga: Number(catalogData.basePrice ?? 0),
      namaPotongan: catalogData.discountName ?? "-",
      jumlahPotongan: Number(catalogData.discountAmount ?? 0),
      keterangan: catalogData.description ?? "",
    }
  }, [catalogData, imageUrl])

  const handleEdit = () => {
    router.push(`/master-katalog/${id}/edit`)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteCatalog(id)
      toast.success("Data Katalog berhasil dihapus")
      setDeleteDialogOpen(false)
      router.push("/master-katalog")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menghapus data Katalog"
      toast.error(message)
    }
  }

  if (!id) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Master Katalog", href: "/master-katalog" },
            { label: "Detail", className: "text-destructive" },
          ]}
        />
        <p className="text-muted-foreground">Katalog tidak ditemukan.</p>
      </div>
    )
  }

  if (!loading && (isError || !katalog)) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Master Katalog", href: "/master-katalog" },
            { label: "Detail", className: "text-destructive" },
          ]}
        />
        <p className="text-muted-foreground">Katalog tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-64" />
              ) : (
                (katalog?.namaKatalog ?? "—")
              )}
            </h1>
            <Breadcrumbs
              items={[
                { label: "Master Katalog", href: "/master-katalog" },
                { label: "Detail", className: "text-destructive" },
              ]}
            />
          </div>

          {!loading && katalog && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 size-4" />
                Hapus
              </Button>
            </div>
          )}
        </div>

        {/* Data Katalog card */}
        {loading ? (
          <DataKatalogSkeleton />
        ) : katalog ? (
          <Card>
            <CardHeader>
              <CardTitle>Data Katalog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
                {/* Catalog Image */}
                <div className="flex justify-center">
                  <Avatar className="size-48">
                    <AvatarImage src={katalog.foto} alt={katalog.namaKatalog} />
                    <AvatarFallback>
                      <Package className="text-muted-foreground size-24" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Detail Information */}
                <div className="space-y-8">
                  {/* Detail Katalog */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Package className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Detail Katalog
                      </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          ID Katalog
                        </label>
                        <p className="text-base">{katalog.idKatalog}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Nama Katalog
                        </label>
                        <p className="text-base">{katalog.namaKatalog}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Tipe Barang
                        </label>
                        <p className="text-base">{katalog.tipeBarang}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Harga
                        </label>
                        <p className="text-base">
                          Rp {formatCurrencyDisplay(katalog.harga)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Potongan Harga */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Potongan Harga
                      </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Nama Potongan
                        </label>
                        <p className="text-base">{katalog.namaPotongan}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Jumlah Potongan
                        </label>
                        <p className="text-base">
                          Rp{formatCurrencyDisplay(katalog.jumlahPotongan)},-
                        </p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Keterangan
                        </label>
                        <p className="text-base">
                          {katalog.keterangan || "-"}
                        </p>
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
              <p className="text-destructive">Katalog tidak ditemukan.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/master-katalog")}
              >
                Kembali ke Master Katalog
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Katalog</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data Katalog{" "}
              <strong>{katalog?.namaKatalog}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
