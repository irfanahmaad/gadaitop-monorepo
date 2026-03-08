"use client"

import React from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { IdCard } from "lucide-react"
import type { StockOpnameSession } from "@/lib/api/types"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

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
  data?: StockOpnameDetail | null
  /** API session data — preferred over `data` */
  session?: StockOpnameSession | null
  /** Mata rule names matched for display */
  mataRuleNames?: string[]
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const STATUS_MAP: Record<string, "Dijadwalkan" | "Berjalan" | "Selesai"> = {
  draft: "Dijadwalkan",
  scheduled: "Dijadwalkan",
  in_progress: "Berjalan",
  completed: "Selesai",
  approved: "Selesai",
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

function formatDate(isoDate: string): string {
  try {
    return format(new Date(isoDate), "d MMMM yyyy HH:mm 'WIB'", {
      locale: idLocale,
    })
  } catch {
    return isoDate
  }
}

function formatLastUpdated(isoDate: string | undefined | null): string {
  if (isoDate == null || isoDate === "") return "—"
  try {
    const d = new Date(isoDate)
    if (Number.isNaN(d.getTime())) return "—"
    return format(d, "d MMMM yyyy HH:mm:ss", {
      locale: idLocale,
    })
  } catch {
    return "—"
  }
}

export function DetailSO({
  data,
  session,
  mataRuleNames,
}: DetailSOProps) {
  // Prefer API session data, fall back to legacy dummy style
  const displayData = React.useMemo(() => {
    if (session) {
      const displayStatus =
        STATUS_MAP[session.status] ?? "Dijadwalkan"
      const tokoNames = (session.stores ?? []).map(
        (s) => s.shortName ?? s.fullName ?? s.uuid
      )
      let petugasNames = (session.assignees ?? []).map(
        (a) => a.fullName ?? a.name ?? a.uuid
      )
      if (petugasNames.length === 0 && session.creatorFullName) {
        petugasNames = [session.creatorFullName]
      }
      // Prefer persisted pawn term names, fall back to derived mata rule names
      const syaratMataNames =
        (session.pawnTerms?.length ?? 0) > 0
          ? (session.pawnTerms ?? []).map(
              (pt) =>
                pt.ruleName?.trim() ||
                pt.itemType?.typeName ||
                (pt.tenorMin != null && pt.tenorMax != null
                  ? `Tenor ${pt.tenorMin}-${pt.tenorMax} bln`
                  : pt.uuid)
            )
          : mataRuleNames ?? []
      return {
        idSO: session.sessionCode ?? session.uuid,
        tanggal: formatDate(session.startDate ?? session.scheduledDate ?? session.createdAt),
        toko: tokoNames,
        syaratMata: syaratMataNames,
        lastUpdatedAt: formatLastUpdated(
          session.updatedAt ?? session.createdAt
        ),
        petugasSO: petugasNames.length > 0 ? petugasNames : ["—"],
        uangDiToko: 0,
        totalUangDiMutasi: 0,
        catatan: session.notes ?? "",
        status: displayStatus,
      }
    }
    if (data) return data
    return null
  }, [session, data, mataRuleNames])

  if (!displayData) return null

  const config = statusConfig[displayData.status]

  return (
    <Card>
      <CardContent>
        {/* Header with ID SO and Status */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{displayData.idSO}</h2>
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

          <div className="grid gap-6 md:grid-cols-2 items-start">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">ID SO</label>
                <p className="text-base">{displayData.idSO}</p>
              </div>
              {displayData.toko.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">Toko</label>
                  <p className="text-base">{displayData.toko.join(", ")}</p>
                </div>
              )}
              {displayData.syaratMata.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-black">
                    Syarat &quot;Mata&quot;
                  </label>
                  <p className="text-base">
                    {displayData.syaratMata.join(", ")}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">
                  Last Updated At
                </label>
                <p className="text-base">
                  {displayData.lastUpdatedAt || "—"}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">Tanggal</label>
                <p className="text-base">{displayData.tanggal}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">
                  Petugas SO
                </label>
                <p className="text-base">
                  {displayData.petugasSO.join(", ")}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">
                  Uang di Toko
                </label>
                <p className="text-destructive text-base font-semibold">
                  Rp {formatCurrency(displayData.uangDiToko)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-black">
                  Total Uang di Mutasi Terakhir pada 01:00 WIB
                </label>
                <p className="text-base">
                  Rp {formatCurrency(displayData.totalUangDiMutasi)}
                </p>
              </div>
            </div>
          </div>

          {/* Catatan */}
          {displayData.catatan && (
            <div className="space-y-2 border-t border-dashed pt-4">
              <label className="text-muted-foreground text-sm font-bold">
                Catatan
              </label>
              <p className="text-base">{displayData.catatan}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
