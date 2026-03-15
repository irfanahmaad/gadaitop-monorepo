"use client"

import React, { useState, Suspense, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs"
import { Input } from "@workspace/ui/components/input"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  SearchIcon,
  SlidersHorizontal,
  Plus,
  Eye,
  // Printer,
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import type { AuctionBatch, PawnTerm, Spk } from "@/lib/api/types"
import type { FilterConfig } from "@/hooks/use-filter-params"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import {
  auctionBatchKeys,
  useAuctionBatches,
  useBulkDeleteAuctionBatches,
  useCancelAuctionBatch,
  useCreateAuctionBatch,
  useDeleteAuctionBatch,
} from "@/lib/react-query/hooks/use-auction-batches"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useSpkList, spkKeys } from "@/lib/react-query/hooks/use-spk"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { usePawnTerms } from "@/lib/react-query/hooks/use-pawn-terms"
import { matchSpkItemToMataRules } from "@/lib/utils/mata-rule-matcher"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CreateBatchDialog } from "@/app/(dashboard)/lelangan/_components/CreateBatchDialog"
import { useAppAbility } from "@/lib/casl/context"
import { AclAction, AclSubject } from "@/lib/casl/types"
import { cn } from "@workspace/ui/lib/utils"

// Types for SPK Jatuh Tempo (flattened from overdue SPK items)
type ItemLelang = {
  id: string
  spkItemId: string
  spkId: string
  storeId: string
  ptId: string
  foto: string
  noSPK: string
  namaBarang: string
  namaNasabah: string
  tipeBarang: string
  toko: string
  petugas: string
  tanggalJatuhTempo: string
  status: "Jatuh Tempo" | "Ready for Lelang"
  lastUpdatedAt: "Belum Terscan" | "Terscan"
  isMata: boolean
  mataRuleName?: string
}

// Types for Batch Lelang SPK
type BatchLelang = {
  id: string
  idBatch: string
  namaBatch: string
  jumlahItem: number
  tanggalWaktu: string
  lastUpdatedAt: string
  status: BatchStatus
  toko?: string
  penanggungJawab: string
  progressDiambil: number
  progressValidasi: number
  rawStatus: string
  updatedAtRaw?: string
  isMata?: boolean
}

type BatchStatus =
  | "Draft"
  | "Didistribusikan"
  | "Diambil"
  | "Validasi"
  | "Siap Lelang"
  | "OK by Admin"
  | "Dibatalkan"

function mapBatchStatus(status: string): BatchStatus {
  const map: Record<string, BatchStatus> = {
    draft: "Draft",
    assigned: "Didistribusikan",
    pickup_in_progress: "Diambil",
    validation_pending: "Validasi",
    ready_for_auction: "Siap Lelang",
    finalized: "OK by Admin",
    cancelled: "Dibatalkan",
  }
  return map[status] ?? "Draft"
}

function getAssigneesDisplay(
  marketingStaff?: { fullName?: string; name?: string }[],
  auctionStaff?: { fullName?: string; name?: string }[]
): string {
  const names: string[] = []
  for (const a of marketingStaff ?? []) {
    const n = a.fullName ?? a.name
    if (n) names.push(n)
  }
  for (const a of auctionStaff ?? []) {
    const n = a.fullName ?? a.name
    if (n) names.push(n)
  }
  return names.length ? [...new Set(names)].join(", ") : "-"
}

