"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useMemo } from "react"

export type FilterType =
  | "select"
  | "date"
  | "daterange"
  | "text"
  | "number"
  | "numberrange"
  | "currencyrange"
  | "multiselect"
  | "radio"

export interface FilterConfig {
  key: string
  label: string
  type: FilterType
  options?: { label: string; value: string }[]
  placeholder?: string
  currency?: string
  /** For daterange: label for "from" field (e.g. "Mulai Dari") */
  labelFrom?: string
  /** For daterange: label for "to" field (e.g. "Sampai Dengan") */
  labelTo?: string
  /** For radio: radio options (label/value pairs) */
  radioOptions?: { label: string; value: string }[]
}

interface UseFilterParamsReturn {
  filterValues: Record<string, unknown>
  setFilterValue: (key: string, value: unknown) => void
  setFilters: (filters: Record<string, unknown>) => void
  clearFilters: () => void
}

/**
 * Custom hook to manage filter state via URL search params
 * Supports various filter types including range filters (from/to)
 */
export function useFilterParams(
  filterConfig: FilterConfig[]
): UseFilterParamsReturn {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Parse filter values from URL params
  const filterValues = useMemo(() => {
    const values: Record<string, unknown> = {}

    filterConfig.forEach((config) => {
      const paramValue = searchParams.get(config.key)

      if (paramValue) {
        // Handle range types (currencyrange, numberrange, daterange)
        if (
          config.type === "currencyrange" ||
          config.type === "numberrange" ||
          config.type === "daterange"
        ) {
          try {
            const parsed = JSON.parse(paramValue) as {
              from?: number | string | null
              to?: number | string | null
            }
            if (parsed.from !== undefined || parsed.to !== undefined) {
              values[config.key] = {
                from: parsed.from ?? null,
                to: parsed.to ?? null,
              }
            }
          } catch {
            // Invalid JSON, skip
          }
        } else if (config.type === "multiselect") {
          try {
            const arr = JSON.parse(paramValue) as string[]
            if (Array.isArray(arr)) {
              values[config.key] = arr
            }
          } catch {
            // Fallback: comma-separated
            const arr = paramValue.split(",").map((s) => s.trim()).filter(Boolean)
            if (arr.length) values[config.key] = arr
          }
        } else {
          // Handle simple types
          if (config.type === "number") {
            const num = Number(paramValue)
            if (!isNaN(num)) {
              values[config.key] = num
            }
          } else {
            values[config.key] = paramValue
          }
        }
      }
    })

    return values
  }, [searchParams, filterConfig])

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  // Set a single filter value
  const setFilterValue = useCallback(
    (key: string, value: unknown) => {
      const config = filterConfig.find((c) => c.key === key)
      if (!config) return

      let stringValue: string | null = null

      if (value === null || value === undefined || value === "") {
        stringValue = null
      } else if (
        config.type === "currencyrange" ||
        config.type === "numberrange" ||
        config.type === "daterange"
      ) {
        // Range types: serialize as JSON
        const rangeValue = value as { from?: unknown; to?: unknown }
        const serialized = {
          from: rangeValue.from ?? null,
          to: rangeValue.to ?? null,
        }
        // Only set if at least one value exists
        if (serialized.from !== null || serialized.to !== null) {
          stringValue = JSON.stringify(serialized)
        } else {
          stringValue = null
        }
      } else if (config.type === "multiselect") {
        const arr = value as string[]
        if (Array.isArray(arr) && arr.length) {
          stringValue = JSON.stringify(arr)
        } else {
          stringValue = null
        }
      } else if (config.type === "number") {
        stringValue = String(value)
      } else {
        stringValue = String(value)
      }

      updateParams({ [key]: stringValue })
    },
    [filterConfig, updateParams]
  )

  // Set multiple filter values at once
  const setFilters = useCallback(
    (filters: Record<string, unknown>) => {
      const updates: Record<string, string | null> = {}

      Object.entries(filters).forEach(([key, value]) => {
        const config = filterConfig.find((c) => c.key === key)
        if (!config) return

        if (value === null || value === undefined || value === "") {
          updates[key] = null
        } else if (
          config.type === "currencyrange" ||
          config.type === "numberrange" ||
          config.type === "daterange"
        ) {
          const rangeValue = value as { from?: unknown; to?: unknown }
          if (rangeValue.from !== null || rangeValue.to !== null) {
            const serialized = {
              from: rangeValue.from ?? null,
              to: rangeValue.to ?? null,
            }
            updates[key] = JSON.stringify(serialized)
          } else {
            updates[key] = null
          }
        } else if (config.type === "multiselect") {
          const arr = value as string[]
          if (Array.isArray(arr) && arr.length) {
            updates[key] = JSON.stringify(arr)
          } else {
            updates[key] = null
          }
        } else if (config.type === "number") {
          updates[key] = String(value)
        } else {
          updates[key] = String(value)
        }
      })

      updateParams(updates)
    },
    [filterConfig, updateParams]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    const updates: Record<string, null> = {}
    filterConfig.forEach((config) => {
      updates[config.key] = null
    })
    updateParams(updates)
  }, [filterConfig, updateParams])

  return {
    filterValues,
    setFilterValue,
    setFilters,
    clearFilters,
  }
}
