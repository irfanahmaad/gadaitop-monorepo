import { createMongoAbility, MongoAbility, RawRuleOf } from "@casl/ability"

import { AclAction, AclSubject, MenuSubject } from "./types"
import type { Abilities, AclActionValues, AclSubjectValues, Permission } from "./types"

/**
 * Type alias for the application's CASL ability instance
 */
export type AppAbility = MongoAbility<Abilities>

/**
 * Creates an empty ability with no permissions
 * Used as default when user is not authenticated
 */
export function createEmptyAbility(): AppAbility {
  return createMongoAbility<Abilities>([])
}

/**
 * Role code → visible menu subjects mapping.
 * This defines which sidebar menus each role can see.
 */
const ROLE_MENU_MAP: Record<string, MenuSubject[]> = {
  // Super Admin / Owner — only sees Dashboard & master management menus
  owner: [
    MenuSubject.DASHBOARD,
    MenuSubject.MASTER_SUPER_ADMIN,
    MenuSubject.MASTER_PT,
    MenuSubject.MASTER_TIPE_BARANG,
  ],

  // Admin PT — sees most menus except Super Admin & Tipe Barang management
  company_admin: [
    MenuSubject.DASHBOARD,
    MenuSubject.SCAN_KTP,
    MenuSubject.SPK,
    MenuSubject.STOCK_OPNAME,
    MenuSubject.LELANGAN,
    MenuSubject.TAMBAH_MODAL,
    MenuSubject.SETOR_UANG,
    MenuSubject.MUTASI_TRANSAKSI,
    MenuSubject.LAPORAN,
    MenuSubject.MASTER_TOKO,
    MenuSubject.MASTER_CUSTOMER,
    MenuSubject.MASTER_PENGGUNA,
    MenuSubject.MASTER_KATALOG,
    MenuSubject.MASTER_SYARAT_MATA,
  ],

  // Staff Toko — operational menus
  branch_staff: [
    MenuSubject.DASHBOARD,
    MenuSubject.SCAN_KTP,
    MenuSubject.SPK,
    MenuSubject.TAMBAH_MODAL,
    MenuSubject.SETOR_UANG,
    MenuSubject.MUTASI_TRANSAKSI,
    MenuSubject.MASTER_CUSTOMER,
  ],

  // Stock Auditor — stock opname only
  stock_auditor: [
    MenuSubject.DASHBOARD,
    MenuSubject.STOCK_OPNAME,
  ],

  // Auction Staff — auction-related menus
  auction_staff: [
    MenuSubject.DASHBOARD,
    MenuSubject.LELANGAN,
  ],

  // Marketing — auction viewing + marketing notes
  marketing: [
    MenuSubject.DASHBOARD,
    MenuSubject.LELANGAN,
  ],
}

/**
 * Creates a CASL ability instance from user permissions and role codes.
 * Builds both data-level rules (from backend permissions) and
 * menu-visibility rules (from role-code → menu mapping).
 *
 * @param permissions - Array of permission objects from user's roles
 * @param roleCodes  - Array of role code strings (e.g. ["owner"])
 * @returns MongoAbility instance for permission checks
 */
export function createAbilityFromPermissions(
  permissions: Permission[],
  roleCodes: string[] = []
): AppAbility {
  const rules: RawRuleOf<AppAbility>[] = []

  // ── 1. Data-level rules (from backend permissions) ──────────────────
  for (const p of permissions) {
    if (p.action === "manage" && p.subject === "All") {
      // Expand "manage All" to every data subject
      const allSubjects: AclSubjectValues[] = Object.values(AclSubject) as AclSubjectValues[]
      for (const subject of allSubjects) {
        if (subject !== "All") {
          rules.push({
            action: p.action as AclActionValues,
            subject,
          })
        }
      }
      rules.push({
        action: p.action as AclActionValues,
        subject: "All" as AclSubjectValues,
      })
    } else {
      rules.push({
        action: p.action as AclActionValues,
        subject: p.subject as AclSubjectValues,
      })
    }
  }

  // ── 2. Menu-visibility rules (derived from role codes) ──────────────
  const grantedMenus = new Set<MenuSubject>()

  for (const code of roleCodes) {
    const menus = ROLE_MENU_MAP[code]
    if (menus) {
      for (const menu of menus) {
        grantedMenus.add(menu)
      }
    }
  }

  // Always grant Dashboard if the user has any role
  if (roleCodes.length > 0) {
    grantedMenus.add(MenuSubject.DASHBOARD)
  }

  for (const menu of grantedMenus) {
    rules.push({
      action: AclAction.VIEW as AclActionValues,
      subject: menu as AclSubjectValues,
    })
  }

  return createMongoAbility<Abilities>(rules)
}

/**
 * Extracts and flattens permissions from user roles
 *
 * @param roles - Array of roles with permissions
 * @returns Flattened array of all permissions
 */
export function flattenRolesPermissions(
  roles: Array<{ permissions: Permission[] }>
): Permission[] {
  return roles.flatMap((role) => role.permissions)
}
