"use client"

import React from "react"
import { Badge } from "@workspace/ui/components/badge"
import type { RequestTambahModal } from "./types"

const statusConfig: Record<
  RequestTambahModal["status"],
  string
> = {
  Pending:
    "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  Disetujui:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Selesai:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  Ditolak:
    "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
}

export function StatusBadge({
  status,
}: {
  status: RequestTambahModal["status"]
}) {
  return (
    <Badge variant="outline" className={statusConfig[status]}>
      {status}
    </Badge>
  )
}
