import type React from "react"
export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This is an intentionally empty layout that inherits from the parent
  return <>{children}</>
}
