import type { ApiError, ApiResponse, PageOptions, PaginatedResponse } from "./types"

const TOKEN_KEY = "auth_token"

// Token management
export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
}

// Build query string from PageOptions
function buildQueryString(options?: PageOptions): string {
  if (!options) return ""

  const params = new URLSearchParams()

  if (options.page !== undefined) params.set("page", String(options.page))
  if (options.pageSize !== undefined) params.set("pageSize", String(options.pageSize))
  if (options.order) params.set("order", options.order)
  if (options.sortBy) params.set("sortBy", options.sortBy)
  if (options.query) params.set("query", options.query)

  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      params.set(`filter[${key}]`, String(value))
    })
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
}

// Base fetch function
async function request<TResponse, TBody = unknown>(
  url: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = "GET", body, headers = {}, requireAuth = true } = options

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  }

  // Add auth header if required
  if (requireAuth) {
    const token = getToken()
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

  const data = await response.json()

  if (!response.ok) {
    const error: ApiError = {
      statusCode: response.status,
      message: data.message || "An error occurred",
      error: data.error,
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

// Export individual response type helpers
export type { ApiResponse, PaginatedResponse } from "./types"
