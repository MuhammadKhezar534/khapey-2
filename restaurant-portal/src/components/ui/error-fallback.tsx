"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  componentName?: string
}

export function ErrorFallback({ error, resetErrorBoundary, componentName }: ErrorFallbackProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          {componentName ? `Error in ${componentName}` : "Something went wrong"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="p-3 bg-muted rounded-md overflow-auto max-h-[200px]">
          <pre className="text-xs">{error.stack}</pre>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </CardFooter>
    </Card>
  )
}
