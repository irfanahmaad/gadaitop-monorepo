"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  Branch,
  CreateBranchDto,
  QueryBranchDto,
  UpdateBranchDto,
} from "@/lib/api/types"

// Query keys
export const branchKeys = {
  all: ["branches"] as const,
  lists: () => [...branchKeys.all, "list"] as const,
  list: (options?: QueryBranchDto) => [...branchKeys.lists(), options] as const,
  details: () => [...branchKeys.all, "detail"] as const,
  detail: (id: string) => [...branchKeys.details(), id] as const,
}

// Get branches list
export function useBranches(options?: QueryBranchDto) {
  return useQuery({
    queryKey: branchKeys.list(options),
    queryFn: () => apiClient.getList<Branch>(endpoints.branches.list, options),
  })
}

// Get single branch
export function useBranch(id: string) {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => apiClient.get<Branch>(endpoints.branches.detail(id)),
    enabled: !!id,
  })
}

// Create branch
export function useCreateBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBranchDto) =>
      apiClient.post<Branch, CreateBranchDto>(endpoints.branches.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
    },
  })
}

// Update branch
export function useUpdateBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchDto }) =>
      apiClient.patch<Branch, UpdateBranchDto>(endpoints.branches.update(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(variables.id) })
    },
  })
}

// Delete branch
export function useDeleteBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(endpoints.branches.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
    },
  })
}

// Approve branch
export function useApproveBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch<Branch>(endpoints.branches.approve(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(id) })
    },
  })
}

// Reject branch
export function useRejectBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      apiClient.patch<Branch, { rejectionReason: string }>(
        endpoints.branches.reject(id),
        { rejectionReason }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(variables.id) })
    },
  })
}
