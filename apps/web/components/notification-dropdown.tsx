"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, Circle, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAsUnread,
} from "@/lib/react-query/hooks/use-notifications"
import { useAuth } from "@/lib/react-query/hooks/use-auth"
import type { Notification as ApiNotification } from "@/lib/api/types"

function formatNotificationTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return "Baru saja"
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  } catch {
    return ""
  }
}

function getNotificationUrl(
  notification: ApiNotification,
  isAuctionStaffOnly?: boolean
): string {
  const type = notification.relatedEntityType ?? notification.type
  const id = notification.relatedEntityId
  if (type === "auction_batch" && id) {
    if (isAuctionStaffOnly) return "/validasi-lelangan"
    return `/lelangan/${id}`
  }
  if (type === "spk" && id) return `/spk/${id}`
  if (type === "nkb" && id) return "/nkb"
  if (type === "stock_opname" && id) return `/stock-opname/${id}`
  if (type === "capital_topup" && id) return "/laporan/tambah-modal"
  if (type === "cash_deposit" && id) return "/laporan/setor-uang"
  if (type === "BorrowRequest") return "/master-toko?tab=request"
  return "/notifikasi"
}

export function NotificationDropdown() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: listData, isLoading: listLoading } = useNotifications({
    page: 1,
    pageSize: 10,
  })
  const { data: unreadData } = useUnreadCount()
  const markAsReadMutation = useMarkAsRead()
  const markAsUnreadMutation = useMarkAsUnread()

  const isAuctionStaffOnly =
    !!user?.roles?.some((r) => r.code === "auction_staff") &&
    !user?.roles?.some((r) => r.code === "company_admin")

  const notifications = listData?.data ?? []
  const unreadCount = unreadData?.count ?? 0

  const handleRowClick = React.useCallback(
    (notification: ApiNotification) => {
      if (!notification.readAt) {
        markAsReadMutation.mutate(notification.uuid)
      }
      router.push(getNotificationUrl(notification, isAuctionStaffOnly))
    },
    [markAsReadMutation, router, isAuctionStaffOnly]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifikasi"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" onCloseAutoFocus={(e) => e.preventDefault()}>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifikasi</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} baru
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {listLoading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-sm">
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.map((notification) => {
                const unread = !notification.readAt
                const body =
                  notification.body ?? notification.description ?? ""
                const url = getNotificationUrl(notification, isAuctionStaffOnly)
                return (
                  <div
                    key={notification.uuid}
                    className={cn(
                      "flex items-start gap-2 p-3 rounded-sm hover:bg-accent/50 focus-within:bg-accent/50",
                      unread && "bg-accent/30"
                    )}
                  >
                    <Link
                      href={url}
                      className="flex-1 min-w-0 outline-none"
                      onClick={(e) => {
                        e.preventDefault()
                        handleRowClick(notification)
                      }}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-sm leading-none font-medium truncate">
                            {notification.title}
                          </p>
                          <p className="text-muted-foreground text-xs line-clamp-2">
                            {body}
                          </p>
                        </div>
                        {unread && (
                          <div className="bg-primary size-2 shrink-0 rounded-full mt-1.5" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs mt-1">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Opsi notifikasi"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        {unread ? (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsReadMutation.mutate(notification.uuid)
                            }}
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="mr-2 size-4" />
                            Tandai dibaca
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsUnreadMutation.mutate(notification.uuid)
                            }}
                            disabled={markAsUnreadMutation.isPending}
                          >
                            <Circle className="mr-2 size-4" />
                            Tandai belum dibaca
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        {!listLoading && notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center text-center">
              <Link href="/notifikasi">Lihat semua notifikasi</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
