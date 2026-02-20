"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil, Trash2, Building2, UserPlus, Loader2 } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@workspace/ui/components/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import {
  useCompany,
  useDeleteCompany,
  usePublicUrl,
} from "@/lib/react-query/hooks"

export default function DetailPTPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Fetch company data
  const { data: company, isLoading, isError } = useCompany(slug)
  const deleteMutation = useDeleteCompany()
  const imageKey = company?.imageUrl ?? ""
  const { data: publicUrlData } = usePublicUrl(imageKey)

  const handleEdit = () => {
    router.push(`/pt/${slug}/edit`)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(slug)
      toast.success("PT berhasil dihapus")
      router.push("/pt")
    } catch {
      toast.error("Gagal menghapus PT")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !company) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Gagal memuat data PT</p>
        <Button variant="outline" onClick={() => router.push("/pt")}>
          Kembali ke Daftar PT
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{company.companyName}</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Master PT", href: "/pt" },
                { label: "Detail" },
              ]}
            />
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
                  <AvatarImage
                    src={publicUrlData?.url ?? ""}
                    alt={company.companyName}
                  />
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
                      <p className="text-base">{company.companyCode}</p>
                    </div>

                    {/* Nama PT */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Nama PT
                      </label>
                      <p className="text-base">{company.companyName}</p>
                    </div>

                    {/* No. Telp PT */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        No. Telp PT
                      </label>
                      <p className="text-base">{company.phoneNumber || "-"}</p>
                    </div>

                    {/* Alamat */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Alamat
                      </label>
                      <p className="text-base">{company.address || "-"}</p>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Status
                      </label>
                      <p className="text-base">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            company.activeStatus === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {company.activeStatus === "active" ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </p>
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
                      <p className="text-base">{company.owner?.fullName || "-"}</p>
                    </div>

                    {/* E-mail */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        E-mail
                      </label>
                      <p className="text-base">{company.owner?.email || "-"}</p>
                    </div>

                    {/* No. Telp */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        No. Telp
                      </label>
                      <p className="text-base">{company.owner?.phoneNumber || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus PT</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <strong>{company.companyName}</strong>? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
