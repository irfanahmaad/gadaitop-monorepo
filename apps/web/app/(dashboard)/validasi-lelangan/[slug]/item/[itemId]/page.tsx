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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import { Package, FileImage, QrCode, ChevronRight, CheckCircle, Hand, Loader2 } from "lucide-react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import { Input } from "@workspace/ui/components/input"
import { useAuctionBatch, useItemValidation } from "@/lib/react-query/hooks"
import { useAppAbility } from "@/lib/casl/context"
import { AclAction, AclSubject } from "@/lib/casl/types"
import { toast } from "sonner"

export default function DetailItemLelangPage() {
  const params = useParams()
  const slug = params.slug as string
  const itemId = params.itemId as string

  const { data: batch, isLoading: batchLoading, isError: batchError } = useAuctionBatch(slug)
  const itemValidationMutation = useItemValidation()
  const ability = useAppAbility()
  const canUpdateValidation = ability.can(
    AclAction.UPDATE,
    AclSubject.AUCTION_VALIDATION
  )

  const item = React.useMemo(() => {
    if (!batch?.items?.length || !itemId) return null
    return batch.items.find((i) => i.uuid === itemId) ?? null
  }, [batch?.items, itemId])

  const [isValidationDialogOpen, setIsValidationDialogOpen] = React.useState(false)
  const [validationVerdict, setValidationVerdict] = React.useState<"return" | "reject">("reject")
  const [validationNotes, setValidationNotes] = React.useState("")
  const [validationPhotos, setValidationPhotos] = React.useState<string[]>([])
  const [newValidationPhotoUrl, setNewValidationPhotoUrl] = React.useState("")

  const spkItem = item && (item as { spkItem?: { description?: string; itemType?: { typeName?: string }; photoUrl?: string } }).spkItem
  const spk = item && (item as { spk?: { spkNumber?: string } }).spk
  const noSPK = spk?.spkNumber ?? "-"
  const namaBarang = spkItem?.description ?? "-"
  const tipeBarang = spkItem?.itemType?.typeName ?? "-"
  const validationVerdictValue = item && (item as { validationVerdict?: string }).validationVerdict
  const statusValidasiLabel =
    validationVerdictValue === "ok"
      ? "OK"
      : validationVerdictValue === "return"
        ? "Return"
        : validationVerdictValue === "reject"
          ? "Reject"
          : "-"
  const showValidationActions =
    batch?.status === "validation_pending" &&
    canUpdateValidation &&
    !validationVerdictValue

  const handleValidationSetuju = async () => {
    if (!slug || !itemId) return
    try {
      await itemValidationMutation.mutateAsync({
        batchId: slug,
        itemId,
        data: { verdict: "ok" },
      })
      toast.success("Item disetujui")
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal menyimpan validasi"
      )
    }
  }

  const openValidationDialog = (verdict: "return" | "reject") => {
    setValidationVerdict(verdict)
    setValidationNotes("")
    setValidationPhotos([])
    setNewValidationPhotoUrl("")
    setIsValidationDialogOpen(true)
  }

  const handleValidationDialogSubmit = async () => {
    if (!slug || !itemId) return
    const notes =
      validationVerdict === "reject" ? validationNotes.trim() : validationNotes
    if (validationVerdict === "reject" && !notes) {
      toast.error("Alasan penolakan wajib diisi")
      return
    }
    try {
      await itemValidationMutation.mutateAsync({
        batchId: slug,
        itemId,
        data: {
          verdict: validationVerdict,
          notes: notes || undefined,
          validationPhotos:
            validationPhotos.length > 0 ? validationPhotos : undefined,
        },
      })
      toast.success(
        validationVerdict === "return" ? "Item ditandai Retur" : "Item ditolak"
      )
      setIsValidationDialogOpen(false)
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal menyimpan validasi"
      )
    }
  }

  if (batchLoading || !slug) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              <Skeleton className="aspect-square size-48 rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (batchError || !batch || !item) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-muted-foreground">Batch atau item tidak ditemukan.</p>
        <Button variant="outline" asChild>
          <Link href={`/validasi-lelangan/${slug}`}>Kembali ke Detail Batch</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{namaBarang}</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/validasi-lelangan">
                Validasi Lelang
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="size-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/validasi-lelangan/${slug}`}>
                Detail Batch
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="size-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-destructive font-medium">
                Detail Item
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Detail Item</CardTitle>
          <div className="flex items-center gap-2">
            {showValidationActions && (
              <>
                <Button
                  size="sm"
                  onClick={handleValidationSetuju}
                  disabled={itemValidationMutation.isPending}
                >
                  {itemValidationMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 size-4" />
                  )}
                  Setuju
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openValidationDialog("reject")}
                  disabled={itemValidationMutation.isPending}
                >
                  <Hand className="mr-2 size-4" />
                  Tolak
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openValidationDialog("return")}
                  disabled={itemValidationMutation.isPending}
                >
                  Retur
                </Button>
              </>
            )}
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
              asChild
            >
              <Link href={`/validasi-lelangan/${slug}`}>
                <QrCode className="size-4" />
                Kembali ke Batch
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
            <div className="flex justify-center">
              <Avatar className="size-48 rounded-lg">
                <AvatarImage src={spkItem?.photoUrl} alt={namaBarang} />
                <AvatarFallback className="rounded-lg bg-muted">
                  <Package className="text-muted-foreground size-24" />
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-8">
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
                    <p className="text-base">{noSPK}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Tipe Barang
                    </label>
                    <p className="text-base">{tipeBarang}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Status Validasi
                    </label>
                    <p className="text-base">{statusValidasiLabel}</p>
                  </div>
                </div>
              </div>

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
                    Foto validasi dapat ditambahkan saat Tolak/Retur
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isValidationDialogOpen}
        onOpenChange={(open) => {
          setIsValidationDialogOpen(open)
          if (!open) {
            setValidationNotes("")
            setValidationPhotos([])
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationVerdict === "reject" ? "Tolak Item" : "Retur Item"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Item: {namaBarang} ({noSPK})
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Catatan
              {validationVerdict === "reject" ? (
                <span className="text-destructive"> *</span>
              ) : null}
            </label>
            <Textarea
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              placeholder={
                validationVerdict === "reject"
                  ? "Alasan penolakan..."
                  : "Catatan retur (opsional)..."
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Foto validasi (opsional)
            </label>
            <div className="flex gap-2">
              <Input
                value={newValidationPhotoUrl}
                onChange={(e) => setNewValidationPhotoUrl(e.target.value)}
                placeholder="URL foto..."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = newValidationPhotoUrl.trim()
                  if (url) {
                    setValidationPhotos((prev) => [...prev, url])
                    setNewValidationPhotoUrl("")
                  }
                }}
              >
                Tambah
              </Button>
            </div>
            {validationPhotos.length > 0 && (
              <ul className="text-muted-foreground list-disc pl-4 text-sm">
                {validationPhotos.map((url, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() =>
                        setValidationPhotos((prev) =>
                          prev.filter((_, j) => j !== i)
                        )
                      }
                    >
                      ×
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsValidationDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleValidationDialogSubmit}
              disabled={
                (validationVerdict === "reject" &&
                  !validationNotes.trim()) ||
                itemValidationMutation.isPending
              }
            >
              {itemValidationMutation.isPending
                ? "Menyimpan..."
                : validationVerdict === "reject"
                  ? "Tolak"
                  : "Retur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
