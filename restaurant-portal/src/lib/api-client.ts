/**
 * Standardized API client with consistent error handling and caching
 */

import { handleError, createAppError, ErrorType } from "./error-handling"

interface FetchOptions extends RequestInit {
  timeout?: number
  cache?: RequestCache
  cacheTime?: number // Time in seconds for Cache-Control max-age
}

/**
 * Enhanced fetch function with timeout, error handling, and caching
 */
export async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = 8000, cache = "default", cacheTime, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  // Add cache headers if cacheTime is provided
  if (cacheTime && fetchOptions.headers) {
    const headers = new Headers(fetchOptions.headers)
    headers.append("Cache-Control", `max-age=${cacheTime}`)
    fetchOptions.headers = headers
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      cache,
    })

    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof DOMException && error.name === "AbortError") {
      throw createAppError("Request timed out. Please try again.", ErrorType.NETWORK)
    }

    throw error
  }
}

/**
 * Standardized API request function with proper error handling
 */
export async function apiRequest<T>(url: string, options: FetchOptions = {}): Promise<T> {
  try {
    const response = await fetchWithTimeout(url, options)

    // Handle HTTP error status codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Map HTTP status codes to error types
      switch (response.status) {
        case 400:
          throw createAppError(
            errorData.message || "Invalid request data",
            ErrorType.VALIDATION,
            errorData.errors,
            response.status,
          )
        case 401:
          throw createAppError("Authentication required", ErrorType.AUTHENTICATION, errorData, response.status)
        case 403:
          throw createAppError(
            "You don't have permission to access this resource",
            ErrorType.AUTHORIZATION,
            errorData,
            response.status,
          )
        case 404:
          throw createAppError("Resource not found", ErrorType.NOT_FOUND, errorData, response.status)
        case 429:
          throw createAppError(
            "Too many requests. Please try again later.",
            ErrorType.NETWORK,
            errorData,
            response.status,
          )
        default:
          if (response.status >= 500) {
            throw createAppError("Server error. Please try again later.", ErrorType.SERVER, errorData, response.status)
          } else {
            throw createAppError(errorData.message || "Request failed", ErrorType.UNKNOWN, errorData, response.status)
          }
      }
    }

    // Parse JSON response
    const data = await response.json()
    return data as T
  } catch (error) {
    // Use our standardized error handling
    throw handleError(error, "Failed to complete request")
  }
}

/**
 * GET request helper with caching support
 */
export async function get<T>(url: string, options: FetchOptions = {}): Promise<T> {
  // Default to using cache for GET requests
  const cacheOptions = {
    cache: "force-cache" as RequestCache,
    cacheTime: 300, // 5 minutes default cache time
    ...options,
  }
  return apiRequest<T>(url, { ...cacheOptions, method: "GET" })
}

/**
 * POST request helper
 */
export async function post<T>(url: string, data: any, options: FetchOptions = {}): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(data),
  })
}

/**
 * PUT request helper
 */
export async function put<T>(url: string, data: any, options: FetchOptions = {}): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: JSON.stringify(data),
  })
}

/**
 * DELETE request helper
 */
export async function del<T>(url: string, options: FetchOptions = {}): Promise<T> {
  return apiRequest<T>(url, { ...options, method: "DELETE" })
}
