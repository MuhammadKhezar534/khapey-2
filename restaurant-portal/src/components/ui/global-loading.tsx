import { Loader2 } from "lucide-react"

interface GlobalLoadingProps {
  message?: string
}

export function GlobalLoading({ message = "Loading..." }: GlobalLoadingProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}
