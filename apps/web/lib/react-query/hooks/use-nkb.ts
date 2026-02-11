"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  ConfirmNkbDto,
  CreateNkbDto,
  Nkb,
  QueryNkbDto,
  RejectNkbDto,
} from "@/lib/api/types"

import { spkKeys } from "./use-spk"

// Query keys
export const nkbKeys = {
  all: ["nkb"] as const,
  lists: () => [...nkbKeys.all, "list"] as const,
  list: (options?: QueryNkbDto) => [...nkbKeys.lists(), options] as const,
  details: () => [...nkbKeys.all, "detail"] as const,
  detail: (id: string) => [...nkbKeys.details(), id] as const,
}

// Get NKB list
export function useNkbList(options?: QueryNkbDto) {
  return useQuery({
    queryKey: nkbKeys.list(options),
    queryFn: () => apiClient.getList<Nkb>(endpoints.nkb.list, options),
  })
}

// Get single NKB
export function useNkb(id: string) {
  return useQuery({
    queryKey: nkbKeys.detail(id),
    queryFn: () => apiClient.get<Nkb>(endpoints.nkb.detail(id)),
    enabled: !!id,
  })
}

// Create NKB
export function useCreateNkb() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNkbDto) =>
      apiClient.post<Nkb, CreateNkbDto>(endpoints.nkb.create, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: nkbKeys.lists() })
      // Also invalidate the related SPK's NKB records
      if (result?.spkId) {
        queryClient.invalidateQueries({ queryKey: spkKeys.nkb(result.spkId) })
        queryClient.invalidateQueries({
          queryKey: spkKeys.detail(result.spkId),
        })
      }
    },
  })
}

// Confirm NKB
export function useConfirmNkb() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ConfirmNkbDto }) =>
      apiClient.put<Nkb, ConfirmNkbDto | undefined>(
        endpoints.nkb.confirm(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: nkbKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: nkbKeys.lists() })
      // Invalidate all SPK data since NKB confirmation affects SPK state
      queryClient.invalidateQueries({ queryKey: spkKeys.all })
    },
  })
}

// Reject NKB
export function useRejectNkb() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectNkbDto }) =>
      apiClient.put<Nkb, RejectNkbDto>(endpoints.nkb.reject(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: nkbKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: nkbKeys.lists() })
    },
  })
}
