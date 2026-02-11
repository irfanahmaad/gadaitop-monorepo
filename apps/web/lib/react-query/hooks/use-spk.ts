"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  ConfirmSpkDto,
  CreateSpkDto,
  ExtendSpkDto,
  Nkb,
  QuerySpkDto,
  RedeemSpkDto,
  Spk,
  SpkHistory,
} from "@/lib/api/types"

// Query keys
export const spkKeys = {
  all: ["spk"] as const,
  lists: () => [...spkKeys.all, "list"] as const,
  list: (options?: QuerySpkDto) => [...spkKeys.lists(), options] as const,
  details: () => [...spkKeys.all, "detail"] as const,
  detail: (id: string) => [...spkKeys.details(), id] as const,
  history: (id: string) => [...spkKeys.all, "history", id] as const,
  nkb: (id: string) => [...spkKeys.all, "nkb", id] as const,
}

// Get SPK list
export function useSpkList(options?: QuerySpkDto) {
  return useQuery({
    queryKey: spkKeys.list(options),
    queryFn: () => apiClient.getList<Spk>(endpoints.spk.list, options),
  })
}

// Get single SPK
export function useSpk(id: string) {
  return useQuery({
    queryKey: spkKeys.detail(id),
    queryFn: () => apiClient.get<Spk>(endpoints.spk.detail(id)),
    enabled: !!id,
  })
}

// Get SPK history
export function useSpkHistory(id: string) {
  return useQuery({
    queryKey: spkKeys.history(id),
    queryFn: () => apiClient.get<SpkHistory[]>(endpoints.spk.history(id)),
    enabled: !!id,
  })
}

// Get SPK NKB records
export function useSpkNkb(id: string) {
  return useQuery({
    queryKey: spkKeys.nkb(id),
    queryFn: () => apiClient.get<Nkb[]>(endpoints.spk.nkb(id)),
    enabled: !!id,
  })
}

// Create SPK
export function useCreateSpk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSpkDto) =>
      apiClient.post<Spk, CreateSpkDto>(endpoints.spk.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spkKeys.lists() })
    },
  })
}

// Confirm SPK with customer PIN
export function useConfirmSpk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConfirmSpkDto }) =>
      apiClient.put<Spk, ConfirmSpkDto>(endpoints.spk.confirm(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: spkKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: spkKeys.lists() })
    },
  })
}

// Extend SPK
export function useExtendSpk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExtendSpkDto }) =>
      apiClient.put<Spk, ExtendSpkDto>(endpoints.spk.extend(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: spkKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: spkKeys.lists() })
      queryClient.invalidateQueries({ queryKey: spkKeys.history(variables.id) })
    },
  })
}

// Redeem SPK
export function useRedeemSpk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RedeemSpkDto }) =>
      apiClient.put<Spk, RedeemSpkDto>(endpoints.spk.redeem(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: spkKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: spkKeys.lists() })
      queryClient.invalidateQueries({ queryKey: spkKeys.history(variables.id) })
    },
  })
}
