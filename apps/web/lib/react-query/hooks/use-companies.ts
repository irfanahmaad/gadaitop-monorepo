"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  Company,
  CompanyStatistics,
  CreateCompanyWithAdminDto,
  PageOptions,
  UpdateCompanyConfigDto,
  UpdateCompanyDto,
} from "@/lib/api/types"

// Query keys
export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (options?: PageOptions) => [...companyKeys.lists(), options] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
  statistics: (id: string) => [...companyKeys.all, "statistics", id] as const,
}

// Get companies list
export function useCompanies(options?: PageOptions) {
  return useQuery({
    queryKey: companyKeys.list(options),
    queryFn: () => apiClient.getList<Company>(endpoints.companies.list, options),
  })
}

// Get single company
export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => apiClient.get<Company>(endpoints.companies.detail(id)),
    enabled: !!id,
  })
}

// Create company with admin
export function useCreateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCompanyWithAdminDto) =>
      apiClient.post<Company, CreateCompanyWithAdminDto>(
        endpoints.companies.create,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
    },
  })
}

// Get company statistics
export function useCompanyStatistics(id: string) {
  return useQuery({
    queryKey: companyKeys.statistics(id),
    queryFn: () =>
      apiClient.get<CompanyStatistics>(endpoints.companies.statistics(id)),
    enabled: !!id,
  })
}

// Update company
export function useUpdateCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyDto }) =>
      apiClient.patch<Company, UpdateCompanyDto>(endpoints.companies.update(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(variables.id) })
    },
  })
}

// Update company config
export function useUpdateCompanyConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyConfigDto }) =>
      apiClient.patch<Company, UpdateCompanyConfigDto>(
        endpoints.companies.updateConfig(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(variables.id) })
    },
  })
}

// Delete company
export function useDeleteCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<void>(endpoints.companies.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
    },
  })
}
