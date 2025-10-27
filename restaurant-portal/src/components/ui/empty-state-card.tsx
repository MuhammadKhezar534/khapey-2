import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"

interface EmptyStateCardProps {
  title: string
  message: string
  icon: ReactNode
}

export function EmptyStateCard({ title, message, icon }: EmptyStateCardProps) {
  return (
    <Card className="w-full border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">{icon}</div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="mb-6 text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}
