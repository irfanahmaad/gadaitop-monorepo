"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, X, Save, FolderLock } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import Image from "next/image"
import { imgPortalCustomer } from "../../../assets"

// Skeleton loader component
function PortalCustomerSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Main content */}
      <main className="bg-muted/30 flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            {/* Icon skeleton */}
            <Skeleton className="size-24 rounded-full" />

            {/* Title skeleton */}
            <div className="flex w-full flex-col items-center gap-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>

            {/* Input field skeleton */}
            <div className="flex w-full flex-col gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Buttons skeleton */}
            <div className="flex w-full gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function PortalCustomerPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Simulate loading state (replace with actual data fetching)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000) // Simulate 1 second loading

    return () => clearTimeout(timer)
  }, [])

  const handleBatal = () => {
    router.back()
  }

  const handleSimpan = () => {
    if (pin.length < 8) {
      toast.error("PIN harus minimal 8 karakter")
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("PIN berhasil disimpan")
      // Navigate to next page or handle success
    }, 1000)
  }

  if (isLoading) {
    return <PortalCustomerSkeleton />
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Main content */}
      <main className="bg-muted/30 flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            {/* Icon */}
            <div className="flex items-center justify-center">
              <Image
                src={imgPortalCustomer}
                alt="Customer Portal"
                className="border-muted size-24 rounded-full border-2 object-cover"
                width={96}
                height={96}
              />
            </div>

            {/* Title and Instructions */}
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-bold">Masukkan PIN</h2>
              <p className="text-muted-foreground text-sm">
                Silakan Masukkan PIN dengan minimal 8 Karakter
              </p>
            </div>

            {/* PIN Input Field */}
            <div className="flex w-full flex-col gap-2">
              <label htmlFor="pin" className="text-sm font-medium">
                PIN
              </label>
              <Input
                id="pin"
                type="password"
                placeholder="Minimal 8 Karakter"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                icon={<Lock className="size-4" />}
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex w-full gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBatal}
                disabled={isSubmitting}
                className="flex-1"
              >
                <X className="mr-2 size-4" />
                Batal
              </Button>
              <Button
                type="button"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1"
                onClick={handleSimpan}
                disabled={isSubmitting || pin.length < 8}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">...</span>
                    Menyimpan
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Simpan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
