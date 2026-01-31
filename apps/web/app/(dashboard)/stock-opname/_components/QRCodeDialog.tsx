"use client"

import React from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
import { X, Printer } from "lucide-react"

type QRCodeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Value to encode in the QR code (e.g. No.SPK) */
  value: string
}

export function QRCodeDialog({
  open,
  onOpenChange,
  value,
}: QRCodeDialogProps) {
  const handlePrint = () => {
    const canvas = document.getElementById("qr-code-spk") as HTMLCanvasElement
    if (!canvas) return

    const pngData = canvas.toDataURL("image/png")
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code SPK - ${value}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
            h1 { margin-bottom: 1rem; font-size: 1.25rem; }
            img { max-width: 256px; height: auto; }
          </style>
        </head>
        <body>
          <h1>QR Code SPK</h1>
          <p>${value}</p>
          <img src="${pngData}" alt="QR Code" />
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>QR Code SPK</DialogTitle>
        </DialogHeader>
        <Separator />

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex items-center justify-center rounded-lg bg-muted/50 p-4">
            <QRCodeCanvas
              id="qr-code-spk"
              value={value}
              size={200}
              level="M"
            />
          </div>
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
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="size-4" />
            Print QR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
