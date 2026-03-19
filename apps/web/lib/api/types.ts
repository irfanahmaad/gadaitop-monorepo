// Pagination types
export interface PageMeta {
  page: number
  pageSize: number
  count: number
  pageCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface PageOptions {
  page?: number
  pageSize?: number
  order?: "ASC" | "DESC"
  sortBy?: string
  query?: string
  filter?: Record<string, string | number>
  relation?: Record<string, unknown>
  select?: Record<string, unknown>
}

// API Response types
export interface ApiResponse<T> {
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PageMeta
}

// Error types
export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

// Auth types
export interface TokenPayload {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface LoginPayload {
  user: User
  token: TokenPayload
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName?: string
}

// User types
export type ActiveStatus = "active" | "inactive"

export interface User {
  id: number
  uuid: string
  email: string
  fullName: string
  phoneNumber?: string
  imageUrl?: string
  activeStatus: ActiveStatus
  isEmailVerified: boolean
  isPhoneVerified: boolean
  companyId?: string
  branchId?: string
  ownedCompanyId?: string
  roles?: Role[]
  company?: Company
  branch?: Branch
  ownedCompany?: Company
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  password: string
  fullName: string
  phoneNumber?: string
  imageUrl?: string
  roleIds?: string[]
  companyId?: string
  branchId?: string
}

export interface UpdateUserDto {
  email?: string
  fullName?: string
  phoneNumber?: string
  imageUrl?: string | null
  activeStatus?: ActiveStatus
  companyId?: string
  /** Set to null to clear branch assignment (e.g. when role is Admin PT). */
  branchId?: string | null
}

export interface AssignRoleDto {
  roleIds: string[]
}

export interface ResetPasswordDto {
  newPassword: string
}

// Role types
export interface Role {
  id: number
  uuid: string
  name: string
  code: string
  description?: string
  permissions: IAbility[]
  isSystemRole: boolean
  isActive: boolean
  companyId?: string
  createdAt: string
  updatedAt: string
}

export interface IAbility {
  action: string
  subject: string
  condition?: unknown
}

// Company types
export interface Company {
  id: number
  uuid: string
  companyCode: string
  companyName: string
  phoneNumber?: string
  address?: string
  imageUrl?: string | null
  ownerId: string
  owner?: User
  branches?: Branch[]
  // Interest & Fee Configuration
  earlyInterestRate: number
  normalInterestRate: number
  adminFeeRate: number
  insuranceFee: number
  latePenaltyRate: number
  minPrincipalPayment: number
  defaultTenorDays: number
  earlyPaymentDays: number
  activeStatus: ActiveStatus
  createdAt: string
  updatedAt: string
}

export interface CompanyConfig {
  [key: string]: unknown
}

export interface CreateCompanyWithAdminDto {
  // Company data
  companyCode: string
  companyName: string
  phoneNumber?: string
  address?: string
  companyEmail?: string
  // Admin Primary (Owner) data
  adminName: string
  adminEmail: string
  adminPhone?: string
  password: string
}

export interface UpdateCompanyDto {
  companyName?: string
  phoneNumber?: string
  address?: string
  imageUrl?: string | null
}

export interface UpdateCompanyConfigDto {
  earlyInterestRate?: number
  normalInterestRate?: number
  adminFeeRate?: number
  insuranceFee?: number
  latePenaltyRate?: number
  minPrincipalPayment?: number
  defaultTenorDays?: number
  earlyPaymentDays?: number
}

export interface CompanyStatistics {
  totalBranches: number
  totalUsers: number
  activeBranches: number
}

// Branch types
export interface Branch {
  id: number
  uuid: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  version: number
  createdBy: string | null
  updatedBy: string | null
  deletedBy: string | null
  branchCode: string
  shortName: string
  fullName: string
  address: string
  phone: string
  city: string
  imageUrl?: string | null
  companyId: string
  isBorrowed: boolean
  actualOwnerId: string | null
  status: BranchStatus
  approvedBy: string | null
  approvedAt: string | null
  rejectionReason: string | null
  transactionSequence: number
  company?: Company
  owner?: User
}

export type BranchStatus = "draft" | "pending_approval" | "active" | "inactive"

export interface CreateBranchDto {
  branchCode: string
  shortName: string
  fullName: string
  address: string
  phone: string
  city: string
  companyId: string
  imageUrl?: string
  isBorrowed?: boolean
  actualOwnerId?: string
}

export interface UpdateBranchDto {
  imageUrl?: string | null
  shortName?: string
  fullName?: string
  address?: string
  phone?: string
  city?: string
  status?: BranchStatus
}

export type BranchListView = "company" | "borrowedByMe"

export interface QueryBranchDto extends PageOptions {
  companyId?: string
  status?: BranchStatus
  city?: string
  branchCode?: string
  /** When 'borrowedByMe', list branches where actualOwnerId = current user (Toko Pinjaman). */
  view?: BranchListView
}

// Item Type types
export interface ItemType {
  id: string
  uuid: string
  typeCode: string // e.g., 'H' for Handphone
  typeName: string // e.g., 'Handphone'
  description?: string
  isActive: boolean
  sortOrder: number
  iconUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateItemTypeDto {
  typeCode: string
  typeName: string
  description?: string
  isActive?: boolean
  sortOrder?: number
  iconUrl?: string
}

export interface UpdateItemTypeDto {
  typeName?: string
  description?: string
  isActive?: boolean
  sortOrder?: number
  iconUrl?: string
}

// Borrow Request types
export interface BorrowRequest {
  id: string
  uuid: string
  branchId?: string
  status: BorrowRequestStatus
  rejectionReason?: string
  requester?: User
  processor?: User
  targetCompany?: Company
  branch?: Branch
  createdAt: string
  updatedAt: string
}

export type BorrowRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked"

export interface CreateBorrowRequestDto {
  branchId: string
  targetCompanyId: string
  requestReason?: string
}

export interface RejectBorrowRequestDto {
  rejectionReason: string
}

// Device types
export interface DeviceRegistration {
  id: string
  uuid: string
  macAddress: string
  deviceName?: string
  deviceType?: string
  osInfo?: string
  isActive: boolean
  user?: User
  createdAt: string
  updatedAt: string
}

export interface RegisterDeviceDto {
  macAddress: string
  deviceName?: string
  deviceType?: string
  osInfo?: string
}

export interface UpdateDeviceDto {
  deviceName?: string
  isActive?: boolean
}

// Audit types
export interface AuditLog {
  id: string
  uuid: string
  action: string
  entityType: string
  entityId: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  ipAddress?: string
  user?: User
  createdAt: string
}

export interface QueryAuditLogDto extends PageOptions {
  action?: string
  entityName?: string
  userId?: string
  startDate?: string
  endDate?: string
}

export interface ExportAuditLogDto {
  entityName?: string
  action?: string
  userId?: string
  startDate?: string
  endDate?: string
}

// ==========================================
// SPK (Pawn Agreement) types
// ==========================================

export type SpkStatus =
  | "draft"
  | "active"
  | "extended"
  | "redeemed"
  | "overdue"
  | "auctioned"
  | "closed"

export type SpkItemStatus = "in_storage" | "in_auction" | "sold" | "returned"

export interface SpkItem {
  id?: string
  uuid: string
  spkId?: string
  itemTypeId: string
  description: string
  weight?: number
  estimatedValue?: number
  appraisedValue?: string
  photoUrl?: string
  evidencePhotos?: string[] | null
  itemType?: ItemType
  status?: SpkItemStatus
  qrCode?: string | null
  qrCodePrintedAt?: string | null
  qrCodePrintCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface Spk {
  pt: { companyName?: string | undefined } | undefined
  id?: string
  uuid: string
  spkNumber: string
  customerId: string
  storeId: string
  ptId?: string
  principalAmount: number
  tenor: number
  interestRate: number
  adminFee: number
  insuranceFee: number
  totalAmount: number
  dueDate: string
  status: SpkStatus
  customer?: Customer
  store?: Branch
  items?: SpkItem[]
  nkbRecords?: Nkb[]
  createdBy?: User
  createdAt: string
  updatedAt: string
}

export interface SpkHistory {
  id: string
  action: string
  description: string
  amount?: number
  performedBy?: User
  createdAt: string
}

export interface CreateSpkDto {
  customerId: string
  storeId: string
  ptId: string
  principalAmount: number
  tenor: number
  items: {
    catalogId?: string
    itemTypeId: string
    description: string
    brand?: string
    model?: string
    serialNumber?: string
    appraisedValue: number
    condition?: "excellent" | "good" | "fair" | "poor"
    weight?: number
    purity?: string
    evidencePhotos?: string[]
    storageLocation?: string
  }[]
}

export interface ConfirmSpkDto {
  pin: string
}

export interface ExtendSpkDto {
  amountPaid: number
  paymentMethod?: "cash" | "transfer"
}

export interface RedeemSpkDto {
  amountPaid?: number
  paymentMethod?: "cash" | "transfer"
}

export interface QuerySpkDto extends PageOptions {
  status?: SpkStatus
  customerId?: string
  ptId?: string
  branchId?: string
  dateFrom?: string
  dateTo?: string
  /** When true and status=overdue, exclude SPK items already in an auction batch (Daftar Lelang). */
  excludeInAuctionBatch?: boolean
}

// ==========================================
// Customer types
// ==========================================

export type CustomerStatus = "active" | "blacklisted" | "inactive"

export interface Customer {
  id: number | string
  uuid: string
  nik: string
  name?: string
  dob?: string
  gender?: string
  address?: string
  city?: string
  phone?: string
  birthPlace?: string | null
  subDistrict?: string | null
  village?: string | null
  phone2?: string | null
  email?: string
  status?: CustomerStatus
  isBlacklisted?: boolean
  blacklistReason?: string
  blacklistedAt?: string | null
  blacklistedBy?: string | null
  unblacklistedAt?: string | null
  unblacklistedBy?: string | null
  ktpPhotoUrl?: string | null
  selfiePhotoUrl?: string | null
  companyId?: string
  ptId?: string
  branchId?: string
  company?: Company
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
  deletedAt?: string | null
  deletedBy?: string | null
  version?: number
}

export interface CreateCustomerDto {
  nik: string
  pin: string
  name: string
  dob: string
  address: string
  phone: string
  email: string
  gender?: "male" | "female"
  city?: string
  birthPlace?: string
  subDistrict?: string
  village?: string
  phone2?: string
  ptId?: string
  branchId?: string
  ktpPhotoUrl?: string
  selfiePhotoUrl?: string
}

export interface UpdateCustomerDto {
  name?: string
  address?: string
  city?: string
  phone?: string
  birthPlace?: string
  subDistrict?: string
  village?: string
  phone2?: string
  email?: string
  gender?: "male" | "female"
  /** ISO date YYYY-MM-DD */
  dob?: string
  ktpPhotoUrl?: string
  selfiePhotoUrl?: string
}

export interface ScanKtpDto {
  imageBase64: string
}

export interface KtpScanResult {
  nik: string
  fullName: string
  dateOfBirth?: string
  address?: string
}

export interface ChangePinDto {
  /** Omit for admin reset; include for customer-initiated change */
  oldPin?: string
  newPin: string
}

export interface BlacklistCustomerDto {
  reason: string
}

// ==========================================
// NKB (Transaction Record) types
// ==========================================

export type NkbStatus = "pending" | "confirmed" | "rejected" | "failed"
export type NkbType = "renewal" | "full_redemption" | "partial"

export interface Nkb {
  id: string
  uuid: string
  nkbNumber: string
  ptId: string
  storeId: string
  spkId: string
  paymentType: NkbType
  amount: number
  amountPaid: number
  insuranceFee: number
  status: NkbStatus
  notes?: string
  rejectionReason?: string
  spk?: Spk
  customer?: Customer
  confirmedBy?: User
  confirmedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateNkbDto {
  ptId: string
  storeId: string
  spkId: string
  transactionType: string
  amount: number
  description?: string
}

export interface ConfirmNkbDto {
  notes?: string
}

export interface RejectNkbDto {
  /** Optional rejection reason (API field: reason) */
  reason?: string
}

export interface QueryNkbDto extends PageOptions {
  spkId?: string
  status?: NkbStatus
  /** Comma-separated statuses, e.g. "confirmed,rejected". When set, backend returns NKBs with status in this list. */
  statusIn?: string
  type?: NkbType
  dateFrom?: string
  dateTo?: string
  ptId?: string
  branchId?: string
}

// ==========================================
// Catalog types
// ==========================================

export interface CatalogItem {
  id?: string
  uuid: string
  /** Backend uses `name`; frontend may use itemName */
  name?: string
  itemName?: string
  code?: string
  itemTypeId: string
  basePrice: number
  pawnValueMin?: number
  pawnValueMax?: number
  ptId?: string
  description?: string
  imageUrl?: string | null
  discountName?: string | null
  discountAmount?: number
  isActive?: boolean
  itemType?: ItemType
  company?: Company
  pt?: { uuid?: string; companyName?: string }
  tenorOptions?: number[] | null
  createdAt: string
  updatedAt: string
}

export interface CatalogPriceHistory {
  id: string
  catalogId: string
  oldPrice: number
  newPrice: number
  changedBy?: User
  createdAt: string
}

export interface CreateCatalogDto {
  code: string
  name: string
  ptId: string
  itemTypeId: string
  basePrice: number
  pawnValueMin: number
  pawnValueMax: number
  tenorOptions?: number[]
  description?: string
  /** S3 key after upload */
  imageUrl?: string
  discountName?: string | null
  discountAmount?: number
}

/** Matches API UpdateCatalogDto */
export interface UpdateCatalogDto {
  name?: string
  itemTypeId?: string
  basePrice?: number
  pawnValueMin?: number
  pawnValueMax?: number
  tenorOptions?: number[]
  description?: string
  imageUrl?: string | null
  discountName?: string | null
  discountAmount?: number
}

export interface ImportCatalogDto {
  ptId: string
}

// ==========================================
// Dashboard types
// ==========================================

export interface DashboardKpis {
  activeSpkCount: number
  overdueSpkCount: number
  nkbCountThisMonth: number
  /** Balance per store (store uuid -> balance) */
  balanceByStore: Record<string, number>
  /** Total balance across stores */
  totalBalance: number
}

export interface SpkByStatusChart {
  status: string
  count: number
}

export interface MutationTrend {
  date: string
  creditTotal: number
  debitTotal: number
  net: number
}

// ==========================================
// Auction Batch types
// ==========================================

export type AuctionBatchStatus =
  | "draft"
  | "assigned"
  | "in_progress"
  | "finalized"
  | "cancelled"
  | "pickup_in_progress"
  | "validation_pending"
  | "ready_for_auction"

export interface AuctionBatchAssignee {
  uuid: string
  fullName?: string
  name?: string
  email?: string
}

export interface AuctionItemDetail {
  id: string
  uuid: string
  spkId: string
  spk?: Spk
  spkItem?: {
    itemType?: { typeName?: string }
    description?: string
    photoUrl?: string
  }
  pickedUp: boolean
  pickupNotes?: string
  pickupStatus?: string
  failureReason?: string | null
  validated: boolean
  validatedPrice?: number
  validationNotes?: string | null
  validationVerdict?: string | null
  validationPhotos?: string[] | null
  validatedAt?: string | null
  marketingNotes?: string | null
  marketingAssets?: string[] | null
  /** FR-132: ready | in_auction | sold | unsold */
  auctionItemStatus?: string | null
  createdAt: string
  updatedAt: string
}

/** Payload for PUT auction-batches/:id/items/:itemId/auction-status (Admin PT). */
export type AuctionItemStatus = "ready" | "in_auction" | "sold" | "unsold"

export interface UpdateAuctionItemStatusDto {
  auctionItemStatus: AuctionItemStatus
}

export interface AuctionBatch {
  id?: string
  uuid: string
  batchCode: string
  name?: string | null
  storeId: string
  ptId?: string
  scheduledDate?: string
  status: AuctionBatchStatus
  store?: Branch
  marketingStaff?: AuctionBatchAssignee[]
  auctionStaff?: AuctionBatchAssignee[]
  notes?: string | null
  marketingNotes?: string | null
  marketingAssets?: string[] | null
  items?: AuctionItemDetail[]
  createdAt: string
  updatedAt?: string
}

export interface CreateAuctionBatchDto {
  storeId: string
  ptId: string
  spkItemIds: string[]
  name?: string
  notes?: string
  marketingStaffIds?: string[]
  auctionStaffIds?: string[]
}

export interface UpdateAuctionBatchDto {
  name?: string
  notes?: string
  marketingStaffIds?: string[]
  auctionStaffIds?: string[]
}

export interface UpdateBatchMarketingDto {
  marketingNotes?: string
  marketingAssets?: string[]
}

export interface UpdateBatchItemMarketingDto {
  marketingNotes?: string
  marketingAssets?: string[]
}

/** Payload for PUT auction-batches/:id/items/:itemId/pickup. failureReason required when pickupStatus is 'failed'. */
export interface ItemPickupDto {
  pickupStatus: "taken" | "failed"
  failureReason?: string
}

/** Payload for PUT auction-batches/:id/items/:itemId/validation. */
export interface ItemValidationDto {
  verdict: "ok" | "return" | "reject"
  notes?: string
  validationPhotos?: string[]
}

// ==========================================
// Stock Opname types
// ==========================================

/** Backend session status enum */
export type StockOpnameSessionStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "approved"

export type StockOpnameStoreSummary = {
  uuid: string
  shortName?: string
  fullName?: string
}

export type StockOpnameAssigneeSummary = {
  uuid: string
  fullName?: string
  name?: string
  email?: string
}

export type StockOpnamePawnTermSummary = {
  uuid: string
  ruleName?: string | null
  itemType?: { typeName?: string }
  tenorMin?: number
  tenorMax?: number
}

/** Backend list response item (matches StockOpnameSessionDto) */
export interface StockOpnameSessionListItem {
  uuid: string
  sessionCode: string
  ptId: string
  storeIds: string[]
  stores: StockOpnameStoreSummary[]
  pawnTermIds?: string[]
  pawnTerms?: StockOpnamePawnTermSummary[]
  mataItemCount?: number | null
  startDate: string
  endDate: string | null
  status: StockOpnameSessionStatus
  totalItemsSystem: number
  totalItemsCounted: number
  variancesCount: number
  createdAt: string
  updatedAt?: string
  approvedAt?: string | null
  assignees: StockOpnameAssigneeSummary[]
  creatorFullName?: string
}

export type StockOpnameStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "approved"

export interface StockOpnameItem {
  id: string
  itemId: string
  counted: boolean
  condition?: string
  notes?: string
  photos?: string[]
  // Enriched from backend DTO
  uuid?: string
  soSessionId?: string
  spkItemId?: string
  systemQuantity?: number
  countedQuantity?: number | null
  variance?: number
  conditionBefore?: string | null
  conditionAfter?: string | null
  conditionNotes?: string | null
  damagePhotos?: string[] | null
  countedAt?: string | null
  spkItem?: {
    uuid: string
    spkId: string
    description: string
    itemTypeId: string
    appraisedValue: string | null
    evidencePhotos: string[] | null
    qrCode: string | null
    status: string
    itemType?: { uuid: string; typeName: string } | null
    spk?: { uuid: string; spkNumber: string } | null
  } | null
}

export interface StockOpnameSession {
  id: string
  uuid: string
  sessionCode: string
  ptId: string
  storeIds: string[]
  stores: StockOpnameStoreSummary[]
  pawnTermIds: string[]
  pawnTerms: StockOpnamePawnTermSummary[]
  mataItemCount: number | null
  startDate?: string
  scheduledDate: string
  status: StockOpnameStatus
  assignees: StockOpnameAssigneeSummary[]
  creatorFullName?: string
  items: StockOpnameItem[]
  notes?: string | null
  createdAt: string
  updatedAt: string
  approvedAt?: string | null
  /** Balance per store (store uuid -> balance) for cash verification */
  storeBalances?: Record<string, number>
  /** Sum of all store balances (uang di toko) */
  totalStoreBalance?: number
}

export interface CreateStockOpnameDto {
  ptId: string
  storeIds: string[]
  startDate: string
  assignedToIds?: string[]
  pawnTermIds?: string[]
  mataItemCount?: number
  notes?: string
}

export interface UpdateStockOpnameSessionDto {
  storeIds?: string[]
  startDate?: string
  assignedToIds?: string[]
  pawnTermIds?: string[]
  mataItemCount?: number
  notes?: string
}

export interface UpdateStockOpnameItemsDto {
  items: {
    itemId: string
    countedQuantity: number
  }[]
}

export interface ItemConditionDto {
  condition: string
  notes?: string
  photos?: string[]
}

/** Backend RecordConditionDto - conditionAfter, conditionNotes, damagePhotos */
export type SpkItemConditionEnum = "excellent" | "good" | "fair" | "poor"

export interface RecordConditionDto {
  conditionAfter: SpkItemConditionEnum
  conditionNotes?: string
  damagePhotos?: string[]
}

// ==========================================
// Cash Deposit types
// ==========================================

export type CashDepositStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "confirmed"

export interface CashDeposit {
  id: string
  uuid: string
  storeId: string
  amount: number
  bankAccountId?: string
  proofUrl?: string
  status: CashDepositStatus
  rejectionReason?: string
  vaNumber?: string
  expiresAt?: string
  notes?: string
  store?: Branch
  createdBy?: User
  approvedBy?: User
  createdAt: string
  updatedAt: string
}

export type CashDepositPaymentMethod =
  | "bank_transfer"
  | "qris"
  | "virtual_account"

export interface CreateCashDepositDto {
  storeId: string
  ptId?: string
  amount: number
  paymentMethod: CashDepositPaymentMethod
  paymentChannel?: string
  notes?: string
  bankAccountId?: string
  proofUrl?: string
}

export interface RejectCashDepositDto {
  reason: string
}

// ==========================================
// Cash Mutation types
// ==========================================

export type CashMutationType = "in" | "out"
export type CashMutationTypeBackend = "debit" | "credit" | "adjustment"
export type CashMutationCategory =
  | "spk_disbursement"
  | "nkb_payment"
  | "deposit"
  | "topup"
  | "expense"
  | "other"

export interface CashMutation {
  id: string
  uuid: string
  ptId: string
  storeId: string
  type?: CashMutationType
  mutationType?: CashMutationTypeBackend
  category?: CashMutationCategory
  amount: number
  balanceBefore?: number
  balanceAfter?: number
  description?: string
  referenceType?: string
  referenceId?: string
  referenceNumber?: string
  store?: Branch
  createdBy?: string
  creator?: { uuid: string; fullName: string; imageUrl: string | null }
  createdAt: string
}

export interface CashBalance {
  balance: number
  lastUpdated?: string
}

export interface CreateCashMutationDto {
  ptId: string
  storeId: string
  mutationType: CashMutationTypeBackend
  category: CashMutationCategory
  amount: number
  description?: string
}

export interface QueryCashMutationDto extends PageOptions {
  ptId?: string
  storeId?: string
  mutationType?: CashMutationTypeBackend
  category?: CashMutationCategory
  dateFrom?: string
  dateTo?: string
}

// ==========================================
// Capital Topup types
// ==========================================

export type CapitalTopupStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "disbursed"

export interface CapitalTopup {
  id: string
  uuid: string
  storeId: string
  amount: number
  reason?: string
  status: CapitalTopupStatus
  rejectionReason?: string
  disbursedAmount?: number
  proofUrl?: string
  store?: Branch
  createdBy?: User
  approvedBy?: User
  createdAt: string
  updatedAt: string
}

export interface CreateCapitalTopupDto {
  storeId: string
  amount: number
  reason?: string
}

export interface UpdateCapitalTopupDto {
  amount?: number
  reason?: string
}

export interface RejectCapitalTopupDto {
  reason: string
}

export interface DisburseCapitalTopupDto {
  disbursedAmount: number
  proofUrl?: string
}

// ==========================================
// Notification types
// ==========================================

export type NotificationType =
  | "spk_due"
  | "spk_overdue"
  | "nkb_confirmed"
  | "nkb_rejected"
  | "cash_deposit"
  | "capital_topup"
  | "stock_opname"
  | "auction"
  | "system"

export interface Notification {
  id?: string
  uuid: string
  title: string
  /** API returns `body`; frontend may use `description` as alias */
  body?: string
  description?: string
  type: NotificationType | string
  ptId?: string | null
  /** API returns `readAt`; derived `isRead` = !!readAt */
  readAt?: string | null
  isRead?: boolean
  relatedEntityType?: string | null
  relatedEntityId?: string | null
  recipientId?: string
  userId?: string
  user?: User
  createdAt: string
}

export interface UnreadCount {
  count: number
}

// ==========================================
// Report types
// ==========================================

export interface ReportFilters {
  dateFrom?: string
  dateTo?: string
  companyId?: string
  branchId?: string
  /** Backend uses ptId (company) */
  ptId?: string
  /** Backend uses storeId (branch) */
  storeId?: string
}

export interface MutationReport {
  data: Record<string, unknown>[]
  summary: Record<string, unknown>
}

export interface SpkReport {
  data: Record<string, unknown>[]
  summary: Record<string, unknown>
}

export interface NkbPaymentsReport {
  data: Record<string, unknown>[]
  summary: Record<string, unknown>
}

export interface StockOpnameReport {
  data: Record<string, unknown>[]
  summary: Record<string, unknown>
}

// ==========================================
// Pawn Term types
// ==========================================

/** Item condition codes returned by API (English) */
export type PawnTermItemCondition =
  | "present_and_matching"
  | "present_but_mismatch"
  | "none"

export interface PawnTerm {
  id?: string
  uuid: string
  ptId: string
  itemTypeId?: string
  itemType?: ItemType
  /** Display name for the rule (distinct from item type name). */
  ruleName?: string | null
  tenorMin?: number
  tenorMax?: number
  loanLimitMin?: number
  loanLimitMax?: number
  interestRate: number
  adminFee: number
  storageFee?: number
  /** Item condition rule (English code) */
  itemCondition?: PawnTermItemCondition
  pt?: Company
  createdAt: string
  updatedAt: string
}

export interface CreatePawnTermDto {
  ptId: string
  itemTypeId: string
  ruleName?: string
  loanLimitMin: number
  loanLimitMax: number
  tenorMin: number
  tenorMax: number
  interestRate: number
  adminFee?: number
  storageFee?: number
  itemCondition?: PawnTermItemCondition
}

export interface UpdatePawnTermDto {
  ruleName?: string
  tenorMin?: number
  tenorMax?: number
  interestRate?: number
  adminFee?: number
  storageFee?: number
  loanLimitMin?: number
  loanLimitMax?: number
  itemCondition?: PawnTermItemCondition
}

// ==========================================
// Upload types
// ==========================================

export interface PresignedUrlRequest {
  key: string
  contentType: string
  expiresIn?: number
}

export interface PresignedUrlResponse {
  url: string
  key: string
  expiresAt: string
}

export interface PublicUrlResponse {
  url: string
}

// ==========================================
// Link types
// ==========================================

export interface Link {
  id: string
  uuid: string
  title: string
  url: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateLinkDto {
  title: string
  url: string
  description?: string
}

export interface UpdateLinkDto {
  title?: string
  url?: string
  description?: string
  isActive?: boolean
}
