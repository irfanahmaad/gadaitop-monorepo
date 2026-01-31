"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Upload,
  X,
  IdCard,
  Loader2,
  Pencil,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useCreateUser, useRoles } from "@/lib/react-query/hooks"

const userSchema = z
  .object({
    image: z.union([z.instanceof(File), z.string()]).optional(),
    fullName: z.string().min(1, "Nama Lengkap harus diisi"),
    email: z
      .string()
      .min(1, "Email harus diisi")
      .email("Format email tidak valid"),
    phoneNumber: z.string().optional().or(z.literal("")),
    roleId: z.string().min(1, "Role harus dipilih"),
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

type UserFormValues = z.infer<typeof userSchema>

export default function TambahMasterPenggunaPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch roles for dropdown
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles()
  const createMutation = useCreateUser()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      image: undefined,
      fullName: "",
      email: "",
      phoneNumber: "",
      roleId: "",
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
      await createMutation.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber || undefined,
        roleIds: [values.roleId],
      })
      toast.success("Pengguna berhasil ditambahkan")
      setConfirmOpen(false)
      router.push("/master-pengguna")
    } catch (error: any) {
      toast.error(
        error?.errorMessage || error?.message || "Gagal menambahkan pengguna"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingRoles) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Tambah Data</h1>
          <Breadcrumbs
            items={[
              { label: "Master Pengguna", href: "/master-pengguna" },
              { label: "Tambah Data", className: "text-destructive" },
            ]}
          />
        </div>

        {/* Data Pengguna card */}
        <Card>
          <CardHeader>
            <CardTitle>Data Pengguna</CardTitle>
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
                  {/* Detail Pengguna section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <IdCard className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Detail Pengguna
                      </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
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
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Contoh: agung.pras@gmail.com"
                                icon={<Mail className="size-4" />}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
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
                        name="roleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {rolesData?.data?.map((role) => (
                                  <SelectItem key={role.uuid} value={role.uuid}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Keamanan section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Lock className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Keamanan
                      </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kata Sandi</FormLabel>
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
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ulangi Kata Sandi</FormLabel>
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

                  {/* Action buttons */}
                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/master-pengguna")}
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
      </div>

      {/* Save confirmation dialog */}
      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmSubmit}
        title="Apakah Anda Yakin?"
        description="Anda akan menyimpan data Pengguna ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </>
  )
}
