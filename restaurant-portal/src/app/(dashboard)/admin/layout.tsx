import type React from "react"
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex flex-col min-h-[calc(100vh-4rem)]">{children}</div>
}
