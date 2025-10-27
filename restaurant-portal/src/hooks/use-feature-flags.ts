"use client"

import { useState, useEffect, useCallback } from "react"
import {
  isNavigationEnabled,
  isTabEnabled,
  isFeatureEnabled,
  hasPermission,
  updateFeatureFlags,
  setFeatureOverride,
  resetFeatureOverrides,
  getEnabledNavigationItems,
  getEnabledTabs,
  initFeatureFlags,
} from "@/lib/feature-flags"

export function useFeatureFlags() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Initialize feature flags on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      try {
        await initFeatureFlags()
        setLastUpdated(new Date())
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error initializing feature flags"))
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  // Refresh feature flags from API
  const refreshFlags = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await updateFeatureFlags()
      if (!success) {
        setError(new Error("Failed to update feature flags"))
      }
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error updating feature flags"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isNavigationEnabled,
    isTabEnabled,
    isFeatureEnabled,
    hasPermission,
    setFeatureOverride,
    resetFeatureOverrides,
    getEnabledNavigationItems,
    getEnabledTabs,
    refreshFlags,
    isLoading,
    error,
    lastUpdated,
  }
}
