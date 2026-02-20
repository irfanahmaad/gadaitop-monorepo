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
  relation?: Record<string, any>
  select?: Record<string, any>
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
  roleIds?: string[]
  companyId?: string
  branchId?: string
}

export interface UpdateUserDto {
  email?: string
  fullName?: string
  phoneNumber?: string
  imageUrl?: string
  activeStatus?: ActiveStatus
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

export type BranchStatus = "pending" | "active" | "inactive" | "rejected"

export interface CreateBranchDto {
  branchCode: string
  shortName: string
  fullName: string
  address: string
  phone: string
  city: string
  companyId: string
}

export interface UpdateBranchDto {
  shortName?: string
  fullName?: string
  address?: string
  phone?: string
  city?: string
  status?: BranchStatus
}

export interface QueryBranchDto extends PageOptions {
  companyId?: string
  status?: BranchStatus
  city?: string
  branchCode?: string
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
}

export interface UpdateItemTypeDto {
  typeName?: string
  description?: string
  isActive?: boolean
  sortOrder?: number
}

// Borrow Request types
export interface BorrowRequest {
  id: string
  uuid: string
  status: BorrowRequestStatus
  rejectionReason?: string
  requester?: User
  processor?: User
  targetCompany?: Company
  createdAt: string
  updatedAt: string
}

export type BorrowRequestStatus = "pending" | "approved" | "rejected"

export interface CreateBorrowRequestDto {
  targetCompanyId: string
}

export interface RejectBorrowRequestDto {
  rejectionReason: string
}

// Device types
export interface DeviceRegistration {
  id: string
  uuid: string
  deviceId: string
  deviceName?: string
  platform?: string
  pushToken?: string
  isActive: boolean
  user?: User
  createdAt: string
  updatedAt: string
}

export interface RegisterDeviceDto {
  userId?: string
  deviceId: string
  deviceName?: string
  platform?: string
  pushToken?: string
}

export interface UpdateDeviceDto {
  deviceName?: string
  pushToken?: string
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
  entityType?: string
  entityId?: string
  userId?: string
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

export interface SpkItem {
  id: string
  uuid: string
  itemTypeId: string
  description: string
  weight?: number
  estimatedValue: number
  photoUrl?: string
  itemType?: ItemType
  createdAt: string
  updatedAt: string
}

export interface Spk {
  id: string
  uuid: string
  spkNumber: string
  customerId: string
  storeId: string
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
  items: SpkItem[]
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
  principalAmount: number
  tenor: number
  items: {
    itemTypeId: string
    description: string
    weight?: number
    estimatedValue: number
    photoUrl?: string
  }[]
}

export interface ConfirmSpkDto {
  customerPin: string
}

export interface ExtendSpkDto {
  extensionDays: number
  interestPayment: number
}

export interface RedeemSpkDto {
  amountPaid: number
}

export interface QuerySpkDto extends PageOptions {
  status?: SpkStatus
  customerId?: string
  ptId?: string
  branchId?: string
  dateFrom?: string
  dateTo?: string
}

// ==========================================
// Customer types
// ==========================================

export type CustomerStatus = "active" | "blacklisted" | "inactive"

export interface Customer {
  id: number | string
  uuid: string
  nik: string
  /** API may return `name`; frontend also supports `fullName` */
  name?: string
  fullName?: string
  dateOfBirth?: string
  dob?: string
  gender?: string
  address?: string
  city?: string
  /** API may return `phone`; frontend also supports `phoneNumber` */
  phone?: string
  phoneNumber?: string
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
  gender: "male" | "female"
  address: string
  city: string
  phone: string
  email: string
  ptId: string
  ktpPhotoUrl?: string
  selfiePhotoUrl?: string
}

export interface UpdateCustomerDto {
  fullName?: string
  phoneNumber?: string
  email?: string
  address?: string
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
  spkId: string
  paymentType: NkbType
  amount: number
  amountPaid: number
  status: NkbStatus
  notes?: string
  rejectionReason?: string
  spk?: Spk
  customer?: Customer
  confirmedBy?: User
  createdAt: string
  updatedAt: string
}

export interface CreateNkbDto {
  spkId: string
  type: NkbType
  amount: number
  paymentMethod?: string
}

export interface ConfirmNkbDto {
  notes?: string
}

export interface RejectNkbDto {
  reason: string
}

export interface QueryNkbDto extends PageOptions {
  spkId?: string
  status?: NkbStatus
  type?: NkbType
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
  ptId?: string
  description?: string
  isActive?: boolean
  itemType?: ItemType
  company?: Company
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
  itemName: string
  itemTypeId: string
  basePrice: number
  description?: string
}

export interface UpdateCatalogDto {
  itemName?: string
  basePrice?: number
  description?: string
  isActive?: boolean
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

export interface AuctionItemDetail {
  id: string
  uuid: string
  spkId: string
  spk?: Spk
  pickedUp: boolean
  pickupNotes?: string
  validated: boolean
  validatedPrice?: number
  validationNotes?: string
  createdAt: string
  updatedAt: string
}

export interface AuctionBatch {
  id?: string
  uuid: string
  batchCode: string
  storeId: string
  scheduledDate?: string
  status: AuctionBatchStatus
  store?: Branch
  assignedTo?: string | User
  items?: AuctionItemDetail[]
  createdAt: string
  updatedAt?: string
}

export interface CreateAuctionBatchDto {
  storeId: string
  scheduledDate: string
  spkIds: string[]
}

export interface ItemPickupDto {
  pickedUp: boolean
  notes?: string
}

export interface ItemValidationDto {
  validated: boolean
  validatedPrice?: number
  notes?: string
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

/** Backend list response item (matches StockOpnameSessionDto) */
export interface StockOpnameSessionListItem {
  uuid: string
  sessionCode: string
  ptId: string
  storeId: string
  startDate: string
  endDate: string | null
  status: StockOpnameSessionStatus
  totalItemsSystem: number
  totalItemsCounted: number
  variancesCount: number
  createdAt: string
}

export type StockOpnameStatus =
  | "scheduled"
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
}

export interface StockOpnameSession {
  id: string
  uuid: string
  sessionCode: string
  storeId: string
  scheduledDate: string
  status: StockOpnameStatus
  store?: Branch
  assignedTo?: User
  items: StockOpnameItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateStockOpnameDto {
  ptId: string
  storeId: string
  startDate: string
  notes?: string
}

export interface UpdateStockOpnameItemsDto {
  items: {
    itemId: string
    counted: boolean
    condition?: string
    notes?: string
  }[]
}

export interface ItemConditionDto {
  condition: string
  notes?: string
  photos?: string[]
}

// ==========================================
// Cash Deposit types
// ==========================================

export type CashDepositStatus = "pending" | "approved" | "rejected"

export interface CashDeposit {
  id: string
  uuid: string
  storeId: string
  amount: number
  bankAccountId?: string
  proofUrl?: string
  status: CashDepositStatus
  rejectionReason?: string
  store?: Branch
  createdBy?: User
  approvedBy?: User
  createdAt: string
  updatedAt: string
}

export interface CreateCashDepositDto {
  storeId: string
  amount: number
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
  store?: Branch
  createdBy?: User
  createdAt: string
}

export interface CashBalance {
  balance: number
  lastUpdated?: string
}

export interface CreateCashMutationDto {
  storeId: string
  mutationType: CashMutationTypeBackend
  category: CashMutationCategory
  amount: number
  description?: string
}

export interface QueryCashMutationDto extends PageOptions {
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
  id: string
  uuid: string
  title: string
  description: string
  type: NotificationType
  isRead: boolean
  relatedEntityType?: string
  relatedEntityId?: string
  userId: string
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

export interface PawnTerm {
  id?: string
  uuid: string
  ptId: string
  itemTypeId: string
  itemType?: ItemType
  loanLimitMin: number
  loanLimitMax: number
  tenorDefault: number
  interestRate: number
  adminFee: number
  pt?: Company
  createdAt: string
  updatedAt: string
}

export interface CreatePawnTermDto {
  ptId: string
  itemTypeId: string
  loanLimitMin: number
  loanLimitMax: number
  tenorDefault: number
  interestRate: number
  adminFee?: number
}

export interface UpdatePawnTermDto {
  loanLimitMin?: number
  loanLimitMax?: number
  tenorDefault?: number
  interestRate?: number
  adminFee?: number
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
