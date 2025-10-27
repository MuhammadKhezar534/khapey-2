"use client"

import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export function OfflineFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md w-full text-center">
        <WifiOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">You're offline</h2>
        <p className="text-gray-600 mb-4">Please check your internet connection and try again.</p>
        <Button onClick={() => window.location.reload()} className="w-full">
          Retry Connection
        </Button>
      </div>
    </div>
  )
}
