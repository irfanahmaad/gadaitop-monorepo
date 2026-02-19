"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import { getSession } from "next-auth/react"

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

// Upload a file through the backend to S3 (avoids CORS)
export function useUploadFile() {
  return useMutation({
    mutationFn: async ({
      file,
      key,
    }: {
      file: File
      key?: string
    }): Promise<UploadFileResponse> => {
      const formData = new FormData()
      formData.append("file", file)
      if (key) formData.append("key", key)

      const session = await getSession()
      const res = await fetch(endpoints.upload.file, {
        method: "POST",
        headers: {
          ...(session?.accessToken && {
            Authorization: `Bearer ${session.accessToken}`,
          }),
        },
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Upload failed")
      }

      return res.json()
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
