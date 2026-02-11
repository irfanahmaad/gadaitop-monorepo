"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { FileText, X, Save, Loader2 } from "lucide-react"
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
import { useCreateItemType, useUpdateItemType } from "@/lib/react-query/hooks"
import type { ItemType } from "@/lib/api/types"

const tipeBarangSchema = z.object({
  typeCode: z
    .string()
    .min(1, "Kode Tipe Barang harus diisi")
    .max(5, "Kode Tipe Barang maksimal 5 karakter"),
  typeName: z
    .string()
    .min(1, "Nama Tipe Barang harus diisi")
    .max(100, "Nama Tipe Barang maksimal 100 karakter"),
})

type TipeBarangFormValues = z.infer<typeof tipeBarangSchema>

interface TipeBarangFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  initialData?: ItemType | null
}

export function TipeBarangFormDialog({
  open,
  onOpenChange,
  onClose,
  initialData,
}: TipeBarangFormDialogProps) {
  const [mounted, setMounted] = React.useState(false)
  const isEditMode = !!initialData

  const createItemType = useCreateItemType()
  const updateItemType = useUpdateItemType()

  const isSubmitting = createItemType.isPending || updateItemType.isPending

  const form = useForm<TipeBarangFormValues>({
    resolver: zodResolver(tipeBarangSchema),
    defaultValues: {
      typeCode: initialData?.typeCode || "",
      typeName: initialData?.typeName || "",
    },
  })

  // Ensure component only renders on client to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Reset form when dialog opens/closes or initialData changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        typeCode: initialData?.typeCode || "",
        typeName: initialData?.typeName || "",
      })
    }
  }, [open, initialData, form])

  const onSubmit = (values: TipeBarangFormValues) => {
    if (isEditMode && initialData) {
      // Update existing item type
      updateItemType.mutate(
        {
          id: initialData.uuid,
          data: {
            typeName: values.typeName,
          },
        },
        {
          onSuccess: () => {
            toast.success("Tipe Barang berhasil diperbarui")
            onClose()
          },
          onError: (error) => {
            toast.error(error.message || "Gagal memperbarui Tipe Barang")
          },
        }
      )
    } else {
      // Create new item type
      createItemType.mutate(
        {
          typeCode: values.typeCode,
          typeName: values.typeName,
        },
        {
          onSuccess: () => {
            toast.success("Tipe Barang berhasil ditambahkan")
            onClose()
          },
          onError: (error) => {
            toast.error(error.message || "Gagal menambahkan Tipe Barang")
          },
        }
      )
    }
  }

  const handleCancel = () => {
    form.reset()
    onClose()
  }

  // Don't render on server to prevent hydration mismatch with Radix UI IDs
  if (!mounted) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="border-b pb-4 text-2xl font-bold">
            {isEditMode ? "Edit Tipe Barang" : "Tambah Tipe Barang"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Detail Tipe Barang Section */}
            <div className="space-y-4">
              <div className="grid gap-6">
                {/* Kode Tipe Barang Field */}
                <FormField
                  control={form.control}
                  name="typeCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Kode Tipe Barang{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="H"
                          icon={<FileText className="size-4" />}
                          disabled={isEditMode}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nama Tipe Barang Field */}
                <FormField
                  control={form.control}
                  name="typeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nama Tipe Barang{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Handphone"
                          icon={<FileText className="size-4" />}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
              <Button type="submit" disabled={isSubmitting} className="gap-2">
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
  )
}
