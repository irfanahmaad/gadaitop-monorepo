"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { apiClient, clearTokenCache } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { ApiResponse, LoginCredentials, RegisterCredentials } from "@/lib/api/types"
import type { AuthUser, AuthCustomer, AccountType } from "@/lib/auth/types"

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
}

// Hook to get the current authenticated user from NextAuth session.
// Returns AuthUser for backward compatibility with dashboard pages (staff-only).
// Customers are redirected away by middleware, so dashboard never sees AuthCustomer.
export function useAuth() {
  const { data: session, status, update } = useSession()

  return {
    user: session?.user as AuthUser | undefined,
    accountType: session?.accountType as AccountType | undefined,
    accessToken: session?.accessToken,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    error: session?.error,
    updateSession: update,
  }
}

// Hook for customer portal - returns customer-specific data when logged in as customer
export function useCustomerAuth() {
  const { data: session, status, update } = useSession()
  const accountType = session?.accountType as AccountType | undefined

  return {
    user: session?.user as AuthCustomer | undefined,
    accountType,
    customer: accountType === "customer" ? (session?.user as AuthCustomer) : undefined,
    isCustomer: accountType === "customer",
    accessToken: session?.accessToken,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    error: session?.error,
    updateSession: update,
  }
}

/** Fetches full user profile from GET /auth/me (includes branchId). Use when session may be stale or missing branchId. */
export function useAuthMe(options?: { enabled?: boolean }) {
  return useQuery<ApiResponse<AuthUser>>({
    queryKey: authKeys.me(),
    queryFn: () => apiClient.get<ApiResponse<AuthUser>>(endpoints.auth.me),
    enabled: options?.enabled ?? true,
  })
}

// Hook to get current user (alias for useAuth for backward compatibility)
export function useMe() {
  const { user, isLoading, isAuthenticated } = useAuth()

  return {
    data: user,
    isLoading,
    isSuccess: isAuthenticated && !!user,
    isError: false,
  }
}

// Login mutation using NextAuth
export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials & { callbackUrl?: string }) => {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return result
    },
    onSuccess: (_, variables) => {
      router.push(variables.callbackUrl || "/")
    },
  })
}

// Register mutation
export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      // First register with the backend
      const response = await apiClient.post<
        ApiResponse<{
          user: AuthUser
          token: { accessToken: string; expiresIn: number }
        }>,
        RegisterCredentials
      >(endpoints.auth.register, credentials, { requireAuth: false })

      // Then sign in with NextAuth using the newly registered credentials
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return response
    },
    onSuccess: () => {
      router.push("/")
    },
  })
}

// Logout mutation using NextAuth (staff)
export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post<ApiResponse<boolean>>(endpoints.auth.logout)
      } catch {
        console.warn("Backend logout failed, continuing with client-side logout")
      }
      await signOut({ redirect: false })
    },
    onSettled: () => {
      clearTokenCache()
      queryClient.clear()
      router.push("/login")
    },
  })
}

// Logout mutation for customer portal
export function useCustomerLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post<ApiResponse<boolean>>(endpoints.auth.logout)
      } catch {
        console.warn("Backend logout failed, continuing with client-side logout")
      }
      await signOut({ redirect: false })
    },
    onSettled: () => {
      clearTokenCache()
      queryClient.clear()
      router.push("/portal-customer/login")
    },
  })
}

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post<ApiResponse<string>, { email: string }>(
        endpoints.auth.forgotPassword,
        { email },
        { requireAuth: false }
      ),
  })
}

// Reset password mutation
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      apiClient.post<ApiResponse<boolean>, { token: string; newPassword: string }>(
        endpoints.auth.resetPassword,
        data,
        { requireAuth: false }
      ),
  })
}

// Verify email mutation
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) =>
      apiClient.post<ApiResponse<boolean>, { token: string }>(
        endpoints.auth.verifyEmail,
        { token },
        { requireAuth: false }
      ),
  })
}
