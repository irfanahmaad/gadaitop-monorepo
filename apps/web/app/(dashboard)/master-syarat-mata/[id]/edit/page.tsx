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
import {
  usePawnTerm,
  useUpdatePawnTerm,
} from "@/lib/react-query/hooks/use-pawn-terms"
import { useItemTypes } from "@/lib/react-query/hooks/use-item-types"

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

// Kondisi Barang options
const kondisiBarangOptions = [
  { value: "Ada & Kondisi Sesuai", label: "Ada & Kondisi Sesuai" },
  { value: "Ada Namun Mismatch", label: "Ada Namun Mismatch" },
]

// Loading skeleton for form
function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8">
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
  const { data: pawnTermData, isLoading } = usePawnTerm(id)
  const { mutateAsync: updatePawnTerm, isPending: isSubmitting } =
    useUpdatePawnTerm()
  const { data: itemTypesData } = useItemTypes({ pageSize: 100 })
  const tipeBarangOptions = React.useMemo(() => {
    const list = itemTypesData?.data ?? []
    return list.map((itemType) => ({
      value: itemType.uuid,
      label: itemType.typeName,
    }))
  }, [itemTypesData])
  const [confirmOpen, setConfirmOpen] = useState(false)

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
    if (!id) return
    if (!pawnTermData) return

    form.reset({
      namaAturan: `${pawnTermData.itemType?.typeName ?? "-"} (Tenor ${pawnTermData.tenorDefault})`,
      tipeBarang: pawnTermData.itemTypeId,
      hargaDari: formatCurrencyInput(Number(pawnTermData.loanLimitMin ?? 0)),
      hargaSampai: formatCurrencyInput(Number(pawnTermData.loanLimitMax ?? 0)),
      macetDari: String(pawnTermData.tenorDefault ?? 0),
      macetSampai: String(pawnTermData.tenorDefault ?? 0),
      baru: String(pawnTermData.adminFee ?? 0),
      persentase: String(pawnTermData.interestRate ?? 0),
      kondisiBarang: "Ada & Kondisi Sesuai",
    })
  }, [form, id, pawnTermData])

  useEffect(() => {
    if (!isLoading && id && !pawnTermData) {
      toast.error("Data Syarat Mata tidak ditemukan")
      router.push("/master-syarat-mata")
    }
  }, [id, isLoading, pawnTermData, router])

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
      const loanLimitMin = parseCurrencyInput(values.hargaDari) ?? 0
      const loanLimitMax = parseCurrencyInput(values.hargaSampai) ?? 0
      const tenorDefault = Number(values.macetSampai)
      const interestRate = Number(values.persentase)
      const adminFee = Number(values.baru)

      if (loanLimitMin <= 0 || loanLimitMax <= 0) {
        throw new Error("Harga Dari dan Harga Sampai harus lebih dari 0")
      }
      if (loanLimitMax < loanLimitMin) {
        throw new Error("Harga Sampai tidak boleh lebih kecil dari Harga Dari")
      }
      if (Number.isNaN(tenorDefault) || tenorDefault <= 0) {
        throw new Error("Macet Sampai harus berupa angka lebih dari 0")
      }
      if (Number.isNaN(interestRate)) {
        throw new Error("Persentase harus berupa angka")
      }

      await updatePawnTerm({
        id,
        data: {
          loanLimitMin,
          loanLimitMax,
          tenorDefault,
          interestRate,
          adminFee: Number.isNaN(adminFee) ? undefined : adminFee,
        },
      })
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
      // noop
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
                    <div className="space-y-2 md:col-span-2">
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
                    <div className="space-y-2 md:col-span-2">
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
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
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
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
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
