"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  DashboardKpis,
  MutationTrend,
  SpkByStatusChart,
} from "@/lib/api/types"

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  kpis: () => [...dashboardKeys.all, "kpis"] as const,
  spkByStatus: () => [...dashboardKeys.all, "spk-by-status"] as const,
  mutationTrends: (days?: number) =>
    [...dashboardKeys.all, "mutation-trends", days] as const,
}

// Get dashboard KPIs
export function useDashboardKpis() {
  return useQuery({
    queryKey: dashboardKeys.kpis(),
    queryFn: () => apiClient.get<DashboardKpis>(endpoints.dashboard.kpis),
  })
}

// Get SPK by status chart data
export function useSpkByStatusChart() {
  return useQuery({
    queryKey: dashboardKeys.spkByStatus(),
    queryFn: () =>
      apiClient.get<SpkByStatusChart>(endpoints.dashboard.spkByStatusChart),
  })
}

// Get mutation trends chart data
export function useMutationTrends(days: number = 30) {
  return useQuery({
    queryKey: dashboardKeys.mutationTrends(days),
    queryFn: () =>
      apiClient.get<MutationTrend>(
        `${endpoints.dashboard.mutationTrends}?days=${days}`
      ),
  })
}
