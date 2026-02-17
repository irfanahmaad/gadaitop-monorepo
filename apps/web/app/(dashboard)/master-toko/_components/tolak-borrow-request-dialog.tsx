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

const tolakSchema = z.object({
  rejectionReason: z.string().min(1, "Alasan penolakan wajib diisi"),
})

type TolakFormValues = z.infer<typeof tolakSchema>

type RequestRow = {
  id: string
}

type TolakBorrowRequestDialogProps<T extends RequestRow> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: T | null
  onConfirm: (row: T, data: { rejectionReason: string }) => void | Promise<void>
  isSubmitting?: boolean
}

export function TolakBorrowRequestDialog<T extends RequestRow>({
  open,
  onOpenChange,
  row,
  onConfirm,
  isSubmitting = false,
}: TolakBorrowRequestDialogProps<T>) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<{
    row: T
    data: { rejectionReason: string }
  } | null>(null)

  const form = useForm<TolakFormValues>({
    resolver: zodResolver(tolakSchema),
    defaultValues: {
      rejectionReason: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        rejectionReason: "",
      })
    }
  }, [open, form])

  const onSubmit = (values: TolakFormValues) => {
    if (!row) return
    setPendingSubmit({
      row,
      data: { rejectionReason: values.rejectionReason },
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
              Tolak Request Pinjam PT
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="rejectionReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Alasan Penolakan <span className="text-destructive">*</span>
                    </FormLabel>
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
        description="Anda akan menolak request Pinjam PT ini."
        note="Pastikan kembali sebelum menolak."
        confirmLabel="Ya, Tolak"
        cancelLabel="Batal"
        variant="info"
      />
    </>
  )
}
