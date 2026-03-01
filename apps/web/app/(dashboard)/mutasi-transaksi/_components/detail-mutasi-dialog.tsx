"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { formatCurrencyDisplay } from "@/lib/format-currency"

type MutasiTransaksi = {
  id: string
  tanggal: string
  user: {
    name: string
    avatar?: string
  }
  jenis: string
  noSpkNkb: string
  deskripsi: string
  debit: number | null
  kredit: number | null
  saldo: number
}

type DetailMutasiDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: MutasiTransaksi | null
}

export function DetailMutasiDialog({
  open,
  onOpenChange,
  row,
}: DetailMutasiDialogProps) {
  if (!row) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="border-b pb-4 text-2xl font-bold">
            Detail Mutasi
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              Tanggal
            </p>
            <p className="text-base">{row.tanggal}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">User</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={row.user.avatar} alt={row.user.name} />
                <AvatarFallback>
                  {row.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-base">{row.user.name}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">Jenis</p>
            <p className="text-base">{row.jenis}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">
              No SPK/NKB
            </p>
            <p className="text-base">{row.noSpkNkb}</p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <p className="text-muted-foreground text-sm font-medium">
              Deskripsi
            </p>
            <p className="text-base">{row.deskripsi}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">Debit</p>
            <p className="text-base">
              {row.debit
                ? `Rp${formatCurrencyDisplay(row.debit)},-`
                : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">Kredit</p>
            <p className="text-base">
              {row.kredit
                ? `Rp${formatCurrencyDisplay(row.kredit)},-`
                : "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">Saldo</p>
            <p className="text-base">
              Rp{formatCurrencyDisplay(row.saldo)},-
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
