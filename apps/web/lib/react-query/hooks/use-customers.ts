"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  BlacklistCustomerDto,
  ChangePinDto,
  CreateCustomerDto,
  Customer,
  KtpScanResult,
  PageOptions,
  ScanKtpDto,
  UpdateCustomerDto,
} from "@/lib/api/types"

// Query keys
export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (options?: PageOptions) => [...customerKeys.lists(), options] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
}

// Get customers list
export function useCustomers(options?: PageOptions) {
  return useQuery({
    queryKey: customerKeys.list(options),
    queryFn: () =>
      apiClient.getList<Customer>(endpoints.customers.list, options),
  })
}

// Get single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => apiClient.get<Customer>(endpoints.customers.detail(id)),
    enabled: !!id,
  })
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCustomerDto) =>
      apiClient.post<Customer, CreateCustomerDto>(
        endpoints.customers.create,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerDto }) =>
      apiClient.put<Customer, UpdateCustomerDto>(
        endpoints.customers.update(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

// Scan KTP (OCR)
export function useScanKtp() {
  return useMutation({
    mutationFn: (data: ScanKtpDto) =>
      apiClient.post<KtpScanResult, ScanKtpDto>(
        endpoints.customers.scanKtp,
        data
      ),
  })
}

// Change customer PIN
export function useChangeCustomerPin() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePinDto }) =>
      apiClient.put<void, ChangePinDto>(
        endpoints.customers.changePin(id),
        data
      ),
  })
}

// Blacklist customer
export function useBlacklistCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlacklistCustomerDto }) =>
      apiClient.post<Customer, BlacklistCustomerDto>(
        endpoints.customers.blacklist(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

// Unblacklist customer
export function useUnblacklistCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<void>(endpoints.customers.unblacklist(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<void>(endpoints.customers.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}
