"use client"

import React, { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import { Calendar as CalendarIcon, X, Save, Loader2 } from "lucide-react"
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
import { MultiSelectCombobox } from "@/components/multi-select-combobox"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { cn } from "@workspace/ui/lib/utils"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { useCreateStockOpname } from "@/lib/react-query/hooks/use-stock-opname"
import type { CreateStockOpnameDto } from "@/lib/api/types"

const stockOpnameSchema = z.object({
  tanggal: z.date({
    required_error: "Tanggal harus diisi",
  }),
  toko: z.array(z.string()).min(1, "Toko harus dipilih minimal satu"),
  petugasSO: z.array(z.string()).optional(),
  syaratMata: z.array(z.string()).optional(),
  jumlahItemMata: z
    .string()
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        val === "" ||
        (!isNaN(Number(val)) && Number(val) > 0),
      { message: "Jumlah item harus berupa angka positif" }
    ),
  catatan: z.string().optional(),
})

type StockOpnameFormValues = z.infer<typeof stockOpnameSchema>

interface StockOpnameFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  /** Called after successful create (e.g. to invalidate list queries) */
  onSuccess?: () => void
}

export function StockOpnameFormDialog({
  open,
  onOpenChange,
  onClose,
  onSuccess,
}: StockOpnameFormDialogProps) {
  const [mounted, setMounted] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<StockOpnameFormValues | null>(
    null
  )

  const { user } = useAuth()
  const ptId = user?.companyId ?? user?.ownedCompanyId ?? null

  const { data: branchesData } = useBranches({ pageSize: 500 })

  const tokoOptions = useMemo(
    () =>
      (branchesData?.data ?? []).map((b) => ({
        label: b.shortName ?? b.fullName ?? b.branchCode ?? b.uuid,
        value: b.uuid,
      })),
    [branchesData?.data]
  )

  const petugasSOOptions = [
    { label: "Ben Affleck", value: "ben-affleck" },
    { label: "Rocks D Xebec", value: "rocks-d-xebec" },
    { label: "Edward Newgate", value: "edward-newgate" },
    { label: "John Doe", value: "john-doe" },
    { label: "Jane Smith", value: "jane-smith" },
  ]

  const syaratMataOptions = [
    { label: "Barang Mahal", value: "barang-mahal" },
    { label: "Barang Penting", value: "barang-penting" },
    { label: "Barang Antik", value: "barang-antik" },
    { label: "Barang Langka", value: "barang-langka" },
  ]

  const createMutation = useCreateStockOpname()

  const form = useForm<StockOpnameFormValues>({
    resolver: zodResolver(stockOpnameSchema),
    defaultValues: {
      tanggal: undefined,
      toko: [],
      petugasSO: [],
      syaratMata: [],
      jumlahItemMata: "10",
      catatan: "",
    },
  })

  // Ensure component only renders on client to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      form.reset({
        tanggal: undefined,
        toko: [],
        petugasSO: [],
        syaratMata: [],
        jumlahItemMata: "10",
        catatan: "",
      })
    }
  }, [open, form])

  const onSubmit = (values: StockOpnameFormValues) => {
    if (!ptId) {
      toast.error("Company (PT) tidak ditemukan. Silakan login kembali.")
      return
    }
    setPendingValues(values)
    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    if (!pendingValues || !ptId) {
      setConfirmOpen(false)
      setPendingValues(null)
      return
    }
    const startDate = format(pendingValues.tanggal, "yyyy-MM-dd")
    const notes = pendingValues.catatan?.trim() || undefined
    const payloads: CreateStockOpnameDto[] = pendingValues.toko.map(
      (storeId) => ({
        ptId,
        storeId,
        startDate,
        notes,
      })
    )
    try {
      await Promise.all(
        payloads.map((dto) => createMutation.mutateAsync(dto))
      )
      toast.success(
        payloads.length === 1
          ? "Jadwal SO berhasil dibuat."
          : `${payloads.length} jadwal SO berhasil dibuat.`
      )
      onSuccess?.()
      setConfirmOpen(false)
      setPendingValues(null)
      onClose()
    } catch {
      toast.error("Gagal membuat jadwal SO. Silakan coba lagi.")
    }
  }

  const handleCancel = () => {
    form.reset()
    setPendingValues(null)
    setConfirmOpen(false)
    onClose()
  }

  const isSubmitting =
    form.formState.isSubmitting || createMutation.isPending

  // Don't render on server to prevent hydration mismatch with Radix UI IDs
  if (!mounted) {
    return null
  }

  return (
    <>
      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirmSubmit}
        title="Apakah Anda Yakin?"
        description="Anda akan menyimpan data jadwal Stock Opname ke dalam sistem."
        note="Pastikan kembali sebelum menyimpan data."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="border-b pb-4 text-2xl font-bold">
            Buat Jadwal SO
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tanggal Field */}
            <FormField
              control={form.control}
              name="tanggal"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel>
                    Tanggal <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd MMMM yyyy", { locale: id })
                          ) : (
                            <span>DD Month YYYY</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Toko Field */}
            <FormField
              control={form.control}
              name="toko"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Toko <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <MultiSelectCombobox
                      options={tokoOptions}
                      selected={field.value}
                      onSelectedChange={field.onChange}
                      placeholder="Pilih Toko"
                      searchPlaceholder="Cari Toko..."
                      emptyMessage="Toko tidak ditemukan"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Petugas SO Field */}
            <FormField
              control={form.control}
              name="petugasSO"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Petugas SO <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <MultiSelectCombobox
                      options={petugasSOOptions}
                      selected={field.value ?? []}
                      onSelectedChange={field.onChange}
                      placeholder="Pilih Petugas"
                      searchPlaceholder="Cari Petugas..."
                      emptyMessage="Petugas tidak ditemukan"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Syarat "Mata" Field */}
            <FormField
              control={form.control}
              name="syaratMata"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Syarat &quot;Mata&quot;{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <MultiSelectCombobox
                      options={syaratMataOptions}
                      selected={field.value ?? []}
                      onSelectedChange={field.onChange}
                      placeholder="Pilih Syarat 'Mata'"
                      searchPlaceholder="Cari Syarat..."
                      emptyMessage="Syarat tidak ditemukan"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Jumlah Item yang Membutuhkan Syarat "Mata" Field */}
            <FormField
              control={form.control}
              name="jumlahItemMata"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Berapa Jumlah Item yang Membutuhkan Syarat &quot;Mata&quot;{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="10"
                      className="w-full"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Catatan Field */}
            <FormField
              control={form.control}
              name="catatan"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Pastikan untuk melakukan SO dengan sangat teliti sehingga tidak ada barang yang terlwat."
                      className="min-h-[100px] w-full"
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
                disabled={isSubmitting || !ptId}
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
    </>
  )
}
