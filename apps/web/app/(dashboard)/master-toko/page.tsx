"use client"

import React, { useMemo, useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
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
  RotateCcw,
  Check,
  X,
  Trash2,
  Store,
} from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { toast } from "sonner"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import {
  useBranches,
  useDeleteBranch,
  useDeactivateBranch,
  branchKeys,
} from "@/lib/react-query/hooks/use-branches"
import {
  useBorrowRequests,
  useApproveBorrowRequest,
  useRejectBorrowRequest,
  useRevokeBorrowRequest,
} from "@/lib/react-query/hooks/use-borrow-requests"
import { useCompanies } from "@/lib/react-query/hooks/use-companies"
import { usePublicUrl } from "@/lib/react-query/hooks/use-upload"
import type { Branch, BorrowRequest } from "@/lib/api/types"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { TolakBorrowRequestDialog } from "./_components/tolak-borrow-request-dialog"

// Types for Toko Utama and Toko Pinjaman
type Toko = {
  id: string
  foto: string
  kodeLokasi: string
  namaPT: string
  namaToko: string
  alias: string
  noTelpToko: string
  kota: string
  isBorrowed?: boolean
  status?: string
  rejectionReason?: string | null
}

// Type for Request
type RequestToko = {
  id: string
  foto: string
  kodeLokasi: string
  namaPT: string
  adminPrimary: string
  namaToko: string
  alias: string
  noTelpToko: string
  kota: string
  tipe: "Pindah Kepemilikan" | "Pinjam PT"
}

function mapBranchToToko(b: Branch): Toko {
  const company = b.company as { companyName?: string } | undefined
  return {
    id: b.uuid,
    foto: b.imageUrl ?? "",
    kodeLokasi: b.branchCode,
    namaPT: company?.companyName ?? "",
    namaToko: b.fullName,
    alias: b.shortName,
    noTelpToko: b.phone ?? "",
    kota: b.city ?? "",
    isBorrowed: b.isBorrowed ?? false,
    status: b.status,
    rejectionReason: b.rejectionReason ?? null,
  }
}

function TokoFotoCell({ imageKey, namaToko }: { imageKey: string; namaToko: string }) {
  const { data: publicUrlData } = usePublicUrl(imageKey)
  const url = imageKey ? publicUrlData?.url : undefined
  return (
    <Avatar className="size-10">
      <AvatarImage src={url} alt={namaToko} />
      <AvatarFallback>
        <Store className="size-5" />
      </AvatarFallback>
    </Avatar>
  )
}

function mapBorrowRequestToRequestToko(r: BorrowRequest): RequestToko {
  const company = r.targetCompany as
    | { companyName?: string; imageUrl?: string }
    | undefined
  const requester = r.requester as { fullName?: string } | undefined
  const branch = r.branch as
    | {
        branchCode?: string
        shortName?: string
        phone?: string
        city?: string
      }
    | undefined

  return {
    id: r.uuid,
    foto: company?.imageUrl ?? "",
    kodeLokasi: branch?.branchCode ?? "-",
    namaPT: company?.companyName ?? "-",
    adminPrimary: requester?.fullName ?? "-",
    namaToko: company?.companyName ?? "-",
    alias: branch?.shortName ?? "-",
    noTelpToko: branch?.phone ?? "-",
    kota: branch?.city ?? "-",
    tipe: "Pinjam PT",
  }
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-64" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-12" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Column definitions for Toko Utama and Toko Pinjaman
const tokoColumns: ColumnDef<Toko>[] = [
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
      <div className="flex items-center gap-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
        <span className="text-sm">{row.index + 1}</span>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "foto",
    header: "Foto",
    cell: ({ row }) => (
      <TokoFotoCell
        imageKey={row.getValue("foto") as string}
        namaToko={row.original.namaToko}
      />
    ),
  },
  {
    accessorKey: "kodeLokasi",
    header: "Kode Lokasi",
  },
  {
    accessorKey: "namaPT",
    header: "Nama PT",
  },
  {
    accessorKey: "namaToko",
    header: "Nama Toko",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span>{row.original.namaToko}</span>
        {row.original.isBorrowed && (
          <Badge variant="secondary" className="text-xs">
            Pinjam PT
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "alias",
    header: "Alias",
  },
  {
    accessorKey: "noTelpToko",
    header: "No. Telp Toko",
  },
  {
    accessorKey: "kota",
    header: "Kota",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const rejectionReason = row.original.rejectionReason
      const label =
        status === "pending_approval"
          ? "Menunggu persetujuan"
          : status === "active"
            ? "Aktif"
            : status === "inactive"
              ? "Nonaktif"
              : status === "draft"
                ? "Draft"
                : status ?? "-"
      const variant =
        status === "pending_approval"
          ? "outline"
          : status === "active"
            ? "default"
            : status === "inactive"
              ? "secondary"
              : "outline"
      const badge = (
        <Badge variant={variant} className="text-xs w-fit">
          {label}
        </Badge>
      )
      if (status === "inactive" && rejectionReason) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>{badge}</TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="font-medium">Alasan penolakan</p>
              <p className="mt-0.5 whitespace-pre-wrap">{rejectionReason}</p>
            </TooltipContent>
          </Tooltip>
        )
      }
      return badge
    },
  },
]

