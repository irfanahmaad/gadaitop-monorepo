/**
 * CASL Types and Constants
 * Mirrored from backend: apps/api/src/constants/acl.ts
 */

export enum AclAction {
  MANAGE = "manage",
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  VIEW = "view",
}

/**
 * Data-level subjects — mirrored from backend ACL
 */
export enum AclSubject {
  ALL = "All",
  USER = "User",
  PT = "Pt",
  STORE = "Store",
  ITEM_TYPE = "ItemType",
  CATALOG = "Catalog",
  PRICE_DEDUCTION = "PriceDeduction",
  CUSTOMER = "Customer",
  SPK = "Spk",
  NKB = "Nkb",
  ADD_CAPITAL = "AddCapital",
  DEPOSIT_MONEY = "DepositMoney",
  MUTATION = "Mutation",
  STOCK_OPNAME_SCHEDULE = "StockOpnameSchedule",
  STOCK_OPNAME_EXECUTION = "StockOpnameExecution",
  PRIORITY_RULES = "PriorityRules",
  AUCTION_BATCH = "AuctionBatch",
  AUCTION_PICKUP = "AuctionPickup",
  AUCTION_VALIDATION = "AuctionValidation",
  MARKETING_NOTE = "MarketingNote",
  REPORT = "Report",
  LOCK_UNLOCK_DATA = "LockUnlockData",
}

/**
 * Menu-level subjects — used to control sidebar menu visibility per role.
 * These are separate from data-level subjects because menu visibility
 * is a UI concern (e.g., Super Admin sees only 4 menus despite having manage All).
 */
export enum MenuSubject {
  DASHBOARD = "MenuDashboard",
  SCAN_KTP = "MenuScanKtp",
  SPK = "MenuSpk",
  STOCK_OPNAME = "MenuStockOpname",
  LELANGAN = "MenuLelangan",
  TAMBAH_MODAL = "MenuTambahModal",
  SETOR_UANG = "MenuSetorUang",
  MUTASI_TRANSAKSI = "MenuMutasiTransaksi",
  LAPORAN = "MenuLaporan",
  MASTER_TOKO = "MenuMasterToko",
  MASTER_CUSTOMER = "MenuMasterCustomer",
  MASTER_PENGGUNA = "MenuMasterPengguna",
  MASTER_KATALOG = "MenuMasterKatalog",
  MASTER_SYARAT_MATA = "MenuMasterSyaratMata",
  MASTER_SUPER_ADMIN = "MenuMasterSuperAdmin",
  MASTER_PT = "MenuMasterPt",
  MASTER_TIPE_BARANG = "MenuMasterTipeBarang",
}

export type AclActionValues = `${AclAction}`
export type AclSubjectValues = `${AclSubject}` | `${MenuSubject}`

export interface Permission {
  action: string
  subject: string
  condition?: unknown
}

// Type for CASL abilities tuple
export type Abilities = [AclActionValues, AclSubjectValues]
