"use client"

import React, { useMemo, useState } from "react"
import { DataTable } from "@/components/data-table"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import { SearchIcon, SlidersHorizontal, Trash2 } from "lucide-react"
import type { RequestTambahModal } from "./types"
import { getRequestColumns, getRequestActionColumn } from "./tambah-modal-columns"
import { TambahModalTableSkeleton } from "./tambah-modal-table-skeleton"

type RequestTambahModalTableProps = {
  data: RequestTambahModal[]
  isLoading?: boolean
  pageSize: number
  onPageSizeChange: (size: number) => void
  searchValue: string
  onSearchChange: (value: string) => void
  onOpenFilter?: () => void
  onApprove: (row: RequestTambahModal) => void
  onReject: (row: RequestTambahModal) => void
  onDetail?: (row: RequestTambahModal) => void
  onEdit?: (row: RequestTambahModal) => void
  onBulkDelete?: (rows: RequestTambahModal[]) => void
  resetSelectionKey?: number | string
}

export function RequestTambahModalTable({
  data,
  isLoading = false,
  pageSize,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  onOpenFilter,
  onApprove,
  onReject,
  onDetail,
  onEdit,
  onBulkDelete,
  resetSelectionKey,
}: RequestTambahModalTableProps) {
  const [selectedRows, setSelectedRows] = useState<RequestTambahModal[]>([])

  const columns = useMemo(
    () => [
      ...getRequestColumns(),
      getRequestActionColumn(onApprove, onReject, {
        onEdit,
        onDetail,
      }),
    ],
    [onApprove, onReject, onEdit, onDetail]
  )

  if (isLoading) {
    return <TambahModalTableSkeleton />
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      title="Daftar Request Tambah Modal"
      searchPlaceholder="Cari berdasarkan toko atau pengguna"
      onSelectionChange={setSelectedRows}
      resetSelectionKey={resetSelectionKey}
      headerRight={
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {selectedRows.length > 0 && onBulkDelete ? (
            <>
              <span className="text-sm font-medium">
                {selectedRows.length} Selected
              </span>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => onBulkDelete(selectedRows)}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </>
          ) : (
            <>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => onPageSizeChange(Number(value))}
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
                  placeholder="Cari berdasarkan toko atau pengguna"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  icon={<SearchIcon className="size-4" />}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={onOpenFilter}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button>
            </>
          )}
        </div>
      }
      initialPageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    />
  )
}
