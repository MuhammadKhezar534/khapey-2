import { StatusBadge } from "@/components/ui/status-badge"
import { cn } from "@/lib/utils"

interface DiscountCardBadgesProps {
  status: string
  discountType: string
  className?: string
}

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "Active"
    case "inactive":
      return "Inactive"
    case "upcoming":
      return "Upcoming"
    case "expired":
      return "Expired"
    default:
      return "Unknown"
  }
}

export function DiscountCardBadges({ status, discountType, className }: DiscountCardBadgesProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {/* Use our standardized StatusBadge */}
      <StatusBadge status={status} text={getStatusText(status)} />

      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-gray-50 text-gray-700 border-gray-200">
        {discountType}
      </span>
    </div>
  )
}
