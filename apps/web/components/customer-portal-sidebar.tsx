"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Briefcase, ChevronRight } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { imgLogoGadaiTopTextOnly } from "@/assets/commons"
import Image from "next/image"
import { useCustomerAuth } from "@/lib/react-query/hooks/use-auth"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

export function CustomerPortalSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const pathname = usePathname()
  const { customer } = useCustomerAuth()

  const displayName = customer?.name ?? "Customer"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "C"

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center border-b border-gray-200 py-[19.5px]">
          <Link href="/portal-customer">
            <Image
              src={imgLogoGadaiTopTextOnly}
              alt="Logo"
              width={170}
              height={30}
            />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/portal-customer")}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground"
                >
                  <Link
                    href="/portal-customer"
                    className="flex items-center gap-2"
                  >
                    <Briefcase className="size-4 shrink-0" />
                    <span>Portal Customer</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={undefined} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-muted-foreground text-xs">Customer</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
