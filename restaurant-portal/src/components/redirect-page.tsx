"use client"

import { useEffect } from "react"
import { useRedirect } from "@/utils/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface RedirectPageProps {
  to: string
  message?: string
}

export function RedirectPage({ to, message = "Redirecting..." }: RedirectPageProps) {
  const { navigate } = useRedirect()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(to)
    }, 100) // Small delay to ensure the component is mounted

    return () => clearTimeout(timer)
  }, [navigate, to])

  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
