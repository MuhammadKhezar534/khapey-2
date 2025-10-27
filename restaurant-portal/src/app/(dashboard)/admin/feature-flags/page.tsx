"use client"

import { FeatureFlagAdmin } from "@/components/admin/feature-flag-admin"
import { useNavigation } from "@/contexts/navigation-context"
import { useEffect } from "react"

export default function FeatureFlagsPage() {
  const { setActiveTab } = useNavigation()

  // Set the active tab to dashboard when this page loads
  useEffect(() => {
    setActiveTab("/dashboard")
  }, [setActiveTab])

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      <h1 className="text-2xl font-bold">Feature Flag Management</h1>
      <p className="text-muted-foreground">Control which features are available to users across the application.</p>
      <FeatureFlagAdmin />
    </div>
  )
}
