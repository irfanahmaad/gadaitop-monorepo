"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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

const createSchema = z.object({
  namaBatch: z.string().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>

type ItemLelang = {
  id: string
  spkItemId: string
  storeId: string
  ptId: string
  toko: string
  namaBarang: string
  isMata?: boolean
}

type CreateBatchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItems: ItemLelang[]
  onConfirm: (data: {
    storeId: string
    ptId: string
    spkItemIds: string[]
    notes?: string
  }) => void | Promise<void>
  isSubmitting?: boolean
}

export function CreateBatchDialog({
  open,
  onOpenChange,
  selectedItems,
  onConfirm,
  isSubmitting = false,
}: CreateBatchDialogProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<{
    storeId: string
    ptId: string
    spkItemIds: string[]
    notes?: string
  } | null>(null)

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      namaBatch: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        namaBatch: "",
      })
    }
  }, [open, form])

  const firstItem = selectedItems[0]
  const mataCount = selectedItems.filter((i) => i.isMata).length

  const onSubmit = (values: CreateFormValues) => {
    if (!firstItem) return
    setPendingSubmit({
      storeId: firstItem.storeId,
      ptId: firstItem.ptId,
      spkItemIds: selectedItems.map((i) => i.spkItemId),
      notes: values.namaBatch?.trim() || undefined,
    })
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!pendingSubmit) return
    await onConfirm(pendingSubmit)
    setPendingSubmit(null)
    setConfirmOpen(false)
    onOpenChange(false)
  }

  if (selectedItems.length === 0) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Batch Lelang</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-muted-foreground text-sm">
                    {selectedItems.length} item dipilih
                    {mataCount > 0 && (
                      <span className="text-destructive ml-1">
                        ({mataCount} prioritas Mata)
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    Toko: {firstItem?.toko ?? "-"}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="namaBatch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Batch (opsional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: Batch Januari 2025"
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
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Buat Batch
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
        title="Buat Batch Lelang"
        description={`Anda akan membuat batch lelang dengan ${selectedItems.length} item yang dipilih.`}
        confirmLabel="Buat Batch"
        variant="info"
      />
    </>
  )
}
