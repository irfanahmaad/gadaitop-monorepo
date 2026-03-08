"use client"

import React, { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { User, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { imgLoginPortalCustomer } from "@/assets/commons"
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
import { Alert, AlertDescription } from "@workspace/ui/components/alert"

const customerLoginSchema = z.object({
  nik: z
    .string()
    .min(1, "NIK harus diisi")
    .regex(/^\d{16}$/, "NIK harus terdiri dari 16 digit angka"),
  pin: z
    .string()
    .min(4, "PIN minimal 4 karakter")
    .max(6, "PIN maksimal 6 karakter")
    .regex(/^\d+$/, "PIN harus berupa angka"),
})

type CustomerLoginFormValues = z.infer<typeof customerLoginSchema>

const customerAuthRoutes = ["/portal-customer/login"]

export default function FormCustomerLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get("callbackUrl") || "/portal-customer"
  const errorParam = searchParams.get("error")
  const callbackUrl = customerAuthRoutes.includes(rawCallbackUrl)
    ? "/portal-customer"
    : rawCallbackUrl

  const [showPin, setShowPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const errorInitializedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CustomerLoginFormValues>({
    resolver: zodResolver(customerLoginSchema),
    defaultValues: {
      nik: "",
      pin: "",
    },
  })

  useEffect(() => {
    if (!errorInitializedRef.current && errorParam === "SessionExpired") {
      setError("Sesi Anda telah berakhir. Silakan login kembali.")
      errorInitializedRef.current = true

      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("error")
      const callbackUrlParam = newUrl.searchParams.get("callbackUrl") || ""
      if (customerAuthRoutes.includes(callbackUrlParam)) {
        newUrl.searchParams.delete("callbackUrl")
      }
      router.replace(newUrl.pathname + newUrl.search, { scroll: false })
    }
  }, [errorParam, router])

  const handleInputChange = () => {
    if (error) {
      setError(null)
    }
  }

  const onSubmit = async (values: CustomerLoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("customer-credentials", {
        nik: values.nik,
        pin: values.pin,
        redirect: false,
      })

      if (result?.error) {
        if (
          result.error === "SessionExpired" ||
          result.error === "RefreshAccessTokenError"
        ) {
          setError("Silakan coba login lagi.")
        } else {
          setError(result.error)
        }
        return
      }

      if (result?.ok) {
        setError(null)
        router.replace(callbackUrl)
        router.refresh()
      }
    } catch {
      setError("NIK atau PIN salah. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-6 text-center">
      <Image
        src={imgLoginPortalCustomer}
        alt="Portal Customer"
        width={80}
        height={80}
        className="mx-auto mb-4"
      />

      <h2 className="mb-2 text-3xl font-bold">Portal Customer</h2>
      <p className="mb-6 text-muted-foreground">
        Silakan Masukkan NIK & PIN untuk mencari data
      </p>

      {error && (
        <Alert variant="destructive" className="mb-4 text-left">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={16}
                    placeholder="Masukkan NIK"
                    icon={<User className="size-4" />}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      field.onChange(value)
                      handleInputChange()
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIN</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Masukkan PIN"
                      icon={<Lock className="size-4" />}
                      disabled={isLoading}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        field.onChange(value)
                        handleInputChange()
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                      disabled={isLoading}
                      aria-label={
                        showPin ? "Sembunyikan PIN" : "Tampilkan PIN"
                      }
                    >
                      {showPin ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            size="default"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Masuk
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
