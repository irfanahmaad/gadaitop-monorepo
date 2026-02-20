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
  CatalogItem,
  CatalogPriceHistory,
  CreateCatalogDto,
  ImportCatalogDto,
  PageOptions,
  UpdateCatalogDto,
} from "@/lib/api/types"

// Query keys
export const catalogKeys = {
  all: ["catalogs"] as const,
  lists: () => [...catalogKeys.all, "list"] as const,
  list: (options?: PageOptions) => [...catalogKeys.lists(), options] as const,
  details: () => [...catalogKeys.all, "detail"] as const,
  detail: (id: string) => [...catalogKeys.details(), id] as const,
  priceHistory: (id: string) =>
    [...catalogKeys.all, "priceHistory", id] as const,
}

// Get catalogs list
export function useCatalogs(options?: PageOptions) {
  return useQuery({
    queryKey: catalogKeys.list(options),
    queryFn: () =>
      apiClient.getList<CatalogItem>(endpoints.catalogs.list, options),
    placeholderData: keepPreviousData,
  })
}

// Get single catalog item
export function useCatalog(id: string) {
  return useQuery({
    queryKey: catalogKeys.detail(id),
    queryFn: () => apiClient.get<CatalogItem>(endpoints.catalogs.detail(id)),
    enabled: !!id,
  })
}

// Get catalog price history
export function useCatalogPriceHistory(id: string) {
  return useQuery({
    queryKey: catalogKeys.priceHistory(id),
    queryFn: () =>
      apiClient.get<CatalogPriceHistory[]>(
        endpoints.catalogs.priceHistory(id)
      ),
    enabled: !!id,
  })
}

// Create catalog item
export function useCreateCatalog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCatalogDto) =>
      apiClient.post<CatalogItem, CreateCatalogDto>(
        endpoints.catalogs.create,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.lists() })
    },
  })
}

// Update catalog item
export function useUpdateCatalog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCatalogDto }) =>
      apiClient.put<CatalogItem, UpdateCatalogDto>(
        endpoints.catalogs.update(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: catalogKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: catalogKeys.lists() })
    },
  })
}

// Delete catalog item
export function useDeleteCatalog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<void>(endpoints.catalogs.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.lists() })
    },
  })
}

// Import catalog (bulk)
export function useImportCatalog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ImportCatalogDto) =>
      apiClient.post<{ importedCount: number; errors: string[] }, ImportCatalogDto>(
        endpoints.catalogs.import,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.lists() })
    },
  })
}
