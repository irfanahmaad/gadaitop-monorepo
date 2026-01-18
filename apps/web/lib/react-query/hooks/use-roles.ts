"use client"

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { PageOptions, Role } from "@/lib/api/types"

// Query keys
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (options?: PageOptions) => [...roleKeys.lists(), options] as const,
  byCode: (code: string) => [...roleKeys.all, "code", code] as const,
}

// Get roles list
export function useRoles(options?: PageOptions) {
  return useQuery({
    queryKey: roleKeys.list(options),
    queryFn: () => apiClient.getList<Role>(endpoints.roles.list, options),
  })
}

// Get role by code
export function useRoleByCode(code: string) {
  return useQuery({
    queryKey: roleKeys.byCode(code),
    queryFn: () => apiClient.get<Role | null>(endpoints.roles.byCode(code)),
    enabled: !!code,
  })
}

// Get the owner role specifically
export function useOwnerRole() {
  return useRoleByCode("owner")
}
