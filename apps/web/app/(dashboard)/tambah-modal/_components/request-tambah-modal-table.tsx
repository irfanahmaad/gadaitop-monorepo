"use client"

import React, { useMemo } from "react"
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
import { SearchIcon, SlidersHorizontal } from "lucide-react"
import type { RequestTambahModal } from "./types"
import { getBaseColumns, getRequestActionColumn } from "./tambah-modal-columns"
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
  onEdit: (row: RequestTambahModal) => void
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
  onEdit,
}: RequestTambahModalTableProps) {
  const columns = useMemo(
    () => [...getBaseColumns(), getRequestActionColumn(onApprove, onReject, onEdit)],
    [onApprove, onReject, onEdit]
  )

  if (isLoading) {
    return <TambahModalTableSkeleton />
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      title="Daftar Request Tambah Modal"
      searchPlaceholder="Cari..."
      headerRight={
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
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
              placeholder="Cari..."
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
        </div>
      }
      initialPageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    />
  )
}
