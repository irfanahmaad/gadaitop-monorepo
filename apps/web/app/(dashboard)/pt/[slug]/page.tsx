"use client"

import React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2, Building2, UserPlus } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"

// Sample data - in a real app, this would come from an API
const samplePT = {
  id: "PT001",
  code: "PT001",
  name: "PT Gadai Top Indonesia",
  email: "gadaitop@mail.com",
  phone: "0812345678910",
  image: "/commons/img_logo-gadai-top-img-only.png",
  type: "PT Utama",
  adminName: "Ben Affleck",
  adminEmail: "ben.aff@mail.com",
  adminPhone: "0812345678910",
}

export default function DetailPTPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  // In a real app, fetch data based on slug
  const pt = samplePT

  const handleEdit = () => {
    // Navigate to edit page
    router.push(`/pt/${slug}/edit`)
  }

  const handleDelete = () => {
    // Handle delete logic
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      // Perform delete action
      router.push("/pt")
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{pt.name}</h1>
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
                    <Link href="/pt">Master PT</Link>
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
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <Avatar className="size-48">
                  <AvatarImage src={pt.image} alt={pt.name} />
                  <AvatarFallback>
                    <Building2 className="text-muted-foreground size-24" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Detail Information */}
              <div className="space-y-4">
                {/* Data PT Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-dashed pb-4">
                    <Building2 className="text-destructive size-6" />
                    <h3 className="text-destructive text-base font-semibold">
                      Detail PT
                    </h3>
                  </div>

                  {/* Data Fields */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Kode PT */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Kode PT
                      </label>
                      <p className="text-base">{pt.code}</p>
                    </div>

                    {/* Nama PT */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Nama PT
                      </label>
                      <p className="text-base">{pt.name}</p>
                    </div>

                    {/* E-mail PT */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        E-mail PT
                      </label>
                      <p className="text-base">{pt.email}</p>
                    </div>

                    {/* No. Telp PT */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        No. Telp PT
                      </label>
                      <p className="text-base">{pt.phone}</p>
                    </div>

                    {/* Jenis PT */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Jenis PT
                      </label>
                      <p className="text-base">{pt.type}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Primary Section */}
                <div className="space-y-4 border-t border-dashed pt-6">
                  <div className="flex items-center gap-3 border-b border-dashed pb-4">
                    <UserPlus className="text-destructive size-6" />
                    <h2 className="text-destructive text-lg font-semibold">
                      Admin Primary
                    </h2>
                  </div>

                  {/* Data Fields */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Nama Lengkap */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Nama Lengkap
                      </label>
                      <p className="text-base">{pt.adminName}</p>
                    </div>

                    {/* E-mail */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        E-mail
                      </label>
                      <p className="text-base">{pt.adminEmail}</p>
                    </div>

                    {/* No. Telp */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        No. Telp
                      </label>
                      <p className="text-base">{pt.adminPhone}</p>
                    </div>
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
