"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  UserCog,
  Building2,
  Package,
  FileText,
  Box,
  Gavel,
  Wallet,
  Coins,
  ArrowRightLeft,
  FileBarChart,
  Store,
  Users,
  User,
  BookOpen,
  Eye,
} from "lucide-react"

// import { SearchForm } from "@/components/search-form"
// import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { imgLogoGadaiTopTextOnly } from "@/assets/commons"
import Image from "next/image"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center border-b border-gray-200 py-[19.5px]">
          <Link href="/">
            <Image
              src={imgLogoGadaiTopTextOnly}
              alt="Logo"
              width={170}
              height={30}
            />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/" className="flex items-center gap-2">
                    <LayoutDashboard className="size-4 shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/spk")}
                >
                  <Link href="/spk" className="flex items-center gap-2">
                    <FileText className="size-4 shrink-0" />
                    <span>SPK</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/stock-opname")}
                >
                  <Link
                    href="/stock-opname"
                    className="flex items-center gap-2"
                  >
                    <Box className="size-4 shrink-0" />
                    <span>Stock Opname</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/lelang")}
                >
                  <Link href="/lelang" className="flex items-center gap-2">
                    <Gavel className="size-4 shrink-0" />
                    <span>Lelangan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/tambah-modal")}
                >
                  <Link
                    href="/tambah-modal"
                    className="flex items-center gap-2"
                  >
                    <Wallet className="size-4 shrink-0" />
                    <span>Tambah Modal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/setor-uang")}
                >
                  <Link href="/setor-uang" className="flex items-center gap-2">
                    <Coins className="size-4 shrink-0" />
                    <span>Setor Uang</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/mutasi-transaksi")}
                >
                  <Link
                    href="/mutasi-transaksi"
                    className="flex items-center gap-2"
                  >
                    <ArrowRightLeft className="size-4 shrink-0" />
                    <span>Mutasi Transaksi</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/laporan")}
                >
                  <Link href="/laporan" className="flex items-center gap-2">
                    <FileBarChart className="size-4 shrink-0" />
                    <span>Laporan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Master Data</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/master-toko")}
                >
                  <Link href="/master-toko" className="flex items-center gap-2">
                    <Store className="size-4 shrink-0" />
                    <span>Master Toko</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/master-customer")}
                >
                  <Link
                    href="/master-customer"
                    className="flex items-center gap-2"
                  >
                    <Users className="size-4 shrink-0" />
                    <span>Master Customer</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/master-pengguna")}
                >
                  <Link
                    href="/master-pengguna"
                    className="flex items-center gap-2"
                  >
                    <User className="size-4 shrink-0" />
                    <span>Master Pengguna</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/master-katalog")}
                >
                  <Link
                    href="/master-katalog"
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="size-4 shrink-0" />
                    <span>Master Katalog</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/master-syarat-mata")}
                >
                  <Link
                    href="/master-syarat-mata"
                    className="flex items-center gap-2"
                  >
                    <Eye className="size-4 shrink-0" />
                    <span>Master Syarat Mata</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/super-admin")}
                >
                  <Link href="/super-admin" className="flex items-center gap-2">
                    <UserCog className="size-4 shrink-0" />
                    <span>Master Super Admin</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/pt")}
                >
                  <Link href="/pt" className="flex items-center gap-2">
                    <Building2 className="size-4 shrink-0" />
                    <span>Master PT</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname?.startsWith("/tipe-barang")}
                >
                  <Link href="/tipe-barang" className="flex items-center gap-2">
                    <Package className="size-4 shrink-0" />
                    <span>Master Tipe Barang</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
