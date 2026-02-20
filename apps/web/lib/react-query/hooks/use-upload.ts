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

export interface UploadFileResponse {
  key: string
  url: string
}

// Upload a file via presigned URL flow: get a signed URL then PUT the file directly to S3
export function useUploadFile() {
  return useMutation({
    mutationFn: async ({
      file,
      key,
    }: {
      file: File
      key?: string
    }): Promise<UploadFileResponse> => {
      const fileKey = key ?? `uploads/${Date.now()}-${file.name}`

      const presigned = await apiClient.post<
        PresignedUrlResponse,
        PresignedUrlRequest
      >(endpoints.upload.presigned, {
        key: fileKey,
        contentType: file.type,
      })

      const uploadRes = await fetch(presigned.url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error("Upload to storage failed")
      }

      return { key: presigned.key, url: presigned.url }
    },
  })
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
