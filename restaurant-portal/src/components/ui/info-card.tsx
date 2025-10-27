import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface InfoCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function InfoCard({ title, description, children, className }: InfoCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
