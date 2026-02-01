"use client"

import React from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { IdCard } from "lucide-react"

export type StockOpnameDetail = {
  idSO: string
  tanggal: string
  toko: string[]
  syaratMata: string[]
  lastUpdatedAt: string
  petugasSO: string[]
  uangDiToko: number
  totalUangDiMutasi: number
  catatan: string
  status: "Dijadwalkan" | "Berjalan" | "Selesai"
}

type DetailSOProps = {
  data: StockOpnameDetail
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const statusConfig = {
  Dijadwalkan: {
    label: "Dijadwalkan",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  Berjalan: {
    label: "Berjalan",
    className:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  Selesai: {
    label: "Selesai",
    className:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  },
}

export function DetailSO({ data }: DetailSOProps) {
  const config = statusConfig[data.status]

  return (
    <Card>
      <CardContent>
        {/* Header with ID SO and Status */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{data.idSO}</h2>
            <p className="text-muted-foreground text-sm">
              Stock Opname / Detail
            </p>
          </div>
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        </div>

        {/* Detail SO Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-dashed pb-3">
            <IdCard className="text-destructive size-6" />
            <h3 className="text-destructive text-base font-semibold">
              Detail SO
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">ID SO</label>
                <p className="text-base">{data.idSO}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Toko</label>
                <p className="text-base">{data.toko.join(", ")}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">
                  Syarat &quot;Mata&quot;
                </label>
                <p className="text-base">{data.syaratMata.join(", ")}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">
                  Last Updated At
                </label>
                <p className="text-base">{data.lastUpdatedAt}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Tanggal</label>
                <p className="text-base">{data.tanggal}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">
                  Petugas SO
                </label>
                <p className="text-base">{data.petugasSO.join(", ")}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">
                  Uang di Toko
                </label>
                <p className="text-destructive text-base font-semibold">
                  Rp {formatCurrency(data.uangDiToko)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">
                  Total Uang di Mutasi Terakhir pada 01:00 WIB
                </label>
                <p className="text-base">
                  Rp {formatCurrency(data.totalUangDiMutasi)}
                </p>
              </div>
            </div>
          </div>

          {/* Catatan */}
          {data.catatan && (
            <div className="space-y-2 border-t border-dashed pt-4">
              <label className="text-muted-foreground text-sm font-bold">
                Catatan
              </label>
              <p className="text-base">{data.catatan}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
