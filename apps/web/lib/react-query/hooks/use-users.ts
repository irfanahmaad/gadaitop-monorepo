"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  AssignRoleDto,
  CreateUserDto,
  PageOptions,
  ResetPasswordDto,
  UpdateUserDto,
  User,
} from "@/lib/api/types"

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (options?: PageOptions) => [...userKeys.lists(), options] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Get users list
export function useUsers(options?: PageOptions) {
  return useQuery({
    queryKey: userKeys.list(options),
    queryFn: () => apiClient.getList<User>(endpoints.users.list, options),
    placeholderData: keepPreviousData,
  })
}

// Get single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => apiClient.get<User>(endpoints.users.detail(id)),
    enabled: !!id,
  })
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserDto) =>
      apiClient.post<User, CreateUserDto>(endpoints.users.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      apiClient.patch<User, UpdateUserDto>(endpoints.users.update(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
    },
  })
}

// Assign roles to user
export function useAssignRoles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignRoleDto }) =>
      apiClient.post<User, AssignRoleDto>(endpoints.users.assignRoles(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
    },
  })
}

// Reset user password
export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResetPasswordDto }) =>
      apiClient.post<{ message: string }, ResetPasswordDto>(
        endpoints.users.resetPassword(id),
        data
      ),
  })
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ message: string }>(endpoints.users.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
