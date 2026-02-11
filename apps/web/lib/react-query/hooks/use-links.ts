"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  CreateLinkDto,
  Link,
  PageOptions,
  UpdateLinkDto,
} from "@/lib/api/types"

// Query keys
export const linkKeys = {
  all: ["links"] as const,
  lists: () => [...linkKeys.all, "list"] as const,
  list: (options?: PageOptions) => [...linkKeys.lists(), options] as const,
  details: () => [...linkKeys.all, "detail"] as const,
  detail: (id: string) => [...linkKeys.details(), id] as const,
}

// Get links list
export function useLinks(options?: PageOptions) {
  return useQuery({
    queryKey: linkKeys.list(options),
    queryFn: () => apiClient.getList<Link>(endpoints.links.list, options),
  })
}

// Get single link
export function useLink(id: string) {
  return useQuery({
    queryKey: linkKeys.detail(id),
    queryFn: () => apiClient.get<Link>(endpoints.links.detail(id)),
    enabled: !!id,
  })
}

// Create link
export function useCreateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLinkDto) =>
      apiClient.post<Link, CreateLinkDto>(endpoints.links.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
    },
  })
}

// Update link
export function useUpdateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLinkDto }) =>
      apiClient.put<Link, UpdateLinkDto>(endpoints.links.update(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: linkKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
    },
  })
}

// Delete link
export function useDeleteLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<void>(endpoints.links.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.lists() })
    },
  })
}
