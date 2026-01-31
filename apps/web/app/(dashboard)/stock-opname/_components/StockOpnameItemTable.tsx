"use client"

import React, { useState, useCallback, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table"
import { Badge } from "@workspace/ui/components/badge"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { SearchIcon, SlidersHorizontal, Package, QrCode, Info, MoreHorizontal } from "lucide-react"
import { QRCodeDialog } from "./QRCodeDialog"
import type { FilterConfig } from "@/hooks/use-filter-params"

const STOCK_OPNAME_ITEM_FILTER_CONFIG: FilterConfig[] = [
  {
    key: "dateRange",
    label: "",
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
    options: [
      { label: "GT Jakarta Satu", value: "GT Jakarta Satu" },
      { label: "GT Jakarta Dua", value: "GT Jakarta Dua" },
      { label: "GT Jakarta Tiga", value: "GT Jakarta Tiga" },
      { label: "GT Jakarta Empat", value: "GT Jakarta Empat" },
    ],
  },
]

export type StockOpnameItem = {
  id: string
  foto?: string
  noSPK: string
  namaBarang: string
  tipeBarang: string
  toko: string
  petugas: string
  statusScan: "Belum Terscan" | "Terscan"
}

type StockOpnameItemTableProps = {
  data: StockOpnameItem[]
  onDetailAction?: (item: StockOpnameItem) => void
}

const StatusScanBadge = ({
  status,
}: {
  status: StockOpnameItem["statusScan"]
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

function createColumns(
  onScanClick: (noSPK: string) => void,
  onDetail: (item: StockOpnameItem) => void
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
        const noSPK = item.noSPK
        const isBelumTerscan = item.statusScan === "Belum Terscan"
        return (
          <div className="flex items-center gap-2">
            <span>{noSPK}</span>
            {isBelumTerscan && (
              <Button
                variant="outline"
                size="icon"
                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive size-8 shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onScanClick(noSPK)
                }}
                aria-label="Tampilkan QR Code"
              >
                <QrCode className="size-4" />
              </Button>
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
      accessorKey: "statusScan",
      header: "Status Scan",
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
                <Info className="size-4" />
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onClick={() => onScanClick(item.noSPK)}
              >
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

const defaultFilterValues: Record<string, unknown> = {
  dateRange: { from: null, to: null },
  tipeBarang: [],
  toko: [],
}

export function StockOpnameItemTable({
  data,
  onDetailAction: onItemDetail,
}: StockOpnameItemTableProps) {
  const [pageSize, setPageSize] = useState(10)
  const [searchValue, setSearchValue] = useState("")
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [filterValues, setFilterValues] =
    useState<Record<string, unknown>>(defaultFilterValues)
  const [qrDialog, setQrDialog] = useState<{ open: boolean; value: string }>({
    open: false,
    value: "",
  })

  const handleScanClick = useCallback((noSPK: string) => {
    setQrDialog({ open: true, value: noSPK })
  }, [])

  const filteredData = useMemo(() => {
    let result = data
    const tipeBarang = filterValues.tipeBarang as string[] | undefined
    const toko = filterValues.toko as string[] | undefined
    if (tipeBarang?.length) {
      result = result.filter((row) => tipeBarang.includes(row.tipeBarang))
    }
    if (toko?.length) {
      result = result.filter((row) => toko.includes(row.toko))
    }
    return result
  }, [data, filterValues.tipeBarang, filterValues.toko])

  const columns = React.useMemo(
    () => createColumns(handleScanClick, onItemDetail ?? (() => {})),
    [handleScanClick, onItemDetail]
  )

  const getRowClassName = useCallback((row: StockOpnameItem) => {
    if (row.statusScan === "Belum Terscan") {
      return "!bg-red-50 dark:!bg-red-950/50"
    }
    return ""
  }, [])

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        getRowClassName={getRowClassName}
        title="Daftar Item"
        searchPlaceholder="Cari..."
        filterConfig={STOCK_OPNAME_ITEM_FILTER_CONFIG}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        filterDialogOpen={filterDialogOpen}
        onFilterDialogOpenChange={setFilterDialogOpen}
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
        initialPageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <QRCodeDialog
        open={qrDialog.open}
        onOpenChange={(open) => setQrDialog((prev) => ({ ...prev, open }))}
        value={qrDialog.value}
      />
    </>
  )
}