function mapAuctionBatchToBatchLelang(batch: AuctionBatch): BatchLelang {
  const items = batch.items ?? []
  const itemCount = items.length
  const pickedUp = items.filter(
    (i) =>
      i.pickedUp === true ||
      (i as { pickupStatus?: string }).pickupStatus === "taken" ||
      (i as { pickupStatus?: string }).pickupStatus === "picked_up" ||
      (i as { pickupStatus?: string }).pickupStatus === "completed"
  ).length
  const validated = items.filter(
    (i) =>
      i.validated === true ||
      !!(i as { validationVerdict?: string }).validationVerdict
  ).length
  const updatedAt = batch.updatedAt ?? batch.createdAt ?? null
  const scheduledDate = batch.scheduledDate
  const hasMataItems = false
  return {
    id: batch.uuid,
    idBatch: batch.batchCode,
    namaBatch: batch.name ?? batch.batchCode,
    jumlahItem: itemCount,
    tanggalWaktu: scheduledDate
      ? format(new Date(scheduledDate), "d MMM yyyy HH:mm", { locale: id })
      : "-",
    lastUpdatedAt: updatedAt
      ? format(new Date(updatedAt), "d MMMM yyyy HH:mm:ss", { locale: id })
      : "-",
    status: mapBatchStatus(batch.status),
    toko: batch.store?.shortName,
    penanggungJawab: getAssigneesDisplay(
      batch.marketingStaff,
      batch.auctionStaff
    ),
    progressDiambil: pickedUp,
    progressValidasi: validated,
    rawStatus: batch.status,
    updatedAtRaw: updatedAt ?? undefined,
    isMata: hasMataItems,
  }
}

function flattenOverdueSpkToItemLelang(
  spkList: Spk[],
  pawnTerms: PawnTerm[] = []
): ItemLelang[] {
  const rows: ItemLelang[] = []
  for (const spk of spkList) {
    const items = spk.items ?? []
    const storeShortName =
      (spk.store as { shortName?: string })?.shortName ?? "-"
    const ptId = spk.ptId ?? ""
    const storeId = spk.storeId ?? ""
    const namaNasabah =
      (spk.customer as { name?: string })?.name ?? "-"
    const dueDate = spk.dueDate
      ? format(new Date(spk.dueDate), "d MMM yyyy", { locale: id })
      : "-"
    const petugas =
      typeof spk.createdBy === "object" && spk.createdBy != null
        ? (spk.createdBy as { fullName?: string; name?: string }).fullName ??
          (spk.createdBy as { name?: string }).name ??
          "-"
        : "Staff"

    for (const item of items) {
      if (item.status !== "in_storage") continue

      const photoUrl =
        item.evidencePhotos?.[0] ??
        (item as { photoUrl?: string }).photoUrl ??
        ""
      const typeName = (item.itemType as { typeName?: string })?.typeName ?? "-"
      const mataResult = matchSpkItemToMataRules(item, pawnTerms, ptId)

      rows.push({
        id: item.uuid,
        spkItemId: item.uuid,
        spkId: spk.uuid,
        storeId,
        ptId,
        foto: photoUrl,
        noSPK: spk.spkNumber,
        namaBarang: item.description,
        namaNasabah,
        tipeBarang: typeName,
        toko: storeShortName,
        petugas,
        tanggalJatuhTempo: dueDate,
        status: "Jatuh Tempo",
        lastUpdatedAt: "Belum Terscan",
        isMata: mataResult.isMata,
        mataRuleName: mataResult.mataRuleName,
      })
    }
  }
  return rows
}

