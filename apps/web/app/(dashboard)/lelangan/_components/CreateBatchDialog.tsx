"use client"

import React, { useEffect, useMemo, useState } from "react"
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

const createSchema = z.object({
  namaBatch: z.string().min(1, "Nama batch wajib diisi"),
  marketingStaffIds: z.array(z.string()).optional(),
  auctionStaffIds: z.array(z.string()).optional(),
  catatan: z.string().optional(),
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
    name?: string
    notes?: string
    marketingStaffIds?: string[]
    auctionStaffIds?: string[]
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
  const firstItem = selectedItems[0]
  const ptId = firstItem?.ptId ?? null

  const { data: marketingData } = useUsers({
    pageSize: 100,
    filter: {
      roleCode: "marketing",
      ...(ptId ? { companyId: ptId } : {}),
    },
    enabled: !!ptId && open,
  })
  const { data: auctionStaffData } = useUsers({
    pageSize: 100,
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

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState<{
    storeId: string
    ptId: string
    spkItemIds: string[]
    name?: string
    notes?: string
    marketingStaffIds?: string[]
    auctionStaffIds?: string[]
  } | null>(null)

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      namaBatch: "",
      marketingStaffIds: [],
      auctionStaffIds: [],
      catatan: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        namaBatch: "",
        marketingStaffIds: [],
        auctionStaffIds: [],
        catatan: "",
      })
    }
  }, [open, form])

  const mataCount = selectedItems.filter((i) => i.isMata).length

  const onSubmit = (values: CreateFormValues) => {
    if (!firstItem) return
    setPendingSubmit({
      storeId: firstItem.storeId,
      ptId: firstItem.ptId,
      spkItemIds: selectedItems.map((i) => i.spkItemId),
      name: values.namaBatch?.trim() || undefined,
      notes: values.catatan?.trim() || undefined,
      marketingStaffIds:
        values.marketingStaffIds?.length ? values.marketingStaffIds : undefined,
      auctionStaffIds:
        values.auctionStaffIds?.length ? values.auctionStaffIds : undefined,
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

  const hasSelection = selectedItems.length > 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Batch Lelang</DialogTitle>
          </DialogHeader>
          {!hasSelection ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Pilih minimal 1 item SPK Jatuh Tempo dari tabel di bawah, lalu
                klik Buat Batch lagi.
              </p>
              <p className="mt-2 text-muted-foreground text-sm">
                Buka tab &quot;SPK Jatuh Tempo&quot;, centang item yang ingin
                dimasukkan ke batch, lalu klik tombol Buat Batch.
              </p>
            </div>
          ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg border p-4">
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
                      <FormLabel>
                        Nama Batch <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama batch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  name="catatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Masukkan catatan"
                          className="min-h-[80px] resize-none"
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </Form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmSubmit}
        title="Buat Batch Lelang"
        description={`Anda akan membuat batch lelang dengan ${selectedItems.length} item yang dipilih.`}
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
    </>
  )
}
