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

const tambahDataSchema = z.object({
  storeId: z.string().optional(),
  nominal: z.string().min(1, "Nominal wajib diisi"),
})

type TambahDataFormValues = z.infer<typeof tambahDataSchema>

type TambahDataDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: { nominal: number; storeId?: string }) => void | Promise<void>
  isSubmitting?: boolean
  branchOptions?: { value: string; label: string }[]
  selectedBranch?: string
}

type PendingSubmit = {
  data: { nominal: number; storeId?: string }
}

export function TambahDataDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  branchOptions = [],
  selectedBranch = "",
}: TambahDataDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<PendingSubmit | null>(null)

  const form = useForm<TambahDataFormValues>({
    resolver: zodResolver(tambahDataSchema),
    defaultValues: {
      storeId: "",
      nominal: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        storeId: selectedBranch || branchOptions[0]?.value || "",
        nominal: "",
      })
    }
  }, [open, form, selectedBranch, branchOptions])

  const onSubmit = (values: TambahDataFormValues) => {
    const parsed = parseCurrencyInput(values.nominal)
    if (parsed === null) {
      form.setError("nominal", { message: "Nominal tidak valid" })
      return
    }
    setPendingSubmit({
      data: {
        nominal: parsed,
        storeId: values.storeId,
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="border-b pb-4 text-2xl font-bold">
              Request Tambah Modal
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {branchOptions.length > 0 && (
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Toko <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih toko" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branchOptions.map((b) => (
                            <SelectItem key={b.value} value={b.value}>
                              {b.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
                        icon={<>Rp</>}
                        value={field.value}
                        onChange={(e) => {
                          const parsed = parseCurrencyInput(e.target.value)
                          field.onChange(
                            parsed !== null ? formatCurrencyInput(parsed) : ""
                          )
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
        description="Anda akan menyimpan data Tambah Modal baru ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </>
  )
}
