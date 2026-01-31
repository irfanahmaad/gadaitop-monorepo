"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import {
  FileText,
  Upload,
  X,
  Loader2,
  Pencil,
  Package,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
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
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format-currency"

const katalogSchema = z.object({
  image: z.union([z.instanceof(File), z.string()]).optional(),
  namaKatalog: z
    .string()
    .min(1, "Nama Katalog harus diisi")
    .max(255, "Nama Katalog maksimal 255 karakter"),
  tipeBarang: z.string().min(1, "Tipe Barang harus dipilih"),
  harga: z
    .string()
    .min(1, "Harga harus diisi")
    .refine((val) => {
      const parsed = parseCurrencyInput(val)
      return parsed !== null && parsed > 0
    }, "Harga harus lebih dari 0"),
  namaPotongan: z
    .string()
    .min(1, "Nama Potongan harus diisi")
    .max(255, "Nama Potongan maksimal 255 karakter"),
  jumlahPotongan: z
    .string()
    .min(1, "Jumlah Potongan harus diisi")
    .refine((val) => {
      const parsed = parseCurrencyInput(val)
      return parsed !== null && parsed >= 0
    }, "Jumlah Potongan harus valid"),
  keterangan: z.string().max(500, "Keterangan maksimal 500 karakter").optional().or(z.literal("")),
})

type KatalogFormValues = z.infer<typeof katalogSchema>

// Tipe Barang options
const tipeBarangOptions = [
  { value: "Handphone", label: "Handphone" },
  { value: "Sepeda Motor", label: "Sepeda Motor" },
  { value: "Aksesoris Komputer", label: "Aksesoris Komputer" },
  { value: "Laptop", label: "Laptop" },
  { value: "Drone", label: "Drone" },
  { value: "Elektronik", label: "Elektronik" },
]

export default function TambahMasterKatalogPage() {
  const router = useRouter()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<KatalogFormValues>({
    resolver: zodResolver(katalogSchema),
    defaultValues: {
      image: undefined,
      namaKatalog: "",
      tipeBarang: "",
      harga: "",
      namaPotongan: "",
      jumlahPotongan: "",
      keterangan: "",
    },
  })

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: { onChange: (value: File | undefined) => void }
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
      // TODO: Replace with API call to create catalog
      console.log("Simpan Katalog:", {
        ...values,
        harga: parseCurrencyInput(values.harga),
        jumlahPotongan: parseCurrencyInput(values.jumlahPotongan),
      })
      toast.success("Data Katalog berhasil ditambahkan")
      setConfirmOpen(false)
      router.push("/master-katalog")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menambahkan data Katalog"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Tambah Data</h1>
        <Breadcrumbs
          items={[
            { label: "Master Katalog", href: "/master-katalog" },
            { label: "Tambah Data", className: "text-destructive" },
          ]}
        />
      </div>

      {/* Data Katalog card */}
      <Card>
        <CardHeader>
          <CardTitle>Data Katalog</CardTitle>
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
                {/* Detail Katalog section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Package className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Katalog
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="namaKatalog"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nama Katalog{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: Agung Prasetyo"
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
                      name="tipeBarang"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipe Barang</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Tipe Barang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tipeBarangOptions.map((opt) => (
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
                      name="harga"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: 17.500.000"
                              icon={<span className="text-sm">Rp</span>}
                              value={field.value}
                              onChange={(e) => {
                                const value = e.target.value
                                // Allow user to type, then format on blur
                                field.onChange(value)
                              }}
                              onBlur={(e) => {
                                const parsed = parseCurrencyInput(e.target.value)
                                if (parsed !== null) {
                                  field.onChange(formatCurrencyInput(parsed))
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Potongan Harga section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Potongan Harga
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="namaPotongan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nama Potongan{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: Agung Prasetyo"
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
                      name="jumlahPotongan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Jumlah Potongan{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: 200.000"
                              icon={<span className="text-sm">Rp</span>}
                              value={field.value}
                              onChange={(e) => {
                                const value = e.target.value
                                field.onChange(value)
                              }}
                              onBlur={(e) => {
                                const parsed = parseCurrencyInput(e.target.value)
                                if (parsed !== null) {
                                  field.onChange(formatCurrencyInput(parsed))
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Keterangan section */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="keterangan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keterangan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Contoh: Potongan Khusus Produk Apple"
                            className="min-h-24 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/master-katalog")}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 size-4" />
                    Batal
                  </Button>
                  <Button
                    type="button"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
        description="Anda akan menyimpan data Katalog ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </div>
  )
}
