"use client"

import React, { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import Image from "next/image"
import { imgPaymentSuccess } from "@/assets/commons"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nkbId = searchParams.get("nkbId") ?? ""

  useEffect(() => {
    if (!nkbId) {
      router.replace("/portal-customer")
    }
  }, [nkbId, router])

  const handleKembali = () => {
    router.push("/portal-customer")
  }

  if (!nkbId) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="bg-muted/30 flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="flex items-center justify-center">
              <Image
                src={imgPaymentSuccess}
                alt="Payment success"
                className="border-muted size-24 rounded-full border-2 object-cover"
                width={96}
                height={96}
              />
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-bold">Pembayaran Berhasil</h2>
              <p className="text-muted-foreground text-sm">
                Pembayaran Telah Berhasil Dikonfirmasi
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleKembali}
              className="w-full gap-2"
            >
              <ArrowLeft className="size-4" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
