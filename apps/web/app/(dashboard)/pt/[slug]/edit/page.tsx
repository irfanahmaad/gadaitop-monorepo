"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
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
} from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
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

const ptEditSchema = z
  .object({
    image: z.union([z.instanceof(File), z.string()]).optional(),
    code: z.string().min(1, "Kode PT harus diisi"),
    name: z.string().min(1, "Nama PT harus diisi"),
    email: z
      .string()
      .email("Format email tidak valid")
      .optional()
      .or(z.literal("")),
    phone: z.string().optional(),
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

// Sample data - in a real app, this would come from an API
const samplePT = {
  id: "PT001",
  code: "PT001",
  name: "PT Gadai Top Indonesia",
  email: "gadaitop@mail.com",
  phone: "0812345678910",
  image: "/commons/img_logo-gadai-top-img-only.png",
  adminName: "Ben Affleck",
  adminEmail: "ben.aff@mail.com",
  adminPhone: "0812345678910",
}

export default function EditPTPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<PTEditFormValues>({
    resolver: zodResolver(ptEditSchema),
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

  // Fetch and populate form data
  useEffect(() => {
    // In a real app, fetch data based on slug
    // For now, using sample data
    const pt = samplePT

    if (pt) {
      form.reset({
        image: pt.image,
        code: pt.code,
        name: pt.name,
        email: pt.email,
        phone: pt.phone,
        adminName: pt.adminName,
        adminEmail: pt.adminEmail,
        adminPhone: pt.adminPhone,
        password: "",
        confirmPassword: "",
      })
      if (pt.image) {
        setPreviewImage(pt.image)
      }
    }
    setIsLoading(false)
  }, [slug, form])

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

  const onSubmit = (values: PTEditFormValues) => {
    console.log("Form values:", values)
    // Handle form submission logic here
    // After successful submission, redirect to list page
    // router.push("/pt")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Memuat data...</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Edit Data</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Pages</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/pt">Master PT</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Data</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
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
                            <FormLabel>Email</FormLabel>
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
                    >
                      <X className="mr-2 size-4" />
                      Batal
                    </Button>
                    <Button type="submit">Simpan</Button>
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
