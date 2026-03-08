"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { DataTable } from "@/components/data-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import { Package, Eye, MoreHorizontal, QrCode } from "lucide-react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { SearchIcon } from "lucide-react"
import { useStockOpnameSession } from "@/lib/react-query/hooks/use-stock-opname"
import { usePawnTerms } from "@/lib/react-query/hooks/use-pawn-terms"
import { matchSpkItemToMataRules } from "@/lib/utils/mata-rule-matcher"
import type { SpkItem, PawnTerm } from "@/lib/api/types"
import type { StockOpnameItem as ApiStockOpnameItem } from "@/lib/api/types"
import { type StockOpnameItem } from "../../_components/StockOpnameItemTable"
import { StockOpnameItemDetailDialog } from "../../_components/StockOpnameItemDetailDialog"
import { QRCodeDialog } from "@/app/(dashboard)/_components/QRCodeDialog"
import { QRScanDialog } from "@/components/qr-scan-dialog"

// Dummy data for progress and table rows when session has no items (until API provides)
const DUMMY_PROGRESS_PERCENT = 60

const DUMMY_ITEMS_BELUM_TERSCAN: StockOpnameItem[] = [
  {
    id: "dummy-belum-1",
    noSPK: "SPK/2025/001",
    namaBarang: "iPhone 15 Pro",
    tipeBarang: "Handphone",
    toko: "GT Jakarta Satu",
    petugas: "—",
    statusScan: "Belum Terscan",
  },
  {
    id: "dummy-belum-2",
    noSPK: "SPK/2025/002",
    namaBarang: "Google Smarthome",
    tipeBarang: "IoT",
    toko: "GT Jakarta Dua",
    petugas: "—",
    statusScan: "Belum Terscan",
  },
  {
    id: "dummy-belum-3",
    noSPK: "SPK/2025/003",
    namaBarang: "MacBook Pro M1",
    tipeBarang: "Laptop",
    toko: "GT Jakarta Dua",
    petugas: "—",
    statusScan: "Belum Terscan",
  },
  {
    id: "dummy-belum-4",
    noSPK: "SPK/2025/004",
    namaBarang: "MacBook Pro M2",
    tipeBarang: "Laptop",
    toko: "GT Jakarta Tiga",
    petugas: "—",
    statusScan: "Belum Terscan",
  },
]

const DUMMY_ITEMS_TERSCAN: StockOpnameItem[] = [
  {
    id: "dummy-terscan-1",
    noSPK: "SPK/2025/005",
    namaBarang: "Samsung Galaxy S24",
    tipeBarang: "Handphone",
    toko: "GT Jakarta Satu",
    petugas: "—",
    statusScan: "Terscan",
  },
  {
    id: "dummy-terscan-2",
    noSPK: "SPK/2025/006",
    namaBarang: "iPad Pro",
    tipeBarang: "Tablet",
    toko: "GT Jakarta Dua",
    petugas: "—",
    statusScan: "Terscan",
  },
]

function formatDate(isoDate: string): string {
  try {
    return format(new Date(isoDate), "d MMMM yyyy HH:mm 'WIB'", {
      locale: idLocale,
    })
  } catch {
    return isoDate
  }
}

function formatLastUpdated(isoDate: string | undefined | null): string {
  if (isoDate == null || isoDate === "") return "—"
  try {
    const d = new Date(isoDate)
    if (Number.isNaN(d.getTime())) return "—"
    return format(d, "d MMMM yyyy HH:mm 'WIB'", { locale: idLocale })
  } catch {
    return "—"
  }
}

function DetailCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid items-start gap-6 md:grid-cols-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="mt-2 h-2 w-full rounded-full" />
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
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
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
      </CardContent>
    </Card>
  )
}

