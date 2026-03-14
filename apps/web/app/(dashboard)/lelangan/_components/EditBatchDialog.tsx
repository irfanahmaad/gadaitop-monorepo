"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { IdCard, Loader2, Save, X } from "lucide-react"

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { MultiSelectCombobox } from "@/components/multi-select-combobox"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

import { useUsers } from "@/lib/react-query/hooks/use-users"
import { useUpdateAuctionBatch } from "@/lib/react-query/hooks/use-auction-batches"
import type { AuctionBatch } from "@/lib/api/types"

const editBatchSchema = z.object({
  name: z.string().min(1, "Nama Batch harus diisi"),
  marketingStaffIds: z.array(z.string()).optional(),
  auctionStaffIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

type EditBatchFormValues = z.infer<typeof editBatchSchema>

interface EditBatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  batch: AuctionBatch | null
  onSuccess?: () => void
}

export function EditBatchDialog({
  open,
  onOpenChange,
  onClose,
  batch,
  onSuccess,
}: EditBatchDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<EditBatchFormValues | null>(
    null
  )

  const ptId = batch?.ptId ?? null

  const { data: marketingData } = useUsers({
    pageSize: 500,
    filter: {
      roleCode: "marketing",
      ...(ptId ? { companyId: ptId } : {}),
    },
    enabled: !!ptId && open,
  })
  const { data: auctionStaffData } = useUsers({
    pageSize: 500,
    filter: {
      roleCode: "auction_staff",
      ...(ptId ? { companyId: ptId } : {}),
    },
    enabled: !!ptId && open,
  })

  const marketingOptions = useMemo(
    () =>
      (marketingData?.data ?? []).map((u) => ({
        label: u.fullName ?? u.email ?? "User",
        value: u.uuid,
      })),
    [marketingData?.data]
  )
  const auctionStaffOptions = useMemo(
    () =>
      (auctionStaffData?.data ?? []).map((u) => ({
        label: u.fullName ?? u.email ?? "User",
        value: u.uuid,
      })),
    [auctionStaffData?.data]
  )

  const updateMutation = useUpdateAuctionBatch()

  const form = useForm<EditBatchFormValues>({
    resolver: zodResolver(editBatchSchema),
    defaultValues: {
      name: "",
      marketingStaffIds: [],
      auctionStaffIds: [],
      notes: "",
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open && batch) {
      form.reset({
        name: batch.name ?? `Batch ${batch.batchCode}`,
        marketingStaffIds: batch.marketingStaff?.map((a) => a.uuid) ?? [],
        auctionStaffIds: batch.auctionStaff?.map((a) => a.uuid) ?? [],
        notes: batch.notes ?? "",
      })
    } else if (!open) {
      form.reset()
    }
  }, [open, batch, form])

  const onSubmit = (values: EditBatchFormValues) => {
    setPendingValues(values)
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!batch?.uuid || !pendingValues) return
    try {
      await updateMutation.mutateAsync({
        id: batch.uuid,
        data: {
          name: pendingValues.name,
          marketingStaffIds:
            pendingValues.marketingStaffIds?.length
              ? pendingValues.marketingStaffIds
              : undefined,
          auctionStaffIds:
            pendingValues.auctionStaffIds?.length
              ? pendingValues.auctionStaffIds
              : undefined,
          notes: pendingValues.notes,
        },
      })
      toast.success("Batch lelang berhasil diperbarui.")
      setPendingValues(null)
      setConfirmOpen(false)
      onSuccess?.()
      onClose()
      onOpenChange(false)
    } catch {
      toast.error("Gagal memperbarui batch lelang.")
    }
  }

  const handleCancel = () => {
    form.reset()
    onClose()
    onOpenChange(false)
  }

  const isSubmitting = form.formState.isSubmitting || updateMutation.isPending

  if (!mounted) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="border-b pb-4 text-2xl font-bold">
              Edit Batch Lelang
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nama Batch <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <div className="absolute left-3 flex h-7 w-9 items-center justify-center rounded border bg-muted/50 text-muted-foreground mr-2">
                            <IdCard className="size-4" />
                          </div>
                          <Input
                            placeholder="Batch Handphone"
                            className="pl-14 flex-1"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="marketingStaffIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marketing Staf</FormLabel>
                    <FormControl>
                      <MultiSelectCombobox
                        options={marketingOptions}
                        selected={field.value ?? []}
                        onSelectedChange={field.onChange}
                        placeholder="Pilih marketing staf"
                        searchPlaceholder="Cari..."
                        emptyMessage="Tidak ada marketing staf."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auctionStaffIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staf Lelang</FormLabel>
                    <FormControl>
                      <MultiSelectCombobox
                        options={auctionStaffOptions}
                        selected={field.value ?? []}
                        onSelectedChange={field.onChange}
                        placeholder="Pilih staf lelang"
                        searchPlaceholder="Cari..."
                        emptyMessage="Tidak ada staf lelang."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Pastikan untuk memeriksa item lelang dengan sangat teliti sehingga tidak ada barang yang terlewat."
                        className="min-h-[140px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="border-t pt-4">
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
                  className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
        title="Simpan perubahan"
        description="Anda yakin ingin menyimpan perubahan pada batch lelang ini?"
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </>
  )
}
