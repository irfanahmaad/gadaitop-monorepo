"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2, IdCard, User as UserIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/breadcrumbs"
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
import { useUser, useDeleteSuperAdmin } from "@/lib/react-query/hooks"

export default function DetailSuperAdminPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Fetch user data
  const { data: superAdmin, isLoading, isError } = useUser(slug)
  const deleteMutation = useDeleteSuperAdmin()

  const handleEdit = () => {
    router.push(`/super-admin/${slug}/edit`)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(slug)
      toast.success("Super Admin berhasil dihapus")
      router.push("/super-admin")
    } catch (error) {
      toast.error("Gagal menghapus Super Admin")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !superAdmin) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Data Super Admin tidak ditemukan</p>
        <Button variant="outline" onClick={() => router.push("/super-admin")}>
          Kembali ke Daftar
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
            <h1 className="text-2xl font-bold">{superAdmin.fullName}</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Master Super Admin", href: "/super-admin" },
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
          <CardHeader>
            <CardTitle>Data Super Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <Avatar className="size-48">
                  <AvatarImage src="" alt={superAdmin.fullName} />
                  <AvatarFallback>
                    <UserIcon className="text-muted-foreground size-24" />
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
                    <p className="text-base">{superAdmin.fullName}</p>
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
                    <p className="text-base">{superAdmin.phoneNumber || "-"}</p>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Status
                    </label>
                    <p className="text-base">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          superAdmin.activeStatus === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {superAdmin.activeStatus === "active" ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>

                  {/* Created At */}
                  <div className="space-y-2">
                    <label className="text-muted-foreground text-sm font-medium">
                      Dibuat Pada
                    </label>
                    <p className="text-base">
                      {new Date(superAdmin.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
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
            <AlertDialogTitle>Hapus Super Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus{" "}
              <strong>{superAdmin.fullName}</strong>? Tindakan ini tidak
              dapat dibatalkan.
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
