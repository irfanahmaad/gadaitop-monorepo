import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

// User role from backend
export interface UserRole {
  id: number
  uuid: string
  name: string
  code: string
  permissions: Array<{
    action: string
    subject: string
  }>
}

// Extended user type matching backend UserEntity
export interface AuthUser {
  id: number
  uuid: string
  email: string
  fullName: string
  phoneNumber: string | null
  companyId: string | null
  branchId: string | null
  ownedCompanyId: string | null
  activeStatus: "active" | "inactive" | "suspended"
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isAdministrator: boolean
  roles: UserRole[]
  rolesIds: number[]
  createdAt: string
  updatedAt: string
}

// Module augmentation for next-auth
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: AuthUser
    accessToken: string
    expiresIn: number
    error?: "RefreshAccessTokenError"
  }

  interface User extends DefaultUser {
    id: string
    uuid: string
    email: string
    fullName: string
    phoneNumber: string | null
    companyId: string | null
    branchId: string | null
    ownedCompanyId: string | null
    activeStatus: "active" | "inactive" | "suspended"
    isEmailVerified: boolean
    isPhoneVerified: boolean
    isAdministrator: boolean
    roles: UserRole[]
    rolesIds: number[]
    accessToken: string
    expiresIn: number
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: number
    uuid: string
    email: string
    fullName: string
    phoneNumber: string | null
    companyId: string | null
    branchId: string | null
    ownedCompanyId: string | null
    activeStatus: "active" | "inactive" | "suspended"
    isEmailVerified: boolean
    isPhoneVerified: boolean
    isAdministrator: boolean
    roles: UserRole[]
    rolesIds: number[]
    accessToken: string
    expiresIn: number
    accessTokenExpires: number
    error?: "RefreshAccessTokenError"
  }
}
