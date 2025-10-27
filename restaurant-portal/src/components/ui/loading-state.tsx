import { LoadingSpinner } from "./loading-spinner"

interface LoadingStateProps {
  message?: string
  fullPage?: boolean
  overlay?: boolean
}

export function LoadingState({ message = "Loading...", fullPage = false, overlay = false }: LoadingStateProps) {
  const containerClasses = fullPage
    ? "fixed inset-0 flex items-center justify-center bg-background/80 z-50"
    : overlay
      ? "absolute inset-0 flex items-center justify-center bg-background/60 z-10"
      : "flex flex-col items-center justify-center py-12"

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