// Column definitions for Request
const requestColumns: ColumnDef<RequestToko>[] = [
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
      <div className="flex items-center gap-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
        <span className="text-sm">{row.index + 1}</span>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "foto",
    header: "Foto",
    cell: ({ row }) => (
      <TokoFotoCell
        imageKey={row.getValue("foto") as string}
        namaToko={row.original.namaToko}
      />
    ),
  },
  {
    accessorKey: "kodeLokasi",
    header: "Kode Lokasi",
  },
  {
    accessorKey: "namaPT",
    header: "Nama PT",
  },
  {
    accessorKey: "adminPrimary",
    header: "Admin Primary",
  },
  {
    accessorKey: "alias",
    header: "Alias",
  },
  {
    accessorKey: "noTelpToko",
    header: "No. Telp Toko",
  },
  {
    accessorKey: "kota",
    header: "Kota",
  },
  {
    accessorKey: "tipe",
    header: "Tipe",
    cell: ({ row }) => {
      const tipe = row.getValue("tipe") as RequestToko["tipe"]
      return (
        <Badge
          variant="outline"
          className="border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400"
        >
          {tipe}
        </Badge>
      )
    },
  },
]

export default function MasterTokoPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isSuperAdmin = user?.roles?.some((r) => r.code === "owner") ?? false

  const effectiveCompanyId = !isSuperAdmin ? (user?.companyId ?? null) : null

  const { data: companiesData } = useCompanies(
    isSuperAdmin ? { pageSize: 100 } : undefined
  )

  const [selectedPT, setSelectedPT] = useState<string>("")
  const ptOptions = useMemo(() => {
    const list = companiesData?.data ?? []
    return list.map((c) => ({ value: c.uuid, label: c.companyName }))
  }, [companiesData])

  const defaultPT =
    (isSuperAdmin && ptOptions[0]?.value) || effectiveCompanyId || ""
  const effectivePT = selectedPT || defaultPT

  const branchQueryCompanyId = isSuperAdmin ? effectivePT : effectiveCompanyId
  const { data: branchesData, isLoading: branchesLoading } = useBranches(
    {
      ...(branchQueryCompanyId
        ? { companyId: branchQueryCompanyId, pageSize: 100, status: "active" }
        : {}),
      relation: { company: true },
      select: {
        uuid: true,
        branchCode: true,
        shortName: true,
        fullName: true,
        city: true,
        phone: true,
        imageUrl: true,
        status: true,
        isBorrowed: true,
        companyId: true,
        rejectionReason: true,
        company: {
          id: true,
          uuid: true,
          companyName: true,
        },
      },
    },
    { enabled: !!branchQueryCompanyId }
  )

  const { data: borrowedBranchesData, isLoading: borrowedBranchesLoading } =
    useBranches(
      {
        filter: { view: "borrowedByMe" },
        pageSize: 100,
        relation: { company: true },
        select: {
          uuid: true,
          branchCode: true,
          shortName: true,
          fullName: true,
          city: true,
          phone: true,
          imageUrl: true,
          status: true,
          isBorrowed: true,
          companyId: true,
          rejectionReason: true,
          company: {
            id: true,
            uuid: true,
            companyName: true,
          },
        },
      },
      { enabled: !!user?.uuid }
    )

  const { data: borrowRequestsData, isLoading: borrowRequestsLoading } =
    useBorrowRequests({
      pageSize: 100,
      filter: { view: "incoming" },
      relation: { branch: true, requester: true, targetCompany: true },
    })

  const deleteBranchMutation = useDeleteBranch()
  const deactivateBranchMutation = useDeactivateBranch()
  const approveBorrowRequestMutation = useApproveBorrowRequest()
  const rejectBorrowRequestMutation = useRejectBorrowRequest()
  const revokeBorrowRequestMutation = useRevokeBorrowRequest()

  const approvedBorrowByBranchId = useMemo(() => {
    const list = borrowRequestsData?.data ?? []
    const approved = list.filter((r) => r.status === "approved")
    return new Map(
      approved.map((r) => [r.branchId ?? (r.branch as { uuid?: string })?.uuid ?? "", r])
    )
  }, [borrowRequestsData])

  const tokoUtamaRows = useMemo(() => {
    const list = branchesData?.data ?? []
    return list.map(mapBranchToToko)
  }, [branchesData])

  const tokoPinjamanRows = useMemo(() => {
    const list = borrowedBranchesData?.data ?? []
    return list.map(mapBranchToToko)
  }, [borrowedBranchesData])

  const requestRows = useMemo(() => {
    const list = borrowRequestsData?.data ?? []
    return list
      .filter((r) => r.status === "pending")
      .map(mapBorrowRequestToRequestToko)
  }, [borrowRequestsData])

  const requestCount = requestRows.length

  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [activeTab, setActiveTab] = useState("toko-utama")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Toko | null>(null)
  const [setujuiRow, setSetujuiRow] = useState<RequestToko | null>(null)
  const [isSetujuiConfirmOpen, setIsSetujuiConfirmOpen] = useState(false)
  const [tolakRow, setTolakRow] = useState<RequestToko | null>(null)
  const [isTolakDialogOpen, setIsTolakDialogOpen] = useState(false)
  const [revokeRow, setRevokeRow] = useState<Toko | null>(null)
  const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false)
  const [revokeMainPTRow, setRevokeMainPTRow] = useState<Toko | null>(null)
  const [isRevokeMainPTDialogOpen, setIsRevokeMainPTDialogOpen] = useState(false)
  const [selectedTokoUtamaRows, setSelectedTokoUtamaRows] = useState<Toko[]>([])
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [resetSelectionKey, setResetSelectionKey] = useState(0)

  const handleDetail = useCallback(
    (row: Toko | RequestToko) => {
      router.push(`/master-toko/${row.id}`)
    },
    [router]
  )

  const handleEdit = useCallback(
    (row: Toko | RequestToko) => {
      router.push(`/master-toko/${row.id}/edit`)
    },
    [router]
  )

  const handleDelete = useCallback((row: Toko) => {
    setItemToDelete(row)
    setIsConfirmDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (itemToDelete) {
      try {
        await deleteBranchMutation.mutateAsync(itemToDelete.id)
        setIsConfirmDialogOpen(false)
        setItemToDelete(null)
        toast.success("Data Toko berhasil dihapus")
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Gagal menghapus data Toko"
        toast.error(message)
      }
    }
  }, [itemToDelete, deleteBranchMutation])

  const handleTambahData = useCallback(() => {
    const isFromTokoPinjaman = activeTab === "toko-pinjaman"
    router.push(
      isFromTokoPinjaman ? "/master-toko/tambah?pinjamPT=1" : "/master-toko/tambah"
    )
  }, [router, activeTab])

  const handleBulkDelete = useCallback(() => {
    setIsBulkDeleteDialogOpen(true)
  }, [])

  const handleConfirmBulkDelete = useCallback(async () => {
    try {
      await Promise.all(
        selectedTokoUtamaRows.map((row) => deleteBranchMutation.mutateAsync(row.id))
      )
      toast.success(`${selectedTokoUtamaRows.length} Toko berhasil dihapus`)
      setIsBulkDeleteDialogOpen(false)
      setSelectedTokoUtamaRows([])
      setResetSelectionKey((k) => k + 1)
    } catch {
      toast.error("Gagal menghapus Toko")
    }
  }, [selectedTokoUtamaRows, deleteBranchMutation])

  const handleRevoke = useCallback((row: Toko) => {
    setRevokeRow(row)
    setIsRevokeConfirmOpen(true)
  }, [])

  const handleRevokeConfirm = useCallback(async () => {
    if (!revokeRow) return
    try {
      await deactivateBranchMutation.mutateAsync(revokeRow.id)
      toast.success("Toko berhasil dinonaktifkan")
      setIsRevokeConfirmOpen(false)
      setRevokeRow(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menonaktifkan toko"
      toast.error(message)
    }
  }, [revokeRow, deactivateBranchMutation])

  const handleRevokeMainPT = useCallback((row: Toko) => {
    setRevokeMainPTRow(row)
    setIsRevokeMainPTDialogOpen(true)
  }, [])

  const handleRevokeMainPTConfirm = useCallback(async () => {
    if (!revokeMainPTRow) return
    const request = approvedBorrowByBranchId.get(revokeMainPTRow.id)
    if (!request?.uuid) {
      toast.error("Data permintaan pinjam tidak ditemukan")
      return
    }
    try {
      await revokeBorrowRequestMutation.mutateAsync(request.uuid)
      setIsRevokeMainPTDialogOpen(false)
      setRevokeMainPTRow(null)
      toast.success("Akses Pinjam PT berhasil dicabut")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal mencabut akses Pinjam PT"
      toast.error(message)
    }
  }, [
    revokeMainPTRow,
    approvedBorrowByBranchId,
    revokeBorrowRequestMutation,
  ])

  const handleSetujui = useCallback((row: RequestToko) => {
    setSetujuiRow(row)
    setIsSetujuiConfirmOpen(true)
  }, [])

  const handleSetujuiConfirm = useCallback(async () => {
    if (!setujuiRow) return
    try {
      await approveBorrowRequestMutation.mutateAsync(setujuiRow.id)
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
      toast.success("Request Pinjam PT berhasil disetujui")
      setIsSetujuiConfirmOpen(false)
      setSetujuiRow(null)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menyetujui request Pinjam PT"
      toast.error(message)
    }
  }, [setujuiRow, approveBorrowRequestMutation, queryClient])

  const handleTolak = useCallback((row: RequestToko) => {
    setTolakRow(row)
    setIsTolakDialogOpen(true)
  }, [])

  const handleTolakConfirm = useCallback(
    async (row: RequestToko, data: { rejectionReason: string }) => {
      try {
        await rejectBorrowRequestMutation.mutateAsync({
          id: row.id,
          data: { rejectionReason: data.rejectionReason },
        })
        queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
        toast.success("Request Pinjam PT berhasil ditolak")
        setIsTolakDialogOpen(false)
        setTolakRow(null)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal menolak request Pinjam PT"
        toast.error(message)
        throw error
      }
    },
    [rejectBorrowRequestMutation, queryClient]
  )

  const tokoUtamaCustomActions = useMemo(
    () => [
      {
        label: "Cabut",
        icon: <RotateCcw className="mr-2 size-4" />,
        onClick: handleRevokeMainPT,
        variant: "destructive" as const,
        hidden: (row: Toko) =>
          !row.isBorrowed || !approvedBorrowByBranchId.get(row.id),
      },
    ],
    [handleRevokeMainPT, approvedBorrowByBranchId]
  )

  const tokoPinjamanCustomActions = useMemo(
    () => [
      {
        label: "Revoke",
        icon: <RotateCcw className="mr-2 size-4" />,
        onClick: handleRevoke,
        variant: "destructive" as const,
      },
    ],
    [handleRevoke]
  )

  const requestCustomActions = useMemo(
    () => [
      {
        label: "Setujui",
        icon: <Check className="mr-2 size-4" />,
        onClick: handleSetujui,
      },
      {
        label: "Tolak",
        icon: <X className="mr-2 size-4" />,
        onClick: handleTolak,
        variant: "destructive" as const,
      },
    ],
    [handleSetujui, handleTolak]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Master Toko</h1>
          <Breadcrumbs
            items={[{ label: "Pages", href: "/" }, { label: "Master Toko" }]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isSuperAdmin && ptOptions.length > 0 && (
            <Select value={effectivePT} onValueChange={setSelectedPT}>
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

          {/* Tambah Data Button - from Toko Pinjaman tab goes to Pinjam PT flow */}
          <Button
            onClick={handleTambahData}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "toko-pinjaman" ? "Tambah Toko Pinjaman" : "Tambah Data"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-4"
      >
        <TabsList className="w-fit">
          <TabsTrigger value="toko-utama">Toko Utama</TabsTrigger>
          <TabsTrigger value="toko-pinjaman">Toko Pinjaman</TabsTrigger>
          <TabsTrigger value="request" className="relative">
            Request
            {requestCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
              >
                {requestCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Toko Utama Tab */}
        <TabsContent value="toko-utama" className="mt-0">
          {branchesLoading ? (
            <TableSkeleton />
          ) : (
            <DataTable
              columns={tokoColumns}
              data={tokoUtamaRows}
              searchPlaceholder="Search"
              headerLeft={
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Daftar Toko Utama</CardTitle>
                  {selectedTokoUtamaRows.length > 0 && (
                    <span className="text-destructive font-semibold">
                      &middot; {selectedTokoUtamaRows.length} Selected
                    </span>
                  )}
                </div>
              }
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
                      placeholder="Search"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      icon={<SearchIcon className="size-4" />}
                      className="w-full"
                    />
                  </div>
                  {selectedTokoUtamaRows.length > 0 && (
                    <Button
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="size-4" />
                      Hapus
                    </Button>
                  )}
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onDetail={handleDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              customActions={tokoUtamaCustomActions}
              onSelectionChange={setSelectedTokoUtamaRows}
              resetSelectionKey={resetSelectionKey}
            />
          )}
        </TabsContent>

        {/* Toko Pinjaman Tab */}
        <TabsContent value="toko-pinjaman" className="mt-0">
          {borrowedBranchesLoading ? (
            <TableSkeleton />
          ) : (
            <DataTable
              columns={tokoColumns}
              data={tokoPinjamanRows}
              title="Daftar Toko Pinjaman"
              searchPlaceholder="Search"
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
                      placeholder="Search"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      icon={<SearchIcon className="size-4" />}
                      className="w-full"
                    />
                  </div>
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              customActions={tokoPinjamanCustomActions}
            />
          )}
        </TabsContent>

        {/* Request Tab */}
        <TabsContent value="request" className="mt-0">
          {borrowRequestsLoading ? (
            <TableSkeleton />
          ) : (
            <DataTable
              columns={requestColumns}
              data={requestRows}
              title="Daftar Request"
              searchPlaceholder="Search"
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
                      placeholder="Search"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      icon={<SearchIcon className="size-4" />}
                      className="w-full"
                    />
                  </div>
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              customActions={requestCustomActions}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmDelete}
        description="Anda akan menghapus data Toko dari dalam sistem."
      />

      {/* Confirmation Dialog for Bulk Delete */}
      <ConfirmationDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleConfirmBulkDelete}
        title="Hapus Toko"
        description={`Anda akan menghapus ${selectedTokoUtamaRows.length} data Toko dari dalam sistem.`}
        confirmLabel="Hapus"
        variant="destructive"
      />

      {/* Confirmation Dialog for Setujui Request */}
      <ConfirmationDialog
        open={isSetujuiConfirmOpen}
        onOpenChange={setIsSetujuiConfirmOpen}
        onConfirm={handleSetujuiConfirm}
        title="Setujui Request Pinjam PT?"
        description="Anda akan menyetujui request Pinjam PT ini."
        note="Pastikan kembali sebelum menyetujui."
        confirmLabel="Ya, Setujui"
        cancelLabel="Batal"
        variant="info"
      />

      {/* Confirmation Dialog for Revoke */}
      <ConfirmationDialog
        open={isRevokeConfirmOpen}
        onOpenChange={setIsRevokeConfirmOpen}
        onConfirm={handleRevokeConfirm}
        title="Revoke Toko Pinjaman?"
        description="Anda akan mencabut akses Pinjam PT untuk toko ini."
        note="Toko akan dikembalikan kepada pemilik asli."
        confirmLabel="Ya, Revoke"
        cancelLabel="Batal"
        variant="info"
      />

      {/* Confirmation Dialog for Cabut (Main PT revoke) */}
      <ConfirmationDialog
        open={isRevokeMainPTDialogOpen}
        onOpenChange={setIsRevokeMainPTDialogOpen}
        onConfirm={handleRevokeMainPTConfirm}
        title="Cabut akses Pinjam PT?"
        description="Anda akan mencabut akses peminjam untuk toko ini. Toko akan dinonaktifkan bagi peminjam."
        note="Pastikan kembali sebelum mencabut."
        confirmLabel="Ya, Cabut"
        cancelLabel="Batal"
        variant="destructive"
      />

      {/* Tolak Request Dialog */}
      <TolakBorrowRequestDialog
        open={isTolakDialogOpen}
        onOpenChange={setIsTolakDialogOpen}
        row={tolakRow}
        onConfirm={handleTolakConfirm}
        isSubmitting={rejectBorrowRequestMutation.isPending}
      />
    </div>
  )
}
