"use client"

import React, { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { QRScanDialog } from "@/components/qr-scan-dialog"
import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { ArrowLeft, QrCode, AlertCircle } from "lucide-react"

const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

function extractItemId(value: string): string | null {
  const trimmed = value.trim()
  if (UUID_REGEX.test(trimmed) && trimmed.length === 36) return trimmed
  const match = trimmed.match(UUID_REGEX)
  return match ? match[0] : null
}

export default function ValidasiLelanganScanPage() {
  const router = useRouter()
  const [scanOpen, setScanOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)

  const handleScan = useCallback(
    async (value: string) => {
      const itemId = extractItemId(value)
      if (!itemId) {
        setError("QR tidak valid. Gunakan kode item batch lelang.")
        return
      }
      setError(null)
      setResolving(true)
      try {
        const res = await apiClient.get<{ batchId: string; itemId: string }>(
          endpoints.auctionBatches.byItem(itemId)
        )
        setScanOpen(false)
        router.push(`/validasi-lelangan/${res.batchId}/item/${res.itemId}`)
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Item tidak ditemukan atau tidak ada akses."
        setError(message)
      } finally {
        setResolving(false)
      }
    },
    [router]
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Scan QR Item Lelang</h1>
        <Breadcrumbs
          items={[
            { label: "Pages", href: "/" },
            { label: "Validasi Lelang", href: "/validasi-lelangan" },
            { label: "Scan QR", className: "text-destructive" },
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="size-5" />
            Buka item lelang dengan scan QR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Scan QR code pada item batch lelang untuk langsung membuka halaman
            detail item. Jika QR tidak terbaca, pastikan kode item batch lelang
            yang valid.
          </p>
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setError(null)
                setScanOpen(true)
              }}
              disabled={resolving}
              className="gap-2"
            >
              <QrCode className="size-4" />
              {resolving ? "Mencari..." : "Buka kamera & scan QR"}
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/validasi-lelangan">
                <ArrowLeft className="size-4" />
                Kembali ke Validasi Lelang
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <QRScanDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        title="Scan QR Item Lelang"
        onScan={handleScan}
        onError={() => setError("Tidak dapat mengakses kamera.")}
      />
    </div>
  )
}
