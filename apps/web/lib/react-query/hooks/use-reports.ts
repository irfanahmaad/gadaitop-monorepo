"use client"

import { useQuery } from "@tanstack/react-query"

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
function buildFilterParams(filters?: ReportFilters): string {
  if (!filters) return ""
  const params = new URLSearchParams()
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
  if (filters.dateTo) params.set("dateTo", filters.dateTo)
  if (filters.companyId) params.set("companyId", filters.companyId)
  if (filters.branchId) params.set("branchId", filters.branchId)
  const str = params.toString()
  return str ? `?${str}` : ""
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
