"use client"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"

export function usePrefetch(paths: string[]) {
  const router = useRouter()

  const prefetchPaths = useCallback(() => {
    paths.forEach((path) => {
      router.prefetch(path)
    })
  }, [paths, router])

  useEffect(() => {
    prefetchPaths()
  }, [prefetchPaths])

  return { prefetchPaths }
}
