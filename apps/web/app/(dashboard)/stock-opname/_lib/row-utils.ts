import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { StockOpnameSessionListItem } from "@/lib/api/types"

export type StockOpnameRow = {
  id: string
  idSO: string
  tanggal: string
  toko: string
  petugas: string
  lastUpdatedAt: string
  status: "Dijadwalkan" | "Berjalan" | "Menunggu Approval" | "Tervalidasi"
  tokoNumber?: string
  petugasNumber?: string
  syaratMataNumber?: string
  itemCount?: string
}

export const STATUS_DISPLAY: Record<
  StockOpnameSessionListItem["status"],
  StockOpnameRow["status"]
> = {
  draft: "Dijadwalkan",
  in_progress: "Berjalan",
  completed: "Menunggu Approval",
  approved: "Tervalidasi",
}

export function formatTanggal(isoDate: string): string {
  try {
    return format(new Date(isoDate), "d MMMM yyyy", { locale: id })
  } catch {
    return isoDate
  }
}

export function formatLastUpdated(isoDate: string | undefined | null): string {
  if (isoDate == null || isoDate === "") return "—"
  try {
    const d = new Date(isoDate)
    if (Number.isNaN(d.getTime())) return "—"
    return format(d, "d MMMM yyyy HH:mm:ss", { locale: id })
  } catch {
    return "—"
  }
}

export function mapSessionToRow(
  session: StockOpnameSessionListItem
): StockOpnameRow {
  const storeCount = session.stores?.length ?? session.storeIds?.length ?? 0
  const assigneeCount = session.assignees?.length ?? 0
  const syaratMataCount =
    session.pawnTermIds?.length ?? session.pawnTerms?.length ?? 0
  return {
    id: session.uuid,
    idSO: session.sessionCode,
    tanggal: formatTanggal(session.startDate),
    toko: storeCount > 0 ? `${storeCount} Toko` : "—",
    petugas:
      assigneeCount > 0
        ? `${assigneeCount} Petugas`
        : session.creatorFullName ?? "—",
    lastUpdatedAt: formatLastUpdated(
      session.updatedAt ?? session.createdAt
    ),
    status: STATUS_DISPLAY[session.status],
    tokoNumber: storeCount > 0 ? String(storeCount) : "—",
    petugasNumber: assigneeCount > 0 ? String(assigneeCount) : "—",
    syaratMataNumber: syaratMataCount > 0 ? String(syaratMataCount) : "—",
    itemCount:
      session.totalItemsCounted != null
        ? String(session.totalItemsCounted)
        : "—",
  }
}
