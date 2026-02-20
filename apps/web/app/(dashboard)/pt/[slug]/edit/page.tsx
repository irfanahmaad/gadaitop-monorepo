"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Upload,
  X,
  Building2,
  Phone,
  UserPlus,
  Loader2,
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  useCompany,
  useUpdateCompany,
  useUploadFile,
  usePublicUrl,
} from "@/lib/react-query/hooks"

const ptEditSchema = z
  .object({
    image: z.union([z.instanceof(File), z.string()]).optional(),
    code: z.string().min(1, "Kode PT harus diisi"),
    name: z.string().min(1, "Nama PT harus diisi"),
    phone: z.string().optional(),
    address: z.string().optional(),
    adminName: z.string().min(1, "Nama Lengkap harus diisi"),
    adminEmail: z
      .string()
      .email("Format email tidak valid")
      .optional()
      .or(z.literal("")),
    adminPhone: z.string().optional(),
    password: z
      .string()
      .min(8, "Kata Sandi minimal 8 karakter")
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Only validate password match if password is provided
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword
      }
      return true
    },
    {
      message: "Kata Sandi tidak cocok",
      path: ["confirmPassword"],
    }
  )

type PTEditFormValues = z.infer<typeof ptEditSchema>

// Loading skeleton for form
function FormSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
          <div className="flex justify-center">
            <Skeleton className="aspect-square size-48 rounded-full" />
          </div>
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
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

