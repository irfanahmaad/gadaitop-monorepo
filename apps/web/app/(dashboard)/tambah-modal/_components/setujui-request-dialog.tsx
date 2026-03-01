"use client"

import React, { useRef, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileIcon, X, Save, Loader2 } from "lucide-react"
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
import type { RequestTambahModal } from "./types"

const setujuiSchema = z.object({
  buktiTransfer: z.any().optional(),
  catatan: z.string().optional(),
})

type SetujuiFormValues = z.infer<typeof setujuiSchema>

const DEFAULT_CATATAN = "Request sudah saya setujui, silakan dicek kembali."

type SetujuiRequestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: RequestTambahModal | null
  onConfirm: (
    row: RequestTambahModal,
    data: { buktiTransfer: File; catatan: string }
  ) => void | Promise<void>
  isSubmitting?: boolean
}

type PendingSubmit = {
  row: RequestTambahModal
  data: { buktiTransfer: File; catatan: string }
}

export function SetujuiRequestDialog({
  open,
  onOpenChange,
  row,
  onConfirm,
  isSubmitting = false,
}: SetujuiRequestDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<PendingSubmit | null>(null)

  const form = useForm<SetujuiFormValues>({
    resolver: zodResolver(setujuiSchema),
    defaultValues: {
      buktiTransfer: undefined as unknown as FileList,
      catatan: DEFAULT_CATATAN,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        buktiTransfer: undefined as unknown as FileList,
        catatan: DEFAULT_CATATAN,
      })
    }
  }, [open, form])

  const onSubmit = (values: SetujuiFormValues) => {
    if (!row) return
    const file = values.buktiTransfer?.[0]
    setPendingSubmit({
      row,
      data: {
        buktiTransfer: file,
        catatan: values.catatan ?? "",
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

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="border-b pb-4 text-2xl font-bold">
              Setujui Request
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="buktiTransfer"
                render={({ field: { onChange, value, ref } }) => (
                  <FormItem>
                    <FormLabel>
                      Bukti Transfer <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="relative flex flex-1 items-center">
                          <div className="border-input text-muted-foreground absolute top-1/2 left-0 flex h-full w-12 -translate-y-1/2 items-center justify-center border-r">
                            <FileIcon className="size-4" />
                          </div>
                          <input
                            type="text"
                            readOnly
                            className="border-input h-12 flex-1 rounded-md border bg-transparent pr-3 pl-12 text-sm"
                            placeholder="Pilih file..."
                            value={
                              value?.length
                                ? ((value as FileList)[0]?.name ?? "")
                                : ""
                            }
                          />
                          <input
                            ref={(el) => {
                              ref(el)
                              ;(
                                fileInputRef as React.MutableRefObject<HTMLInputElement | null>
                              ).current = el
                            }}
                            type="file"
                            className="sr-only"
                            accept="image/*,.pdf"
                            onChange={(e) =>
                              onChange(
                                e.target.files ??
                                  (undefined as unknown as FileList)
                              )
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          className="shrink-0 gap-2"
                          onClick={triggerFileInput}
                        >
                          <FileIcon className="size-4" />
                          Browse
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="catatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tulis catatan..."
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
        description="Anda akan menyetujui request tambah modal ini."
        note=""
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </>
  )
}
