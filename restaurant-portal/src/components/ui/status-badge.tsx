import type React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

type StatusType = "success" | "error" | "warning" | "info" | "pending" | "inactive" | "active" | "upcoming" | "expired"

interface StatusBadgeProps {
  status: StatusType
  text?: string
  showIcon?: boolean
  className?: string
}

/**
 * Component for displaying status badges consistently
 */
export function StatusBadge({ status, text, showIcon = true, className }: StatusBadgeProps) {
  // Define status configurations
  const statusConfig: Record<StatusType, { color: string; icon: React.ReactNode; defaultText: string }> = {
    success: {
      color: "bg-success-50 text-success-700 border-success-200",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      defaultText: "Success",
    },
    error: {
      color: "bg-destructive-50 text-destructive-700 border-destructive-200",
      icon: <XCircle className="h-3.5 w-3.5" />,
      defaultText: "Error",
    },
    warning: {
      color: "bg-warning-50 text-warning-700 border-warning-200",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      defaultText: "Warning",
    },
    info: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      defaultText: "Info",
    },
    pending: {
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock className="h-3.5 w-3.5" />,
      defaultText: "Pending",
    },
    inactive: {
      color: "bg-gray-50 text-gray-700 border-gray-200",
      icon: <XCircle className="h-3.5 w-3.5" />,
      defaultText: "Inactive",
    },
    active: {
      color: "bg-success-50 text-success-700 border-success-200",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      defaultText: "Active",
    },
    upcoming: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <Clock className="h-3.5 w-3.5" />,
      defaultText: "Upcoming",
    },
    expired: {
      color: "bg-destructive-50 text-destructive-700 border-destructive-200",
      icon: <XCircle className="h-3.5 w-3.5" />,
      defaultText: "Expired",
    },
  }

  const config = statusConfig[status]
  const displayText = text || config.defaultText

  return (
    <Badge
      variant="outline"
      className={cn("font-medium border px-2 py-0.5 text-xs rounded-md", config.color, className)}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {displayText}
    </Badge>
  )
}
