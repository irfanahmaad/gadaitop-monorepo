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
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import type { Nkb } from "@/lib/api/types"

const tolakSchema = z.object({
  alasan: z.string().optional(),
})

type TolakFormValues = z.infer<typeof tolakSchema>

const DEFAULT_ALASAN = ""

type TolakNkbDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  nkb: Nkb | null
  onConfirm: (nkb: Nkb, data: { reason: string }) => void | Promise<void>
  isSubmitting?: boolean
}

export function TolakNkbDialog({
  open,
  onOpenChange,
  nkb,
  onConfirm,
  isSubmitting = false,
}: TolakNkbDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<{
    nkb: Nkb
    data: { reason: string }
  } | null>(null)

  const form = useForm<TolakFormValues>({
    resolver: zodResolver(tolakSchema),
    defaultValues: {
      alasan: DEFAULT_ALASAN,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        alasan: DEFAULT_ALASAN,
      })
    }
  }, [open, form])

  const onSubmit = (values: TolakFormValues) => {
    if (!nkb) return
    setPendingSubmit({
      nkb,
      data: { reason: values.alasan?.trim() || "Ditolak" },
    })
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!pendingSubmit) return
    await onConfirm(pendingSubmit.nkb, pendingSubmit.data)
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
              Tolak NKB
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="alasan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alasan penolakan (opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tulis alasan penolakan..."
                        className="min-h-24 resize-none"
                        {...field}
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
                  variant="destructive"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Tolak
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
        description="Anda akan menolak NKB ini."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </>
  )
}
