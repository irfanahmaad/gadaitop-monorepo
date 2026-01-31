"use client"

import React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { Check, Ban, MoreHorizontal } from "lucide-react"
import type { RequestTambahModal } from "./types"
import { formatTanggalRequest, formatNominal } from "./utils"
import { StatusBadge } from "./status-badge"

export function getBaseColumns(): ColumnDef<RequestTambahModal>[] {
  return [
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
      accessorKey: "tanggalRequest",
      header: "Tanggal Request",
      cell: ({ row }) => {
        const { dateStr, timeStr } = formatTanggalRequest(
          row.getValue("tanggalRequest")
        )
        return (
          <div className="flex flex-col">
            <span className="text-sm">{dateStr}</span>
            <span className="text-xs text-muted-foreground">{timeStr}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "dilakukanOleh",
      header: "Dilakukan Oleh",
      cell: ({ row }) => {
        const user = row.original.dilakukanOleh
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{user.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "namaToko",
      header: "Nama Toko",
    },
    {
      accessorKey: "alias",
      header: "Alias",
    },
    {
      accessorKey: "nominal",
      header: "Nominal",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {formatNominal(row.getValue("nominal"))}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
  ]
}

export function getRequestActionColumn(
  onApprove: (row: RequestTambahModal) => void,
  onReject: (row: RequestTambahModal) => void
): ColumnDef<RequestTambahModal> {
  return {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Action</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onApprove(row.original)}>
            <Check className="mr-2 h-4 w-4" />
            Setujui
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onReject(row.original)}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="mr-2 h-4 w-4" />
            Tolak
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }
}
