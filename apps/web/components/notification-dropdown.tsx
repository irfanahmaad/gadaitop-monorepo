"use client"

import * as React from "react"
import { Bell } from "lucide-react"
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
import { cn } from "@workspace/ui/lib/utils"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  unread?: boolean
}

interface NotificationDropdownProps {
  notifications?: Notification[]
  unreadCount?: number
}

const defaultNotifications: Notification[] = []

export function NotificationDropdown({
  notifications = defaultNotifications,
  unreadCount,
}: NotificationDropdownProps) {
  const [unreadNotifications] = React.useState(
    unreadCount ?? notifications.filter((n) => n.unread).length
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unreadNotifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadNotifications > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadNotifications} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {notifications.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3",
                    notification.unread && "bg-accent/50"
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {notification.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {notification.description}
                      </p>
                    </div>
                    {notification.unread && (
                      <div className="bg-primary size-2 shrink-0 rounded-full" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {notification.time}
                  </p>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center text-center">
              <Link href="/notifikasi">View all notifications</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
