"use client"

import * as React from "react"
import { User, Settings, LogOut, Bell, HelpCircle, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { useAuth, useLogout } from "@/lib/react-query/hooks/use-auth"

export function ProfileDropdown() {
  const { user, isLoading } = useAuth()
  const logoutMutation = useLogout()

  const userInitials = React.useMemo(() => {
    if (user?.fullName) {
      return user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return "U"
  }, [user?.fullName])

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar className="size-8">
            <AvatarImage src={undefined} alt={user?.fullName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {isLoading ? "Loading..." : user?.fullName || "User"}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {user?.email || ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 size-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="mr-2 size-4" />
            <span>Notifications</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2 className="text-destructive mr-2 size-4 animate-spin" />
          ) : (
            <LogOut className="text-destructive mr-2 size-4" />
          )}
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
