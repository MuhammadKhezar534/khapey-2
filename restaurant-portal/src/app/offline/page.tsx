"use client"

import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OfflinePage() {
  const router = useRouter()

  const handleTryAgain = () => {
    // Attempt to reload the page
    window.location.reload()
  }

  const handleGoHome = () => {
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="flex flex-col items-center max-w-md text-center">
        <div className="p-4 rounded-full bg-muted mb-6">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold mb-4">You're offline</h1>

        <p className="text-muted-foreground mb-8">
          It looks like you've lost your internet connection. Some features may be limited until you're back online.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button onClick={handleTryAgain} className="flex-1">
            Try again
          </Button>
          <Button onClick={handleGoHome} variant="outline" className="flex-1">
            Go to Dashboard
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Don't worry, any cached data will still be available while you're offline.
        </p>
      </div>
    </div>
  )
}
