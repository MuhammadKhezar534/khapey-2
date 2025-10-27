import type React from "react"
;('"use client')

import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { cn } from "@/lib/utils"
import { RefreshCw, ArrowDown } from "lucide-react"
import { useEffect, useRef } from "react"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isPulling, pullProgress, isRefreshing } = usePullToRefresh({
    onRefresh,
    containerRef,
  })

  // Prevent body scrolling when pulling
  useEffect(() => {
    if (isPulling) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isPulling])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 flex justify-center transition-transform duration-200 z-10",
          isPulling || isRefreshing ? "top-2" : "-top-10",
        )}
        style={{
          transform: isPulling ? `translateY(${pullProgress * 50}px)` : "none",
        }}
      >
        <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-md">
          <RefreshCw
            className={cn("h-5 w-5", isRefreshing && "animate-spin")}
            style={{
              transform: isPulling ? `rotate(${pullProgress * 360}deg)` : "none",
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: isPulling ? `translateY(${pullProgress * 50}px)` : "none",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  threshold = 80,
}: {
  pullDistance: number
  isRefreshing: boolean
  threshold?: number
}) => {
  const progress = Math.min(1, pullDistance / threshold)

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-transform duration-300",
        isRefreshing ? "h-12" : "h-0",
      )}
      style={{
        transform: isRefreshing ? "translateY(0)" : `translateY(-${threshold}px)`,
        opacity: isRefreshing ? 1 : progress,
      }}
    >
      <div className="flex items-center justify-center h-12 w-12">
        {isRefreshing ? (
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <ArrowDown
            className="h-6 w-6 text-primary transition-transform"
            style={{
              transform: `rotate(${Math.min(180, progress * 180)}deg)`,
            }}
          />
        )}
      </div>
    </div>
  )
}
