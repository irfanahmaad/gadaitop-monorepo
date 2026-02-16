"use client"

import { useQuery } from "@tanstack/react-query"
import { getSession } from "next-auth/react"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  MutationReport,
  NkbPaymentsReport,
  ReportFilters,
  SpkReport,
  StockOpnameReport,
} from "@/lib/api/types"

// Query keys
export const reportKeys = {
  all: ["reports"] as const,
  mutationByBranch: (filters?: ReportFilters) =>
    [...reportKeys.all, "mutation-by-branch", filters] as const,
  mutationByPt: (filters?: ReportFilters) =>
    [...reportKeys.all, "mutation-by-pt", filters] as const,
  spk: (filters?: ReportFilters) =>
    [...reportKeys.all, "spk", filters] as const,
  nkbPayments: (filters?: ReportFilters) =>
    [...reportKeys.all, "nkb-payments", filters] as const,
  stockOpname: (filters?: ReportFilters) =>
    [...reportKeys.all, "stock-opname", filters] as const,
}

// Helper to build query string from filters
function buildFilterParams(filters?: ReportFilters, options?: { format?: "json" | "csv" }): string {
  if (!filters && !options?.format) return ""
  const params = new URLSearchParams()
  if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom)
  if (filters?.dateTo) params.set("dateTo", filters.dateTo)
  if (filters?.ptId ?? filters?.companyId) params.set("ptId", (filters?.ptId ?? filters?.companyId)!)
  if (filters?.storeId ?? filters?.branchId) params.set("storeId", (filters?.storeId ?? filters?.branchId)!)
  if (options?.format) params.set("format", options.format)
  const str = params.toString()
  return str ? `?${str}` : ""
}

export { buildFilterParams as buildReportFilterParams }

const reportEndpoints: Record<string, string> = {
  "mutation-by-branch": endpoints.reports.mutationByBranch,
  "mutation-by-pt": endpoints.reports.mutationByPt,
  spk: endpoints.reports.spk,
  "nkb-payments": endpoints.reports.nkbPayments,
  "stock-opname": endpoints.reports.stockOpname,
}

/** Download report as CSV. Report type must match reportEndpoints keys. */
export async function downloadReportCsv(
  reportType: string,
  filters?: ReportFilters
): Promise<void> {
  const baseUrl = reportEndpoints[reportType]
  if (!baseUrl) throw new Error(`Unknown report type: ${reportType}`)

  const session = await getSession()
  const token = session?.accessToken
  const url = `${baseUrl}${buildFilterParams(filters, { format: "csv" })}`

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error("Failed to download report")

  const blob = await res.blob()
  const disposition = res.headers.get("Content-Disposition")
  const filenameMatch = disposition?.match(/filename="?([^";\n]+)"?/)
  const filename =
    filenameMatch?.[1] ?? `${reportType}-${new Date().toISOString().slice(0, 10)}.csv`

  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

// Get mutation report by branch
export function useMutationByBranchReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.mutationByBranch(filters),
    queryFn: () =>
      apiClient.get<MutationReport>(
        `${endpoints.reports.mutationByBranch}${buildFilterParams(filters)}`
      ),
  })
}

// Get mutation report by PT (company)
export function useMutationByPtReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.mutationByPt(filters),
    queryFn: () =>
      apiClient.get<MutationReport>(
        `${endpoints.reports.mutationByPt}${buildFilterParams(filters)}`
      ),
  })
}

// Get SPK report
export function useSpkReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.spk(filters),
    queryFn: () =>
      apiClient.get<SpkReport>(
        `${endpoints.reports.spk}${buildFilterParams(filters)}`
      ),
  })
}

// Get NKB payments report
export function useNkbPaymentsReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.nkbPayments(filters),
    queryFn: () =>
      apiClient.get<NkbPaymentsReport>(
        `${endpoints.reports.nkbPayments}${buildFilterParams(filters)}`
      ),
  })
}

// Get stock opname report
export function useStockOpnameReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.stockOpname(filters),
    queryFn: () =>
      apiClient.get<StockOpnameReport>(
        `${endpoints.reports.stockOpname}${buildFilterParams(filters)}`
      ),
  })
}
