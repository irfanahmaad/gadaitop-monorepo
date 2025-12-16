import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import React from "react"
import { SidebarInset, SidebarTrigger } from "@workspace/ui/components/sidebar"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { ProfileDropdown } from "@/components/profile-dropdown"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
            <div>
              <SidebarTrigger className="-ml-1" />
            </div>

            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <ProfileDropdown />
            </div>
          </header>

          <div className="container">
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
