"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useParams } from "next/navigation"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Upload,
  X,
  IdCard,
  Phone,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  useUser,
  useUpdateSuperAdmin,
  useResetUserPassword,
  useUploadFile,
  usePublicUrl,
} from "@/lib/react-query/hooks"

const superAdminEditSchema = z
  .object({
    image: z.union([z.instanceof(File), z.string()]).optional(),
    fullName: z.string().min(1, "Nama Lengkap harus diisi"),
    email: z
      .string()
      .min(1, "Email harus diisi")
      .email("Format email tidak valid"),
    phoneNumber: z.string().min(1, "No. Telepon harus diisi"),
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

type SuperAdminEditFormValues = z.infer<typeof superAdminEditSchema>

export default function EditSuperAdminPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Fetch user data
  const { data: superAdmin, isLoading: isLoadingUser, isError } = useUser(slug)
  const updateMutation = useUpdateSuperAdmin()
  const resetPasswordMutation = useResetUserPassword()
  const presignedUrlMutation = useUploadFile()

  // Resolve existing imageUrl to a displayable public URL
  const existingImageKey = superAdmin?.imageUrl ?? ""
  const { data: publicUrlData } = usePublicUrl(existingImageKey)

  const form = useForm<SuperAdminEditFormValues>({
    resolver: zodResolver(superAdminEditSchema),
    defaultValues: {
      image: undefined,
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (superAdmin) {
      form.reset({
        image: superAdmin.imageUrl || undefined,
        fullName: superAdmin.fullName,
        email: superAdmin.email,
        phoneNumber: superAdmin.phoneNumber || "",
        password: "",
        confirmPassword: "",
      })
      // Show existing image as preview
      if (superAdmin.imageUrl && publicUrlData?.url) {
        setPreviewImage(publicUrlData.url)
      }
    }
  }, [superAdmin, form, publicUrlData])

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

  const onSubmit = async (values: SuperAdminEditFormValues) => {
    try {
      let imageUrl: string | undefined

      // Upload image to S3 via backend if a new file was selected
      if (values.image instanceof File) {
        const file = values.image
        const ext = file.name.split(".").pop() || "jpg"
        const key = `users/${slug}/avatar-${Date.now()}.${ext}`

        const { key: s3Key } = await presignedUrlMutation.mutateAsync({
          file,
          key,
        })

        imageUrl = s3Key
      }

      // Update user info
      await updateMutation.mutateAsync({
        id: slug,
        data: {
          fullName: values.fullName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          ...(imageUrl && { imageUrl }),
        },
      })

      // Reset password if provided
      if (values.password && values.password.length >= 8) {
        await resetPasswordMutation.mutateAsync({
          id: slug,
          data: { newPassword: values.password },
        })
      }

      toast.success("Super Admin berhasil diperbarui")
      router.push(`/super-admin/${slug}`)
    } catch (error: any) {
      toast.error(error?.errorMessage || "Gagal memperbarui Super Admin")
    }
  }

  if (isLoadingUser) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !superAdmin) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Data Super Admin tidak ditemukan</p>
        <Button variant="outline" onClick={() => router.push("/super-admin")}>
          Kembali ke Daftar
        </Button>
      </div>
    )
  }

  const isSubmitting = updateMutation.isPending || resetPasswordMutation.isPending || presignedUrlMutation.isPending

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Edit Data</h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: "Master Super Admin", href: "/super-admin" },
              { label: "Edit Data" },
            ]}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Edit Super Admin</CardTitle>
          </CardHeader>
          <CardContent>
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
                                      <p className="text-muted-foreground text-xs">
                                        PNG, JPG hingga 5MB
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
                  {/* Detail Super Admin Section */}
                  <div className="mb-10 space-y-4">
                    <div className="flex items-center gap-3">
                      <IdCard className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Detail Super Admin
                      </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Nama Lengkap Field */}
                      <FormField
                        control={form.control}
                        name="fullName"
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
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

                      {/* No. Telepon Field */}
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              No. Telepon{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
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
                    </div>
                  </div>

                  {/* Keamanan Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Lock className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Keamanan
                      </h2>
                    </div>

                    <div className="text-muted-foreground mb-4 text-sm">
                      Kosongkan jika tidak ingin mengubah kata sandi
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
                      disabled={isSubmitting}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Perubahan"
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
