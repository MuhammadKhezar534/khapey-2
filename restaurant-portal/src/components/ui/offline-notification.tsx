"use client"

import { useNetworkStatus } from "@/hooks/use-network-status"
import { Wifi, WifiOff } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function OfflineNotification() {
  const { isOnline, wasOffline } = useNetworkStatus()
  const [show, setShow] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShow(true)
      setShowReconnected(false)
    } else if (wasOffline) {
      setShow(false)
      setShowReconnected(true)
      const timer = setTimeout(() => {
        setShowReconnected(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  if (!show && !showReconnected) return null

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300",
        show || showReconnected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
      )}
    >
      <div
        className={cn(
          "px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium",
          show
            ? "bg-red-100 text-red-800 border border-red-200"
            : "bg-green-100 text-green-800 border border-green-200",
        )}
      >
        {show ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span>You are offline. Some features may be unavailable.</span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            <span>You are back online.</span>
          </>
        )}
      </div>
    </div>
  )
}
