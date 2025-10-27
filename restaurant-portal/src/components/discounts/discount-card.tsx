"use client"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Discount } from "@/types/discounts"
import { getDiscountStatus } from "@/utils/discounts/discount-status"
import { getDiscountDetails, getDiscountImage } from "@/utils/discounts/discount-formatting"
import { DiscountCardImage } from "./discount-card-image"
import { DiscountCardActions } from "./discount-card-actions"
import { DiscountCardBadges } from "./discount-card-badges"
import { DiscountCardDetails } from "./discount-card-details"
import { Badge } from "@/components/ui/badge"

// Update the props interface to include permissions
interface DiscountCardProps {
  discount: Discount
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: () => void
  permissions?: {
    edit: boolean
    toggleStatus: boolean
    delete: boolean
  }
}

// Update the component to pass permissions to DiscountCardActions
export function DiscountCard({
  discount,
  onEdit,
  onDelete,
  onToggleStatus,
  permissions = { edit: true, toggleStatus: true, delete: true },
}: DiscountCardProps) {
  const status = getDiscountStatus(discount)
  const discountDetails = getDiscountDetails(discount)
  const discountImage = getDiscountImage(discount)
  const hasDiscountImage = Boolean(discountImage)
  const viewMode = "grid" // Declared viewMode variable

  // Helper function to render detailed discount info based on discount type
  const renderDetailedInfo = () => {
    switch (discount.type) {
      case "fixedPriceDeal":
        return (
          <div className="mt-2 space-y-1">
            <h4 className="text-sm font-medium">Price Options:</h4>
            <div className="space-y-1">
              {discount.prices && discount.prices.length > 0 ? (
                discount.prices.map((price, index) => (
                  <div key={index} className="text-sm flex justify-between">
                    <span className="text-muted-foreground">{price.name || `Option ${index + 1}`}</span>
                    <span className="font-medium">Rs {price.price}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No price options defined</p>
              )}
            </div>
          </div>
        )

      case "percentageDeal":
        return (
          <div className="mt-2 space-y-1">
            <div className="text-sm flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium">{discount.percentage}%</span>
            </div>
            {discount.maxAmount && (
              <div className="text-sm flex justify-between">
                <span className="text-muted-foreground">Maximum</span>
                <span className="font-medium">Rs {discount.maxAmount}</span>
              </div>
            )}
            {discount.minAmount && (
              <div className="text-sm flex justify-between">
                <span className="text-muted-foreground">Minimum Bill</span>
                <span className="font-medium">Rs {discount.minAmount}</span>
              </div>
            )}
          </div>
        )

      case "bankDiscount":
        return (
          <div className="mt-2 space-y-2">
            <div className="text-sm flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium">{discount.discountPercentage}%</span>
            </div>
            {discount.maxAmount && (
              <div className="text-sm flex justify-between">
                <span className="text-muted-foreground">Maximum</span>
                <span className="font-medium">Rs {discount.maxAmount}</span>
              </div>
            )}
            <h4 className="text-sm font-medium mt-2">Supported Banks:</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {discount.bankCards && discount.bankCards.length > 0 ? (
                discount.bankCards.map((card, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-muted/50 hover:bg-muted text-foreground border-muted-foreground/20"
                  >
                    {card.bank} {card.type}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No banks defined</p>
              )}
            </div>
          </div>
        )

      case "loyalty":
        return renderLoyaltyDetails(discount)

      default:
        return null
    }
  }

  // Helper function to render loyalty discount details based on loyalty type
  const renderLoyaltyDetails = (discount: Discount) => {
    switch (discount.loyaltyType) {
      case "percentage":
        return (
          <div className="mt-2 space-y-2">
            <h4 className="text-sm font-medium">Percentage Tiers:</h4>
            <div className="space-y-2 bg-muted/30 rounded-md p-2">
              {discount.percentageRanges && discount.percentageRanges.length > 0 ? (
                discount.percentageRanges.map((range, index) => (
                  <div key={index} className="text-sm flex justify-between items-center">
                    <span className="text-muted-foreground">{range.visits} visits</span>
                    <span className="font-medium">{range.percentage}% off</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No percentage tiers defined</p>
              )}
            </div>
            {discount.maximumAmount && (
              <div className="text-sm flex justify-between">
                <span className="text-muted-foreground">Maximum</span>
                <span className="font-medium">Rs {discount.maximumAmount}</span>
              </div>
            )}
          </div>
        )

      case "fixed":
        return (
          <div className="mt-2 space-y-2">
            <h4 className="text-sm font-medium">Fixed Reward Tiers:</h4>
            <div className="space-y-2 bg-muted/30 rounded-md p-2">
              {discount.fixedRanges && discount.fixedRanges.length > 0 ? (
                discount.fixedRanges.map((range, index) => (
                  <div key={index} className="text-sm flex justify-between items-center">
                    <span className="text-muted-foreground">{range.visits} visits</span>
                    <span className="font-medium">{range.reward}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No reward tiers defined</p>
              )}
            </div>
          </div>
        )

      case "fixed-reviews":
        return (
          <div className="mt-2 space-y-2">
            <h4 className="text-sm font-medium">Visit-Based Rewards:</h4>
            <div className="space-y-2 bg-muted/30 rounded-md p-2">
              {discount.visitRanges && discount.visitRanges.length > 0 ? (
                discount.visitRanges.map((range, index) => (
                  <div key={index} className="text-sm flex justify-between items-center">
                    <span className="text-muted-foreground">{range.visits} visits</span>
                    <span className="font-medium">{range.reward}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No visit rewards defined</p>
              )}
            </div>
          </div>
        )

      case "referral":
        return (
          <div className="mt-2 space-y-2">
            <div className="bg-muted/30 rounded-md p-2 space-y-2">
              <div className="text-sm flex justify-between">
                <span className="text-muted-foreground">Referrer Reward</span>
                <span className="font-medium">Rs {discount.referralAmount}</span>
              </div>
              <div className="text-sm flex justify-between">
                <span className="text-muted-foreground">New Customer</span>
                <span className="font-medium">Rs {discount.newCustomerAmount}</span>
              </div>
            </div>
            {discount.referralMaximumAmount && (
              <div className="text-sm flex justify-between">
                <span className="text-muted-foreground">Maximum Per Referrer</span>
                <span className="font-medium">Rs {discount.referralMaximumAmount}</span>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // Grid view
  if (viewMode === "grid") {
    return (
      <div
        className={cn(
          "rounded-lg border bg-card overflow-hidden transition-all duration-200 h-full flex flex-col",
          status === "active"
            ? "border-green-200"
            : status === "upcoming"
              ? "border-blue-200"
              : status === "expired"
                ? "border-red-200"
                : "border-gray-200",
        )}
      >
        {/* Image Section */}
        {hasDiscountImage && (
          <DiscountCardImage
            imageUrl={discountImage}
            title={discountDetails.title}
            status={status}
            discountType={discountDetails.type}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            isActive={discount.status === "active"}
          />
        )}

        <div className="p-5 flex-1">
          {!hasDiscountImage && (
            <div className="flex justify-between items-start mb-3">
              <DiscountCardBadges status={status} discountType={discountDetails.type} />
              <DiscountCardActions
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                isActive={discount.status === "active"}
                permissions={permissions}
              />
            </div>
          )}

          <h3 className={cn("font-semibold text-lg line-clamp-2", hasDiscountImage ? "mt-1" : "mb-3")}>
            {discountDetails.title}
          </h3>

          {discountDetails.subtitle && (
            <p className="text-sm text-muted-foreground mb-2">
              {discountDetails.type === "Loyalty Program"
                ? `(${discount.loyaltyType}) ${discountDetails.subtitle}`
                : discountDetails.subtitle}
            </p>
          )}

          {discountDetails.maxAmount && (
            <p className="text-sm text-muted-foreground mb-3">{discountDetails.maxAmount}</p>
          )}

          {/* Display detailed discount information */}
          {renderDetailedInfo()}

          <Separator className="my-3" />

          <DiscountCardDetails discount={discount} />
        </div>
      </div>
    )
  }

  // List view implementation would go here
  return null
}
