"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useParams } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IdCard,
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
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { Label } from "@workspace/ui/components/label"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useCustomer, useUpdateCustomer } from "@/lib/react-query/hooks/use-customers"

const customerEditSchema = z.object({
  image: z.union([z.instanceof(File), z.string()]).optional(),
  namaCustomer: z
    .string()
    .min(1, "Nama Customer harus diisi")
    .max(255, "Nama Customer maksimal 255 karakter"),
  jenisKelamin: z.string().optional(),
  nik: z.string().optional(),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
  kota: z.string().optional(),
  kecamatan: z.string().optional(),
  kelurahan: z.string().optional(),
  alamat: z
    .string()
    .max(500, "Alamat maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  telepon1: z
    .string()
    .max(20, "Telepon 1 maksimal 20 karakter")
    .optional()
    .or(z.literal("")),
  telepon2: z.string().optional(),
  email: z
    .string()
    .email("Format email tidak valid")
    .max(255, "Email maksimal 255 karakter")
    .optional()
    .or(z.literal("")),
})

type CustomerEditFormValues = z.infer<typeof customerEditSchema>

export default function EditMasterCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""

  const { data: customer, isLoading } = useCustomer(id)
  const updateCustomerMutation = useUpdateCustomer()

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CustomerEditFormValues>({
    resolver: zodResolver(customerEditSchema),
    defaultValues: {
      image: undefined,
      namaCustomer: "",
      jenisKelamin: "Laki-laki",
      nik: "",
      tempatLahir: "",
      tanggalLahir: "",
      kota: "",
      kecamatan: "",
      kelurahan: "",
      alamat: "",
      telepon1: "",
      telepon2: "",
      email: "",
    },
  })

  useEffect(() => {
    if (customer) {
      form.reset({
        namaCustomer: customer.fullName || customer.name || "",
        jenisKelamin: customer.gender === "male" ? "Laki-laki" : customer.gender === "female" ? "Perempuan" : "Laki-laki",
        nik: customer.nik || "",
        tanggalLahir: customer.dob || customer.dateOfBirth || "",
        kota: customer.city || "",
        alamat: customer.address || "",
        telepon1: customer.phoneNumber || customer.phone || "",
        email: customer.email || "",
      })
      if (customer.ktpPhotoUrl || customer.selfiePhotoUrl) {
        setPreviewImage(customer.ktpPhotoUrl || customer.selfiePhotoUrl || null)
      }
    }
  }, [customer, form])

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
    const phone = (values.telepon1 ?? "").trim()
    const email = (values.email ?? "").trim()

    if (!phone) {
      toast.error("Telepon 1 wajib diisi")
      return
    }
    if (!email) {
      toast.error("E-mail wajib diisi")
      return
    }

    const address = (values.alamat ?? "").trim() || "-"

    setIsSubmitting(true)
    try {
      await updateCustomerMutation.mutateAsync({
        id,
        data: {
          fullName: values.namaCustomer,
          address,
          phoneNumber: phone,
          email,
        }
      })
      toast.success("Data Customer berhasil diubah")
      setConfirmOpen(false)
      router.push("/master-customer")
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Gagal mengubah data Customer"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!id || isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Edit Data</h1>
          <Breadcrumbs
            items={[
              { label: "Master Customer", href: "/master-customer" },
              { label: "Edit Data", className: "text-destructive" },
            ]}
          />
        </div>
      </div>

      {/* Data Customer card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data Customer</CardTitle>
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
                                  disabled
                                />
                              </label>
                            </div>
                          ) : (
                            <label
                              htmlFor="image-upload"
                              className="border-input bg-muted/50 hover:bg-muted flex aspect-square w-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border-2 border-dashed transition-colors opacity-50 cursor-not-allowed"
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
                                disabled
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
                    <User className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Customer
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 items-start">
                    <FormField
                      control={form.control}
                      name="namaCustomer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nama Customer <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: Agung Prasetyo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="jenisKelamin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kelamin</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex gap-6 opacity-50 pointer-events-none"
                              disabled
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="Laki-laki"
                                  id="laki-laki"
                                />
                                <Label
                                  htmlFor="laki-laki"
                                  className="cursor-pointer"
                                >
                                  Laki-laki
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="Perempuan"
                                  id="perempuan"
                                />
                                <Label
                                  htmlFor="perempuan"
                                  className="cursor-pointer"
                                >
                                  Perempuan
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nik"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            NIK
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              icon={<IdCard className="size-4" />}
                              disabled
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tempatLahir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempat Lahir</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              icon={<MapPin className="size-4" />}
                              disabled
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
                              type="text"
                              icon={<Calendar className="size-4" />}
                              disabled
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Detail Kontak section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Kontak
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 items-start">
                    <FormField
                      control={form.control}
                      name="kota"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kota</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              icon={<MapPin className="size-4" />}
                              disabled
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kecamatan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kecamatan</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              icon={<MapPin className="size-4" />}
                              disabled
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kelurahan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kelurahan</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              icon={<MapPin className="size-4" />}
                              disabled
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
                    <FormField
                      control={form.control}
                      name="telepon1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telepon 1</FormLabel>
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
                      name="telepon2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telepon 2</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              icon={<Phone className="size-4" />}
                              disabled
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Contoh: agung.pras@mail.com"
                              icon={<Mail className="size-4" />}
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
                    onClick={() => router.push("/master-customer")}
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
        description="Anda akan menyimpan perubahan data Customer ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </div>
  )
}
