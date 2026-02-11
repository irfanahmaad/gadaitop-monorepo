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

  // SPK (Pawn Agreements)
  spk: {
    list: baseUrl("spk"),
    detail: (id: string) => baseUrl(`spk/${id}`),
    create: baseUrl("spk"),
    confirm: (id: string) => baseUrl(`spk/${id}/confirm`),
    extend: (id: string) => baseUrl(`spk/${id}/extend`),
    redeem: (id: string) => baseUrl(`spk/${id}/redeem`),
    history: (id: string) => baseUrl(`spk/${id}/history`),
    nkb: (id: string) => baseUrl(`spk/${id}/nkb`),
  },

  // Customers
  customers: {
    list: baseUrl("customers"),
    detail: (id: string) => baseUrl(`customers/${id}`),
    create: baseUrl("customers"),
    update: (id: string) => baseUrl(`customers/${id}`),
    scanKtp: baseUrl("customers/scan-ktp"),
    changePin: (id: string) => baseUrl(`customers/${id}/pin`),
    blacklist: (id: string) => baseUrl(`customers/${id}/blacklist`),
    unblacklist: (id: string) => baseUrl(`customers/${id}/blacklist`),
    delete: (id: string) => baseUrl(`customers/${id}`),
  },

  // NKB (Transaction Records)
  nkb: {
    list: baseUrl("nkb"),
    detail: (id: string) => baseUrl(`nkb/${id}`),
    create: baseUrl("nkb"),
    confirm: (id: string) => baseUrl(`nkb/${id}/confirm`),
    reject: (id: string) => baseUrl(`nkb/${id}/reject`),
  },

  // Catalogs
  catalogs: {
    list: baseUrl("catalogs"),
    detail: (id: string) => baseUrl(`catalogs/${id}`),
    create: baseUrl("catalogs"),
    update: (id: string) => baseUrl(`catalogs/${id}`),
    delete: (id: string) => baseUrl(`catalogs/${id}`),
    priceHistory: (id: string) => baseUrl(`catalogs/${id}/price-history`),
    import: baseUrl("catalogs/import"),
  },

  // Dashboard
  dashboard: {
    kpis: baseUrl("dashboard/kpis"),
    spkByStatusChart: baseUrl("dashboard/charts/spk-by-status"),
    mutationTrends: baseUrl("dashboard/charts/mutation-trends"),
  },

  // Auction Batches
  auctionBatches: {
    list: baseUrl("auction-batches"),
    detail: (id: string) => baseUrl(`auction-batches/${id}`),
    create: baseUrl("auction-batches"),
    assign: (id: string) => baseUrl(`auction-batches/${id}/assign`),
    itemPickup: (id: string, itemId: string) =>
      baseUrl(`auction-batches/${id}/items/${itemId}/pickup`),
    itemValidation: (id: string, itemId: string) =>
      baseUrl(`auction-batches/${id}/items/${itemId}/validation`),
    finalize: (id: string) => baseUrl(`auction-batches/${id}/finalize`),
    cancel: (id: string) => baseUrl(`auction-batches/${id}/cancel`),
  },

  // Stock Opname
  stockOpname: {
    list: baseUrl("stock-opname"),
    detail: (id: string) => baseUrl(`stock-opname/${id}`),
    create: baseUrl("stock-opname"),
    updateItems: (id: string) => baseUrl(`stock-opname/${id}/items`),
    itemCondition: (id: string, itemId: string) =>
      baseUrl(`stock-opname/${id}/items/${itemId}/condition`),
    complete: (id: string) => baseUrl(`stock-opname/${id}/complete`),
    approve: (id: string) => baseUrl(`stock-opname/${id}/approve`),
  },

  // Cash Deposits
  cashDeposits: {
    list: baseUrl("cash-deposits"),
    detail: (id: string) => baseUrl(`cash-deposits/${id}`),
    create: baseUrl("cash-deposits"),
    approve: (id: string) => baseUrl(`cash-deposits/${id}/approve`),
    reject: (id: string) => baseUrl(`cash-deposits/${id}/reject`),
  },

  // Cash Mutations
  cashMutations: {
    balance: baseUrl("cash-mutations/balance"),
    list: baseUrl("cash-mutations"),
    create: baseUrl("cash-mutations"),
  },

  // Capital Topups
  capitalTopups: {
    list: baseUrl("capital-topups"),
    detail: (id: string) => baseUrl(`capital-topups/${id}`),
    create: baseUrl("capital-topups"),
    update: (id: string) => baseUrl(`capital-topups/${id}`),
    approve: (id: string) => baseUrl(`capital-topups/${id}/approve`),
    reject: (id: string) => baseUrl(`capital-topups/${id}/reject`),
    disburse: (id: string) => baseUrl(`capital-topups/${id}/disburse`),
  },

  // Notifications
  notifications: {
    list: baseUrl("notifications"),
    unreadCount: baseUrl("notifications/unread-count"),
    detail: (id: string) => baseUrl(`notifications/${id}`),
    markRead: (id: string) => baseUrl(`notifications/${id}/read`),
    markAllRead: baseUrl("notifications/read-all"),
  },

  // Reports
  reports: {
    mutationByBranch: baseUrl("reports/mutation-by-branch"),
    mutationByPt: baseUrl("reports/mutation-by-pt"),
    spk: baseUrl("reports/spk"),
    nkbPayments: baseUrl("reports/nkb-payments"),
    stockOpname: baseUrl("reports/stock-opname"),
  },

  // Pawn Terms
  pawnTerms: {
    list: baseUrl("pawn-terms"),
    detail: (id: string) => baseUrl(`pawn-terms/${id}`),
    create: baseUrl("pawn-terms"),
    update: (id: string) => baseUrl(`pawn-terms/${id}`),
    delete: (id: string) => baseUrl(`pawn-terms/${id}`),
  },

  // Upload
  upload: {
    presigned: baseUrl("upload/presigned"),
    publicUrl: baseUrl("upload/public-url"),
    status: baseUrl("upload/status"),
  },

  // Links
  links: {
    list: baseUrl("links"),
    detail: (id: string) => baseUrl(`links/${id}`),
    create: baseUrl("links"),
    update: (id: string) => baseUrl(`links/${id}`),
    delete: (id: string) => baseUrl(`links/${id}`),
  },

  // Health
  health: baseUrl("health"),
} as const
