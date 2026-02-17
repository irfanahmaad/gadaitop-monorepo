"use client"

import React, { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2, Home, Store, Loader2, X, Save } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Label } from "@workspace/ui/components/label"
import { useBranch, useDeleteBranch } from "@/lib/react-query/hooks/use-branches"
import type { Branch } from "@/lib/api/types"

// Toko detail type (UI shape)
type TokoDetail = {
  id: string
  foto: string
  kodeLokasi: string
  namaToko: string
  alias: string
  noTelepon: string
  kota: string
  pinjamPT: string | null
  alamat: string
}

function mapBranchToTokoDetail(branch: Branch): TokoDetail {
  const company = branch.company as { companyName?: string } | undefined
  return {
    id: branch.uuid,
    foto: "",
    kodeLokasi: branch.branchCode,
    namaToko: branch.fullName,
    alias: branch.shortName,
    noTelepon: branch.phone ?? "",
    kota: branch.city ?? "",
    pinjamPT: company?.companyName ?? null,
    alamat: branch.address ?? "",
  }
}

// PT options for Pindah Toko dialog (static until transfer API exists)
const ptOptions = [
  { value: "pt1", label: "PT Gadai Top Indonesia" },
  { value: "pt2", label: "PT Gadai Top Premium" },
  { value: "pt3", label: "PT Gadai Top Sukses Jaya" },
]

// Loading skeleton for Data Toko card
function DataTokoSkeleton() {
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
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
                {/* Full width field for Alamat */}
                <div className="space-y-2 md:col-span-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MasterTokoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : ""
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pindahTokoDialogOpen, setPindahTokoDialogOpen] = useState(false)
  const [selectedPT, setSelectedPT] = useState<string>("")
  const [isSubmittingPindahToko, setIsSubmittingPindahToko] = useState(false)

  const { data: branchData, isLoading, isError } = useBranch(id)
  const deleteBranchMutation = useDeleteBranch()

  const toko = useMemo(
    () => (branchData ? mapBranchToTokoDetail(branchData) : null),
    [branchData]
  )

  const handleEdit = () => {
    router.push(`/master-toko/${id}/edit`)
  }

  const handlePindahToko = () => {
    setPindahTokoDialogOpen(true)
    setSelectedPT("")
  }

  const handleSimpanPindahToko = async () => {
    if (!selectedPT) {
      toast.error("Pilih PT terlebih dahulu")
      return
    }
    // Backend transfer endpoint not yet available
    toast.info("Fitur pindah kepemilikan belum tersedia")
    setPindahTokoDialogOpen(false)
    setSelectedPT("")
    setIsSubmittingPindahToko(false)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteBranchMutation.mutateAsync(id)
      setDeleteDialogOpen(false)
      toast.success("Data Toko berhasil dihapus")
      router.push("/master-toko")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus data Toko"
      toast.error(message)
    }
  }

  if (!id) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Master Toko", href: "/master-toko" },
            { label: "Detail", className: "text-destructive" },
          ]}
        />
        <p className="text-muted-foreground">Toko tidak ditemukan.</p>
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
              {isLoading ? (
                <Skeleton className="h-8 w-64" />
              ) : (
                (toko?.namaToko ?? "—")
              )}
            </h1>
            <Breadcrumbs
              items={[
                { label: "Master Toko", href: "/master-toko" },
                { label: "Detail", className: "text-destructive" },
              ]}
            />
          </div>

          {!isLoading && toko && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handlePindahToko}
                className="border-yellow-500/20 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-400"
              >
                <Home className="mr-2 size-4" />
                Pindah Toko
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 size-4" />
                Hapus
              </Button>
            </div>
          )}
        </div>

        {/* Data Toko card */}
        {isLoading ? (
          <DataTokoSkeleton />
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-destructive">Gagal memuat data</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/master-toko")}
              >
                Kembali ke Master Toko
              </Button>
            </CardContent>
          </Card>
        ) : toko ? (
          <Card>
            <CardHeader>
              <CardTitle>Data Toko</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  <Avatar className="size-48">
                    <AvatarImage src={toko.foto} alt={toko.namaToko} />
                    <AvatarFallback>
                      <Store className="text-muted-foreground size-24" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Detail Information */}
                <div className="space-y-8">
                  {/* Detail Toko */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Store className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Detail Toko
                      </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Kode Lokasi
                        </label>
                        <p className="text-base">{toko.kodeLokasi}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Nama Toko
                        </label>
                        <p className="text-base">{toko.namaToko}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Alias
                        </label>
                        <p className="text-base">{toko.alias}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          No. Telepon
                        </label>
                        <p className="text-base">{toko.noTelepon}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Kota
                        </label>
                        <p className="text-base">{toko.kota}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Pinjam PT (Opsional)
                        </label>
                        <p className="text-base">{toko.pinjamPT || "-"}</p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Alamat
                        </label>
                        <p className="text-base">{toko.alamat}</p>
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
              <p className="text-destructive">Toko tidak ditemukan.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/master-toko")}
              >
                Kembali ke Master Toko
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pindah Toko Dialog */}
      <Dialog
        open={pindahTokoDialogOpen}
        onOpenChange={setPindahTokoDialogOpen}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pindah Kepemilikan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pilih-pt">Pilih PT</Label>
              <Select value={selectedPT} onValueChange={setSelectedPT}>
                <SelectTrigger id="pilih-pt" className="w-full">
                  <SelectValue placeholder="Pilih PT" />
                </SelectTrigger>
                <SelectContent>
                  {ptOptions.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      {pt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPindahTokoDialogOpen(false)}
              disabled={isSubmittingPindahToko}
            >
              <X className="mr-2 size-4" />
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleSimpanPindahToko}
              disabled={isSubmittingPindahToko || !selectedPT}
            >
              {isSubmittingPindahToko ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Toko</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <strong>{toko?.namaToko}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
