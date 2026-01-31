"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useParams } from "next/navigation"
import {
  FileText,
  Phone,
  MapPin,
  Store,
  Upload,
  X,
  Loader2,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

const tokoSchema = z.object({
  image: z.union([z.instanceof(File), z.string()]).optional(),
  kodeLokasi: z
    .string()
    .min(1, "Kode Lokasi harus diisi")
    .max(20, "Kode Lokasi maksimal 20 karakter"),
  namaToko: z
    .string()
    .min(1, "Nama Toko harus diisi")
    .max(255, "Nama Toko maksimal 255 karakter"),
  alias: z
    .string()
    .min(1, "Alias harus diisi")
    .max(100, "Alias maksimal 100 karakter"),
  noTelepon: z
    .string()
    .max(20, "No. Telepon maksimal 20 karakter")
    .optional()
    .or(z.literal("")),
  kota: z
    .string()
    .max(100, "Kota maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
  pinjamPT: z.string().optional().or(z.literal("")),
  alamat: z
    .string()
    .max(500, "Alamat maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
})

type TokoFormValues = z.infer<typeof tokoSchema>

// Toko detail type
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

// Mock: fetch toko by id (replace with API later)
function getTokoById(id: string): TokoDetail | null {
  const mock: TokoDetail = {
    id: "1",
    foto: "/placeholder-avatar.jpg",
    kodeLokasi: "JK01",
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    noTelepon: "0812345678910",
    kota: "Jakarta Timur",
    pinjamPT: null,
    alamat:
      "Jl. Jenderal Basuki Rachmat No.12B, RT.2/RW.3, Pd. Bambu, Kec. Duren Sawit, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13430",
  }
  if (id === "1") return mock
  // Second toko for id 2
  if (id === "2") {
    return {
      ...mock,
      id: "2",
      kodeLokasi: "JK02",
      namaToko: "GT Jakarta Dua",
      alias: "GT Dua",
      noTelepon: "0812345678911",
      pinjamPT: "pt1",
    }
  }
  return mock
}

// Mock PT options for Pinjam PT (replace with API later)
const ptOptions = [
  { value: "pt1", label: "PT Gadai Top Indonesia" },
  { value: "pt2", label: "PT Gadai Top Premium" },
  { value: "pt3", label: "PT Gadai Top Sukses Jaya" },
]

// Loading skeleton for form
function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
          <div className="flex justify-center">
            <Skeleton className="aspect-square size-48 rounded-full" />
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
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <div className="space-y-2 md:col-span-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function EditMasterTokoPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Simulate async fetch (replace with useQuery + API)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [id])

  const toko = useMemo(() => (id ? getTokoById(id) : null), [id])

  const form = useForm<TokoFormValues>({
    resolver: zodResolver(tokoSchema),
    defaultValues: {
      image: undefined,
      kodeLokasi: "",
      namaToko: "",
      alias: "",
      noTelepon: "",
      kota: "",
      pinjamPT: "",
      alamat: "",
    },
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (toko && !loading) {
      form.reset({
        image: toko.foto,
        kodeLokasi: toko.kodeLokasi,
        namaToko: toko.namaToko,
        alias: toko.alias,
        noTelepon: toko.noTelepon,
        kota: toko.kota,
        pinjamPT: toko.pinjamPT || "",
        alamat: toko.alamat,
      })
      // Set preview image if exists
      if (toko.foto) {
        setPreviewImage(toko.foto)
      }
    }
  }, [toko, loading, form])

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: { onChange: (value: File | string | undefined) => void }
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      field.onChange(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSimpanClick = () => {
    form.handleSubmit((values) => {
      if (values) {
        setConfirmOpen(true)
      }
    })()
  }

  const handleConfirmSubmit = async () => {
    const values = form.getValues()
    setIsSubmitting(true)
    try {
      // TODO: Replace with API call to update store
      console.log("Update Toko:", { id, values })
      toast.success("Data Toko berhasil diperbarui")
      setConfirmOpen(false)
      router.push(`/master-toko/${id}`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memperbarui data Toko"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!id) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Master Toko", href: "/master-toko" },
            { label: "Edit", className: "text-destructive" },
          ]}
        />
        <p className="text-muted-foreground">Toko tidak ditemukan.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
        <FormSkeleton />
      </div>
    )
  }

  if (!toko) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Master Toko", href: "/master-toko" },
            { label: "Edit", className: "text-destructive" },
          ]}
        />
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
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Edit Data</h1>
        <Breadcrumbs
          items={[
            { label: "Master Toko", href: "/master-toko" },
            { label: "Edit", className: "text-destructive" },
          ]}
        />
      </div>

      {/* Data Toko card */}
      <Card>
        <CardHeader>
          <CardTitle>Data Toko</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              {/* Image upload column (left) */}
              <div className="flex justify-center">
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          {previewImage ? (
                            <div className="border-input bg-muted/50 relative aspect-square w-48 overflow-hidden rounded-full border-2 border-dashed">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={previewImage}
                                alt="Preview"
                                className="size-full object-cover"
                              />
                              <label
                                htmlFor="image-upload-edit"
                                className="bg-destructive hover:bg-destructive/90 absolute right-0 bottom-0 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full text-white shadow-sm transition-colors"
                                aria-label="Ubah gambar"
                              >
                                <Pencil className="size-4" />
                                <input
                                  id="image-upload-edit"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageChange(e, field)}
                                />
                              </label>
                            </div>
                          ) : (
                            <label
                              htmlFor="image-upload"
                              className="border-input bg-muted/50 hover:bg-muted flex aspect-square w-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border-2 border-dashed transition-colors"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className="bg-primary/10 rounded-full p-3">
                                  <Upload className="text-primary size-6" />
                                </div>
                                <p className="text-sm font-medium">
                                  Upload Gambar
                                </p>
                              </div>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageChange(e, field)}
                              />
                            </label>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form fields column (right) */}
              <div className="space-y-8">
                {/* Detail Toko section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Store className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Toko
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="kodeLokasi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Kode Lokasi{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: JK01"
                              icon={<FileText className="size-4" />}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="namaToko"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nama Toko{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: GT Jakarta Satu"
                              icon={<FileText className="size-4" />}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="alias"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Alias <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: GT Satu"
                              icon={<FileText className="size-4" />}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="noTelepon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Telepon</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Contoh: 0812345678910"
                              icon={<Phone className="size-4" />}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kota"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kota</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: Jakarta Timur"
                              icon={<MapPin className="size-4" />}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pinjamPT"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pinjam PT (Opsional)</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih PT" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ptOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="alamat"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Alamat</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Masukkan alamat lengkap"
                              className="min-h-24 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/master-toko/${id}`)}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 size-4" />
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleSimpanClick}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Save confirmation dialog */}
      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmSubmit}
        title="Apakah Anda Yakin?"
        description="Anda akan memperbarui data Toko ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </div>
  )
}
