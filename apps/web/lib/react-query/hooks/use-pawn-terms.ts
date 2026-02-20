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
  CreatePawnTermDto,
  PageOptions,
  PawnTerm,
  UpdatePawnTermDto,
} from "@/lib/api/types"

// Query keys
export const pawnTermKeys = {
  all: ["pawnTerms"] as const,
  lists: () => [...pawnTermKeys.all, "list"] as const,
  list: (options?: PageOptions) =>
    [...pawnTermKeys.lists(), options] as const,
  details: () => [...pawnTermKeys.all, "detail"] as const,
  detail: (id: string) => [...pawnTermKeys.details(), id] as const,
}

// Get pawn terms list
export function usePawnTerms(options?: PageOptions) {
  return useQuery({
    queryKey: pawnTermKeys.list(options),
    queryFn: () =>
      apiClient.getList<PawnTerm>(endpoints.pawnTerms.list, options),
    placeholderData: keepPreviousData,
  })
}

// Get single pawn term
export function usePawnTerm(id: string) {
  return useQuery({
    queryKey: pawnTermKeys.detail(id),
    queryFn: () =>
      apiClient.get<PawnTerm>(endpoints.pawnTerms.detail(id)),
    enabled: !!id,
  })
}

// Create pawn term
export function useCreatePawnTerm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePawnTermDto) =>
      apiClient.post<PawnTerm, CreatePawnTermDto>(
        endpoints.pawnTerms.create,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pawnTermKeys.lists() })
    },
  })
}

// Update pawn term
export function useUpdatePawnTerm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePawnTermDto }) =>
      apiClient.put<PawnTerm, UpdatePawnTermDto>(
        endpoints.pawnTerms.update(id),
        data
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pawnTermKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: pawnTermKeys.lists() })
    },
  })
}

// Delete pawn term
export function useDeletePawnTerm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<void>(endpoints.pawnTerms.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pawnTermKeys.lists() })
    },
  })
}
