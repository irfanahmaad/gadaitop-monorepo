"use client"

import React, { useMemo, useState, Suspense, useEffect } from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Plus } from "lucide-react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs"
import { useFilterParams } from "@/hooks/use-filter-params"
import { FilterDialog } from "@/components/filter-dialog"
import { RequestTambahModalTable } from "./_components/request-tambah-modal-table"
import { HistoryTambahModalTable } from "./_components/history-tambah-modal-table"
import { SetujuiRequestDialog } from "./_components/setujui-request-dialog"
import { TolakRequestDialog } from "./_components/tolak-request-dialog"
import { TambahDataDialog } from "./_components/tambah-data-dialog"
import { EditRequestDialog } from "./_components/edit-request-dialog"
import { TAMBAH_MODAL_FILTER_CONFIG } from "./_components/filter-config"
import type { RequestTambahModal } from "./_components/types"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import {
  useCapitalTopups,
  useApproveCapitalTopup,
  useRejectCapitalTopup,
  useCreateCapitalTopup,
  useUpdateCapitalTopup,
} from "@/lib/react-query/hooks/use-capital-topups"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import type { CapitalTopup } from "@/lib/api/types"
import { toast } from "sonner"

const STATUS_MAP: Record<CapitalTopup["status"], RequestTambahModal["status"]> =
  {
    pending: "Pending",
    approved: "Disetujui",
    rejected: "Ditolak",
    disbursed: "Disetujui",
  }

function mapCapitalTopupToRequest(c: CapitalTopup): RequestTambahModal {
  const createdBy = c.createdBy as { fullName?: string } | undefined
  const store = c.store as
    | { shortName?: string; branchCode?: string; fullName?: string }
    | undefined
  return {
    id: c.uuid,
    uuid: c.uuid,
    tanggalRequest: c.createdAt,
    dilakukanOleh: {
      name: createdBy?.fullName ?? "-",
      avatar: undefined,
    },
    namaToko:
      store?.fullName ?? store?.shortName ?? store?.branchCode ?? c.storeId,
    alias: store?.shortName ?? store?.branchCode ?? "",
    nominal: c.amount,
    status: STATUS_MAP[c.status],
    storeId: c.storeId,
  }
}

function applyTambahModalFilters(
  data: RequestTambahModal[],
  filterValues: Record<string, unknown>
): RequestTambahModal[] {
  let result = [...data]

  const lastUpdate = filterValues.lastUpdate as
    | {
        from: string | null
        to: string | null
      }
    | undefined
  if (lastUpdate?.from || lastUpdate?.to) {
    result = result.filter((row) => {
      const date = row.tanggalRequest.slice(0, 10)
      if (lastUpdate.from && date < lastUpdate.from) return false
      if (lastUpdate.to && date > lastUpdate.to) return false
      return true
    })
  }

  const nominal = filterValues.nominal as
    | {
        from: number | null
        to: number | null
      }
    | undefined
  if (nominal?.from != null || nominal?.to != null) {
    result = result.filter((row) => {
      if (nominal.from != null && row.nominal < nominal.from) return false
      if (nominal.to != null && row.nominal > nominal.to) return false
      return true
    })
  }

  const toko = filterValues.toko as string | undefined
  if (toko && toko !== "__all__") {
    result = result.filter((row) => row.storeId === toko)
  }

  const status = filterValues.status as string | undefined
  if (status && status !== "__all__") {
    result = result.filter((row) => row.status === status)
  }

  return result
}

