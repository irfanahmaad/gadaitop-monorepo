"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileText, X, Save } from "lucide-react"
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

const tipeBarangSchema = z.object({
  code: z.string().min(1, "Kode Tipe Barang harus diisi"),
  name: z.string().min(1, "Nama Tipe Barang harus diisi"),
})

type TipeBarangFormValues = z.infer<typeof tipeBarangSchema>

type TipeBarang = {
  id: string
  code: string
  name: string
  createdAt: string
}

interface TipeBarangFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  initialData?: TipeBarang | null
}

export function TipeBarangFormDialog({
  open,
  onOpenChange,
  onClose,
  initialData,
}: TipeBarangFormDialogProps) {
  const isEditMode = !!initialData

  const form = useForm<TipeBarangFormValues>({
    resolver: zodResolver(tipeBarangSchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
    },
  })

  // Reset form when dialog opens/closes or initialData changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        code: initialData?.code || "",
        name: initialData?.name || "",
      })
    }
  }, [open, initialData, form])

  const onSubmit = (values: TipeBarangFormValues) => {
    console.log(isEditMode ? "Edit:" : "Add:", values)
    // Implement save action here
    // After successful save, close dialog
    onClose()
  }

  const handleCancel = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditMode ? "Edit Tipe Barang" : "Tambah Tipe Barang"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Detail Tipe Barang Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-dashed pb-4">
                <FileText className="text-destructive size-6" />
                <h3 className="text-destructive text-base font-semibold">
                  Detail Tipe Barang
                </h3>
              </div>

              <div className="grid gap-6">
                {/* Kode Tipe Barang Field */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Kode Tipe Barang{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="B001"
                          icon={<FileText className="size-4" />}
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
                  name="name"
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
                className="gap-2"
              >
                <X className="size-4" />
                Batal
              </Button>
              <Button type="submit" className="gap-2">
                <Save className="size-4" />
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
