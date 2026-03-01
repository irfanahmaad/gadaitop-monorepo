"use client"

import React from "react"
import { Copy, Share2, Printer, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { cn } from "@workspace/ui/lib/utils"

type SetorUang = {
  id: string
  uuid: string
  tanggal: string
  namaToko: string
  nominal: number
  vaNumber: string
  batasWaktu: string
  status: "Pending" | "Lunas" | "Expired"
}

type DetailSetorUangDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: SetorUang | null
  onBatalkan?: (row: SetorUang) => void
}

const StatusBadge = ({ status }: { status: SetorUang["status"] }) => {
  const statusConfig = {
    Pending: {
      label: "Pending",
      className:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    Lunas: {
      label: "Lunas",
      className:
        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    Expired: {
      label: "Expired",
      className:
        "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
  }
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn(config?.className)}>
      {config?.label ?? ""}
    </Badge>
  )
}

export function DetailSetorUangDialog({
  open,
  onOpenChange,
  row,
  onBatalkan,
}: DetailSetorUangDialogProps) {
  const handleCopyVA = () => {
    if (row?.vaNumber && row.vaNumber !== "-") {
      navigator.clipboard.writeText(row.vaNumber)
    }
  }

  const handleCetak = () => {
    window.print()
  }

  if (!row) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] print:max-w-none">
        <DialogHeader>
          <DialogTitle className="border-b pb-4 text-2xl font-bold">
            Detail Setor Uang
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                No Request
              </p>
              <p className="text-base">{row.uuid}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">Toko</p>
              <p className="text-base">{row.namaToko}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Nominal
              </p>
              <p className="text-base">
                Rp{formatCurrencyDisplay(row.nominal)}
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-muted-foreground text-sm font-medium">
                No. VA
              </p>
              <p className="text-lg font-mono font-semibold">
                {row.vaNumber}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Batas Waktu
              </p>
              <p className="text-base">{row.batasWaktu}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Status
              </p>
              <StatusBadge status={row.status} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyVA}
              disabled={row.vaNumber === "-"}
              className="gap-2"
            >
              <Copy className="size-4" />
              Copy VA
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="size-4" />
              Share to Branch
            </Button>
            <Button variant="outline" size="sm" onClick={handleCetak} className="gap-2">
              <Printer className="size-4" />
              Cetak Instruksi
            </Button>
            {row.status === "Pending" && onBatalkan && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onBatalkan(row)
                  onOpenChange(false)
                }}
                className="gap-2"
              >
                <X className="size-4" />
                Batalkan
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
