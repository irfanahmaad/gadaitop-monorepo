"use client"

import React, { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Briefcase, Pencil, Trash2 } from "lucide-react"
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
import {
  useDeletePawnTerm,
  usePawnTerm,
} from "@/lib/react-query/hooks/use-pawn-terms"
import { getItemConditionLabel } from "@/lib/constants/item-condition"

// Syarat Mata detail type
type SyaratMataDetail = {
  id: string
  namaAturan: string
  tipeBarang: string
  hargaDari: number
  hargaSampai: number
  macetDari: number
  macetSampai: number
  baru: number
  persentase: number
  itemCondition: string
  lastUpdatedAt: Date
}

// Loading skeleton for Data Syarat Mata card
function DataSyaratMataSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8">
          <div className="flex justify-center"></div>
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="h-6 w-48" />
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MasterSyaratMataDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : ""
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: pawnTermData, isLoading: loading, isError } = usePawnTerm(id)
  const { mutateAsync: deletePawnTerm, isPending: isDeleting } =
    useDeletePawnTerm()
  const syaratMata = useMemo<SyaratMataDetail | null>(() => {
    if (!pawnTermData) return null
    return {
      id: pawnTermData.uuid,
      namaAturan: `${pawnTermData.itemType?.typeName ?? "-"} (Tenor ${pawnTermData.tenor ?? pawnTermData.tenorDefault ?? 0})`,
      tipeBarang: pawnTermData.itemType?.typeName ?? "-",
      hargaDari: Number(pawnTermData.loanLimitMin ?? 0),
      hargaSampai: Number(pawnTermData.loanLimitMax ?? 0),
      macetDari: Number(pawnTermData.tenor ?? pawnTermData.tenorDefault ?? 0),
      macetSampai: Number(pawnTermData.tenor ?? pawnTermData.tenorDefault ?? 0),
      baru: Number(pawnTermData.adminFee ?? 0),
      persentase: Number(pawnTermData.interestRate ?? 0),
      itemCondition: getItemConditionLabel(pawnTermData.itemCondition),
      lastUpdatedAt: new Date(pawnTermData.updatedAt),
    }
  }, [pawnTermData])

  const handleEdit = () => {
    router.push(`/master-syarat-mata/${id}/edit`)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deletePawnTerm(id)
      toast.success('Data Syarat "Mata" berhasil dihapus')
      setDeleteDialogOpen(false)
      router.push("/master-syarat-mata")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal menghapus data Syarat "Mata"'
      toast.error(message)
    }
  }

  if (!id) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: 'Master Syarat "Mata"', href: "/master-syarat-mata" },
            { label: "Detail", className: "text-destructive" },
          ]}
        />
        <p className="text-muted-foreground">Data tidak ditemukan.</p>
      </div>
    )
  }

  if (!loading && (isError || !syaratMata)) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: 'Master Syarat "Mata"', href: "/master-syarat-mata" },
            { label: "Detail", className: "text-destructive" },
          ]}
        />
        <p className="text-muted-foreground">Data tidak ditemukan.</p>
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
                (syaratMata?.namaAturan ?? "—")
              )}
            </h1>
            <Breadcrumbs
              items={[
                { label: 'Master Syarat "Mata"', href: "/master-syarat-mata" },
                { label: "Detail", className: "text-destructive" },
              ]}
            />
          </div>

          {!loading && syaratMata && (
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

        {/* Data Syarat Mata card */}
        {loading ? (
          <DataSyaratMataSkeleton />
        ) : syaratMata ? (
          <Card>
            <CardHeader>
              <CardTitle>Detail Syarat &quot;Mata&quot;</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1">
                {/* Empty left column (no avatar) */}
                <div className="flex justify-center"></div>

                {/* Detail Information */}
                <div className="space-y-8">
                  {/* Detail Syarat Mata */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Detail Syarat &quot;Mata&quot;
                      </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Nama Aturan
                        </label>
                        <p className="text-base">{syaratMata.namaAturan}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Tipe Barang
                        </label>
                        <p className="text-base">{syaratMata.tipeBarang}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Harga Dari
                        </label>
                        <p className="text-base">
                          Rp {formatCurrencyDisplay(syaratMata.hargaDari)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Harga Sampai
                        </label>
                        <p className="text-base">
                          Rp {formatCurrencyDisplay(syaratMata.hargaSampai)}
                        </p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Kondisi Barang
                        </label>
                        <p className="text-base">{syaratMata.itemCondition}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Macet Dari
                        </label>
                        <p className="text-base">
                          {syaratMata.macetDari} Bulan
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Macet Sampai
                        </label>
                        <p className="text-base">
                          {syaratMata.macetSampai} Bulan
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Baru
                        </label>
                        <p className="text-base">{syaratMata.baru}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Persentase
                        </label>
                        <p className="text-base">
                          {syaratMata.persentase}% Hari Terakhir
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
              <p className="text-destructive">Data tidak ditemukan.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/master-syarat-mata")}
              >
                Kembali ke Master Syarat &quot;Mata&quot;
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Syarat &quot;Mata&quot;</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <strong>{syaratMata?.namaAturan}</strong>? Tindakan ini tidak
              dapat dibatalkan.
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
