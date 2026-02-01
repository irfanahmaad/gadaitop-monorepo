"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import {
  FileText,
  User,
  Calendar,
  CreditCard,
  Upload,
  Lock,
  X,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Image as ImageIcon,
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

const spkSchema = z
  .object({
    fotoCustomer: z.union([z.instanceof(File), z.string()]).optional(),
    nik: z.string().min(1, "NIK harus dipilih"),
    namaCustomer: z.string().min(1, "Nama Customer harus diisi"),
    tanggalLahir: z.string().optional(),
    tipeBarang: z.string().min(1, "Tipe Barang harus dipilih"),
    pilihBarang: z.string().min(1, "Pilih Barang harus dipilih"),
    kondisiBarang: z.string().min(1, "Kondisi Barang harus dipilih"),
    imei: z.string().optional().or(z.literal("")),
    kelengkapanBarang: z.string().optional().or(z.literal("")),
    statusBarang: z.string().min(1, "Status Barang harus dipilih"),
    hargaAcuan: z.string().min(1, "Harga Acuan harus diisi"),
    jumlahSPK: z.string().min(1, "Jumlah SPK harus diisi"),
    fotoBarang: z.array(z.instanceof(File)).min(0).optional(),
    pin: z.string().min(8, "PIN minimal 8 karakter"),
  })
  .refine(
    (data) => {
      const hargaAcuan = parseCurrencyInput(data.hargaAcuan)
      const jumlahSPK = parseCurrencyInput(data.jumlahSPK)
      if (hargaAcuan && jumlahSPK) {
        return jumlahSPK <= hargaAcuan
      }
      return true
    },
    {
      message: "Jumlah SPK tidak bisa melebihi Harga Acuan",
      path: ["jumlahSPK"],
    }
  )

type SPKFormValues = z.infer<typeof spkSchema>

// Mock options (replace with API later)
const nikOptions = [
  { value: "nik1", label: "3201010101010001" },
  { value: "nik2", label: "3201010101010002" },
  { value: "nik3", label: "3201010101010003" },
]

const tipeBarangOptions = [
  { value: "handphone", label: "Handphone" },
  { value: "sepeda-motor", label: "Sepeda Motor" },
  { value: "laptop", label: "Laptop" },
  { value: "elektronik", label: "Elektronik" },
]

const kondisiBarangOptions = [
  { value: "baru", label: "Baru" },
  { value: "bekas-bagus", label: "Bekas Bagus" },
  { value: "bekas-sedang", label: "Bekas Sedang" },
]

const statusBarangOptions = [
  { value: "tersedia", label: "Tersedia" },
  { value: "dipinjam", label: "Dipinjam" },
  { value: "rusak", label: "Rusak" },
]

