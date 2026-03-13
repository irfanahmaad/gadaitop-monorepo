"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ChevronRight, Eye, ImagePlus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import {
  useStockOpnameSession,
  useRecordItemCondition,
  useUpdateStockOpnameItems,
} from "@/lib/react-query/hooks/use-stock-opname"
import { useUploadFile } from "@/lib/react-query/hooks/use-upload"
import { usePawnTerms } from "@/lib/react-query/hooks/use-pawn-terms"
import { matchSpkItemToMataRules } from "@/lib/utils/mata-rule-matcher"
import type { PawnTerm, SpkItem, SpkItemConditionEnum } from "@/lib/api/types"

const penilaianOptions = [
  { value: "ada-sesuai", label: "Ada & Kondisi Sesuai" },
  { value: "ada-tidak-sesuai", label: "Ada & Kondisi Tidak Sesuai" },
  { value: "tidak-ada", label: "Tidak Ada" },
]

function mapPenilaianToCondition(penilaian: string): SpkItemConditionEnum {
  switch (penilaian) {
    case "ada-sesuai":
      return "good"
    case "ada-tidak-sesuai":
      return "fair"
    case "tidak-ada":
      return "poor"
    default:
      return "good"
  }
}

type ImageEntry = { file: File; previewUrl: string }

