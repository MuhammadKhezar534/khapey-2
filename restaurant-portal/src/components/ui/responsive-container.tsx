"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}

export function ResponsiveContainer({ children, className, fullWidth = false }: ResponsiveContainerProps) {
  return (
    <div className={cn("w-full min-w-0 max-w-full overflow-hidden", !fullWidth && "content-padding", className)}>
      {children}
    </div>
  )
}
