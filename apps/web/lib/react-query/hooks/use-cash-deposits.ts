"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  CashDeposit,
  CreateCashDepositDto,
  PageOptions,
  RejectCashDepositDto,
} from "@/lib/api/types"

// Query keys
export const cashDepositKeys = {
  all: ["cashDeposits"] as const,
  lists: () => [...cashDepositKeys.all, "list"] as const,
  list: (options?: PageOptions) =>
    [...cashDepositKeys.lists(), options] as const,
  details: () => [...cashDepositKeys.all, "detail"] as const,
  detail: (id: string) => [...cashDepositKeys.details(), id] as const,
}

// Get cash deposits list
export function useCashDeposits(options?: PageOptions) {
  return useQuery({
    queryKey: cashDepositKeys.list(options),
    queryFn: () =>
      apiClient.getList<CashDeposit>(endpoints.cashDeposits.list, options),
  })
}

// Get single cash deposit
export function useCashDeposit(id: string) {
  return useQuery({
    queryKey: cashDepositKeys.detail(id),
    queryFn: () =>
      apiClient.get<CashDeposit>(endpoints.cashDeposits.detail(id)),
    enabled: !!id,
  })
}

// Create cash deposit
export function useCreateCashDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCashDepositDto) =>
      apiClient.post<CashDeposit, CreateCashDepositDto>(
        endpoints.cashDeposits.create,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashDepositKeys.lists() })
    },
  })
}

// Approve cash deposit (Admin PT)
export function useApproveCashDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put<CashDeposit>(endpoints.cashDeposits.approve(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: cashDepositKeys.detail(id),
      })
      queryClient.invalidateQueries({ queryKey: cashDepositKeys.lists() })
    },
  })
}

// Reject cash deposit
export function useRejectCashDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectCashDepositDto }) =>
      apiClient.put<CashDeposit, RejectCashDepositDto>(
        endpoints.cashDeposits.reject(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cashDepositKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: cashDepositKeys.lists() })
    },
  })
}