export default function EditPTPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Fetch company data
  const { data: company, isLoading, isError } = useCompany(slug)
  const updateCompanyMutation = useUpdateCompany()
  const uploadFileMutation = useUploadFile()
  const existingImageKey = company?.imageUrl ?? ""
  const { data: publicUrlData } = usePublicUrl(existingImageKey)

  const form = useForm<PTEditFormValues>({
    resolver: zodResolver(ptEditSchema),
    defaultValues: {
      image: undefined,
      code: "",
      name: "",
      phone: "",
      address: "",
      adminName: "",
      adminEmail: "",
      adminPhone: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Populate form when company data is loaded
  useEffect(() => {
    if (company) {
      form.reset({
        image: company.imageUrl || undefined,
        code: company.companyCode,
        name: company.companyName,
        phone: company.phoneNumber || "",
        address: company.address || "",
        adminName: company.owner?.fullName || "",
        adminEmail: company.owner?.email || "",
        adminPhone: company.owner?.phoneNumber || "",
        password: "",
        confirmPassword: "",
      })
      if (company.imageUrl && publicUrlData?.url) {
        setPreviewImage(publicUrlData.url)
      }
    }
  }, [company, form, publicUrlData?.url])

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

  const handleRemoveImage = (field: {
    onChange: (value: undefined) => void
  }) => {
    field.onChange(undefined)
    setPreviewImage(null)
  }

  const onSubmit = async (values: PTEditFormValues) => {
    try {
      let imageUrl: string | null | undefined = undefined

      if (values.image instanceof File) {
        const file = values.image
        const ext = file.name.split(".").pop() || "jpg"
        const key = `companies/${slug}/logo-${Date.now()}.${ext}`

        const { key: s3Key } = await uploadFileMutation.mutateAsync({
          file,
          key,
        })
        imageUrl = s3Key
      } else if (company?.imageUrl && !values.image) {
        imageUrl = null
      }

      await updateCompanyMutation.mutateAsync({
        id: slug,
        data: {
          companyName: values.name,
          phoneNumber: values.phone || undefined,
          address: values.address || undefined,
          ...(imageUrl !== undefined && { imageUrl }),
        },
      })
      toast.success("PT berhasil diperbarui")
      router.push(`/pt/${slug}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui PT"
      toast.error(message)
    }
  }

  if (isLoading) {
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

  if (isError || !company) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Gagal memuat data PT</p>
        <Button variant="outline" onClick={() => router.push("/pt")}>
          Kembali ke Daftar PT
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Edit Data</h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: "Master PT", href: "/pt" },
              { label: "Edit Data" },
            ]}
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 space-y-8 lg:grid-cols-[250px_1fr]"
              >
                <div>
                  {/* Image Upload Section */}
                  <div className="flex justify-center">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="space-y-4">
                              {previewImage ? (
                                <div className="border-input bg-muted/50 relative aspect-square w-48 overflow-hidden rounded-full border-2 border-dashed">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(field)}
                                    className="bg-destructive hover:bg-destructive/90 absolute top-2 right-2 z-10 rounded-full p-1.5 text-white shadow-sm transition-colors"
                                    aria-label="Hapus gambar"
                                  >
                                    <X className="size-4" />
                                  </button>
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
                                    <div className="text-center">
                                      <p className="text-sm font-medium">
                                        Upload Gambar
                                      </p>
                                    </div>
                                  </div>
                                  <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleImageChange(e, field)
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
                </div>

                <div>
                  {/* Data PT Section */}
                  <div className="mb-10 space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b border-dashed pb-4">
                        <Building2 className="text-destructive size-6" />
                        <h3 className="text-destructive text-base font-semibold">
                          Detail PT
                        </h3>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Kode PT Field */}
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Kode PT{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Contoh: PT001"
                                  icon={<Building2 className="size-4" />}
                                  disabled
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Nama PT Field */}
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Nama PT{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Contoh: PT Gadai Top Indonesia"
                                  icon={<Building2 className="size-4" />}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* No. Telepon PT Field */}
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>No. Telepon PT</FormLabel>
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

                        {/* Alamat Field */}
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alamat</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Contoh: Jl. Sudirman No. 1"
                                  icon={<Building2 className="size-4" />}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Admin Primary Section */}
                  <div className="mb-10 space-y-4">
                    <div className="flex items-center gap-3 border-b border-dashed pb-4">
                      <UserPlus className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Admin Primary
                      </h2>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Data admin primary tidak dapat diubah di halaman ini.
                    </p>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Nama Lengkap Field */}
                      <FormField
                        control={form.control}
                        name="adminName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Nama Lengkap{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Contoh: Agung Prasetyo"
                                icon={<User className="size-4" />}
                                disabled
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email Field */}
                      <FormField
                        control={form.control}
                        name="adminEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Contoh: agung.pras@mail.com"
                                icon={<Mail className="size-4" />}
                                disabled
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* No. Telepon Field */}
                      <FormField
                        control={form.control}
                        name="adminPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>No. Telepon</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Contoh: 0812345678910"
                                icon={<Phone className="size-4" />}
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

                  {/* Keamanan (Admin Primary) Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-dashed pb-4">
                      <Lock className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Keamanan (Admin Primary)
                      </h2>
                    </div>
                    <div className="text-muted-foreground mb-4 text-sm">
                      Untuk mengubah kata sandi admin, silakan gunakan fitur reset password.
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Kata Sandi Field */}
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kata Sandi Baru</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Kosongkan jika tidak ingin mengubah"
                                  icon={<Lock className="size-4" />}
                                  disabled
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                                  aria-label={
                                    showPassword
                                      ? "Sembunyikan password"
                                      : "Tampilkan password"
                                  }
                                >
                                  {showPassword ? (
                                    <EyeOff className="size-4" />
                                  ) : (
                                    <Eye className="size-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Ulangi Kata Sandi Field */}
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ulangi Kata Sandi Baru</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder="Kosongkan jika tidak ingin mengubah"
                                  icon={<Lock className="size-4" />}
                                  disabled
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                                  aria-label={
                                    showConfirmPassword
                                      ? "Sembunyikan password"
                                      : "Tampilkan password"
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="size-4" />
                                  ) : (
                                    <Eye className="size-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={
                        updateCompanyMutation.isPending ||
                        uploadFileMutation.isPending
                      }
                    >
                      <X className="mr-2 size-4" />
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        updateCompanyMutation.isPending ||
                        uploadFileMutation.isPending
                      }
                    >
                      {updateCompanyMutation.isPending ? (
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
      </div>
    </>
  )
}
