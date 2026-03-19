"use client"

import React, { useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
import { X, Printer, Download, AlertCircle } from "lucide-react"
import { toast } from "sonner"

type QRCodeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Value to encode in the QR code (e.g. No.SPK) */
  value: string
  /** Dialog title (default: "QR Code SPK") */
  title?: string
  /** When true, show larger QR for full-screen style download/embed (e.g. for marketing) */
  fullScreen?: boolean
  /** SPK item ID for tracking print count */
  itemId?: string
  /** Whether the QR code has already been printed */
  alreadyPrinted?: boolean
  /** Print count for display */
  printCount?: number
}

export function QRCodeDialog({
  open,
  onOpenChange,
  value,
  title = "QR Code SPK",
  fullScreen = false,
  itemId,
  alreadyPrinted = false,
  printCount = 0,
}: QRCodeDialogProps) {
  const canvasId = React.useId()
  const qrSize = fullScreen ? 400 : 200
  const [isDownloading, setIsDownloading] = useState(false)

  const getCanvas = () =>
    document.getElementById(canvasId) as HTMLCanvasElement | null

  const trackPrint = async () => {
    if (!itemId) return
    try {
      const response = await fetch(
        `/api/v1/spk/item/${itemId}/track-qr-print`,
        {
          method: "PUT",
        }
      )
      if (!response.ok) throw new Error("Failed to track print")
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Failed to track print:", error)
    }
  }

  const handleDownload = async () => {
    const canvas = getCanvas()
    if (!canvas) return

    setIsDownloading(true)

    // Track the print before downloading
    if (itemId) {
      await trackPrint()
    }

    const image = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream")
    const link = document.createElement("a")
    link.download = `QR-${value}.png`
    link.href = image
    link.click()

    // Show warning if already printed before
    if (alreadyPrinted) {
      toast.warning("QR Code sudah pernah dicetak sebelumnya")
    }

    setIsDownloading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={fullScreen ? "sm:max-w-2xl" : "sm:max-w-md"}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            {alreadyPrinted && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="size-3" />
                Sudah dicetak ({printCount}x)
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <Separator />

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-muted/50 flex items-center justify-center rounded-lg p-4">
            <QRCodeCanvas id={canvasId} value={value} size={qrSize} level="M" />
          </div>
          <p className="font-mono text-sm font-medium">{value}</p>
          {alreadyPrinted && (
            <p className="text-destructive text-sm">
              QR Code ini sudah pernah dicetak. Silakan periksa kembali sebelum
              mencetak ulang.
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="size-4" />
            Tutup
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-2"
          >
            <Download className="size-4" />
            {isDownloading ? "Mengunduh..." : "Download QR"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
