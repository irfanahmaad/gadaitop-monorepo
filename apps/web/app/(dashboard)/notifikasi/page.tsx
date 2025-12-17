"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@/components/data-table"
import { ArrowLeft } from "lucide-react"

// Sample data type
type Notifikasi = {
  id: string
  namaNotifikasi: string
  keterangan: string
  tanggalWaktu: string
}

// Sample data
const sampleData: Notifikasi[] = Array.from({ length: 10 }, (_, i) => ({
  id: `NOTIF${String(i + 1).padStart(3, "0")}`,
  namaNotifikasi: "Lorem ipsum dolor sit amet consectetur.",
  keterangan:
    "Lorem ipsum dolor sit amet consectetur. Maecenas nibh rhoncus dolor eget tellus tempus.",
  tanggalWaktu: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  ),
}))

// Column definitions
const columns: ColumnDef<Notifikasi>[] = [
  {
    id: "no",
    header: "No",
    size: 60,
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex((r) => r.id === row.id)
      const currentPage = table.getState().pagination.pageIndex
      const pageSize = table.getState().pagination.pageSize
      return currentPage * pageSize + index + 1
    },
  },
  {
    accessorKey: "namaNotifikasi",
    header: "Nama Notifikasi",
    size: 200,
    cell: ({ row }) => {
      return (
        <div
          className="max-w-[200px] truncate"
          title={row.getValue("namaNotifikasi")}
        >
          {row.getValue("namaNotifikasi")}
        </div>
      )
    },
  },
  {
    accessorKey: "keterangan",
    header: "Keterangan",
    size: 300,
    cell: ({ row }) => {
      return (
        <div
          className="max-w-[300px] truncate"
          title={row.getValue("keterangan")}
        >
          {row.getValue("keterangan")}
        </div>
      )
    },
  },
  {
    accessorKey: "tanggalWaktu",
    header: "Tanggal & Waktu",
    size: 180,
  },
]

export default function NotifikasiPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Notifikasi</h1>
            <Breadcrumbs
              items={[{ label: "Pages", href: "/" }, { label: "Notifikasi" }]}
            />
          </div>

          <div>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 size-4" />
              Kembali
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={sampleData}
          title="Daftar Notifikasi"
          searchPlaceholder="Search"
        />
      </div>
    </>
  )
}
