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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format-currency"
import type { RequestTambahModal } from "./types"

const editRequestSchema = z.object({
  nominal: z.string().min(1, "Nominal wajib diisi"),
})

type EditRequestFormValues = z.infer<typeof editRequestSchema>

type EditRequestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: RequestTambahModal | null
  onConfirm: (
    row: RequestTambahModal,
    data: { nominal: number }
  ) => void | Promise<void>
  isSubmitting?: boolean
}

type PendingSubmit = {
  row: RequestTambahModal
  data: { nominal: number }
}

export function EditRequestDialog({
  open,
  onOpenChange,
  row,
  onConfirm,
  isSubmitting = false,
}: EditRequestDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<PendingSubmit | null>(null)

  const form = useForm<EditRequestFormValues>({
    resolver: zodResolver(editRequestSchema),
    defaultValues: {
      nominal: "",
    },
  })

  useEffect(() => {
    if (open && row) {
      form.reset({
        nominal: formatCurrencyInput(row.nominal),
      })
    }
  }, [open, row, form])

  const onSubmit = (values: EditRequestFormValues) => {
    if (!row) return
    const parsed = parseCurrencyInput(values.nominal)
    if (parsed === null) {
      form.setError("nominal", { message: "Nominal tidak valid" })
      return
    }
    setPendingSubmit({
      row,
      data: {
        nominal: parsed,
      },
    })
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!pendingSubmit) return
    await onConfirm(pendingSubmit.row, pendingSubmit.data)
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
              Edit Request Tambah Modal
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
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
        description="Anda akan mengubah data Request Tambah Modal."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </>
  )
}
