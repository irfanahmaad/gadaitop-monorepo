"use client"

import React from "react"
import { Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  /** Main question (e.g. "Apakah Anda Yakin?") */
  title?: string
  description?: string
  note?: string
  confirmLabel?: string
  cancelLabel?: string
  /** "destructive" = red icon, confirm then cancel; "info" = blue icon, cancel then Ya */
  variant?: "destructive" | "info"
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Apakah Anda Yakin?",
  description,
  note = "Pastikan kembali sebelum menghapus data.",
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  variant = "destructive",
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  const isInfo = variant === "info"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isInfo ? "bg-blue-500" : "bg-red-500"
              }`}
            >
              <Info className="h-6 w-6 text-white" />
            </div>

            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>

            {description && (
              <DialogDescription className="text-base">
                {description}
              </DialogDescription>
            )}

            {note && <p className="text-muted-foreground text-sm">{note}</p>}
          </div>
        </DialogHeader>

        <DialogFooter className="flex-row gap-2 sm:justify-center">
          {isInfo ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-initial"
              >
                {cancelLabel}
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 sm:flex-initial"
              >
                {confirmLabel}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-initial"
              >
                {cancelLabel}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                className="flex-1 sm:flex-initial"
              >
                {confirmLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
