"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
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
import { useCreateBranch } from "@/lib/react-query/hooks/use-branches"
import { useUploadFile } from "@/lib/react-query/hooks/use-upload"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"

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
  alamat: z
    .string()
    .max(500, "Alamat maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  companyId: z.string().optional(),
})

type TokoFormValues = z.infer<typeof tokoSchema>

export default function TambahMasterTokoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPinjamPTFlow = searchParams.get("pinjamPT") === "1"

  const schema = useMemo(
    () =>
      isPinjamPTFlow
        ? tokoSchema.refine(
            (data) => !!data.companyId?.trim(),
            { message: "PT yang akan dipinjam wajib dipilih.", path: ["companyId"] }
          )
        : tokoSchema,
    [isPinjamPTFlow]
  )
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { user } = useAuth()
  const isSuperAdmin = user?.roles?.some((r) => r.code === "owner") ?? false
  const userCompanyId = user?.companyId ?? user?.ownedCompanyId ?? ""

  const { data: companiesData } = useCompanies(
    isSuperAdmin || isPinjamPTFlow ? { pageSize: 100 } : undefined
  )

  const ptOptions = React.useMemo(() => {
    const list = companiesData?.data ?? []
    const options = list.map((c) => ({ value: c.uuid, label: c.companyName }))
    if (isPinjamPTFlow && userCompanyId) {
      return options.filter((opt) => opt.value !== userCompanyId)
    }
    return options
  }, [companiesData, isPinjamPTFlow, userCompanyId])

  const { mutateAsync: createBranch, isPending: isSubmitting } =
    useCreateBranch()
  const uploadFileMutation = useUploadFile()

  const form = useForm<TokoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      image: undefined,
      kodeLokasi: "",
      namaToko: "",
      alias: "",
      noTelepon: "",
      kota: "",
      alamat: "",
      companyId: "",
    },
  })

  // Default PT to current user's company for normal create; when opening from Toko Pinjaman (pinjamPT=1) do NOT default so they must select target PT
  useEffect(() => {
    if (
      isSuperAdmin &&
      userCompanyId &&
      !form.getValues("companyId") &&
      !isPinjamPTFlow
    ) {
      form.setValue("companyId", userCompanyId)
    }
  }, [isSuperAdmin, userCompanyId, form, isPinjamPTFlow])

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
    try {
      // Use selected PT from form when Super Admin or in Pinjam PT flow; otherwise use current user's company
      const companyId =
        isSuperAdmin || isPinjamPTFlow
          ? values.companyId
          : user?.companyId
      if (!companyId) {
        throw new Error("Company ID PT belum dipilih atau tidak ditemukan")
      }

      // When opened from Toko Pinjaman tab (?pinjamPT=1), always create as Pinjam PT (target PT + borrow request flow)
      const isPinjamPT =
        isPinjamPTFlow && !!companyId && !!user?.uuid

      let imageUrl: string | undefined
      if (values.image instanceof File) {
        const file = values.image
        const ext = file.name.split(".").pop() || "jpg"
        const key = `branches/${companyId}/foto-${Date.now()}.${ext}`
        const { key: s3Key } = await uploadFileMutation.mutateAsync({
          file,
          key,
        })
        imageUrl = s3Key
      }

      await createBranch({
        branchCode: values.kodeLokasi,
        shortName: values.alias,
        fullName: values.namaToko,
        address: (values.alamat ?? "").trim() || "-",
        phone: (values.noTelepon ?? "").trim() || "-",
        city: (values.kota ?? "").trim() || "-",
        companyId,
        ...(imageUrl && { imageUrl }),
        ...(isPinjamPT &&
          user?.uuid && {
            isBorrowed: true,
            actualOwnerId: user.uuid,
          }),
      })

      if (isPinjamPT) {
        toast.success(
          "Toko berhasil ditambahkan. Menunggu persetujuan pemilik PT."
        )
      } else {
        toast.success("Data Toko berhasil ditambahkan")
      }
      setConfirmOpen(false)
      router.push("/master-toko")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menambahkan data Toko"
      toast.error(message)
    } finally {
      // noop
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {isPinjamPTFlow ? "Tambah Toko Pinjaman" : "Tambah Data"}
        </h1>
        <Breadcrumbs
          items={[
            { label: "Master Toko", href: "/master-toko" },
            {
              label: isPinjamPTFlow ? "Tambah Toko Pinjaman" : "Tambah Data",
              className: "text-destructive",
            },
          ]}
        />
        {isPinjamPTFlow && (
          <p className="text-muted-foreground text-sm">
            Pilih PT yang akan dipinjam. Toko akan berstatus menunggu persetujuan
            pemilik PT tersebut.
          </p>
        )}
      </div>

      {/* Data Toko card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isPinjamPTFlow ? "Data Toko Pinjaman" : "Data Toko"}
          </CardTitle>
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
                              <div className="border-input bg-muted/50 h-full w-full overflow-hidden rounded-full border-2 border-dashed">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={previewImage}
                                  alt="Preview"
                                  className="size-full object-cover"
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
                {/* Detail Toko section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Store className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Toko
                    </h2>
                  </div>
                  <div className="grid items-start gap-6 md:grid-cols-2">
                    {(isSuperAdmin || isPinjamPTFlow) && (
                      <FormField
                        control={form.control}
                        name="companyId"
                        render={({ field }) => {
                          const selectedPtIsOther =
                            !!field.value &&
                            field.value !== user?.companyId &&
                            field.value !== user?.ownedCompanyId
                          return (
                            <FormItem className="md:col-span-2">
                              <FormLabel>
                                PT <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue
                                      placeholder={
                                        isPinjamPTFlow
                                          ? "Pilih PT yang akan dipinjam"
                                          : "Pilih PT"
                                      }
                                    />
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
                              {isPinjamPTFlow && (
                                <p className="text-muted-foreground text-sm">
                                  Toko akan dibuat sebagai <strong>Pinjam PT</strong> dan
                                  memerlukan persetujuan pemilik PT tersebut.
                                </p>
                              )}
                              {!isPinjamPTFlow && selectedPtIsOther && (
                                <p className="text-muted-foreground text-sm">
                                  Toko akan dibuat sebagai <strong>Pinjam PT</strong> dan
                                  memerlukan persetujuan pemilik PT tersebut.
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />
                    )}
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
                    onClick={() => router.push("/master-toko")}
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
        description="Anda akan menyimpan data Toko ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </div>
  )
}
