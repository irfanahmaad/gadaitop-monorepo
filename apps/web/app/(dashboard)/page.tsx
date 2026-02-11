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

import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { useAuth } from "@/lib/react-query/hooks/use-auth"

export default function Page() {
  const { user } = useAuth()

  // ── Determine if user is Super Admin (owner) ──────────────
  const isSuperAdmin = useMemo(() => {
    return user?.roles?.some((role) => role.code === "owner") ?? false
  }, [user])

  // ── Date state ────────────────────────────────────────────
  const [date, setDate] = useState<Date>(new Date())

  // ── Fetch companies (PT) for Super Admin ──────────────────
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

  // ── PT selection state (defaults to first PT) ─────────────
  const [selectedPT, setSelectedPT] = useState("")

  useEffect(() => {
    if (ptOptions.length > 0 && !selectedPT) {
      setSelectedPT(ptOptions[0]!.value)
    }
  }, [ptOptions, selectedPT])

  // ── Fetch branches (Toko) filtered by selected PT ─────────
  const { data: branchesData, isLoading: branchesLoading } = useBranches(
    isSuperAdmin && selectedPT
      ? { companyId: selectedPT, pageSize: 100, status: "active" }
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
    if (isSuperAdmin && selectedPT) {
      filter.companyId = selectedPT
    }
    if (isSuperAdmin && selectedToko) {
      filter.branchId = selectedToko
    }
    if (date) {
      filter.date = date.toISOString().split("T")[0]! // YYYY-MM-DD
    }
    return filter
  }, [isSuperAdmin, selectedPT, selectedToko, date])

  // ── API Hooks ──────────────────────────────────────────────
  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis(dashboardFilter)
  const { data: spkByStatus, isLoading: spkByStatusLoading } =
    useSpkByStatusChart(dashboardFilter)
  const { data: mutationTrends, isLoading: mutationTrendsLoading } =
    useMutationTrends(30, dashboardFilter)

  // ── Dummy Data ──────────────────────────────────────────────
  const DUMMY_NEW_SPK: any[] = [
    {
      id: "1",
      spkNumber: "SPK-2024001",
      principalAmount: 5000000,
      customer: { fullName: "Budi Santoso" },
      status: "active",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      spkNumber: "SPK-2024002",
      principalAmount: 3500000,
      customer: { fullName: "Siti Aminah" },
      status: "active",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      spkNumber: "SPK-2024003",
      principalAmount: 15000000,
      customer: { fullName: "Ahmad Rizki" },
      status: "draft",
      createdAt: new Date().toISOString(),
    },
  ]

  const DUMMY_OVERDUE_SPK: any[] = [
    {
      id: "4",
      spkNumber: "SPK-2023098",
      totalAmount: 5500000,
      tenor: 30,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
      customer: { fullName: "Dewi Lestari", ktpPhotoUrl: "" },
      status: "overdue",
    },
    {
      id: "5",
      spkNumber: "SPK-2023095",
      totalAmount: 2750000,
      tenor: 30,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      customer: { fullName: "Eko Prasetyo", ktpPhotoUrl: "" },
      status: "overdue",
    },
  ]

  const DUMMY_NEW_NKB: any[] = [
    {
      id: "1",
      nkbNumber: "NKB-2024001",
      amount: 500000,
      type: "partial_payment",
      status: "confirmed",
    },
    {
      id: "2",
      nkbNumber: "NKB-2024002",
      amount: 200000,
      type: "extension",
      status: "pending",
    },
    {
      id: "3",
      nkbNumber: "NKB-2024003",
      amount: 1500000,
      type: "redemption",
      status: "confirmed",
    },
  ]

  // Recent SPK (sorted newest first, limited for dashboard)
  const spkListData = { data: DUMMY_NEW_SPK }
  const spkListLoading = false

  // SPK with overdue status (jatuh tempo)
  const spkOverdueData = { data: DUMMY_OVERDUE_SPK }
  const spkOverdueLoading = false

  // Recent NKB (sorted newest first, limited for dashboard)
  const nkbListData = { data: DUMMY_NEW_NKB }
  const nkbListLoading = false

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
        showFilters={isSuperAdmin}
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
        <SPKBaruTable
          data={spkListData?.data}
          isLoading={spkListLoading}
        />
        <NKBBaruTable
          data={nkbListData?.data}
          isLoading={nkbListLoading}
        />
      </div>

      <SPKJatuhTempoTable
        data={spkOverdueData?.data}
        isLoading={spkOverdueLoading}
      />
    </div>
  )
}
