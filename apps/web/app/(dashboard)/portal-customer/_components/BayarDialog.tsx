"use client"

import React, { useState, useMemo, useCallback } from "react"
import { X, KeyRound } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Parse currency string to number
const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^0-9]/g, "")
  return cleaned ? parseInt(cleaned, 10) : 0
}

type BayarType = "cicil" | "lunas"

interface BayarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: BayarType
  /** The nominal value from the SPK row, used as default for "lunas" */
  nominal?: number
  onConfirm?: (data: {
    type: BayarType
    metodePembayaran: string
    totalBayarPokok: number
    totalBunga: number
    totalDenda: number
    grandTotal: number
  }) => void
}

const BUNGA_PERCENT = 5
const DENDA_PERCENT = 2

export function BayarDialog({
  open,
  onOpenChange,
  type,
  nominal = 0,
  onConfirm,
}: BayarDialogProps) {
  const [metodePembayaran, setMetodePembayaran] = useState("cash")
  const [totalBayarPokok, setTotalBayarPokok] = useState("")

  // Set default value based on type when dialog opens
  React.useEffect(() => {
    if (open) {
      if (type === "lunas") {
        setTotalBayarPokok(formatCurrency(nominal))
      } else {
        setTotalBayarPokok(formatCurrency(200_000))
      }
      setMetodePembayaran("cash")
    }
  }, [open, type, nominal])

  const bayarPokokValue = useMemo(
    () => parseCurrency(totalBayarPokok),
    [totalBayarPokok]
  )

  const totalBunga = useMemo(
    () => (bayarPokokValue * BUNGA_PERCENT) / 100,
    [bayarPokokValue]
  )

  const totalDenda = useMemo(
    () => (type === "lunas" ? (bayarPokokValue * DENDA_PERCENT) / 100 : 0),
    [bayarPokokValue, type]
  )

  const grandTotal = useMemo(
    () => bayarPokokValue + totalBunga + totalDenda,
    [bayarPokokValue, totalBunga, totalDenda]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "")
      if (raw === "") {
        setTotalBayarPokok("")
        return
      }
      const num = parseInt(raw, 10)
      setTotalBayarPokok(formatCurrency(num))
    },
    []
  )

  const handleConfirm = useCallback(() => {
    onConfirm?.({
      type,
      metodePembayaran,
      totalBayarPokok: bayarPokokValue,
      totalBunga,
      totalDenda,
      grandTotal,
    })
    onOpenChange(false)
  }, [
    type,
    metodePembayaran,
    bayarPokokValue,
    totalBunga,
    totalDenda,
    grandTotal,
    onConfirm,
    onOpenChange,
  ])

  const title = type === "cicil" ? "Bayar Cicil" : "Bayar Lunas"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 pt-2">
          {/* Metode Pembayaran */}
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold">Metode Pembayaran</p>
              <p className="text-muted-foreground text-sm">Mulai Dari</p>
            </div>
            <RadioGroup
              value={metodePembayaran}
              onValueChange={setMetodePembayaran}
              className="flex flex-row gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="cash" id={`${type}-cash`} />
                <Label htmlFor={`${type}-cash`} className="cursor-pointer">
                  Cash
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="transfer" id={`${type}-transfer`} />
                <Label htmlFor={`${type}-transfer`} className="cursor-pointer">
                  Transfer
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Nominal Pembayaran */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Nominal Pembayaran</p>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">
                Total Bayar Pokok{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="border-input text-muted-foreground absolute left-0 top-0 flex h-full items-center justify-center border-r px-3 text-sm">
                  Rp
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={totalBayarPokok ? `Rp ${totalBayarPokok},-` : ""}
                  onChange={handleInputChange}
                  className="border-input bg-background placeholder:text-muted-foreground/60 h-12 w-full rounded-md border pl-14 pr-3 text-sm shadow-xs outline-none focus-visible:border-ring/30 focus-visible:ring-ring/20 focus-visible:ring-[3px]"
                  placeholder="Rp 0,-"
                />
              </div>
            </div>
          </div>

          {/* Informasi Pembayaran Bulan Ini */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-red-500">🏷</span>
              <p className="text-sm font-semibold text-red-500">
                Informasi Pembayaran Bulan Ini
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Total Bunga {BUNGA_PERCENT}%
                </span>
                <span className="text-sm">
                  Rp {formatCurrency(totalBunga)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Total Denda {DENDA_PERCENT}%
                </span>
                <span className="text-sm">
                  Rp {formatCurrency(totalDenda)},-
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm font-medium">
                  Grand Total
                </span>
                <span className="text-sm font-semibold">
                  Rp {formatCurrency(grandTotal)},-
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="gap-2"
          >
            <KeyRound className="h-4 w-4" />
            Konfirmasi Pembayaran
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
