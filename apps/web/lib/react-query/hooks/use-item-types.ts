"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  CreateItemTypeDto,
  ItemType,
  PageOptions,
  UpdateItemTypeDto,
} from "@/lib/api/types"

// Query keys
export const itemTypeKeys = {
  all: ["item-types"] as const,
  lists: () => [...itemTypeKeys.all, "list"] as const,
  list: (options?: PageOptions) => [...itemTypeKeys.lists(), options] as const,
  details: () => [...itemTypeKeys.all, "detail"] as const,
  detail: (id: string) => [...itemTypeKeys.details(), id] as const,
}

// Get item types list
export function useItemTypes(options?: PageOptions) {
  return useQuery({
    queryKey: itemTypeKeys.list(options),
    queryFn: () => apiClient.getList<ItemType>(endpoints.itemTypes.list, options),
  })
}

// Get single item type
export function useItemType(id: string) {
  return useQuery({
    queryKey: itemTypeKeys.detail(id),
    queryFn: () => apiClient.get<ItemType>(endpoints.itemTypes.detail(id)),
    enabled: !!id,
  })
}

// Create item type
export function useCreateItemType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateItemTypeDto) =>
      apiClient.post<ItemType, CreateItemTypeDto>(endpoints.itemTypes.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemTypeKeys.lists() })
    },
  })
}

// Update item type
export function useUpdateItemType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemTypeDto }) =>
      apiClient.patch<ItemType, UpdateItemTypeDto>(endpoints.itemTypes.update(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: itemTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: itemTypeKeys.detail(variables.id) })
    },
  })
}

// Delete item type
export function useDeleteItemType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(endpoints.itemTypes.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemTypeKeys.lists() })
    },
  })
}
