"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  CreateStockOpnameDto,
  ItemConditionDto,
  PageOptions,
  StockOpnameSession,
  StockOpnameSessionListItem,
  UpdateStockOpnameItemsDto,
} from "@/lib/api/types"

// Query keys
export const stockOpnameKeys = {
  all: ["stockOpname"] as const,
  lists: () => [...stockOpnameKeys.all, "list"] as const,
  list: (options?: PageOptions) =>
    [...stockOpnameKeys.lists(), options] as const,
  details: () => [...stockOpnameKeys.all, "detail"] as const,
  detail: (id: string) => [...stockOpnameKeys.details(), id] as const,
}

// Get stock opname sessions list
export function useStockOpnameSessions(options?: PageOptions) {
  return useQuery({
    queryKey: stockOpnameKeys.list(options),
    queryFn: () =>
      apiClient.getList<StockOpnameSessionListItem>(
        endpoints.stockOpname.list,
        options
      ),
  })
}

// Get single stock opname session
export function useStockOpnameSession(id: string) {
  return useQuery({
    queryKey: stockOpnameKeys.detail(id),
    queryFn: () =>
      apiClient.get<StockOpnameSession>(endpoints.stockOpname.detail(id)),
    enabled: !!id,
  })
}

// Create stock opname session
export function useCreateStockOpname() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStockOpnameDto) =>
      apiClient.post<StockOpnameSession, CreateStockOpnameDto>(
        endpoints.stockOpname.create,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() })
    },
  })
}

// Update stock opname items (batch counting)
export function useUpdateStockOpnameItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateStockOpnameItemsDto
    }) =>
      apiClient.put<void, UpdateStockOpnameItemsDto>(
        endpoints.stockOpname.updateItems(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: stockOpnameKeys.detail(variables.id),
      })
    },
  })
}

// Record individual item condition
export function useRecordItemCondition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      itemId,
      data,
    }: {
      sessionId: string
      itemId: string
      data: ItemConditionDto
    }) =>
      apiClient.post<void, ItemConditionDto>(
        endpoints.stockOpname.itemCondition(sessionId, itemId),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: stockOpnameKeys.detail(variables.sessionId),
      })
    },
  })
}

// Complete stock opname session
export function useCompleteStockOpname() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put<StockOpnameSession>(endpoints.stockOpname.complete(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: stockOpnameKeys.detail(id),
      })
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() })
    },
  })
}

// Approve stock opname session (Admin PT)
export function useApproveStockOpname() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put<StockOpnameSession>(endpoints.stockOpname.approve(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: stockOpnameKeys.detail(id),
      })
      queryClient.invalidateQueries({ queryKey: stockOpnameKeys.lists() })
    },
  })
}
