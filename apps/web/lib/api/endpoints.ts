import { API_URL, API_VERSION } from "@/utils/constants"

// Base URL helper
const baseUrl = (path: string) => `${API_URL}/${API_VERSION}/${path}`

export const endpoints = {
  // Auth
  auth: {
    login: baseUrl("auth/login"),
    register: baseUrl("auth/register"),
    logout: baseUrl("auth/logout"),
    me: baseUrl("auth/me"),
    forgotPassword: baseUrl("auth/forgot-password"),
    resetPassword: baseUrl("auth/reset-password"),
    verifyEmail: baseUrl("auth/verify-email"),
  },

  // Users
  users: {
    list: baseUrl("users"),
    detail: (id: string) => baseUrl(`users/${id}`),
    create: baseUrl("users"),
    update: (id: string) => baseUrl(`users/${id}`),
    delete: (id: string) => baseUrl(`users/${id}`),
    assignRoles: (id: string) => baseUrl(`users/${id}/assign-roles`),
    resetPassword: (id: string) => baseUrl(`users/${id}/reset-password`),
  },

  // Companies
  companies: {
    list: baseUrl("companies"),
    create: baseUrl("companies"),
    detail: (id: string) => baseUrl(`companies/${id}`),
    update: (id: string) => baseUrl(`companies/${id}`),
    delete: (id: string) => baseUrl(`companies/${id}`),
    updateConfig: (id: string) => baseUrl(`companies/${id}/config`),
    statistics: (id: string) => baseUrl(`companies/${id}/statistics`),
  },

  // Branches
  branches: {
    list: baseUrl("branches"),
    detail: (id: string) => baseUrl(`branches/${id}`),
    create: baseUrl("branches"),
    update: (id: string) => baseUrl(`branches/${id}`),
    delete: (id: string) => baseUrl(`branches/${id}`),
    approve: (id: string) => baseUrl(`branches/${id}/approve`),
    reject: (id: string) => baseUrl(`branches/${id}/reject`),
  },

  // Item Types
  itemTypes: {
    list: baseUrl("item-types"),
    detail: (id: string) => baseUrl(`item-types/${id}`),
    create: baseUrl("item-types"),
    update: (id: string) => baseUrl(`item-types/${id}`),
    delete: (id: string) => baseUrl(`item-types/${id}`),
  },

  // Borrow Requests
  borrowRequests: {
    list: baseUrl("borrow-requests"),
    detail: (id: string) => baseUrl(`borrow-requests/${id}`),
    create: baseUrl("borrow-requests"),
    approve: (id: string) => baseUrl(`borrow-requests/${id}/approve`),
    reject: (id: string) => baseUrl(`borrow-requests/${id}/reject`),
  },

  // Devices
  devices: {
    list: (userId: string) => baseUrl(`users/${userId}/devices`),
    register: (userId: string) => baseUrl(`users/${userId}/devices`),
    update: (userId: string, deviceId: string) =>
      baseUrl(`users/${userId}/devices/${deviceId}`),
    delete: (userId: string, deviceId: string) =>
      baseUrl(`users/${userId}/devices/${deviceId}`),
  },

  // Audit
  audit: {
    list: baseUrl("audit-logs"),
    detail: (id: string) => baseUrl(`audit-logs/${id}`),
  },

  // Roles
  roles: {
    list: baseUrl("roles"),
    byCode: (code: string) => baseUrl(`roles/code/${code}`),
  },

  // Health
  health: baseUrl("health"),
} as const
