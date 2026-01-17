"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient, removeToken, setToken } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  ApiResponse,
  LoginCredentials,
  LoginPayload,
  RegisterCredentials,
  User,
} from "@/lib/api/types"

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
}

// Get current user
export function useMe() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => apiClient.get<ApiResponse<User>>(endpoints.auth.me),
    select: (data) => data.data,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      apiClient.post<ApiResponse<LoginPayload>, LoginCredentials>(
        endpoints.auth.login,
        credentials,
        { requireAuth: false }
      ),
    onSuccess: (data) => {
      setToken(data.data.token.accessToken)
      queryClient.setQueryData(authKeys.me(), { data: data.data.user })
    },
  })
}

// Register mutation
export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      apiClient.post<ApiResponse<LoginPayload>, RegisterCredentials>(
        endpoints.auth.register,
        credentials,
        { requireAuth: false }
      ),
    onSuccess: (data) => {
      setToken(data.data.token.accessToken)
      queryClient.setQueryData(authKeys.me(), { data: data.data.user })
    },
  })
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.post<ApiResponse<boolean>>(endpoints.auth.logout),
    onSuccess: () => {
      removeToken()
      queryClient.removeQueries({ queryKey: authKeys.all })
      queryClient.clear()
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      removeToken()
      queryClient.removeQueries({ queryKey: authKeys.all })
      queryClient.clear()
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
