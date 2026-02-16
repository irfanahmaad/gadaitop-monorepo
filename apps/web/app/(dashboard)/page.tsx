"use client"

import { useState, useEffect, useMemo } from "react"
import {
  imgMetricsDashboard1,
  imgMetricsDashboard2,
  imgMetricsDashboard3,
  imgMetricsDashboard4,
} from "@/assets/commons"
import { DashboardHeader } from "./_components/DashboardHeader"
import type { PTOption, TokoOption } from "./_components/DashboardHeader"
import { MetricsGrid } from "./_components/MetricsGrid"
import { SPKOverdueChartCard } from "./_components/SPKOverdueChartCard"
import { TrenBarangGadaiChartCard } from "./_components/TrenBarangGadaiChartCard"
import { SPKBaruTable } from "./_components/SPKBaruTable"
import { NKBBaruTable } from "./_components/NKBBaruTable"
import { SPKJatuhTempoTable } from "./_components/SPKJatuhTempoTable"
import {
  useDashboardKpis,
  useSpkByStatusChart,
  useMutationTrends,
} from "@/lib/react-query/hooks/use-dashboard"
import { useSpkList } from "@/lib/react-query/hooks/use-spk"
import { useNkbList } from "@/lib/react-query/hooks/use-nkb"

import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { useAuth } from "@/lib/react-query/hooks/use-auth"

