import type React from "react"
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section className="dashboard-layout">{children}</section>
}
