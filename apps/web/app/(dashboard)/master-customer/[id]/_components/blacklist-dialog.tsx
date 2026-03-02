"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { Loader2 } from "lucide-react"

interface BlacklistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => Promise<void>
  isSubmitting?: boolean
}

export function BlacklistDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: BlacklistDialogProps) {
  const [reason, setReason] = useState("")

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason("")
    }
    onOpenChange(newOpen)
  }

  const handleConfirm = () => {
    if (!reason.trim()) return
    onConfirm(reason)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Blacklist Customer</DialogTitle>
          <DialogDescription>
            Masukkan alasan mengapa customer ini di-blacklist.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Textarea 
            placeholder="Alasan blacklist..." 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Blacklist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
