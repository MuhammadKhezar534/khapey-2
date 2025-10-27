import type React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import ErrorBoundary from "@/components/error-boundary"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout>
      <ErrorBoundary componentName="Dashboard Layout">
        <div className="content-container w-full max-w-full">{children}</div>
      </ErrorBoundary>
    </MainLayout>
  )
}
