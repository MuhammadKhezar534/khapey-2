"\"use client"

import { useState, useEffect } from "react"

// Define breakpoints for consistency
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

/**
 * Hook to detect if the current viewport is mobile
 * @param breakpoint - The breakpoint to check against (default: md)
 * @returns boolean indicating if the viewport is smaller than the breakpoint
 */
export function useIsMobile(breakpoint: keyof typeof BREAKPOINTS = "md"): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Set initial value
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS[breakpoint])
    }

    // Check on mount
    checkIfMobile()

    // Add event listener for resize
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [breakpoint])

  return isMobile
}

/**
 * Hook to get the current viewport size
 * @returns The current viewport size as a string: 'xs', 'sm', 'md', 'lg', 'xl', '2xl'
 */
export function useViewportSize(): string {
  const [viewportSize, setViewportSize] = useState<string>("md")

  useEffect(() => {
    const checkViewportSize = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.sm) return setViewportSize("xs")
      if (width < BREAKPOINTS.md) return setViewportSize("sm")
      if (width < BREAKPOINTS.lg) return setViewportSize("md")
      if (width < BREAKPOINTS.xl) return setViewportSize("lg")
      if (width < BREAKPOINTS["2xl"]) return setViewportSize("xl")
      return setViewportSize("2xl")
    }

    checkViewportSize()
    window.addEventListener("resize", checkViewportSize)

    return () => {
      window.removeEventListener("resize", checkViewportSize)
    }
  }, [])

  return viewportSize
}
