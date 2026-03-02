"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { RotateCcw, Search, IdCard, ScanLine, Info } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { Customer } from "@/lib/api/types"
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

const scanKtpSchema = z.object({
  nik: z
    .string()
    .min(1, "NIK harus diisi")
    .min(16, "NIK harus terdiri dari 16 digit")
    .max(16, "NIK harus terdiri dari 16 digit")
    .regex(/^\d+$/, "NIK harus berupa angka"),
})

type ScanKtpFormValues = z.infer<typeof scanKtpSchema>

export default function ScanKtpPage() {
  const router = useRouter()
  const [isSearching, setIsSearching] = useState(false)
  const [notFoundDialogVisible, setNotFoundDialogVisible] = useState(false)
  const [searchedNik, setSearchedNik] = useState("")

  const form = useForm<ScanKtpFormValues>({
    resolver: zodResolver(scanKtpSchema),
    defaultValues: {
      nik: "",
    },
  })

  const handleScan = () => {
    // TODO: Implement KTP scanning functionality
    toast.info("Fitur scan KTP akan segera tersedia")
  }

  const handleReset = () => {
    form.reset()
    form.setValue("nik", "")
  }

  const handleSearch = async (values: ScanKtpFormValues) => {
    setIsSearching(true)
    try {
      const customer = await apiClient.get<Customer | null>(
        endpoints.customers.lookupByNik(values.nik)
      )
      if (customer) {
        toast.success("Customer ditemukan")
        router.push(`/master-customer/${customer.uuid}`)
      } else {
        setSearchedNik(values.nik)
        setNotFoundDialogVisible(true)
      }
    } catch (error: any) {
      if (error.statusCode === 404) {
        setSearchedNik(values.nik)
        setNotFoundDialogVisible(true)
      } else {
        const message =
          error instanceof Error ? error.message : "Gagal mencari data"
        toast.error(message)
      }
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Scan KTP</h1>
        <Breadcrumbs
          items={[
            { label: "Pages", href: "/" },
            { label: "Scan KTP", className: "text-destructive" },
          ]}
        />
      </div>

      {/* Cari SPK card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cari SPK</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={handleScan}
              className="gap-2"
            >
              <ScanLine className="size-4" />
              Scan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSearch)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="nik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      NIK <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="9999011501010001"
                        icon={<IdCard className="size-4" />}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSearching}
                >
                  <RotateCcw className="mr-2 size-4" />
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <Search className="mr-2 size-4 animate-pulse" />
                      Mencari...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 size-4" />
                      Cari
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Not Found Confirmation Dialog */}
      <ConfirmationDialog
        open={notFoundDialogVisible}
        onOpenChange={setNotFoundDialogVisible}
        onConfirm={() =>
          router.push(`/master-customer/tambah?nik=${searchedNik}`)
        }
        title="Tidak ada Data"
        description="Data yang anda cari tidak ada di dalam sistem, pastikan data yang diinput sudah sesuai."
        note="atau lakukan pendaftaran customer"
        confirmLabel="Daftarkan"
        cancelLabel="Tutup"
        variant="destructive" // Wait we could use a custom ConfirmationDialog or standard one. We use destructive to get a red button, and it will have a red icon.
      />
    </div>
  )
}
