import { CustomerPortalSidebar } from "@/components/customer-portal-sidebar"
import { SidebarProvider } from "@workspace/ui/components/sidebar"
import React, { Suspense } from "react"
import { SidebarInset } from "@workspace/ui/components/sidebar"
import { CustomerPortalHeader } from "@/components/customer-portal-header"

export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <CustomerPortalSidebar />

      <SidebarInset>
        <CustomerPortalHeader />

        <div className="min-h-[calc(100vh-64px)] bg-slate-200/50">
          <div className="container">
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Suspense>{children}</Suspense>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
