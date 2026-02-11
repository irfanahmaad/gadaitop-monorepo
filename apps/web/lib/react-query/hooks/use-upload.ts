"use client"

import { useMutation, useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type {
  PresignedUrlRequest,
  PresignedUrlResponse,
  PublicUrlResponse,
} from "@/lib/api/types"

// Query keys
export const uploadKeys = {
  all: ["upload"] as const,
  publicUrl: (key: string) => [...uploadKeys.all, "publicUrl", key] as const,
}

// Get presigned upload URL (mutation since it creates a new signed URL)
export function usePresignedUrl() {
  return useMutation({
    mutationFn: (data: PresignedUrlRequest) =>
      apiClient.post<PresignedUrlResponse, PresignedUrlRequest>(
        endpoints.upload.presigned,
        data
      ),
  })
}

// Get public URL for an uploaded file
export function usePublicUrl(key: string) {
  return useQuery({
    queryKey: uploadKeys.publicUrl(key),
    queryFn: () =>
      apiClient.get<PublicUrlResponse>(
        `${endpoints.upload.publicUrl}?key=${encodeURIComponent(key)}`
      ),
    enabled: !!key,
  })
}
