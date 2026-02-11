"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  AuctionBatch,
  CreateAuctionBatchDto,
  ItemPickupDto,
  ItemValidationDto,
  PageOptions,
} from "@/lib/api/types"

// Query keys
export const auctionBatchKeys = {
  all: ["auctionBatches"] as const,
  lists: () => [...auctionBatchKeys.all, "list"] as const,
  list: (options?: PageOptions) =>
    [...auctionBatchKeys.lists(), options] as const,
  details: () => [...auctionBatchKeys.all, "detail"] as const,
  detail: (id: string) => [...auctionBatchKeys.details(), id] as const,
}

// Get auction batches list
export function useAuctionBatches(options?: PageOptions) {
  return useQuery({
    queryKey: auctionBatchKeys.list(options),
    queryFn: () =>
      apiClient.getList<AuctionBatch>(
        endpoints.auctionBatches.list,
        options
      ),
  })
}

// Get single auction batch
export function useAuctionBatch(id: string) {
  return useQuery({
    queryKey: auctionBatchKeys.detail(id),
    queryFn: () =>
      apiClient.get<AuctionBatch>(endpoints.auctionBatches.detail(id)),
    enabled: !!id,
  })
}

// Create auction batch
export function useCreateAuctionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAuctionBatchDto) =>
      apiClient.post<AuctionBatch, CreateAuctionBatchDto>(
        endpoints.auctionBatches.create,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
    },
  })
}

// Assign auction batch
export function useAssignAuctionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put<AuctionBatch>(endpoints.auctionBatches.assign(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: auctionBatchKeys.detail(id),
      })
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
    },
  })
}

// Update item pickup status
export function useItemPickup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      batchId,
      itemId,
      data,
    }: {
      batchId: string
      itemId: string
      data: ItemPickupDto
    }) =>
      apiClient.put<void, ItemPickupDto>(
        endpoints.auctionBatches.itemPickup(batchId, itemId),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: auctionBatchKeys.detail(variables.batchId),
      })
    },
  })
}

// Submit item validation
export function useItemValidation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      batchId,
      itemId,
      data,
    }: {
      batchId: string
      itemId: string
      data: ItemValidationDto
    }) =>
      apiClient.put<void, ItemValidationDto>(
        endpoints.auctionBatches.itemValidation(batchId, itemId),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: auctionBatchKeys.detail(variables.batchId),
      })
    },
  })
}

// Finalize auction batch
export function useFinalizeAuctionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put<AuctionBatch>(endpoints.auctionBatches.finalize(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: auctionBatchKeys.detail(id),
      })
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
    },
  })
}

// Cancel auction batch
export function useCancelAuctionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put<AuctionBatch>(endpoints.auctionBatches.cancel(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: auctionBatchKeys.detail(id),
      })
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
    },
  })
}
