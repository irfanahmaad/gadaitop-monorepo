"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useParams } from "next/navigation"
import { Briefcase, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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

const syaratMataSchema = z.object({
  namaAturan: z
    .string()
    .min(1, "Nama Aturan harus diisi")
    .max(255, "Nama Aturan maksimal 255 karakter"),
  tipeBarang: z.string().min(1, "Tipe Barang harus dipilih"),
  hargaDari: z.string().min(1, "Harga Dari harus diisi"),
  hargaSampai: z.string().min(1, "Harga Sampai harus diisi"),
  macetDari: z.string().min(1, "Macet Dari harus diisi"),
  macetSampai: z.string().min(1, "Macet Sampai harus diisi"),
  baru: z.string().min(1, "Baru harus diisi"),
  persentase: z.string().min(1, "Persentase harus diisi"),
  kondisiBarang: z.string().min(1, "Kondisi Barang harus dipilih"),
})

type SyaratMataFormValues = z.infer<typeof syaratMataSchema>

// Syarat Mata detail type
type SyaratMataDetail = {
  id: string
  namaAturan: string
  tipeBarang: string
  hargaDari: number
  hargaSampai: number
  macetDari: number
  macetSampai: number
  baru: number
  persentase: number
  kondisiBarang: string
}

// Tipe Barang options
const tipeBarangOptions = [
  { value: "Handphone", label: "Handphone" },
  { value: "Sepeda Motor", label: "Sepeda Motor" },
  { value: "Aksesoris Komputer", label: "Aksesoris Komputer" },
  { value: "Laptop", label: "Laptop" },
  { value: "Drone", label: "Drone" },
  { value: "Elektronik", label: "Elektronik" },
]

// Kondisi Barang options
const kondisiBarangOptions = [
  { value: "Ada & Kondisi Sesuai", label: "Ada & Kondisi Sesuai" },
  { value: "Ada Namun Mismatch", label: "Ada Namun Mismatch" },
]

// Mock: fetch syarat mata by id (replace with API later)
function getSyaratMataById(id: string): SyaratMataDetail | null {
  const mock: SyaratMataDetail = {
    id: "1",
    namaAturan: "Barang Mahal",
    tipeBarang: "Handphone",
    hargaDari: 10000000,
    hargaSampai: 30000000,
    macetDari: 1,
    macetSampai: 3,
    baru: 10,
    persentase: 10,
    kondisiBarang: "Ada & Kondisi Sesuai",
  }
  if (id === "1") return mock
  return mock
}

// Loading skeleton for form
function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
          <div className="flex justify-center"></div>
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 7 }).map((_, i) => (
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

export default function EditMasterSyaratMataPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SyaratMataFormValues>({
    resolver: zodResolver(syaratMataSchema),
    defaultValues: {
      namaAturan: "",
      tipeBarang: "",
      hargaDari: "",
      hargaSampai: "",
      macetDari: "",
      macetSampai: "",
      baru: "",
      persentase: "",
      kondisiBarang: "",
    },
  })

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with API call
        const data = getSyaratMataById(id)
        if (!data) {
          toast.error("Data Syarat Mata tidak ditemukan")
          router.push("/master-syarat-mata")
          return
        }

        // Populate form with existing data
        form.reset({
          namaAturan: data.namaAturan,
          tipeBarang: data.tipeBarang,
          hargaDari: formatCurrencyInput(data.hargaDari),
          hargaSampai: formatCurrencyInput(data.hargaSampai),
          macetDari: String(data.macetDari),
          macetSampai: String(data.macetSampai),
          baru: String(data.baru),
          persentase: String(data.persentase),
          kondisiBarang: data.kondisiBarang,
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal memuat data Syarat Mata"
        toast.error(message)
        router.push("/master-syarat-mata")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id, form, router])

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
      // TODO: Replace with API call to update syarat mata
      const submitData = {
        id,
        namaAturan: values.namaAturan,
        tipeBarang: values.tipeBarang,
        hargaDari: parseCurrencyInput(values.hargaDari) ?? 0,
        hargaSampai: parseCurrencyInput(values.hargaSampai) ?? 0,
        macetDari: Number(values.macetDari),
        macetSampai: Number(values.macetSampai),
        baru: Number(values.baru),
        persentase: Number(values.persentase),
        kondisiBarang: values.kondisiBarang,
      }
      console.log("Update Syarat Mata:", submitData)
      toast.success("Data Syarat Mata berhasil diperbarui")
      setConfirmOpen(false)
      router.push("/master-syarat-mata")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal memperbarui data Syarat Mata"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {/* Header section */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <FormSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Edit Data</h1>
        <Breadcrumbs
          items={[
            { label: 'Master Syarat "Mata"', href: "/master-syarat-mata" },
            { label: "Edit Data", className: "text-destructive" },
          ]}
        />
      </div>

      {/* Data Syarat Mata card */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Syarat &quot;Mata&quot;</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              {/* Empty left column (no image upload) */}
              <div className="flex justify-center"></div>

              {/* Form fields column (right) */}
              <div className="space-y-8">
                {/* Detail Syarat Mata section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Detail Syarat &quot;Mata&quot;
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="namaAturan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nama Aturan{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Contoh: Barang Mahal"
                              icon={<Briefcase className="size-4" />}
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
                            value={field.value}
                            onValueChange={field.onChange}
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
                    {/* Harga - spans both columns */}
                    <div className="md:col-span-2 space-y-2">
                      <FormLabel>Harga</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="hargaDari"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Contoh: 10.000.000"
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
                                  icon={<>Rp</>}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <span className="text-muted-foreground">-</span>
                        <FormField
                          control={form.control}
                          name="hargaSampai"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Contoh: 10.000.000"
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
                                  icon={<>Rp</>}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    {/* Macet - spans both columns */}
                    <div className="md:col-span-2 space-y-2">
                      <FormLabel>Macet</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name="macetDari"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Contoh: 1"
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <span className="text-muted-foreground">Bulan</span>
                        <span className="text-muted-foreground">-</span>
                        <FormField
                          control={form.control}
                          name="macetSampai"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Contoh: 1"
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <span className="text-muted-foreground">Bulan</span>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="baru"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Baru</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Contoh: 10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="persentase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Persentase</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Contoh: 10"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="flex-1"
                              />
                              <span className="text-muted-foreground">%</span>
                              <span className="text-muted-foreground">
                                Hari Terakhir
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kondisiBarang"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Kondisi Barang</FormLabel>
                          <Select
                            value={field.value}
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
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/master-syarat-mata")}
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
        description='Anda akan memperbarui data Syarat "Mata" ke dalam sistem.'
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </div>
  )
}
