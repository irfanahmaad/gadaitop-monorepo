"use client"

import React, { useState, useEffect, useLayoutEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useParams } from "next/navigation"
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
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format-currency"
import {
  useCatalog,
  useUpdateCatalog,
} from "@/lib/react-query/hooks/use-catalogs"
import {
  useItemTypes,
  useItemType,
} from "@/lib/react-query/hooks/use-item-types"
import type { ItemType } from "@/lib/api/types"

/** Handles both `{ data: T[] }` and wrapped `{ data: { data: T[] } }` list responses */
function itemTypesListRows(
  res: { data?: unknown } | undefined
): ItemType[] {
  if (!res?.data) return []
  const d = res.data
  if (Array.isArray(d)) return d as ItemType[]
  if (
    typeof d === "object" &&
    d !== null &&
    "data" in d &&
    Array.isArray((d as { data: ItemType[] }).data)
  ) {
    return (d as { data: ItemType[] }).data
  }
  return []
}
import { usePublicUrl, useUploadFile } from "@/lib/react-query/hooks/use-upload"
/** Same validation as tambah katalog */
const katalogSchema = z.object({
  image: z.union([z.instanceof(File), z.string()]).optional(),
  kodeKatalog: z.string(),
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

function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
          <div className="flex justify-center">
            <Skeleton className="aspect-square w-48 rounded-full" />
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid items-start gap-6 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="grid items-start gap-6 md:grid-cols-2">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </div>
            <Skeleton className="h-24" />
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

export default function EditMasterKatalogPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [userRemovedImage, setUserRemovedImage] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { data: catalogData, isLoading } = useCatalog(id)
  const { mutateAsync: updateCatalog, isPending: isSubmitting } =
    useUpdateCatalog()
  const presignedUrlMutation = useUploadFile()
  const existingImageKey = catalogData?.imageUrl ?? ""
  const { data: publicUrlData } = usePublicUrl(existingImageKey)
  const { data: itemTypesData, isFetched: itemTypesFetched } = useItemTypes({
    pageSize: 500,
    page: 1,
  })

  const catalogItemTypeId = React.useMemo(() => {
    if (!catalogData) return ""
    const fromRelation = (
      catalogData.itemType as { uuid?: string } | undefined
    )?.uuid
    return (
      String(catalogData.itemTypeId ?? fromRelation ?? "")
        .trim()
    )
  }, [catalogData])

  const itemTypesRows = React.useMemo(
    () => itemTypesListRows(itemTypesData),
    [itemTypesData]
  )

  const listHasCurrentType = React.useMemo(() => {
    if (!catalogItemTypeId) return true
    return itemTypesRows.some(
      (it) => String(it.uuid).trim() === catalogItemTypeId
    )
  }, [itemTypesRows, catalogItemTypeId])

  const { data: itemTypeDetail } = useItemType(catalogItemTypeId, {
    enabled:
      Boolean(catalogItemTypeId) &&
      itemTypesFetched &&
      !listHasCurrentType,
  })

  const tipeBarangOptions = React.useMemo(() => {
    const list = itemTypesRows
    const opts = list
      .filter((it) => it?.uuid)
      .map((it) => ({
        value: String(it.uuid),
        label: it.typeName || String(it.uuid),
      }))

    if (!catalogItemTypeId) return opts
    if (opts.some((o) => o.value === catalogItemTypeId)) return opts

    const rel = catalogData?.itemType as
      | { uuid?: string; typeName?: string }
      | undefined
    if (rel?.uuid && String(rel.uuid) === catalogItemTypeId && rel.typeName) {
      return [
        { value: catalogItemTypeId, label: rel.typeName },
        ...opts,
      ]
    }
    if (
      itemTypeDetail?.uuid &&
      String(itemTypeDetail.uuid) === catalogItemTypeId
    ) {
      return [
        {
          value: catalogItemTypeId,
          label: itemTypeDetail.typeName || catalogItemTypeId,
        },
        ...opts,
      ]
    }
    return [
      {
        value: catalogItemTypeId,
        label: `Tipe terpilih (${catalogItemTypeId.slice(0, 8)}…)`,
      },
      ...opts,
    ]
  }, [itemTypesRows, catalogData?.itemType, catalogItemTypeId, itemTypeDetail])

  const ptDisplayName =
    catalogData?.pt?.companyName ??
    catalogData?.company?.companyName ??
    ""

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

  useEffect(() => {
    if (!catalogData) return
    const key = catalogData.imageUrl ?? ""
    if (!key || userRemovedImage) {
      if (!userRemovedImage && !key) setPreviewImage(null)
      return
    }
    if (publicUrlData?.url) {
      setPreviewImage(publicUrlData.url)
    }
  }, [catalogData?.imageUrl, publicUrlData?.url, userRemovedImage])

  useEffect(() => {
    setUserRemovedImage(false)
  }, [id])

  useLayoutEffect(() => {
    if (!catalogData || !itemTypesFetched) return
    const disc = Number(catalogData.discountAmount ?? 0)
    const typeId = catalogItemTypeId
    const next = {
      image: undefined as File | string | undefined,
      kodeKatalog: catalogData.code ?? "",
      namaKatalog: catalogData.name ?? catalogData.itemName ?? "",
      tipeBarang: typeId,
      harga: formatCurrencyInput(Number(catalogData.basePrice ?? 0)),
      nilaiTaksirMin: formatCurrencyInput(
        Number(catalogData.pawnValueMin ?? 0)
      ),
      nilaiTaksirMax: formatCurrencyInput(
        Number(catalogData.pawnValueMax ?? 0)
      ),
      namaPotongan:
        (catalogData.discountName ?? "").trim() || "Tidak ada",
      jumlahPotongan:
        disc > 0 ? formatCurrencyInput(disc) : formatCurrencyInput(0),
      keterangan: catalogData.description || "",
    }
    form.reset(next)
    if (typeId) {
      form.setValue("tipeBarang", typeId, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      })
    }
  }, [catalogData, itemTypesFetched, catalogItemTypeId, form])

  useEffect(() => {
    if (!isLoading && id && !catalogData) {
      toast.error("Data Katalog tidak ditemukan")
      router.push("/master-katalog")
    }
  }, [catalogData, id, isLoading, router])

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: { onChange: (value: File | undefined) => void }
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      field.onChange(file)
      setUserRemovedImage(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = (
    field: { onChange: (value: File | undefined) => void }
  ) => {
    field.onChange(undefined)
    setUserRemovedImage(true)
    setPreviewImage(null)
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
    try {
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
        throw new Error(
          "Nilai Taksir Max harus lebih besar atau sama dengan Min"
        )
      }
      const parsedPotongan = parseCurrencyInput(values.jumlahPotongan)
      const jumlahPotonganNum =
        parsedPotongan !== null && parsedPotongan >= 0 ? parsedPotongan : 0
      const discountNameTrim = values.namaPotongan.trim()
      const discountName =
        !discountNameTrim || discountNameTrim === "Tidak ada"
          ? null
          : discountNameTrim

      let imageUrl: string | null | undefined = undefined
      if (values.image instanceof File) {
        const file = values.image
        const ext = file.name.split(".").pop() || "jpg"
        const key = `catalogs/${id}/image-${Date.now()}.${ext}`
        const { key: s3Key } = await presignedUrlMutation.mutateAsync({
          file,
          key,
        })
        imageUrl = s3Key
      } else if (userRemovedImage && existingImageKey) {
        imageUrl = null
      }

      const itemTypeIdSubmit =
        (values.tipeBarang ?? "").trim() || catalogItemTypeId
      if (!itemTypeIdSubmit) {
        throw new Error("Tipe Barang harus dipilih")
      }
      await updateCatalog({
        id,
        data: {
          name: values.namaKatalog.trim(),
          itemTypeId: itemTypeIdSubmit,
          basePrice: parsedPrice,
          pawnValueMin: pawnMin,
          pawnValueMax: pawnMax,
          description: values.keterangan?.trim() || undefined,
          discountName,
          discountAmount: jumlahPotonganNum,
          ...(imageUrl !== undefined && { imageUrl }),
        },
      })
      toast.success("Data Katalog berhasil diupdate")
      setConfirmOpen(false)
      router.push("/master-katalog")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengupdate data Katalog"
      toast.error(message)
    }
  }

  if (isLoading || !itemTypesFetched) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <FormSkeleton />
      </div>
    )
  }

  if (!catalogData) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Edit Data</h1>
        <Breadcrumbs
          items={[
            { label: "Master Katalog", href: "/master-katalog" },
            {
              label: catalogData.name ?? "Detail",
              href: `/master-katalog/${id}`,
            },
            { label: "Edit Data", className: "text-destructive" },
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Data Katalog</CardTitle>
            {ptDisplayName && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">PT :</span>
                <span className="text-muted-foreground text-sm">
                  {ptDisplayName}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
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
                                htmlFor="image-upload-edit-katalog"
                                className="bg-destructive hover:bg-destructive/90 absolute right-0 bottom-0 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full text-white shadow-sm transition-colors"
                                aria-label="Ubah gambar"
                              >
                                <Pencil className="size-4" />
                                <input
                                  id="image-upload-edit-katalog"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageChange(e, field)}
                                />
                              </label>
                              {(existingImageKey || field.value) && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(field)}
                                  className="bg-background absolute bottom-0 left-0 z-50 flex size-10 items-center justify-center rounded-full border shadow-sm"
                                  aria-label="Hapus gambar"
                                >
                                  <X className="size-4" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <label
                              htmlFor="image-upload-katalog"
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
                                id="image-upload-katalog"
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

              <div className="space-y-8">
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
                          <FormLabel>Kode Katalog</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              readOnly
                              disabled
                              className="bg-muted"
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
                              placeholder="Contoh: iPhone 15 Pro"
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
                            key={`tipe-${id}`}
                            value={
                              field.value && field.value.trim() !== ""
                                ? field.value
                                : catalogItemTypeId &&
                                    tipeBarangOptions.some(
                                      (o) => o.value === catalogItemTypeId
                                    )
                                  ? catalogItemTypeId
                                  : field.value || ""
                            }
                            onValueChange={(v) => {
                              field.onChange(v)
                            }}
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
                              placeholder="Contoh: Diskon Lebaran"
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

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/master-katalog/${id}`)}
                    disabled={isSubmitting || presignedUrlMutation.isPending}
                  >
                    <X className="mr-2 size-4" />
                    Batal
                  </Button>
                  <Button
                    type="button"
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleSimpanClick}
                    disabled={isSubmitting || presignedUrlMutation.isPending}
                  >
                    {isSubmitting || presignedUrlMutation.isPending ? (
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

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmSubmit}
        title="Apakah Anda Yakin?"
        description="Anda akan mengupdate data Katalog ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </div>
  )
}
