"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  LayoutDashboard,
  UserCog,
  Building2,
  Package,
  ScanLine,
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
  FileText,
} from "lucide-react"

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
  SidebarMenuSkeleton,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { imgLogoGadaiTopTextOnly } from "@/assets/commons"
import Image from "next/image"
import { Can, MenuSubject, useAppAbility } from "@/lib/casl"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const ability = useAppAbility()
  const { data: session, status } = useSession()
  const isOwner = session?.user?.roles?.some((role) => role.code === "owner")
  const isBranchStaff = session?.user?.roles?.some(
    (role) => role.code === "branch_staff"
  )
  const isStockAuditor = session?.user?.roles?.some(
    (role) => role.code === "stock_auditor"
  )
  const isAuctionStaff = session?.user?.roles?.some(
    (role) => role.code === "auction_staff"
  )
  const isCompanyAdmin = session?.user?.roles?.some(
    (role) => role.code === "company_admin"
  )
  // Only show Dashboard when session is ready and user is not branch_staff, stock_auditor, or auction_staff (avoids flash)
  const showDashboard =
    status === "authenticated" &&
    !isBranchStaff &&
    !isStockAuditor &&
    !isAuctionStaff

  // Check if any "Menu Utama" item is visible (besides Dashboard which is always shown)
  const hasMenuUtamaItems =
    !isOwner &&
    (ability.can("view", MenuSubject.SCAN_KTP) ||
      ability.can("view", MenuSubject.SPK) ||
      (ability.can("view", MenuSubject.NKB) && !isCompanyAdmin) ||
      ability.can("view", MenuSubject.STOCK_OPNAME) ||
      ability.can("view", MenuSubject.LELANGAN) ||
      ability.can("view", MenuSubject.TAMBAH_MODAL) ||
      ability.can("view", MenuSubject.SETOR_UANG) ||
      ability.can("view", MenuSubject.MUTASI_TRANSAKSI) ||
      ability.can("view", MenuSubject.LAPORAN))

  // Check if any "Master Data" item is visible
  const hasMasterDataItems =
    (!isOwner && ability.can("view", MenuSubject.MASTER_TOKO)) ||
    (!isOwner && ability.can("view", MenuSubject.MASTER_CUSTOMER)) ||
    (!isOwner && ability.can("view", MenuSubject.MASTER_PENGGUNA)) ||
    (!isOwner && ability.can("view", MenuSubject.MASTER_KATALOG)) ||
    (!isOwner && ability.can("view", MenuSubject.MASTER_SYARAT_MATA)) ||
    ability.can("view", MenuSubject.MASTER_SUPER_ADMIN) ||
    ability.can("view", MenuSubject.MASTER_PT) ||
    ability.can("view", MenuSubject.MASTER_TIPE_BARANG)

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
        {status === "loading" ? (
          <>
            {/* Skeleton: Dashboard group (no label) */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon className="h-12" />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {/* Skeleton: Menu Utama group */}
            <SidebarGroup>
              <SidebarGroupLabel className="pointer-events-none">
                <Skeleton className="h-4 w-24 rounded-md" />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuSkeleton showIcon className="h-12" />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {/* Skeleton: Master Data group */}
            <SidebarGroup>
              <SidebarGroupLabel className="pointer-events-none">
                <Skeleton className="h-4 w-24 rounded-md" />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuSkeleton showIcon className="h-12" />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <>
            {/* ── Dashboard (hidden for branch_staff and stock_auditor; hidden while session loading to avoid flash) ── */}
            {showDashboard && (
              <SidebarGroup>
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
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* ── Menu Utama ─────────────────────────────────────────────── */}
            {hasMenuUtamaItems && (
              <SidebarGroup>
                <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <Can I="view" a={MenuSubject.SCAN_KTP}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/scan-ktp"}
                        >
                          <Link
                            href="/scan-ktp"
                            className="flex items-center gap-2"
                          >
                            <ScanLine className="size-4 shrink-0" />
                            <span>Scan KTP</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </Can>
                    <Can I="view" a={MenuSubject.SPK}>
                      <SidebarMenuItem>
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
                    </Can>
                    {!isCompanyAdmin && (
                      <Can I="view" a={MenuSubject.NKB}>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname?.startsWith("/nkb")}
                          >
                            <Link href="/nkb" className="flex items-center gap-2">
                              <FileText className="size-4 shrink-0" />
                              <span>NKB</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </Can>
                    )}
                    <Can I="view" a={MenuSubject.STOCK_OPNAME}>
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
                    </Can>
                    <Can I="view" a={MenuSubject.LELANGAN}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname?.startsWith("/lelangan")}
                        >
                          <Link
                            href="/lelangan"
                            className="flex items-center gap-2"
                          >
                            <Gavel className="size-4 shrink-0" />
                            <span>Lelangan</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </Can>
                    <Can I="view" a={MenuSubject.TAMBAH_MODAL}>
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
                    </Can>
                    <Can I="view" a={MenuSubject.SETOR_UANG}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname?.startsWith("/setor-uang")}
                        >
                          <Link
                            href="/setor-uang"
                            className="flex items-center gap-2"
                          >
                            <Coins className="size-4 shrink-0" />
                            <span>Setor Uang</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </Can>
                    <Can I="view" a={MenuSubject.MUTASI_TRANSAKSI}>
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
                    </Can>
                    <Can I="view" a={MenuSubject.LAPORAN}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname?.startsWith("/laporan")}
                        >
                          <Link
                            href="/laporan"
                            className="flex items-center gap-2"
                          >
                            <FileBarChart className="size-4 shrink-0" />
                            <span>Laporan</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </Can>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* ── Master Data ────────────────────────────────────────────── */}
            {hasMasterDataItems && (
              <SidebarGroup>
                <SidebarGroupLabel>Master Data</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <Can I="view" a={MenuSubject.MASTER_TOKO}>
                      {!isOwner && (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname?.startsWith("/master-toko")}
                          >
                            <Link
                              href="/master-toko"
                              className="flex items-center gap-2"
                            >
                              <Store className="size-4 shrink-0" />
                              <span>Master Toko</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </Can>
                    <Can I="view" a={MenuSubject.MASTER_CUSTOMER}>
                      {!isOwner && (
                        <SidebarMenuItem>
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
                        </SidebarMenuItem>
                      )}
                    </Can>
                    <Can I="view" a={MenuSubject.MASTER_PENGGUNA}>
                      {!isOwner && (
                        <SidebarMenuItem>
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
                        </SidebarMenuItem>
                      )}
                    </Can>
                    <Can I="view" a={MenuSubject.MASTER_KATALOG}>
                      {!isOwner && (
                        <SidebarMenuItem>
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
                        </SidebarMenuItem>
                      )}
                    </Can>
                    <Can I="view" a={MenuSubject.MASTER_SYARAT_MATA}>
                      {!isOwner && (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname?.startsWith(
                              "/master-syarat-mata"
                            )}
                          >
                            <Link
                              href="/master-syarat-mata"
                              className="flex items-center gap-2"
                            >
                              <Eye className="size-4 shrink-0" />
                              <span>Master Syarat Mata</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </Can>
                    <Can I="view" a={MenuSubject.MASTER_SUPER_ADMIN}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname?.startsWith("/super-admin")}
                        >
                          <Link
                            href="/super-admin"
                            className="flex items-center gap-2"
                          >
                            <UserCog className="size-4 shrink-0" />
                            <span>Master Super Admin</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </Can>
                    <Can I="view" a={MenuSubject.MASTER_PT}>
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
                    </Can>
                    <Can I="view" a={MenuSubject.MASTER_TIPE_BARANG}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname?.startsWith("/tipe-barang")}
                        >
                          <Link
                            href="/tipe-barang"
                            className="flex items-center gap-2"
                          >
                            <Package className="size-4 shrink-0" />
                            <span>Master Tipe Barang</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </Can>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
