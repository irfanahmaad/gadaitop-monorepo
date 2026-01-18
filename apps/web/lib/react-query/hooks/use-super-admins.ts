"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  CreateUserDto,
  PageOptions,
  UpdateUserDto,
  User,
} from "@/lib/api/types"
import { userKeys } from "./use-users"

// Role code for Super Admin / Owner
const OWNER_ROLE_CODE = "owner"

// Query keys specific to super admins
export const superAdminKeys = {
  all: ["super-admins"] as const,
  lists: () => [...superAdminKeys.all, "list"] as const,
  list: (options?: PageOptions) => [...superAdminKeys.lists(), options] as const,
}

// Get super admins list (users with owner role)
export function useSuperAdmins(options?: Omit<PageOptions, "filter">) {
  const pageOptions: PageOptions = {
    ...options,
    filter: { roleCode: OWNER_ROLE_CODE },
  }

  return useQuery({
    queryKey: superAdminKeys.list(pageOptions),
    queryFn: () => apiClient.getList<User>(endpoints.users.list, pageOptions),
  })
}

// Create super admin (creates user with owner role)
export function useCreateSuperAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateUserDto, "roleIds"> & { roleId: string }) => {
      const createData: CreateUserDto = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        roleIds: [data.roleId],
      }
      return apiClient.post<User, CreateUserDto>(endpoints.users.create, createData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: superAdminKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

// Update super admin
export function useUpdateSuperAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      apiClient.patch<User, UpdateUserDto>(endpoints.users.update(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: superAdminKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
    },
  })
}

// Delete super admin
export function useDeleteSuperAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ message: string }>(endpoints.users.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: superAdminKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}
