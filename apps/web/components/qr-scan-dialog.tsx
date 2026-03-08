"use client"

import React, { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import { X, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
)

export interface QRScanDialogProps {
  /** Controlled open state */
  open: boolean
  /** Called when open state should change (e.g. close) */
  onOpenChange: (open: boolean) => void
  /** Dialog title (default: "QR") */
  title?: string
  /** Called when a QR/barcode is scanned; receives decoded value */
  onScan?: (value: string) => void
  /** Called when camera error occurs (e.g. permission denied) */
  onError?: (error: unknown) => void
  /** Optional content to render instead of camera (overrides built-in scanner) */
  children?: React.ReactNode
}

/**
 * Global QR Scan dialog: header "QR", camera feed with scan frame, footer "Tutup".
 * QR is detected automatically. Uses @yudiel/react-qr-scanner for camera.
 * Reusable across stock-opname auditor, validasi-lelangan, and other features.
 */
export function QRScanDialog({
  open,
  onOpenChange,
  title = "QR",
  onScan,
  onError,
  children,
}: QRScanDialogProps) {
  const [cameraError, setCameraError] = useState<string | null>(null)

  const handleTutup = useCallback(() => {
    setCameraError(null)
    onOpenChange(false)
  }, [onOpenChange])

  const handleScan = useCallback(
    (detectedCodes: Array<{ rawValue: string }>) => {
      const first = detectedCodes?.[0]
      if (first?.rawValue && onScan) {
        onScan(first.rawValue)
      }
    },
    [onScan]
  )

  const handleScannerError = useCallback(
    (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Tidak dapat mengakses kamera"
      setCameraError(message)
      onError?.(error)
    },
    [onError]
  )

  const showCamera = open && !children

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Scan area: camera feed with frame overlay */}
        <div className="flex min-h-[280px] items-center justify-center bg-[#5c4033] px-4 py-6">
          <div className="relative aspect-square w-full max-w-[260px] overflow-hidden rounded-lg bg-black">
            {children ? (
              children
            ) : showCamera ? (
              <>
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  {/* Outer solid border (light tan) */}
                  <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-amber-200/80" />
                  {/* Inner dashed border (white) - scanning target */}
                  <div className="pointer-events-none absolute inset-2 rounded-md border-2 border-dashed border-white/90" />
                </div>
                {cameraError ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-black/80 p-4 text-center">
                    <AlertCircle className="text-destructive size-10" />
                    <p className="text-muted-foreground text-sm">
                      {cameraError}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Pastikan izin kamera diaktifkan untuk peramban ini.
                    </p>
                  </div>
                ) : (
                  <Scanner
                    onScan={handleScan}
                    onError={handleScannerError}
                    constraints={{ facingMode: "environment" }}
                    styles={{
                      container: {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      },
                      video: {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      },
                    }}
                    classNames={{
                      container: "!w-full !h-full !min-h-0",
                      video: "!w-full !h-full !object-cover",
                    }}
                  />
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded bg-black/40">
                <span className="text-sm text-white/60">
                  Arahkan kamera ke QR code
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleTutup}
            className="gap-2"
          >
            <X className="size-4" />
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
