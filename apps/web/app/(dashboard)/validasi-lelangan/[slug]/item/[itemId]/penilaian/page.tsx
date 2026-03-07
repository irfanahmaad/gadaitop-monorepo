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
import { ChevronRight, ImagePlus, Trash2, X } from "lucide-react"

const pinjamPtOptions = [
  { value: "ada-sesuai", label: "Ada & Kondisi Sesuai" },
  { value: "ada-tidak-sesuai", label: "Ada & Kondisi Tidak Sesuai" },
  { value: "tidak-ada", label: "Tidak Ada" },
]

// Placeholder image URLs for slice (multiple square thumbnails as in design)
const placeholderImages = [
  "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop",
]

const defaultAlamat =
  "Jl. Jenderal Basuki Rachmat No.12B, RT.2/RW.3, Pd. Bambu, Kec. Duren Sawit, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13430"

type ImageEntry = { url: string; isObjectUrl?: boolean }

export default function PenilaianBarangPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const itemId = params.itemId as string
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const objectUrlsRef = React.useRef<Set<string>>(new Set())

  const [pinjamPt, setPinjamPt] = React.useState("ada-sesuai")
  const [alamat, setAlamat] = React.useState(defaultAlamat)
  const [images, setImages] = React.useState<ImageEntry[]>(() =>
    placeholderImages.map((url) => ({ url, isObjectUrl: false }))
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleBatal = () => {
    router.push(`/validasi-lelangan/${slug}/item/${itemId}`)
  }

  const handleSimpan = () => {
    setIsSubmitting(true)
    // No API call - slice only
    setTimeout(() => setIsSubmitting(false), 500)
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const entry = prev[index]
      if (entry?.isObjectUrl && entry.url) {
        URL.revokeObjectURL(entry.url)
        objectUrlsRef.current.delete(entry.url)
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
      const url = URL.createObjectURL(file)
      objectUrlsRef.current.add(url)
      newEntries.push({ url, isObjectUrl: true })
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
                Penilaian Barang
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Data Card: Data Penilaian */}
      <Card>
        <CardHeader>
          <CardTitle>Data Penilaian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Form fields */}
          <div className="grid gap-6 md:grid-cols-2 items-start">
            <div className="space-y-2">
              <label className="text-muted-foreground text-sm font-medium">
                Pinjam PT (Opsional)
              </label>
              <Select value={pinjamPt} onValueChange={setPinjamPt}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih..." />
                </SelectTrigger>
                <SelectContent>
                  {pinjamPtOptions.map((opt) => (
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
              Alamat
            </label>
            <Textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Masukkan alamat..."
              className="min-h-[100px] resize-y"
              rows={4}
            />
          </div>

          {/* Image section: thumbnails + upload placeholder */}
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-medium">
              Gambar Barang
            </label>
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
                  key={entry.url}
                  className="relative aspect-square w-24 rounded-lg border bg-muted overflow-hidden shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob/object URLs for user uploads */}
                  <img
                    src={entry.url}
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
              onClick={handleSimpan}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
