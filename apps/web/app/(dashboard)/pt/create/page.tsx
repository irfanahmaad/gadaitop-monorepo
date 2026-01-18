"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
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
import { useCreateCompany } from "@/lib/react-query/hooks"

const ptSchema = z
  .object({
    image: z.union([z.instanceof(File), z.string()]).optional(),
    code: z.string().min(1, "Kode PT harus diisi").max(10, "Kode PT maksimal 10 karakter"),
    name: z.string().min(1, "Nama PT harus diisi").max(255, "Nama PT maksimal 255 karakter"),
    email: z
      .string()
      .email("Format email tidak valid")
      .optional()
      .or(z.literal("")),
    phone: z.string().max(20, "No. Telepon maksimal 20 karakter").optional(),
    adminName: z.string().min(1, "Nama Lengkap harus diisi").max(255, "Nama Lengkap maksimal 255 karakter"),
    adminEmail: z
      .string()
      .min(1, "Email harus diisi")
      .email("Format email tidak valid"),
    adminPhone: z.string().max(20, "No. Telepon maksimal 20 karakter").optional(),
    password: z
      .string()
      .min(1, "Kata Sandi harus diisi")
      .min(8, "Kata Sandi minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Ulangi Kata Sandi harus diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata Sandi tidak cocok",
    path: ["confirmPassword"],
  })

type PTFormValues = z.infer<typeof ptSchema>

export default function PTCreatePage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const createCompanyMutation = useCreateCompany()

  const form = useForm<PTFormValues>({
    resolver: zodResolver(ptSchema),
    defaultValues: {
      image: undefined,
      code: "",
      name: "",
      email: "",
      phone: "",
      adminName: "",
      adminEmail: "",
      adminPhone: "",
      password: "",
      confirmPassword: "",
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

  const handleRemoveImage = (field: {
    onChange: (value: undefined) => void
  }) => {
    field.onChange(undefined)
    setPreviewImage(null)
  }

  const onSubmit = async (values: PTFormValues) => {
    try {
      await createCompanyMutation.mutateAsync({
        companyCode: values.code,
        companyName: values.name,
        phoneNumber: values.phone || undefined,
        address: undefined,
        companyEmail: values.email || undefined,
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        adminPhone: values.adminPhone || undefined,
        password: values.password,
      })
      toast.success("PT berhasil ditambahkan")
      router.push("/pt")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menambahkan PT"
      toast.error(message)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Tambah Data</h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: "Master PT", href: "/pt" },
              { label: "Tambah Data" },
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

                        {/* Email PT Field */}
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email PT</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Contoh: gadaitop@mail.com"
                                  icon={<Mail className="size-4" />}
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
                        name="adminPhone"
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
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Kata Sandi Field */}
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Kata Sandi{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Minimal 8 Karakter"
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
                            <FormLabel>
                              Ulangi Kata Sandi{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder="Minimal 8 Karakter"
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
                      disabled={createCompanyMutation.isPending}
                    >
                      <X className="mr-2 size-4" />
                      Batal
                    </Button>
                    <Button type="submit" disabled={createCompanyMutation.isPending}>
                      {createCompanyMutation.isPending ? (
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
