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
  AuctionBatch,
  CreateAuctionBatchDto,
  ItemPickupDto,
  ItemValidationDto,
  PageOptions,
  UpdateAuctionBatchDto,
  UpdateAuctionItemStatusDto,
  UpdateBatchMarketingDto,
  UpdateBatchItemMarketingDto,
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
    placeholderData: keepPreviousData,
  })
}

// Get single auction batch
export function useAuctionBatch(id: string) {
  return useQuery({
    queryKey: auctionBatchKeys.detail(id),
    queryFn: () =>
      apiClient.get<AuctionBatch>(endpoints.auctionBatches.detail(id)),
    enabled: !!id,
    placeholderData: keepPreviousData,
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

// Update auction batch
export function useUpdateAuctionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAuctionBatchDto }) =>
      apiClient.put<AuctionBatch, UpdateAuctionBatchDto>(
        endpoints.auctionBatches.update(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: auctionBatchKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
    },
  })
}

// Delete auction batch (draft only)
export function useDeleteAuctionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<void>(endpoints.auctionBatches.delete(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
    },
  })
}

// Bulk delete auction batches (draft only)
export function useBulkDeleteAuctionBatches() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          apiClient.delete<void>(endpoints.auctionBatches.delete(id))
        )
      )
    },
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

// Remove item from batch
export function useRemoveItemFromBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      batchId,
      itemId,
    }: {
      batchId: string
      itemId: string
    }) =>
      apiClient.delete<void>(
        endpoints.auctionBatches.removeItem(batchId, itemId)
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: auctionBatchKeys.detail(variables.batchId),
      })
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
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

// Update batch marketing notes/assets (Marketing role)
export function useUpdateBatchMarketing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateBatchMarketingDto
    }) =>
      apiClient.patch<AuctionBatch, UpdateBatchMarketingDto>(
        endpoints.auctionBatches.updateMarketing(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: auctionBatchKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: auctionBatchKeys.lists() })
    },
  })
}

// Update batch item marketing notes/assets (Marketing role)
export function useUpdateBatchItemMarketing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      batchId,
      itemId,
      data,
    }: {
      batchId: string
      itemId: string
      data: UpdateBatchItemMarketingDto
    }) =>
      apiClient.patch<AuctionBatch, UpdateBatchItemMarketingDto>(
        endpoints.auctionBatches.updateItemMarketing(batchId, itemId),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: auctionBatchKeys.detail(variables.batchId),
      })
    },
  })
}

// Update item auction status (Admin PT, FR-132) – when batch is ready_for_auction
export function useUpdateItemAuctionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      batchId,
      itemId,
      data,
    }: {
      batchId: string
      itemId: string
      data: UpdateAuctionItemStatusDto
    }) =>
      apiClient.put<AuctionBatch, UpdateAuctionItemStatusDto>(
        endpoints.auctionBatches.updateItemAuctionStatus(batchId, itemId),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: auctionBatchKeys.detail(variables.batchId),
      })
    },
  })
}
