"use client"

import React, { useMemo, useState, Suspense } from "react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
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

const PENDING_COUNT = 5

const sampleRequestTambahModal: RequestTambahModal[] = [
  {
    id: "1",
    tanggalRequest: "2025-11-20T18:33:45",
    dilakukanOleh: { name: "Ben Affleck", avatar: "/placeholder-avatar.jpg" },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 50_000_000,
    status: "Pending",
  },
  {
    id: "2",
    tanggalRequest: "2025-11-20T18:33:45",
    dilakukanOleh: { name: "Ben Affleck", avatar: "/placeholder-avatar.jpg" },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 50_000_000,
    status: "Pending",
  },
  {
    id: "3",
    tanggalRequest: "2025-11-20T18:33:45",
    dilakukanOleh: { name: "Ben Affleck", avatar: "/placeholder-avatar.jpg" },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 50_000_000,
    status: "Pending",
  },
  {
    id: "4",
    tanggalRequest: "2025-11-20T18:33:45",
    dilakukanOleh: { name: "Ben Affleck", avatar: "/placeholder-avatar.jpg" },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 50_000_000,
    status: "Pending",
  },
  {
    id: "5",
    tanggalRequest: "2025-11-20T18:33:45",
    dilakukanOleh: { name: "Ben Affleck", avatar: "/placeholder-avatar.jpg" },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 50_000_000,
    status: "Pending",
  },
]

const sampleHistoryTambahModal: RequestTambahModal[] = [
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `h-${i + 1}`,
    tanggalRequest: "2025-11-20T18:33:45",
    dilakukanOleh: {
      name: "Ben Affleck",
      avatar: "/placeholder-avatar.jpg",
    },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 50_000_000,
    status: "Disetujui" as const,
  })),
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `h-${9 + i}`,
    tanggalRequest: "2025-11-20T18:33:45",
    dilakukanOleh: {
      name: "Ben Affleck",
      avatar: "/placeholder-avatar.jpg",
    },
    namaToko: "GT Jakarta Satu",
    alias: "GT Satu",
    nominal: 50_000_000,
    status: "Ditolak" as const,
  })),
]

function applyTambahModalFilters(
  data: RequestTambahModal[],
  filterValues: Record<string, unknown>
): RequestTambahModal[] {
  let result = [...data]

  const lastUpdate = filterValues.lastUpdate as {
    from: string | null
    to: string | null
  } | undefined
  if (lastUpdate?.from || lastUpdate?.to) {
    result = result.filter((row) => {
      const date = row.tanggalRequest.slice(0, 10)
      if (lastUpdate.from && date < lastUpdate.from) return false
      if (lastUpdate.to && date > lastUpdate.to) return false
      return true
    })
  }

  const nominal = filterValues.nominal as {
    from: number | null
    to: number | null
  } | undefined
  if (nominal?.from != null || nominal?.to != null) {
    result = result.filter((row) => {
      if (nominal.from != null && row.nominal < nominal.from) return false
      if (nominal.to != null && row.nominal > nominal.to) return false
      return true
    })
  }

  const toko = filterValues.toko as string | undefined
  if (toko && toko !== "__all__") {
    const normalized = toko.toLowerCase().replace(/\s+/g, "-")
    result = result.filter((row) => {
      const rowNorm = row.namaToko.toLowerCase().replace(/\s+/g, "-")
      return rowNorm === normalized || row.alias?.toLowerCase() === normalized
    })
  }

  const status = filterValues.status as string | undefined
  if (status && status !== "__all__") {
    result = result.filter((row) => row.status === status)
  }

  return result
}

