"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigation } from "@/contexts/navigation-context"

export default function MenuPage() {
  const router = useRouter()
  const { isMobile } = useNavigation()

  // Get the referrer from session storage or default to dashboard
  const referrer = typeof window !== "undefined" ? sessionStorage.getItem("menuReferrer") || "/dashboard" : "/dashboard"

  // Handle back button click
  const handleBackClick = () => {
    router.push(referrer)
  }

  // Redirect to dashboard if not on mobile
  useEffect(() => {
    if (!isMobile) {
      router.push("/dashboard")
    }
  }, [isMobile, router])

  // Set up back button handler
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault()
      router.push(referrer)
    }

    window.addEventListener("popstate", handleBackButton)

    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [router, referrer])

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="fixed top-0 left-0 right-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBackClick} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <div className="text-lg font-semibold">Menu</div>
        </div>
      </div>
      <div className="mt-16 mb-8 flex-1 overflow-auto hide-scrollbar">
        <Sidebar className="w-full border-none" isMobile={true} isFullPage={true} largeMobileButtons={true} />
      </div>
    </div>
  )
}
