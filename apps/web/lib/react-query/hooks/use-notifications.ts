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
  Notification,
  PageOptions,
  UnreadCount,
} from "@/lib/api/types"

// Query keys
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (options?: PageOptions) =>
    [...notificationKeys.lists(), options] as const,
  details: () => [...notificationKeys.all, "detail"] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
}

// Get notifications list
export function useNotifications(options?: PageOptions) {
  return useQuery({
    queryKey: notificationKeys.list(options),
    queryFn: () =>
      apiClient.getList<Notification>(endpoints.notifications.list, options),
    placeholderData: keepPreviousData,
  })
}

// Get unread count
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () =>
      apiClient.get<UnreadCount>(endpoints.notifications.unreadCount),
    // Poll every 30 seconds for real-time notification updates
    refetchInterval: 30 * 1000,
  })
}

// Get single notification
export function useNotification(id: string) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () =>
      apiClient.get<Notification>(endpoints.notifications.detail(id)),
    enabled: !!id,
  })
}

// Mark notification as read
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put<void>(endpoints.notifications.markRead(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.detail(id),
      })
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      })
    },
  })
}

// Mark all notifications as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiClient.put<void>(endpoints.notifications.markAllRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
