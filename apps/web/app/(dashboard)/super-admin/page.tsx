"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@/components/data-table"

// Sample data type
type SuperAdmin = {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

// Sample data
const sampleData: SuperAdmin[] = Array.from({ length: 100 }, (_, i) => ({
  id: `SA${String(i + 1).padStart(3, "0")}`,
  name: `Super Admin ${i + 1}`,
  email: `admin${i + 1}@example.com`,
  role: i % 3 === 0 ? "Administrator" : i % 3 === 1 ? "Manager" : "Supervisor",
  status: i % 2 === 0 ? "Active" : "Inactive",
  createdAt: new Date(2024, 0, i + 1).toLocaleDateString("id-ID"),
}))

// Column definitions
const columns: ColumnDef<SuperAdmin>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === "Active"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`}
        >
          {status}
        </span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
]

export default function SuperAdminPage() {
  const router = useRouter()

  const handleDetail = (row: SuperAdmin) => {
    router.push(`/super-admin/${row.id}`)
  }

  const handleEdit = (row: SuperAdmin) => {
    router.push(`/super-admin/${row.id}/edit`)
  }

  const handleDelete = (row: SuperAdmin) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      console.log("Delete:", row)
      // Implement delete action
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Super Admin</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Pages</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Master Super Admin</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div>
            <Button onClick={() => router.push("/super-admin/create")}>
              Tambah Data
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={sampleData}
          title="Daftar Super Admin"
          searchPlaceholder="Search..."
          onDetail={handleDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  )
}
