import { Calendar, Clock, Smartphone, Store } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Discount } from "@/types/discounts"
import { formatDate, formatTime } from "@/utils/format"

interface DiscountCardDetailsProps {
  discount: Discount
}

export function DiscountCardDetails({ discount }: DiscountCardDetailsProps) {
  return (
    <div className="space-y-2.5 text-sm">
      {/* Date and Time Section */}
      {"isAlwaysActive" in discount ? (
        discount.isAlwaysActive ? (
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span>Always active</span>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <span className="block">
                  {discount.startDate && discount.endDate
                    ? `${formatDate(discount.startDate)} - ${formatDate(discount.endDate)}`
                    : "No date restrictions"}
                </span>
                {!discount.isAllDay && discount.startTime && discount.endTime && (
                  <span className="block text-muted-foreground mt-0.5">
                    {`${formatTime(discount.startTime)} - ${formatTime(discount.endTime)}`}
                  </span>
                )}
              </div>
            </div>
          </>
        )
      ) : discount.startDate && discount.endDate ? (
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <span>{`${formatDate(discount.startDate)} - ${formatDate(discount.endDate)}`}</span>
        </div>
      ) : null}

      {/* Days of Week */}
      {"isAllWeek" in discount && !discount.isAllWeek && discount.daysOfWeek && discount.daysOfWeek.length > 0 && (
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <span className="block mb-1">Available on:</span>
            <div className="flex flex-wrap gap-1">
              {discount.daysOfWeek.map((day) => (
                <Badge key={day} variant="outline" className="bg-background text-xs">
                  {day.substring(0, 3)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Khapey Users Only */}
      {"forKhapeyUsersOnly" in discount && discount.forKhapeyUsersOnly && (
        <div className="flex items-start gap-2">
          <Smartphone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <span>Exclusive to Khapey app users</span>
        </div>
      )}

      {/* Branch Information */}
      <div className="flex items-start gap-2">
        <Store className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          {discount.applyToAllBranches ? (
            <span>Available at all branches</span>
          ) : (
            <>
              <span className="block mb-1">
                Available at {discount.branches?.length || 0} branch{discount.branches?.length !== 1 ? "es" : ""}
              </span>
              {discount.branches && discount.branches.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {discount.branches.slice(0, 3).map((branchId) => (
                    <Badge key={branchId} variant="outline" className="bg-background text-xs">
                      {branchId}
                    </Badge>
                  ))}
                  {discount.branches.length > 3 && (
                    <Badge variant="outline" className="bg-background text-xs">
                      +{discount.branches.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
