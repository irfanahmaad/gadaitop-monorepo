"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import {
  FileText,
  User,
  Calendar,
  CreditCard,
  Lock,
  X,
  Loader2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Monitor,
  Eye,
  EyeOff,
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

import type { ApiResponse } from "@/lib/api/types"
import type { AuthUser } from "@/lib/auth/types"
import { useAuth, useAuthMe } from "@/lib/react-query/hooks/use-auth"
import {
  useCustomers,
  useLookupCustomerByNik,
} from "@/lib/react-query/hooks/use-customers"
import { useItemTypes } from "@/lib/react-query/hooks/use-item-types"
import { useCatalogs } from "@/lib/react-query/hooks/use-catalogs"
import { useCreateSpk, useConfirmSpk } from "@/lib/react-query/hooks/use-spk"
import { usePublicUrl } from "@/lib/react-query/hooks/use-upload"
import { ApiClientError } from "@/lib/api/client"

// Enum mapping for dropdown values
const kondisiBarangOptions = [
  { value: "excellent", label: "Excellent (Sangat Bagus)" },
  { value: "good", label: "Good (Bagus)" },
  { value: "fair", label: "Fair (Cukup/Sedang)" },
  { value: "poor", label: "Poor (Buruk/Minus)" },
]

const statusBarangOptions = [{ value: "in_storage", label: "Di Penyimpanan" }]

const spkSchema = z
  .object({
    fotoCustomer: z.union([z.instanceof(File), z.string()]).optional(),
    nik: z
      .string()
      .min(1, "NIK harus diisi")
      .regex(/^\d{16}$/, "NIK harus berupa 16 digit angka"),
    namaCustomer: z.string().optional(),
    tanggalLahir: z.string().optional(),
    tipeBarang: z.string().min(1, "Tipe Barang harus dipilih"),
    pilihBarang: z.string().min(1, "Katalog Barang harus dipilih"),
    kondisiBarang: z.string().min(1, "Kondisi Barang harus dipilih"),
    imei: z.string().optional().or(z.literal("")),
    kelengkapanBarang: z.string().optional().or(z.literal("")),
    statusBarang: z.string().min(1, "Status Barang harus dipilih"),
    hargaAcuan: z.string().optional(),
    jumlahSPK: z.string().min(1, "Jumlah SPK harus diisi"),
    fotoBarang: z.array(z.instanceof(File)).min(0).optional(),
    pin: z
      .string()
      .length(6, "PIN harus 6 digit")
      .regex(/^\d{6}$/, "PIN harus berupa 6 digit angka"),
  })
  .refine(
    (data) => {
      const hargaAcuan = parseCurrencyInput(data.hargaAcuan || "0")
      const jumlahSPK = parseCurrencyInput(data.jumlahSPK)
      if (hargaAcuan && jumlahSPK && hargaAcuan > 0) {
        return jumlahSPK <= hargaAcuan
      }
      return true
    },
    {
      message: "Jumlah SPK tidak bisa melebihi Harga Acuan",
      path: ["jumlahSPK"],
    }
  )

type SPKFormValues = z.infer<typeof spkSchema>