export default function Page() {
  const { user } = useAuth()

  // ── Determine if user is Super Admin (owner) or Admin PT (company_admin) ──
  const isSuperAdmin = useMemo(() => {
    return user?.roles?.some((role) => role.code === "owner") ?? false
  }, [user])

  const isCompanyAdmin = useMemo(() => {
    return user?.roles?.some((role) => role.code === "company_admin") ?? false
  }, [user])

  // ── Date state ────────────────────────────────────────────
  const [date, setDate] = useState<Date>(new Date())

  // ── Fetch companies (PT) for Super Admin only ──────────────
  const { data: companiesData, isLoading: companiesLoading } = useCompanies(
    isSuperAdmin ? { pageSize: 100 } : undefined
  )

  const ptOptions: PTOption[] = useMemo(() => {
    if (!companiesData?.data) return []
    return companiesData.data.map((c) => ({
      value: c.uuid,
      label: c.companyName,
    }))
  }, [companiesData])

  // ── PT selection: Super Admin picks from list; company_admin uses their company ──
  const effectiveCompanyId = isSuperAdmin ? null : (user?.companyId ?? null)
  const [selectedPT, setSelectedPT] = useState("")

  useEffect(() => {
    if (isSuperAdmin && ptOptions.length > 0 && !selectedPT) {
      setSelectedPT(ptOptions[0]!.value)
    }
    if (isCompanyAdmin && effectiveCompanyId && !selectedPT) {
      setSelectedPT(effectiveCompanyId)
    }
  }, [isSuperAdmin, isCompanyAdmin, ptOptions, effectiveCompanyId, selectedPT])

  // ── Fetch branches (Toko) for Super Admin (by selected PT) or company_admin (by user's company) ──
  const branchQueryCompanyId = isSuperAdmin ? selectedPT : effectiveCompanyId
  const { data: branchesData, isLoading: branchesLoading } = useBranches(
    (isSuperAdmin && selectedPT) || (isCompanyAdmin && branchQueryCompanyId)
      ? {
          companyId: branchQueryCompanyId!,
          pageSize: 100,
          status: "active",
        }
      : undefined
  )

  const tokoOptions: TokoOption[] = useMemo(() => {
    if (!branchesData?.data) return []
    return branchesData.data.map((b) => ({
      value: b.uuid,
      label: b.shortName,
    }))
  }, [branchesData])

  // ── Toko selection state (defaults to first Toko) ─────────
  const [selectedToko, setSelectedToko] = useState("")

  useEffect(() => {
    if (tokoOptions.length > 0) {
      // Reset to first toko whenever PT changes (new toko list)
      setSelectedToko(tokoOptions[0]!.value)
    } else {
      setSelectedToko("")
    }
  }, [tokoOptions])

  // ── Handle PT change → reset Toko ─────────────────────────
  const handlePTChange = (value: string) => {
    setSelectedPT(value)
    setSelectedToko("") // Reset toko, will be set by useEffect when branches load
  }

  // ── Build filter for dashboard data queries ───────────────
  const dashboardFilter = useMemo(() => {
    const filter: Record<string, string> = {}
    if (selectedPT) {
      filter.companyId = selectedPT
    }
    if ((isSuperAdmin || isCompanyAdmin) && selectedToko) {
      filter.branchId = selectedToko
    }
    if (date) {
      filter.date = date.toISOString().split("T")[0]! // YYYY-MM-DD
    }
    return filter
  }, [isSuperAdmin, isCompanyAdmin, selectedPT, selectedToko, date])

  // ── API Hooks ──────────────────────────────────────────────
  const { data: kpis, isLoading: kpisLoading } =
    useDashboardKpis(dashboardFilter)
  const { data: spkByStatus, isLoading: spkByStatusLoading } =
    useSpkByStatusChart(dashboardFilter)
  const { data: mutationTrends, isLoading: mutationTrendsLoading } =
    useMutationTrends(30, dashboardFilter)

  // ── SPK List (recent: active + draft, limited) ───────────────
  const spkListOptions = useMemo(
    () => ({
      page: 1,
      pageSize: 10,
      filter: {
        ...(selectedPT && { ptId: selectedPT }),
        ...(selectedToko && { branchId: selectedToko }),
      },
      sortBy: "createdAt",
      order: "DESC" as const,
    }),
    [selectedPT, selectedToko]
  )
  const { data: spkListData, isLoading: spkListLoading } = useSpkList(
    selectedPT || selectedToko ? spkListOptions : undefined
  )

  // ── SPK Overdue (jatuh tempo) ─────────────────────────────────
  const spkOverdueOptions = useMemo(
    () => ({
      page: 1,
      pageSize: 10,
      filter: {
        status: "overdue" as const,
        ...(selectedPT && { ptId: selectedPT }),
        ...(selectedToko && { branchId: selectedToko }),
      },
      sortBy: "dueDate",
      order: "ASC" as const,
    }),
    [selectedPT, selectedToko]
  )
  const { data: spkOverdueData, isLoading: spkOverdueLoading } = useSpkList(
    selectedPT || selectedToko ? spkOverdueOptions : undefined
  )

  // ── NKB List (recent, limited) ────────────────────────────────
  const nkbListOptions = useMemo(
    () => ({
      page: 1,
      pageSize: 10,
      filter: {
        ...(selectedPT && { ptId: selectedPT }),
        ...(selectedToko && { branchId: selectedToko }),
      },
      sortBy: "createdAt",
      order: "DESC" as const,
    }),
    [selectedPT, selectedToko]
  )
  const { data: nkbListData, isLoading: nkbListLoading } = useNkbList(
    selectedPT || selectedToko ? nkbListOptions : undefined
  )

  // ── Metrics derived from KPI API ──────────────────────────
  const metrics = [
    {
      title: "SPK Aktif",
      value: kpisLoading ? "..." : String(kpis?.activeSpkCount ?? 0),
      icon: imgMetricsDashboard1,
    },
    {
      title: "SPK Jatuh Tempo (Overdue)",
      value: kpisLoading ? "..." : String(kpis?.overdueSpkCount ?? 0),
      icon: imgMetricsDashboard2,
    },
    {
      title: "NKB Bulan Ini",
      value: kpisLoading ? "..." : String(kpis?.nkbCountThisMonth ?? 0),
      icon: imgMetricsDashboard3,
    },
    {
      title: "Total Saldo Kas",
      value: kpisLoading
        ? "..."
        : new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            notation: "compact",
          }).format(kpis?.totalBalance ?? 0),
      icon: imgMetricsDashboard4,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        selectedPT={selectedPT}
        selectedToko={selectedToko}
        date={date}
        onPTChange={handlePTChange}
        onTokoChange={setSelectedToko}
        onDateChange={setDate}
        showPTFilter={isSuperAdmin}
        showTokoFilter={isSuperAdmin || isCompanyAdmin}
        ptOptions={ptOptions}
        tokoOptions={tokoOptions}
        isLoadingPT={companiesLoading}
        isLoadingToko={branchesLoading}
      />

      <MetricsGrid metrics={metrics} />

      <div className="grid gap-4 md:grid-cols-2">
        <SPKOverdueChartCard
          data={spkByStatus}
          isLoading={spkByStatusLoading}
        />
        <TrenBarangGadaiChartCard
          data={mutationTrends}
          isLoading={mutationTrendsLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SPKBaruTable data={spkListData?.data} isLoading={spkListLoading} />
        <NKBBaruTable data={nkbListData?.data} isLoading={nkbListLoading} />
      </div>

      <SPKJatuhTempoTable
        data={spkOverdueData?.data}
        isLoading={spkOverdueLoading}
      />
    </div>
  )
}
