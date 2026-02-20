"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { format, parse } from "date-fns"
import { id } from "date-fns/locale"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IdCard,
  Lock,
  Upload,
  X,
  Loader2,
  Pencil,
  ScanLine,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useCreateCustomer } from "@/lib/react-query/hooks/use-customers"

const customerSchema = z.object({
  image: z.union([z.instanceof(File), z.string()]).optional(),
  namaCustomer: z
    .string()
    .min(1, "Nama Customer harus diisi")
    .max(255, "Nama Customer maksimal 255 karakter"),
  jenisKelamin: z.enum(["Laki-laki", "Perempuan"], {
    required_error: "Jenis Kelamin harus dipilih",
  }),
  nik: z
    .string()
    .min(1, "NIK harus diisi")
    .min(16, "NIK harus terdiri dari 16 digit")
    .max(16, "NIK harus terdiri dari 16 digit")
    .regex(/^\d+$/, "NIK harus berupa angka"),
  tempatLahir: z
    .string()
    .max(100, "Tempat Lahir maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
  tanggalLahir: z
    .string()
    .max(50, "Tanggal Lahir maksimal 50 karakter")
    .optional()
    .or(z.literal("")),
  kota: z
    .string()
    .max(100, "Kota maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
  kecamatan: z
    .string()
    .max(100, "Kecamatan maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
  kelurahan: z
    .string()
    .max(100, "Kelurahan maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
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
  telepon2: z
    .string()
    .max(20, "Telepon 2 maksimal 20 karakter")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Format email tidak valid")
    .max(255, "Email maksimal 255 karakter")
    .optional()
    .or(z.literal("")),
  pin: z
    .string()
    .min(6, "PIN harus terdiri dari minimal 6 karakter")
    .max(10, "PIN maksimal 10 karakter")
    .optional()
    .or(z.literal("")),
})

type CustomerFormValues = z.infer<typeof customerSchema>

function parseDobToIso(value: string): string | null {
  if (!value?.trim()) return null
  const trimmed = value.trim()
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
    const parsed = parse(trimmed, "d MMMM yyyy", new Date(), { locale: id })
    return format(parsed, "yyyy-MM-dd")
  } catch {
    return null
  }
}

export default function TambahMasterCustomerPage() {
  const router = useRouter()
  const { user } = useAuth()
  const isCompanyAdmin =
    user?.roles?.some((r) => r.code === "company_admin") ?? false
  const isSuperAdmin = user?.roles?.some((r) => r.code === "owner") ?? false
  const effectiveCompanyId = isCompanyAdmin ? (user?.companyId ?? null) : null

  const { data: companiesData } = useCompanies(
    isSuperAdmin || isCompanyAdmin ? { pageSize: 100 } : undefined
  )
  const ptOptions = useMemo(() => {
    const list = companiesData?.data ?? []
    const mapped = list.map((c) => ({ value: c.uuid, label: c.companyName }))
    if (isCompanyAdmin && effectiveCompanyId) {
      return mapped.filter((o) => o.value === effectiveCompanyId)
    }
    return mapped
  }, [companiesData, isCompanyAdmin, effectiveCompanyId])

  const [selectedPT, setSelectedPT] = useState("")
  useEffect(() => {
    if (isCompanyAdmin && effectiveCompanyId && !selectedPT) {
      setSelectedPT(effectiveCompanyId)
    }
  }, [isCompanyAdmin, effectiveCompanyId, selectedPT])
  useEffect(() => {
    if (isSuperAdmin && ptOptions.length > 0 && !selectedPT) {
      setSelectedPT(ptOptions[0]!.value)
    }
  }, [isSuperAdmin, ptOptions, selectedPT])

  const createCustomerMutation = useCreateCustomer()

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
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
      pin: "",
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

  const handleScan = () => {
    router.push("/scan-ktp")
  }

  const handleCustomerMasukkanPin = () => {
    form.setFocus("pin")
    toast.info("Customer dapat memasukkan PIN pada kolom PIN di form ini")
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
    if (!selectedPT) {
      toast.error("Pilih PT terlebih dahulu")
      return
    }
    const dobIso = parseDobToIso(values.tanggalLahir ?? "")
    if (!dobIso) {
      toast.error(
        "Tanggal lahir wajib diisi dengan format yang valid (contoh: 20 November 1990 atau YYYY-MM-DD)"
      )
      return
    }
    const phone = (values.telepon1 ?? "").trim()
    const email = (values.email ?? "").trim()
    const pin = (values.pin ?? "").trim()
    if (!phone) {
      toast.error("Telepon 1 wajib diisi")
      return
    }
    if (!email) {
      toast.error("E-mail wajib diisi")
      return
    }
    if (!pin || pin.length < 4 || pin.length > 6) {
      toast.error("PIN wajib diisi (4–6 karakter)")
      return
    }
    const address = (values.alamat ?? "").trim() || "-"
    const city = (values.kota ?? "").trim() || "-"

    setIsSubmitting(true)
    try {
      await createCustomerMutation.mutateAsync({
        nik: values.nik,
        pin,
        fullName: values.namaCustomer,
        dateOfBirth: dobIso,
        gender: values.jenisKelamin === "Laki-laki" ? "male" : "female",
        address,
        city,
        phoneNumber: phone,
        email,
        ptId: selectedPT,
      })
      toast.success("Data Customer berhasil ditambahkan")
      setConfirmOpen(false)
      router.push("/master-customer")
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Gagal menambahkan data Customer"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Tambah Data</h1>
          <Breadcrumbs
            items={[
              { label: "Master Customer", href: "/master-customer" },
              { label: "Tambah Data", className: "text-destructive" },
            ]}
          />
        </div>
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

      {/* Data Customer card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data Customer</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={handleScan}
              className="gap-2"
            >
              <ScanLine className="size-4" />
              Scan
            </Button>
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
                {/* Detail Customer section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Customer
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
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
                              className="flex gap-6"
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
                            NIK <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: 9999011501010001"
                              icon={<IdCard className="size-4" />}
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
                              placeholder="Contoh: Jakarta"
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
                      name="tanggalLahir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Lahir</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: 20 November 1990"
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

                {/* Detail Kontak section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Kontak
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
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
                      name="kecamatan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kecamatan</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: Kramatjati"
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
                      name="kelurahan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kelurahan</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: Batu Ampar"
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

                {/* Keamanan section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Lock className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Keamanan (PIN sudah Diinput)
                    </h2>
                  </div>
                  <div className="w-full gap-6">
                    <FormField
                      control={form.control}
                      name="pin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PIN</FormLabel>
                          <FormControl>
                            <div className="flex w-full gap-2">
                              <Input
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock className="size-4" />}
                                className="flex-1"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={handleCustomerMasukkanPin}
                              >
                                Customer Masukkan PIN
                              </Button>
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
        description="Anda akan menyimpan data Customer ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </div>
  )
}
