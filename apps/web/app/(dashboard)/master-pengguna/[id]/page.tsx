"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Pencil, Trash2, IdCard, User as UserIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
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
import { getUserById, deleteUser as deleteUserFromStore } from "../dummy-data"

// Role badge configuration (same as list page)
const getRoleBadgeConfig = (role: { code: string; name: string }) => {
  const configs: Record<string, { label: string; className: string }> = {
    owner: {
      label: "Admin PT",
      className:
        "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
    },
    "staf-toko": {
      label: "Staf Toko",
      className:
        "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    },
    "stock-opname": {
      label: "Stock Opname",
      className:
        "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400",
    },
    lelang: {
      label: "Lelang",
      className:
        "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400",
    },
    marketing: {
      label: "Marketing",
      className:
        "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    },
  }

  return (
    configs[role.code] || {
      label: role.name,
      className:
        "border-gray-500/20 bg-gray-500/10 text-gray-700 dark:text-gray-400",
    }
  )
}

// Loading skeleton for detail card
function DetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
          {/* Avatar skeleton */}
          <div className="flex justify-center">
            <Skeleton className="size-48 rounded-full" />
          </div>
          {/* Content skeleton */}
          <div className="space-y-8">
            <div className="space-y-4">
              {/* Section title skeleton */}
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="h-6 w-36" />
              </div>
              {/* Fields skeleton */}
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MasterPenggunaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : ""
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get user data from dummy store
  const user = getUserById(id)
  const isLoading = false
  const isError = !user

  const handleEdit = () => {
    router.push(`/master-pengguna/${id}/edit`)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      const success = deleteUserFromStore(id)
      if (success) {
        toast.success("Pengguna berhasil dihapus")
        router.push("/master-pengguna")
      } else {
        toast.error("Gagal menghapus Pengguna")
      }
    } catch (error) {
      toast.error("Gagal menghapus Pengguna")
    } finally {
      setIsDeleting(false)
    }
  }

  // Get primary role for badge display
  const primaryRole = user?.roles?.[0]

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <DetailSkeleton />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={[
            { label: "Pages", href: "/" },
            { label: "Master Pengguna", href: "/master-pengguna" },
            { label: "Detail" },
          ]}
        />
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">
              Data Pengguna tidak ditemukan
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/master-pengguna")}
            >
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{user.fullName}</h1>
            <Breadcrumbs
              items={[
                { label: "Pages", href: "/" },
                { label: "Master Pengguna", href: "/master-pengguna" },
                { label: "Detail", className: "text-destructive" },
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
            <div className="flex items-center justify-between">
              <CardTitle>Data Pengguna</CardTitle>
              {primaryRole && (
                <Badge
                  variant="outline"
                  className={getRoleBadgeConfig(primaryRole).className}
                >
                  {getRoleBadgeConfig(primaryRole).label}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <Avatar className="size-48">
                  <AvatarImage src="" alt={user.fullName} />
                  <AvatarFallback>
                    <UserIcon className="text-muted-foreground size-24" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Detail Information */}
              <div className="space-y-8">
                {/* Detail Super Admin Section */}
                <div className="space-y-4">
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
                      <p className="text-base">{user.fullName}</p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        E-mail
                      </label>
                      <p className="text-base">{user.email}</p>
                    </div>

                    {/* No. Telp */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        No. Telp
                      </label>
                      <p className="text-base">{user.phoneNumber || "-"}</p>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <label className="text-muted-foreground text-sm font-medium">
                        Role
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => {
                            const config = getRoleBadgeConfig(role)
                            return (
                              <Badge
                                key={role.uuid}
                                variant="outline"
                                className={config.className}
                              >
                                {config.label}
                              </Badge>
                            )
                          })
                        ) : (
                          <p className="text-muted-foreground text-base">-</p>
                        )}
                      </div>
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
            <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{user.fullName}</strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
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
