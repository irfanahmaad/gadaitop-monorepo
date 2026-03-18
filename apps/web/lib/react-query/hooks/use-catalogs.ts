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

/** Normalize catalog JSON (unwrap `data`, snake_case decimals, etc.) */
export function normalizeCatalogItem(raw: unknown): CatalogItem {
  const unwrap = (r: unknown): Record<string, unknown> => {
    if (!r || typeof r !== "object") return {}
    const o = r as Record<string, unknown>
    const inner = o.data
    if (
      typeof o.uuid === "string" &&
      (!inner ||
        typeof inner !== "object" ||
        Array.isArray(inner) ||
        !("uuid" in inner))
    ) {
      return o
    }
    if (
      inner &&
      typeof inner === "object" &&
      !Array.isArray(inner) &&
      typeof (inner as Record<string, unknown>).uuid === "string"
    ) {
      return inner as Record<string, unknown>
    }
    return o
  }

  const obj = unwrap(raw)
  const num = (v: unknown): number => {
    if (v === null || v === undefined) return 0
    if (typeof v === "number" && Number.isFinite(v)) return v
    if (typeof v === "string") {
      const n = parseFloat(v.replace(/\s/g, "").replace(",", "."))
      return Number.isFinite(n) ? n : 0
    }
    return 0
  }

  const str = (v: unknown): string | null => {
    if (v === null || v === undefined) return null
    const s = String(v).trim()
    return s.length ? s : null
  }

  const discountName =
    str(obj.discountName) ?? str(obj.discount_name) ?? null

  const base = obj as unknown as CatalogItem

  const tenorRaw = obj.tenorOptions ?? obj.tenor_options
  const tenorOptions = Array.isArray(tenorRaw)
    ? (tenorRaw as unknown[]).map((n) => Number(n)).filter((n) => Number.isFinite(n))
    : null

  const ptRaw = obj.pt as Record<string, unknown> | undefined
  const pt =
    ptRaw && typeof ptRaw === "object"
      ? {
          uuid: typeof ptRaw.uuid === "string" ? ptRaw.uuid : undefined,
          companyName:
            (ptRaw.companyName as string) ??
            (ptRaw.company_name as string) ??
            undefined,
        }
      : undefined

  const itemTypeNested = obj.itemType as { uuid?: string } | undefined
  const itemTypeIdRaw =
    (typeof obj.itemTypeId === "string" && obj.itemTypeId) ||
    (typeof obj.item_type_id === "string" && obj.item_type_id) ||
    (itemTypeNested && typeof itemTypeNested.uuid === "string"
      ? itemTypeNested.uuid
      : null) ||
    (typeof base.itemTypeId === "string" ? base.itemTypeId : null)

  return {
    ...base,
    itemTypeId: itemTypeIdRaw ?? "",
    basePrice: num(obj.basePrice ?? obj.base_price),
    pawnValueMin: num(obj.pawnValueMin ?? obj.pawn_value_min),
    pawnValueMax: num(obj.pawnValueMax ?? obj.pawn_value_max),
    discountName,
    discountAmount: num(obj.discountAmount ?? obj.discount_amount),
    imageUrl:
      (obj.imageUrl as string | null | undefined) ??
      (obj.image_url as string | null | undefined) ??
      null,
    tenorOptions: tenorOptions?.length ? tenorOptions : null,
    pt,
  }
}

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
  const priceDate = options?.filter?.priceDate
  return useQuery({
    queryKey: [...catalogKeys.lists(), options, String(priceDate ?? "")],
    queryFn: () =>
      apiClient.getList<CatalogItem>(endpoints.catalogs.list, options),
    placeholderData: keepPreviousData,
  })
}

// Get single catalog item
export function useCatalog(id: string) {
  return useQuery({
    queryKey: catalogKeys.detail(id),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(endpoints.catalogs.detail(id))
      return normalizeCatalogItem(raw)
    },
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
