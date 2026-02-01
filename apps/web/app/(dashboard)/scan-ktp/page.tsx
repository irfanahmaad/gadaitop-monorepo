"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { IdCard, ScanLine, RotateCcw, Search } from "lucide-react"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/breadcrumbs"
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
  const [isSearching, setIsSearching] = useState(false)

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
      // TODO: Replace with API call to search SPK by NIK
      console.log("Mencari SPK dengan NIK:", values.nik)
      toast.success("Pencarian berhasil")
      // TODO: Navigate to SPK detail or show results
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mencari SPK"
      toast.error(message)
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
    </div>
  )
}
