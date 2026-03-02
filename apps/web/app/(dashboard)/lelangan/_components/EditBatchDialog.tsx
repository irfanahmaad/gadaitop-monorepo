"use client"

import React, { useMemo, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { X, Save, Loader2, IdCard, Check, ChevronsUpDown } from "lucide-react"

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"

import { useUsers } from "@/lib/react-query/hooks/use-users"
import { useUpdateAuctionBatch } from "@/lib/react-query/hooks/use-auction-batches"
import type { AuctionBatch } from "@/lib/api/types"

const editBatchSchema = z.object({
  name: z.string().min(1, "Nama Batch harus diisi"),
  assignedTo: z.string().optional(),
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
  const [staffPopoverOpen, setStaffPopoverOpen] = useState(false)

  // Fetch users filtered by auction_staff role
  const { data: usersData } = useUsers({ 
    pageSize: 500,
    filter: { roleCode: "auction_staff" }
  })
  const updateMutation = useUpdateAuctionBatch()

  const form = useForm<EditBatchFormValues>({
    resolver: zodResolver(editBatchSchema),
    defaultValues: {
      name: "",
      assignedTo: "",
      notes: "",
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open && batch) {
      // In a real scenario, the batch might already have name and assignee
      form.reset({
        name: (batch as any).name ?? `Batch ${batch.batchCode}`,
        assignedTo: typeof batch.assignedTo === 'string' ? batch.assignedTo : (batch.assignedTo as any)?.uuid ?? "",
        notes: (batch.items as any)?.notes ?? (batch as any).notes ?? "",
      })
    } else if (!open) {
      form.reset()
    }
  }, [open, batch, form])

  const onSubmit = async (values: EditBatchFormValues) => {
    if (!batch?.uuid) return

    try {
      await updateMutation.mutateAsync({
        id: batch.uuid,
        data: {
          name: values.name,
          assignedTo: values.assignedTo || undefined,
          notes: values.notes,
        },
      })
      toast.success("Batch lelang berhasil diperbarui.")
      onSuccess?.()
      onClose()
    } catch {
      toast.error("Gagal memperbarui batch lelang.")
    }
  }

  const handleCancel = () => {
    form.reset()
    onClose()
  }

  const isSubmitting = form.formState.isSubmitting || updateMutation.isPending

  if (!mounted) return null

  // Process users for the combobox
  const users = usersData?.data ?? []
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="border-b pb-4 text-2xl font-bold">
            Edit Batch Lelang
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                        <div className="absolute left-3 flex items-center justify-center text-muted-foreground border bg-muted/50 rounded h-7 w-9 mr-2">
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

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-2 md:mt-0">
                    <FormLabel className="mb-2">Penanggung Jawab Lelang</FormLabel>
                    <Popover open={staffPopoverOpen} onOpenChange={setStaffPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between px-3 font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="size-6">
                                  <AvatarImage
                                    src={
                                      users.find((u) => u.uuid === field.value)
                                        ?.imageUrl ?? ""
                                    }
                                  />
                                  <AvatarFallback className="text-xs">
                                    {users
                                      .find((u) => u.uuid === field.value)
                                      ?.fullName?.charAt(0) ?? "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                  {
                                    users.find((u) => u.uuid === field.value)
                                      ?.fullName
                                  }
                                </span>
                              </div>
                            ) : (
                              "Pilih Staf"
                            )}
                            <div className="flex items-center gap-1">
                              {field.value && (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="text-muted-foreground hover:text-foreground flex items-center justify-center rounded-sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    field.onChange("")
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.stopPropagation()
                                      field.onChange("")
                                    }
                                  }}
                                >
                                  <X className="size-4" />
                                </div>
                              )}
                              <ChevronsUpDown className="text-muted-foreground size-4 shrink-0 opacity-50" />
                            </div>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Cari staf..." />
                          <CommandList>
                            <CommandEmpty>Staf tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                              {users.map((user) => (
                                <CommandItem
                                  key={user.uuid}
                                  value={user.fullName ?? user.email}
                                  onSelect={() => {
                                    field.onChange(user.uuid)
                                    setStaffPopoverOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 size-4",
                                      field.value === user.uuid
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <Avatar className="mr-2 size-6">
                                    <AvatarImage src={user.imageUrl ?? ""} />
                                    <AvatarFallback className="text-xs">
                                      {user.fullName?.charAt(0) ?? "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  {user.fullName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
  )
}
