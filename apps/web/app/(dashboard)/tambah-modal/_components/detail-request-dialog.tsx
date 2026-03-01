"use client"

import React from "react"
import { X, Printer } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import type { RequestTambahModal } from "./types"
import { formatTanggalRequest, formatNominal } from "./utils"
import { StatusBadge } from "./status-badge"

type DetailRequestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: RequestTambahModal | null
}

function DetailField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <div className="text-base">{children}</div>
    </div>
  )
}

export function DetailRequestDialog({
  open,
  onOpenChange,
  row,
}: DetailRequestDialogProps) {
  if (!row) return null

  const { dateStr, timeStr } = formatTanggalRequest(row.tanggalRequest)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="border-b pb-4 text-2xl font-bold">
            Detail Request Tambah Modal
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <DetailField label="No Request">{row.uuid}</DetailField>
            <DetailField label="Tanggal Request">
              {dateStr}, {timeStr}
            </DetailField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <DetailField label="Dilakukan Oleh">
              {row.dilakukanOleh.name}
            </DetailField>
            <DetailField label="Status">
              <StatusBadge status={row.status} />
            </DetailField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <DetailField label="Nama Toko">{row.namaToko}</DetailField>
            <DetailField label="Alias">{row.alias || "-"}</DetailField>
          </div>

          <DetailField label="Nominal">
            {formatNominal(row.nominal)}
          </DetailField>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="size-4" />
            Tutup
          </Button>
          {/* <Button
            type="button"
            variant="destructive"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="size-4" />
            Cetak
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
