"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"

/**
 * Safely redirect to a new page
 */
export function useRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  const navigate = useCallback(
    (path: string) => {
      // Don't navigate if we're already on the page
      if (pathname === path) return

      // Use router.push for client-side navigation
      router.push(path)
    },
    [router, pathname],
  )

  return {
    /**
     * Navigate to a new page
     */
    navigate,

    /**
     * Replace the current URL
     */
    replace: (path: string) => {
      // Don't navigate if we're already on the page
      if (pathname === path) return

      router.replace(path)
    },

    /**
     * Go back to the previous page
     */
    back: () => {
      router.back()
    },

    /**
     * Refresh the current page
     */
    refresh: () => {
      router.refresh()
    },

    /**
     * Get the current pathname
     */
    pathname,
  }
}

/**
 * Check if a path is external (starts with http:// or https://)
 */
export function isExternalLink(path: string): boolean {
  return /^https?:\/\//.test(path)
}

/**
 * Get the base path from a URL
 */
export function getBasePath(path: string): string {
  return path.split("?")[0].split("#")[0]
}

/**
 * Get query parameters from a URL
 */
export function getQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  const queryString = url.split("?")[1]

  if (!queryString) return params

  const searchParams = new URLSearchParams(queryString)
  searchParams.forEach((value, key) => {
    params[key] = value
  })

  return params
}