const StatusScanBadge = ({
  status,
}: {
  status: "Belum Terscan" | "Terscan"
}) => {
  const config =
    status === "Terscan"
      ? {
          label: "Terscan",
          className:
            "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
        }
      : {
          label: "Belum Terscan",
          className:
            "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

function createItemColumns(
  onDetail: (item: StockOpnameItem) => void,
  onQrSPK: (item: StockOpnameItem) => void
): ColumnDef<StockOpnameItem>[] {
  return [
    {
      id: "no",
      header: "No",
      cell: ({ row, table }) => {
        const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
        return index + 1
      },
    },
    {
      id: "foto",
      accessorKey: "foto",
      header: "Foto",
      cell: ({ row }) => {
        const item = row.original
        return (
          <Avatar className="size-12">
            <AvatarImage src={item.foto} alt={item.namaBarang} />
            <AvatarFallback>
              <Package className="size-5" />
            </AvatarFallback>
          </Avatar>
        )
      },
    },
    {
      accessorKey: "noSPK",
      header: "No.SPK",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-2">
            <span>{item.noSPK}</span>
            {item.isMata && (
              <Eye className="text-destructive size-4 shrink-0" aria-hidden />
            )}
          </div>
        )
      },
    },
    { accessorKey: "namaBarang", header: "Nama Barang" },
    { accessorKey: "tipeBarang", header: "Tipe Barang" },
    { accessorKey: "toko", header: "Toko" },
    {
      id: "tanggalValidasi",
      header: "Tanggal Validasi",
      cell: () => "—",
    },
    {
      accessorKey: "statusScan",
      header: "Status",
      cell: ({ row }) => (
        <StatusScanBadge status={row.getValue("statusScan")} />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const item = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Action</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2"
                onClick={() => onDetail(item)}
              >
                <Eye className="size-4" />
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => onQrSPK(item)}>
                <QrCode className="size-4" />
                QR SPK
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

export default function StockOpnameAuditorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user, isLoading: isAuthLoading } = useAuth()
  const isStockAuditor = useMemo(
    () => user?.roles?.some((r) => r.code === "stock_auditor") ?? false,
    [user]
  )

  const {
    data: session,
    isLoading: isSessionLoading,
    isError,
  } = useStockOpnameSession(slug, { enabled: !!slug && !!user })

  const { data: pawnTermsData } = usePawnTerms({ pageSize: 500 })
  const pawnTerms = useMemo(
    () => (pawnTermsData?.data ?? []) as PawnTerm[],
    [pawnTermsData?.data]
  )

  const storeNamesStr = useMemo(() => {
    if (!session?.stores?.length) return ""
    return session.stores
      .map((s) => s.shortName ?? s.fullName ?? s.uuid)
      .join(", ")
  }, [session])

  const assigneeNamesStr = useMemo(() => {
    if (!session?.assignees?.length) return session?.creatorFullName ?? "—"
    return session.assignees
      .map((a) => a.fullName ?? a.name ?? a.uuid)
      .join(", ")
  }, [session])

  const { items } = useMemo(() => {
    if (session?.items?.length) {
      const mapped: StockOpnameItem[] = session.items.map((apiItem) => {
      const si = (apiItem as any).spkItem ?? apiItem.spkItem
      const spkNumber = si?.spk?.spkNumber ?? "—"
      const description = si?.description ?? "—"
      const typeName = si?.itemType?.typeName ?? "—"
      const photoUrl = si?.evidencePhotos?.[0] ?? ""
      const isCounted =
        apiItem.countedQuantity != null && apiItem.countedQuantity > 0

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
      return { items: mapped }
    }
    return {
      items: [...DUMMY_ITEMS_BELUM_TERSCAN, ...DUMMY_ITEMS_TERSCAN],
    }
  }, [session, storeNamesStr, assigneeNamesStr, pawnTerms])

  const [activeTab, setActiveTab] = useState<"belum-terscan" | "terscan">(
    "belum-terscan"
  )
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [itemDetailOpen, setItemDetailOpen] = useState(false)
  const [selectedApiItem, setSelectedApiItem] =
    useState<ApiStockOpnameItem | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [selectedQrSPK, setSelectedQrSPK] = useState("")
  const [scanDialogOpen, setScanDialogOpen] = useState(false)

  const belumTerscanCount = useMemo(
    () => items.filter((i) => i.statusScan === "Belum Terscan").length,
    [items]
  )
  const terscanCount = useMemo(
    () => items.filter((i) => i.statusScan === "Terscan").length,
    [items]
  )
  const progressPercent = DUMMY_PROGRESS_PERCENT

  const filteredItems = useMemo(() => {
    if (activeTab === "belum-terscan") {
      return items.filter((i) => i.statusScan === "Belum Terscan")
    }
    return items.filter((i) => i.statusScan === "Terscan")
  }, [items, activeTab])

  const columns = useMemo(
    () =>
      createItemColumns(
        (item) => {
          const apiItem = session?.items?.find(
            (i) =>
              (i as ApiStockOpnameItem).uuid === item.id ||
              (i as ApiStockOpnameItem).id === item.id
          ) as ApiStockOpnameItem | undefined
          setSelectedApiItem(apiItem ?? null)
          setItemDetailOpen(true)
        },
        (item) => {
          setSelectedQrSPK(item.noSPK)
          setQrDialogOpen(true)
        }
      ),
    [session?.items]
  )

  useEffect(() => {
    if (user != null && !isStockAuditor) {
      router.replace("/stock-opname")
    }
  }, [user, isStockAuditor, router])

  const isLoading = isAuthLoading || isSessionLoading

  if (user != null && !isStockAuditor) {
    return null
  }

  if (isError && !isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Detail Batch</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">Data tidak ditemukan</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/stock-opname/auditor")}
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
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {isLoading ? (
            <Skeleton className="inline-block h-8 w-24" />
          ) : (
            (session?.sessionCode ?? slug)
          )}
        </h1>
        <Breadcrumbs
          items={[
            { label: "Pages", href: "/" },
            { label: "Stock Opname", href: "/stock-opname/auditor" },
            { label: "Detail Batch", className: "text-destructive" },
          ]}
        />
      </div>

      {/* Detail Stock Opname Card */}
      {isLoading ? (
        <DetailCardSkeleton />
      ) : session ? (
        <Card>
          <CardHeader>
            <CardTitle>Detail Stock Opname</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid items-start gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    ID SO
                  </label>
                  <p className="text-base">
                    {session.sessionCode ?? session.uuid}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Tanggal Validasi
                  </label>
                  <p className="text-base">—</p>
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Petugas SO
                  </label>
                  <p className="text-base">{assigneeNamesStr}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Jumlah Item
                  </label>
                  <p className="text-base">{session.items?.length ?? 0}</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Catatan
                  </label>
                  <p className="text-base">{session.notes || "—"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Tanggal
                  </label>
                  <p className="text-base">
                    {formatDate(
                      session.startDate ??
                        session.scheduledDate ??
                        session.createdAt
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Nama Toko
                  </label>
                  <p className="text-base">{storeNamesStr || "—"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Syarat &quot;Mata&quot;
                  </label>
                  <p className="text-base">
                    {(session.pawnTerms?.length ?? 0) > 0
                      ? (session.pawnTerms
                          ?.map(
                            (pt) =>
                              pt.ruleName?.trim() ||
                              pt.itemType?.typeName ||
                              pt.uuid
                          )
                          .join(", ") ?? "—")
                      : "—"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Last Updated At
                  </label>
                  <p className="text-base">
                    {formatLastUpdated(session.updatedAt ?? session.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Progress Item Terscan (dummy data) */}
      {isLoading ? (
        <ProgressSkeleton />
      ) : (
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <Package className="text-destructive size-6" />
              <span className="text-base font-medium">
                {progressPercent}% Item Terscan
              </span>
            </div>
            <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-destructive h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Belum Terscan | Terscan */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "belum-terscan" | "terscan")}
        className="flex flex-col gap-4"
      >
        <TabsList className="border-border h-auto w-fit gap-0 rounded-none border-b bg-transparent">
          <TabsTrigger
            value="belum-terscan"
            className="data-[state=active]:border-destructive data-[state=active]:text-destructive flex items-center rounded-none border-b-2 border-transparent px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Belum Terscan
            <span
              className={`ml-2 flex size-5 items-center justify-center rounded-full text-xs font-medium ${
                activeTab === "belum-terscan"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {belumTerscanCount}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="terscan"
            className="data-[state=active]:border-destructive data-[state=active]:text-destructive flex items-center rounded-none border-b-2 border-transparent px-4 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Terscan
            <span
              className={`ml-2 flex size-5 items-center justify-center rounded-full text-xs font-medium ${
                activeTab === "terscan"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {terscanCount}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Item Lelang Table */}
        <TabsContent value="belum-terscan" className="mt-0">
          {isLoading ? (
            <ItemTableSkeleton />
          ) : (
            <DataTable
              columns={columns}
              data={filteredItems}
              searchPlaceholder="Cari..."
              headerLeft={
                <CardTitle className="text-xl">Item Lelang</CardTitle>
              }
              headerRight={
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(v) => setPageSize(Number(v))}
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
                    onClick={() => {}}
                  >
                    Filter
                  </Button>
                  <Button
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                    onClick={() => setScanDialogOpen(true)}
                  >
                    <QrCode className="size-4" />
                    Scan QR
                  </Button>
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
            />
          )}
        </TabsContent>
        <TabsContent value="terscan" className="mt-0">
          {isLoading ? (
            <ItemTableSkeleton />
          ) : (
            <DataTable
              columns={columns}
              data={filteredItems}
              searchPlaceholder="Cari..."
              headerLeft={
                <CardTitle className="text-xl">Item Lelang</CardTitle>
              }
              headerRight={
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(v) => setPageSize(Number(v))}
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
                    onClick={() => {}}
                  >
                    Filter
                  </Button>
                  <Button
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                    onClick={() => setScanDialogOpen(true)}
                  >
                    <QrCode className="size-4" />
                    Scan QR
                  </Button>
                </div>
              }
              initialPageSize={pageSize}
              onPageSizeChange={setPageSize}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
            />
          )}
        </TabsContent>
      </Tabs>

      <QRScanDialog
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
        onScan={(value) => {
          const item = items.find(
            (i) => i.id === value || i.noSPK === value
          )
          const itemId = item?.id ?? value
          setScanDialogOpen(false)
          router.push(
            `/stock-opname/auditor/${slug}/item/${itemId}/penilaian`
          )
        }}
      />
      <StockOpnameItemDetailDialog
        open={itemDetailOpen}
        onOpenChange={setItemDetailOpen}
        apiItem={selectedApiItem}
      />
      <QRCodeDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        value={selectedQrSPK}
        title="QR Code SPK"
      />
    </div>
  )
}
