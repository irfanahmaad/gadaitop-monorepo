"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react"
import { X, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { useSpkCalculatePayment } from "@/lib/react-query/hooks/use-spk"
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
  spkId: string
  /** Remaining balance (total amount) for lunas - input is disabled and forced to this value */
  remainingBalance: number
  /** Default amount for cicil when user can adjust */
  defaultCicilAmount?: number
  onConfirm?: (data: {
    type: BayarType
    spkId: string
    paymentMethod: string
    amountPaid: number
    totalBunga: number
    totalDenda: number
    grandTotal: number
  }) => void | Promise<void>
  isSubmitting?: boolean
}

/** Spec: batas bawah pokok untuk perpanjangan Rp 50.000 */
const MIN_PRINCIPAL_RENEWAL = 50_000

export function BayarDialog({
  open,
  onOpenChange,
  type,
  spkId,
  remainingBalance,
  defaultCicilAmount = 200_000,
  onConfirm,
  isSubmitting = false,
}: BayarDialogProps) {
  const [metodePembayaran, setMetodePembayaran] = useState("cash")
  const [totalBayarPokok, setTotalBayarPokok] = useState("")
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false)
  const isSubmittingState = isSubmitting || isLocalSubmitting

  const bayarPokokValue = useMemo(
    () => parseCurrency(totalBayarPokok),
    [totalBayarPokok]
  )

  const calcType = type === "lunas" ? "redemption" : "renewal"
  const calcAmount =
    type === "lunas"
      ? remainingBalance
      : type === "cicil"
        ? (bayarPokokValue || defaultCicilAmount)
        : 0
  const { data: calcData, isLoading: calcLoading } = useSpkCalculatePayment(
    spkId,
    calcType,
    type === "lunas" ? undefined : calcAmount,
    { enabled: open && !!spkId }
  )

  const totalBunga = useMemo(
    () => calcData?.interestAmount ?? 0,
    [calcData?.interestAmount]
  )
  const totalDenda = useMemo(
    () => calcData?.latePenalty ?? 0,
    [calcData?.latePenalty]
  )
  const grandTotal = useMemo(() => {
    if (type === "lunas" && calcData?.totalDue != null) {
      return calcData.totalDue
    }
    return bayarPokokValue + totalBunga + totalDenda
  }, [type, calcData?.totalDue, bayarPokokValue, totalBunga, totalDenda])

  const amountToSend =
    type === "lunas"
      ? (calcData?.totalDue ?? remainingBalance)
      : bayarPokokValue + totalBunga + totalDenda

  useEffect(() => {
    if (open) {
      if (type === "lunas") {
        setTotalBayarPokok(formatCurrency(remainingBalance))
      } else {
        setTotalBayarPokok(formatCurrency(defaultCicilAmount))
      }
      setMetodePembayaran("cash")
    }
  }, [open, type, remainingBalance, defaultCicilAmount])

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

  const handleConfirm = useCallback(async () => {
    if (isSubmittingState) return

    if (type === "cicil" && bayarPokokValue < MIN_PRINCIPAL_RENEWAL) {
      toast.error(
        `Minimum pembayaran pokok untuk perpanjangan adalah Rp ${MIN_PRINCIPAL_RENEWAL.toLocaleString("id-ID")}`
      )
      return
    }

    setIsLocalSubmitting(true)
    try {
      await onConfirm?.({
        type,
        spkId,
        paymentMethod: metodePembayaran,
        amountPaid: amountToSend,
        totalBunga,
        totalDenda,
        grandTotal,
      })
      onOpenChange(false)
    } finally {
      setIsLocalSubmitting(false)
    }
  }, [
    type,
    spkId,
    metodePembayaran,
    bayarPokokValue,
    amountToSend,
    totalBunga,
    totalDenda,
    grandTotal,
    onConfirm,
    onOpenChange,
    isSubmittingState,
  ])

  const title = type === "cicil" ? "Bayar Cicil" : "Bayar Lunas"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 pt-2">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold">Metode Pembayaran</p>
              <p className="text-muted-foreground text-sm">Mulai Dari</p>
            </div>
            <RadioGroup
              value={metodePembayaran}
              onValueChange={setMetodePembayaran}
              disabled={isSubmittingState}
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
                  disabled={type === "lunas" || isSubmittingState}
                  readOnly={type === "lunas"}
                  className="border-input bg-background placeholder:text-muted-foreground/60 h-12 w-full rounded-md border pl-14 pr-3 text-sm shadow-xs outline-none focus-visible:border-ring/30 focus-visible:ring-ring/20 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-70"
                  placeholder="Rp 0,-"
                />
              </div>
            </div>
          </div>

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
                  Total Bunga
                </span>
                <span className="text-sm">
                  {calcLoading ? "..." : `Rp ${formatCurrency(totalBunga)}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Total Denda
                </span>
                <span className="text-sm">
                  {calcLoading ? "..." : `Rp ${formatCurrency(totalDenda)}`}
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

        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
            disabled={isSubmittingState}
          >
            <X className="h-4 w-4" />
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="gap-2"
            disabled={isSubmittingState}
          >
            <KeyRound className="h-4 w-4" />
            {isSubmittingState ? "Memproses..." : "Konfirmasi Pembayaran"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
