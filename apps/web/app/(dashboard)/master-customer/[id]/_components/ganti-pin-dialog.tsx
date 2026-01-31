"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Lock, X, Save } from "lucide-react"
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

const gantiPinSchema = z
  .object({
    pinBaru: z
      .string()
      .min(8, "PIN minimal 8 karakter"),
    ulangiPin: z
      .string()
      .min(8, "PIN minimal 8 karakter"),
  })
  .refine((data) => data.pinBaru === data.ulangiPin, {
    message: "PIN tidak sama",
    path: ["ulangiPin"],
  })

type GantiPinFormValues = z.infer<typeof gantiPinSchema>

const PIN_PLACEHOLDER = "Minimal 8 Karakter"

type GantiPinDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (pinBaru: string) => void | Promise<void>
  isSubmitting?: boolean
}

export function GantiPinDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: GantiPinDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingPin, setPendingPin] = useState<string | null>(null)

  const form = useForm<GantiPinFormValues>({
    resolver: zodResolver(gantiPinSchema),
    defaultValues: {
      pinBaru: "",
      ulangiPin: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        pinBaru: "",
        ulangiPin: "",
      })
    }
  }, [open, form])

  const onSubmit = (values: GantiPinFormValues) => {
    setPendingPin(values.pinBaru)
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (pendingPin === null) return
    await onConfirm(pendingPin)
    setPendingPin(null)
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="border-b pb-4 text-xl font-bold">
              Ganti PIN
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="pinBaru"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Masukkan PIN Baru</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={PIN_PLACEHOLDER}
                        icon={<Lock className="size-4 text-muted-foreground" />}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ulangiPin"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Ulangi PIN</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={PIN_PLACEHOLDER}
                        icon={<Lock className="size-4 text-muted-foreground" />}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex-row gap-2 sm:justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2"
                >
                  <X className="size-4" />
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 text-white hover:bg-red-700 gap-2"
                  disabled={isSubmitting}
                >
                  <Save className="size-4" />
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
        description="Anda akan menyimpan PIN baru ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </>
  )
}