export default function TambahSPKPage() {
  const router = useRouter()
  const [previewFotoCustomer, setPreviewFotoCustomer] = useState<string | null>(
    null
  )
  const [previewFotoBarang, setPreviewFotoBarang] = useState<
    Array<{ file: File; preview: string }>
  >([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SPKFormValues>({
    resolver: zodResolver(spkSchema),
    defaultValues: {
      fotoCustomer: undefined,
      nik: "",
      namaCustomer: "",
      tanggalLahir: "",
      tipeBarang: "",
      pilihBarang: "",
      kondisiBarang: "",
      imei: "",
      kelengkapanBarang: "",
      statusBarang: "",
      hargaAcuan: "",
      jumlahSPK: "",
      fotoBarang: [],
      pin: "",
    },
  })

  // Watch hargaAcuan and jumlahSPK for validation
  const hargaAcuan = form.watch("hargaAcuan")
  const jumlahSPK = form.watch("jumlahSPK")
  const pin = form.watch("pin") || ""
  const isPinValid = pin.length >= 8

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: { onChange: (value: File | undefined) => void },
    setPreview: (preview: string | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      field.onChange(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMultipleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: { onChange: (value: File[]) => void }
  ) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const currentFiles = form.getValues("fotoBarang") || []
      const newFiles = [...currentFiles, ...files]
      field.onChange(newFiles)

      // Create previews for new files and add them all at once
      const previewPromises = files.map((file) => {
        return new Promise<{ file: File; preview: string }>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve({ file, preview: reader.result as string })
          }
          reader.readAsDataURL(file)
        })
      })

      Promise.all(previewPromises).then((newPreviews) => {
        setPreviewFotoBarang((prev) => [...prev, ...newPreviews])
      })
    }
    // Reset input to allow selecting the same file again
    e.target.value = ""
  }

  const handleRemoveImage = (
    index: number,
    field: { onChange: (value: File[]) => void }
  ) => {
    const currentFiles = form.getValues("fotoBarang") || []
    const newFiles = currentFiles.filter((_, i) => i !== index)
    field.onChange(newFiles)
    setPreviewFotoBarang((prev) => prev.filter((_, i) => i !== index))
  }

  const handleNikChange = (value: string) => {
    form.setValue("nik", value)
    // Mock: Set nama customer based on NIK
    if (value === "nik1") {
      form.setValue("namaCustomer", "Agung Prasetyo")
    } else {
      form.setValue("namaCustomer", "")
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
      // TODO: Replace with API call to create SPK
      console.log("Simpan SPK:", values)
      toast.success("Data SPK berhasil ditambahkan")
      setConfirmOpen(false)
      router.push("/spk")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menambahkan data SPK"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCurrencyChange = (
    value: string,
    field: { onChange: (value: string) => void },
    fieldName: "hargaAcuan" | "jumlahSPK"
  ) => {
    const parsed = parseCurrencyInput(value)
    field.onChange(parsed !== null ? formatCurrencyInput(parsed) : "")

    // Trigger validation
    if (fieldName === "jumlahSPK") {
      form.trigger("jumlahSPK")
    }
  }

  const hargaAcuanNum = parseCurrencyInput(hargaAcuan)
  const jumlahSPKNum = parseCurrencyInput(jumlahSPK)
  const isJumlahSPKExceeded =
    hargaAcuanNum !== null &&
    jumlahSPKNum !== null &&
    jumlahSPKNum > hargaAcuanNum

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Tambah Data</h1>
        <Breadcrumbs
          items={[
            { label: "SPK", href: "/spk" },
            { label: "Tambah Data", className: "text-destructive" },
          ]}
        />
      </div>

      {/* Data Customer card */}
      <Card>
        <CardHeader>
          <CardTitle>Data Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
              {/* Image upload column (left) */}
              <div className="flex justify-center">
                <FormField
                  control={form.control}
                  name="fotoCustomer"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          {previewFotoCustomer ? (
                            <div className="border-input bg-muted/50 relative aspect-square w-40 overflow-hidden rounded-full border-2 border-dashed">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={previewFotoCustomer}
                                alt="Preview Customer"
                                className="size-full object-cover"
                              />
                              <label
                                htmlFor="foto-customer-upload-edit"
                                className="bg-destructive hover:bg-destructive/90 absolute right-0 bottom-0 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full text-white shadow-sm transition-colors"
                                aria-label="Ubah gambar"
                              >
                                <Pencil className="size-4" />
                                <input
                                  id="foto-customer-upload-edit"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleImageChange(
                                      e,
                                      field,
                                      setPreviewFotoCustomer
                                    )
                                  }
                                />
                              </label>
                            </div>
                          ) : (
                            <label
                              htmlFor="foto-customer-upload"
                              className="border-input bg-muted/50 hover:bg-muted flex aspect-square w-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border-2 border-dashed transition-colors"
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
                                id="foto-customer-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageChange(
                                    e,
                                    field,
                                    setPreviewFotoCustomer
                                  )
                                }
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
                {/* Detail Customer section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Customer
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="nik"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            NIK <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={(value) => {
                              field.onChange(value)
                              handleNikChange(value)
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih NIK" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {nikOptions.map((opt) => (
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
                      name="namaCustomer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nama Customer{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: Agung Prasetyo"
                              icon={<User className="size-4" />}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tanggalLahir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Lahir</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              icon={<Calendar className="size-4" />}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Detail Barang section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Barang
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="tipeBarang"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Tipe Barang{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
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
                      name="pilihBarang"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Pilih Barang{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Barang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="barang1">
                                iPhone 15 Pro
                              </SelectItem>
                              <SelectItem value="barang2">
                                Samsung Galaxy S24
                              </SelectItem>
                              <SelectItem value="barang3">
                                Xiaomi 14 Pro
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kondisiBarang"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Kondisi Barang{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Kondisi Barang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {kondisiBarangOptions.map((opt) => (
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
                      name="imei"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMEI (Opsional)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: 1234567890"
                              icon={<CreditCard className="size-4" />}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kelengkapanBarang"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Kelengkapan Barang</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Pilih Role"
                              className="min-h-24 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="statusBarang"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Status Barang{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Status Barang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusBarangOptions.map((opt) => (
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
                      name="hargaAcuan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga Acuan Dari Katalog</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="10.000.000,-"
                              value={field.value}
                              onChange={(e) =>
                                handleCurrencyChange(
                                  e.target.value,
                                  field,
                                  "hargaAcuan"
                                )
                              }
                              icon={<>Rp</>}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jumlahSPK"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Jumlah SPK{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input
                                type="text"
                                placeholder="Contoh: 200.000"
                                value={field.value}
                                onChange={(e) =>
                                  handleCurrencyChange(
                                    e.target.value,
                                    field,
                                    "jumlahSPK"
                                  )
                                }
                                icon={<>Rp</>}
                              />
                              {isJumlahSPKExceeded && (
                                <p className="text-destructive text-sm">
                                  Jumlah SPK Tidak bisa melebihi Harga Acuan
                                </p>
                              )}
                              <p className="text-destructive text-sm">
                                Input Maksimum
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Upload Foto Barang section */}
                <div className="space-y-4">
                  <FormLabel>Upload Foto Barang</FormLabel>
                  <FormField
                    control={form.control}
                    name="fotoBarang"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="border-input bg-background rounded-lg border-2 border-dashed p-4">
                            <div className="flex flex-wrap gap-4">
                              {/* Display uploaded images */}
                              {previewFotoBarang.map((item, index) => (
                                <div
                                  key={index}
                                  className="border-input relative aspect-square w-32 overflow-hidden rounded-lg border"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.preview}
                                    alt={`Preview ${index + 1}`}
                                    className="size-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveImage(index, field)
                                    }
                                    className="bg-background hover:bg-muted absolute top-1/2 left-1/2 z-10 flex size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-md transition-colors"
                                    aria-label="Hapus gambar"
                                  >
                                    <Trash2 className="text-destructive size-4" />
                                  </button>
                                </div>
                              ))}

                              {/* Add more images slot */}
                              <label
                                htmlFor="foto-barang-upload"
                                className="border-input bg-background hover:bg-muted/50 flex aspect-square w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors"
                              >
                                <div className="relative flex flex-col items-center gap-1">
                                  <div className="relative">
                                    <ImageIcon className="text-muted-foreground size-8" />
                                    <div className="bg-destructive absolute right-0 bottom-0 flex size-4 items-center justify-center rounded-sm">
                                      <Plus className="size-2.5 text-white" />
                                    </div>
                                  </div>
                                </div>
                                <input
                                  id="foto-barang-upload"
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) =>
                                    handleMultipleImageChange(e, field)
                                  }
                                />
                              </label>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Keamanan section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Lock className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Keamanan
                    </h2>
                  </div>
                  <div className="grid items-start gap-6 md:grid-cols-12">
                    <div className="md:col-span-8">
                      <FormField
                        control={form.control}
                        name="pin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              PIN <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <div className="relative">
                                  <div
                                    className={`absolute top-1/2 left-0 flex aspect-square h-full -translate-y-1/2 items-center justify-center border-r ${
                                      isPinValid
                                        ? "border-green-500 text-green-500"
                                        : "border-input text-muted-foreground/60"
                                    }`}
                                  >
                                    <Lock className="size-4" />
                                  </div>
                                  <input
                                    type="password"
                                    placeholder="Minimal 8 Karakter"
                                    className={`h-12 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 !pl-16 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm lg:pl-16 ${
                                      isPinValid
                                        ? "border-green-500 focus-visible:border-green-600 focus-visible:ring-[3px] focus-visible:ring-green-500/20"
                                        : "border-input focus-visible:border-ring/30 focus-visible:ring-ring/20 focus-visible:ring-[3px]"
                                    }`}
                                    {...field}
                                  />
                                </div>
                                {isPinValid && (
                                  <p className="text-sm text-green-600">
                                    (PIN Sudah Terinput)
                                  </p>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex items-end md:col-span-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                      >
                        <Lock className="mr-2 size-4" />
                        {isPinValid
                          ? "Masukkan Ulang PIN"
                          : "Customer Masukkan PIN"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/spk")}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 size-4" />
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant={"destructive"}
                    onClick={handleSimpanClick}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 size-4" />
                        Simpan
                      </>
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
        description="Anda akan menyimpan data SPK ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </div>
  )
}
