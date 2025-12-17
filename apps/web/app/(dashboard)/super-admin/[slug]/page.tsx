"use client"

import React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2, IdCard, User } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"

// Sample data - in a real app, this would come from an API
const sampleSuperAdmin = {
  id: "SA001",
  name: "Agung Prasetyo Setiadi",
  email: "agung.pras@mail.com",
  phone: "0812345678910",
  image: "/placeholder-avatar.jpg", // Replace with actual image URL
}

export default function DetailSuperAdminPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  // In a real app, fetch data based on slug
  const superAdmin = sampleSuperAdmin

  const handleEdit = () => {
    // Navigate to edit page
    router.push(`/super-admin/${slug}/edit`)
  }

  const handleDelete = () => {
    // Handle delete logic
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      // Perform delete action
      router.push("/super-admin")
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{superAdmin.name}</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Pages</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/super-admin">Master Super Admin</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-destructive">
                    Detail
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="mr-2 size-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 size-4" />
              Hapus
            </Button>
          </div>
        </div>

        {/* Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Data Super Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <Avatar className="size-48">
                  <AvatarImage src={superAdmin.image} alt={superAdmin.name} />
                  <AvatarFallback>
                    <User className="text-muted-foreground size-24" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Detail Information */}
              <div className="space-y-4">
                {/* Detail Super Admin Label */}
                <div className="flex items-center gap-3">
                  <IdCard className="text-destructive size-6" />
                  <h2 className="text-destructive text-lg font-semibold">
                    Detail Super Admin
                  </h2>
                </div>

                {/* Data Fields */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Nama Lengkap */}
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Nama Lengkap
                    </label>
                    <p className="text-base">{superAdmin.name}</p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      E-mail
                    </label>
                    <p className="text-base">{superAdmin.email}</p>
                  </div>

                  {/* No. Telp */}
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      No. Telp
                    </label>
                    <p className="text-base">{superAdmin.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
