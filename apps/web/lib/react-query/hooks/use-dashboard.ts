"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  DashboardKpis,
  MutationTrend,
  SpkByStatusChart,
} from "@/lib/api/types"

// Helper to build query string from filter params
function buildFilterQueryString(
  filter?: Record<string, string>,
  extraParams?: Record<string, string | number>
): string {
  const params = new URLSearchParams()

  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      params.set(key, String(value))
    })
  }

  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      params.set(key, value)
    })
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ""
}

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  kpis: (filter?: Record<string, string>) =>
    [...dashboardKeys.all, "kpis", filter] as const,
  spkByStatus: (filter?: Record<string, string>) =>
    [...dashboardKeys.all, "spk-by-status", filter] as const,
  mutationTrends: (days?: number, filter?: Record<string, string>) =>
    [...dashboardKeys.all, "mutation-trends", days, filter] as const,
}

// Get dashboard KPIs
export function useDashboardKpis(
  filter?: Record<string, string>,
  enabled = true
) {
  return useQuery({
    queryKey: dashboardKeys.kpis(filter),
    queryFn: () =>
      apiClient.get<DashboardKpis>(
        `${endpoints.dashboard.kpis}${buildFilterQueryString(filter)}`
      ),
    enabled,
  })
}

// Get SPK by status chart data (returns array of { status, count })
export function useSpkByStatusChart(
  filter?: Record<string, string>,
  enabled = true
) {
  return useQuery({
    queryKey: dashboardKeys.spkByStatus(filter),
    queryFn: () =>
      apiClient.get<SpkByStatusChart[]>(
        `${endpoints.dashboard.spkByStatusChart}${buildFilterQueryString(filter)}`
      ),
    enabled,
  })
}

// Get mutation trends chart data (returns array of { date, creditTotal, debitTotal, net })
export function useMutationTrends(
  days: number = 30,
  filter?: Record<string, string>,
  enabled = true
) {
  return useQuery({
    queryKey: dashboardKeys.mutationTrends(days, filter),
    queryFn: () =>
      apiClient.get<MutationTrend[]>(
        `${endpoints.dashboard.mutationTrends}${buildFilterQueryString(filter, { days })}`
      ),
    enabled,
  })
}
