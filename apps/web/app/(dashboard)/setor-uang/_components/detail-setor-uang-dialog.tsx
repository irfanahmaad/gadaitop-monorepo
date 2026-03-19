"use client"

import React, { useState, useEffect } from "react"
import { X, Copy, Check, RefreshCw } from "lucide-react"
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
import { formatCurrencyDisplay } from "@/lib/format-currency"
import { useCashDeposit } from "@/lib/react-query/hooks/use-cash-deposits"
import type { SetorUang } from "../types"

type DetailSetorUangDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: SetorUang | null
}

const statusConfigs: Record<SetorUang["status"], { label: string; className: string }> = {
  Pending: {
    label: "Pending",
    className:
      "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  Lunas: {
    label: "Lunas",
    className: "bg-green-600 text-white border-0",
  },
  Expired: {
    label: "Expired",
    className:
      "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0",
  },
}

const StatusBadge = ({ status }: { status: SetorUang["status"] }) => {
  const config = statusConfigs[status]
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

function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState("")

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setRemaining("Kedaluwarsa")
        return
      }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setRemaining(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      )
    }
    tick()
    const timer = setInterval(tick, 1_000)
    return () => clearInterval(timer)
  }, [expiresAt])

  return (
    <p
      className={cn(
        "font-mono text-base font-semibold",
        remaining === "Kedaluwarsa" ? "text-destructive" : "text-foreground"
      )}
    >
      {remaining}
    </p>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2_000)
    } catch {
      /* ignore */
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="h-7 gap-1 px-2 text-xs"
    >
      {copied ? (
        <>
          <Check className="size-3" />
          Tersalin
        </>
      ) : (
        <>
          <Copy className="size-3" />
          Salin
        </>
      )}
    </Button>
  )
}

export function DetailSetorUangDialog({
  open,
  onOpenChange,
  row,
}: DetailSetorUangDialogProps) {
  // Refetch on demand to get latest status
  const { refetch, isFetching } = useCashDeposit(row?.uuid ?? "")

  if (!row) return null

  const isPending = row.status === "Pending"
  const isLunas = row.status === "Lunas"

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
            <StatusBadge status={row.status} />
          </div>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Kode Deposit */}
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Kode Setoran
            </p>
            <p className="font-mono text-base font-medium">{row.depositCode}</p>
          </div>

          {/* Tanggal */}
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Tanggal & Waktu
            </p>
            <p className="text-base">{formatTanggalWaktu(row.tanggal)}</p>
          </div>

          {/* Toko */}
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">Toko</p>
            <p className="text-base">{row.namaToko}</p>
          </div>

          {/* Nominal */}
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">Nominal</p>
            <p className="text-base font-semibold">
              Rp{formatCurrencyDisplay(row.nominal)}
            </p>
          </div>

          {/* VA Number — show for Pending and Lunas */}
          {(isPending || isLunas) && row.virtualAccount && (
            <div className="col-span-2 space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                No. Virtual Account
              </p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-lg font-bold tracking-widest">
                  {row.virtualAccount}
                </p>
                <CopyButton text={row.virtualAccount} />
              </div>
              {isPending && (
                <p className="text-muted-foreground text-xs">
                  Transfer nominal tepat ke nomor VA di atas.
                </p>
              )}
            </div>
          )}

          {/* Expiry countdown — only for Pending */}
          {isPending && row.expiresAt && (
            <div className="col-span-2 space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Batas Waktu Pembayaran
              </p>
              <ExpiryCountdown expiresAt={row.expiresAt} />
              <p className="text-muted-foreground text-xs">
                Berakhir:{" "}
                {format(new Date(row.expiresAt), "d MMM yyyy, HH:mm:ss", {
                  locale: id,
                })}
              </p>
            </div>
          )}

          {/* Notes */}
          {row.notes && (
            <div className="col-span-2 space-y-1">
              <p className="text-muted-foreground text-sm font-medium">
                Catatan
              </p>
              <p className="text-base">{row.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between border-t pt-4 print:hidden">
          {/* Refresh status button (useful for Staff Toko waiting for payment) */}
          {isPending && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw
                className={cn("size-4", isFetching && "animate-spin")}
              />
              Refresh Status
            </Button>
          )}
          <div className="ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="gap-2"
            >
              <X className="size-4" />
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
