"use client"

import { useState, useCallback, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Logger } from "@/lib/logger"
import { reportPerformanceMetric } from "@/lib/performance-monitoring"

const logger = new Logger("CacheAnalytics")

interface CacheStats {
  hits: number
  misses: number
  ratio: number
  size: number
  queries: Record<
    string,
    {
      hits: number
      misses: number
      lastAccessed: number
      dataSize: number
    }
  >
}

export function useCacheAnalytics() {
  const queryClient = useQueryClient()
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    hits: 0,
    misses: 0,
    ratio: 0,
    size: 0,
    queries: {},
  })

  // Track a cache event (hit or miss)
  const trackCacheEvent = useCallback((type: "hit" | "miss", queryKey: any[], dataSize = 0) => {
    const queryKeyString = JSON.stringify(queryKey)

    setCacheStats((prev) => {
      const hits = type === "hit" ? prev.hits + 1 : prev.hits
      const misses = type === "miss" ? prev.misses + 1 : prev.misses
      const total = hits + misses
      const ratio = total > 0 ? hits / total : 0

      // Update query-specific stats
      const queries = { ...prev.queries }
      const queryStats = queries[queryKeyString] || { hits: 0, misses: 0, lastAccessed: 0, dataSize: 0 }

      queries[queryKeyString] = {
        hits: type === "hit" ? queryStats.hits + 1 : queryStats.hits,
        misses: type === "miss" ? queryStats.misses + 1 : queryStats.misses,
        lastAccessed: Date.now(),
        dataSize: dataSize || queryStats.dataSize,
      }

      // Calculate total cache size
      const size = Object.values(queries).reduce((total, query) => total + query.dataSize, 0)

      logger.debug(`Cache ${type} for ${queryKeyString}, size: ${dataSize} bytes`)

      return { hits, misses, ratio, size, queries }
    })
  }, [])

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return cacheStats
  }, [cacheStats])

  // Get stats for a specific query
  const getQueryStats = useCallback(
    (queryKey: any[]) => {
      const queryKeyString = JSON.stringify(queryKey)
      return cacheStats.queries[queryKeyString] || null
    },
    [cacheStats],
  )

  // Clear cache statistics
  const clearCacheStats = useCallback(() => {
    setCacheStats({
      hits: 0,
      misses: 0,
      ratio: 0,
      size: 0,
      queries: {},
    })
  }, [])

  // Analyze cache efficiency
  const analyzeCacheEfficiency = useCallback(() => {
    const { hits, misses, queries } = cacheStats
    const total = hits + misses

    if (total === 0) {
      return {
        overallEfficiency: 0,
        inefficientQueries: [],
        recommendations: ["No cache data available yet."],
      }
    }

    const overallEfficiency = hits / total

    // Find inefficient queries (hit ratio < 0.5 and accessed more than 5 times)
    const inefficientQueries = Object.entries(queries)
      .filter(([_, stats]) => {
        const queryTotal = stats.hits + stats.misses
        return queryTotal >= 5 && stats.hits / queryTotal < 0.5
      })
      .map(([key, stats]) => ({
        queryKey: key,
        hitRatio: stats.hits / (stats.hits + stats.misses),
        totalAccesses: stats.hits + stats.misses,
      }))
      .sort((a, b) => a.hitRatio - b.hitRatio)

    // Generate recommendations
    const recommendations: string[] = []

    if (overallEfficiency < 0.7) {
      recommendations.push("Overall cache efficiency is low. Consider increasing cache stale time.")
    }

    if (inefficientQueries.length > 0) {
      recommendations.push(
        `Found ${inefficientQueries.length} inefficient queries. Consider optimizing their cache settings.`,
      )
    }

    // Check for large cached items
    const largeItems = Object.entries(queries)
      .filter(([_, stats]) => stats.dataSize > 100000) // > 100KB
      .map(([key, stats]) => ({
        queryKey: key,
        size: stats.dataSize,
      }))

    if (largeItems.length > 0) {
      recommendations.push(`Found ${largeItems.length} large cached items. Consider optimizing their data size.`)
    }

    return {
      overallEfficiency,
      inefficientQueries,
      recommendations,
    }
  }, [cacheStats])

  // Monitor React Query cache
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "queryUpdated") {
        const query = event.query
        const queryKey = query.queryKey

        if (query.state.status === "success") {
          // Estimate data size
          const dataSize = estimateSize(query.state.data)

          // Determine if this was a cache hit or miss
          const isFromCache = !query.state.dataUpdateCount || query.state.dataUpdatedAt !== query.state.dataUpdateCount

          trackCacheEvent(isFromCache ? "hit" : "miss", queryKey, dataSize)
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [queryClient, trackCacheEvent])

  useEffect(() => {
    if (typeof window !== "undefined" && "performance" in window) {
      // Monitor cache hit rate
      let cacheHits = 0
      let cacheMisses = 0

      const originalFetch = window.fetch
      window.fetch = async (input, init) => {
        const response = await originalFetch(input, init)

        // Check if response came from cache
        const fromCache = response.headers.get("x-from-cache") === "true" || response.headers.get("age") !== null

        if (fromCache) {
          cacheHits++
        } else {
          cacheMisses++
        }

        // Report cache hit rate periodically
        if ((cacheHits + cacheMisses) % 10 === 0) {
          const hitRate = cacheHits / (cacheHits + cacheMisses)
          reportPerformanceMetric("cache_hit_rate", hitRate * 100)
        }

        return response
      }

      return () => {
        window.fetch = originalFetch
      }
    }
  }, [])

  return {
    cacheStats,
    trackCacheEvent,
    getCacheStats,
    getQueryStats,
    clearCacheStats,
    analyzeCacheEfficiency,
  }
}

// Helper function to estimate the size of data in bytes
function estimateSize(data: any): number {
  if (data === null || data === undefined) {
    return 0
  }

  const jsonString = JSON.stringify(data)

  // In JavaScript, each character is 2 bytes (UTF-16)
  return jsonString.length * 2
}