export default function PenilaianBarangPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const itemId = params.itemId as string
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const objectUrlsRef = React.useRef<Set<string>>(new Set())

  const [penilaian, setPenilaian] = React.useState("")
  const [alasan, setAlasan] = React.useState("")
  const [images, setImages] = React.useState<ImageEntry[]>([])
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const { data: session } = useStockOpnameSession(slug, { enabled: !!slug })
  const { data: pawnTermsData } = usePawnTerms({ pageSize: 500 })
  const allPawnTerms = React.useMemo(
    () => (pawnTermsData?.data ?? []) as PawnTerm[],
    [pawnTermsData?.data]
  )
  const sessionPawnTermIds = React.useMemo(
    () => new Set(session?.pawnTermIds ?? []),
    [session?.pawnTermIds]
  )
  const pawnTerms = React.useMemo(
    () => allPawnTerms.filter((pt) => sessionPawnTermIds.has(pt.uuid)),
    [allPawnTerms, sessionPawnTermIds]
  )
  const currentItem = React.useMemo(() => {
    if (!session?.items?.length) return null
    return session.items.find(
      (i) => i.uuid === itemId || i.id === itemId || (i as { itemId?: string }).itemId === itemId
    )
  }, [session?.items, itemId])
  const spkItem = currentItem?.spkItem
  const isMata = React.useMemo(() => {
    if (!spkItem || !session?.ptId || !pawnTerms.length) return false
    const spkItemForMata: SpkItem = {
      uuid: spkItem.uuid ?? "",
      spkId: spkItem.spkId ?? "",
      itemTypeId: spkItem.itemTypeId ?? "",
      description: spkItem.description ?? "",
      appraisedValue: spkItem.appraisedValue ?? "0",
      estimatedValue:
        typeof spkItem.appraisedValue === "string"
          ? parseFloat(spkItem.appraisedValue) || 0
          : Number(spkItem.appraisedValue) || 0,
      itemType: spkItem.itemType,
    } as SpkItem
    return matchSpkItemToMataRules(spkItemForMata, pawnTerms, session.ptId).isMata
  }, [spkItem, pawnTerms, session?.ptId])

  const updateItems = useUpdateStockOpnameItems()
  const recordCondition = useRecordItemCondition()
  const uploadFileMutation = useUploadFile()
  const isSubmitting =
    updateItems.isPending ||
    recordCondition.isPending ||
    uploadFileMutation.isPending

  const handleBatal = () => {
    router.push(`/stock-opname/auditor/${slug}`)
  }

  const handleSimpanClick = () => {
    if (!penilaian) {
      toast.error("Pilih penilaian terlebih dahulu")
      return
    }
    if (isMata && images.length === 0) {
      toast.error("Item Syarat Mata wajib dilampirkan bukti foto")
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirmSimpan = React.useCallback(async () => {
    if (!slug || !itemId) return
    setConfirmOpen(false)
    try {
      const uploadedKeys: string[] = []
      if (images.length > 0) {
        const prefix = `stock-opname/${slug}/${itemId}`
        for (let i = 0; i < images.length; i++) {
          const entry = images[i]
          if (!entry) continue
          const ext =
            entry.file.name.split(".").pop()?.toLowerCase() || "jpg"
          const key = `${prefix}/damage-${Date.now()}-${i}.${ext}`
          const { key: savedKey } = await uploadFileMutation.mutateAsync({
            file: entry.file,
            key,
          })
          uploadedKeys.push(savedKey)
        }
      }

      await updateItems.mutateAsync({
        id: slug,
        data: {
          items: [{ itemId, countedQuantity: 1 }],
        },
      })
      await recordCondition.mutateAsync({
        sessionId: slug,
        itemId,
        data: {
          conditionAfter: mapPenilaianToCondition(penilaian),
          conditionNotes: alasan || undefined,
          damagePhotos:
            uploadedKeys.length > 0 ? uploadedKeys : undefined,
        },
      })
      toast.success("Penilaian berhasil disimpan")
      router.push(`/stock-opname/auditor/${slug}`)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal menyimpan penilaian"
      )
    }
  }, [
    slug,
    itemId,
    penilaian,
    alasan,
    images,
    updateItems,
    recordCondition,
    uploadFileMutation,
    router,
  ])

  const removeImage = (index: number) => {
    setImages((prev) => {
      const entry = prev[index]
      if (entry?.previewUrl) {
        URL.revokeObjectURL(entry.previewUrl)
        objectUrlsRef.current.delete(entry.previewUrl)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleAddImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const newEntries: ImageEntry[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file?.type.startsWith("image/")) continue
      const previewUrl = URL.createObjectURL(file)
      objectUrlsRef.current.add(previewUrl)
      newEntries.push({ file, previewUrl })
    }
    setImages((prev) => [...prev, ...newEntries])
    e.target.value = ""
  }

  React.useEffect(() => {
    const urls = objectUrlsRef.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Header: title + breadcrumbs */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Penilaian Barang</h1>
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
                Penilaian Barang
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Data Card: Data Penilaian */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Data Penilaian</CardTitle>
            {isMata && (
              <Badge
                variant="outline"
                className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
              >
                <Eye className="mr-1 size-3" />
                Syarat Mata
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Form fields */}
          <div className="grid gap-6 md:grid-cols-2 items-start">
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Penilaian
              </label>
              <Select value={penilaian} onValueChange={setPenilaian}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent>
                  {penilaianOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">
              Alasan
            </label>
            <Textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Masukkan alasan..."
              className="min-h-[100px] resize-y"
              rows={4}
            />
          </div>

          {/* Image section: thumbnails + upload placeholder */}
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">
              Gambar Barang
              {isMata && (
                <span className="text-destructive ml-1">*</span>
              )}
            </label>
            {isMata && (
              <p className="text-muted-foreground text-xs">
                Item Syarat Mata wajib dilampirkan bukti foto kondisi barang.
              </p>
            )}
            <div className="flex flex-wrap gap-3 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              {images.map((entry, index) => (
                <div
                  key={entry.previewUrl}
                  className="relative aspect-square w-24 rounded-lg border bg-muted overflow-hidden shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob/object URLs for user uploads */}
                  <img
                    src={entry.previewUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 size-6 rounded-full"
                    onClick={() => removeImage(index)}
                    aria-label="Hapus gambar"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddImageClick}
                className="flex aspect-square w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 hover:bg-muted/50 transition-colors"
                aria-label="Upload gambar"
              >
                <ImagePlus className="text-muted-foreground size-6" />
                <span className="text-muted-foreground text-xs">Tambah</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={handleBatal}>
              <X className="mr-2 size-4" />
              Batal
            </Button>
            <Button
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleSimpanClick}
              disabled={
                isSubmitting ||
                !penilaian ||
                (isMata && images.length === 0)
              }
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Simpan Penilaian?"
        description="Data penilaian barang akan disimpan dan item akan tercatat sebagai terscan."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
        onConfirm={handleConfirmSimpan}
      />
    </div>
  )
}