function TambahModalPageContent() {
  const { user } = useAuth()
  const isCompanyAdmin =
    user?.roles?.some((r) => r.code === "company_admin") ?? false
  const isSuperAdmin = user?.roles?.some((r) => r.code === "owner") ?? false

  const effectiveCompanyId = isCompanyAdmin ? (user?.companyId ?? null) : null

  const { data: companiesData } = useCompanies(
    isSuperAdmin ? { pageSize: 100 } : undefined
  )

  const [selectedPT, setSelectedPT] = useState<string>("")
  const ptOptions = useMemo(() => {
    const list = companiesData?.data ?? []
    return list.map((c) => ({ value: c.uuid, label: c.companyName }))
  }, [companiesData])

  useEffect(() => {
    if (isSuperAdmin && ptOptions.length > 0 && !selectedPT) {
      setSelectedPT(ptOptions[0]!.value)
    }
  }, [isSuperAdmin, ptOptions, selectedPT])

  const branchQueryCompanyId = isSuperAdmin ? selectedPT : effectiveCompanyId
  const { data: branchesData } = useBranches(
    branchQueryCompanyId
      ? { companyId: branchQueryCompanyId, pageSize: 100 }
      : undefined
  )

  const branchOptions = useMemo(() => {
    const list = branchesData?.data ?? []
    return list.map((b) => ({
      value: b.uuid,
      label: b.shortName ?? b.branchCode ?? b.uuid,
    }))
  }, [branchesData])

  const [selectedBranch, setSelectedBranch] = useState<string>("")
  useEffect(() => {
    if (branchOptions.length > 0) {
      setSelectedBranch((prev) => {
        const first = branchOptions[0]!.value
        if (!prev || !branchOptions.some((b) => b.value === prev)) return first
        return prev
      })
    }
  }, [branchOptions])

  const { filterValues, setFilters } = useFilterParams(
    TAMBAH_MODAL_FILTER_CONFIG
  )
  const [activeTab, setActiveTab] = useState("request")
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [historyPageSize, setHistoryPageSize] = useState(100)
  const [historySearchValue, setHistorySearchValue] = useState("")
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [setujuiDialogOpen, setSetujuiDialogOpen] = useState(false)
  const [setujuiRow, setSetujuiRow] = useState<RequestTambahModal | null>(null)
  const [tolakDialogOpen, setTolakDialogOpen] = useState(false)
  const [tolakRow, setTolakRow] = useState<RequestTambahModal | null>(null)
  const [tambahDataDialogOpen, setTambahDataDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editRow, setEditRow] = useState<RequestTambahModal | null>(null)

  const requestListOptions = useMemo(() => {
    const filter: Record<string, string> = { status: "pending" }
    if (selectedBranch) filter.storeId = selectedBranch
    return { page: 1, pageSize: 200, filter }
  }, [selectedBranch])

  const historyListOptions = useMemo(() => {
    const filter: Record<string, string> = {}
    if (selectedBranch) filter.storeId = selectedBranch
    return { page: 1, pageSize: 200, filter }
  }, [selectedBranch])

  const { data: requestData, isLoading: isLoadingRequest } =
    useCapitalTopups(requestListOptions)
  const { data: historyData, isLoading: isLoadingHistory } =
    useCapitalTopups(historyListOptions)

  const approveMutation = useApproveCapitalTopup()
  const rejectMutation = useRejectCapitalTopup()
  const createMutation = useCreateCapitalTopup()
  const updateMutation = useUpdateCapitalTopup()

  const requestRows = useMemo(() => {
    const list = requestData?.data ?? []
    return list
      .filter((c) => c.status === "pending")
      .map(mapCapitalTopupToRequest)
  }, [requestData])

  const historyRows = useMemo(() => {
    const list = historyData?.data ?? []
    return list
      .filter((c) => c.status !== "pending")
      .map(mapCapitalTopupToRequest)
  }, [historyData])

  const filteredRequestData = useMemo(
    () => applyTambahModalFilters(requestRows, filterValues),
    [requestRows, filterValues]
  )
  const filteredHistoryData = useMemo(
    () => applyTambahModalFilters(historyRows, filterValues),
    [historyRows, filterValues]
  )

  const pendingCount = requestRows.length

  const handleApprove = (row: RequestTambahModal) => {
    setSetujuiRow(row)
    setSetujuiDialogOpen(true)
  }

  const handleReject = (row: RequestTambahModal) => {
    setTolakRow(row)
    setTolakDialogOpen(true)
  }

  const handleSetujuiConfirm = async (
    row: RequestTambahModal,
    _data: { buktiTransfer?: File; catatan: string }
  ) => {
    try {
      await approveMutation.mutateAsync(row.uuid)
      toast.success("Request berhasil disetujui")
      setSetujuiDialogOpen(false)
      setSetujuiRow(null)
    } catch {
      toast.error("Gagal menyetujui request")
      throw new Error("Approve failed")
    }
  }

  const handleTolakConfirm = async (
    row: RequestTambahModal,
    data: { catatan: string }
  ) => {
    try {
      await rejectMutation.mutateAsync({
        id: row.uuid,
        data: { reason: data.catatan || "Ditolak" },
      })
      toast.success("Request berhasil ditolak")
      setTolakDialogOpen(false)
      setTolakRow(null)
    } catch {
      toast.error("Gagal menolak request")
      throw new Error("Reject failed")
    }
  }

  const handleDetail = (row: RequestTambahModal) => {
    console.log("Detail:", row)
  }

  const handleEdit = (row: RequestTambahModal) => {
    setEditRow(row)
    setEditDialogOpen(true)
  }

  const handleTambahData = () => {
    setTambahDataDialogOpen(true)
  }

  const handleTambahDataConfirm = async (data: {
    nominal: number
    storeId?: string
  }) => {
    const storeId = data.storeId ?? selectedBranch ?? branchOptions[0]?.value
    if (!storeId) {
      toast.error("Pilih toko terlebih dahulu")
      return
    }
    try {
      await createMutation.mutateAsync({
        storeId,
        amount: data.nominal,
      })
      toast.success("Request tambah modal berhasil dibuat")
      setTambahDataDialogOpen(false)
    } catch {
      toast.error("Gagal membuat request")
      throw new Error("Create failed")
    }
  }

  const handleEditConfirm = async (
    row: RequestTambahModal,
    data: { nominal: number }
  ) => {
    try {
      await updateMutation.mutateAsync({
        id: row.uuid,
        data: { amount: data.nominal },
      })
      toast.success("Request berhasil diubah")
      setEditDialogOpen(false)
      setEditRow(null)
    } catch {
      toast.error("Gagal mengubah request")
      throw new Error("Update failed")
    }
  }

  const handleDelete = (row: RequestTambahModal) => {
    console.log("Delete:", row)
  }

  const filterConfigWithBranches = useMemo(() => {
    const base = [...TAMBAH_MODAL_FILTER_CONFIG]
    const tokoIdx = base.findIndex((f) => f.key === "toko")
    if (tokoIdx >= 0 && branchOptions.length > 0) {
      base[tokoIdx] = {
        ...base[tokoIdx]!,
        options: [
          { value: "__all__", label: "Semua" },
          ...branchOptions.map((b) => ({ value: b.value, label: b.label })),
        ],
      }
    }
    return base
  }, [branchOptions])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Tambah Modal</h1>
          <Breadcrumbs
            items={[{ label: "Pages", href: "/" }, { label: "Tambah Modal" }]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isSuperAdmin && ptOptions.length > 0 && (
            <Select value={selectedPT} onValueChange={setSelectedPT}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih PT" />
              </SelectTrigger>
              <SelectContent>
                {ptOptions.map((pt) => (
                  <SelectItem key={pt.value} value={pt.value}>
                    {pt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isSuperAdmin && branchOptions.length > 0 && (
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Toko" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {!isCompanyAdmin && (
            <Button
              onClick={handleTambahData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Data
            </Button>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-4"
      >
        <TabsList className="w-fit">
          <TabsTrigger value="request" className="relative">
            Request Tambah Modal
            <Badge
              variant="secondary"
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 ml-2 rounded-full px-2 py-0"
            >
              {pendingCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history">History Tambah Modal</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="mt-0">
          <RequestTambahModalTable
            data={filteredRequestData}
            isLoading={isLoadingRequest}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onOpenFilter={() => setFilterDialogOpen(true)}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={handleEdit}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <HistoryTambahModalTable
            data={filteredHistoryData}
            isLoading={isLoadingHistory}
            pageSize={historyPageSize}
            onPageSizeChange={setHistoryPageSize}
            searchValue={historySearchValue}
            onSearchChange={setHistorySearchValue}
            onOpenFilter={() => setFilterDialogOpen(true)}
            onDetail={handleDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filterConfig={filterConfigWithBranches}
        filterValues={filterValues}
        onFilterChange={setFilters}
      />

      <SetujuiRequestDialog
        open={setujuiDialogOpen}
        onOpenChange={setSetujuiDialogOpen}
        row={setujuiRow}
        onConfirm={handleSetujuiConfirm}
        isSubmitting={approveMutation.isPending}
      />

      <TolakRequestDialog
        open={tolakDialogOpen}
        onOpenChange={setTolakDialogOpen}
        row={tolakRow}
        onConfirm={handleTolakConfirm}
        isSubmitting={rejectMutation.isPending}
      />

      <TambahDataDialog
        open={tambahDataDialogOpen}
        onOpenChange={setTambahDataDialogOpen}
        onConfirm={handleTambahDataConfirm}
        isSubmitting={createMutation.isPending}
        branchOptions={branchOptions}
        selectedBranch={selectedBranch}
      />

      <EditRequestDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        row={editRow}
        onConfirm={handleEditConfirm}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  )
}

export default function TambahModalPage() {
  return (
    <Suspense fallback={<div className="flex flex-col gap-6">Loading...</div>}>
      <TambahModalPageContent />
    </Suspense>
  )
}
