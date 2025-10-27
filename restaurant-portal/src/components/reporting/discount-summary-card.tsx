import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getDiscountTypeIcon, getDiscountTypeName } from "@/utils/discount-helpers"

interface DiscountSummaryCardProps {
  discount: any
}

export function DiscountSummaryCard({ discount }: DiscountSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge
            variant="outline"
            className={cn(
              "capitalize font-medium text-xs px-2.5 py-0.5",
              discount?.status === "active"
                ? "bg-green-50 text-green-700 border-green-200"
                : discount?.status === "inactive"
                  ? "bg-gray-50 text-gray-700 border-gray-200"
                  : "bg-gray-50 text-gray-700 border-gray-200",
            )}
          >
            {discount?.status}
          </Badge>
          {getDiscountTypeIcon(discount?.type, discount?.loyaltyType)}
        </div>
        <CardTitle className="text-xl">{discount?.name || discount?.title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          {getDiscountTypeName(discount?.type, discount?.loyaltyType)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Usage</div>
            <div className="text-lg font-medium">{discount?.totalUsage || 0}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="text-lg font-medium">
              Rs {discount?.totalAmount ? discount.totalAmount.toLocaleString() : "0"}
            </div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Avg. Discount</div>
            <div className="text-lg font-medium">Rs {discount?.averageDiscount || 0}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
