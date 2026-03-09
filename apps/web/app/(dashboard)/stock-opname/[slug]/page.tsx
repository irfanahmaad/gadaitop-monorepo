"use client"
import React, { useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { CheckCheck, ChevronDown, Hand, Pencil } from "lucide-react"
import { DetailSO } from "../_components/DetailSO"
import { EditJadwalSODialog } from "../_components/EditJadwalSODialog"
import {
  StockOpnameItemTable,
  type StockOpnameItem,
} from "../_components/StockOpnameItemTable"
import {
  useApproveStockOpname,
  useCompleteStockOpname,
  useReopenStockOpname,
  useStockOpnameSession,
} from "@/lib/react-query/hooks/use-stock-opname"
import { useBranches } from "@/lib/react-query/hooks/use-branches"
import { usePawnTerms } from "@/lib/react-query/hooks/use-pawn-terms"
import { matchSpkItemToMataRules } from "@/lib/utils/mata-rule-matcher"
import type { SpkItem, PawnTerm } from "@/lib/api/types"

// Skeleton components
function DetailSOSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="mb-6 flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b border-dashed pb-3">
            <Skeleton className="h-1 w-8 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="grid items-start gap-6 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-dashed pt-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-full" />
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
        <div className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-8" />
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-10" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-48" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function StockOpnameDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user } = useAuth()
  const isCompanyAdmin = useMemo(
    () => user?.roles?.some((r) => r.code === "company_admin") ?? false,
    [user]
  )
  const isStockAuditor = useMemo(
    () => user?.roles?.some((r) => r.code === "stock_auditor") ?? false,
    [user]
  )
  const stockListHref = isStockAuditor
    ? "/stock-opname/auditor"
    : "/stock-opname"

  // Fetch stock opname session detail from API
  const {
    data: session,
    isLoading,
    isError,
    refetch,
  } = useStockOpnameSession(slug)

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = React.useState(false)
  const [isReopenConfirmOpen, setIsReopenConfirmOpen] = React.useState(false)

  const completeMutation = useCompleteStockOpname()
  const approveMutation = useApproveStockOpname()
  const reopenMutation = useReopenStockOpname()

  const canApprove =
    isCompanyAdmin &&
    session &&
    ["in_progress", "completed"].includes(session.status)

  const canReopen = isCompanyAdmin && session && session.status === "completed"

  const handleApproveConfirm = useCallback(async () => {
    if (!slug || !session || !canApprove) return
    const isPending = completeMutation.isPending || approveMutation.isPending
    if (isPending) return
    try {
      if (session.status === "in_progress") {
        await completeMutation.mutateAsync(slug)
      }
      await approveMutation.mutateAsync(slug)
      toast.success("Stock opname berhasil disetujui")
      setIsApproveConfirmOpen(false)
      refetch()
    } catch {
      toast.error("Gagal menyetujui stock opname")
    }
  }, [slug, session, canApprove, completeMutation, approveMutation, refetch])

  const handleReopenConfirm = useCallback(async () => {
    if (!slug || !session || !canReopen) return
    if (reopenMutation.isPending) return
    try {
      await reopenMutation.mutateAsync(slug)
      toast.success(
        "Stock opname dikembalikan ke status dijadwalkan. Staff SO dapat melakukan scan ulang."
      )
      setIsReopenConfirmOpen(false)
      refetch()
    } catch {
      toast.error("Gagal mengembalikan stock opname ke dijadwalkan")
    }
  }, [slug, session, canReopen, reopenMutation, refetch])

  // Fetch branches for store name resolution
  const { data: branchesData } = useBranches({ pageSize: 500 })
  const storeNameById = useMemo(() => {
    const map = new Map<string, string>()
    branchesData?.data?.forEach((b) =>
      map.set(b.uuid, b.shortName ?? b.fullName ?? b.uuid)
    )
    return map
  }, [branchesData?.data])

  // Fetch pawn terms for mata rule matching
  const { data: pawnTermsData } = usePawnTerms({ pageSize: 500 })
  const pawnTerms = useMemo(
    () => (pawnTermsData?.data ?? []) as PawnTerm[],
    [pawnTermsData?.data]
  )

  // Resolve store names and assignee names from session
  const storeNamesStr = useMemo(() => {
    if (!session?.stores?.length) return ""
    return session.stores
      .map(
        (s) => s.shortName ?? s.fullName ?? storeNameById.get(s.uuid) ?? s.uuid
      )
      .join(", ")
  }, [session, storeNameById])

  const assigneeNamesStr = useMemo(() => {
    if (!session?.assignees?.length) return session?.creatorFullName ?? "—"
    return session.assignees
      .map((a) => a.fullName ?? a.name ?? a.uuid)
      .join(", ")
  }, [session])

  // Map API items to table format and apply mata rules
  const { items, mataRuleNames } = useMemo(() => {
    if (!session?.items?.length)
      return { items: [], mataRuleNames: [] as string[] }

    const ruleNamesSet = new Set<string>()
    const mapped: StockOpnameItem[] = session.items.map((apiItem) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const si = (apiItem as any).spkItem ?? apiItem.spkItem
      const spkNumber = si?.spk?.spkNumber ?? "—"
      const description = si?.description ?? "—"
      const typeName = si?.itemType?.typeName ?? "—"
      const photoUrl = si?.evidencePhotos?.[0] ?? ""
      const isCounted =
        apiItem.countedQuantity != null && apiItem.countedQuantity > 0

      // Apply mata rule if spkItem is available
      let isMata = false
      let mataRuleName: string | undefined
      if (si) {
        const spkItemForMata: SpkItem = {
          uuid: si.uuid ?? "",
          spkId: si.spkId ?? "",
          itemTypeId: si.itemTypeId ?? "",
          description: si.description ?? "",
          appraisedValue: si.appraisedValue ?? "0",
          estimatedValue: si.appraisedValue ? parseFloat(si.appraisedValue) : 0,
          itemType: si.itemType
            ? { uuid: si.itemType.uuid, typeName: si.itemType.typeName }
            : undefined,
        } as SpkItem
        const ptId = session.ptId ?? ""
        const mataResult = matchSpkItemToMataRules(
          spkItemForMata,
          pawnTerms,
          ptId
        )
        isMata = mataResult.isMata
        mataRuleName = mataResult.mataRuleName
        if (isMata && mataRuleName) {
          ruleNamesSet.add(mataRuleName)
        }
      }

      return {
        id: apiItem.uuid ?? apiItem.id ?? apiItem.itemId,
        foto: photoUrl,
        noSPK: spkNumber,
        namaBarang: description,
        tipeBarang: typeName,
        toko: storeNamesStr || "—",
        petugas: assigneeNamesStr,
        statusScan: isCounted
          ? ("Terscan" as const)
          : ("Belum Terscan" as const),
        isMata,
        mataRuleName,
      }
    })

    return { items: mapped, mataRuleNames: Array.from(ruleNamesSet) }
  }, [session, storeNamesStr, assigneeNamesStr, pawnTerms])

  const handleItemDetail = (item: StockOpnameItem) => {
    router.push(`/stock-opname/${slug}/item/${item.id}`)
  }

  if (isError && !isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Stock Opname / Detail</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Data tidak ditemukan</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(stockListHref)}
            >
              Kembali ke Stock Opname
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Stock Opname / Detail</h1>
          <Breadcrumbs
            items={[
              { label: "Pages", href: "/" },
              { label: "Stock Opname", href: stockListHref },
              { label: "Detail" },
            ]}
          />
        </div>

        <div className="flex items-center gap-2">
          {session?.status === "draft" && !isCompanyAdmin ? (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="size-4" />
              Edit Jadwal
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2"
                disabled={!canApprove && !canReopen}
              >
                Approval
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="gap-2"
                onClick={() => setIsApproveConfirmOpen(true)}
                disabled={!canApprove}
              >
                <CheckCheck className="size-4" />
                Setujui
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() => setIsReopenConfirmOpen(true)}
                disabled={!canReopen}
              >
                <Hand className="size-4" />
                Tolak / Retur
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditJadwalSODialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        session={session ?? null}
        onSuccess={() => refetch()}
      />

      <ConfirmationDialog
        open={isApproveConfirmOpen}
        onOpenChange={setIsApproveConfirmOpen}
        onConfirm={handleApproveConfirm}
        title="Setujui Stock Opname?"
        description="Anda akan menyetujui stock opname ini."
        note="Pastikan kembali sebelum menyetujui."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />

      <ConfirmationDialog
        open={isReopenConfirmOpen}
        onOpenChange={setIsReopenConfirmOpen}
        onConfirm={handleReopenConfirm}
        title="Tolak / Retur Stock Opname?"
        description="Stock opname akan dikembalikan ke status dijadwalkan dan data hasil scan sebelumnya akan direset."
        note="Pastikan Anda benar-benar ingin mengembalikan stock opname ini untuk dilakukan ulang."
        confirmLabel="Ya"
        cancelLabel="Batal"
        variant="info"
      />

      {/* Detail SO Section */}
      {isLoading ? (
        <DetailSOSkeleton />
      ) : session ? (
        <DetailSO session={session} mataRuleNames={mataRuleNames} />
      ) : null}

      {/* Daftar Item Section */}
      {isLoading ? (
        <ItemTableSkeleton />
      ) : (
        <StockOpnameItemTable data={items} onDetailAction={handleItemDetail} />
      )}
    </div>
  )
}
