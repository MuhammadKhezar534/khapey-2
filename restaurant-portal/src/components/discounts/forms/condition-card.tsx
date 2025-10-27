"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ConditionCardProps {
  title: string
  description?: string
  icon?: ReactNode
  className?: string
  children: ReactNode
}

export function ConditionCard({ title, description, icon, className, children }: ConditionCardProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader className="py-4">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4 pt-0">{children}</CardContent>
    </Card>
  )
}
