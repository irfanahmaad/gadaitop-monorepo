"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  CapitalTopup,
  CreateCapitalTopupDto,
  DisburseCapitalTopupDto,
  PageOptions,
  RejectCapitalTopupDto,
  UpdateCapitalTopupDto,
} from "@/lib/api/types"

// Query keys
export const capitalTopupKeys = {
  all: ["capitalTopups"] as const,
  lists: () => [...capitalTopupKeys.all, "list"] as const,
  list: (options?: PageOptions) =>
    [...capitalTopupKeys.lists(), options] as const,
  details: () => [...capitalTopupKeys.all, "detail"] as const,
  detail: (id: string) => [...capitalTopupKeys.details(), id] as const,
}

// Get capital topups list
export function useCapitalTopups(options?: PageOptions) {
  return useQuery({
    queryKey: capitalTopupKeys.list(options),
    queryFn: () =>
      apiClient.getList<CapitalTopup>(endpoints.capitalTopups.list, options),
  })
}

// Get single capital topup
export function useCapitalTopup(id: string) {
  return useQuery({
    queryKey: capitalTopupKeys.detail(id),
    queryFn: () =>
      apiClient.get<CapitalTopup>(endpoints.capitalTopups.detail(id)),
    enabled: !!id,
  })
}

// Create capital topup request
export function useCreateCapitalTopup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCapitalTopupDto) =>
      apiClient.post<CapitalTopup, CreateCapitalTopupDto>(
        endpoints.capitalTopups.create,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capitalTopupKeys.lists() })
    },
  })
}

// Update pending capital topup
export function useUpdateCapitalTopup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCapitalTopupDto }) =>
      apiClient.put<CapitalTopup, UpdateCapitalTopupDto>(
        endpoints.capitalTopups.update(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: capitalTopupKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: capitalTopupKeys.lists() })
    },
  })
}

// Approve capital topup (Admin PT)
export function useApproveCapitalTopup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put<CapitalTopup>(endpoints.capitalTopups.approve(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: capitalTopupKeys.detail(id),
      })
      queryClient.invalidateQueries({ queryKey: capitalTopupKeys.lists() })
    },
  })
}

// Reject capital topup
export function useRejectCapitalTopup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectCapitalTopupDto }) =>
      apiClient.put<CapitalTopup, RejectCapitalTopupDto>(
        endpoints.capitalTopups.reject(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: capitalTopupKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: capitalTopupKeys.lists() })
    },
  })
}

// Soft-delete capital topup (pending only)
export function useDeleteCapitalTopup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(endpoints.capitalTopups.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capitalTopupKeys.lists() })
    },
  })
}

// Bulk soft-delete capital topups (pending only)
export function useBulkDeleteCapitalTopups() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          apiClient.delete(endpoints.capitalTopups.delete(id))
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capitalTopupKeys.lists() })
    },
  })
}

// Disburse capital topup
export function useDisburseCapitalTopup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: DisburseCapitalTopupDto
    }) =>
      apiClient.put<CapitalTopup, DisburseCapitalTopupDto>(
        endpoints.capitalTopups.disburse(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: capitalTopupKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: capitalTopupKeys.lists() })
    },
  })
}
