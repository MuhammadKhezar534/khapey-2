"use client"

import { useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useNetworkStatus } from "@/hooks/use-network-status"

// Simple fallback component
function ErrorFallback({ error, resetErrorBoundary }) {
  const { isOnline } = useNetworkStatus()
  const isNetworkError =
    error.message.includes("network") || error.message.includes("fetch") || error.message.includes("offline")

  return (
    <div className="p-6 border border-red-200 rounded-lg bg-red-50 flex flex-col items-center justify-center text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">
        {isNetworkError ? "Network Error" : "Something went wrong"}
      </h3>
      <p className="text-sm text-red-600 mb-4 max-w-md">
        {isNetworkError
          ? "There was a problem connecting to the server. Please check your internet connection."
          : error.message || "An unexpected error occurred."}
      </p>
      <Button onClick={resetErrorBoundary} disabled={isNetworkError && !isOnline} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        {isNetworkError && !isOnline ? "Waiting for connection..." : "Try again"}
      </Button>
    </div>
  )
}

// Main error boundary component
export function EnhancedErrorBoundary({ children }) {
  const [key, setKey] = useState(0)
  const { isOnline } = useNetworkStatus()

  const handleReset = () => {
    setKey((prev) => prev + 1)
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset} resetKeys={[key, isOnline]}>
      {children}
    </ErrorBoundary>
  )
}
