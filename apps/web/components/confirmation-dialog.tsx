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
  title?: string
  description?: string
  note?: string
  confirmLabel?: string
  cancelLabel?: string
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
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Red circular icon with white 'i' */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
              <Info className="h-6 w-6 text-white" />
            </div>

            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            
            {description && (
              <DialogDescription className="text-base">
                {description}
              </DialogDescription>
            )}

            {note && (
              <p className="text-sm text-muted-foreground">{note}</p>
            )}
          </div>
        </DialogHeader>

        <DialogFooter className="flex-row gap-2 sm:justify-center">
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="flex-1 sm:flex-initial"
          >
            {confirmLabel}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-initial"
          >
            {cancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}