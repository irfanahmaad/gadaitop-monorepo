"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  BorrowRequest,
  CreateBorrowRequestDto,
  PageOptions,
  RejectBorrowRequestDto,
} from "@/lib/api/types"

// Query keys
export const borrowRequestKeys = {
  all: ["borrow-requests"] as const,
  lists: () => [...borrowRequestKeys.all, "list"] as const,
  list: (options?: PageOptions) => [...borrowRequestKeys.lists(), options] as const,
  details: () => [...borrowRequestKeys.all, "detail"] as const,
  detail: (id: string) => [...borrowRequestKeys.details(), id] as const,
}

// Get borrow requests list
export function useBorrowRequests(options?: PageOptions) {
  return useQuery({
    queryKey: borrowRequestKeys.list(options),
    queryFn: () =>
      apiClient.getList<BorrowRequest>(endpoints.borrowRequests.list, options),
  })
}

// Get single borrow request
export function useBorrowRequest(id: string) {
  return useQuery({
    queryKey: borrowRequestKeys.detail(id),
    queryFn: () =>
      apiClient.get<BorrowRequest>(endpoints.borrowRequests.detail(id)),
    enabled: !!id,
  })
}

// Create borrow request
export function useCreateBorrowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBorrowRequestDto) =>
      apiClient.post<BorrowRequest, CreateBorrowRequestDto>(
        endpoints.borrowRequests.create,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.lists() })
    },
  })
}

// Approve borrow request
export function useApproveBorrowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch<BorrowRequest>(endpoints.borrowRequests.approve(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.lists() })
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.detail(id) })
    },
  })
}

// Reject borrow request
export function useRejectBorrowRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectBorrowRequestDto }) =>
      apiClient.patch<BorrowRequest, RejectBorrowRequestDto>(
        endpoints.borrowRequests.reject(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.lists() })
      queryClient.invalidateQueries({ queryKey: borrowRequestKeys.detail(variables.id) })
    },
  })
}