// Status badge component for Batch Lelang (labels per design: Menunggu, Diambil, Tervalidasi, Berjalan)
const BatchStatusBadge = ({ status }: { status: BatchStatus }) => {
  const statusConfig: Record<
    BatchStatus,
    { label: string; className: string }
  > = {
    Draft: {
      label: "Menunggu",
      className:
        "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    },
    Didistribusikan: {
      label: "Menunggu",
      className:
        "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    },
    Diambil: {
      label: "Diambil",
      className:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    Validasi: {
      label: "Berjalan",
      className:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    "Siap Lelang": {
      label: "Tervalidasi",
      className:
        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    "OK by Admin": {
      label: "Tervalidasi",
      className:
        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    Dibatalkan: {
      label: "Dibatalkan",
      className:
        "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
  }

  const config = statusConfig[status] ?? statusConfig.Draft

  return (
    <Badge variant="outline" className={cn(``, config?.className)}>
      {config.label}
    </Badge>
  )
}

// Column definitions for SPK Jatuh Tempo
const itemLelangColumns: ColumnDef<ItemLelang>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "no",
    header: "No",
    cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "foto",
    header: "Foto",
    cell: ({ row }) => (
      <Avatar className="h-10 w-10">
        <AvatarImage src={row.getValue("foto")} alt="Item photo" />
        <AvatarFallback>IMG</AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: "noSPK",
    header: "No. SPK",
    cell: ({ row }) => {
      const isMata = row.original.isMata
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("noSPK")}</span>
          {isMata && (
            <Eye className="text-destructive size-4 shrink-0" aria-hidden />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "namaBarang",
    header: "Nama Barang",
  },
  {
    accessorKey: "tipeBarang",
    header: "Tipe Barang",
  },
  {
    accessorKey: "toko",
    header: "Toko",
  },
  {
    accessorKey: "petugas",
    header: "Petugas",
  },
  {
    accessorKey: "tanggalJatuhTempo",
    header: "Tanggal Jatuh Tempo",
  },
]

// Column definitions for Batch Lelang SPK
const batchLelangColumns: ColumnDef<BatchLelang>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const p = table.getState().pagination
      const no = (p.pageIndex * p.pageSize) + row.index + 1
      return <span className="text-sm">{no}</span>
    },
    enableSorting: false,
  },
  {
    accessorKey: "idBatch",
    header: "ID Batch",
  },
  {
    accessorKey: "namaBatch",
    header: "Nama Batch",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <BatchStatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "penanggungJawab",
    header: "Penanggung Jawab",
  },
  {
    accessorKey: "toko",
    header: "Toko",
  },
  {
    accessorKey: "tanggalWaktu",
    header: "Tanggal & Waktu",
  },
  {
    accessorKey: "jumlahItem",
    header: "Jumlah Item",
  },
  {
    accessorKey: "lastUpdatedAt",
    header: "Last Updated At",
  },
]

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LelangPageContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const ability = useAppAbility()
  const { user } = useAuth()
  const isCompanyAdmin =
    user?.roles?.some((r) => r.code === "company_admin") ?? false
  const isSuperAdmin = user?.roles?.some((r) => r.code === "owner") ?? false

  const effectiveCompanyId = isCompanyAdmin ? (user?.companyId ?? null) : null
  const canCreateBatch = ability.can(AclAction.CREATE, AclSubject.AUCTION_BATCH)
  const canUpdateBatch = ability.can(AclAction.UPDATE, AclSubject.AUCTION_BATCH)
  const canDeleteBatch = ability.can(AclAction.DELETE, AclSubject.AUCTION_BATCH)

  const { data: companiesData } = useCompanies(
    isSuperAdmin ? { pageSize: 100 } : undefined
  )

  const [selectedPT, setSelectedPT] = useState<string>("")
  const ptOptions = React.useMemo(() => {
    const list = companiesData?.data ?? []
    return list.map((c) => ({ value: c.uuid, label: c.companyName }))
  }, [companiesData])

  useEffect(() => {
    if (isSuperAdmin && ptOptions.length > 0 && !selectedPT) {
      setSelectedPT(ptOptions[0]!.value)
    }
  }, [isSuperAdmin, ptOptions, selectedPT])

  const companyFilterId = isSuperAdmin ? selectedPT : effectiveCompanyId

  const pawnTermsOptions = React.useMemo(
    () =>
      companyFilterId
        ? { pageSize: 200, filter: { ptId: companyFilterId } }
        : { pageSize: 200 },
    [companyFilterId]
  )
  const { data: pawnTermsData } = usePawnTerms(pawnTermsOptions)
  const pawnTerms = React.useMemo(
    () => pawnTermsData?.data ?? [],
    [pawnTermsData?.data]
  )

  const overdueSpkOptions = React.useMemo(
    () => ({
      page: 1,
      pageSize: 200,
      filter: {
        status: "overdue",
        excludeInAuctionBatch: "true",
      } as Record<string, string>,
    }),
    []
  )

  const {
    data: overdueSpkData,
    isLoading: isOverdueSpkLoading,
    isError: isOverdueSpkError,
  } = useSpkList(overdueSpkOptions)

  const itemLelangRows = React.useMemo(() => {
    const list = overdueSpkData?.data ?? []
    return flattenOverdueSpkToItemLelang(list, pawnTerms)
  }, [overdueSpkData, pawnTerms])

  const { data: branchesData } = useBranches(
    companyFilterId ? { companyId: companyFilterId, pageSize: 100 } : undefined,
    { enabled: !!companyFilterId }
  )

  const branchOptions = React.useMemo(() => {
    const list = branchesData?.data ?? []
    const filtered = companyFilterId
      ? list.filter((b) => b.companyId === companyFilterId)
      : list
    return filtered.map((b) => ({ value: b.uuid, label: b.shortName }))
  }, [branchesData, companyFilterId])

  const spkJatuhTempoFilterConfig: FilterConfig[] = React.useMemo(
    () => [
      {
        key: "dateRange",
        label: "Tanggal Jatuh Tempo",
        type: "daterange",
        labelFrom: "Mulai Dari",
        labelTo: "Sampai Dengan",
      },
      {
        key: "tipeBarang",
        label: "Tipe Barang",
        type: "multiselect",
        placeholder: "Pilih tipe barang...",
        options: [
          { label: "Handphone", value: "Handphone" },
          { label: "IoT", value: "IoT" },
          { label: "Laptop", value: "Laptop" },
          { label: "Drone", value: "Drone" },
          { label: "Smartwatch", value: "Smartwatch" },
          { label: "Tablet", value: "Tablet" },
        ],
      },
      {
        key: "toko",
        label: "Toko",
        type: "multiselect",
        placeholder: "Pilih toko...",
        options: branchOptions.map((b) => ({ label: b.label, value: b.label })),
      },
      {
        key: "segmentasi",
        label: "Segmentasi",
        type: "radio",
        radioOptions: [
          { label: "< 1 Bulan", value: "lt_1_bulan" },
          { label: "> 1 Bulan", value: "gt_1_bulan" },
        ],
      },
      {
        key: "mataFilter",
        label: "Prioritas Mata",
        type: "radio",
        radioOptions: [
          { label: "Semua item", value: "all" },
          { label: "Hanya item Mata", value: "mata_only" },
        ],
      },
    ],
    [branchOptions]
  )

  // Filter for Batch Lelang SPK tab only: date range (Mulai Dari / Sampai Dengan) + Toko multi-select
  const batchLelangFilterConfig: FilterConfig[] = React.useMemo(
    () => [
      {
        key: "dateRange",
        label: "Tanggal",
        type: "daterange",
        labelFrom: "Mulai Dari",
        labelTo: "Sampai Dengan",
      },
      {
        key: "toko",
        label: "Toko",
        type: "multiselect",
        placeholder: "Pilih toko...",
        options: branchOptions.map((b) => ({ label: b.label, value: b.label })),
      },
    ],
    [branchOptions]
  )

  const defaultFilterValues: Record<string, unknown> = {
    dateRange: { from: null, to: null },
    tipeBarang: [],
    toko: [],
    segmentasi: null,
    status: [],
    mataFilter: "all",
  }

  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("spk-jatuh-tempo")
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [filterValues, setFilterValues] =
    useState<Record<string, unknown>>(defaultFilterValues)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isBuatBatchDialogOpen, setIsBuatBatchDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<
    ItemLelang | BatchLelang | null
  >(null)
  const [selectedItemLelangRows, setSelectedItemLelangRows] = useState<
    ItemLelang[]
  >([])
  const [selectedBatchRows, setSelectedBatchRows] = useState<BatchLelang[]>([])
  const [batchPage, setBatchPage] = useState(1)
  const [batchPageSize, setBatchPageSize] = useState(10)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)

  const handleDetailItemLelang = React.useCallback(
    (row: ItemLelang) => {
      router.push(`/spk/${row.spkId}`)
    },
    [router]
  )

  const itemLelangCustomActions = React.useMemo(() => [], [])

  const getItemLelangRowClassName = React.useCallback((row: ItemLelang) => {
    return row.isMata ? "bg-red-50 dark:bg-red-950/30" : ""
  }, [])

  const getItemLelangRowTitle = React.useCallback((row: ItemLelang) => {
    return row.isMata && row.mataRuleName
      ? `Prioritas 'Mata': ${row.mataRuleName}`
      : undefined
  }, [])

  const createBatchMutation = useCreateAuctionBatch()

  const filteredItemLelang = React.useMemo(() => {
    let result = [...itemLelangRows]
    if (searchValue) {
      const s = searchValue.toLowerCase()
      result = result.filter(
        (r) =>
          r.noSPK.toLowerCase().includes(s) ||
          r.namaBarang.toLowerCase().includes(s) ||
          r.namaNasabah.toLowerCase().includes(s) ||
          r.tipeBarang.toLowerCase().includes(s) ||
          r.toko.toLowerCase().includes(s)
      )
    }
    const tipeBarang = (filterValues.tipeBarang as string[] | undefined) ?? []
    if (tipeBarang.length) {
      result = result.filter((r) => tipeBarang.includes(r.tipeBarang))
    }
    const toko = (filterValues.toko as string[] | undefined) ?? []
    if (toko.length) {
      result = result.filter((r) => toko.includes(r.toko))
    }
    const mataFilter = filterValues.mataFilter as string | undefined
    if (mataFilter === "mata_only") {
      result = result.filter((r) => r.isMata)
    }
    return result
  }, [itemLelangRows, searchValue, filterValues])

  const batchListOptions = React.useMemo(() => {
    const filter: Record<string, string> = {}
    if (companyFilterId) filter.ptId = companyFilterId
    return {
      page: batchPage,
      pageSize: batchPageSize,
      filter,
    }
  }, [companyFilterId, batchPage, batchPageSize])

  const { data, isLoading, isError } = useAuctionBatches(batchListOptions)
  const cancelBatchMutation = useCancelAuctionBatch()
  const deleteBatchMutation = useDeleteAuctionBatch()
  const bulkDeleteBatchMutation = useBulkDeleteAuctionBatches()

  const batchesFromApi = React.useMemo(() => data?.data ?? [], [data?.data])
  const batchMeta = data?.meta

  const batchRows = React.useMemo(
    () => batchesFromApi.map(mapAuctionBatchToBatchLelang),
    [batchesFromApi]
  )

  const handleDetail = (row: ItemLelang | BatchLelang) => {
    if ("idBatch" in row) {
      router.push(`/lelangan/${row.id}`)
    }
  }

  const handleDelete = (row: ItemLelang | BatchLelang) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }

  const handleBulkDeleteBatches = () => {
    const draftIds = selectedBatchRows
      .filter((b) => b.rawStatus === "draft")
      .map((b) => b.id)
    if (draftIds.length === 0) return
    setIsBulkDeleteDialogOpen(true)
  }

  const handleConfirmBulkDelete = () => {
    const draftIds = selectedBatchRows
      .filter((b) => b.rawStatus === "draft")
      .map((b) => b.id)
    if (draftIds.length === 0) {
      setIsBulkDeleteDialogOpen(false)
      setSelectedBatchRows([])
      return
    }
    bulkDeleteBatchMutation.mutate(draftIds, {
      onSuccess: () => {
        toast.success(`${draftIds.length} batch berhasil dihapus`)
        setIsBulkDeleteDialogOpen(false)
        setSelectedBatchRows([])
      },
      onError: (err) => {
        toast.error(
          (err as { message?: string })?.message ?? "Gagal menghapus batch"
        )
      },
    })
  }

  const handleBuatBatchClick = () => {
    setIsBuatBatchDialogOpen(true)
  }

  const handleConfirmBuatBatch = async (data: {
    storeId: string
    ptId: string
    spkItemIds: string[]
    name?: string
    notes?: string
    marketingStaffIds?: string[]
    auctionStaffIds?: string[]
  }) => {
    try {
      await createBatchMutation.mutateAsync({
        storeId: data.storeId,
        ptId: data.ptId,
        spkItemIds: data.spkItemIds,
        name: data.name,
        notes: data.notes,
        marketingStaffIds: data.marketingStaffIds,
        auctionStaffIds: data.auctionStaffIds,
      })
      toast.success("Batch lelang berhasil dibuat")
      setIsBuatBatchDialogOpen(false)
      setSelectedItemLelangRows([])
      setActiveTab("batch-lelang-spk")
      queryClient.invalidateQueries({ queryKey: spkKeys.lists() })
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal membuat batch lelang"
      )
      throw err
    }
  }

  const handleConfirmDelete = () => {
    if (!itemToDelete) return
    if (!("idBatch" in itemToDelete)) {
      setIsConfirmDialogOpen(false)
      setItemToDelete(null)
      return
    }
    const batchRow = itemToDelete as BatchLelang
    if (batchRow.rawStatus === "draft") {
      deleteBatchMutation.mutate(batchRow.id, {
        onSuccess: () => {
          toast.success("Batch lelang berhasil dihapus")
          setIsConfirmDialogOpen(false)
          setItemToDelete(null)
        },
        onError: (err) => {
          toast.error(
            (err as { message?: string })?.message ?? "Gagal menghapus batch"
          )
        },
      })
    } else {
      cancelBatchMutation.mutate(batchRow.id, {
        onSuccess: () => {
          toast.success("Batch lelang berhasil dibatalkan")
          setIsConfirmDialogOpen(false)
          setItemToDelete(null)
        },
        onError: (err) => {
          toast.error(
            (err as { message?: string })?.message ?? "Gagal membatalkan batch lelang"
          )
        },
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Lelangan</h1>
          <Breadcrumbs
            items={[
              { label: "Lelangan", href: "/lelangan" },
              {
                label:
                  activeTab === "spk-jatuh-tempo"
                    ? "SPK Jatuh Tempo"
                    : "Batch Lelang",
                className: "text-destructive",
              },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isSuperAdmin && ptOptions.length > 0 && (
            <Select value={selectedPT} onValueChange={setSelectedPT}>
              <SelectTrigger className="w-[180px]">
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
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-4"
      >
        <TabsList className="w-fit">
          <TabsTrigger value="spk-jatuh-tempo">SPK Jatuh Tempo</TabsTrigger>
          <TabsTrigger value="batch-lelang-spk">Batch Lelang SPK</TabsTrigger>
        </TabsList>

        {/* SPK Jatuh Tempo Tab */}
        <TabsContent value="spk-jatuh-tempo" className="mt-0">
          {isOverdueSpkLoading ? (
            <TableSkeleton />
          ) : isOverdueSpkError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">
                  Gagal memuat data SPK Jatuh Tempo
                </p>
              </CardContent>
            </Card>
          ) : (
            <DataTable
              columns={itemLelangColumns}
              data={filteredItemLelang}
              title="Daftar SPK Jatuh Tempo"
              searchPlaceholder="Cari"
              onDetail={handleDetailItemLelang}
              // onEdit={handleEditItemLelang}
              headerRight={
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  {canCreateBatch && (
                    <Button
                      type="button"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                      onClick={handleBuatBatchClick}
                      disabled={createBatchMutation.isPending}
                    >
                      <Plus className="size-4" />
                      Buat Batch
                      {selectedItemLelangRows.length > 0 && (
                        <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                          {selectedItemLelangRows.length}
                        </span>
                      )}
                    </Button>
                  )}
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(Number(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="w-full sm:w-auto sm:max-w-sm">
                    <Input
                      placeholder="Cari"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      icon={<SearchIcon className="size-4" />}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setFilterDialogOpen(true)}
                  >
                    <SlidersHorizontal className="size-4" />
                    Filter
                  </Button>
                </div>
              }
              filterConfig={spkJatuhTempoFilterConfig}
              filterValues={filterValues}
              onFilterChange={setFilterValues}
              filterDialogOpen={filterDialogOpen}
              onFilterDialogOpenChange={setFilterDialogOpen}
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              customActions={itemLelangCustomActions}
              getRowClassName={getItemLelangRowClassName}
              getRowTitle={getItemLelangRowTitle}
              onSelectionChange={(rows) => setSelectedItemLelangRows(rows)}
            />
          )}
        </TabsContent>

        {/* Batch Lelang SPK Tab */}
        <TabsContent value="batch-lelang-spk" className="mt-0">
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-destructive">
                  Gagal memuat data Batch Lelang
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile: stacked cards (FR-254) */}
              <div className="space-y-3 md:hidden">
                {batchRows.map((row) => (
                  <Card
                    key={row.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => handleDetail(row)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-medium">{row.namaBatch}</p>
                          <p className="text-muted-foreground text-sm">
                            {row.idBatch} · {row.toko ?? "-"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {row.tanggalWaktu} · {row.jumlahItem} item
                          </p>
                        </div>
                        <BatchStatusBadge status={row.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {batchMeta && batchMeta.count > batchPageSize && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={batchPage <= 1}
                      onClick={() =>
                        setBatchPage((p) => Math.max(1, p - 1))
                      }
                    >
                      Sebelumnya
                    </Button>
                    <span className="text-muted-foreground text-sm">
                      {batchPage} / {Math.ceil(batchMeta.count / batchPageSize) || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        batchPage >=
                        Math.ceil(batchMeta.count / batchPageSize)
                      }
                      onClick={() => setBatchPage((p) => p + 1)}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                )}
              </div>
              {/* Desktop: table */}
              <div className="hidden md:block">
                <DataTable
              columns={batchLelangColumns}
              data={batchRows}
              title="Daftar Batch Lelang"
              searchPlaceholder="Cari..."
              headerRight={
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  {selectedBatchRows.length > 0 && (
                    <span className="text-destructive text-sm">
                      · {selectedBatchRows.length} dipilih
                    </span>
                  )}
                  {canCreateBatch && (
                    <Button
                      type="button"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                      onClick={() => {
                        setSelectedItemLelangRows([])
                        setIsBuatBatchDialogOpen(true)
                      }}
                      disabled={createBatchMutation.isPending}
                    >
                      <Plus className="size-4" />
                      Buat Batch
                    </Button>
                  )}
                  {selectedBatchRows.some((b) => b.rawStatus === "draft") &&
                    canDeleteBatch && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleBulkDeleteBatches}
                        disabled={bulkDeleteBatchMutation.isPending}
                      >
                        Hapus
                      </Button>
                    )}
                  <Select
                    value={batchPageSize.toString()}
                    onValueChange={(v) => setBatchPageSize(Number(v))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="w-full sm:w-auto sm:max-w-sm">
                    <Input
                      placeholder="Cari..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      icon={<SearchIcon className="size-4" />}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setFilterDialogOpen(true)}
                  >
                    <SlidersHorizontal className="size-4" />
                    Filter
                  </Button>
                </div>
              }
              filterConfig={batchLelangFilterConfig}
              filterValues={filterValues}
              onFilterChange={setFilterValues}
              filterDialogOpen={filterDialogOpen}
              onFilterDialogOpenChange={setFilterDialogOpen}
              initialPageSize={batchPageSize}
              onPageSizeChange={setBatchPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
              onDelete={canDeleteBatch || canUpdateBatch ? handleDelete : undefined}
              onSelectionChange={(rows) =>
                setSelectedBatchRows(rows as BatchLelang[])
              }
              serverSidePagination={
                batchMeta != null
                  ? {
                      totalRowCount: batchMeta.count,
                      pageIndex: batchPage - 1,
                      onPageIndexChange: (idx) => setBatchPage(idx + 1),
                    }
                  : undefined
              }
              getRowClassName={(row) =>
                row.isMata ? "bg-red-50 dark:bg-red-950/30" : ""
              }
            />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title={itemToDelete && "idBatch" in itemToDelete && (itemToDelete as BatchLelang).rawStatus === "draft" ? "Hapus Batch Lelang" : "Batalkan Batch Lelang"}
        description={
          itemToDelete && "idBatch" in itemToDelete && (itemToDelete as BatchLelang).rawStatus === "draft"
            ? "Anda akan menghapus batch draft dari dalam sistem."
            : "Anda akan membatalkan batch lelang ini."
        }
        confirmLabel={itemToDelete && "idBatch" in itemToDelete && (itemToDelete as BatchLelang).rawStatus === "draft" ? "Hapus" : "Batalkan"}
        variant="destructive"
      />

      <ConfirmationDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Batch Terpilih"
        description={`Anda akan menghapus ${selectedBatchRows.filter((b) => b.rawStatus === "draft").length} batch draft.`}
        confirmLabel="Hapus"
        variant="destructive"
      />

      <CreateBatchDialog
        open={isBuatBatchDialogOpen}
        onOpenChange={setIsBuatBatchDialogOpen}
        selectedItems={selectedItemLelangRows}
        onConfirm={handleConfirmBuatBatch}
        isSubmitting={createBatchMutation.isPending}
      />
    </div>
  )
}

export default function LelangPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <LelangPageContent />
    </Suspense>
  )
}
