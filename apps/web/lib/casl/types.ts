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
  REPORT = "Report",
  LOCK_UNLOCK_DATA = "LockUnlockData",
}

export type AclActionValues = `${AclAction}`
export type AclSubjectValues = `${AclSubject}`

export interface Permission {
  action: string
  subject: string
  condition?: unknown
}

// Type for CASL abilities tuple
export type Abilities = [AclActionValues, AclSubjectValues]
