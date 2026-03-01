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
  QrCode,
  Printer,
  CheckCircle,
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
  useCancelAuctionBatch,
  useCreateAuctionBatch,
  useFinalizeAuctionBatch,
} from "@/lib/react-query/hooks/use-auction-batches"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { useSpkList, spkKeys } from "@/lib/react-query/hooks/use-spk"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { usePawnTerms } from "@/lib/react-query/hooks/use-pawn-terms"
import { matchSpkItemToMataRules } from "@/lib/utils/mata-rule-matcher"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { QRCodeDialog } from "@/app/(dashboard)/_components/QRCodeDialog"
import { CreateBatchDialog } from "@/app/(dashboard)/lelangan/_components/CreateBatchDialog"
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

function getAssigneeName(
  assignedTo: string | { fullName?: string; name?: string } | undefined
): string {
  if (!assignedTo) return "-"
  if (typeof assignedTo === "string") return "Staff"
  return (
    (assignedTo as { fullName?: string }).fullName ??
    (assignedTo as { name?: string }).name ??
    "Staff"
  )
}

function mapAuctionBatchToBatchLelang(batch: AuctionBatch): BatchLelang {
  const items = batch.items ?? []
  const itemCount = items.length
  const pickedUp = items.filter(
    (i) =>
      i.pickedUp === true ||
      (i as { pickupStatus?: string }).pickupStatus === "picked_up" ||
      (i as { pickupStatus?: string }).pickupStatus === "completed"
  ).length
  const validated = items.filter(
    (i) =>
      i.validated === true ||
      !!(i as { validationVerdict?: string }).validationVerdict
  ).length
  const updatedAt = batch.updatedAt ?? batch.createdAt ?? null
  const hasMataItems = false // Batch Mata highlighting: requires pawn terms in mapper - deferred
  return {
    id: batch.uuid,
    idBatch: batch.batchCode,
    namaBatch: batch.batchCode,
    jumlahItem: itemCount,
    lastUpdatedAt: updatedAt
      ? format(new Date(updatedAt), "d MMMM yyyy HH:mm:ss", { locale: id })
      : "-",
    status: mapBatchStatus(batch.status),
    toko: batch.store?.shortName,
    penanggungJawab: getAssigneeName(batch.assignedTo),
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
      (spk.customer as { fullName?: string })?.fullName ??
      (spk.customer as { name?: string })?.name ??
      "-"
    const dueDate = spk.dueDate
      ? format(new Date(spk.dueDate), "d MMM yyyy", { locale: id })
      : "-"

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
        petugas: "-",
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

// Status badge component for Batch Lelang
const BatchStatusBadge = ({ status }: { status: BatchStatus }) => {
  const statusConfig: Record<
    BatchStatus,
    { label: string; className: string }
  > = {
    Draft: {
      label: "Draft",
      className:
        "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    },
    Didistribusikan: {
      label: "Didistribusikan",
      className:
        "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    },
    Diambil: {
      label: "Diambil",
      className:
        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    Validasi: {
      label: "Validasi",
      className:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    },
    "Siap Lelang": {
      label: "Siap Lelang",
      className:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    "OK by Admin": {
      label: "OK by Admin",
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
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("noSPK")}</span>
    ),
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
    accessorKey: "tanggalJatuhTempo",
    header: "Tanggal Jatuh Tempo",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const isJatuhTempo = status === "Jatuh Tempo"
      return (
        <Badge
          variant="outline"
          className={
            isJatuhTempo
              ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "lastUpdatedAt",
    header: "Last Updated At",
    cell: ({ row }) => {
      const status = row.getValue("lastUpdatedAt") as string
      const isBelumTerscan = status === "Belum Terscan"
      return (
        <Badge
          variant="outline"
          className={
            isBelumTerscan
              ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400"
              : "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
          }
        >
          {status}
        </Badge>
      )
    },
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
    cell: ({ row }) => <span className="text-sm">{row.index + 1}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "idBatch",
    header: "ID Batch",
  },
  {
    accessorKey: "toko",
    header: "Toko",
  },
  {
    accessorKey: "penanggungJawab",
    header: "Penanggung Jawab",
  },
  {
    accessorKey: "jumlahItem",
    header: "Jumlah Item",
  },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const total = row.original.jumlahItem
      const diambil = row.original.progressDiambil
      const validasi = row.original.progressValidasi
      const pct = total > 0 ? Math.round((validasi / total) * 100) : 0
      return (
        <div className="flex flex-col gap-1">
          <div className="text-muted-foreground text-xs">
            Diambil {diambil}/{total}, Validasi {validasi}/{total}
          </div>
          <div className="bg-muted h-1.5 w-20 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "lastUpdatedAt",
    header: "Last Updated At",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <BatchStatusBadge status={row.getValue("status")} />,
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
  const { user } = useAuth()
  const isCompanyAdmin =
    user?.roles?.some((r) => r.code === "company_admin") ?? false
  const isSuperAdmin = user?.roles?.some((r) => r.code === "owner") ?? false

  const effectiveCompanyId = isCompanyAdmin ? (user?.companyId ?? null) : null

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
      filter: { status: "overdue" } as Record<string, string>,
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

  const batchLelangFilterConfig: FilterConfig[] = React.useMemo(
    () => [
      {
        key: "dateRange",
        label: "Tanggal Buat",
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
      {
        key: "status",
        label: "Status",
        type: "multiselect",
        placeholder: "Pilih status...",
        options: [
          { label: "Draft", value: "draft" },
          { label: "Didistribusikan", value: "assigned" },
          { label: "Diambil", value: "pickup_in_progress" },
          { label: "Validasi", value: "validation_pending" },
          { label: "Siap Lelang", value: "ready_for_auction" },
          { label: "OK by Admin", value: "finalized" },
          { label: "Dibatalkan", value: "cancelled" },
        ],
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
  const [qrDialog, setQrDialog] = useState<{ open: boolean; value: string }>({
    open: false,
    value: "",
  })

  const handleShowQr = React.useCallback((noSPK: string) => {
    setQrDialog({ open: true, value: noSPK })
  }, [])

  const handleDetailItemLelang = React.useCallback(
    (row: ItemLelang) => {
      router.push(`/spk/${row.spkId}`)
    },
    [router]
  )

  const handleTambahKeBatch = React.useCallback((row: ItemLelang) => {
    setSelectedItemLelangRows([row])
    setIsBuatBatchDialogOpen(true)
  }, [])

  const itemLelangColumnsWithQr = React.useMemo((): ColumnDef<ItemLelang>[] => {
    return itemLelangColumns.map((col) => {
      if ("accessorKey" in col && col.accessorKey === "noSPK") {
        return {
          ...col,
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <span className="font-medium">{row.getValue("noSPK")}</span>
              <Button
                variant="outline"
                size="icon"
                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive size-8 shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShowQr(row.original.noSPK)
                }}
                aria-label="Tampilkan QR Code"
              >
                <QrCode className="size-4" />
              </Button>
            </div>
          ),
        }
      }
      return col
    })
  }, [handleShowQr])

  const itemLelangCustomActions = React.useMemo(
    () => [
      // {
      //   label: "Tambah ke Batch",
      //   icon: <Plus className="mr-2 size-4" />,
      //   onClick: handleTambahKeBatch,
      // },
    ],
    []
  )

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

  const listOptions = React.useMemo(() => {
    const filter: Record<string, string> = {}
    if (companyFilterId) filter.ptId = companyFilterId
    return {
      page: 1,
      pageSize,
      filter,
      relation: { items: true, store: true },
    }
  }, [companyFilterId, pageSize])

  const { data, isLoading, isError } = useAuctionBatches(listOptions)
  const cancelBatchMutation = useCancelAuctionBatch()
  const finalizeBatchMutation = useFinalizeAuctionBatch()
  const [batchToApprove, setBatchToApprove] = useState<BatchLelang | null>(null)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)

  const batchesFromApi = React.useMemo(() => data?.data ?? [], [data?.data])

  const isBatchReadyForApprove = React.useCallback(
    (batchRow: BatchLelang) => {
      const batch = batchesFromApi.find((b) => b.uuid === batchRow.id)
      if (!batch || batch.status !== "validation_pending") return false
      const items = batch.items ?? []
      if (items.length === 0) return false
      return items.every(
        (i) =>
          i.validated === true ||
          !!(i as { validationVerdict?: string }).validationVerdict
      )
    },
    [batchesFromApi]
  )

  const batchCustomActions = React.useMemo(
    () => [
      {
        label: "Approve",
        icon: <CheckCircle className="mr-2 size-4" />,
        onClick: (row: BatchLelang) => {
          if (!isBatchReadyForApprove(row)) {
            toast.error(
              "Batch belum siap. Semua item harus tervalidasi OK terlebih dahulu."
            )
            return
          }
          setBatchToApprove(row)
          setIsApproveDialogOpen(true)
        },
      },
    ],
    [isBatchReadyForApprove]
  )
  const batchRows = React.useMemo(
    () => batchesFromApi.map(mapAuctionBatchToBatchLelang),
    [batchesFromApi]
  )

  const filteredBatchLelang = React.useMemo(() => {
    let result = [...batchRows]

    if (searchValue) {
      const s = searchValue.toLowerCase()
      result = result.filter(
        (b) =>
          b.idBatch.toLowerCase().includes(s) ||
          b.namaBatch.toLowerCase().includes(s) ||
          (b.toko?.toLowerCase().includes(s) ?? false) ||
          b.penanggungJawab.toLowerCase().includes(s)
      )
    }

    const statusFilter = (filterValues.status as string[] | undefined) ?? []
    if (statusFilter.length) {
      result = result.filter((b) => statusFilter.includes(b.rawStatus))
    }

    const dateRange = (filterValues.dateRange as {
      from: string | null
      to: string | null
    }) ?? { from: null, to: null }
    const tipeBarang = (filterValues.tipeBarang as string[] | undefined) ?? []
    if (tipeBarang.length) {
      result = result.filter((b) => {
        const batch = batchesFromApi.find((x) => x.uuid === b.id)
        const items = batch?.items ?? []
        return items.some((item) => {
          const spkItems = item.spk?.items ?? []
          return spkItems.some(
            (si) =>
              si.itemType?.typeName && tipeBarang.includes(si.itemType.typeName)
          )
        })
      })
    }
    const toko = (filterValues.toko as string[] | undefined) ?? []
    const segmentasi = filterValues.segmentasi as string | null | undefined

    if (dateRange.from || dateRange.to) {
      result = result.filter((b) => {
        const d = b.updatedAtRaw ? new Date(b.updatedAtRaw) : null
        if (!d) return false
        if (dateRange.from && d < new Date(dateRange.from)) return false
        if (dateRange.to && d > new Date(dateRange.to)) return false
        return true
      })
    }
    if (toko.length) {
      result = result.filter((b) => b.toko && toko.includes(b.toko))
    }
    if (segmentasi) {
      const now = new Date()
      const oneMonthAgo = new Date(now)
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      result = result.filter((b) => {
        const d = b.updatedAtRaw ? new Date(b.updatedAtRaw) : null
        if (!d) return false
        if (segmentasi === "lt_1_bulan") return d >= oneMonthAgo
        if (segmentasi === "gt_1_bulan") return d < oneMonthAgo
        return true
      })
    }

    return result
  }, [batchRows, batchesFromApi, searchValue, filterValues])

  const handleDetail = (row: ItemLelang | BatchLelang) => {
    if ("idBatch" in row) {
      router.push(`/lelangan/${row.id}`)
    }
  }

  const handleEdit = (row: ItemLelang | BatchLelang) => {
    void row // reserved for future edit implementation
  }

  const handleDelete = (row: ItemLelang | BatchLelang) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }

  const handleBuatBatchClick = () => {
    if (selectedItemLelangRows.length === 0) return
    const first = selectedItemLelangRows[0]!
    const allSameStore = selectedItemLelangRows.every(
      (r) => r.storeId === first.storeId && r.ptId === first.ptId
    )
    if (!allSameStore) {
      toast.error(
        "Semua item yang dipilih harus dari toko yang sama. Silakan pilih item dari satu toko."
      )
      return
    }
    setIsBuatBatchDialogOpen(true)
  }

  const handleConfirmBuatBatch = async (data: {
    storeId: string
    ptId: string
    spkItemIds: string[]
    notes?: string
  }) => {
    try {
      await createBatchMutation.mutateAsync({
        storeId: data.storeId,
        ptId: data.ptId,
        spkItemIds: data.spkItemIds,
        notes: data.notes,
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

  const handleConfirmApprove = async () => {
    if (!batchToApprove) return
    try {
      await finalizeBatchMutation.mutateAsync(batchToApprove.id)
      toast.success("Batch disetujui untuk lelang")
      setIsApproveDialogOpen(false)
      setBatchToApprove(null)
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal menyetujui batch"
      )
    }
  }

  const handleConfirmDelete = () => {
    if (!itemToDelete) return
    if (!("idBatch" in itemToDelete)) {
      setIsConfirmDialogOpen(false)
      setItemToDelete(null)
      return
    }
    cancelBatchMutation.mutate(itemToDelete.id, {
      onSuccess: () => {
        toast.success("Batch lelang berhasil dibatalkan")
        setIsConfirmDialogOpen(false)
        setItemToDelete(null)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Gagal membatalkan batch lelang")
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Lelang</h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: "Lelang", href: "/lelangan" },
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
              columns={itemLelangColumnsWithQr}
              data={filteredItemLelang}
              title="Daftar SPK Jatuh Tempo"
              searchPlaceholder="Cari berdasarkan SPK, barang, atau nasabah"
              headerRight={
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  {/* <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => window.print()}
                  >
                    <Printer className="size-4" />
                    Cetak
                  </Button> */}
                  {selectedItemLelangRows.length > 0 && (
                    <Button
                      type="button"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                      onClick={handleBuatBatchClick}
                      disabled={createBatchMutation.isPending}
                    >
                      <Plus className="size-4" />
                      Buat Batch
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
                      placeholder="Cari berdasarkan SPK, barang, atau nasabah"
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
              onDetail={handleDetailItemLelang}
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
            <DataTable
              columns={batchLelangColumns}
              data={filteredBatchLelang}
              title="Daftar Batch Lelang"
              searchPlaceholder="Cari berdasarkan batch ID, toko, atau staff"
              headerRight={
                <div className="flex w-full items-center gap-2 sm:w-auto">
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
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              customActions={batchCustomActions}
              getRowClassName={(row) =>
                row.isMata ? "bg-red-50 dark:bg-red-950/30" : ""
              }
            />
          )}
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Batch Lelang"
        description="Anda akan menghapus data Lelang dari dalam sistem."
        confirmLabel="Hapus"
        variant="destructive"
      />

      <ConfirmationDialog
        open={isApproveDialogOpen}
        onOpenChange={(open) => {
          setIsApproveDialogOpen(open)
          if (!open) setBatchToApprove(null)
        }}
        onConfirm={handleConfirmApprove}
        title="Approve Batch"
        description={`Approve ${batchToApprove?.idBatch ?? ""}? All items validated OK.`}
        confirmLabel="Ya"
        variant="info"
      />

      <CreateBatchDialog
        open={isBuatBatchDialogOpen}
        onOpenChange={setIsBuatBatchDialogOpen}
        selectedItems={selectedItemLelangRows}
        onConfirm={handleConfirmBuatBatch}
        isSubmitting={createBatchMutation.isPending}
      />

      <QRCodeDialog
        open={qrDialog.open}
        onOpenChange={(open) => setQrDialog((prev) => ({ ...prev, open }))}
        value={qrDialog.value}
        title="QR Code SPK"
      />
    </div>
  )
}

export default function LelangPage() {
  return (
    <Suspense
      fallback={<div className="bg-muted h-64 animate-pulse rounded-lg" />}
    >
      <LelangPageContent />
    </Suspense>
  )
}
