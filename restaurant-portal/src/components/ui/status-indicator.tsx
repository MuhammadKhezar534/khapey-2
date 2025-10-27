import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: "active" | "inactive" | "pending" | "error" | "success" | "warning"
  size?: "sm" | "md" | "lg"
  className?: string
  pulse?: boolean
}

export function StatusIndicator({ status, size = "md", className, pulse = false }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }

  const statusClasses = {
    active: "bg-green-500",
    inactive: "bg-gray-400",
    pending: "bg-amber-500",
    error: "bg-red-500",
    success: "bg-emerald-500",
    warning: "bg-orange-500",
  }

  return (
    <span
      className={cn(
        "inline-block rounded-full",
        statusClasses[status],
        sizeClasses[size],
        pulse && "animate-pulse",
        className,
      )}
      aria-label={`Status: ${status}`}
    />
  )
}
