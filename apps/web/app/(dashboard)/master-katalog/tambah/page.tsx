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
import { useCreateCatalog } from "@/lib/react-query/hooks/use-catalogs"
import { useItemTypes } from "@/lib/react-query/hooks/use-item-types"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useUploadFile } from "@/lib/react-query/hooks/use-upload"

const katalogSchema = z.object({
  image: z.union([z.instanceof(File), z.string()]).optional(),
  kodeKatalog: z
    .string()
    .min(1, "Kode Katalog harus diisi")
    .max(50, "Kode Katalog maksimal 50 karakter"),
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
  nilaiTaksirMin: z
    .string()
    .min(1, "Nilai Taksir Min harus diisi")
    .refine((val) => {
      const parsed = parseCurrencyInput(val)
      return parsed !== null && parsed >= 0
    }, "Nilai Taksir Min harus valid"),
  nilaiTaksirMax: z
    .string()
    .min(1, "Nilai Taksir Max harus diisi")
    .refine((val) => {
      const parsed = parseCurrencyInput(val)
      return parsed !== null && parsed >= 0
    }, "Nilai Taksir Max harus valid"),
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
  keterangan: z
    .string()
    .max(500, "Keterangan maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
})

type KatalogFormValues = z.infer<typeof katalogSchema>

export default function TambahMasterKatalogPage() {
  const router = useRouter()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { mutateAsync: createCatalog } = useCreateCatalog()
  const uploadFileMutation = useUploadFile()
  const { data: itemTypesData } = useItemTypes({ pageSize: 100 })
  const { user } = useAuth()
  const isCompanyAdmin =
    user?.roles?.some((r) => r.code === "company_admin") ?? false
  const isSuperAdmin = user?.roles?.some((r) => r.code === "owner") ?? false
  const effectiveCompanyId = isCompanyAdmin ? (user?.companyId ?? null) : null
  const { data: companiesData } = useCompanies(
    isSuperAdmin ? { pageSize: 100 } : undefined
  )
  const ptOptions = React.useMemo(() => {
    const list = companiesData?.data ?? []
    return list.map((c) => ({ value: c.uuid, label: c.companyName }))
  }, [companiesData])
  const [selectedPT, setSelectedPT] = useState("")
  const defaultPT =
    (isSuperAdmin && ptOptions[0]?.value) || effectiveCompanyId || ""
  const effectivePT = selectedPT || defaultPT

  const tipeBarangOptions = React.useMemo(() => {
    const list = itemTypesData?.data ?? []
    return list.map((itemType) => ({
      value: itemType.uuid,
      label: itemType.typeName,
    }))
  }, [itemTypesData])

  const form = useForm<KatalogFormValues>({
    resolver: zodResolver(katalogSchema),
    defaultValues: {
      image: undefined,
      kodeKatalog: "",
      namaKatalog: "",
      tipeBarang: "",
      harga: "",
      nilaiTaksirMin: "",
      nilaiTaksirMax: "",
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
      if (!effectivePT) {
        throw new Error("Pilih PT terlebih dahulu")
      }
      const parsedPrice = parseCurrencyInput(values.harga)
      if (parsedPrice === null || parsedPrice <= 0) {
        throw new Error("Harga harus lebih dari 0")
      }
      const pawnMin = parseCurrencyInput(values.nilaiTaksirMin)
      const pawnMax = parseCurrencyInput(values.nilaiTaksirMax)
      if (pawnMin === null || pawnMax === null) {
        throw new Error("Nilai taksir harus valid")
      }
      if (pawnMax < pawnMin) {
        throw new Error("Nilai Taksir Max harus lebih besar atau sama dengan Min")
      }

      const parsedPotongan = parseCurrencyInput(values.jumlahPotongan)
      const jumlahPotonganNum =
        parsedPotongan !== null && parsedPotongan >= 0 ? parsedPotongan : 0

      let imageUrl: string | undefined
      if (values.image instanceof File) {
        const file = values.image
        const ext = file.name.split(".").pop() || "jpg"
        const key = `catalogs/new/image-${Date.now()}.${ext}`
        const { key: s3Key } = await uploadFileMutation.mutateAsync({
          file,
          key,
        })
        imageUrl = s3Key
      }

      await createCatalog({
        code: values.kodeKatalog.trim(),
        name: values.namaKatalog,
        ptId: effectivePT,
        itemTypeId: values.tipeBarang,
        basePrice: parsedPrice,
        pawnValueMin: pawnMin,
        pawnValueMax: pawnMax,
        description: values.keterangan?.trim() || undefined,
        discountName: values.namaPotongan.trim() || null,
        discountAmount: jumlahPotonganNum,
        ...(imageUrl && { imageUrl }),
      })

      toast.success("Data Katalog berhasil ditambahkan")
      setConfirmOpen(false)
      router.push("/master-katalog")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menambahkan data Katalog"
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
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Data Katalog</CardTitle>
            {isSuperAdmin && ptOptions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">PT :</span>
                <Select value={selectedPT} onValueChange={setSelectedPT}>
                  <SelectTrigger className="w-[200px]">
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
            )}
          </div>
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
                            <div className="relative inline-block aspect-square w-48">
                              <div className="border-input bg-muted/50 h-full w-full rounded-full border-2 border-dashed">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={previewImage}
                                  alt="Preview"
                                  className="size-full rounded-full object-cover"
                                />
                              </div>
                              <label
                                htmlFor="image-upload-edit"
                                className="bg-destructive hover:bg-destructive/90 absolute right-0 bottom-0 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full text-white shadow-sm transition-colors"
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
                  <div className="grid items-start gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="kodeKatalog"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Kode Katalog <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: KAT-001"
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
                              icon={<>Rp</>}
                              value={field.value}
                              onChange={(e) => {
                                const parsed = parseCurrencyInput(
                                  e.target.value
                                )
                                field.onChange(
                                  parsed !== null
                                    ? formatCurrencyInput(parsed)
                                    : ""
                                )
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nilaiTaksirMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nilai Taksir Min</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: 1.000.000"
                              icon={<>Rp</>}
                              value={field.value}
                              onChange={(e) => {
                                const parsed = parseCurrencyInput(e.target.value)
                                field.onChange(
                                  parsed !== null ? formatCurrencyInput(parsed) : ""
                                )
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nilaiTaksirMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nilai Taksir Max</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: 1.500.000"
                              icon={<>Rp</>}
                              value={field.value}
                              onChange={(e) => {
                                const parsed = parseCurrencyInput(e.target.value)
                                field.onChange(
                                  parsed !== null ? formatCurrencyInput(parsed) : ""
                                )
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
                  <div className="grid items-start gap-6 md:grid-cols-2">
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
                              icon={<>Rp</>}
                              value={field.value}
                              onChange={(e) => {
                                const parsed = parseCurrencyInput(
                                  e.target.value
                                )
                                field.onChange(
                                  parsed !== null
                                    ? formatCurrencyInput(parsed)
                                    : ""
                                )
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
