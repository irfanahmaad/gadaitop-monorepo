"use client"

import React from "react"
import { X } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import type { SetorUang } from "../types"

type DetailSetorUangDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: SetorUang | null
  onBatalkan?: (row: SetorUang) => void
}

/** Display status in the dialog (Lunas shown as "Disetujui"). */
type DetailStatus = "Pending" | "Disetujui" | "Failed" | "Expired"

function getDetailStatus(row: SetorUang): DetailStatus {
  return row.status === "Lunas" ? "Disetujui" : row.status
}

const StatusBadge = ({ status }: { status: DetailStatus }) => {
  const config = {
    Pending: {
      label: "Pending",
      className:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    Disetujui: {
      label: "Disetujui",
      className: "bg-green-600 text-white border-0",
    },
    Failed: {
      label: "Failed",
      className:
        "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-0",
    },
    Expired: {
      label: "Expired",
      className:
        "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0",
    },
  }[status]
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-3", config.className)}
    >
      {config.label}
    </Badge>
  )
}

function formatTanggalWaktu(iso: string): string {
  try {
    return format(new Date(iso), "d MMMM yyyy HH:mm:ss", { locale: id })
  } catch {
    return iso
  }
}

export function DetailSetorUangDialog({
  open,
  onOpenChange,
  row,
  onBatalkan,
}: DetailSetorUangDialogProps) {
  if (!row) return null

  const detailStatus = getDetailStatus(row)
  const isDisetujui = detailStatus === "Disetujui"
  const isPending = detailStatus === "Pending"
  const isFailedOrExpired =
    detailStatus === "Failed" || detailStatus === "Expired"
  const showVaAndProof = isDisetujui || isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] print:max-w-none"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="border-0 pb-0 text-xl font-bold">
              Detail Setor Uang
            </DialogTitle>
            <StatusBadge status={detailStatus} />
          </div>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Tanggal & Waktu
            </p>
            <p className="text-base">{formatTanggalWaktu(row.tanggal)}</p>
          </div>

          {showVaAndProof && (
            <>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">
                  Bukti Bayar
                </p>
                {row.proofUrl ? (
                  <a
                    href={row.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-destructive text-base underline hover:no-underline"
                  >
                    {row.proofUrl.split("/").pop() ?? "bukti_bayar.pdf"}
                  </a>
                ) : (
                  <p className="text-muted-foreground text-base">-</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm font-medium">
                  No.VA (Virtual Account)
                </p>
                <p className="text-base">{row.vaNumber}</p>
              </div>
            </>
          )}

          {isFailedOrExpired && (
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Alasan
              </p>
              <p className="text-base">
                {row.rejectionReason ?? "[system: Batas waktu telah terlewat]"}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t pt-4 print:hidden">
          {row.status === "Pending" && onBatalkan ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="gap-2"
              >
                <X className="size-4" />
                Tutup
              </Button>
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
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="gap-2"
            >
              <X className="size-4" />
              Tutup
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