function TambahModalPageContent() {
  const { filterValues, setFilters } = useFilterParams(TAMBAH_MODAL_FILTER_CONFIG)
  const [activeTab, setActiveTab] = useState("request")
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [historyPageSize, setHistoryPageSize] = useState(100)
  const [historySearchValue, setHistorySearchValue] = useState("")
  const [isLoading] = useState(false)
  const [isHistoryLoading] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [setujuiDialogOpen, setSetujuiDialogOpen] = useState(false)
  const [setujuiRow, setSetujuiRow] = useState<RequestTambahModal | null>(null)
  const [tolakDialogOpen, setTolakDialogOpen] = useState(false)
  const [tolakRow, setTolakRow] = useState<RequestTambahModal | null>(null)
  const [isSetujuiSubmitting, setIsSetujuiSubmitting] = useState(false)
  const [isTolakSubmitting, setIsTolakSubmitting] = useState(false)
  const [tambahDataDialogOpen, setTambahDataDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editRow, setEditRow] = useState<RequestTambahModal | null>(null)
  const [isTambahDataSubmitting, setIsTambahDataSubmitting] = useState(false)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  const filteredRequestData = useMemo(
    () => applyTambahModalFilters(sampleRequestTambahModal, filterValues),
    [filterValues]
  )
  const filteredHistoryData = useMemo(
    () => applyTambahModalFilters(sampleHistoryTambahModal, filterValues),
    [filterValues]
  )

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
    data: { buktiTransfer: File; catatan: string }
  ) => {
    setIsSetujuiSubmitting(true)
    try {
      console.log("Setujui:", row, data)
      // TODO: wire to API, e.g. await approveRequest(row.id, data)
    } finally {
      setIsSetujuiSubmitting(false)
    }
  }

  const handleTolakConfirm = async (
    row: RequestTambahModal,
    data: { catatan: string }
  ) => {
    setIsTolakSubmitting(true)
    try {
      console.log("Tolak:", row, data)
      // TODO: wire to API, e.g. await rejectRequest(row.id, data)
    } finally {
      setIsTolakSubmitting(false)
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

  const handleTambahDataConfirm = async (data: { nominal: number }) => {
    setIsTambahDataSubmitting(true)
    try {
      console.log("Tambah Data:", data)
      // TODO: wire to API, e.g. await createRequest(data)
    } finally {
      setIsTambahDataSubmitting(false)
    }
  }

  const handleEditConfirm = async (
    row: RequestTambahModal,
    data: { nominal: number }
  ) => {
    setIsEditSubmitting(true)
    try {
      console.log("Edit:", row, data)
      // TODO: wire to API, e.g. await updateRequest(row.id, data)
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleDelete = (row: RequestTambahModal) => {
    console.log("Delete:", row)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Tambah Modal</h1>
          <Breadcrumbs
            items={[{ label: "Pages", href: "/" }, { label: "Tambah Modal" }]}
          />
        </div>

        {/* Tambah Data Button */}
        <Button
          onClick={handleTambahData}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Data
        </Button>
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
              className="ml-2 rounded-full bg-destructive/10 px-2 py-0 text-destructive hover:bg-destructive/20"
            >
              {PENDING_COUNT}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history">History Tambah Modal</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="mt-0">
          <RequestTambahModalTable
            data={filteredRequestData}
            isLoading={isLoading}
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
            isLoading={isHistoryLoading}
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
        filterConfig={TAMBAH_MODAL_FILTER_CONFIG}
        filterValues={filterValues}
        onFilterChange={setFilters}
      />

      <SetujuiRequestDialog
        open={setujuiDialogOpen}
        onOpenChange={setSetujuiDialogOpen}
        row={setujuiRow}
        onConfirm={handleSetujuiConfirm}
        isSubmitting={isSetujuiSubmitting}
      />

      <TolakRequestDialog
        open={tolakDialogOpen}
        onOpenChange={setTolakDialogOpen}
        row={tolakRow}
        onConfirm={handleTolakConfirm}
        isSubmitting={isTolakSubmitting}
      />

      <TambahDataDialog
        open={tambahDataDialogOpen}
        onOpenChange={setTambahDataDialogOpen}
        onConfirm={handleTambahDataConfirm}
        isSubmitting={isTambahDataSubmitting}
      />

      <EditRequestDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        row={editRow}
        onConfirm={handleEditConfirm}
        isSubmitting={isEditSubmitting}
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