export default function TambahSPKPage() {
  const router = useRouter()
  const [customerPhotoRef, setCustomerPhotoRef] = useState<string | null>(null)
  const [previewFotoBarang, setPreviewFotoBarang] = useState<
    Array<{ file: File; preview: string }>
  >([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pinSetViaPopup, setPinSetViaPopup] = useState(false)
  const [customerFacingMode, setCustomerFacingMode] = useState(false)

  const { user } = useAuth()
  const isBranchStaff =
    user?.roles?.some((r) => r.code === "branch_staff") ?? false
  const { data: meData } = useAuthMe({
    enabled: isBranchStaff && !user?.branchId,
  })
  const effectiveCompanyId = user?.companyId ?? user?.ownedCompanyId
  const meUser = (meData?.data as ApiResponse<AuthUser> | undefined)?.data
  const effectiveBranchId = user?.branchId ?? meUser?.branchId ?? null

  const form = useForm<SPKFormValues>({
    resolver: zodResolver(spkSchema),
    defaultValues: {
      fotoCustomer: undefined,
      nik: "",
      namaCustomer: "",
      tanggalLahir: "",
      tipeBarang: "",
      pilihBarang: "",
      kondisiBarang: "",
      imei: "",
      kelengkapanBarang: "",
      statusBarang: "in_storage",
      hargaAcuan: "",
      jumlahSPK: "",
      fotoBarang: [],
      pin: "",
    },
  })

  // Watch values for integration logic
  const watchedNik = form.watch("nik")
  const watchedTipeBarang = form.watch("tipeBarang")
  const watchedKatalog = form.watch("pilihBarang")
  const hargaAcuan = form.watch("hargaAcuan") || "0"
  const jumlahSPK = form.watch("jumlahSPK")
  const pin = form.watch("pin") || ""
  const isPinValid = pin.length === 6

  // --- API Hooks ---

  // 1a. Customers List for Dropdown
  const { data: customersData } = useCustomers({ pageSize: 100 })
  const customerList = customersData?.data ?? []

  // 1b. Customer Lookup by NIK
  const { data: customerData, isFetching: isLoadingCustomer } =
    useLookupCustomerByNik(watchedNik?.length === 16 ? watchedNik : "")
  const customerItem = customerData

  // Automatically fill customer details when found
  useEffect(() => {
    if (customerItem) {
      const currentName = form.getValues("namaCustomer")
      const newName = customerItem.name || ""
      if (currentName !== newName) {
        form.setValue("namaCustomer", newName)
      }

      const currentDob = form.getValues("tanggalLahir")
      const newDob = customerItem.dob || ""
      if (currentDob !== newDob) {
        form.setValue("tanggalLahir", newDob)
      }

      setCustomerPhotoRef(
        customerItem.selfiePhotoUrl || customerItem.ktpPhotoUrl || null
      )
    } else if (watchedNik?.length === 16 && !isLoadingCustomer) {
      if (form.getValues("namaCustomer") !== "") {
        form.setValue("namaCustomer", "")
        form.setValue("tanggalLahir", "")
      }
      setCustomerPhotoRef(null)
    }
  }, [customerItem, watchedNik, isLoadingCustomer, form])

  // 2. Fetch Tipe Barang
  const { data: itemTypesData } = useItemTypes({ pageSize: 100 })
  const tipeBarangOptions = itemTypesData?.data ?? []

  // 3. Fetch Catalogs (Filtered by Tipe Barang)
  const { data: catalogsData } = useCatalogs({
    pageSize: 100,
    filter: watchedTipeBarang ? { itemTypeId: watchedTipeBarang } : undefined,
  })
  const catalogOptions = catalogsData?.data ?? []

  const isCustomerPhotoAbsoluteUrl =
    typeof customerPhotoRef === "string" &&
    /^https?:\/\//i.test(customerPhotoRef)
  const { data: customerPhotoPublicUrlData } = usePublicUrl(
    customerPhotoRef && !isCustomerPhotoAbsoluteUrl ? customerPhotoRef : ""
  )
  const previewFotoCustomer = isCustomerPhotoAbsoluteUrl
    ? customerPhotoRef
    : (customerPhotoPublicUrlData?.url ?? null)

  // Update Harga Acuan when Catalog is selected
  useEffect(() => {
    if (watchedKatalog && catalogsData?.data && catalogsData.data.length > 0) {
      const selectedCatalog = catalogsData.data.find(
        (c) => c.uuid === watchedKatalog
      )
      if (selectedCatalog?.basePrice) {
        const newValue = formatCurrencyInput(selectedCatalog.basePrice)
        if (form.getValues("hargaAcuan") !== newValue) {
          form.setValue("hargaAcuan", newValue)
          form.trigger("jumlahSPK") // re-trigger validation
        }
      }
    } else {
      if (form.getValues("hargaAcuan") !== "") {
        form.setValue("hargaAcuan", "")
      }
    }
  }, [watchedKatalog, catalogsData?.data, form])

  // 4. Listen to BroadcastChannel for PIN from input-pin popup
  useEffect(() => {
    const channel = new BroadcastChannel("customer-pin-channel")
    channel.onmessage = (event) => {
      if (event.data?.type === "PIN_SET" && event.data?.pin) {
        form.setValue("pin", event.data.pin)
        form.trigger("pin")
        setPinSetViaPopup(true)
      }
    }
    return () => channel.close()
  }, [form])

  const createSpkMutation = useCreateSpk()
  const confirmSpkMutation = useConfirmSpk()

  // --- Handlers ---
  const handleCustomerMasukkanPin = () => {
    setPinSetViaPopup(false)
    window.open(
      "/input-pin",
      "InputPIN",
      "width=500,height=700,left=200,top=200"
    )
  }

  const handleInputMaksimumJumlahSPK = () => {
    const maksimum = form.getValues("hargaAcuan") || ""
    const maksimumNumber = parseCurrencyInput(maksimum)
    if (!maksimum || !maksimumNumber || maksimumNumber <= 0) return

    form.setValue("jumlahSPK", maksimum, {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.trigger("jumlahSPK")
  }

  const handleMultipleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: { onChange: (value: File[]) => void }
  ) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const currentFiles = form.getValues("fotoBarang") || []
      const newFiles = [...currentFiles, ...files]
      field.onChange(newFiles)

      const previewPromises = files.map((file) => {
        return new Promise<{ file: File; preview: string }>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve({ file, preview: reader.result as string })
          }
          reader.readAsDataURL(file)
        })
      })

      Promise.all(previewPromises).then((newPreviews) => {
        setPreviewFotoBarang((prev) => [...prev, ...newPreviews])
      })
    }
    e.target.value = ""
  }

  const handleRemoveImage = (
    index: number,
    field: { onChange: (value: File[]) => void }
  ) => {
    const currentFiles = form.getValues("fotoBarang") || []
    const newFiles = currentFiles.filter((_, i) => i !== index)
    field.onChange(newFiles)
    setPreviewFotoBarang((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCurrencyChange = (
    value: string,
    field: { onChange: (value: string) => void },
    fieldName: "hargaAcuan" | "jumlahSPK"
  ) => {
    const parsed = parseCurrencyInput(value)
    field.onChange(parsed !== null ? formatCurrencyInput(parsed) : "")
    if (fieldName === "jumlahSPK") {
      form.trigger("jumlahSPK")
    }
  }

  const handleSimpanClick = () => {
    form.handleSubmit((values) => {
      // Additional validation: PT and Store (branch) must exist in session
      const ptId = effectiveCompanyId || user?.companyId
      if (!ptId) {
        toast.error("Data PT tidak ditemukan di sesi Anda")
        return
      }

      if (!effectiveBranchId) {
        toast.error(
          "Data cabang toko tidak ditemukan di sesi Anda. Hubungi admin untuk mengatur cabang."
        )
        return
      }
      if (!customerItem?.uuid) {
        toast.error(
          "Customer tidak ditemukan. Pastikan NIK terdaftar dan dipilih dengan benar."
        )
        return
      }
      if (values) {
        setConfirmOpen(true)
      }
    })()
  }

  const handleConfirmSubmit = async () => {
    const values = form.getValues()

    try {
      if (!customerItem?.uuid) throw new Error("Customer UUID missing")
      const ptId = effectiveCompanyId || user?.companyId
      if (!ptId) throw new Error("Company ID missing")

      const storeIdToUse = effectiveBranchId
      if (!storeIdToUse) throw new Error("Store ID missing")

      const principalAmount = parseCurrencyInput(values.jumlahSPK) || 0
      const appraisedValue = parseCurrencyInput(values.hargaAcuan || "0") || 0

      // Map to CreateSpkDto
      const createdSpk = await createSpkMutation.mutateAsync({
        customerId: customerItem.uuid,
        storeId: storeIdToUse,
        ptId: ptId,
        principalAmount,
        tenor: 30, // Default tenor, adjust if needed
        items: [
          {
            catalogId: values.pilihBarang,
            itemTypeId: values.tipeBarang,
            description: values.kelengkapanBarang || "Barang Gadai",
            serialNumber: values.imei || undefined,
            appraisedValue,
            condition: values.kondisiBarang as
              | "excellent"
              | "good"
              | "fair"
              | "poor",
          },
        ],
      })

      // Confirm SPK with customer PIN to activate it (Draft -> Active)
      await confirmSpkMutation.mutateAsync({
        id: createdSpk.uuid,
        data: { pin: values.pin },
      })

      toast.success("Data SPK berhasil ditambahkan")
      setConfirmOpen(false)
      router.push("/spk")
    } catch (error: unknown) {
      let message = "Gagal menambahkan data SPK"

      if (error instanceof ApiClientError) {
        message = error.errorMessage || message
      } else if (error instanceof Error && error.message) {
        message = error.message
      }

      if (message.includes("Store not found")) {
        message =
          "Cabang toko tidak ditemukan. Silakan pilih cabang lain atau hubungi admin."
      }
      if (message.includes("Invalid PIN") || message.includes("PIN")) {
        message =
          "PIN tidak valid. Pastikan customer memasukkan PIN yang benar (6 digit)."
      }

      toast.error(message)
    }
  }

  const hargaAcuanNum = parseCurrencyInput(hargaAcuan)
  const jumlahSPKNum = parseCurrencyInput(jumlahSPK)
  const isJumlahSPKExceeded =
    hargaAcuanNum !== null &&
    jumlahSPKNum !== null &&
    hargaAcuanNum > 0 &&
    jumlahSPKNum > hargaAcuanNum

  const isSubmitting =
    createSpkMutation.isPending || confirmSpkMutation.isPending

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tambah Data</h1>
          <Button
            type="button"
            variant={customerFacingMode ? "default" : "outline"}
            onClick={() => setCustomerFacingMode(!customerFacingMode)}
            className="gap-2"
          >
            {customerFacingMode ? (
              <>
                <EyeOff className="size-4" />
                Mode Staff
              </>
            ) : (
              <>
                <Monitor className="size-4" />
                Mode Layar Pelanggan
              </>
            )}
          </Button>
        </div>
        <Breadcrumbs
          items={[
            { label: "SPK", href: "/spk" },
            { label: "Tambah Data", className: "text-destructive" },
          ]}
        />
      </div>

      {/* Customer-facing PIN input overlay */}
      {customerFacingMode && (
        <div className="bg-primary/95 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Masukkan PIN Anda</CardTitle>
              <p className="text-muted-foreground">
                Silakan masukkan 6 digit PIN untuk melanjutkan proses SPK
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex justify-center gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Input
                            key={i}
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            className="size-14 text-center text-2xl"
                            value={field.value[i] || ""}
                            onChange={(e) => {
                              const val = e.target.value
                              if (val && !/^\d$/.test(val)) return
                              const currentPin = field.value || ""
                              if (val) {
                                const newPin =
                                  currentPin.slice(0, i) +
                                  val +
                                  currentPin.slice(i + 1)
                                field.onChange(newPin)
                                if (i < 5 && newPin.length === i + 1) {
                                  // Auto-focus next input
                                  const inputs = document.querySelectorAll(
                                    'input[type="password"]'
                                  )
                                  ;(inputs[i + 1] as HTMLInputElement)?.focus()
                                }
                              } else if (val === "") {
                                field.onChange(currentPin.slice(0, i))
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace" && !field.value[i]) {
                                const inputs = document.querySelectorAll(
                                  'input[type="password"]'
                                )
                                ;(inputs[i - 1] as HTMLInputElement)?.focus()
                              }
                            }}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCustomerFacingMode(false)}
                  className="flex-1"
                >
                  Kembali
                </Button>
                <Button
                  type="button"
                  disabled={!isPinValid}
                  onClick={() => {
                    if (isPinValid) {
                      setCustomerFacingMode(false)
                    }
                  }}
                  className="flex-1"
                >
                  Konfirmasi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!customerFacingMode && (
        <Card>
          <CardHeader>
            <CardTitle>Data Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
                {/* Image upload column (left) */}
                <div className="flex justify-center">
                  <FormField
                    control={form.control}
                    name="fotoCustomer"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            {previewFotoCustomer ? (
                              <div className="border-input bg-muted/50 relative aspect-square w-40 overflow-hidden rounded-full border-2 border-dashed">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={previewFotoCustomer}
                                  alt="Preview Customer"
                                  className="size-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="border-input bg-muted/50 flex aspect-square w-40 flex-col items-center justify-center gap-3 rounded-full border-2 border-dashed">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="bg-primary/10 rounded-full p-3">
                                    <User className="text-primary size-6" />
                                  </div>
                                  <p className="px-4 text-center text-sm font-medium">
                                    Foto Customer
                                  </p>
                                </div>
                              </div>
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
                      <FileText className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Detail Customer
                      </h2>
                    </div>
                    <div className="grid items-start gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="nik"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              NIK <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={(value) => {
                                field.onChange(value)
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih NIK" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customerList.map((opt) => (
                                  <SelectItem key={opt.nik} value={opt.nik}>
                                    {opt.nik} - {opt.name || ""}
                                  </SelectItem>
                                ))}
                                {customerList.length === 0 && (
                                  <SelectItem value="none" disabled>
                                    Tidak ada data customer
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            {isLoadingCustomer && watchedNik.length === 16 && (
                              <p className="text-muted-foreground text-xs">
                                Mencari data...
                              </p>
                            )}
                            {!isLoadingCustomer &&
                              watchedNik.length === 16 &&
                              !customerItem && (
                                <p className="text-destructive text-xs">
                                  Customer tidak ditemukan
                                </p>
                              )}
                            {!isLoadingCustomer &&
                              watchedNik.length === 16 &&
                              customerItem && (
                                <p className="text-xs text-green-600">
                                  Customer Valid
                                </p>
                              )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                                placeholder=""
                                icon={<User className="size-4" />}
                                disabled
                                className="bg-muted"
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
                                placeholder=""
                                icon={<Calendar className="size-4" />}
                                disabled
                                className="bg-muted"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Detail Barang section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FileText className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Detail Barang
                      </h2>
                    </div>
                    <div className="grid items-start gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="tipeBarang"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Tipe Barang{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={(val) => {
                                field.onChange(val)
                                form.setValue("pilihBarang", "") // Reset catalog when type changes
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih Tipe Barang" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {tipeBarangOptions.map((opt) => (
                                  <SelectItem key={opt.uuid} value={opt.uuid}>
                                    {opt.typeName}
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
                        name="pilihBarang"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Pilih Barang (Katalog){" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              disabled={!watchedTipeBarang}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue
                                    placeholder={
                                      !watchedTipeBarang
                                        ? "Pilih Tipe Terlebih Dahulu"
                                        : "Pilih Katalog Barang"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {catalogOptions.map((opt) => (
                                  <SelectItem key={opt.uuid} value={opt.uuid}>
                                    {opt.name || opt.itemName || opt.code}
                                  </SelectItem>
                                ))}
                                {catalogOptions.length === 0 && (
                                  <SelectItem value="none" disabled>
                                    Tidak ada item di katalog
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="kondisiBarang"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Kondisi Barang{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih Kondisi Barang" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {kondisiBarangOptions.map((opt) => (
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
                        name="imei"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              IMEI / Serial Number (Opsional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Contoh: 1234567890"
                                icon={<CreditCard className="size-4" />}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="kelengkapanBarang"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>
                              Kelengkapan Barang / Deskripsi Tambahan
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Contoh: Fullset nota ori, minus lecet pemakaian"
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
                        name="statusBarang"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Status Barang{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              value={field.value || ""}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih Status Barang" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusBarangOptions.map((opt) => (
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
                        name="hargaAcuan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Harga Acuan Dari Katalog</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                disabled
                                className="bg-muted"
                                placeholder="Pilih item dari katalog..."
                                value={field.value}
                                onChange={(e) =>
                                  handleCurrencyChange(
                                    e.target.value,
                                    field,
                                    "hargaAcuan"
                                  )
                                }
                                icon={<>Rp</>}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="jumlahSPK"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Jumlah SPK{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <div className="relative">
                                  <Input
                                    type="text"
                                    placeholder="Contoh: 200.000"
                                    value={field.value}
                                    onChange={(e) =>
                                      handleCurrencyChange(
                                        e.target.value,
                                        field,
                                        "jumlahSPK"
                                      )
                                    }
                                    icon={<>Rp</>}
                                    className="pr-28"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleInputMaksimumJumlahSPK}
                                    disabled={
                                      !hargaAcuanNum ||
                                      Number.isNaN(hargaAcuanNum) ||
                                      hargaAcuanNum <= 0
                                    }
                                    className="text-primary absolute top-1/2 right-3 -translate-y-1/2 text-xs underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Input Maksimum
                                  </button>
                                </div>
                                {isJumlahSPKExceeded && (
                                  <p className="text-destructive text-sm">
                                    Jumlah SPK Tidak bisa melebihi Harga Acuan
                                  </p>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Upload Foto Barang section */}
                  <div className="space-y-4">
                    <FormLabel>Upload Foto Barang (Opsional)</FormLabel>
                    <FormField
                      control={form.control}
                      name="fotoBarang"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="border-input bg-background rounded-lg border-2 border-dashed p-4">
                              <div className="flex flex-wrap gap-4">
                                {/* Display uploaded images */}
                                {previewFotoBarang.map((item, index) => (
                                  <div
                                    key={index}
                                    className="border-input relative aspect-square w-32 overflow-hidden rounded-lg border"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={item.preview}
                                      alt={`Preview ${index + 1}`}
                                      className="size-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveImage(index, field)
                                      }
                                      className="bg-background hover:bg-muted absolute top-1/2 left-1/2 z-10 flex size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-md transition-colors"
                                      aria-label="Hapus gambar"
                                    >
                                      <Trash2 className="text-destructive size-4" />
                                    </button>
                                  </div>
                                ))}

                                {/* Add more images slot */}
                                <label
                                  htmlFor="foto-barang-upload"
                                  className="border-input bg-background hover:bg-muted/50 flex aspect-square w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors"
                                >
                                  <div className="relative flex flex-col items-center gap-1">
                                    <div className="relative">
                                      <ImageIcon className="text-muted-foreground size-8" />
                                      <div className="bg-destructive absolute right-0 bottom-0 flex size-4 items-center justify-center rounded-sm">
                                        <Plus className="size-2.5 text-white" />
                                      </div>
                                    </div>
                                  </div>
                                  <input
                                    id="foto-barang-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) =>
                                      handleMultipleImageChange(e, field)
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Keamanan section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Lock className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        {form.watch("pin")
                          ? "Keamanan (PIN sudah Diinput)"
                          : "Keamanan"}
                      </h2>
                    </div>
                    <div className="w-full gap-6">
                      <FormField
                        control={form.control}
                        name="pin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              PIN <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="flex w-full gap-2">
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  icon={<Lock className="size-4" />}
                                  className="flex-1"
                                  readOnly={isBranchStaff || pinSetViaPopup}
                                  disabled={isBranchStaff}
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={handleCustomerMasukkanPin}
                                >
                                  <Lock className="mr-2 size-4" />
                                  {isPinValid
                                    ? "Masukkan Ulang PIN"
                                    : "Customer Masukkan PIN"}
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
                      onClick={() => router.push("/spk")}
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
                        <>
                          <FileText className="mr-2 size-4" />
                          Simpan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Save confirmation dialog */}
      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmSubmit}
        title="Apakah Anda Yakin?"
        description="Anda akan menyimpan data SPK ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </div>
  )
}
