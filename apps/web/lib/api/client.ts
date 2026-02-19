import { getSession } from "next-auth/react"

import type { ApiError, ApiResponse, PageOptions, PaginatedResponse } from "./types"

// Build query string from PageOptions
function buildQueryString(options?: PageOptions): string {
  if (!options) return ""

  const params = new URLSearchParams()

  if (options.page !== undefined) params.set("page", String(options.page))
  if (options.pageSize !== undefined) params.set("pageSize", String(options.pageSize))
  if (options.order) params.set("order", options.order)
  if (options.sortBy) params.set("sortBy", options.sortBy)
  if (options.query) params.set("query", options.query)

  // Pass filter properties as direct query parameters
  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      params.set(key, String(value))
    })
  }

  // Handle relation object
  if (options.relation) {
    params.set('relation', JSON.stringify(options.relation));
  }

  // Handle select object
  if (options.select) {
    params.set('select', JSON.stringify(options.select));
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ""
}

// Custom error class
export class ApiClientError extends Error {
  constructor(
    public statusCode: number,
    public errorMessage: string,
    public errorType?: string
  ) {
    super(errorMessage)
    this.name = "ApiClientError"
  }

  static fromApiError(error: ApiError): ApiClientError {
    return new ApiClientError(error.statusCode, error.message, error.error)
  }
}

// Request options
interface RequestOptions<TBody = unknown> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: TBody
  headers?: Record<string, string>
  requireAuth?: boolean
  /** Provide access token directly (for server-side usage) */
  accessToken?: string
}

// Token cache to avoid calling getSession() (HTTP request) on every API call.
// Concurrent calls share a single in-flight promise (deduplication).
let cachedToken: string | null = null
let tokenExpiresAt = 0
let pendingSessionPromise: Promise<string | null> | null = null

const TOKEN_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    // Server-side: token should be passed via options.accessToken
    return null
  }

  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken
  }

  // Deduplicate: reuse in-flight getSession() call
  if (!pendingSessionPromise) {
    pendingSessionPromise = getSession()
      .then((session) => {
        cachedToken = session?.accessToken ?? null
        tokenExpiresAt = Date.now() + TOKEN_CACHE_TTL
        return cachedToken
      })
      .finally(() => {
        pendingSessionPromise = null
      })
  }

  return pendingSessionPromise
}

export function clearTokenCache() {
  cachedToken = null
  tokenExpiresAt = 0
  pendingSessionPromise = null
}

// Base fetch function
async function request<TResponse, TBody = unknown>(
  url: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = "GET", body, headers = {}, requireAuth = true, accessToken: providedToken } = options

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  }

  // Add auth header if required
  if (requireAuth) {
    const token = providedToken ?? (await getAccessToken())
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body)
  }

  const response = await fetch(url, fetchOptions)

  // Handle no content responses
  if (response.status === 204) {
    return undefined as TResponse
  }

  // Check if response has a body before parsing JSON
  const contentType = response.headers.get("content-type")
  let data: unknown

  if (contentType?.includes("application/json")) {
    const text = await response.text()
    if (text && text.trim() !== "") {
      try {
        data = JSON.parse(text)
      } catch {
        // If JSON parsing fails, treat as empty response
        data = undefined
      }
    } else {
      data = undefined
    }
  } else {
    // No JSON content type, treat as empty response for successful requests
    data = undefined
  }

  if (!response.ok) {
    const error: ApiError = {
      statusCode: response.status,
      message: (data && typeof data === "object" && "message" in data ? data.message : "An error occurred") as string,
      error: (data && typeof data === "object" && "error" in data ? data.error : undefined) as string | undefined,
    }
    throw ApiClientError.fromApiError(error)
  }

  return data as TResponse
}

// API client methods
export const apiClient = {
  // GET request
  get<TResponse>(url: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<TResponse>(url, { ...options, method: "GET" })
  },

  // GET with pagination
  getList<TData>(url: string, pageOptions?: PageOptions, options?: Omit<RequestOptions, "method" | "body">) {
    const queryString = buildQueryString(pageOptions)
    return request<PaginatedResponse<TData>>(`${url}${queryString}`, { ...options, method: "GET" })
  },

  // POST request
  post<TResponse, TBody = unknown>(url: string, body?: TBody, options?: Omit<RequestOptions<TBody>, "method">) {
    return request<TResponse, TBody>(url, { ...options, method: "POST", body })
  },

  // PUT request
  put<TResponse, TBody = unknown>(url: string, body?: TBody, options?: Omit<RequestOptions<TBody>, "method">) {
    return request<TResponse, TBody>(url, { ...options, method: "PUT", body })
  },

  // PATCH request
  patch<TResponse, TBody = unknown>(url: string, body?: TBody, options?: Omit<RequestOptions<TBody>, "method">) {
    return request<TResponse, TBody>(url, { ...options, method: "PATCH", body })
  },

  // DELETE request
  delete<TResponse>(url: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<TResponse>(url, { ...options, method: "DELETE" })
  },
}

// Server-side API client helper
// Use this in server components or API routes
export function createServerApiClient(accessToken: string) {
  return {
    get<TResponse>(url: string, options?: Omit<RequestOptions, "method" | "body" | "accessToken">) {
      return request<TResponse>(url, { ...options, method: "GET", accessToken })
    },

    getList<TData>(url: string, pageOptions?: PageOptions, options?: Omit<RequestOptions, "method" | "body" | "accessToken">) {
      const queryString = buildQueryString(pageOptions)
      return request<PaginatedResponse<TData>>(`${url}${queryString}`, { ...options, method: "GET", accessToken })
    },

    post<TResponse, TBody = unknown>(url: string, body?: TBody, options?: Omit<RequestOptions<TBody>, "method" | "accessToken">) {
      return request<TResponse, TBody>(url, { ...options, method: "POST", body, accessToken })
    },

    put<TResponse, TBody = unknown>(url: string, body?: TBody, options?: Omit<RequestOptions<TBody>, "method" | "accessToken">) {
      return request<TResponse, TBody>(url, { ...options, method: "PUT", body, accessToken })
    },

    patch<TResponse, TBody = unknown>(url: string, body?: TBody, options?: Omit<RequestOptions<TBody>, "method" | "accessToken">) {
      return request<TResponse, TBody>(url, { ...options, method: "PATCH", body, accessToken })
    },

    delete<TResponse>(url: string, options?: Omit<RequestOptions, "method" | "body" | "accessToken">) {
      return request<TResponse>(url, { ...options, method: "DELETE", accessToken })
    },
  }
}

// Export individual response type helpers
export type { ApiResponse, PaginatedResponse } from "./types"
