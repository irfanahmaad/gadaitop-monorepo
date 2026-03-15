"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  useAuctionBatch,
  useAssignAuctionBatch,
  useFinalizeAuctionBatch,
  useCancelAuctionBatch,
  useDeleteAuctionBatch,
  useRemoveItemFromBatch,
  useUpdateBatchMarketing,
  useUpdateBatchItemMarketing,
  useItemPickup,
  useItemValidation,
  useUpdateItemAuctionStatus,
  auctionBatchKeys,
} from "@/lib/react-query/hooks"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { usePawnTerms } from "@/lib/react-query/hooks/use-pawn-terms"
import { matchSpkItemToMataRules } from "@/lib/utils/mata-rule-matcher"
import { useQueryClient } from "@tanstack/react-query"
import type { AuctionBatch, PawnTerm, SpkItem } from "@/lib/api/types"
import {
  Box,
  Pencil,
  QrCode,
  Trash2,
  CheckCircle,
  ChevronDown,
  SearchIcon,
  User,
  MoreVertical,
  Eye,
  Info,
  Hand,
  FileText,
  Plus,
  X,
  PackageCheck,
} from "lucide-react"
import { QRCodeDialog } from "../../_components/QRCodeDialog"
import { EditBatchDialog } from "../_components/EditBatchDialog"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useAppAbility } from "@/lib/casl/context"
import { AclAction, AclSubject } from "@/lib/casl/types"
import { cn } from "@workspace/ui/lib/utils"

type BatchItemRow = {
  id: string
  spkId: string
  no: number
  foto?: string
  noSPK: string
  namaBarang: string
  tipeBarang: string
  toko: string
  petugas: string
  statusPengambilan: string
  statusValidasi: string
  pickupStatus?: string
  auctionItemStatus?: string | null
  isMata?: boolean
  marketingNotes?: string | null
  marketingAssets?: string[] | null
}

function formatAssignees(
  assignees: { fullName?: string; name?: string }[] | undefined
): string {
  if (!assignees?.length) return "-"
  return assignees
    .map((a) => a.fullName ?? a.name ?? "")
    .filter(Boolean)
    .join(", ") || "-"
}

function mapBatchToItemRows(
  batch: AuctionBatch,
  pawnTerms: PawnTerm[] | undefined,
  ptId: string | undefined
): BatchItemRow[] {
  const items = batch.items ?? []
  const storeName = batch.store?.shortName ?? "-"
  return items.map((item, idx) => {
    const spk = (item as { spk?: { spkNumber: string; uuid?: string } }).spk
    const spkItem = (
      item as {
        spkItem?: {
          itemType?: { typeName: string }
          description: string
          photoUrl?: string
          [key: string]: unknown
        }
      }
    ).spkItem
    const itemWithAssignee = item as {
      assignee?: { fullName?: string; name?: string }
    }
    const noSPK = spk?.spkNumber ?? "-"
    const spkId = spk?.uuid ?? (item as { spkId?: string }).spkId ?? ""
    const namaBarang = spkItem?.description ?? "-"
    const tipeBarang = spkItem?.itemType?.typeName ?? "-"
    const petugas =
      itemWithAssignee.assignee?.fullName ??
      itemWithAssignee.assignee?.name ??
      "-"
    const pickedUp =
      (item as { pickedUp?: boolean }).pickedUp ??
      ((item as { pickupStatus?: string }).pickupStatus === "picked_up" ||
        (item as { pickupStatus?: string }).pickupStatus === "completed")
    const validationVerdict = (item as { validationVerdict?: string })
      .validationVerdict
    const statusValidasi = validationVerdict
      ? validationVerdict === "ok"
        ? "OK"
        : validationVerdict === "return"
          ? "Return"
          : validationVerdict === "reject"
            ? "Reject"
            : String(validationVerdict)
      : "-"
    const mataResult =
      pawnTerms?.length && ptId && spkItem
        ? matchSpkItemToMataRules(
            spkItem as unknown as SpkItem,
            pawnTerms,
            ptId
          )
        : { isMata: false }
    const pickupStatus =
      (item as { pickupStatus?: string }).pickupStatus ?? "pending"
    const auctionItemStatus = (item as { auctionItemStatus?: string | null })
      .auctionItemStatus ?? null
    const marketingNotes = (item as { marketingNotes?: string | null }).marketingNotes ?? null
    const marketingAssets = (item as { marketingAssets?: string[] | null }).marketingAssets ?? null
    return {
      id: item.uuid,
      spkId,
      no: idx + 1,
      foto: spkItem?.photoUrl,
      noSPK,
      namaBarang,
      tipeBarang,
      toko: storeName,
      petugas,
      statusPengambilan: pickedUp ? "Terscan" : "Belum Terscan",
      statusValidasi,
      pickupStatus,
      auctionItemStatus,
      isMata: mataResult.isMata,
      marketingNotes,
      marketingAssets,
    }
  })
}

function BatchHeaderSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-6 rounded" />
            <Skeleton className="h-6 w-36" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 items-start">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ItemTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-8" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

type DetailBatchStatus =
  | "Draft"
  | "Didistribusikan"
  | "Diambil"
  | "Validasi"
  | "Siap Lelang"
  | "OK by Admin"
  | "Dibatalkan"

function detailStatusFromApi(status: string): DetailBatchStatus {
  const map: Record<string, DetailBatchStatus> = {
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

function DetailStatusBadge({ status }: { status: DetailBatchStatus }) {
  const config: Record<
    DetailBatchStatus,
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
  const c = config[status] ?? config.Draft
  return (
    <Badge variant="outline" className={cn("shrink-0", c.className)}>
      {c.label}
    </Badge>
  )
}

export default function LelanganDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const ability = useAppAbility()
  const slug = typeof params.slug === "string" ? params.slug : ""

  const { user } = useAuth()
  const { data: batch, isLoading, isError } = useAuctionBatch(slug)
  const assignMutation = useAssignAuctionBatch()
  const itemPickupMutation = useItemPickup()
  const itemValidationMutation = useItemValidation()
  const updateItemAuctionStatusMutation = useUpdateItemAuctionStatus()
  const finalizeMutation = useFinalizeAuctionBatch()
  const cancelMutation = useCancelAuctionBatch()
  const deleteMutation = useDeleteAuctionBatch()
  const removeItemMutation = useRemoveItemFromBatch()
  const updateBatchMarketingMutation = useUpdateBatchMarketing()
  const updateBatchItemMarketingMutation = useUpdateBatchItemMarketing()

  const canUpdateBatch = ability.can(AclAction.UPDATE, AclSubject.AUCTION_BATCH)
  const canDeleteBatch = ability.can(AclAction.DELETE, AclSubject.AUCTION_BATCH)
  const canUpdatePickup = ability.can(AclAction.UPDATE, AclSubject.AUCTION_PICKUP)
  const canUpdateValidation = ability.can(
    AclAction.UPDATE,
    AclSubject.AUCTION_VALIDATION
  )
  const canReadMarketing = ability.can(AclAction.READ, AclSubject.MARKETING_NOTE)
  const canUpdateMarketing = ability.can(
    AclAction.UPDATE,
    AclSubject.MARKETING_NOTE
  )
  const isAssignedAuctionStaff =
    !!user?.uuid &&
    !!batch?.auctionStaff?.some(
      (s: { uuid?: string }) => s.uuid === user.uuid
    )
  const showMulaiPickup =
    batch?.status === "draft" &&
    canUpdatePickup &&
    isAssignedAuctionStaff

  const ptId = batch?.ptId ?? batch?.store?.companyId ?? ""
  const { data: pawnTermsData } = usePawnTerms(undefined)
  const pawnTerms = useMemo(
    () => pawnTermsData?.data ?? [],
    [pawnTermsData?.data]
  )

  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrValue, setQrValue] = useState("")
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isTolakDialogOpen, setIsTolakDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRemoveItemDialogOpen, setIsRemoveItemDialogOpen] = useState(false)
  const [removeItemRow, setRemoveItemRow] = useState<BatchItemRow | null>(null)
  const [pageSize, setPageSize] = useState(100)
  const [searchValue, setSearchValue] = useState("")
  const [localMarketingNotes, setLocalMarketingNotes] = useState("")
  const [localMarketingAssets, setLocalMarketingAssets] = useState<string[]>([])
  const [newAssetUrl, setNewAssetUrl] = useState("")
  const [pickupFailRow, setPickupFailRow] = useState<BatchItemRow | null>(null)
  const [pickupFailReason, setPickupFailReason] = useState("")
  const [isPickupFailDialogOpen, setIsPickupFailDialogOpen] = useState(false)
  const [validationRow, setValidationRow] = useState<BatchItemRow | null>(null)
  const [validationVerdict, setValidationVerdict] = useState<
    "ok" | "return" | "reject"
  >("reject")
  const [validationNotes, setValidationNotes] = useState("")
  const [validationPhotos, setValidationPhotos] = useState<string[]>([])
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false)
  const [newValidationPhotoUrl, setNewValidationPhotoUrl] = useState("")
  const [itemMarketingRow, setItemMarketingRow] = useState<BatchItemRow | null>(null)
  const [itemMarketingNotes, setItemMarketingNotes] = useState("")
  const [itemMarketingAssets, setItemMarketingAssets] = useState<string[]>([])
  const [newItemAssetUrl, setNewItemAssetUrl] = useState("")
  const [isItemMarketingDialogOpen, setIsItemMarketingDialogOpen] = useState(false)

  useEffect(() => {
    if (batch) {
      setLocalMarketingNotes(batch.marketingNotes ?? "")
      setLocalMarketingAssets(batch.marketingAssets ?? [])
    }
  }, [batch?.uuid, batch?.marketingNotes, batch?.marketingAssets])

  const itemRows = useMemo(
    () =>
      batch ? mapBatchToItemRows(batch, pawnTerms, ptId || undefined) : [],
    [batch, pawnTerms, ptId]
  )

  const filteredItemRows = useMemo(() => {
    if (!searchValue.trim()) return itemRows
    const q = searchValue.toLowerCase()
    return itemRows.filter(
      (row) =>
        row.noSPK.toLowerCase().includes(q) ||
        row.namaBarang.toLowerCase().includes(q) ||
        row.tipeBarang.toLowerCase().includes(q) ||
        row.toko.toLowerCase().includes(q) ||
        row.petugas.toLowerCase().includes(q)
    )
  }, [itemRows, searchValue])

  const marketingNames = batch
    ? formatAssignees(batch.marketingStaff)
    : "-"
  const auctionStaffNames = batch
    ? formatAssignees(batch.auctionStaff)
    : "-"
  const batchNotes = batch?.notes ?? "-"
  const lastUpdatedAt = batch?.updatedAt
    ? format(new Date(batch.updatedAt), "d MMMM yyyy HH:mm:ss", { locale: id })
    : "-"

  const totalItems = batch?.items?.length ?? 0
  const validatedCount = (batch?.items ?? []).filter(
    (i) => !!(i as { validationVerdict?: string }).validationVerdict
  ).length
  const allValidated = totalItems > 0 && validatedCount === totalItems
  const canApprove = batch?.status === "validation_pending" && allValidated

  const handleApprove = async () => {
    if (!slug) return
    try {
      await finalizeMutation.mutateAsync(slug)
      toast.success("Batch disetujui untuk lelang")
      setIsApproveDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.detail(slug) })
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal menyetujui batch"
      )
    }
  }

  const handleDeleteOrCancel = () => {
    if (!slug) return
    if (batch?.status === "draft") {
      deleteMutation.mutate(slug, {
        onSuccess: () => {
          toast.success("Batch berhasil dihapus")
          setIsDeleteDialogOpen(false)
          router.push("/lelangan")
        },
        onError: (err) => {
          toast.error((err as { message?: string })?.message ?? "Gagal menghapus batch")
        },
      })
    } else {
      cancelMutation.mutate(slug, {
        onSuccess: () => {
          toast.success("Batch berhasil dibatalkan")
          setIsDeleteDialogOpen(false)
          router.push("/lelangan")
        },
        onError: (err) => {
          toast.error((err as { message?: string })?.message ?? "Gagal membatalkan batch")
        },
      })
    }
  }

  const handleTolakRetur = () => {
    if (!slug) return
    cancelMutation.mutate(slug, {
      onSuccess: () => {
        toast.success("Batch ditolak / dikembalikan")
        setIsTolakDialogOpen(false)
        router.push("/lelangan")
      },
      onError: (err) => {
        toast.error(err?.message ?? "Gagal menolak batch")
      },
    })
  }

  const handleRemoveFromBatch = async () => {
    if (!removeItemRow || !slug) return
    try {
      await removeItemMutation.mutateAsync({
        batchId: slug,
        itemId: removeItemRow.id,
      })
      toast.success("Item berhasil dihapus dari batch")
      setIsRemoveItemDialogOpen(false)
      setRemoveItemRow(null)
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal menghapus item dari batch"
      )
      throw err
    }
  }

  const handlePickupDiambil = async (row: BatchItemRow) => {
    if (!slug) return
    try {
      await itemPickupMutation.mutateAsync({
        batchId: slug,
        itemId: row.id,
        data: { pickupStatus: "taken" },
      })
      toast.success("Item ditandai Diambil")
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal memperbarui status pickup"
      )
    }
  }

  const handlePickupGagalConfirm = async () => {
    if (!slug || !pickupFailRow) return
    const reason = pickupFailReason.trim()
    if (!reason) {
      toast.error("Alasan kegagalan wajib diisi")
      return
    }
    try {
      await itemPickupMutation.mutateAsync({
        batchId: slug,
        itemId: pickupFailRow.id,
        data: { pickupStatus: "failed", failureReason: reason },
      })
      toast.success("Item ditandai Gagal diambil")
      setIsPickupFailDialogOpen(false)
      setPickupFailRow(null)
      setPickupFailReason("")
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal memperbarui status pickup"
      )
    }
  }

  const handleValidationSetuju = async (row: BatchItemRow) => {
    if (!slug) return
    try {
      await itemValidationMutation.mutateAsync({
        batchId: slug,
        itemId: row.id,
        data: { verdict: "ok" },
      })
      toast.success("Item disetujui")
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal menyimpan validasi"
      )
    }
  }

  const openValidationDialog = (
    row: BatchItemRow,
    verdict: "return" | "reject"
  ) => {
    setValidationRow(row)
    setValidationVerdict(verdict)
    setValidationNotes("")
    setValidationPhotos([])
    setNewValidationPhotoUrl("")
    setIsValidationDialogOpen(true)
  }

  const handleValidationDialogSubmit = async () => {
    if (!slug || !validationRow) return
    const notes =
      validationVerdict === "reject" ? validationNotes.trim() : validationNotes
    if (validationVerdict === "reject" && !notes) {
      toast.error("Alasan penolakan wajib diisi")
      return
    }
    try {
      await itemValidationMutation.mutateAsync({
        batchId: slug,
        itemId: validationRow.id,
        data: {
          verdict: validationVerdict,
          notes: notes || undefined,
          validationPhotos:
            validationPhotos.length > 0 ? validationPhotos : undefined,
        },
      })
      toast.success(
        validationVerdict === "return"
          ? "Item ditandai Retur"
          : "Item ditolak"
      )
      setIsValidationDialogOpen(false)
      setValidationRow(null)
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal menyimpan validasi"
      )
    }
  }

  const handleClickBatchLelang = () => {
    if (!slug) return
    setIsEditDialogOpen(true)
  }

  const handleSaveMarketing = async () => {
    if (!slug || !canUpdateMarketing) return
    try {
      await updateBatchMarketingMutation.mutateAsync({
        id: slug,
        data: {
          marketingNotes: localMarketingNotes || undefined,
          marketingAssets:
            localMarketingAssets.length > 0 ? localMarketingAssets : undefined,
        },
      })
      toast.success("Catatan marketing berhasil disimpan")
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ?? "Gagal menyimpan catatan marketing"
      )
    }
  }

  const handleAddMarketingAsset = () => {
    const url = newAssetUrl.trim()
    if (!url) return
    setLocalMarketingAssets((prev) => [...prev, url])
    setNewAssetUrl("")
  }

  const handleRemoveMarketingAsset = (index: number) => {
    setLocalMarketingAssets((prev) => prev.filter((_, i) => i !== index))
  }

  const openItemMarketingDialog = (row: BatchItemRow) => {
    setItemMarketingRow(row)
    setItemMarketingNotes(row.marketingNotes ?? "")
    setItemMarketingAssets(row.marketingAssets ?? [])
    setNewItemAssetUrl("")
    setIsItemMarketingDialogOpen(true)
  }

  const handleSaveItemMarketing = async () => {
    if (!slug || !itemMarketingRow || !canUpdateMarketing) return
    try {
      await updateBatchItemMarketingMutation.mutateAsync({
        batchId: slug,
        itemId: itemMarketingRow.id,
        data: {
          marketingNotes: itemMarketingNotes || undefined,
          marketingAssets:
            itemMarketingAssets.length > 0 ? itemMarketingAssets : undefined,
        },
      })
      toast.success("Catatan marketing item berhasil disimpan")
      setIsItemMarketingDialogOpen(false)
      setItemMarketingRow(null)
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message ??
          "Gagal menyimpan catatan marketing item"
      )
    }
  }

  const handleAddItemAsset = () => {
    const url = newItemAssetUrl.trim()
    if (!url) return
    setItemMarketingAssets((prev) => [...prev, url])
    setNewItemAssetUrl("")
  }

  const handleRemoveItemAsset = (index: number) => {
    setItemMarketingAssets((prev) => prev.filter((_, i) => i !== index))
  }

  if (!slug) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Lelangan", href: "/lelangan" },
            { label: "Detail Batch", className: "text-destructive" },
          ]}
        />
        <p className="text-muted-foreground">Batch tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              (batch?.batchCode ?? slug)
            )}
          </h1>
          <Breadcrumbs
            items={[
              { label: "Lelangan", href: "/lelangan" },
              {
                label: "Detail Batch",
                className: "text-destructive",
              },
            ]}
          />
        </div>
        {!isLoading && batch && (
          <div className="flex flex-wrap items-center gap-2">
            {showMulaiPickup && (
              <Button
                className="gap-2"
                onClick={async () => {
                  if (!slug) return
                  try {
                    await assignMutation.mutateAsync(slug)
                    toast.success("Pickup dimulai. Batch sekarang dalam status Diambil.")
                    queryClient.invalidateQueries({
                      queryKey: auctionBatchKeys.detail(slug),
                    })
                    queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
                  } catch (err) {
                    toast.error(
                      (err as { message?: string })?.message ?? "Gagal memulai pickup"
                    )
                  }
                }}
                disabled={assignMutation.isPending}
              >
                <PackageCheck className="size-4" />
                {assignMutation.isPending ? "Memproses..." : "Mulai Pickup"}
              </Button>
            )}
            {canDeleteBatch &&
              batch.status !== "cancelled" &&
              batch.status !== "ready_for_auction" && (
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="size-4" />
                  {batch.status === "draft" ? "Hapus" : "Batalkan"}
                </Button>
              )}
            {canUpdateBatch &&
              (batch.status === "draft" || batch.status === "pickup_in_progress") && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleClickBatchLelang}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
            )}
            {batch?.status === "validation_pending" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Approval
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsApproveDialogOpen(true)}
                    disabled={!canApprove || finalizeMutation.isPending}
                  >
                    <CheckCircle className="mr-2 size-4" />
                    Setujui
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsTolakDialogOpen(true)}
                    disabled={cancelMutation.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <Hand className="mr-2 size-4" />
                    Tolak / Retur
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        )}
      </div>

      {/* Detail Batch card */}
      {isLoading ? (
        <>
          <BatchHeaderSkeleton />
          <ItemTableSkeleton />
        </>
      ) : isError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Gagal memuat data</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/lelangan")}
            >
              Kembali ke Lelangan
            </Button>
          </CardContent>
        </Card>
      ) : !batch ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Data tidak ditemukan</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/lelangan")}
            >
              Kembali ke Lelangan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Data Batch Lelang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
                <div className="flex justify-center">
                  <div className="flex size-48 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted/30">
                    <DetailStatusBadge
                      status={detailStatusFromApi(batch.status)}
                    />
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Box className="text-destructive size-6" />
                      <h2 className="text-destructive text-lg font-semibold">
                        Detail Batch Lelang
                      </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 items-start">
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          ID Batch
                        </label>
                        <p className="text-base">{batch.batchCode}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Nama Batch
                        </label>
                        <p className="text-base">
                          {batch.name ?? `Batch ${batch.batchCode}`}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Marketing Staf
                        </label>
                        <p className="flex items-center gap-2 text-base">
                          <User className="text-muted-foreground size-4" />
                          {marketingNames}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Staf Lelang
                        </label>
                        <p className="flex items-center gap-2 text-base">
                          <User className="text-muted-foreground size-4" />
                          {auctionStaffNames}
                        </p>
                      </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Toko
                    </label>
                    <p className="text-base">{batch.store?.shortName ?? "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Jumlah Item
                    </label>
                    <p className="text-base">{totalItems}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Last Updated At
                    </label>
                    <p className="text-base">{lastUpdatedAt}</p>
                  </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-muted-foreground text-sm font-medium">
                          Catatan
                        </label>
                        <p className="text-base">{batchNotes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marketing Notes (Marketing role / Admin PT) */}
          {canReadMarketing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5" />
                  Catatan Marketing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Catatan (kampanye, channel, pesan utama)
                  </label>
                  {canUpdateMarketing ? (
                    <Textarea
                      value={localMarketingNotes}
                      onChange={(e) => setLocalMarketingNotes(e.target.value)}
                      placeholder="Tambah catatan marketing..."
                      rows={4}
                      className="resize-none"
                    />
                  ) : (
                    <p className="text-base">
                      {batch.marketingNotes || "-"}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Lampiran (URL)
                  </label>
                  {canUpdateMarketing ? (
                    <>
                      <div className="flex gap-2">
                        <Input
                          value={newAssetUrl}
                          onChange={(e) => setNewAssetUrl(e.target.value)}
                          placeholder="https://..."
                          onKeyDown={(e) =>
                            e.key === "Enter" && (e.preventDefault(), handleAddMarketingAsset())
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddMarketingAsset}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                      <ul className="space-y-1">
                        {localMarketingAssets.map((url, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between gap-2 rounded border bg-muted/30 px-2 py-1.5 text-sm"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="text-muted-foreground text-xs font-medium">
                                Asset {i + 1}
                              </span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate text-primary underline"
                              >
                                {url}
                              </a>
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0"
                              onClick={() => handleRemoveMarketingAsset(i)}
                            >
                              <X className="size-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <ul className="space-y-1">
                      {(batch.marketingAssets ?? []).length === 0 ? (
                        <p className="text-muted-foreground text-sm">-</p>
                      ) : (
                        (batch.marketingAssets ?? []).map((url, i) => (
                          <li key={i} className="space-y-0.5">
                            <span className="text-muted-foreground text-xs font-medium">
                              Asset {i + 1}
                            </span>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate text-primary underline"
                            >
                              {url}
                            </a>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
                {canUpdateMarketing && (
                  <Button
                    onClick={handleSaveMarketing}
                    disabled={updateBatchMarketingMutation.isPending}
                  >
                    {updateBatchMarketingMutation.isPending ? "Menyimpan..." : "Simpan catatan marketing"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Item Batch Lelang table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Item Batch Lelang</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => setPageSize(Number(v))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-full sm:w-64">
                    <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      placeholder="Cari..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {itemRows.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  Batch ini belum memiliki item.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Foto</TableHead>
                      <TableHead>No.SPK</TableHead>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Tipe Barang</TableHead>
                      <TableHead>Toko</TableHead>
                      <TableHead>Petugas</TableHead>
                      <TableHead>Status Pengambilan</TableHead>
                      <TableHead>Status Validasi</TableHead>
                      <TableHead>Status Lelang</TableHead>
                      <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItemRows.slice(0, pageSize).map((row) => (
                      <TableRow
                        key={row.id}
                        className={
                          row.isMata ? "bg-red-50 dark:bg-red-950/30" : ""
                        }
                      >
                        <TableCell>{row.no}</TableCell>
                        <TableCell>
                          <Avatar className="size-10">
                            <AvatarImage src={row.foto} alt="" />
                            <AvatarFallback>
                              <Box className="text-muted-foreground size-5" />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{row.noSPK}</span>
                            {row.isMata && (
                              <span
                                title="Item sesuai syarat Mata"
                                className="inline-flex shrink-0"
                              >
                                <Eye className="text-destructive size-4" />
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{row.namaBarang}</TableCell>
                        <TableCell>{row.tipeBarang}</TableCell>
                        <TableCell>{row.toko}</TableCell>
                        <TableCell>{row.petugas}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex rounded px-2 py-1 text-xs font-medium",
                              row.statusPengambilan === "Terscan"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : "bg-destructive/10 text-destructive"
                            )}
                          >
                            {row.statusPengambilan}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex rounded px-2 py-1 text-xs font-medium",
                              row.statusValidasi === "OK"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                : row.statusValidasi === "Return"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                  : row.statusValidasi === "Reject"
                                    ? "bg-destructive/10 text-destructive"
                                    : "text-muted-foreground"
                            )}
                          >
                            {row.statusValidasi}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex rounded px-2 py-1 text-xs font-medium",
                              row.auctionItemStatus === "ready"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                : row.auctionItemStatus === "in_auction"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                  : row.auctionItemStatus === "sold"
                                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                    : row.auctionItemStatus === "unsold"
                                      ? "bg-muted text-muted-foreground"
                                      : "text-muted-foreground"
                            )}
                          >
                            {row.auctionItemStatus === "ready"
                              ? "Ready"
                              : row.auctionItemStatus === "in_auction"
                                ? "Sedang Lelang"
                                : row.auctionItemStatus === "sold"
                                  ? "Terjual"
                                  : row.auctionItemStatus === "unsold"
                                    ? "Tidak Terjual"
                                    : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  row.spkId && router.push(`/spk/${row.spkId}`)
                                }
                                disabled={!row.spkId}
                              >
                                <Info className="mr-2 size-4" />
                                Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setQrValue(row.noSPK)
                                  setQrDialogOpen(true)
                                }}
                              >
                                <QrCode className="mr-2 size-4" />
                                QR SPK
                              </DropdownMenuItem>
                              {canReadMarketing && (
                                <DropdownMenuItem
                                  onClick={() => openItemMarketingDialog(row)}
                                >
                                  <FileText className="mr-2 size-4" />
                                  Catatan Marketing
                                </DropdownMenuItem>
                              )}
                              {batch?.status === "pickup_in_progress" &&
                                canUpdatePickup &&
                                row.pickupStatus === "pending" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handlePickupDiambil(row)
                                      }
                                      disabled={
                                        itemPickupMutation.isPending
                                      }
                                    >
                                      <PackageCheck className="mr-2 size-4" />
                                      Diambil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setPickupFailRow(row)
                                        setPickupFailReason("")
                                        setIsPickupFailDialogOpen(true)
                                      }}
                                      disabled={
                                        itemPickupMutation.isPending
                                      }
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <X className="mr-2 size-4" />
                                      Gagal
                                    </DropdownMenuItem>
                                  </>
                                )}
                              {batch?.status === "validation_pending" &&
                                canUpdateValidation &&
                                row.statusValidasi === "-" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleValidationSetuju(row)
                                      }
                                      disabled={
                                        itemValidationMutation.isPending
                                      }
                                    >
                                      <CheckCircle className="mr-2 size-4" />
                                      Setuju
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        openValidationDialog(row, "reject")
                                      }
                                      disabled={
                                        itemValidationMutation.isPending
                                      }
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Hand className="mr-2 size-4" />
                                      Tolak
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        openValidationDialog(row, "return")
                                      }
                                      disabled={
                                        itemValidationMutation.isPending
                                      }
                                    >
                                      <Box className="mr-2 size-4" />
                                      Retur
                                    </DropdownMenuItem>
                                  </>
                                )}
                              {batch?.status === "ready_for_auction" &&
                                canUpdateBatch && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={async () => {
                                        if (!slug) return
                                        try {
                                          await updateItemAuctionStatusMutation.mutateAsync({
                                            batchId: slug,
                                            itemId: row.id,
                                            data: {
                                              auctionItemStatus: "ready",
                                            },
                                          })
                                          toast.success("Item ditandai Ready")
                                        } catch (err) {
                                          toast.error(
                                            (err as { message?: string })
                                              ?.message ??
                                              "Gagal memperbarui status lelang"
                                          )
                                        }
                                      }}
                                      disabled={
                                        updateItemAuctionStatusMutation.isPending
                                      }
                                    >
                                      Tandai Ready
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={async () => {
                                        if (!slug) return
                                        try {
                                          await updateItemAuctionStatusMutation.mutateAsync({
                                            batchId: slug,
                                            itemId: row.id,
                                            data: {
                                              auctionItemStatus: "in_auction",
                                            },
                                          })
                                          toast.success("Item ditandai Sedang Lelang")
                                        } catch (err) {
                                          toast.error(
                                            (err as { message?: string })
                                              ?.message ??
                                              "Gagal memperbarui status lelang"
                                          )
                                        }
                                      }}
                                      disabled={
                                        updateItemAuctionStatusMutation.isPending
                                      }
                                    >
                                      Sedang Lelang
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={async () => {
                                        if (!slug) return
                                        try {
                                          await updateItemAuctionStatusMutation.mutateAsync({
                                            batchId: slug,
                                            itemId: row.id,
                                            data: {
                                              auctionItemStatus: "sold",
                                            },
                                          })
                                          toast.success("Item ditandai Terjual")
                                        } catch (err) {
                                          toast.error(
                                            (err as { message?: string })
                                              ?.message ??
                                              "Gagal memperbarui status lelang"
                                          )
                                        }
                                      }}
                                      disabled={
                                        updateItemAuctionStatusMutation.isPending
                                      }
                                    >
                                      Terjual
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={async () => {
                                        if (!slug) return
                                        try {
                                          await updateItemAuctionStatusMutation.mutateAsync({
                                            batchId: slug,
                                            itemId: row.id,
                                            data: {
                                              auctionItemStatus: "unsold",
                                            },
                                          })
                                          toast.success("Item ditandai Tidak Terjual")
                                        } catch (err) {
                                          toast.error(
                                            (err as { message?: string })
                                              ?.message ??
                                              "Gagal memperbarui status lelang"
                                          )
                                        }
                                      }}
                                      disabled={
                                        updateItemAuctionStatusMutation.isPending
                                      }
                                    >
                                      Tidak Terjual
                                    </DropdownMenuItem>
                                  </>
                                )}
                              {(batch?.status === "draft" ||
                                batch?.status === "pickup_in_progress") &&
                                canUpdateBatch && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setRemoveItemRow(row)
                                      setIsRemoveItemDialogOpen(true)
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    Hapus dari Batch
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        value={qrValue}
        title="QR Code Item"
        fullScreen
      />

      <EditBatchDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        batch={batch ?? null}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: auctionBatchKeys.detail(slug) })
        }}
      />

      <ConfirmationDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        onConfirm={handleApprove}
        title="Approve Batch"
        description="Semua item telah tervalidasi OK. Approve batch untuk lelang?"
        confirmLabel="Ya"
        variant="info"
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteOrCancel}
        title={batch?.status === "draft" ? "Hapus Batch" : "Batalkan Batch"}
        description={
          batch?.status === "draft"
            ? "Anda akan menghapus batch draft ini."
            : "Anda akan membatalkan batch ini. Tindakan ini tidak dapat dibatalkan."
        }
        confirmLabel={batch?.status === "draft" ? "Hapus" : "Batalkan"}
        variant="destructive"
      />

      <ConfirmationDialog
        open={isTolakDialogOpen}
        onOpenChange={setIsTolakDialogOpen}
        onConfirm={handleTolakRetur}
        title="Tolak / Retur Batch"
        description="Batch akan ditolak dan dikembalikan. Anda yakin?"
        confirmLabel="Tolak / Retur"
        variant="destructive"
      />

      <ConfirmationDialog
        open={isRemoveItemDialogOpen}
        onOpenChange={(open) => {
          setIsRemoveItemDialogOpen(open)
          if (!open) setRemoveItemRow(null)
        }}
        onConfirm={handleRemoveFromBatch}
        title="Hapus dari Batch"
        description={
          removeItemRow
            ? `Hapus item "${removeItemRow.namaBarang}" (${removeItemRow.noSPK}) dari batch?`
            : "Hapus item dari batch?"
        }
        confirmLabel="Hapus"
        variant="destructive"
      />

      <Dialog
        open={isPickupFailDialogOpen}
        onOpenChange={(open) => {
          setIsPickupFailDialogOpen(open)
          if (!open) {
            setPickupFailRow(null)
            setPickupFailReason("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gagal Diambil</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            {pickupFailRow
              ? `Berikan alasan kegagalan untuk item "${pickupFailRow.namaBarang}" (${pickupFailRow.noSPK}).`
              : "Alasan kegagalan wajib diisi."}
          </p>
          <Textarea
            value={pickupFailReason}
            onChange={(e) => setPickupFailReason(e.target.value)}
            placeholder="Alasan kegagalan..."
            rows={3}
            className="mt-2"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPickupFailDialogOpen(false)
                setPickupFailRow(null)
                setPickupFailReason("")
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handlePickupGagalConfirm}
              disabled={
                !pickupFailReason.trim() || itemPickupMutation.isPending
              }
            >
              {itemPickupMutation.isPending ? "Menyimpan..." : "Gagal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isValidationDialogOpen}
        onOpenChange={(open) => {
          setIsValidationDialogOpen(open)
          if (!open) {
            setValidationRow(null)
            setValidationNotes("")
            setValidationPhotos([])
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationVerdict === "reject" ? "Tolak Item" : "Retur Item"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            {validationRow
              ? `Item: ${validationRow.namaBarang} (${validationRow.noSPK})`
              : ""}
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Catatan
              {validationVerdict === "reject" ? (
                <span className="text-destructive"> *</span>
              ) : null}
            </label>
            <Textarea
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              placeholder={
                validationVerdict === "reject"
                  ? "Alasan penolakan..."
                  : "Catatan retur (opsional)..."
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Foto validasi (opsional)</label>
            <div className="flex gap-2">
              <Input
                value={newValidationPhotoUrl}
                onChange={(e) => setNewValidationPhotoUrl(e.target.value)}
                placeholder="URL foto..."
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = newValidationPhotoUrl.trim()
                  if (url) {
                    setValidationPhotos((prev) => [...prev, url])
                    setNewValidationPhotoUrl("")
                  }
                }}
              >
                Tambah
              </Button>
            </div>
            {validationPhotos.length > 0 && (
              <ul className="text-muted-foreground list-disc pl-4 text-sm">
                {validationPhotos.map((url, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() =>
                        setValidationPhotos((prev) =>
                          prev.filter((_, j) => j !== i)
                        )
                      }
                    >
                      <X className="size-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsValidationDialogOpen(false)
                setValidationRow(null)
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleValidationDialogSubmit}
              disabled={
                (validationVerdict === "reject" && !validationNotes.trim()) ||
                itemValidationMutation.isPending
              }
            >
              {itemValidationMutation.isPending
                ? "Menyimpan..."
                : validationVerdict === "reject"
                  ? "Tolak"
                  : "Retur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item-level marketing notes dialog */}
      <Dialog
        open={isItemMarketingDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsItemMarketingDialogOpen(false)
            setItemMarketingRow(null)
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Catatan Marketing (Item)
              {itemMarketingRow && (
                <span className="text-muted-foreground font-normal">
                  — {itemMarketingRow.namaBarang} ({itemMarketingRow.noSPK})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {itemMarketingRow && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Catatan
                </label>
                {canUpdateMarketing ? (
                  <Textarea
                    value={itemMarketingNotes}
                    onChange={(e) => setItemMarketingNotes(e.target.value)}
                    placeholder="Catatan marketing untuk item ini..."
                    rows={3}
                    className="resize-none"
                  />
                ) : (
                  <p className="text-base">
                    {itemMarketingRow.marketingNotes || "-"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm font-medium">
                  Lampiran (URL)
                </label>
                {canUpdateMarketing ? (
                  <>
                    <div className="flex gap-2">
                      <Input
                        value={newItemAssetUrl}
                        onChange={(e) => setNewItemAssetUrl(e.target.value)}
                        placeholder="https://..."
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddItemAsset())
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddItemAsset}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <ul className="space-y-1">
                      {itemMarketingAssets.map((url, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-2 rounded border bg-muted/30 px-2 py-1.5 text-sm"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="text-muted-foreground text-xs font-medium">
                              Asset {i + 1}
                            </span>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate text-primary underline"
                            >
                              {url}
                            </a>
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0"
                            onClick={() => handleRemoveItemAsset(i)}
                          >
                            <X className="size-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <ul className="space-y-1">
                    {(itemMarketingRow.marketingAssets ?? []).length === 0 ? (
                      <p className="text-muted-foreground text-sm">-</p>
                    ) : (
                      (itemMarketingRow.marketingAssets ?? []).map((url, i) => (
                        <li key={i} className="space-y-0.5">
                          <span className="text-muted-foreground text-xs font-medium">
                            Asset {i + 1}
                          </span>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-primary underline"
                          >
                            {url}
                          </a>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              {canUpdateMarketing && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsItemMarketingDialogOpen(false)
                      setItemMarketingRow(null)
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleSaveItemMarketing}
                    disabled={updateBatchItemMarketingMutation.isPending}
                  >
                    {updateBatchItemMarketingMutation.isPending
                      ? "Menyimpan..."
                      : "Simpan"}
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
