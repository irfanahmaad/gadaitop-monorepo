"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  CashBalance,
  CashMutation,
  CreateCashMutationDto,
  QueryCashMutationDto,
} from "@/lib/api/types"

// Query keys
export const cashMutationKeys = {
  all: ["cashMutations"] as const,
  balance: (storeId?: string) =>
    [...cashMutationKeys.all, "balance", storeId] as const,
  lists: () => [...cashMutationKeys.all, "list"] as const,
  list: (options?: QueryCashMutationDto) =>
    [...cashMutationKeys.lists(), options] as const,
}

// Get cash balance
export function useCashBalance(storeId: string) {
  return useQuery({
    queryKey: cashMutationKeys.balance(storeId),
    queryFn: () =>
      apiClient.get<CashBalance>(
        `${endpoints.cashMutations.balance}?storeId=${storeId}`
      ),
    enabled: !!storeId,
  })
}

// Get cash mutations list
export function useCashMutations(options?: QueryCashMutationDto) {
  return useQuery({
    queryKey: cashMutationKeys.list(options),
    queryFn: () =>
      apiClient.getList<CashMutation>(endpoints.cashMutations.list, options),
  })
}

// Create cash mutation
export function useCreateCashMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCashMutationDto) =>
      apiClient.post<CashMutation, CreateCashMutationDto>(
        endpoints.cashMutations.create,
        data
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: cashMutationKeys.lists() })
      // Also invalidate balance for the affected store
      if (result?.storeId) {
        queryClient.invalidateQueries({
          queryKey: cashMutationKeys.balance(result.storeId),
        })
      }
    },
  })
}
