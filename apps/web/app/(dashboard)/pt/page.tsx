"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@/components/data-table"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import { Building2, Plus } from "lucide-react"

// Sample data type
type PT = {
  id: string
  code: string
  name: string
  email: string
  phone: string
  image?: string
  adminPrimary: string
}

// Sample data
const sampleData: PT[] = Array.from({ length: 6 }, (_, i) => ({
  id: `PT${String(i + 1).padStart(3, "0")}`,
  code: `PT${String(i + 1).padStart(3, "0")}`,
  name: i % 2 === 0 ? "PT Gadai Top Indonesia" : "PT Gadai Top Premium",
  email: i % 2 === 0 ? "gadaitop@mail.com" : "gadai_top@mail.com",
  phone: "081234567891012",
  image: "/commons/img_logo-gadai-top-img-only.png",
  adminPrimary: "Ben Affleck",
}))

// Column definitions
const columns: ColumnDef<PT>[] = [
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
    accessorKey: "image",
    header: "Foto",
    cell: ({ row }) => {
      const pt = row.original
      return (
        <Avatar className="size-10">
          <AvatarImage src={pt.image} alt={pt.name} />
          <AvatarFallback>
            <Building2 className="size-5" />
          </AvatarFallback>
        </Avatar>
      )
    },
  },
  {
    id: "code",
    accessorKey: "code",
    header: "Kode PT",
  },
  {
    accessorKey: "name",
    header: "Nama PT",
  },
  {
    accessorKey: "email",
    header: "E-mail PT",
  },
  {
    accessorKey: "phone",
    header: "No. Telp PT",
  },
  {
    accessorKey: "adminPrimary",
    header: "Admin Primary",
  },
]

export default function PTListPage() {
  const router = useRouter()

  const handleDetail = (row: PT) => {
    router.push(`/pt/${row.id}`)
  }

  const handleEdit = (row: PT) => {
    router.push(`/pt/${row.id}/edit`)
  }

  const handleDelete = (row: PT) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      console.log("Delete:", row)
      // Implement delete action
    }
  }

  const handleCreate = () => {
    router.push("/pt/create")
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Master PT</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Master PT" },
              ]}
            />
          </div>

          <div>
            <Button onClick={handleCreate}>
              <Plus className="size-5" />
              Tambah Data
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={sampleData}
          title="Daftar PT"
          searchPlaceholder="Search"
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  )
}
