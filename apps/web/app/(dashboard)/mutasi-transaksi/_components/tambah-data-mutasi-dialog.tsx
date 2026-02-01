"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, Save, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format-currency"

const tambahDataMutasiSchema = z.object({
  nominal: z.string().min(1, "Nominal wajib diisi"),
  tipe: z.enum(["SPK1", "SPK2", "Operasional", "Tambah Modal"], {
    required_error: "Tipe wajib dipilih",
  }),
  keterangan: z.string().optional(),
})

type TambahDataMutasiFormValues = z.infer<typeof tambahDataMutasiSchema>

type TambahDataMutasiDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: {
    nominal: number
    tipe: "SPK1" | "SPK2" | "Operasional" | "Tambah Modal"
    keterangan?: string
  }) => void | Promise<void>
  isSubmitting?: boolean
}

type PendingSubmit = {
  data: {
    nominal: number
    tipe: "SPK1" | "SPK2" | "Operasional" | "Tambah Modal"
    keterangan?: string
  }
}

export function TambahDataMutasiDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: TambahDataMutasiDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<PendingSubmit | null>(null)

  const form = useForm<TambahDataMutasiFormValues>({
    resolver: zodResolver(tambahDataMutasiSchema),
    defaultValues: {
      nominal: "",
      tipe: undefined,
      keterangan: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nominal: "",
        tipe: undefined,
        keterangan: "",
      })
    }
  }, [open, form])

  const onSubmit = (values: TambahDataMutasiFormValues) => {
    const parsed = parseCurrencyInput(values.nominal)
    if (parsed === null) {
      form.setError("nominal", { message: "Nominal tidak valid" })
      return
    }
    setPendingSubmit({
      data: {
        nominal: parsed,
        tipe: values.tipe,
        keterangan: values.keterangan || undefined,
      },
    })
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!pendingSubmit) return
    await onConfirm(pendingSubmit.data)
    setPendingSubmit(null)
    setConfirmOpen(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="border-b pb-4 text-2xl font-bold">
              Tambah Data Mutasi
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="space-y-4">
                <h2 className="text-destructive text-lg font-semibold">
                  Tambah Mutasi
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nominal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nominal <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan nominal"
                            icon={<span className="text-sm">Rp</span>}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value
                              const parsed = parseCurrencyInput(value)
                              if (parsed !== null) {
                                field.onChange(formatCurrencyInput(parsed))
                              } else if (value === "") {
                                field.onChange("")
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipe</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Pilih Tipe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Operasional">
                              Operasional
                            </SelectItem>
                            <SelectItem value="SPK1">SPK1</SelectItem>
                            <SelectItem value="SPK2">SPK2</SelectItem>
                            <SelectItem value="Tambah Modal">
                              Tambah Modal
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="keterangan"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Keterangan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contoh: Biaya Operasional (Pembelian Galon)"
                          className="min-h-24 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <X className="size-4" />
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmSubmit}
        title="Apakah Anda Yakin?"
        description="Anda akan menyimpan data Mutasi baru ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </>
  )
}
