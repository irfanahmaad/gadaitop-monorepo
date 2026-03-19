"use client"

import React, { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import Image from "next/image"
import { imgPaymentInProcess } from "@/assets/commons"
import { useNkb } from "@/lib/react-query/hooks/use-nkb"

export default function PaymentProcessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nkbId = searchParams.get("nkbId") ?? ""
  const method = searchParams.get("method") ?? "cash"

  const {
    data: nkb,
    refetch,
    isFetching,
  } = useNkb(nkbId, {
    enabled: !!nkbId,
    refetchInterval: 5000,
  })

  useEffect(() => {
    if (nkb?.status === "confirmed") {
      router.replace(`/portal-customer/payment-success?nkbId=${nkbId}`)
    }
  }, [nkb?.status, nkbId, router])

  useEffect(() => {
    if (!nkbId) {
      router.replace("/portal-customer")
    }
  }, [nkbId, router])

  const handleKembali = () => {
    router.push("/portal-customer")
  }

  const handleReload = () => {
    refetch()
  }

  const isCash = method === "cash"
  const title = isCash
    ? "Pembayaran Cash Dalam Proses"
    : "Pembayaran Dalam Proses"
  const subtitle = isCash
    ? "Silakan bayar pada loket/kasir yang bertugas."
    : "Menunggu konfirmasi pembayaran transfer."

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
                src={imgPaymentInProcess}
                alt="Payment in process"
                className="border-muted size-24 rounded-full border-2 object-cover"
                width={96}
                height={96}
              />
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            </div>

            <p className="text-muted-foreground text-center text-sm">
              Menunggu pembayaran dikonfirmasi oleh Kasir Toko.
            </p>

            <div className="flex w-full gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleKembali}
                className="flex-1 gap-2"
              >
                <ArrowLeft className="size-4" />
                Kembali
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 flex-1 gap-2"
                onClick={handleReload}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`size-4 ${isFetching ? "animate-spin" : ""}`}
                />
                Reload
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
