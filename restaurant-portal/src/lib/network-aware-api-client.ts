"use client";

import { useNetworkStatus } from "@/hooks/use-network-status";
import { useCallback } from "react";
import { Logger } from "./logger";

const logger = new Logger("ApiClient");

interface FetchOptions extends RequestInit {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  cacheResponse?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
  headers: Headers;
  cached: boolean;
}

export class NetworkAwareApiClient {
  private baseUrl: string;
  private defaultOptions: FetchOptions;

  constructor(baseUrl = "", defaultOptions: FetchOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000,
      cacheResponse: true,
      ...defaultOptions,
    };
  }

  async fetch<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = this.baseUrl ? `${this.baseUrl}${url}` : url;
    const mergedOptions: FetchOptions = { ...this.defaultOptions, ...options };
    const { maxRetries, retryDelay, timeout, cacheResponse, ...fetchOptions } =
      mergedOptions;

    let retries = 0;
    let lastError: Error | null = null;
    const cachedResponse = false;

    // Check if we're offline immediately
    if (!navigator.onLine) {
      logger.warn(`Offline detected for request: ${fullUrl}`);

      // Try to get from cache if we're offline
      if (cacheResponse) {
        try {
          const cachedData = await this.getFromCache(fullUrl, fetchOptions);
          if (cachedData) {
            // logger.info(`Using cached data for: ${fullUrl}`);
            return {
              data: cachedData.data as T,
              error: null,
              status: cachedData.status,
              headers: cachedData.headers,
              cached: true,
            };
          }
        } catch (error) {
          logger.error(`Error retrieving from cache: ${fullUrl}`, error);
        }
      }

      return {
        data: null,
        error: new Error(
          "You are offline. Please check your connection and try again."
        ),
        status: 0,
        headers: new Headers(),
        cached: false,
      };
    }

    // Create an AbortController for the timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    while (retries <= maxRetries) {
      try {
        const fetchPromise = fetch(fullUrl, {
          ...fetchOptions,
          signal: controller.signal,
        });

        const response = await fetchPromise;
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Clone the response before consuming it
        const clonedResponse = response.clone();

        // Parse the JSON response
        const data = await response.json();

        // Cache the response if needed
        if (cacheResponse) {
          this.saveToCache(fullUrl, fetchOptions, {
            data,
            status: response.status,
            headers: response.headers,
          });
        }

        return {
          data,
          error: null,
          status: response.status,
          headers: response.headers,
          cached: false,
        };
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;

        // Check if we're offline
        if (!navigator.onLine) {
          logger.warn(`Network became offline during request: ${fullUrl}`);

          // Try to get from cache if we're offline
          if (cacheResponse) {
            try {
              const cachedData = await this.getFromCache(fullUrl, fetchOptions);
              if (cachedData) {
                // logger.info(`Using cached data for: ${fullUrl}`);
                return {
                  data: cachedData.data as T,
                  error: null,
                  status: cachedData.status,
                  headers: cachedData.headers,
                  cached: true,
                };
              }
            } catch (cacheError) {
              logger.error(
                `Error retrieving from cache: ${fullUrl}`,
                cacheError
              );
            }
          }

          break; // Don't retry if we're offline
        }

        // Check if it's an abort error (timeout)
        if (error instanceof DOMException && error.name === "AbortError") {
          logger.warn(`Request timeout for: ${fullUrl}`);
          lastError = new Error(`Request timed out after ${timeout}ms`);
          break; // Don't retry timeouts
        }

        // Increment retry counter
        retries++;

        if (retries <= maxRetries) {
          // Calculate delay with exponential backoff
          const delay = Math.min(retryDelay * Math.pow(2, retries - 1), 30000);
          // logger.info(
          //   `Retrying request (${retries}/${maxRetries}) after ${delay}ms: ${fullUrl}`
          // );

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // If we've exhausted retries or encountered a non-retryable error
    return {
      data: null,
      error: lastError || new Error("Request failed"),
      status: 0,
      headers: new Headers(),
      cached: cachedResponse,
    };
  }

  // Helper method to save response to cache
  private async saveToCache(
    url: string,
    options: RequestInit,
    response: any
  ): Promise<void> {
    try {
      if ("caches" in window) {
        const cache = await caches.open("api-cache");
        const request = new Request(url, options);

        // Create a response to cache
        const responseToCache = new Response(JSON.stringify(response.data), {
          status: response.status,
          headers: response.headers,
        });

        await cache.put(request, responseToCache);
        logger.debug(`Cached response for: ${url}`);
      }
    } catch (error) {
      logger.error(`Error caching response: ${url}`, error);
    }
  }

  // Helper method to get response from cache
  private async getFromCache(
    url: string,
    options: RequestInit
  ): Promise<any | null> {
    try {
      if ("caches" in window) {
        const cache = await caches.open("api-cache");
        const request = new Request(url, options);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
          const data = await cachedResponse.json();
          return {
            data,
            status: cachedResponse.status,
            headers: cachedResponse.headers,
          };
        }
      }
      return null;
    } catch (error) {
      logger.error(`Error retrieving from cache: ${url}`, error);
      return null;
    }
  }
}

// Create and export a singleton instance
export const apiClient = new NetworkAwareApiClient();

export function useNetworkAwareApiClient() {
  const { isOnline } = useNetworkStatus();

  const fetchWithNetworkCheck = useCallback(
    async (url: string, options?: RequestInit) => {
      if (!isOnline) {
        throw new Error(
          "You are offline. Please check your internet connection and try again."
        );
      }

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    [isOnline]
  );

  return { fetchWithNetworkCheck };
}
