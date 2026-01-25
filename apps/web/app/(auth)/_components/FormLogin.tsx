"use client"

import React, { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { imgLogoGadaiTop } from "@/assets"
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

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email harus diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password harus diisi")
    .min(6, "Password minimal 6 karakter"),
})

type LoginFormValues = z.infer<typeof loginSchema>

// Prevent redirecting to auth routes after login
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]

export default function FormLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallbackUrl = searchParams.get("callbackUrl") || "/"
  const errorParam = searchParams.get("error")
  const callbackUrl = authRoutes.includes(rawCallbackUrl) ? "/" : rawCallbackUrl

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Track if we've already initialized the error from URL params
  const errorInitializedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Initialize error from URL params only once on mount
  useEffect(() => {
    if (!errorInitializedRef.current && errorParam === "SessionExpired") {
      setError("Sesi Anda telah berakhir. Silakan login kembali.")
      errorInitializedRef.current = true

      // Clear error param from URL to prevent re-reading
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("error")
      // Keep callbackUrl if it's not an auth route
      const callbackUrlParam = newUrl.searchParams.get("callbackUrl") || ""
      if (authRoutes.includes(callbackUrlParam)) {
        newUrl.searchParams.delete("callbackUrl")
      }
      router.replace(newUrl.pathname + newUrl.search, { scroll: false })
    }
  }, [errorParam, router])

  // Clear error when user starts typing
  const handleInputChange = () => {
    if (error) {
      setError(null)
    }
  }

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        // Don't show SessionExpired error from NextAuth - user is already trying to login
        // This can happen if NextAuth still sees an expired session
        if (
          result.error === "SessionExpired" ||
          result.error === "RefreshAccessTokenError"
        ) {
          // Try to clear the session and retry, or just show a generic error
          setError("Silakan coba login lagi.")
        } else {
          setError(result.error)
        }
        return
      }

      if (result?.ok) {
        // Clear any error state before redirecting
        setError(null)
        // Redirect to callbackUrl (which is guaranteed to not be an auth route)
        // Use replace instead of push to avoid adding to history
        router.replace(callbackUrl)
        router.refresh()
      }
    } catch {
      setError("Terjadi kesalahan saat login. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-6 text-center">
      <Image
        src={imgLogoGadaiTop}
        alt="logo"
        width={150}
        height={150}
        className="mx-auto mb-4"
      />

      <h2 className="mb-2 text-3xl font-bold">Selamat Datang</h2>
      <p className="mb-6 text-gray-400">
        Silakan masukkan email & password untuk masuk ke akunmu.
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Masukkan email"
                    icon={<Mail className="size-4" />}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      icon={<Lock className="size-4" />}
                      disabled={isLoading}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleInputChange()
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                      disabled={isLoading}
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
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
            className="w-full"
            size="default"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
