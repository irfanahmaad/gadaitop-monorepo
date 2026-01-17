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
export interface User {
  id: string
  uuid: string
  email: string
  firstName: string
  lastName?: string
  isActive: boolean
  isEmailVerified: boolean
  roles?: Role[]
  company?: Company
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  password: string
  firstName: string
  lastName?: string
  roleIds?: string[]
  companyId?: string
}

export interface UpdateUserDto {
  email?: string
  firstName?: string
  lastName?: string
  isActive?: boolean
}

export interface AssignRoleDto {
  roleIds: string[]
}

export interface ResetPasswordDto {
  newPassword: string
}

// Role types
export interface Role {
  id: string
  uuid: string
  name: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

// Company types
export interface Company {
  id: string
  uuid: string
  name: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  config?: CompanyConfig
  createdAt: string
  updatedAt: string
}

export interface CompanyConfig {
  [key: string]: unknown
}

export interface UpdateCompanyDto {
  name?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
}

export interface UpdateCompanyConfigDto {
  config: CompanyConfig
}

export interface CompanyStatistics {
  totalBranches: number
  totalUsers: number
  totalBorrowRequests: number
}

// Branch types
export interface Branch {
  id: string
  uuid: string
  name: string
  address?: string
  phone?: string
  status: BranchStatus
  company?: Company
  owner?: User
  createdAt: string
  updatedAt: string
}

export type BranchStatus = "pending" | "active" | "inactive" | "rejected"

export interface CreateBranchDto {
  name: string
  address?: string
  phone?: string
  companyId: string
}

export interface UpdateBranchDto {
  name?: string
  address?: string
  phone?: string
  status?: BranchStatus
}

export interface QueryBranchDto extends PageOptions {
  companyId?: string
  status?: BranchStatus
}

// Item Type types
export interface ItemType {
  id: string
  uuid: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateItemTypeDto {
  name: string
  description?: string
}

export interface UpdateItemTypeDto {
  name?: string
  description?: string
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
