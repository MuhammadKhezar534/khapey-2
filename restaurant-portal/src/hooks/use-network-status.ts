"use client"

import { useState, useEffect } from "react"

interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
  connectionType: string | null
  effectiveConnectionType: string | null
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true)
  const [wasOffline, setWasOffline] = useState<boolean>(false)
  const [connectionType, setConnectionType] = useState<string | null>(null)
  const [effectiveConnectionType, setEffectiveConnectionType] = useState<string | null>(null)

  useEffect(() => {
    // Initial connection info if available
    if (
      typeof navigator !== "undefined" &&
      "connection" in navigator &&
      navigator.connection &&
      "type" in navigator.connection
    ) {
      const connection = navigator.connection as any
      setConnectionType(connection.type || null)
      setEffectiveConnectionType(connection.effectiveType || null)
    }

    const handleOnline = () => {
      setIsOnline(true)
      // If we were previously offline, set wasOffline to true
      if (!isOnline) {
        setWasOffline(true)
        // Reset wasOffline after 5 seconds
        setTimeout(() => setWasOffline(false), 5000)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    const handleConnectionChange = () => {
      if (
        typeof navigator !== "undefined" &&
        "connection" in navigator &&
        navigator.connection &&
        "type" in navigator.connection
      ) {
        const connection = navigator.connection as any
        setConnectionType(connection.type || null)
        setEffectiveConnectionType(connection.effectiveType || null)
      }
    }

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Connection change event if available
    if (
      typeof navigator !== "undefined" &&
      "connection" in navigator &&
      navigator.connection &&
      "addEventListener" in navigator.connection
    ) {
      const connection = navigator.connection as any
      connection.addEventListener("change", handleConnectionChange)
    }

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)

      if (
        typeof navigator !== "undefined" &&
        "connection" in navigator &&
        navigator.connection &&
        "removeEventListener" in navigator.connection
      ) {
        const connection = navigator.connection as any
        connection.removeEventListener("change", handleConnectionChange)
      }
    }
  }, [isOnline])

  return {
    isOnline,
    wasOffline,
    connectionType,
    effectiveConnectionType,
  }
}
